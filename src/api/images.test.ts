import { describe, it, expect } from "vitest";
import { portfolioImageUrl } from "./images";

describe("portfolioImageUrl", () => {
  it("修正缺少 /object/public/ 的 Supabase Storage URL（形象照／作品圖）", () => {
    const wrong =
      "https://cnzqtuuegdqwkgvletaa.supabase.co/storage/v1/object/hua-diamond-images/avatars/016_123.png";
    const got = portfolioImageUrl(wrong);
    expect(got).toContain("/object/public/");
    expect(got).toBe(
      "https://cnzqtuuegdqwkgvletaa.supabase.co/storage/v1/object/public/hua-diamond-images/avatars/016_123.png"
    );
  });

  it("已是正確公開 URL 時不變", () => {
    const correct =
      "https://cnzqtuuegdqwkgvletaa.supabase.co/storage/v1/object/public/hua-diamond-images/portfolio/100/1769960107745.png";
    expect(portfolioImageUrl(correct)).toBe(correct);
  });

  it("空值／空字串回傳空字串", () => {
    expect(portfolioImageUrl("")).toBe("");
    expect(portfolioImageUrl(null as unknown as string)).toBe("");
    expect(portfolioImageUrl(undefined as unknown as string)).toBe("");
  });

  it("data: URL 通過並保持不變", () => {
    const data = "data:image/png;base64,abc";
    expect(portfolioImageUrl(data)).toBe(data);
  });
});
