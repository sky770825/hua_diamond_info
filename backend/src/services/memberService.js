import { readMembers, writeMembers } from "../lib/store.js";
import { deleteByRelPath } from "../lib/imageStorage.js";

export function list() {
  return readMembers();
}

export function getByNo(no) {
  const members = readMembers();
  const m = members.find((x) => x.no === no);
  return m ?? null;
}

/**
 * 新增成員。
 * @param {{ no: string; name: string; tags: string[]; needs: { general: string; ideal: string; dream: string }; services: string[] }} payload
 * @returns {{ member: object } | { error: string }}
 */
export function create(payload) {
  const members = readMembers();
  if (members.some((x) => x.no === payload.no)) {
    return { error: "編號已存在" };
  }
  const contact = {};
  if (payload.contact?.line) contact.line = String(payload.contact.line).trim();
  if (payload.contact?.email) contact.email = String(payload.contact.email).trim();
  if (payload.contact?.phone) contact.phone = String(payload.contact.phone).trim();
  const member = {
    no: String(payload.no).trim(),
    name: String(payload.name).trim(),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    needs: {
      general: String(payload.needs?.general ?? "").trim(),
      ideal: String(payload.needs?.ideal ?? "").trim(),
      dream: String(payload.needs?.dream ?? "").trim(),
    },
    services: Array.isArray(payload.services) ? payload.services : [],
    portfolio: [],
  };
  if (Object.keys(contact).length > 0) member.contact = contact;
  if (!member.no || !member.name) return { error: "編號與姓名必填" };
  members.push(member);
  writeMembers(members);
  return { member };
}

export function update(no, patch) {
  const members = readMembers();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return null;
  const updated = { ...members[i], ...patch, no: members[i].no };
  members[i] = updated;
  writeMembers(members);
  return updated;
}

/**
 * 刪除成員。
 * @param {string} no - 成員編號
 * @returns {boolean} 是否刪除成功
 */
export function remove(no) {
  const members = readMembers();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return false;
  const m = members[i];
  if (m.avatar) deleteByRelPath(m.avatar);
  const port = m.portfolio || [];
  for (const p of port) {
    if (p.image) deleteByRelPath(p.image);
  }
  members.splice(i, 1);
  writeMembers(members);
  return true;
}

/**
 * 設定或清除成員形象照。
 * @param {string} no - 成員編號
 * @param {string | null} avatarPath - 新圖片路徑（如 /uploads/xxx.jpg），或 null 表示移除
 * @returns {object | null} 更新後的成員，找不到則 null
 */
export function setAvatar(no, avatarPath) {
  const members = readMembers();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return null;
  const prev = members[i].avatar;
  if (prev) deleteByRelPath(prev);
  if (avatarPath) {
    members[i] = { ...members[i], avatar: avatarPath };
  } else {
    const { avatar: _, ...rest } = members[i];
    members[i] = rest;
  }
  writeMembers(members);
  return members[i];
}
