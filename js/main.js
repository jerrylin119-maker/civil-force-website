// ===================================================================
// 臺東縣消防局義消總隊 全球資訊網 — 共用互動邏輯
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initActiveNavLink();

  if (document.getElementById("plans-annual-goals")) {
    loadPlansData();
  }
  if (document.getElementById("gallery-list")) {
    loadGalleryData();
  }
});

/* ---------- 手機版選單開關 ---------- */
function initNavToggle() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

/* ---------- 依目前頁面標記導覽列 active 狀態 ---------- */
function initActiveNavLink() {
  const current = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll("nav.main-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

/* ---------- 通用：轉義文字避免 HTML 注入 ---------- */
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- 從完整網址或純 ID 取出 Google 雲端硬碟資料夾 ID ---------- */
function extractDriveFolderId(input) {
  if (!input) return "";
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = trimmed.match(/^[a-zA-Z0-9_-]{10,}$/);
  return idMatch ? trimmed : "";
}

const STATUS_LABEL = {
  upcoming: "即將舉行",
  ongoing: "辦理中",
  done: "已完成"
};

/* ===================================================================
   年度計畫及活動公布 (plans.html)
   =================================================================== */
async function loadPlansData() {
  const goalsEl = document.getElementById("plans-annual-goals");
  const annEl = document.getElementById("plans-announcements");
  try {
    const res = await fetch("data/plans.json", { cache: "no-store" });
    if (!res.ok) throw new Error("無法載入 plans.json");
    const data = await res.json();
    renderAnnualGoals(goalsEl, data.annualGoals || []);
    renderAnnouncements(annEl, data.announcements || []);
  } catch (err) {
    console.error(err);
    goalsEl.innerHTML = `<div class="empty-note">⚠️ 年度計畫資料載入失敗，請確認 data/plans.json 是否存在且格式正確。</div>`;
    annEl.innerHTML = "";
  }
}

function renderAnnualGoals(container, goals) {
  if (!goals.length) {
    container.innerHTML = `<div class="empty-note">目前尚未公布年度重點工作計畫，請於 data/plans.json 的 annualGoals 新增內容。</div>`;
    return;
  }
  container.innerHTML = goals
    .map(
      (g) => `
      <div class="card" style="margin-bottom:18px;">
        <div class="plan-top">
          <h4>🎯 ${escapeHtml(g.title)}</h4>
          <span class="tag ${escapeHtml(g.status || "ongoing")}">${escapeHtml(
        STATUS_LABEL[g.status] || "辦理中"
      )}</span>
        </div>
        <div class="plan-date">${escapeHtml(g.period || "")}</div>
        <p>${escapeHtml(g.description || "")}</p>
      </div>`
    )
    .join("");
}

function renderAnnouncements(container, items) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-note">目前尚無活動公告，請於 data/plans.json 的 announcements 新增內容。</div>`;
    return;
  }
  // 依日期新到舊排序
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  container.innerHTML = sorted
    .map((item) => {
      const linkHtml = item.link
        ? `<p><a class="album-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">查看詳情 / 附件 →</a></p>`
        : "";
      return `
      <div class="plan-item">
        <div class="plan-top">
          <h4>${escapeHtml(item.title)}</h4>
          <span class="tag ${escapeHtml(item.status || "upcoming")}">${escapeHtml(
        STATUS_LABEL[item.status] || "即將舉行"
      )}</span>
        </div>
        <div class="plan-date">📅 ${escapeHtml(item.date || "")}</div>
        <p>${escapeHtml(item.description || "")}</p>
        ${linkHtml}
      </div>`;
    })
    .join("");
}

/* ===================================================================
   活動花絮 (gallery.html) — 串接 Google 雲端硬碟資料夾
   資料來源：已設定 SHEET_API_URL（js/config.js）時讀取 Google 試算表後台，
   否則退回讀取本機 data/activities.json。
   =================================================================== */
async function loadGalleryData() {
  const listEl = document.getElementById("gallery-list");
  const apiUrl = (typeof SHEET_API_URL !== "undefined" && SHEET_API_URL) ? SHEET_API_URL : "";
  try {
    let data;
    if (apiUrl) {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("無法載入後台試算表資料");
      data = await res.json();
    } else {
      const res = await fetch("data/activities.json", { cache: "no-store" });
      if (!res.ok) throw new Error("無法載入 activities.json");
      data = await res.json();
    }
    renderGallery(listEl, data || []);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="empty-note">⚠️ 活動花絮資料載入失敗，請確認資料來源設定是否正確。</div>`;
  }
}

function renderGallery(container, activities) {
  if (!activities.length) {
    container.innerHTML = `<div class="empty-note">目前尚無活動花絮，請於 data/activities.json 新增活動並填入 Google 雲端硬碟資料夾 ID。</div>`;
    return;
  }
  const sorted = [...activities].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  container.innerHTML = sorted
    .map((act, idx) => {
      const hasFolder = act.driveFolderId && act.driveFolderId.trim().length > 0;
      return `
      <div class="album" data-index="${idx}">
        <div class="album-head" role="button" tabindex="0">
          <div class="album-title">
            <h4>📷 ${escapeHtml(act.title)}</h4>
            <span class="album-date">${escapeHtml(act.date || "")}</span>
          </div>
          <span class="album-toggle">▾</span>
        </div>
        <div class="album-desc">${escapeHtml(act.description || "")}</div>
        <div class="album-body">
          ${
            hasFolder
              ? `<div class="album-frame-wrap">
                   <div class="drive-frame-slot" data-folder-id="${escapeHtml(act.driveFolderId)}"></div>
                   <a class="album-link" href="https://drive.google.com/drive/folders/${escapeHtml(
                     act.driveFolderId
                   )}" target="_blank" rel="noopener">在 Google 雲端硬碟開啟完整相簿 →</a>
                 </div>`
              : `<div class="album-placeholder">尚未設定此活動的 Google 雲端硬碟資料夾 ID，請於 data/activities.json 填入 driveFolderId。</div>`
          }
        </div>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".album-head").forEach((head) => {
    const toggle = () => {
      const album = head.closest(".album");
      const isOpen = album.classList.contains("open");

      if (!isOpen) {
        // 展開時才動態載入 iframe，避免一次載入多個 Google Drive 內嵌畫面
        const slot = album.querySelector(".drive-frame-slot");
        if (slot && !slot.dataset.loaded) {
          const folderId = slot.getAttribute("data-folder-id");
          const iframe = document.createElement("iframe");
          iframe.src = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(
            folderId
          )}#grid`;
          iframe.loading = "lazy";
          iframe.title = "Google 雲端硬碟相簿";
          slot.appendChild(iframe);
          slot.dataset.loaded = "true";
        }
      }
      album.classList.toggle("open");
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // 預設展開第一筆活動
  const first = container.querySelector(".album");
  if (first) first.querySelector(".album-head").click();
}
