import { v4 as uuidv4 } from "uuid";
import { readMembers, writeMembers } from "../lib/store.js";
import { deleteByRelPath } from "../lib/imageStorage.js";
import { config } from "../config/index.js";

/**
 * @param {string} memberNo
 * @param {{ imagePath: string; title?: string; description?: string }} payload
 * @returns {{ id: string; title?: string; description?: string; image: string } | null}
 */
export function addItem(memberNo, payload) {
  const members = readMembers();
  const i = members.findIndex((x) => x.no === memberNo);
  if (i < 0) return null;
  const portfolio = members[i].portfolio ?? [];
  const item = {
    id: uuidv4(),
    title: payload.title || undefined,
    description: payload.description || undefined,
    image: payload.imagePath,
  };
  portfolio.push(item);
  members[i].portfolio = portfolio;
  writeMembers(members);
  return item;
}

/**
 * @param {string} memberNo
 * @param {string} itemId
 * @returns {boolean} 是否刪除成功
 */
export function deleteItem(memberNo, itemId) {
  const members = readMembers();
  const i = members.findIndex((x) => x.no === memberNo);
  if (i < 0) return false;
  const portfolio = members[i].portfolio ?? [];
  const item = portfolio.find((p) => p.id === itemId);
  if (!item) return false;
  deleteByRelPath(item.image);
  members[i].portfolio = portfolio.filter((p) => p.id !== itemId);
  writeMembers(members);
  return true;
}
