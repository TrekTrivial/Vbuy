const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error("Database connection unsuccessful!\n", error);
    return;
  }
  console.log("Connected to MySQL Database");
  connection.release();
});

const db = pool.promise();

async function createTables() {
  try {
    const SQL_Schema = fs
      .readFileSync(path.join(__dirname, "../db/schema.sql"))
      .toString();
    const queries = SQL_Schema.split(";")
      .map(q => q.trim())
      .filter(q => q !== "");

    for (const query of queries) {
      await db.query(query);
      // console.log("Query executed successfully");
    }

    // console.log("Schema created successfully!");
  } catch (e) {
    console.error("Error creating schema!", e);
  }
}

module.exports = { db, createTables };
