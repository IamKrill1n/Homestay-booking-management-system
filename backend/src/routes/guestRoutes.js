import { Router } from "express";
import { M_User } from "../models/M_User.js";
import C_User from "../controllers/C_User.js";

const router = Router();
const guest = new M_User();

router.post("/register", C_User.register);
router.post("/login", C_User.login);
router.get("/profile/:id", C_User.getProfile);
router.put("/profile/:id", C_User.updateProfile);
router.delete("/profile/:id", C_User.deleteAccount);

export default router;