/**
 * PostgreSQL store - 使用 Zeabur hua_internation schema
 * 需設定 DATABASE_URL 環境變數（Zeabur 會自動注入）
 */

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

const SCHEMA = "hua_internation";

function rowToMember(row, contact, portfolio) {
  const c = contact || {};
  const contactObj = (c.line || c.email || c.phone)
    ? { line: c.line, email: c.email, phone: c.phone }
    : undefined;
  return {
    no: row.no,
    name: row.name,
    avatar: row.avatar || undefined,
    tags: row.tags || [],
    needs: {
      general: row.needs_general || "",
      ideal: row.needs_ideal || "",
      dream: row.needs_dream || "",
    },
    services: row.services || [],
    contact: contactObj,
    portfolio: (portfolio || []).map((p) => ({
      id: p.id,
      title: p.title || undefined,
      description: p.description || undefined,
      image: p.image,
    })),
  };
}

async function loadMember(client, no) {
  const mRes = await client.query(
    `SELECT no, name, avatar, tags, needs_general, needs_ideal, needs_dream, services 
     FROM ${SCHEMA}.members WHERE no = $1`,
    [no]
  );
  if (mRes.rows.length === 0) return null;
  const cRes = await client.query(
    `SELECT member_no, line, email, phone FROM ${SCHEMA}.member_contacts WHERE member_no = $1`,
    [no]
  );
  const pRes = await client.query(
    `SELECT id, title, description, image FROM ${SCHEMA}.portfolio_items WHERE member_no = $1 ORDER BY created_at`,
    [no]
  );
  return rowToMember(mRes.rows[0], cRes.rows[0], pRes.rows);
}

export async function readMembers() {
  const client = await pool.connect();
  try {
    const mRes = await client.query(
      `SELECT no FROM ${SCHEMA}.members ORDER BY no`
    );
    const members = [];
    for (const r of mRes.rows) {
      const m = await loadMember(client, r.no);
      if (m) members.push(m);
    }
    return members;
  } finally {
    client.release();
  }
}

export async function getMemberByNo(no) {
  const client = await pool.connect();
  try {
    return await loadMember(client, no);
  } finally {
    client.release();
  }
}

export async function createMember(payload) {
  const no = String(payload.no).trim();
  const name = String(payload.name).trim();
  if (!no || !name) return { error: "編號與姓名必填" };

  const client = await pool.connect();
  try {
    const exists = await client.query(
      `SELECT 1 FROM ${SCHEMA}.members WHERE no = $1`,
      [no]
    );
    if (exists.rows.length > 0) return { error: "編號已存在" };

    const contact = payload.contact || {};
    await client.query(
      `INSERT INTO ${SCHEMA}.members (no, name, tags, needs_general, needs_ideal, needs_dream, services)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        no,
        name,
        Array.isArray(payload.tags) ? payload.tags : [],
        String(payload.needs?.general ?? "").trim(),
        String(payload.needs?.ideal ?? "").trim(),
        String(payload.needs?.dream ?? "").trim(),
        Array.isArray(payload.services) ? payload.services : [],
      ]
    );
    await client.query(
      `INSERT INTO ${SCHEMA}.member_contacts (member_no, line, email, phone) VALUES ($1, $2, $3, $4)`,
      [
        no,
        contact.line ? String(contact.line).trim() : null,
        contact.email ? String(contact.email).trim() : null,
        contact.phone ? String(contact.phone).trim() : null,
      ]
    );
    return { member: await loadMember(client, no) };
  } finally {
    client.release();
  }
}

export async function updateMember(no, patch) {
  const client = await pool.connect();
  try {
    const m = await loadMember(client, no);
    if (!m) return null;

    const name = patch.name !== undefined ? String(patch.name).trim() : m.name;
    const tags = patch.tags !== undefined ? (Array.isArray(patch.tags) ? patch.tags : []) : m.tags;
    const needs = {
      general: patch.needs?.general !== undefined ? String(patch.needs.general).trim() : m.needs.general,
      ideal: patch.needs?.ideal !== undefined ? String(patch.needs.ideal).trim() : m.needs.ideal,
      dream: patch.needs?.dream !== undefined ? String(patch.needs.dream).trim() : m.needs.dream,
    };
    const services = patch.services !== undefined ? (Array.isArray(patch.services) ? patch.services : []) : m.services;
    const contact = patch.contact !== undefined ? patch.contact : m.contact || {};

    const avatarVal = patch.avatar !== undefined ? patch.avatar : m.avatar;
    await client.query(
      `UPDATE ${SCHEMA}.members SET name=$2, avatar=$3, tags=$4, needs_general=$5, needs_ideal=$6, needs_dream=$7, services=$8, updated_at=NOW() WHERE no=$1`,
      [no, name, avatarVal, tags, needs.general, needs.ideal, needs.dream, services]
    );
    await client.query(
      `INSERT INTO ${SCHEMA}.member_contacts (member_no, line, email, phone) VALUES ($1, $2, $3, $4)
       ON CONFLICT (member_no) DO UPDATE SET line=$2, email=$3, phone=$4`,
      [no, contact.line || null, contact.email || null, contact.phone || null]
    );
    return await loadMember(client, no);
  } finally {
    client.release();
  }
}

export async function removeMember(no) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `DELETE FROM ${SCHEMA}.members WHERE no = $1 RETURNING 1`,
      [no]
    );
    return res.rowCount > 0;
  } finally {
    client.release();
  }
}

export async function setMemberAvatar(no, avatarPath) {
  const client = await pool.connect();
  try {
    const m = await loadMember(client, no);
    if (!m) return null;
    await client.query(
      `UPDATE ${SCHEMA}.members SET avatar=$2, updated_at=NOW() WHERE no=$1`,
      [no, avatarPath]
    );
    return await loadMember(client, no);
  } finally {
    client.release();
  }
}

export async function addPortfolioItem(memberNo, payload) {
  const client = await pool.connect();
  try {
    const m = await loadMember(client, memberNo);
    if (!m) return null;
    const { v4: uuidv4 } = await import("uuid");
    const id = uuidv4();
    await client.query(
      `INSERT INTO ${SCHEMA}.portfolio_items (id, member_no, title, description, image)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, memberNo, payload.title || null, payload.description || null, payload.imagePath]
    );
    const item = { id, title: payload.title, description: payload.description, image: payload.imagePath };
    return item;
  } finally {
    client.release();
  }
}

export async function deletePortfolioItem(memberNo, itemId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `DELETE FROM ${SCHEMA}.portfolio_items WHERE member_no=$1 AND id=$2 RETURNING 1`,
      [memberNo, itemId]
    );
    return res.rowCount > 0;
  } finally {
    client.release();
  }
}
