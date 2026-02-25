// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function() {
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
// VIEW LAPORAN
// ==========================
function renderLaporanView() {
  const laporanId = localStorage.getItem("selectedLaporanId");
  const laporan = getLaporanData().find(l => l.id === laporanId);

  if (!laporan) {
    document.getElementById("laporanContent").innerHTML = "Laporan tidak ditemukan.";
    return;
  }

  let html = `
    <p><b>Jenis:</b> ${laporan.type}</p>
    <p><b>Periode:</b> ${laporan.periodeMulai} s/d ${laporan.periodeSelesai}</p>
    <p><b>Status:</b> ${laporan.status}</p>
    <p><b>Total Omzet:</b> Rp ${laporan.totalOmzet.toLocaleString("id-ID")}</p>
    <p><b>Total Transaksi:</b> ${laporan.totalTransaksi}</p>

    <div class="report-box">
      <h3>Top Menu</h3>
      <ul>
  `;

  laporan.topMenu.forEach(t => {
    html += `<li>${t.menu} (${t.qty} terjual)</li>`;
  });

  html += `
      </ul>
    </div>

    <div class="report-box">
      <h3>Bahan Baku Terpakai</h3>
      <ul>
  `;

  laporan.bahanTerpakai.forEach(b => {
    html += `<li>${b.bahan}: ${b.gram} gram</li>`;
  });

  html += `
      </ul>
    </div>

    <div class="report-box">
      <h3>Detail Transaksi</h3>
  `;

  laporan.transaksiDetail.forEach(t => {
    html += `
      <div class="transaksi-item">
        <p><b>ID:</b> ${t.id}</p>
        <p><b>Tanggal:</b> ${t.tanggal}</p>
        <p><b>Total Bayar:</b> Rp ${t.totalBayar.toLocaleString("id-ID")}</p>
        <p><b>Status:</b> ${t.status}</p>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("laporanContent").innerHTML = html;
  return laporan;
}

function exportLaporanExcel(laporan) {
  let rows = [];

  // Header laporan
  rows.push(["Jenis", laporan.type]);
  rows.push(["Periode Mulai", laporan.periodeMulai]);
  rows.push(["Periode Selesai", laporan.periodeSelesai]);
  rows.push(["Status", laporan.status]);
  rows.push(["Total Omzet", laporan.totalOmzet]);
  rows.push(["Total Transaksi", laporan.totalTransaksi]);
  rows.push([]);

  // Top Menu
  rows.push(["TOP MENU"]);
  rows.push(["Menu", "Qty"]);
  laporan.topMenu.forEach(t => {
    rows.push([t.menu, t.qty]);
  });
  rows.push([]);

  // Bahan Terpakai
  rows.push(["BAHAN TERPAKAI"]);
  rows.push(["Bahan", "Gram"]);
  laporan.bahanTerpakai.forEach(b => {
    rows.push([b.bahan, b.gram]);
  });
  rows.push([]);

  // Detail Transaksi
  rows.push(["DETAIL TRANSAKSI"]);
  rows.push(["ID", "Tanggal", "Total Bayar", "Status"]);

  laporan.transaksiDetail.forEach(t => {
    rows.push([t.id, t.tanggal, t.totalBayar, t.status]);
  });

  exportToCSV(`laporan_${laporan.type}_${laporan.periodeMulai}_${laporan.periodeSelesai}.csv`, rows);
}

// INIT
const laporanObj = renderLaporanView();

document.getElementById("btnExportPDF").addEventListener("click", function() {
  exportToPDF();
});

document.getElementById("btnExportExcel").addEventListener("click", function() {
  exportLaporanExcel(laporanObj);
});

renderLaporanView();
