import crypto from "crypto";
import pool from "../db/pool.js";
import { M_User } from "../models/M_User.js";

const HASH_ITERATIONS = 100_000;
const HASH_LENGTH = 64;
const HASH_DIGEST = "sha512";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    passwordHash: crypto
      .pbkdf2Sync(String(password), salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST)
      .toString("hex"),
    passwordSalt: salt,
  };
}

export function verifyPassword(password, user) {
  if (!user) return false;

  if (user.passwordHash && user.passwordSalt) {
    const { passwordHash } = hashPassword(password, user.passwordSalt);
    const expected = Buffer.from(user.passwordHash, "hex");
    const actual = Buffer.from(passwordHash, "hex");
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  }

  return Boolean(user.password) && user.password === password;
}

function mapRowToUser (row) {
  if (!row) return null;

  return new M_User({
    userID      : row.user_id, 
    password    : row.password,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
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

  } catch (err) {
    console.error("Database error in findUserByEmail:", err);
    throw err;
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
  } catch (err) {
    console.error("Database error in findUserByID:", err);
    throw err;
  }
}

export async function createUser(user, executor = pool) {
  try {
    const { passwordHash, passwordSalt } = hashPassword(user.password);
    const result = await executor.query(
      `INSERT INTO users(password_hash, password_salt, first_name, last_name, email, phone_number, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [passwordHash, passwordSalt, user.firstName, user.lastName, user.email, user.phoneNumber, user.role]
    );

    return mapRowToUser(result.rows[0]);
  } catch (err) {
    console.error("Database error in addUser:", err);
    throw err;
  }
}

export async function createUserWithRole(user, { bankAccountNumber } = {}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const createdUser = await createUser(user, client);

    if (createdUser.role === "owner") {
      await client.query(
        `INSERT INTO owners(owner_id, bank_account_number)
         VALUES ($1, $2)`,
        [createdUser.userID, bankAccountNumber]
      );
    }

    await client.query("COMMIT");
    return createdUser;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error in createUserWithRole:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function updateUser(user) {
  try {
    const { rows } = await pool.query(
      `UPDATE users 
      SET 
        first_name = $2, 
        last_name = $3, 
        email = $4, 
        phone_number = $5
      WHERE user_id = $1
      RETURNING *`,
      [user.userID, user.firstName, user.lastName, user.email, user.phoneNumber]
    );
    return rows.length ? mapRowToUser(rows[0]) : null;
  } catch (err) {
    console.error("Database error in addUser:", err);
    throw err;
  }
}

export async function deleteUserByID(userID) {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1`,
      [userID]
    );
    return result.rowCount > 0;
  } catch (err) {
    console.error("Database error in deleteUserByID:", err);
    throw err;
  }
}
