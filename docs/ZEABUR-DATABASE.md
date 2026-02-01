# Zeabur 資料庫設定｜hua_internation schema

本文說明如何在 [Zeabur](https://zeabur.com) 建立 `hua_internation` schema 並匯入資料。

---

## 一、在 Zeabur 建立 PostgreSQL

1. 進入您的 [Zeabur 專案](https://zeabur.com/projects/67e77dc771bdf75804437d3b/services/67e77dfbf4d95a5bf2de6ec9?envID=67e77dc788fec6a3e3440766)
2. 點 **Add Service** → 選擇 **Database** → **PostgreSQL**
3. 等待 PostgreSQL 啟動完成
4. 點選 PostgreSQL 服務 → **Variables** 取得連線字串（如 `DATABASE_URL`）

---

## 二、執行 schema 與 seed

### 方式 A：Zeabur 內建 SQL 執行（若有提供）

若 Zeabur PostgreSQL 有提供 SQL 執行介面，依序執行：

1. **`database/hua_internation_schema.sql`**（建立 schema、tables、indexes、trigger）
2. **`database/hua_internation_seed.sql`**（匯入初始資料）

### 方式 B：本地 psql 連線

取得 Zeabur 的 `DATABASE_URL` 或連線資訊後，在本地執行：

```bash
# 1. 建立 schema 與 tables
psql "$DATABASE_URL" -f database/hua_internation_schema.sql

# 2. 匯入資料
psql "$DATABASE_URL" -f database/hua_internation_seed.sql
```

### 方式 C：GUI 工具（TablePlus、DBeaver、pgAdmin）

1. 用 Zeabur 提供的 host、port、user、password 建立連線
2. 新增 Query，貼上 `hua_internation_schema.sql` 內容後執行
3. 再貼上 `hua_internation_seed.sql` 內容後執行

---

## 三、Schema 結構概覽

| Table | 說明 |
|-------|------|
| `hua_internation.members` | 成員主表（no, name, avatar, tags, needs, services） |
| `hua_internation.member_contacts` | 聯絡方式（1:1，line / email / phone） |
| `hua_internation.portfolio_items` | 作品集（1:N，id, title, description, image） |

---

## 四、驗證

執行後可查詢：

```sql
SET search_path TO hua_internation;

SELECT m.no, m.name, mc.line, mc.email, mc.phone
FROM members m
LEFT JOIN member_contacts mc ON m.no = mc.member_no;
```

應可看到 3 筆成員資料。

---

## 五、後續：後端改用 PostgreSQL

若要把現有 JSON 儲存改為 PostgreSQL，需：

1. 安裝 `pg` 或 `postgres` 套件
2. 修改 `backend/src/lib/store.js` 或建立新的 DB 層
3. 將 `readMembers` / `writeMembers` 改為查詢 `hua_internation` schema

此部分需依實際後端架構再規劃實作細節。
