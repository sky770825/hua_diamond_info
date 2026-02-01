import * as store from "../lib/store.js";
import { deleteByRelPath } from "../lib/imageStorage.js";

export async function list() {
  return store.readMembers();
}

export async function getByNo(no) {
  return store.getMemberByNo(no);
}

/**
 * 新增成員。
 */
export async function create(payload) {
  const result = await store.createMember(payload);
  if (result.error) return { error: result.error };
  return { member: result.member };
}

/**
 * 更新成員。
 * 將空字串的 contact 欄位轉為 undefined，以正確清除聯絡方式。
 */
export async function update(no, patch) {
  const p = { ...patch };
  if (p.contact && typeof p.contact === "object") {
    const c = p.contact;
    p.contact = {
      line: c.line && String(c.line).trim() ? String(c.line).trim() : undefined,
      email: c.email && String(c.email).trim() ? String(c.email).trim() : undefined,
      phone: c.phone && String(c.phone).trim() ? String(c.phone).trim() : undefined,
    };
    if (!p.contact.line && !p.contact.email && !p.contact.phone) {
      p.contact = {};
    }
  }
  return store.updateMember(no, p);
}

/**
 * 刪除成員。
 */
export async function remove(no) {
  const members = await store.readMembers();
  const m = members.find((x) => x.no === no);
  if (m) {
    if (m.avatar) deleteByRelPath(m.avatar);
    for (const p of m.portfolio || []) {
      if (p.image) deleteByRelPath(p.image);
    }
  }
  return store.removeMember(no);
}

/**
 * 設定或清除成員形象照。
 */
export async function setAvatar(no, avatarPath) {
  const members = await store.readMembers();
  const m = members.find((x) => x.no === no);
  if (m?.avatar) deleteByRelPath(m.avatar);
  return store.setMemberAvatar(no, avatarPath);
}
