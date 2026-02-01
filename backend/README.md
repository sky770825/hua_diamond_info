# 後端 API（獨立運行）

成員牆後端：成員 CRUD、作品集、圖片上傳；**負責編輯**，提供管理介面。

## 環境

- Node.js 18+
- 依賴見 `package.json`

## 安裝與運行

```bash
cd backend
npm install
npm run dev
```

API 預設運行於 **http://localhost:3001**。可設 `PORT` 改變埠號。

## 管理後台（編輯用）

- **http://localhost:3001/admin** （或 `/admin.html`）
- 功能：**新增成員**（含聯絡方式）、**編輯成員**（姓名、標籤、需求、服務、聯絡）、**刪除成員**、上傳／移除形象照、**新增作品**（卡片式）、刪除作品
- 僅後端提供編輯；前端為唯讀展示。

## API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/health` | 健康檢查 |
| GET | `/api/members` | 取得所有成員 |
| POST | `/api/members` | 新增成員（JSON: `no`, `name`, `tags`, `needs`, `services`） |
| GET | `/api/members/:no` | 取得單一成員 |
| PUT | `/api/members/:no` | 更新成員 |
| DELETE | `/api/members/:no` | 刪除成員 |
| POST | `/api/members/:no/avatar` | 上傳形象照（multipart: `image`） |
| DELETE | `/api/members/:no/avatar` | 移除形象照 |
| POST | `/api/members/:no/portfolio` | 新增作品（multipart: `image`, `title`, `description`） |
| DELETE | `/api/members/:no/portfolio/:id` | 刪除作品 |

圖片儲存於 `uploads/`，經 `/uploads/:filename` 靜態提供。

## 資料

- `data/members.json`：成員與作品集資料（會隨 API 寫入更新）。成員可含選填 `contact: { line?, email?, phone? }`，供前端詳情頁聯絡 CTA 使用；可經 `PUT /api/members/:no` 更新。

---

## 模組化結構（維護與管理）

```
backend/src/
├── config/           # 設定（埠號、路徑、上傳限制）
├── lib/
│   ├── store.js      # 資料：members.json 讀寫
│   └── imageStorage.js  # 圖片：上傳 multer、刪除檔案
├── services/
│   ├── memberService.js   # 資料：成員 CRUD
│   └── portfolioService.js  # 資料＋圖片：作品新增／刪除
├── routes/
│   └── members.js    # HTTP 路由，委派 services
└── index.js
```

- **資料建檔**：`store` ＋ `memberService` / `portfolioService`；路由只轉發。
- **圖片建檔**：`imageStorage`（存檔、刪除）＋ `portfolioService`（關聯成員與作品）；與一般資料分離。
- 修改設定 → `config`；改儲存方式 → `lib`；改業務邏輯 → `services`；改 API 形狀 → `routes`。
