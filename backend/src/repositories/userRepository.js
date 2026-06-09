import pool from "../db/pool.js"
import { M_User } from "../models/M_User.js"

function mapRowToUser (row) {
  if (!row) return null;

  return new M_User({
    userID      : row.user_id, 
    password    : row.password, 
    firstName   : row.first_name, 
    lastName    : row.last_name,
    email       : row.email,
    phoneNumber : row.phone_number, 
    role        : row.role
  });
}

export async function findUserByEmail(email) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) return null;

    return mapRowToUser(rows[0]);

  } catch (error) {
    console.error("Database error in findUserByEmail:", error);
    throw error;
  }
}

export async function findUserByID(userID) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [userID]
    );
  
    if (rows.length == 0) return null;
  
      return mapRowToUser(rows[0]);
  } catch (error) {
    console.error("Database error in findUserByID:", error);
    throw error;
  }
}