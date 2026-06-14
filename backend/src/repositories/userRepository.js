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
      `SELECT * FROM users WHERE email = $1;`,
      [email]
    );

    if (rows.length === 0) return null;

    return mapRowToUser(rows[0]);

  } catch (err) {
    console.error("Database error in findUserByEmail:", err);
    throw err;
  }
}

export async function findUserByID(userID) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [userID]
    );
  
    if (rows.length == 0) return null;
  
    return mapRowToUser(rows[0]);
  } catch (err) {
    console.error("Database error in findUserByID:", err);
    throw err;
  }
}

export async function createUser(user) {
  try {
    const result = await pool.query(
      `INSERT INTO users(password, first_name, last_name, email, phone_number, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;`,
      [user.password, user.firstName, user.lastName, user.email, user.phoneNumber, user.role]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database error in addUser:", err);
    throw err;
  }
}

export async function updateUser(user) {
  try {
    await pool.query(
      `UPDATE users 
      SET 
        password = $2, 
        first_name = $3, 
        last_name = $4, 
        email = $5, 
        phone_number = $6, 
        role = $7
      WHERE user_id = $1;`,
      [user.userID, user.password, user.firstName, user.lastName, user.email, user.phoneNumber, user.role]
    );
  } catch (err) {
    console.error("Database error in addUser:", err);
    throw err;
  }
}

export async function deleteUserByID(userID) {
  try {
    await pool.query(
      `DELETE FROM users WHERE user_id = $1;`,
      [userID]
    )
  } catch (err) {
    console.error("Database error in deleteUserByID:", err);
    throw err;
  }
}