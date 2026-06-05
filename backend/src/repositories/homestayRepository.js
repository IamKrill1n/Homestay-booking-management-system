import pool from "../db/pool.js";

function mapRow(row) {
  return {
    homestayID: row.homestay_id,
    ownerID: row.owner_id,
    title: row.title,
    description: row.description,
    pricePerHour: Number(row.price_per_hour),
    isVerified: row.is_verified,
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
    `SELECT * FROM homestays ORDER BY homestay_id`
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

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
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
     WHERE LOWER(title) LIKE LOWER($1)
        OR LOWER(description) LIKE LOWER($1)
        OR LOWER(city) LIKE LOWER($1)
     ORDER BY homestay_id`,
    [pattern]
  );
  return rows.map(mapRow);
}
