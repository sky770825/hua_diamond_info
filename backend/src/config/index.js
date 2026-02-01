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
  /** 形象照：1:1 正方形，建議 400x400 以上 */
  AVATAR_SIZE: 400,
  /** 作品集：4:3 比例，建議 800x600 以上 */
  PORTFOLIO_SIZE: { width: 800, height: 600 },
};
