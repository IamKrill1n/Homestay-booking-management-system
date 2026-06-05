import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSqlFile(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
}

async function init() {
  try {
    await runSqlFile("schema.sql");
    await runSqlFile("seed.sql");
    console.log("Database initialized (schema + seed).");
  } catch (err) {
    console.error("Database init failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
