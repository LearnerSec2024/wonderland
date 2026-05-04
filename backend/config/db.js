const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "WonderlandDB",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql
      .connect(dbConfig)
      .then((pool) => {
        console.log("Connected to SQL Server");
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        console.error("SQL Server connection failed:", error.message);
        throw error;
      });
  }

  return poolPromise;
};

module.exports = {
  sql,
  getPool,
};
