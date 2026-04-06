// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
});

// ==========================
// STORAGE
// ==========================
function getLaporanData() {
  return JSON.parse(localStorage.getItem("laporanData")) || [];
}

// ==========================
// RENDER VIEW (FULL UI)
// ==========================
function renderLaporanView() {
  const laporanId = localStorage.getItem("selectedLaporanId");
  const laporan = getLaporanData().find(l => l.id === laporanId);

  const container = document.getElementById("laporanContent");

  if (!laporan) {
    container.innerHTML = "Laporan tidak ditemukan.";
    return;
  }

  // STATUS BADGE
  const statusClass = laporan.status.toLowerCase();
  const statusBadge = `
    <span class="cs-status-pill ${statusClass}">
      <span class="cs-pulse"></span>
      ${laporan.status}
    </span>
  `;

  // ==========================
  // HEADER
  // ==========================
  let html = `
    <div class="cs-report-header">
      
      <div class="cs-report-brand">
        <svg class="cs-report-brand-logo" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" stroke="#C9913A" stroke-width="1.5"/>
        </svg>
        <div>
          <div class="cs-report-brand-name">Coffee Street</div>
          <div class="cs-report-brand-sub">Generated Report</div>
        </div>
      </div>

      <div class="cs-report-meta">
        <div class="cs-report-meta-label">Periode</div>
        <div class="cs-report-meta-value">
          ${laporan.periodeMulai} - ${laporan.periodeSelesai}
        </div>
        <div style="margin-top:6px">${statusBadge}</div>
      </div>

    </div>
  `;

  // ==========================
  // STATS
  // ==========================
  html += `
    <div class="cs-report-stats">
      <div class="cs-stat-box">
        <div class="cs-stat-box-label">Jenis</div>
        <div class="cs-stat-box-value">${laporan.type}</div>
      </div>

      <div class="cs-stat-box">
        <div class="cs-stat-box-label">Total Transaksi</div>
        <div class="cs-stat-box-value">${laporan.totalTransaksi}</div>
      </div>

      <div class="cs-stat-box">
        <div class="cs-stat-box-label">Total Omzet</div>
        <div class="cs-stat-box-value gold">
          Rp ${laporan.totalOmzet.toLocaleString("id-ID")}
        </div>
      </div>
    </div>
  `;

  // ==========================
  // TOP MENU
  // ==========================
  html += `
    <div class="cs-report-section">
      <div class="cs-report-section-title">Top Menu</div>
      <div class="cs-report-box">
  `;

  laporan.topMenu.forEach(t => {
    html += `
      <div class="cs-report-box-row">
        <span class="cs-report-box-label">${t.menu}</span>
        <span class="cs-report-box-val">${t.qty} terjual</span>
      </div>
    `;
  });

  html += `</div></div>`;

  // ==========================
  // BAHAN TERPAKAI
  // ==========================
  html += `
    <div class="cs-report-section">
      <div class="cs-report-section-title">Bahan Terpakai</div>
      <div class="cs-report-box">
  `;

  laporan.bahanTerpakai.forEach(b => {
    html += `
      <div class="cs-report-box-row">
        <span class="cs-report-box-label">${b.bahan}</span>
        <span class="cs-report-box-val">${b.gram} gram</span>
      </div>
    `;
  });

  html += `</div></div>`;

  // ==========================
  // DETAIL TRANSAKSI
  // ==========================
  html += `
    <div class="cs-report-section">
      <div class="cs-report-section-title">Detail Transaksi</div>
  `;

  laporan.transaksiDetail.forEach(t => {
    html += `
      <div class="cs-transaksi-item">
        
        <div class="cs-transaksi-item-head">
          <span class="cs-transaksi-item-id">${t.id}</span>
          <span class="cs-transaksi-item-total">
            Rp ${t.totalBayar.toLocaleString("id-ID")}
          </span>
        </div>

        <ul>
          ${t.items.map(item => `
            <li>
              <span>${item.nama}</span>
              <span>x${item.qty}</span>
            </li>
          `).join("")}
        </ul>

      </div>
    `;
  });

  html += `</div>`;

  container.innerHTML = html;

  return laporan;
}

// ==========================
// INIT
// ==========================
renderLaporanView();