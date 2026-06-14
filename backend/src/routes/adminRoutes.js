import { Router } from "express";
import { M_Admin } from "../models/M_Admin.js";

const router = Router();
const admin = new M_Admin();

/** GET /api/admin/homestays — viewAllHomestays */
router.get("/homestays", async (_req, res, next) => {
  try {
    const list = await admin.viewAllHomestays();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/admin/homestays/pending — viewPendingHomestays (UC 4.1) */
router.get("/homestays/pending", async (_req, res, next) => {
  try {
    const list = await admin.viewPendingHomestays();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/homestays/:id/approve — approveHomestay (UC 4.1) */
router.post("/homestays/:id/approve", async (req, res, next) => {
  try {
    const result = await admin.approveHomestay(req.params.id);
    res.status(result.valid ? 200 : 404).json(result);
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/homestays/:id/reject — rejectHomestay (UC 4.1) */
router.post("/homestays/:id/reject", async (req, res, next) => {
  try {
    const result = await admin.rejectHomestay(req.params.id, req.body.reason);
    if (!result.valid) {
      const status = result.message === "Homestay not found" ? 404 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
