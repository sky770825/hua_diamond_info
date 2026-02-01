import { apiUrl } from "./client";

export function portfolioImageUrl(image: string): string {
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  return apiUrl(image.startsWith("/") ? image : `/${image}`);
}
