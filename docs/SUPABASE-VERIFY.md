# Supabase 整合檢查清單

## 1. 資料的修改與儲存是否同步

**後台（admin-full.html）**
- [x] **編輯成員**：點「編輯」→ 修改姓名、標籤、需求、服務、聯絡方式 → 點「儲存」→ 會呼叫 `api("/api/members/:no", { method: "PUT", body })` → Supabase `hua_members.update().eq("no", no)`
- [x] **新增成員**：點「＋ 新增成員」→ 填表 → 點「建立成員」→ 會呼叫 `api("/api/members", { method: "POST", body })` → Supabase `hua_members.insert()`

**前端（成員牆）**
- [x] 有設定 `VITE_SUPABASE_URL` 時，`fetchMembers()` 從 Supabase `hua_members` + `hua_member_portfolios` 讀取並組合成 `Member[]`，成員牆會顯示資料庫最新資料。

**如何自測**
1. 開管理後台 `/admin-full.html`，編輯某成員姓名後儲存。
2. 重新整理成員牆首頁，確認姓名已更新。
3. 或開 Supabase Dashboard → Table Editor → `hua_members`，直接看欄位是否已更新。

---

## 2. 照片上傳是否存到資料庫

**形象照（avatar）**
- [x] 後台點「上傳形象照」→ 選圖 → 會呼叫 `api("/api/members/:no/avatar", { method: "POST", body: FormData })`  
  → 上傳到 Storage bucket `hua-diamond-images` 路徑 `avatars/{no}_{timestamp}.{ext}`  
  → 取得 public URL 後寫入 `hua_members.avatar`。

**作品集（portfolio）**
- [x] 後台在成員卡片「新增作品」→ 選圖、標題、描述 → 點「上傳」  
  → 會呼叫 `api("/api/members/:no/portfolio", { method: "POST", body: FormData })`  
  → 上傳到 Storage `portfolio/{no}/{timestamp}.{ext}`  
  → 在 `hua_member_portfolios` 新增一筆（member_no, title, description, image）。

**如何自測**
1. 後台為某成員上傳形象照，重新整理後該成員應顯示頭像。
2. 為該成員新增一筆作品（圖+標題），重新整理後作品集區應多一筆。
3. Supabase：Storage → `hua-diamond-images` 應有檔案；Table Editor → `hua_members.avatar`、`hua_member_portfolios` 應有對應 URL / 新列。

---

## 3. 是否具備刪除功能

- [x] **刪除成員**：後台每張成員卡片有「刪除成員」→ 確認後呼叫 `api("/api/members/:no", { method: "DELETE" })`  
  → 先刪除 `hua_member_portfolios` 中該 member_no 的列，再刪除 `hua_members` 該 no。  
  （DB 外鍵為 ON DELETE CASCADE 時，刪成員會一併刪作品集。）

- [x] **移除形象照**：有頭像時會顯示「移除」→ 確認後呼叫 `api("/api/members/:no/avatar", { method: "DELETE" })`  
  → 將 `hua_members.avatar` 設為 null。

- [x] **刪除作品**：每張作品卡片有「×」刪除鈕 → 確認後呼叫 `api("/api/members/:no/portfolio/:id", { method: "DELETE" })`  
  → 從 `hua_member_portfolios` 刪除該 id 列。

**如何自測**
1. 刪除一筆作品，重新整理後該作品消失，Supabase `hua_member_portfolios` 少一筆。
2. 移除某成員形象照，重新整理後頭像消失，`hua_members.avatar` 為 null。
3. 刪除某成員，重新整理後該成員消失，`hua_members` 與其作品集列一併移除。

---

## 環境需求

- `.env` 或部署環境變數需有：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- 管理後台為靜態 HTML，Supabase URL/Key 寫在 `admin-full.html` 內（或由 `window.__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__` 覆寫）。

完成以上三項自測即代表：**資料修改與儲存有同步、照片有存到資料庫、刪除功能齊全。**
