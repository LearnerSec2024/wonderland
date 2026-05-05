const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sql, getPool } = require('../config/db');

const VALID_ACCOUNT_TYPES = ['Guest', 'Admin', 'Manager'];

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.UserId,
      email: user.Email,
      role: user.Role,
      employeeId: user.EmployeeId || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
};

const toDateOnly = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
};

const cleanUser = (user) => {
  return {
    userId: user.UserId,
    firstName: user.FirstName,
    lastName: user.LastName,
    email: user.Email,
    role: user.Role,
    totalPoints: user.TotalPoints,
    dateOfBirth: toDateOnly(user.DateOfBirth),
    employeeId: user.EmployeeId || null,
    createdAt: user.CreatedAt,
  };
};

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
};

const getEmployeeForRole = async (pool, email, roleName) => {
  const result = await pool
    .request()
    .input('Email', sql.NVarChar(255), email)
    .input('RoleName', sql.NVarChar(50), roleName).query(`
      SELECT
        e.EmployeeId,
        e.FirstName,
        e.LastName,
        e.Email,
        e.DateOfBirth,
        e.IsActive,
        r.RoleName
      FROM dbo.Employees e
      INNER JOIN dbo.EmployeeRoles er ON er.EmployeeId = e.EmployeeId
      INNER JOIN dbo.Roles r ON r.RoleId = er.RoleId
      WHERE LOWER(e.Email) = @Email
        AND r.RoleName = @RoleName;
    `);

  return result.recordset[0];
};

const registerUser = async (req, res, next) => {
  try {
    const { accountType = 'Guest', firstName, lastName, email, dateOfBirth, password } = req.body;

    if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
      return res.status(400).json({
        message: 'Account type must be Guest, Admin or Manager',
      });
    }

    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({
        message: 'First name, last name, email, date of birth and password are required',
      });
    }

    if (!isValidDateOnly(dateOfBirth)) {
      return res.status(400).json({
        message: 'Date of birth must be a valid date',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pool = await getPool();

    const existingUser = await pool.request().input('Email', sql.NVarChar(255), normalizedEmail).query(`
        SELECT UserId
        FROM dbo.Users
        WHERE LOWER(Email) = @Email;
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        message: 'A user with this email already exists',
      });
    }

    let role = 'User';
    let employeeId = null;
    let finalFirstName = firstName.trim();
    let finalLastName = lastName.trim();
    let finalDateOfBirth = dateOfBirth;

    if (accountType === 'Admin' || accountType === 'Manager') {
      const employee = await getEmployeeForRole(pool, normalizedEmail, accountType);

      if (!employee) {
        return res.status(403).json({
          message: `${accountType} registration requires a pre-approved active employee email`,
        });
      }

      if (!employee.IsActive) {
        return res.status(403).json({
          message: 'This employee account is inactive',
        });
      }

      const employeeDateOfBirth = toDateOnly(employee.DateOfBirth);

      if (employeeDateOfBirth !== dateOfBirth) {
        return res.status(403).json({
          message: 'Date of birth does not match employee records',
        });
      }

      role = accountType;
      employeeId = employee.EmployeeId;
      finalFirstName = employee.FirstName;
      finalLastName = employee.LastName;
      finalDateOfBirth = employeeDateOfBirth;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool
      .request()
      .input('FirstName', sql.NVarChar(100), finalFirstName)
      .input('LastName', sql.NVarChar(100), finalLastName)
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .input('DateOfBirth', sql.Date, finalDateOfBirth)
      .input('PasswordHash', sql.NVarChar(255), passwordHash)
      .input('Role', sql.NVarChar(50), role)
      .input('EmployeeId', sql.Int, employeeId).query(`
        INSERT INTO dbo.Users
          (FirstName, LastName, Email, DateOfBirth, PasswordHash, Role, EmployeeId)
        OUTPUT
          INSERTED.UserId,
          INSERTED.FirstName,
          INSERTED.LastName,
          INSERTED.Email,
          INSERTED.Role,
          INSERTED.TotalPoints,
          INSERTED.DateOfBirth,
          INSERTED.EmployeeId,
          INSERTED.CreatedAt
        VALUES
          (@FirstName, @LastName, @Email, @DateOfBirth, @PasswordHash, @Role, @EmployeeId);
      `);

    const user = result.recordset[0];
    const token = createToken(user);

    res.status(201).json({
      message: 'Registration successful',
      user: cleanUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pool = await getPool();

    const result = await pool.request().input('Email', sql.NVarChar(255), normalizedEmail).query(`
        SELECT
          UserId,
          FirstName,
          LastName,
          Email,
          PasswordHash,
          Role,
          TotalPoints,
          DateOfBirth,
          EmployeeId,
          CreatedAt
        FROM dbo.Users
        WHERE LOWER(Email) = @Email;
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const user = result.recordset[0];
    const passwordMatches = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      user: cleanUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().input('UserId', sql.Int, req.user.userId).query(`
        SELECT
          UserId,
          FirstName,
          LastName,
          Email,
          Role,
          TotalPoints,
          DateOfBirth,
          EmployeeId,
          CreatedAt
        FROM dbo.Users
        WHERE UserId = @UserId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user: cleanUser(result.recordset[0]),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
