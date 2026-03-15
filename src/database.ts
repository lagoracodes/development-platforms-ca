import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";
import "dotenv/config";

// created connection to the database
export const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
