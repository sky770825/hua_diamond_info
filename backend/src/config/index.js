import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  DATA_PATH: path.join(ROOT, "data/members.json"),
  UPLOADS_DIR: path.join(ROOT, "uploads"),
  UPLOADS_URL_PATH: "/uploads",
  LIMIT_FILE_SIZE: 5 * 1024 * 1024,
};
