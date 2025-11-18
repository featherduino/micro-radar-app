const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 2000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: async (sql, params = []) => {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
};
