const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sql, getPool } = require('../config/db');

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.UserId,
      email: user.Email,
      role: user.Role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
};

const cleanUser = (user) => {
  return {
    userId: user.UserId,
    firstName: user.FirstName,
    lastName: user.LastName,
    email: user.Email,
    role: user.Role,
    totalPoints: user.TotalPoints,
    createdAt: user.CreatedAt,
  };
};

const registerUser = async (req, res, next) => {
  try {
    // console.log('REGISTER BODY:', req.body);

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: 'First name, last name, email and password are required',
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

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool
      .request()
      .input('FirstName', sql.NVarChar(100), firstName.trim())
      .input('LastName', sql.NVarChar(100), lastName.trim())
      .input('Email', sql.NVarChar(255), normalizedEmail)
      .input('PasswordHash', sql.NVarChar(255), passwordHash).query(`
        INSERT INTO dbo.Users
          (FirstName, LastName, Email, PasswordHash)
        OUTPUT
          INSERTED.UserId,
          INSERTED.FirstName,
          INSERTED.LastName,
          INSERTED.Email,
          INSERTED.Role,
          INSERTED.TotalPoints,
          INSERTED.CreatedAt
        VALUES
          (@FirstName, @LastName, @Email, @PasswordHash);
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
