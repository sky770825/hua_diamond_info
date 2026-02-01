/**
 * MongoDB store - 使用 Zeabur MongoDB
 * 需設定 MONGODB_URI 環境變數
 */

import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";

const uri = process.env.MONGODB_URI;
let client = null;
let db = null;
const DB_NAME = "hua_diamond_info";
const COLLECTION = "members";

async function getDb() {
  if (!uri) throw new Error("MONGODB_URI 未設定");
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

function docToMember(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  const m = { ...rest };
  if (m.contact && Object.keys(m.contact).length === 0) delete m.contact;
  return m;
}

export async function readMembers() {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const docs = await col.find({}).sort({ no: 1 }).toArray();
  return docs.map(docToMember);
}

export async function getMemberByNo(no) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const doc = await col.findOne({ no: String(no) });
  return docToMember(doc);
}

export async function createMember(payload) {
  const no = String(payload.no).trim();
  const name = String(payload.name).trim();
  if (!no || !name) return { error: "編號與姓名必填" };

  const database = await getDb();
  const col = database.collection(COLLECTION);
  const existing = await col.findOne({ no });
  if (existing) return { error: "編號已存在" };

  const contact = payload.contact || {};
  const member = {
    no,
    name,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    needs: {
      general: String(payload.needs?.general ?? "").trim(),
      ideal: String(payload.needs?.ideal ?? "").trim(),
      dream: String(payload.needs?.dream ?? "").trim(),
    },
    services: Array.isArray(payload.services) ? payload.services : [],
    portfolio: [],
  };
  if (contact.line || contact.email || contact.phone) {
    member.contact = {
      line: contact.line ? String(contact.line).trim() : undefined,
      email: contact.email ? String(contact.email).trim() : undefined,
      phone: contact.phone ? String(contact.phone).trim() : undefined,
    };
  }

  await col.insertOne(member);
  return { member: docToMember(member) };
}

export async function updateMember(no, patch) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const m = await col.findOne({ no: String(no) });
  if (!m) return null;

  const updates = {};
  if (patch.name !== undefined) updates.name = String(patch.name).trim();
  if (patch.avatar !== undefined) updates.avatar = patch.avatar;
  if (patch.tags !== undefined) updates.tags = Array.isArray(patch.tags) ? patch.tags : m.tags;
  if (patch.services !== undefined) updates.services = Array.isArray(patch.services) ? patch.services : m.services;
  if (patch.needs !== undefined) {
    updates.needs = {
      general: patch.needs.general !== undefined ? String(patch.needs.general).trim() : (m.needs?.general ?? ""),
      ideal: patch.needs.ideal !== undefined ? String(patch.needs.ideal).trim() : (m.needs?.ideal ?? ""),
      dream: patch.needs.dream !== undefined ? String(patch.needs.dream).trim() : (m.needs?.dream ?? ""),
    };
  }
  if (patch.contact !== undefined) {
    const c = patch.contact;
    if (c.line || c.email || c.phone) {
      updates.contact = {
        line: c.line ? String(c.line).trim() : undefined,
        email: c.email ? String(c.email).trim() : undefined,
        phone: c.phone ? String(c.phone).trim() : undefined,
      };
    } else {
      updates.contact = {};
    }
  }

  await col.updateOne({ no: String(no) }, { $set: updates });
  return await getMemberByNo(no);
}

export async function removeMember(no) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const res = await col.deleteOne({ no: String(no) });
  return res.deletedCount > 0;
}

export async function setMemberAvatar(no, avatarPath) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const m = await col.findOne({ no: String(no) });
  if (!m) return null;

  await col.updateOne({ no: String(no) }, { $set: { avatar: avatarPath } });
  return await getMemberByNo(no);
}

export async function addPortfolioItem(memberNo, payload) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const m = await col.findOne({ no: String(memberNo) });
  if (!m) return null;

  const item = {
    id: uuidv4(),
    title: payload.title || undefined,
    description: payload.description || undefined,
    image: payload.imagePath,
  };
  await col.updateOne({ no: String(memberNo) }, { $push: { portfolio: item } });
  return item;
}

export async function deletePortfolioItem(memberNo, itemId) {
  const database = await getDb();
  const col = database.collection(COLLECTION);
  const res = await col.updateOne(
    { no: String(memberNo) },
    { $pull: { portfolio: { id: itemId } } }
  );
  return res.modifiedCount > 0;
}
