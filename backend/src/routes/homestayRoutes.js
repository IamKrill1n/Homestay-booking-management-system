import { Router } from "express";
import { M_User } from "../models/M_User.js";
import C_Feedback from "../controllers/C_Feedback.js";

const router = Router();
const guest = new M_User();

/** GET /api/homestays — viewHomestays */
router.get("/", async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, maxGuests, amenities, verified, q } = req.query;

    if (
      q ||
      city ||
      minPrice != null ||
      maxPrice != null ||
      maxGuests != null ||
      amenities ||
      verified != null
    ) {
      const results = await guest.filterHomestays({
        q,
        city,
        minPrice,
        maxPrice,
        maxGuests,
        amenities,
        verified,
      });
      return res.json(results);
    }

    const list = await guest.viewHomestays();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/homestays/search?q= — searchHomestays */
router.get("/search", async (req, res, next) => {
  try {
    const results = await guest.searchHomestays(req.query.q || "");
    res.json(results);
  } catch (err) {
    next(err);
  }
});

/** GET /api/homestays/:id/feedback — viewFeedback */
router.get("/:id/feedback", C_Feedback.listByHomestay);

/** GET /api/homestays/:id — viewHomestayDetails */
router.get("/:id", async (req, res, next) => {
  try {
    const homestay = await guest.viewHomestayDetails(req.params.id);
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    res.json(homestay);
  } catch (err) {
    next(err);
  }
});

/** GET /api/homestays/:id/location — viewMap */
router.get("/:id/location", async (req, res, next) => {
  try {
    const homestay = await guest.viewHomestayDetails(req.params.id);
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    const location = guest.viewMap(homestay);
    if (!location) {
      return res.status(404).json({ error: "Location not available" });
    }
    res.json(location);
  } catch (err) {
    next(err);
  }
});

export default router;
