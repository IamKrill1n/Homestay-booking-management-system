import { Router } from "express";
import { M_User } from "../models/M_User.js";

const router = Router();
const guest = new M_User();

/** POST /api/guest/register — register(fieldList) */
router.post("/register", (req, res) => {
  const result = guest.register(req.body);
  const status = result.valid ? 200 : 400;
  res.status(status).json(result);
});

export default router;
