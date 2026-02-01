# Cloudflare Pages 部署｜hua_diamond_info

本文說明如何將 **前端** 從 GitHub 同步部署到 Cloudflare Pages。

---

## 一、前置條件

- GitHub repo 已存在：**https://github.com/sky770825/hua_diamond_info**
- 後端 API 需已部署（例如 Zeabur），並取得 **生產環境 API 網址**

---

## 二、在 Cloudflare 建立 Pages 專案

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左側選 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 選擇 **GitHub**，授權 Cloudflare 存取你的 GitHub
4. 選擇 repository：**sky770825/hua_diamond_info**
5. 點 **Begin setup**

---

## 三、建置設定

在 **Build configuration** 填寫：

| 欄位 | 值 |
|------|-----|
| **Project name** | `hua-diamond-info`（或自訂，會變成 `xxx.pages.dev`） |
| **Production branch** | `main` |
| **Framework preset** | `Vite`（或選 None 手動填下方） |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | 留空（專案在 repo 根目錄） |

---

## 四、環境變數（必設）

前端在生產環境需要知道後端 API 網址。

1. 在專案 **Settings** → **Environment variables**
2. 新增變數：

| 變數名稱 | 值 | 環境 |
|----------|-----|------|
| **VITE_API_URL** | 你的後端 API 網址（例如 Zeabur 後端 URL） | Production（與 Preview 若需要） |

範例（請改成你的後端網址）：

- `https://你的後端.pages.dev`  
- 或 `https://你的後端.zeabur.app`  
- **不要**在結尾加 `/`

若未設定，前端會用相對路徑 `/api`，在 Cloudflare Pages（純靜態）會 404。

---

## 五、儲存並部署

1. 點 **Save and Deploy**
2. 等待建置完成（約 1–3 分鐘）
3. 完成後會得到網址：`https://hua-diamond-info.pages.dev`（或你設的 project name）

之後每次 **push 到 `main`**，Cloudflare 會自動重新建置並部署。

---

## 六、自訂網域（選用）

1. 專案 **Custom domains** → **Set up a custom domain**
2. 輸入你的網域，依指示到 DNS 新增 CNAME 指向 `xxx.pages.dev`

---

## 七、注意事項

- **目前只部署前端**：Cloudflare Pages 只負責靜態檔（Vite build 的 `dist`）
- **後端**需另外部署（例如 Zeabur、Railway），並在 **VITE_API_URL** 填該後端網址
- 後端需開啟 **CORS** 允許你的 Pages 網域（例如 `https://hua-diamond-info.pages.dev`）
