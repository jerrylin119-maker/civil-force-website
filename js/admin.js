// ===================================================================
// 新增活動花絮後台 (admin.html)
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  const notConfigured = document.getElementById("admin-not-configured");
  const apiUrl = (typeof SHEET_API_URL !== "undefined" && SHEET_API_URL) ? SHEET_API_URL : "";
  if (!apiUrl) {
    notConfigured.style.display = "block";
  }

  const pinGate = document.getElementById("pin-gate");
  const pinInput = document.getElementById("pin-input");
  const pinSubmit = document.getElementById("pin-submit");
  const pinError = document.getElementById("pin-error");
  const form = document.getElementById("activity-form");

  function tryEnter() {
    const expected = (typeof ADMIN_PIN !== "undefined" && ADMIN_PIN) ? ADMIN_PIN : "";
    if (pinInput.value === expected) {
      pinGate.style.display = "none";
      form.style.display = "block";
    } else {
      pinError.style.display = "block";
    }
  }

  pinSubmit.addEventListener("click", tryEnter);
  pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryEnter();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("f-status");
    const submitBtn = document.getElementById("f-submit");

    const title = document.getElementById("f-title").value.trim();
    const date = document.getElementById("f-date").value;
    const description = document.getElementById("f-description").value.trim();
    const folderInput = document.getElementById("f-folder").value.trim();
    const driveFolderId = extractDriveFolderId(folderInput);

    if (!title || !date || !folderInput) {
      statusEl.style.color = "var(--red)";
      statusEl.textContent = "請填寫必填欄位（活動名稱、日期、雲端硬碟連結）。";
      return;
    }
    if (!driveFolderId) {
      statusEl.style.color = "var(--red)";
      statusEl.textContent = "無法辨識雲端硬碟資料夾連結，請確認貼上的是完整的資料夾網址。";
      return;
    }

    const apiUrl = (typeof SHEET_API_URL !== "undefined" && SHEET_API_URL) ? SHEET_API_URL : "";
    if (!apiUrl) {
      statusEl.style.color = "var(--red)";
      statusEl.textContent = "尚未設定後台試算表網址，請聯繫系統管理同仁。";
      return;
    }

    submitBtn.disabled = true;
    statusEl.style.color = "var(--text-muted)";
    statusEl.textContent = "送出中...";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          pin: (typeof ADMIN_PIN !== "undefined") ? ADMIN_PIN : "",
          title,
          date,
          description,
          driveFolderId
        })
      });
      const result = await res.json();
      if (result.ok) {
        statusEl.style.color = "#166534";
        statusEl.textContent = "✅ 已送出！將由承辦人審核後顯示於活動花絮頁面。";
        form.reset();
      } else {
        statusEl.style.color = "var(--red)";
        statusEl.textContent = "❌ 送出失敗：" + (result.error || "請確認通關密語或稍後再試。");
      }
    } catch (err) {
      console.error(err);
      statusEl.style.color = "var(--red)";
      statusEl.textContent = "❌ 送出失敗，請檢查網路連線或聯繫系統管理同仁。";
    } finally {
      submitBtn.disabled = false;
    }
  });
});
