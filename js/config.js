// ===================================================================
// 網站設定檔 — 依 README「後台設定」章節完成 Google Apps Script 部署後，
// 將您取得的網址與通關密語填入下方即可。
// ===================================================================

// Google Apps Script Web App 的部署網址（形如 https://script.google.com/macros/s/xxxx/exec）
// 留空 "" 時，活動花絮頁面會改讀本機的 data/activities.json，後台表單頁面也會停用送出功能。
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxZoOEV3cSHG5agwsMQIuw_DhNxgs5TiG_X2EiPIzUi-ddvvbgoDX4Hxy6pUeuL6EwJQg/exec";

// 後台新增活動表單使用的通關密語（同仁需輸入正確才能送出，Apps Script 端也會再次核對）
// 請自行修改成不易被猜到的密語，並且只告訴需要使用後台的同仁。
const ADMIN_PIN = "ttfd119";
