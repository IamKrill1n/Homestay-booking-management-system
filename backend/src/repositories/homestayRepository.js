import pool from "../db/pool.js";

function mapRow(row) {
  return {
    homestayID: row.homestay_id,
    ownerID: row.owner_id,
    title: row.title,
    description: row.description,
    pricePerHour: Number(row.price_per_hour),
    isVerified: row.is_verified,
    status: row.status,
    rejectionReason: row.rejection_reason,
    location: {
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      city: row.city,
    },
  };
}

export async function findAllHomestays() {
  const { rows } = await pool.query(
    `SELECT * FROM homestays WHERE status = 'approved' ORDER BY homestay_id`
  );
  return rows.map(mapRow);
}

export async function findHomestayById(homestayID) {
  const { rows } = await pool.query(
    `SELECT * FROM homestays WHERE homestay_id = $1`,
    [homestayID]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function filterHomestays(options) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (options.city) {
    conditions.push(`LOWER(city) = LOWER($${idx++})`);
    params.push(String(options.city));
  }
  if (options.maxPrice != null && options.maxPrice !== "") {
    conditions.push(`price_per_hour <= $${idx++}`);
    params.push(Number(options.maxPrice));
  }
  if (options.verified != null && options.verified !== "") {
    conditions.push(`is_verified = $${idx++}`);
    params.push(options.verified === "true" || options.verified === true);
  }

  conditions.push(`status = 'approved'`);
  const where = `WHERE ${conditions.join(" AND ")}`;
  const { rows } = await pool.query(
    `SELECT * FROM homestays ${where} ORDER BY homestay_id`,
    params
  );
  return rows.map(mapRow);
}

export async function searchHomestays(query) {
  const pattern = `%${query}%`;
  const { rows } = await pool.query(
    `SELECT * FROM homestays
     WHERE status = 'approved'
       AND (LOWER(title) LIKE LOWER($1)
        OR LOWER(description) LIKE LOWER($1)
        OR LOWER(city) LIKE LOWER($1))
     ORDER BY homestay_id`,
    [pattern]
  );
  return rows.map(mapRow);
}

// --- Owner / Admin (M_Owner, M_Admin) ---

export async function createHomestay(data) {
  const homestayID = `HS${Date.now()}`;
  const { rows } = await pool.query(
    `INSERT INTO homestays (
       homestay_id, owner_id, title, description, price_per_hour,
       is_verified, status, rejection_reason, latitude, longitude, address, city
     ) VALUES ($1, $2, $3, $4, $5, FALSE, 'pending', NULL, $6, $7, $8, $9)
     RETURNING *`,
    [
      homestayID,
      String(data.ownerId),
      data.title,
      data.description ?? null,
      Number(data.pricePerHour),
      data.latitude ?? null,
      data.longitude ?? null,
      data.address,
      data.city,
    ]
  );
  return mapRow(rows[0]);
}

export async function findHomestaysByOwner(ownerID) {
  const { rows } = await pool.query(
    `SELECT * FROM homestays WHERE owner_id = $1 ORDER BY homestay_id`,
    [String(ownerID)]
  );
  return rows.map(mapRow);
}

export async function findPendingHomestays() {
  const { rows } = await pool.query(
    `SELECT * FROM homestays WHERE status = 'pending' ORDER BY homestay_id`
  );
  return rows.map(mapRow);
}

export async function updateHomestay(homestayID, fields) {
  const { rows } = await pool.query(
    `UPDATE homestays SET
       title = $2,
       description = $3,
       price_per_hour = $4,
       latitude = $5,
       longitude = $6,
       address = $7,
       city = $8,
       status = $9,
       is_verified = $10
     WHERE homestay_id = $1
     RETURNING *`,
    [
      homestayID,
      fields.title,
      fields.description ?? null,
      Number(fields.pricePerHour),
      fields.latitude ?? null,
      fields.longitude ?? null,
      fields.address,
      fields.city,
      fields.status,
      fields.isVerified,
    ]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function archiveHomestay(homestayID) {
  const { rows } = await pool.query(
    `UPDATE homestays SET status = 'archived'
     WHERE homestay_id = $1
     RETURNING *`,
    [homestayID]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function setHomestayStatus(
  homestayID,
  status,
  isVerified,
  rejectionReason
) {
  const { rows } = await pool.query(
    `UPDATE homestays SET
       status = $2,
       is_verified = $3,
       rejection_reason = $4
     WHERE homestay_id = $1
     RETURNING *`,
    [homestayID, status, isVerified, rejectionReason ?? null]
  );
  return rows.length ? mapRow(rows[0]) : null;
}