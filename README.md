# 資訊組｜成員牆

前端與後端**獨立分開**，可分別安裝、運行與部署。

---

## 專案結構與職責

| 位置 | 說明 |
|------|------|
| **根目錄（前端）** | 唯讀展示：成員牆、**形象照**、作品集圖片。**無**匯出 JSON、**無**編輯。 |
| **`backend/`（後端）** | API + **管理後台**（`/admin`）：可編輯成員、**上傳／移除形象照**、新增／刪除作品、圖片上傳。 |

---

## 模組化結構（維護與管理）

### 前端 `src/`

| 模組 | 路徑 | 職責 |
|------|------|------|
| **API** | `api/client`、`api/members`、`api/images` | 請求基礎、成員 API、圖片網址；與後端介面分離。 |
| **資料與型別** | `data/types`、`data/tags` | `Member`／`PortfolioItem` 型別、`getAllTags`；**資料建檔**相關型別集中在此。 |
| **篩選** | `lib/filters` | `filterMembers` 搜尋／標籤邏輯，與 UI 解耦。 |
| **Hooks** | `hooks/useMembers` | 成員列表載入、重新整理、loading／error；供頁面與按鈕共用。 |
| **按鈕（動作）** | `components/actions` | `RefreshButton`、`ClearFiltersButton`；**按鈕**統一由 `actions` 管理。 |
| **成員 UI** | `components/members` | `MemberCard`、`MemberDetailDialog`；展示與作品集**圖片**顯示。 |
| **頁面** | `pages/Index` | 組合上述模組，不含業務細節。 |

- **按鈕**：一律經 `components/actions`，修改行為或樣式時只動此層。
- **資料建檔**：型別與標籤在 `data/`；前端唯讀，實際建檔在後端。
- **圖片**：`api/images` 負責圖片網址；作品集展示在 `members` 元件。

### 後端 `backend/src/`

| 模組 | 路徑 | 職責 |
|------|------|------|
| **設定** | `config` | 埠號、資料路徑、上傳目錄、檔案大小限制。 |
| **儲存** | `lib/store`、`lib/imageStorage` | **資料**：讀寫 `members.json`；**圖片**：上傳、刪除、multer 設定。 |
| **服務** | `services/memberService`、`services/portfolioService` | **資料**：成員 CRUD；**圖片建檔**：作品新增／刪除，呼叫 store ＋ imageStorage。 |
| **路由** | `routes/members` | HTTP 層，委派給 services；不含業務邏輯。 |

- **資料建檔**：`store` ＋ `memberService`／`portfolioService`；路由只轉發。
- **圖片建檔**：`imageStorage`（存檔／刪除）＋ `portfolioService`（關聯成員）；與一般資料分離。
- 詳見 [`backend/README.md`](backend/README.md)。

- **設計分析與改善建議**：見 [`docs/DESIGN-ANALYSIS.md`](docs/DESIGN-ANALYSIS.md)（視覺、資訊架構、互動、a11y、內容、效能等可加強項目與優先順序）。

---

## 1. 後端（獨立運行）

```bash
cd backend
npm install
npm run dev
```

- API 預設：**http://localhost:3000**
- 詳見 [`backend/README.md`](backend/README.md)

---

## 2. 前端（唯讀展示）

```bash
# 在專案根目錄
npm install
npm run dev
```

- 前端預設：**http://localhost:8080**
- 需設定後端 API 網址（見下方環境變數）

### 環境變數

複製 `.env.example` 為 `.env`，並依實際後端網址調整：

```bash
cp .env.example .env
```

| 變數 | 說明 |
|------|------|
| `VITE_API_URL` | 後端 API 根網址，例如 `http://localhost:3000`。未設定時預設 `http://localhost:3000` |

---

## 可正常開啟的運行方式

### 開發時（前後端同時跑）

**方式一（一鍵）**：根目錄執行 `npm run dev:all`，會同時啟動前端與後端。

