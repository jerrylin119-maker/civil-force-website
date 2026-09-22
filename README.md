# 臺東縣消防局義消總隊 官方網站

純 HTML / CSS / JavaScript 靜態網站，無需伺服器端程式，包含三大頁面：

- `index.html`　首頁 / 組織介紹（沿革、組織架構、聯絡方式）
- `plans.html`　年度計畫及活動公布
- `gallery.html`　活動花絮（直接串接 Google 雲端硬碟資料夾相片）

## 檔案結構

```
civil_force_website/
├── index.html
├── plans.html
├── gallery.html
├── css/style.css
├── js/main.js
├── data/
│   ├── plans.json       # 年度計畫、活動公告內容
│   └── activities.json  # 活動花絮清單（含 Google Drive 資料夾 ID）
└── images/
```

## 本機預覽

不需要安裝任何套件。用瀏覽器直接開啟 `index.html` 即可，或用簡易伺服器預覽（建議，避免部分瀏覽器封鎖本機讀取 JSON）：

```bash
cd civil_force_website
python -m http.server 8000
```

再到瀏覽器輸入 `http://localhost:8000`。

## 如何修改內容（不需寫程式）

| 想改的內容 | 修改檔案 |
| --- | --- |
| 組織介紹文字、沿革、組織架構、聯絡方式 | `index.html`（直接找對應文字修改） |
| 年度重點工作計畫、活動公告 | `data/plans.json` |
| 活動花絮相簿清單 | `data/activities.json` |
| 網站配色、版面 | `css/style.css` |

`data/plans.json` 範例：

```json
{
  "annualGoals": [
    {
      "title": "常年訓練精實計畫",
      "period": "2026年1月 - 2026年12月",
      "status": "ongoing",
      "description": "計畫說明文字..."
    }
  ],
  "announcements": [
    {
      "title": "115年度義消常年訓練實施計畫公告",
      "date": "2026-03-15",
      "status": "upcoming",
      "description": "公告說明文字...",
      "link": ""
    }
  ]
}
```

`status` 可填 `upcoming`（即將舉行）、`ongoing`（辦理中）、`done`（已完成）。

## 活動花絮如何串接 Google 雲端硬碟（重點功能）

不需要上傳相片到本網站，只要把相片放進 Google 雲端硬碟資料夾，網站就會自動顯示。

### 步驟

1. **在 Google 雲端硬碟建立資料夾**，每個活動建議各自一個資料夾，例如「115年常年訓練」，把該場活動的相片全部放進去。
2. **設定分享權限**：滑鼠右鍵點資料夾 → 共用 → 一般存取權 改為「**知道連結的任何人**」，角色設為「**檢視者**」。
   > ⚠️ 這代表任何拿到連結的人都能看到資料夾內容，請勿把不宜公開的相片放進同一資料夾。
3. **複製資料夾網址**，網址長相如下：
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456
   ```
   `folders/` 後面那一長串英數字就是「資料夾 ID」。
4. 打開 `data/activities.json`，新增一筆資料，把資料夾 ID 貼到 `driveFolderId`：
   ```json
   [
     {
       "id": "2026-spring-training",
       "title": "115年度春季常年訓練",
       "date": "2026-03-15",
       "description": "本次訓練聚焦水域救援與心肺復甦術操作演練。",
       "driveFolderId": "1AbCdEfGhIjKlMnOpQrStUvWxYz0123456"
     }
   ]
   ```
5. 儲存後重新整理 `gallery.html`，該活動即會出現在花絮清單中，點開就能看到 Google 雲端硬碟資料夾內的相片縮圖，點縮圖可放大瀏覽。

### 之後新增活動花絮

以後每次辦完活動，只需要：

1. 在 Google 雲端硬碟新增一個資料夾、上傳相片、設定「知道連結者可檢視」。
2. 在 `data/activities.json` 多加一筆物件（複製既有格式，換掉標題、日期、說明、資料夾 ID）。

不需要修改任何 HTML / CSS / JS 程式碼。

## 部署到網路上（免費，任何人皆可瀏覽）

推薦使用 **GitHub Pages**：

1. 將本資料夾內容上傳到一個 GitHub Repository。
2. 到 Repository 的 **Settings → Pages**，Source 選擇 `main` 分支、根目錄 `/`。
3. 幾分鐘後即可取得公開網址（例如 `https://your-account.github.io/civil_force_website/`）。

也可使用 Netlify、Cloudflare Pages 等靜態網站託管服務，作法類似（拖曳資料夾即可部署）。

## 注意事項

- 目前所有文字內容（組織介紹、沿革、聯絡資訊、統計數字等）皆為**範例佔位文字**，請務必替換為貴總隊實際資料後再對外公開。
- Google 雲端硬碟內嵌相簿的外觀由 Google 提供，樣式無法客製化，但操作簡單、免維護。若日後想要更精緻的相簿排版，可考慮改用 Google Drive API 搭配自訂版面（需要申請 API 金鑰）。
