-- ============================================================
-- Schema: hua_internation
-- 華地產鑽石分會資訊組成員牆 - 資料庫結構
-- ============================================================

-- 建立 schema
CREATE SCHEMA IF NOT EXISTS hua_internation;

SET search_path TO hua_internation;

-- ------------------------------------------------------------
-- Table: members（成員主表）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hua_internation.members (
  no VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  needs_general TEXT DEFAULT '',
  needs_ideal TEXT DEFAULT '',
  needs_dream TEXT DEFAULT '',
  services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Table: member_contacts（成員聯絡方式，1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hua_internation.member_contacts (
  member_no VARCHAR(50) PRIMARY KEY REFERENCES hua_internation.members(no) ON DELETE CASCADE,
  line VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50)
);

-- ------------------------------------------------------------
-- Table: portfolio_items（作品集，1:N）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hua_internation.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_no VARCHAR(50) NOT NULL REFERENCES hua_internation.members(no) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  image VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_name ON hua_internation.members(name);
CREATE INDEX IF NOT EXISTS idx_members_tags ON hua_internation.members USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_portfolio_member_no ON hua_internation.portfolio_items(member_no);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION hua_internation.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_members_updated_at ON hua_internation.members;
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON hua_internation.members
  FOR EACH ROW EXECUTE PROCEDURE hua_internation.update_updated_at();
