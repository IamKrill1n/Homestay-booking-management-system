import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import homestayRoutes from "./src/routes/homestayRoutes.js";
import guestRoutes from "./src/routes/guestRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", module: "M_User Part 1" });
});

app.use("/api/homestays", homestayRoutes);
app.use("/api/guest", guestRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});