import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import homestayRoutes from "./routes/homestayRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", modules: ["M_User", "M_Owner", "M_Admin"] });
});

app.use("/api/homestays", homestayRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});