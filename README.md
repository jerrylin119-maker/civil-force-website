# 台東縣義勇消防總隊 官方網站

純 HTML / CSS / JavaScript 靜態網站，無需伺服器端程式，包含五個頁面：

- `index.html`　首頁 / 組織介紹（沿革、組織架構、聯絡方式）
- `plans.html`　年度計畫及活動公布
- `gallery.html`　活動花絮（直接串接 Google 雲端硬碟資料夾相片）
- `disaster.html`　重大災害支援實錄（與活動花絮相同機制，另一個分類）
- `admin.html`　**同仁後台**：不用編輯 JSON，直接在網頁上填表單新增／編輯／刪除活動花絮與重大災害支援實錄（需先完成下方「後台設定」）

## 檔案結構

```
civil_force_website/
├── index.html
├── plans.html
├── gallery.html
├── disaster.html
├── admin.html            # 同仁後台表單頁面（活動花絮／重大災害支援實錄共用）
├── admin/
│   └── apps-script.gs    # 貼到 Google Apps Script 的後台程式碼
├── .github/workflows/
│   └── keep-alive.yml    # 定時喚醒 Apps Script，避免冷啟動延遲
├── css/style.css
├── js/
│   ├── config.js         # 後台網址、通關密語設定
│   ├── main.js
│   └── admin.js
├── data/
│   ├── plans.json       # 年度計畫、活動公告內容
│   ├── activities.json  # 活動花絮清單（未設定後台試算表時使用的預設資料來源）
│   └── disasters.json   # 重大災害支援實錄清單（未設定後台試算表時使用的預設資料來源）
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
| 活動花絮相簿清單 | 完成「後台設定」後可直接用 `admin.html` 表單新增／編輯／刪除，或手動編輯 `data/activities.json` |
| 重大災害支援實錄清單 | 完成「後台設定」後在 `admin.html` 切換到「重大災害支援實錄」頁籤操作，或手動編輯 `data/disasters.json` |
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

不需要上傳相片到本網站，只要把相片放進 Google 雲端硬碟資料夾，網站就會自動顯示。以下步驟以「活動花絮」為例，「重大災害支援實錄」（`disaster.html`）作法完全相同，只是在 `admin.html` 送出時記得切換到「🚨 重大災害支援實錄」頁籤。

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

**方法一：用同仁後台表單（推薦，完成下方「後台設定」後可用）**

1. 在 Google 雲端硬碟新增一個資料夾、上傳相片、設定「知道連結者可檢視」。
2. 開啟 `admin.html`，輸入通關密語，填寫活動名稱／日期／說明／雲端硬碟資料夾連結後送出。
3. 送出後會直接設為 `published`，活動花絮頁面立即顯示（約數秒內生效，重新整理頁面即可看到），不需要另外到試算表核准。

**送錯資料要怎麼改？** 不用去 Google 試算表手動改欄位——直接在 `admin.html` 輸入通關密語進入後台，畫面上方「現有活動花絮」清單會列出全部已送出的活動，每一筆都有「✏️ 編輯」與「🗑️ 刪除」按鈕。點編輯會把資料帶入下方表單，改完連結或其他欄位後按「更新活動花絮」即可，活動花絮頁面立即生效，不需要重新部署網站、也不用碰試算表。

**方法二：手動編輯 JSON（不需額外設定，適合網站管理者自己維護）**

1. 在 Google 雲端硬碟新增一個資料夾、上傳相片、設定「知道連結者可檢視」。
2. 在 `data/activities.json` 多加一筆物件（複製既有格式，換掉標題、日期、說明、資料夾 ID）。

兩種方法都不需要修改任何 HTML / CSS / JS 程式碼。

## 後台設定（讓同仁可直接在網頁上新增活動，不用編輯程式檔）

後台採用「Google 試算表 + Apps Script」架構：同仁在 `admin.html` 填表單送出後，資料會直接寫進您自己的 Google 試算表並設為公開；`gallery.html`（活動花絮）與 `disaster.html`（重大災害支援實錄）則分別讀取試算表裡對應分頁中狀態為 `published` 的資料。兩個分類共用同一份試算表、同一支 Apps Script，`admin.html` 上方有分類切換頁籤可以來回編輯。**完全不需要租用伺服器，全程免費**，但需要您（或熟悉 Google 試算表的同仁）花約 10 分鐘做一次性設定：

1. **建立 Google 試算表**：到 [Google 試算表](https://sheets.google.com) 新增一份空白試算表，例如命名「義消總隊活動花絮後台」。「活動花絮」與「重大災害支援實錄」兩個分頁會在第一次使用時自動建立，不用手動新增。
2. **貼上後台程式碼**：試算表選單「擴充功能 → Apps Script」，把本專案 `admin/apps-script.gs` 的內容整份貼進去（覆蓋預設的 `Code.gs` 內容），按儲存（磁片圖示）。
3. **設定通關密語**：
   - 在 `apps-script.gs` 開頭的 `EXPECTED_PIN` 改成您要的密語。
   - 同步修改本專案 `js/config.js` 裡的 `ADMIN_PIN`，兩邊必須完全一致。
4. **部署為網頁應用程式**：Apps Script 編輯器右上角「部署 → 新增部署作業」：
   - 類型選「網頁應用程式」
   - 執行身分：我（您的帳號）
   - 誰可以存取：**任何人**
   - 按「部署」，過程中會跳出 Google 帳號授權畫面，選擇您的帳號並允許權限。
   - 完成後會得到一組網址，長得像 `https://script.google.com/macros/s/AKfycb.../exec`，複製起來。
