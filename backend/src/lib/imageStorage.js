import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { config } from "../config/index.js";

function ensureUploadsDir() {
  if (!fs.existsSync(config.UPLOADS_DIR)) {
    fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadsDir();
    cb(null, config.UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("僅支援圖片檔"));
  }
  cb(null, true);
};

/** Multer 中介軟體：用於作品集圖片上傳 */
export const upload = multer({
  storage,
  limits: { fileSize: config.LIMIT_FILE_SIZE },
  fileFilter,
});

/** 依相對路徑刪除圖片（例如 /uploads/xxx.jpg） */
export function deleteByRelPath(relPath) {
  if (!relPath) return;
  const base = path.basename(relPath);
  const full = path.join(config.UPLOADS_DIR, base);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

