import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/index.js";
import { membersRouter } from "./routes/members.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/uploads", express.static(config.UPLOADS_DIR));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/members", membersRouter);

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/admin", (_, res) => res.redirect("/admin.html"));

app.listen(config.PORT, () => {
  const dbMode = process.env.DATABASE_URL ? "PostgreSQL (hua_internation)" : "JSON 本機";
  console.log(`[後端] API 運行於 http://localhost:${config.PORT}，資料來源：${dbMode}`);
});
