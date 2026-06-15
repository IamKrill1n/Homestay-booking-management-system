import { Router } from "express";
import { M_Owner } from "../models/M_Owner.js";

const router = Router();
const owner = new M_Owner();

/** GET /api/owner/homestays?ownerId= — viewMyHomestays */
router.get("/homestays", async (req, res, next) => {
  try {
    const list = await owner.viewMyHomestays(req.query.ownerId || "");
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/owner/homestays/:id?ownerId= — owner-scoped homestay detail */
router.get("/homestays/:id", async (req, res, next) => {
  try {
    const ownerId = req.query.ownerId || "";
    const list = await owner.viewMyHomestays(ownerId);
    const homestay = list.find(
      (item) => String(item.homestayID) === String(req.params.id)
    );
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    res.json(homestay);
  } catch (err) {
    next(err);
  }
});

/** POST /api/owner/homestays — createHomestay (UC 3.1) */
router.post("/homestays", async (req, res, next) => {
  try {
    const result = await owner.createHomestay(req.body);
    res.status(result.valid ? 201 : 400).json(result);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/owner/homestays/:id — updateHomestay (UC 3.2) */
router.put("/homestays/:id", async (req, res, next) => {
  try {
    const result = await owner.updateHomestay(req.params.id, req.body);
    if (!result.valid) {
      const status = result.message === "Homestay not found" ? 404 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/owner/homestays/:id — deleteHomestay (soft-archive, UC 3.3) */
router.delete("/homestays/:id", async (req, res, next) => {
  try {
    const result = await owner.deleteHomestay(req.params.id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
