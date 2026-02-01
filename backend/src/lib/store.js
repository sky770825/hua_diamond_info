/**
 * Store 統一介面：
 * - MONGODB_URI 有設定時用 MongoDB；
 * - DATABASE_URL 有設定時用 PostgreSQL (hua_internation)；
 * - 否則用本機 JSON 檔 (backend/data/members.json)
 */

import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";
import * as dbStore from "./dbStore.js";
import * as mongoStore from "./mongoStore.js";

const USE_MONGO = !!process.env.MONGODB_URI;
const USE_DB = !!process.env.DATABASE_URL;

function pickStore() {
  if (USE_MONGO) return mongoStore;
  if (USE_DB) return dbStore;
  return null;
}

// JSON 操作（同步）
function readJson() {
  const raw = fs.readFileSync(config.DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeJson(members) {
  fs.writeFileSync(config.DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}

export function readMembers() {
  const store = pickStore();
  if (store) return store.readMembers();
  return Promise.resolve(readJson());
}

export function getMemberByNo(no) {
  const store = pickStore();
  if (store) return store.getMemberByNo(no);
  const members = readJson();
  const m = members.find((x) => x.no === no);
  return Promise.resolve(m ?? null);
}

export function createMember(payload) {
  const store = pickStore();
  if (store) return store.createMember(payload);
  const members = readJson();
  if (members.some((x) => x.no === payload.no)) {
    return Promise.resolve({ error: "編號已存在" });
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
  if (!member.no || !member.name) return Promise.resolve({ error: "編號與姓名必填" });
  members.push(member);
  writeJson(members);
  return Promise.resolve({ member });
}

export function updateMember(no, patch) {
  const store = pickStore();
  if (store) return store.updateMember(no, patch);
  const members = readJson();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return Promise.resolve(null);
  const updated = { ...members[i], ...patch, no: members[i].no };
  members[i] = updated;
  writeJson(members);
  return Promise.resolve(updated);
}

export function removeMember(no) {
  const store = pickStore();
  if (store) return store.removeMember(no);
  const members = readJson();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return Promise.resolve(false);
  members.splice(i, 1);
  writeJson(members);
  return Promise.resolve(true);
}

export function setMemberAvatar(no, avatarPath) {
  const store = pickStore();
  if (store) return store.setMemberAvatar(no, avatarPath);
  const members = readJson();
  const i = members.findIndex((x) => x.no === no);
  if (i < 0) return Promise.resolve(null);
  if (avatarPath) {
    members[i] = { ...members[i], avatar: avatarPath };
  } else {
    const { avatar: _, ...rest } = members[i];
    members[i] = rest;
  }
  writeJson(members);
  return Promise.resolve(members[i]);
}

export function addPortfolioItem(memberNo, payload) {
  const store = pickStore();
  if (store) return store.addPortfolioItem(memberNo, payload);
  const members = readJson();
  const i = members.findIndex((x) => x.no === memberNo);
  if (i < 0) return Promise.resolve(null);
  const item = {
    id: uuidv4(),
    title: payload.title || undefined,
    description: payload.description || undefined,
    image: payload.imagePath,
  };
  members[i].portfolio = members[i].portfolio || [];
  members[i].portfolio.push(item);
  writeJson(members);
  return Promise.resolve(item);
}

export function deletePortfolioItem(memberNo, itemId) {
  const store = pickStore();
  if (store) return store.deletePortfolioItem(memberNo, itemId);
  const members = readJson();
  const i = members.findIndex((x) => x.no === memberNo);
  if (i < 0) return Promise.resolve(false);
  const portfolio = members[i].portfolio || [];
  const j = portfolio.findIndex((p) => p.id === itemId);
  if (j < 0) return Promise.resolve(false);
  portfolio.splice(j, 1);
  members[i].portfolio = portfolio;
  writeJson(members);
  return Promise.resolve(true);
}
