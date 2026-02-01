# Cloudflare Pages 部署｜全 CLI 自動化

本專案使用 **Wrangler CLI** 一鍵建置並部署到 Cloudflare Pages，無需手動在 Dashboard 操作。

---

## 首次部署必讀（專案尚未建立時）

Cloudflare Pages **專案必須先存在**，`npm run deploy` 或 GitHub Actions 才會成功。Wrangler 無法在無互動環境（如 CI）自動建立專案，請在本機做一次以下任一方式：

| 方式 | 作法 |
|------|------|
| **A. 先建立專案** | 執行 `npx wrangler login` 後，執行 `npx wrangler pages project create`，依提示輸入 **Project name:** `hua-diamond-info`、**Production branch:** `main`。 |
| **B. 用 deploy 建立** | 執行 `npx wrangler login` 後，執行 `npm run deploy`；若出現「Project not found... Would you like to create it?」，選擇 **Create a new project**，專案名稱會用 `wrangler.toml` 的 `hua-diamond-info`。 |

完成任一步驟後，之後在本機執行 `npm run deploy` 或透過 GitHub Actions 推送都會正常部署。

---

## 一、前置（只需做一次）

### 1. 登入 Cloudflare

```bash
npx wrangler login
```

瀏覽器會開啟，登入 Cloudflare 帳號並授權 Wrangler。

### 2. 建立 Pages 專案（首次部署時）

若尚未建立專案，可先手動建立（見上方「首次部署必讀」），或執行：

```bash
npx wrangler pages project create
# 依提示輸入 Project name: hua-diamond-info
# Production branch: main
```

---

## 二、部署指令

### 一般部署（使用目前環境的 VITE_API_URL）

```bash
npm run deploy
```

等同於：

1. `npm run build`（產出 `dist/`）
2. `wrangler pages deploy dist --project-name=hua-diamond-info`

### 指定後端 API 網址再部署

建置時需帶入生產環境 API 網址時：

```bash
VITE_API_URL=https://你的後端網址 npm run deploy
```

例如後端在 Zeabur：

```bash
VITE_API_URL=https://你的服務.zeabur.app npm run deploy
```

**注意**：`VITE_API_URL` 不要加結尾 `/`。

---

## 三、可用指令一覽

| 指令 | 說明 |
|------|------|
| `npm run deploy` | 建置 + 部署到 Cloudflare Pages |
| `npm run deploy:pages` | 同上 |
| `npx wrangler login` | 登入 Cloudflare（首次） |
| `npx wrangler pages project create` | 建立 Pages 專案（首次可選） |
| `npx wrangler pages project list` | 列出 Pages 專案 |
| `npx wrangler pages deployment list` | 列出某專案部署紀錄 |

---

## 四、CI / GitHub Actions 自動部署（已設定）

Push 到 `main` 時會自動建置並部署到 Cloudflare Pages（workflow：`.github/workflows/deploy-cloudflare-pages.yml`）。

### 需設定的 GitHub Secrets

在 repo **Settings** → **Secrets and variables** → **Actions** 新增：

| Secret 名稱 | 必填 | 說明 |
|-------------|------|------|
| **CLOUDFLARE_API_TOKEN** | 是 | Cloudflare API Token，權限：Account / Cloudflare Pages / Edit |
| **CLOUDFLARE_ACCOUNT_ID** | 是 | Cloudflare 帳號 ID（Dashboard 右側 API 區塊） |
| **VITE_API_URL** | 否 | 生產環境後端 API 網址（未設則建置時前端用相對路徑） |

取得 API Token： [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token → 選 **Cloudflare Pages - Edit**。

---

## 五、注意事項

- **建置在本機執行**：`VITE_API_URL` 需在執行 `npm run deploy` 時以環境變數傳入。
- **後端 CORS**：後端需允許你的 Pages 網域（例如 `https://hua-diamond-info.pages.dev`）。
- 部署完成後網址為：**https://hua-diamond-info.pages.dev**（若專案名稱有改則以實際名稱為準）。
