// ===================================================================
// 新增／編輯活動花絮後台 (admin.html)
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  const notConfigured = document.getElementById("admin-not-configured");
  const apiUrl = (typeof SHEET_API_URL !== "undefined" && SHEET_API_URL) ? SHEET_API_URL : "";
  if (!apiUrl) {
    notConfigured.style.display = "block";
  }

  const pin = () => (typeof ADMIN_PIN !== "undefined") ? ADMIN_PIN : "";

  const pinGate = document.getElementById("pin-gate");
  const pinInput = document.getElementById("pin-input");
  const pinSubmit = document.getElementById("pin-submit");
  const pinError = document.getElementById("pin-error");
  const form = document.getElementById("activity-form");
  const listWrap = document.getElementById("activity-list-wrap");
  const listEl = document.getElementById("activity-list");
  const formTitle = document.getElementById("form-title");
  const idField = document.getElementById("f-id");
  const submitBtn = document.getElementById("f-submit");
  const cancelBtn = document.getElementById("f-cancel-edit");

  function tryEnter() {
    const expected = pin();
    if (pinInput.value === expected) {
      pinGate.style.display = "none";
      form.style.display = "block";
      listWrap.style.display = "block";
      loadActivityList();
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

  async function callApi(payload) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ pin: pin() }, payload))
    });
    return res.json();
  }

  const STATUS_LABEL2 = { published: "已發布", pending: "審核中" };

  async function loadActivityList() {
    if (!apiUrl) return;
    listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">載入中...</p>`;
    try {
      const result = await callApi({ action: "list" });
      if (!result.ok) throw new Error(result.error || "讀取失敗");
      const items = result.items || [];
      if (!items.length) {
        listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">目前尚無任何活動花絮資料。</p>`;
        return;
      }
      const sorted = items.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      listEl.innerHTML = sorted
        .map(
          (it) => `
        <div class="plan-item" data-id="${escapeHtml(it.id)}" style="margin-bottom:10px;">
          <div class="plan-top">
            <h4 style="font-size:0.95rem;">${escapeHtml(it.title)}</h4>
            <span class="tag ${it.status === "published" ? "done" : "upcoming"}">${escapeHtml(
              STATUS_LABEL2[it.status] || it.status || ""
            )}</span>
          </div>
          <div class="plan-date">📅 ${escapeHtml(it.date || "")}</div>
          <p style="font-size:0.82rem; word-break:break-all;">資料夾ID：${escapeHtml(it.driveFolderId || "")}</p>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button type="button" class="btn btn-ghost edit-btn" style="padding:6px 14px; font-size:0.82rem;">✏️ 編輯</button>
            <button type="button" class="btn btn-outline delete-btn" style="padding:6px 14px; font-size:0.82rem; background:var(--red); border-color:var(--red);">🗑️ 刪除</button>
          </div>
        </div>`
        )
        .join("");

      listEl.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").getAttribute("data-id");
          const item = sorted.find((it) => it.id === id);
          if (item) startEdit(item);
        });
      });
      listEl.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("[data-id]").getAttribute("data-id");
          const item = sorted.find((it) => it.id === id);
          if (!item) return;
          if (!confirm(`確定要刪除「${item.title}」這筆活動花絮嗎？此動作無法復原。`)) return;
          btn.disabled = true;
          const result = await callApi({ action: "delete", id });
          if (result.ok) {
            loadActivityList();
          } else {
            alert("刪除失敗：" + (result.error || "請稍後再試"));
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      console.error(err);
      listEl.innerHTML = `<p style="color:var(--red); font-size:0.9rem;">⚠️ 讀取活動清單失敗，請重新整理頁面再試一次。</p>`;
    }
  }

  function startEdit(item) {
    idField.value = item.id;
    document.getElementById("f-title").value = item.title || "";
    document.getElementById("f-date").value = item.date || "";
    document.getElementById("f-description").value = item.description || "";
    document.getElementById("f-folder").value = item.driveFolderId || "";
    formTitle.textContent = "✏️ 編輯活動花絮資料";
    submitBtn.textContent = "更新活動花絮";
    cancelBtn.style.display = "inline-block";
    document.getElementById("f-status").textContent = "";
    form.scrollIntoView({ behavior: "smooth" });
  }

  function resetToCreateMode() {
    idField.value = "";
    form.reset();
    formTitle.textContent = "📷 新增活動花絮資料";
    submitBtn.textContent = "送出活動花絮";
    cancelBtn.style.display = "none";
    document.getElementById("f-status").textContent = "";
  }

  cancelBtn.addEventListener("click", resetToCreateMode);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("f-status");

    const id = idField.value;
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
    if (!apiUrl) {
      statusEl.style.color = "var(--red)";
      statusEl.textContent = "尚未設定後台試算表網址，請聯繫系統管理同仁。";
      return;
    }

    submitBtn.disabled = true;
    statusEl.style.color = "var(--text-muted)";
    statusEl.textContent = "送出中...";

    try {
      const payload = id
        ? { action: "update", id, title, date, description, driveFolderId }
        : { title, date, description, driveFolderId };
      const result = await callApi(payload);
      if (result.ok) {
        statusEl.style.color = "#166534";
        statusEl.textContent = id ? "✅ 已更新！活動花絮頁面將立即顯示新內容。" : "✅ 已送出並發布，活動花絮頁面將立即顯示！";
        resetToCreateMode();
        loadActivityList();
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
