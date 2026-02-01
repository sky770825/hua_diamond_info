import * as store from "../lib/store.js";
import { deleteByRelPath } from "../lib/imageStorage.js";

/**
 * @param {string} memberNo
 * @param {{ imagePath: string; title?: string; description?: string }} payload
 */
export async function addItem(memberNo, payload) {
  const members = await store.readMembers();
  const m = members.find((x) => x.no === memberNo);
  if (!m) return null;
  const item = await store.addPortfolioItem(memberNo, payload);
  return item;
}

/**
 * @param {string} memberNo
 * @param {string} itemId
 */
export async function deleteItem(memberNo, itemId) {
  const members = await store.readMembers();
  const m = members.find((x) => x.no === memberNo);
  const item = m?.portfolio?.find((p) => p.id === itemId);
  if (item?.image) deleteByRelPath(item.image);
  return store.deletePortfolioItem(memberNo, itemId);
}
