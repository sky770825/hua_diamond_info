import { apiUrl } from "./client";

export function portfolioImageUrl(image: string): string {
  if (image == null || typeof image !== "string") return "";
  const s = image.trim();
  if (s === "") return "";
  if (s.startsWith("http") || s.startsWith("data:")) return s;
  return apiUrl(s.startsWith("/") ? s : `/${s}`);
}
