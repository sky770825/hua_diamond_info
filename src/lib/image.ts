const MAX_WIDTH = 900;
const MAX_HEIGHT = 900;
const JPEG_QUALITY = 0.82;

/**
 * 將圖片檔案壓縮為 base64 data URL，避免 JSON 過大
 */
export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      let w = width;
      let h = height;
      if (w > MAX_WIDTH || h > MAX_HEIGHT) {
        const r = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
        w = Math.round(w * r);
        h = Math.round(h * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2d context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("無法讀取圖片"));
    };
    img.src = url;
  });
}
