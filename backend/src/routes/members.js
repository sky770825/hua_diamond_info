import { Router } from "express";
import multer from "multer";
import { upload } from "../lib/imageStorage.js";
import { config } from "../config/index.js";
import * as memberService from "../services/memberService.js";
import * as portfolioService from "../services/portfolioService.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    res.json(memberService.list());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", (req, res) => {
  try {
    const result = memberService.create(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result.member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:no", (req, res) => {
  try {
    const m = memberService.getByNo(req.params.no);
    if (!m) return res.status(404).json({ error: "找不到成員" });
    res.json(m);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:no", (req, res) => {
  try {
    const updated = memberService.update(req.params.no, req.body);
    if (!updated) return res.status(404).json({ error: "找不到成員" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:no", (req, res) => {
  try {
    const ok = memberService.remove(req.params.no);
    if (!ok) return res.status(404).json({ error: "找不到成員" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/:no/avatar",
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "請上傳圖片" });
      const imagePath = `${config.UPLOADS_URL_PATH}/${req.file.filename}`;
      const updated = memberService.setAvatar(req.params.no, imagePath);
      if (!updated) return res.status(404).json({ error: "找不到成員" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.delete("/:no/avatar", (req, res) => {
  try {
    const updated = memberService.setAvatar(req.params.no, null);
    if (!updated) return res.status(404).json({ error: "找不到成員" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/:no/portfolio",
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "請上傳圖片" });
      const imagePath = `${config.UPLOADS_URL_PATH}/${req.file.filename}`;
      const item = portfolioService.addItem(req.params.no, {
        imagePath,
        title: req.body.title,
        description: req.body.description,
      });
      if (!item) return res.status(404).json({ error: "找不到成員" });
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.delete("/:no/portfolio/:id", (req, res) => {
  try {
    const ok = portfolioService.deleteItem(req.params.no, req.params.id);
    if (!ok) return res.status(404).json({ error: "找不到成員或作品" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `檔案過大，上限 ${config.LIMIT_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    return res.status(400).json({ error: err.message });
  }
  res.status(400).json({ error: err.message || "上傳失敗" });
});

export const membersRouter = router;
