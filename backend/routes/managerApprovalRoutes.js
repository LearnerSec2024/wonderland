const express = require('express');

const { sql, getPool } = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Manager'));

router.get('/approvals/count', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM dbo.Rides
          WHERE ApprovalStatus = 'PendingApproval'
        )
        +
        (
          SELECT COUNT(*)
          FROM dbo.Accommodations
          WHERE ApprovalStatus = 'PendingApproval'
        ) AS PendingCount;
    `);

    res.json({
      pendingCount: result.recordset[0].PendingCount,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/approvals', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        'ride' AS ItemType,
        r.RideId AS ItemId,
        r.Name,
        r.Description,
        r.Category AS CategoryOrType,
        r.Price,
        r.ApprovalStatus,
        r.SubmittedAt,
        u.Email AS SubmittedByEmail
      FROM dbo.Rides r
      LEFT JOIN dbo.Users u ON u.UserId = r.SubmittedByUserId
      WHERE r.ApprovalStatus = 'PendingApproval'

      UNION ALL

      SELECT
        'accommodation' AS ItemType,
        a.AccommodationId AS ItemId,
        a.Name,
        a.Description,
        a.Type AS CategoryOrType,
        a.PricePerNight AS Price,
        a.ApprovalStatus,
        a.SubmittedAt,
        u.Email AS SubmittedByEmail
      FROM dbo.Accommodations a
      LEFT JOIN dbo.Users u ON u.UserId = a.SubmittedByUserId
      WHERE a.ApprovalStatus = 'PendingApproval'

      ORDER BY SubmittedAt DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.get('/approvals/history', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().input('ReviewedByUserId', sql.Int, req.user.userId).query(`
        SELECT
          'ride' AS ItemType,
          r.RideId AS ItemId,
          r.Name,
          r.Description,
          r.Category AS CategoryOrType,
          r.Price,
          r.ApprovalStatus,
          r.SubmittedAt,
          r.ReviewedAt,
          r.RejectionReason,
          submittedUser.Email AS SubmittedByEmail
        FROM dbo.Rides r
        LEFT JOIN dbo.Users submittedUser ON submittedUser.UserId = r.SubmittedByUserId
        WHERE r.ApprovalStatus IN ('Approved', 'Rejected')
          AND r.ReviewedByUserId = @ReviewedByUserId

        UNION ALL

        SELECT
          'accommodation' AS ItemType,
          a.AccommodationId AS ItemId,
          a.Name,
          a.Description,
          a.Type AS CategoryOrType,
          a.PricePerNight AS Price,
          a.ApprovalStatus,
          a.SubmittedAt,
          a.ReviewedAt,
          a.RejectionReason,
          submittedUser.Email AS SubmittedByEmail
        FROM dbo.Accommodations a
        LEFT JOIN dbo.Users submittedUser ON submittedUser.UserId = a.SubmittedByUserId
        WHERE a.ApprovalStatus IN ('Approved', 'Rejected')
          AND a.ReviewedByUserId = @ReviewedByUserId

        ORDER BY ReviewedAt DESC;
      `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post('/approvals/:type/:id/approve', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const pool = await getPool();

    if (!['ride', 'accommodation'].includes(type)) {
      return res.status(400).json({
        message: 'Approval type must be ride or accommodation',
      });
    }

    const tableName = type === 'ride' ? 'dbo.Rides' : 'dbo.Accommodations';
    const idColumn = type === 'ride' ? 'RideId' : 'AccommodationId';

    const result = await pool
      .request()
      .input('Id', sql.Int, Number(id))
      .input('ReviewedByUserId', sql.Int, req.user.userId).query(`
        DECLARE @UpdatedContent TABLE
        (
          ItemId INT,
          Name NVARCHAR(200),
          ApprovalStatus NVARCHAR(50),
          IsActive BIT,
          RejectionReason NVARCHAR(1000) NULL
        );

        UPDATE ${tableName}
        SET
          ApprovalStatus = 'Approved',
          IsActive = 1,
          ReviewedByUserId = @ReviewedByUserId,
          ReviewedAt = SYSDATETIME(),
          RejectionReason = NULL
        OUTPUT
          INSERTED.${idColumn},
          INSERTED.Name,
          INSERTED.ApprovalStatus,
          INSERTED.IsActive,
          INSERTED.RejectionReason
        INTO @UpdatedContent
        WHERE ${idColumn} = @Id
          AND ApprovalStatus = 'PendingApproval';

        SELECT
          ItemId,
          Name,
          ApprovalStatus,
          IsActive,
          RejectionReason
        FROM @UpdatedContent;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'Pending approval item not found',
      });
    }

    res.json({
      message: 'Content approved successfully',
      item: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
});

router.post('/approvals/:type/:id/reject', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { rejectionReason = 'Rejected by manager' } = req.body || {};
    const pool = await getPool();

    if (!['ride', 'accommodation'].includes(type)) {
      return res.status(400).json({
        message: 'Approval type must be ride or accommodation',
      });
    }

    const tableName = type === 'ride' ? 'dbo.Rides' : 'dbo.Accommodations';
    const idColumn = type === 'ride' ? 'RideId' : 'AccommodationId';

    const result = await pool
      .request()
      .input('Id', sql.Int, Number(id))
      .input('ReviewedByUserId', sql.Int, req.user.userId)
      .input('RejectionReason', sql.NVarChar(500), rejectionReason).query(`
        DECLARE @UpdatedContent TABLE
        (
          ItemId INT,
          Name NVARCHAR(200),
          ApprovalStatus NVARCHAR(50),
          IsActive BIT,
          RejectionReason NVARCHAR(1000) NULL
        );

        UPDATE ${tableName}
        SET
          ApprovalStatus = 'Rejected',
          IsActive = 0,
          ReviewedByUserId = @ReviewedByUserId,
          ReviewedAt = SYSDATETIME(),
          RejectionReason = @RejectionReason
        OUTPUT
          INSERTED.${idColumn},
          INSERTED.Name,
          INSERTED.ApprovalStatus,
          INSERTED.IsActive,
          INSERTED.RejectionReason
        INTO @UpdatedContent
        WHERE ${idColumn} = @Id
          AND ApprovalStatus = 'PendingApproval';

        SELECT
          ItemId,
          Name,
          ApprovalStatus,
          IsActive,
          RejectionReason
        FROM @UpdatedContent;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'Pending approval item not found',
      });
    }

    res.json({
      message: 'Content rejected successfully',
      item: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
