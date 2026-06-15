import { Router } from "express";
import C_Transaction from "../controllers/C_Transaction.js";

const router = Router();

router.post("/", C_Transaction.createTransaction);

export default router;
