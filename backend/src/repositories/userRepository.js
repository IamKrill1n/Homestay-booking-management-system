import pool from "../db/pool.js"

function mapRow (row) {
  return {
    userID      : row.user_id, 
    password    : row.password, 
    firstName   : row.first_name, 
    lastName    : row.last_name,
    email       : row.email,
    phoneNumber : row.phone_number, 
    role        : row.role
  };
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return rows.map(mapRow);
}

export async function findUserByID(id) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE user_id = $1`,
    [userID]
  );
  return rows.map(mapRow);
}