**方式二（分開兩個終端）**：
1. 終端一：`cd backend && npm install && npm run dev`
2. 終端二：根目錄 `npm install && npm run dev`

- **前端（唯讀）**：http://localhost:8080（可點「重新整理」重抓列表）
- **後端管理（編輯）**：http://localhost:3000/admin

### 前端僅靜態建置

```bash
npm run build
npm run preview
```

預覽時仍會向 `VITE_API_URL` 發請求，請確保後端可連線。

---

## RWD 與人體工學（響應式設計）

針對 **iPhone 11 / 16、平板、桌面** 與 **RWD** 優化，兼顧閱讀與觸控舒適度：

| 項目 | 說明 |
|------|------|
| **Viewport** | `width=device-width, initial-scale=1, viewport-fit=cover`；支援劉海／安全區域。 |
| **字級** | `html` 16px、`-webkit-text-size-adjust: 100%`；輸入框 ≥16px 避免 iOS 縮放。 |
| **Container** | 響應 padding：手機 1rem → sm 1.5rem → lg 2rem；`env(safe-area-inset-*)` 適配缺口機。 |
| **斷點** | `xs: 375`、`sm: 640`、`md: 768`、`lg: 1024`、`xl: 1280`、`2xl: 1536`。 |
| **網格** | 1 欄（手機）→ sm 2 欄 → lg 3 欄 → 2xl 4 欄；間距 `gap-4` → `gap-6` 隨斷點調整。 |
| **觸控** | 按鈕／篩選標籤 ≥44×44px（Apple HIG）；`touch-manipulation` 減少點擊延遲。 |
| **彈窗** | 手機 `max-w-[calc(100vw-2rem)]`、`max-h-[80vh]`；平板以上 `max-w-2xl`、`max-h-[85vh]`。 |

---

## 已補強項目

- **形象照片**：成員支援 `avatar` 欄位；卡片與詳情顯示形象照，無則顯示姓名縮寫。後台可上傳／移除。
- **聯絡 CTA**：成員可設 `contact`（line / email / phone）；詳情頁顯示 LINE、Email、電話按鈕。
- **排序**：依姓名、編號、作品數排序；**分享**複製 `/?member=no`，開啟連結可直開該成員詳情。
- **體驗**：初載 **skeleton** 卡片、搜尋 **debounce**、作品圖 **lazy**、卡片 tag **點擊套篩選**、**尚無成員**空狀態；標籤顯示**數量**「(N)」；**列印**時僅保留標題與卡片。
- **a11y**：**跳到主內容** skip link、`focus-ring`、篩選鍵盤可操作、作品集 **alt** 優化。
- **RWD**：見上表；適用 iPhone、iPad、桌面與視窗縮放。
- 前端：**重新整理**按鈕、載入失敗**重試**、重整時列表不消失。
- 根目錄 **`npm run dev:all`** 一鍵同時跑前後端。
- 後台：成員卡片**多欄網格**、上傳時按鈕**「上傳中…」**、成功顯示**「已新增」**、載入失敗**重試**按鈕。

---

## 建議後續調整（可選）

| 項目 | 說明 |
|------|------|
| **管理後台登入** | `/admin` 目前無驗證，若對外開放建議加簡易登入（如 HTTP Basic Auth）。 |
| **成員編輯** | 後台目前僅能新增／刪除作品集；要改姓名、標籤等需改 `data/members.json` 或擴充 API＋表單。 |
| **後台搜尋** | 成員變多時可加依姓名／編號搜尋，方便快速找到要編輯的卡片。 |
| **資料備份** | 定期備份 `backend/data/members.json`、`backend/uploads/`，或加匯出／匯入 API。 |
| **上線環境** | 設定 `NODE_ENV=production`、限制 CORS、`VITE_API_URL` 指到正式 API 網址。 |

---

## 其餘說明

- 無法用瀏覽器直接開啟 `index.html`（`file://`），須透過上述指令運行。
- 技術：Vite、TypeScript、React、shadcn-ui、Tailwind CSS（前端）；Express、multer（後端）。
