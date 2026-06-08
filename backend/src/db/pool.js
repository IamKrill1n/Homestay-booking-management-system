import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/homestay",
});

<<<<<<< HEAD
export default pool;
=======
export default pool;
>>>>>>> feature/owner_admin
