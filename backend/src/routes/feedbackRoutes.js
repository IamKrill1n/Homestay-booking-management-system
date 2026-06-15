import { Router } from "express";
import C_Feedback from "../controllers/C_Feedback.js";

const router = Router();

router.post("/", C_Feedback.createFeedback);

export default router;
