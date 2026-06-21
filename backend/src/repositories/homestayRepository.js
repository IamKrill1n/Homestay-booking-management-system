import pool from "../db/pool.js";

const HOMESTAY_SELECT = `
  SELECT
    h.homestay_id,
    h.owner_id,
    h.title,
    h.description,
    h.price_per_hour,
    h.rental_type,
    h.check_in_time,
    h.check_out_time,
    h.is_verified,
    h.status,
    h.rejection_reason,
    h.created_at,
    l.latitude,
    l.longitude,
    l.address,
    l.city,
    a.number_of_beds,
    a.number_of_bedrooms,
    a.max_guests,
    a.has_wifi,
    a.has_air_conditioning,
    a.has_kitchen,
    a.has_bathtub,
    a.has_tv,
    a.has_parking,
    a.is_pet_friendly
  FROM homestays h
  LEFT JOIN locations l ON l.homestay_id = h.homestay_id
  LEFT JOIN amenities a ON a.homestay_id = h.homestay_id
`;

const AMENITY_COLUMNS = {
  wifi: "has_wifi",
  kitchen: "has_kitchen",
  "air conditioning": "has_air_conditioning",
  airconditioning: "has_air_conditioning",
  tv: "has_tv",
  parking: "has_parking",
  bathtub: "has_bathtub",
  "bath tub": "has_bathtub",
  pet: "is_pet_friendly",
  pets: "is_pet_friendly",
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toNullableNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeAmenityName(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeAmenityList(value) {
  if (Array.isArray(value)) return value.map(normalizeAmenityName).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map(normalizeAmenityName).filter(Boolean);
  }
  return [];
}

function selectedHas(selected, ...names) {
  return names.some((name) => selected.has(normalizeAmenityName(name)));
}

function boolFromPayload(payload, selected, key, ...names) {
  if (payload[key] != null) return Boolean(payload[key]);
  return selectedHas(selected, ...names);
}

function normalizeAmenityPayload(data = {}) {
  const source =
    data.amenities && !Array.isArray(data.amenities) && typeof data.amenities === "object"
      ? data.amenities
      : data;
  const selected = new Set(normalizeAmenityList(data.amenities));

  return {
    numberOfBeds: toNumber(source.numberOfBeds ?? data.numberOfBeds, 0),
    numberOfBedrooms: toNumber(source.numberOfBedrooms ?? data.numberOfBedrooms, 0),
    maxGuests: toNumber(source.maxGuests ?? data.maxGuests, 1),
    hasWifi: boolFromPayload(source, selected, "hasWifi", "wifi"),
    hasAirConditioning: boolFromPayload(
      source,
      selected,
      "hasAirConditioning",
      "air conditioning",
      "airconditioning"
    ),
    hasKitchen: boolFromPayload(source, selected, "hasKitchen", "kitchen"),
    hasBathtub: boolFromPayload(source, selected, "hasBathtub", "bath tub", "bathtub"),
    hasTv: boolFromPayload(source, selected, "hasTv", "tv"),
    hasParking: boolFromPayload(source, selected, "hasParking", "parking"),
    isPetFriendly: boolFromPayload(source, selected, "isPetFriendly", "pet", "pets"),
  };
}

function mapRow(row) {
  if (!row) return null;

  return {
    homestayID: row.homestay_id,
    ownerID: row.owner_id,
    title: row.title,
    description: row.description,
    pricePerHour: Number(row.price_per_hour),
    rental_type: row.rental_type,
    check_in_time: row.check_in_time,
    check_out_time: row.check_out_time,
    isVerified: row.is_verified,
    isVerified: row.is_verified,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    availability: row.status === "approved" ? "available" : "unavailable",
    location: {
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      address: row.address ?? "",
      city: row.city ?? "",
    },
    amenities: {
      numberOfBeds: Number(row.number_of_beds ?? 0),
      numberOfBedrooms: Number(row.number_of_bedrooms ?? 0),
      maxGuests: Number(row.max_guests ?? 1),
      hasWifi: Boolean(row.has_wifi),
      hasAirConditioning: Boolean(row.has_air_conditioning),
      hasKitchen: Boolean(row.has_kitchen),
      hasBathtub: Boolean(row.has_bathtub),
      hasTv: Boolean(row.has_tv),
      hasParking: Boolean(row.has_parking),
      isPetFriendly: Boolean(row.is_pet_friendly),
    },
  };
}

function withOrder(sql) {
  return `${sql} ORDER BY h.homestay_id`;
}

async function upsertLocation(client, homestayID, data) {
  await client.query(
    `INSERT INTO locations (homestay_id, latitude, longitude, address, city)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (homestay_id) DO UPDATE SET
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       address = EXCLUDED.address,
       city = EXCLUDED.city`,
    [
      homestayID,
      toNullableNumber(data.latitude),
      toNullableNumber(data.longitude),
      data.address,
      data.city,
    ]
  );
}

async function upsertAmenities(client, homestayID, data) {
  const amenities = normalizeAmenityPayload(data);
  await client.query(
    `INSERT INTO amenities (
       homestay_id,
       number_of_beds,
       number_of_bedrooms,
       max_guests,
       has_wifi,
       has_air_conditioning,
       has_kitchen,
       has_bathtub,
       has_tv,
       has_parking,
       is_pet_friendly
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (homestay_id) DO UPDATE SET
       number_of_beds = EXCLUDED.number_of_beds,
       number_of_bedrooms = EXCLUDED.number_of_bedrooms,
       max_guests = EXCLUDED.max_guests,
       has_wifi = EXCLUDED.has_wifi,
       has_air_conditioning = EXCLUDED.has_air_conditioning,
       has_kitchen = EXCLUDED.has_kitchen,
       has_bathtub = EXCLUDED.has_bathtub,
       has_tv = EXCLUDED.has_tv,
       has_parking = EXCLUDED.has_parking,
       is_pet_friendly = EXCLUDED.is_pet_friendly`,
    [
      homestayID,
      amenities.numberOfBeds,
      amenities.numberOfBedrooms,
      amenities.maxGuests,
      amenities.hasWifi,
      amenities.hasAirConditioning,
      amenities.hasKitchen,
      amenities.hasBathtub,
      amenities.hasTv,
      amenities.hasParking,
      amenities.isPetFriendly,
    ]
  );
}

export async function findAllHomestays() {
  const { rows } = await pool.query(
    withOrder(`${HOMESTAY_SELECT} WHERE h.status = 'approved'`)
  );
  return rows.map(mapRow);
}

export async function findAllHomestaysForAdmin() {
  const { rows } = await pool.query(withOrder(HOMESTAY_SELECT));
  return rows.map(mapRow);
}

export async function findHomestayById(homestayID) {
  const { rows } = await pool.query(
    `${HOMESTAY_SELECT} WHERE h.homestay_id = $1`,
    [homestayID]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function findHomestayForOwner(homestayID, ownerID) {
  const { rows } = await pool.query(
    `${HOMESTAY_SELECT} WHERE h.homestay_id = $1 AND h.owner_id = $2`,
    [homestayID, ownerID]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function filterHomestays(options = {}) {
  const conditions = [`h.status = 'approved'`];
  const params = [];
  let idx = 1;

  if (options.q) {
    const pattern = `%${String(options.q).trim()}%`;
    conditions.push(
      `(LOWER(h.title) LIKE LOWER($${idx})
        OR LOWER(COALESCE(h.description, '')) LIKE LOWER($${idx})
        OR LOWER(COALESCE(l.city, '')) LIKE LOWER($${idx})
        OR LOWER(COALESCE(l.address, '')) LIKE LOWER($${idx}))`
    );
    params.push(pattern);
    idx += 1;
  }

  if (options.city && String(options.city) !== "All") {
    conditions.push(`LOWER(l.city) = LOWER($${idx++})`);
    params.push(String(options.city));
  }

  if (options.rental_type && options.rental_type !== "All" && options.rental_type !== "all") {
    conditions.push(`h.rental_type = $${idx++}`);
    params.push(String(options.rental_type));
  }

  if (options.minPrice != null && options.minPrice !== "") {
    conditions.push(`h.price_per_hour >= $${idx++}`);
    params.push(Number(options.minPrice));
  }

  if (options.maxPrice != null && options.maxPrice !== "") {
    conditions.push(`h.price_per_hour <= $${idx++}`);
    params.push(Number(options.maxPrice));
  }

  if (options.maxGuests != null && options.maxGuests !== "" && options.maxGuests !== "All") {
    conditions.push(`a.max_guests >= $${idx++}`);
    params.push(Number(options.maxGuests));
  }

  if (options.verified != null && options.verified !== "") {
    conditions.push(`h.is_verified = $${idx++}`);
    params.push(options.verified === "true" || options.verified === true);
  }

  for (const amenity of normalizeAmenityList(options.amenities)) {
    const column = AMENITY_COLUMNS[amenity];
    if (!column) continue;
    conditions.push(`a.${column} = TRUE`);
  }

  const { rows } = await pool.query(
    withOrder(`${HOMESTAY_SELECT} WHERE ${conditions.join(" AND ")}`),
    params
  );
  return rows.map(mapRow);
}

export async function searchHomestays(query) {
  const q = String(query || "").trim();
  if (!q) return [];
  return filterHomestays({ q });
}

export async function createHomestay(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO homestays (
         owner_id, title, description, price_per_hour, rental_type, check_in_time, check_out_time, is_verified, status, rejection_reason
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, 'pending', NULL)
       RETURNING homestay_id`,
      [
        Number(data.ownerId),
        data.title,
        data.description ?? null,
        Number(data.pricePerHour),
        data.rental_type || 'hourly',
        data.check_in_time || '14:00:00',
        data.check_out_time || '10:00:00'
      ]
    );

    const homestayID = rows[0].homestay_id;
    await upsertLocation(client, homestayID, data);
    await upsertAmenities(client, homestayID, data);
    await client.query("COMMIT");

    return findHomestayById(homestayID);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findHomestaysByOwner(ownerID) {
  const { rows } = await pool.query(
    withOrder(`${HOMESTAY_SELECT} WHERE h.owner_id = $1`),
    [ownerID]
  );
  return rows.map(mapRow);
}

export async function findPendingHomestays() {
  const { rows } = await pool.query(
    withOrder(`${HOMESTAY_SELECT} WHERE h.status = 'pending'`)
  );
  return rows.map(mapRow);
}

export async function updateHomestay(homestayID, fields) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE homestays SET
         title = $2,
         description = $3,
         price_per_hour = $4,
         rental_type = $5,
         check_in_time = $6,
         check_out_time = $7,
         status = $8,
         is_verified = $9,
         rejection_reason = $10
       WHERE homestay_id = $1
       RETURNING homestay_id`,
      [
        homestayID,
        fields.title,
        fields.description ?? null,
        Number(fields.pricePerHour),
        fields.rental_type || 'hourly',
        fields.check_in_time || '14:00:00',
        fields.check_out_time || '10:00:00',
        fields.status,
        fields.isVerified,
        fields.rejectionReason ?? null,
      ]
    );

    if (!rows.length) {
      await client.query("ROLLBACK");
      return null;
    }

    await upsertLocation(client, homestayID, fields);
    await upsertAmenities(client, homestayID, fields);
    await client.query("COMMIT");

    return findHomestayById(homestayID);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function archiveHomestay(homestayID) {
  const { rows } = await pool.query(
    `UPDATE homestays SET status = 'archived', is_verified = FALSE
     WHERE homestay_id = $1
     RETURNING homestay_id`,
    [homestayID]
  );
  return rows.length ? findHomestayById(rows[0].homestay_id) : null;
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
     RETURNING homestay_id`,
    [homestayID, status, isVerified, rejectionReason ?? null]
  );
  return rows.length ? findHomestayById(rows[0].homestay_id) : null;
}
