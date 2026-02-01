import { Router } from "express";
import path from "path";
import multer from "multer";
import { upload, resizeToAvatar, resizeToPortfolio } from "../lib/imageStorage.js";
import { config } from "../config/index.js";
import * as memberService from "../services/memberService.js";
import * as portfolioService from "../services/portfolioService.js";

const router = Router();

function sortByNo(members) {
  return members.slice().sort((a, b) =>
    String(a.no).localeCompare(String(b.no), undefined, { numeric: true })
  );
}

router.get("/", async (_req, res) => {
  try {
    const members = await memberService.list();
    res.json(sortByNo(Array.isArray(members) ? members : []));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await memberService.create(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result.member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:no", async (req, res) => {
  try {
    const m = await memberService.getByNo(req.params.no);
    if (!m) return res.status(404).json({ error: "找不到成員" });
    res.json(m);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:no", async (req, res) => {
  try {
    const updated = await memberService.update(req.params.no, req.body);
    if (!updated) return res.status(404).json({ error: "找不到成員" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:no", async (req, res) => {
  try {
    const ok = await memberService.remove(req.params.no);
    if (!ok) return res.status(404).json({ error: "找不到成員" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/:no/avatar",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "請上傳圖片" });
      const imagePath = await resizeToAvatar(req.file.path);
      const updated = await memberService.setAvatar(req.params.no, imagePath);
      if (!updated) return res.status(404).json({ error: "找不到成員" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.delete("/:no/avatar", async (req, res) => {
  try {
    const updated = await memberService.setAvatar(req.params.no, null);
    if (!updated) return res.status(404).json({ error: "找不到成員" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/:no/portfolio",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "請上傳圖片" });
      const imagePath = await resizeToPortfolio(path.resolve(req.file.path));
      const item = await portfolioService.addItem(req.params.no, {
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

router.delete("/:no/portfolio/:id", async (req, res) => {
  try {
    const ok = await portfolioService.deleteItem(req.params.no, req.params.id);
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
