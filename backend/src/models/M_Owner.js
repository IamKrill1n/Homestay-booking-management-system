import * as homestayRepo from "../repositories/homestayRepository.js";

const CREATE_REQUIRED_FIELDS = [
  "ownerId",
  "title",
  "pricePerHour",
  "address",
  "city",
  "maxGuests",
];

function validateFields(fieldList) {
  if (!fieldList || typeof fieldList !== "object") {
    return { valid: false, message: "fieldList is required" };
  }
  for (const field of CREATE_REQUIRED_FIELDS) {
    const value = fieldList[field];
    if (value == null || String(value).trim() === "") {
      return { valid: false, message: `Missing required field: ${field}` };
    }
  }
  if (isNaN(Number(fieldList.pricePerHour))) {
    return { valid: false, message: "pricePerHour must be a number" };
  }
  if (isNaN(Number(fieldList.maxGuests)) || Number(fieldList.maxGuests) < 1) {
    return { valid: false, message: "maxGuests must be a positive number" };
  }
  return { valid: true };
}

/**
 * M_Owner — homestay host (UC 3.x on the class diagram).
 * Owner: create / update / delete (soft-archive) their own homestay profiles.
 * Listings enter "pending" and require admin verification before going public;
 * editing Address or Price re-triggers verification (UC 3.2).
 */
export class M_Owner {
  async createHomestay(fieldList) {
    const check = validateFields(fieldList);
    if (!check.valid) return check;

    const homestay = await homestayRepo.createHomestay(fieldList);
    return {
      valid: true,
      homestay,
      message: "Homestay created. Pending admin approval.",
    };
  }

  async updateHomestay(homestayID, fieldList) {
    const existing = await homestayRepo.findHomestayById(homestayID);
    if (!existing) {
      return { valid: false, message: "Homestay not found" };
    }
    if (
      fieldList.ownerId != null &&
      String(fieldList.ownerId) !== String(existing.ownerID)
    ) {
      return { valid: false, message: "Homestay not found" };
    }

    const check = validateFields({
      ownerId: existing.ownerID,
      ...fieldList,
    });
    if (!check.valid) return check;

    // Critical changes (Address / Price) re-trigger admin verification (UC 3.2).
    const addressChanged =
      String(fieldList.address) !== String(existing.location.address);
    const priceChanged =
      Number(fieldList.pricePerHour) !== Number(existing.pricePerHour);
    const reverify = addressChanged || priceChanged;

    const homestay = await homestayRepo.updateHomestay(homestayID, {
      title: fieldList.title,
      description: fieldList.description,
      pricePerHour: fieldList.pricePerHour,
      latitude: fieldList.latitude,
      longitude: fieldList.longitude,
      address: fieldList.address,
      city: fieldList.city,
      maxGuests: fieldList.maxGuests,
      numberOfBeds: fieldList.numberOfBeds,
      numberOfBedrooms: fieldList.numberOfBedrooms,
      amenities: fieldList.amenities,
      hasWifi: fieldList.hasWifi,
      hasAirConditioning: fieldList.hasAirConditioning,
      hasKitchen: fieldList.hasKitchen,
      hasBathtub: fieldList.hasBathtub,
      hasTv: fieldList.hasTv,
      hasParking: fieldList.hasParking,
      isPetFriendly: fieldList.isPetFriendly,
      status: reverify ? "pending" : existing.status,
      isVerified: reverify ? false : existing.isVerified,
      rejectionReason: reverify ? null : existing.rejectionReason,
    });

    return {
      valid: true,
      homestay,
      message: reverify
        ? "Homestay updated. Address/Price changed — pending re-approval."
        : "Homestay updated.",
    };
  }

  async deleteHomestay(homestayID) {
    const homestay = await homestayRepo.archiveHomestay(homestayID);
    if (!homestay) {
      return { success: false, message: "Homestay not found" };
    }
    return {
      success: true,
      homestay,
      message: "Homestay archived.",
    };
  }

  async viewMyHomestays(ownerID) {
    if (!ownerID || String(ownerID).trim() === "") {
      return [];
    }
    return homestayRepo.findHomestaysByOwner(ownerID);
  }
}
