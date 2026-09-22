/**
 * 活動花絮後台 — Google Apps Script
 *
 * 用途：
 *   - doGet  提供「活動花絮」頁面讀取已發布(published)的活動清單 (JSON)
 *   - doPost 接收 admin.html 表單送出的請求，依 action 分流：
 *       action 省略或 "create"：新增一筆活動，直接設為 published
 *       action "list"         ：列出全部活動（供後台編輯清單使用，需通關密語）
 *       action "update"       ：依 id 更新既有活動欄位（需通關密語）
 *       action "delete"       ：依 id 刪除一筆活動（需通關密語）
 *
 * 安裝步驟請見專案 README.md「後台設定」章節。
 */

const SHEET_NAME = "活動花絮";      // 試算表分頁名稱，請與您建立的分頁名稱一致
const EXPECTED_PIN = "ttfd119";     // 需與 js/config.js 裡的 ADMIN_PIN 保持一致

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
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
  const sheet = getSheet_();
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

    const action = data.action || "create";
    if (action === "list") return handleList_();
    if (action === "update") return handleUpdate_(data);
    if (action === "delete") return handleDelete_(data);
    return handleCreate_(data);
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function handleCreate_(data) {
  if (!data.title || !data.date || !data.driveFolderId) {
    return jsonOutput_({ ok: false, error: "缺少必要欄位" });
  }
  const sheet = getSheet_();
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

function handleList_() {
  const sheet = getSheet_();
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

function handleUpdate_(data) {
  if (!data.id) return jsonOutput_({ ok: false, error: "缺少 id" });
  const sheet = getSheet_();
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
  return jsonOutput_({ ok: false, error: "找不到該筆活動" });
}

function handleDelete_(data) {
  if (!data.id) return jsonOutput_({ ok: false, error: "缺少 id" });
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const idx = getHeaderIndex_(values[0]);

  for (let i = 1; i < values.length; i++) {
    if (values[i][idx.id] === data.id) {
      sheet.deleteRow(i + 1);
      return jsonOutput_({ ok: true });
    }
  }
  return jsonOutput_({ ok: false, error: "找不到該筆活動" });
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