5. **把網址填進網站設定**：打開 `js/config.js`，把剛複製的網址貼到 `SHEET_API_URL`。
6. 重新整理 `admin.html` 與 `gallery.html`，即可開始使用。表單送出的新活動會直接設為 `published`，立即出現在公開的活動花絮頁面——因為表單本身已有通關密語把關，這裡就不再另外設計人工審核步驟。若您日後想改回「需人工核准才公開」，把 `admin/apps-script.gs` 的 `doPost` 裡 `"published"` 改回 `"pending"` 並重新部署即可，`doGet` 只回傳 `published` 的邏輯不用改。

> 💡 之後如果要更新後台程式邏輯，只要修改 Apps Script 裡的程式碼後重新「管理部署作業 → 編輯 → 部署」即可，網址不會變動。
>
> ⚠️ `admin.html` 的通關密語只是給同仁使用上的一層基本防護，並非嚴謹的帳號權限系統；請勿把 `admin.html` 的連結放在公開導覽列或對外公告，僅私下告知需要使用後台的同仁即可。

## 避免後台冷啟動延遲（GitHub Actions 定時喚醒）

Google Apps Script 網頁應用程式如果一段時間沒人呼叫，下一次讀取（例如訪客打開活動花絮頁面）可能會多等個幾秒才有回應，這是 Google 那端的正常現象。

本專案內建 `.github/workflows/keep-alive.yml`，只要您的網站程式碼是放在 **GitHub Repository** 裡（就是「部署到網路上」那一步用的同一個 Repo），GitHub 會自動每 10 分鐘左右呼叫一次後台網址，讓它保持在「熱」的狀態，訪客實際感受到的延遲會少很多。**不需要額外設定**，程式碼一推上 GitHub 就會自動啟用；可以到 Repository 的 **Actions** 分頁看執行紀錄，或手動點 **Run workflow** 立即觸發一次。

> 💡 GitHub 的排程本身不保證分秒不差，實際間隔可能是 10～20 分鐘，屬正常現象，不影響效果。
>
> ⚠️ 如果您把 `SHEET_API_URL` 換成別份試算表對應的新網址，記得也要同步修改 `.github/workflows/keep-alive.yml` 裡呼叫的網址。

## 部署到網路上（免費，任何人皆可瀏覽）

推薦使用 **GitHub Pages**：

1. 將本資料夾內容上傳到一個 GitHub Repository。
2. 到 Repository 的 **Settings → Pages**，Source 選擇 `main` 分支、根目錄 `/`。
3. 幾分鐘後即可取得公開網址（例如 `https://your-account.github.io/civil_force_website/`）。

也可使用 Netlify、Cloudflare Pages 等靜態網站託管服務，作法類似（拖曳資料夾即可部署）。

## 注意事項

- 目前所有文字內容（組織介紹、沿革、聯絡資訊、統計數字等）皆為**範例佔位文字**，請務必替換為貴總隊實際資料後再對外公開。
- Google 雲端硬碟內嵌相簿的外觀由 Google 提供，樣式無法客製化，但操作簡單、免維護。若日後想要更精緻的相簿排版，可考慮改用 Google Drive API 搭配自訂版面（需要申請 API 金鑰）。
