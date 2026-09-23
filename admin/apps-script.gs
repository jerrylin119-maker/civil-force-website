/**
 * 活動花絮／重大災害支援實錄 後台 — Google Apps Script
 *
 * 同一份程式碼同時服務兩種「相簿型」清單，各自存在獨立的試算表分頁：
 *   type "activity" → 分頁「活動花絮」
 *   type "disaster" → 分頁「重大災害支援實錄」
 *
 * 用途：
 *   - doGet  提供對外頁面讀取已發布(published)的清單 (JSON)，用 ?type= 區分分類
 *   - doPost 接收 admin.html 表單送出的請求，依 action 分流：
 *       action 省略或 "create"：新增一筆資料，直接設為 published
 *       action "list"         ：列出該分類全部資料（供後台編輯清單使用，需通關密語）
 *       action "update"       ：依 id 更新既有資料欄位（需通關密語）
 *       action "delete"       ：依 id 刪除一筆資料（需通關密語）
 *     皆以 data.type / e.parameter.type 指定分類，省略時預設為 "activity"。
 *
 * 安裝步驟請見專案 README.md「後台設定」章節。
 */

const SHEET_NAMES = {
  activity: "活動花絮",
  disaster: "重大災害支援實錄"
};
const EXPECTED_PIN = "ttfd119";     // 需與 js/config.js 裡的 ADMIN_PIN 保持一致

function resolveSheetName_(type) {
  return SHEET_NAMES[type] || SHEET_NAMES.activity;
}

function getSheet_(type) {
  const name = resolveSheetName_(type);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["id", "title", "date", "description", "driveFolderId", "status", "submittedAt"]);
  }
  return sheet;
}

function getHeaderIndex_(headers) {
  return {
    id: headers.indexOf("id"),
    title: headers.indexOf("title"),
    date: headers.indexOf("date"),
    description: headers.indexOf("description"),
    driveFolderId: headers.indexOf("driveFolderId"),
    status: headers.indexOf("status"),
    submittedAt: headers.indexOf("submittedAt")
  };
}

function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || "activity";
  const sheet = getSheet_(type);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const idx = getHeaderIndex_(headers);

  const rows = values
    .filter((row) => String(row[idx.status]).trim() === "published")
    .map((row) => ({
      title: row[idx.title],
      date: formatDate_(row[idx.date]),
      description: row[idx.description],
      driveFolderId: row[idx.driveFolderId]
    }));

  return jsonOutput_(rows);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.pin !== EXPECTED_PIN) {
      return jsonOutput_({ ok: false, error: "通關密語錯誤" });
    }

    const type = data.type || "activity";
    const action = data.action || "create";
    if (action === "list") return handleList_(type);
    if (action === "update") return handleUpdate_(type, data);
    if (action === "delete") return handleDelete_(type, data);
    return handleCreate_(type, data);
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function handleCreate_(type, data) {
  if (!data.title || !data.date || !data.driveFolderId) {
    return jsonOutput_({ ok: false, error: "缺少必要欄位" });
  }
  const sheet = getSheet_(type);
  sheet.appendRow([
    Utilities.getUuid(),
    data.title,
    data.date,
    data.description || "",
    data.driveFolderId,
    "published",
    new Date()
  ]);
  return jsonOutput_({ ok: true });
}

function handleList_(type) {
  const sheet = getSheet_(type);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const idx = getHeaderIndex_(headers);

  const rows = values
    .map((row) => ({
      id: row[idx.id],
      title: row[idx.title],
      date: formatDate_(row[idx.date]),
      description: row[idx.description],
      driveFolderId: row[idx.driveFolderId],
      status: row[idx.status]
    }))
    .filter((r) => r.id);

  return jsonOutput_({ ok: true, items: rows });
}

function handleUpdate_(type, data) {
  if (!data.id) return jsonOutput_({ ok: false, error: "缺少 id" });
  const sheet = getSheet_(type);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idx = getHeaderIndex_(headers);

  for (let i = 1; i < values.length; i++) {
    if (values[i][idx.id] === data.id) {
      const rowNum = i + 1; // 1-based, +1 for header
      if (data.title !== undefined) sheet.getRange(rowNum, idx.title + 1).setValue(data.title);
      if (data.date !== undefined) sheet.getRange(rowNum, idx.date + 1).setValue(data.date);
      if (data.description !== undefined) sheet.getRange(rowNum, idx.description + 1).setValue(data.description);
      if (data.driveFolderId !== undefined) sheet.getRange(rowNum, idx.driveFolderId + 1).setValue(data.driveFolderId);
      if (data.status !== undefined) sheet.getRange(rowNum, idx.status + 1).setValue(data.status);
      return jsonOutput_({ ok: true });
    }
  }
  return jsonOutput_({ ok: false, error: "找不到該筆資料" });
}

function handleDelete_(type, data) {
  if (!data.id) return jsonOutput_({ ok: false, error: "缺少 id" });
  const sheet = getSheet_(type);
  const values = sheet.getDataRange().getValues();
  const idx = getHeaderIndex_(values[0]);

  for (let i = 1; i < values.length; i++) {
    if (values[i][idx.id] === data.id) {
      sheet.deleteRow(i + 1);
      return jsonOutput_({ ok: true });
    }
  }
  return jsonOutput_({ ok: false, error: "找不到該筆資料" });
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return value;
}
