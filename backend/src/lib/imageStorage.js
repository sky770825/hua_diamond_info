import fs from "fs";
import path from "path";
import sharp from "sharp";
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

/**
 * 將圖片縮放為 1:1 正方形（形象照），直接覆寫原檔並轉為 jpg
 * @param {string} filePath - 檔案完整路徑
 * @returns {Promise<string>} 回傳新的 URL 路徑（若轉為 jpg 則副檔名變更）
 */
export async function resizeToAvatar(filePath) {
  try {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const outName = `${base}.jpg`;
    const outPath = path.join(dir, outName);
    // 若輸出與輸入相同，先寫入暫存檔再覆蓋
    const tmpPath = outPath === filePath ? path.join(dir, `_tmp_${base}.jpg`) : outPath;
    await sharp(filePath)
      .resize(config.AVATAR_SIZE, config.AVATAR_SIZE, { fit: "cover", position: "center" })
      .jpeg({ quality: 85 })
      .toFile(tmpPath);
    if (tmpPath !== filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (tmpPath !== outPath) {
      fs.renameSync(tmpPath, outPath);
    }
    return `${config.UPLOADS_URL_PATH}/${outName}`;
  } catch (err) {
    console.warn("[imageStorage] avatar resize skip:", err.message);
    return `${config.UPLOADS_URL_PATH}/${path.basename(filePath)}`;
  }
}

/**
 * 將圖片縮放為 4:3 比例（作品集），直接覆寫原檔並轉為 jpg
 * @param {string} filePath - 檔案完整路徑
 * @returns {Promise<string>} 回傳新的 URL 路徑
 */
export async function resizeToPortfolio(filePath) {
  try {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const outName = `${base}.jpg`;
    const outPath = path.join(dir, outName);
    const tmpPath = outPath === filePath ? path.join(dir, `_tmp_${base}.jpg`) : outPath;
    const { width, height } = config.PORTFOLIO_SIZE;
    await sharp(filePath)
      .resize(width, height, { fit: "cover", position: "center" })
      .jpeg({ quality: 85 })
      .toFile(tmpPath);
    if (tmpPath !== filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (tmpPath !== outPath) fs.renameSync(tmpPath, outPath);
    return `${config.UPLOADS_URL_PATH}/${outName}`;
  } catch (err) {
    console.warn("[imageStorage] portfolio resize skip:", err.message);
    return `${config.UPLOADS_URL_PATH}/${path.basename(filePath)}`;
  }
}

