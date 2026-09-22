/**
 * 活動花絮後台 — Google Apps Script
 *
 * 用途：
 *   - doGet  提供「活動花絮」頁面讀取已發布(published)的活動清單 (JSON)
 *   - doPost 接收 admin.html 表單送出的新活動，寫入試算表並直接設為
 *            published，立即顯示在公開的活動花絮頁面（表單本身已有
 *            通關密語把關，故不再另設人工審核步驟）。
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

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const idx = {
    title: headers.indexOf("title"),
    date: headers.indexOf("date"),
    description: headers.indexOf("description"),
    driveFolderId: headers.indexOf("driveFolderId"),
    status: headers.indexOf("status")
  };

  const rows = values
    .filter((row) => String(row[idx.status]).trim() === "published")
    .map((row) => ({
      title: row[idx.title],
      date: formatDate_(row[idx.date]),
      description: row[idx.description],
      driveFolderId: row[idx.driveFolderId]
    }));

  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.pin !== EXPECTED_PIN) {
      return jsonOutput_({ ok: false, error: "通關密語錯誤" });
    }
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
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
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
