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

if (sessionUser.role !== "MANAGER", "OWNER") {
  alert("Akses ditolak. Generate laporan hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// ==========================
// STORAGE
// ==========================
function getTransaksiData() {
  return JSON.parse(localStorage.getItem("transaksiData")) || [];
}

function getMenuData() {
  return JSON.parse(localStorage.getItem("menuData")) || [];
}

function getResepData() {
  return JSON.parse(localStorage.getItem("resepData")) || [];
}

function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function getLaporanData() {
  return JSON.parse(localStorage.getItem("laporanData")) || [];
}

function saveLaporanData(data) {
  localStorage.setItem("laporanData", JSON.stringify(data));
}

// ==========================
// HELPER
// ==========================
function isDateInRange(dateStr, start, end) {
  const d = new Date(dateStr);
  return d >= new Date(start) && d <= new Date(end);
}

// ==========================
// CALCULATE TOP MENU
// ==========================
function calculateTopMenu(transaksiList) {
  const menuData = getMenuData();
  let counter = {};

  transaksiList.forEach(t => {
    t.items.forEach(item => {
      counter[item.menuId] = (counter[item.menuId] || 0) + item.qty;
    });
  });

  return Object.entries(counter)
    .map(([menuId, qty]) => {
      const menu = menuData.find(m => m.id === menuId);
      return { menu: menu ? menu.nama : "Unknown", qty };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
}

// ==========================
// CALCULATE BAHAN TERPAKAI
// ==========================
function calculateBahanTerpakai(transaksiList) {
  const resep = getResepData();
  const bahanData = getBahanBakuData();

  let usage = {};

  transaksiList.forEach(t => {
    t.items.forEach(item => {
      const resepMenu = resep.filter(r => r.menuId === item.menuId);

      resepMenu.forEach(r => {
        usage[r.bahanId] = (usage[r.bahanId] || 0) + (r.gram * item.qty);
      });
    });
  });

  return Object.entries(usage).map(([bahanId, gram]) => {
    const bahan = bahanData.find(b => b.id === bahanId);
    return {
      bahan: bahan ? bahan.nama : "Unknown",
      gram
    };
  });
}

// ==========================
// GENERATE LAPORAN
// ==========================
function generateLaporan() {
  const jenis = document.getElementById("jenisLaporan").value;
  const mulai = document.getElementById("periodeMulai").value;
  const selesai = document.getElementById("periodeSelesai").value;

  if (!mulai || !selesai) {
    alert("Periode harus diisi.");
    return;
  }

  if (new Date(mulai) > new Date(selesai)) {
    alert("Periode mulai tidak valid.");
    return;
  }

  const transaksi = getTransaksiData();

  const transaksiPeriode = transaksi.filter(t =>
    t.status === "Paid" && isDateInRange(t.tanggal, mulai, selesai)
  );

  let totalOmzet = transaksiPeriode.reduce((sum, t) => sum + t.totalBayar, 0);

  const laporan = {
    id: "LP-" + Date.now(),
    type: jenis,
    periodeMulai: mulai,
    periodeSelesai: selesai,
    totalOmzet,
    totalTransaksi: transaksiPeriode.length,
    topMenu: calculateTopMenu(transaksiPeriode),
    bahanTerpakai: calculateBahanTerpakai(transaksiPeriode),
    transaksiDetail: transaksiPeriode,
    status: "Draft",
    createdBy: sessionUser.username,
    approvedBy: null
  };

  const data = getLaporanData();
  data.push(laporan);
  saveLaporanData(data);

  renderLaporanTable();
  alert("Laporan berhasil dibuat (Draft)");
}

// ==========================
// SUBMIT
// ==========================
function submitLaporan(id) {
  let data = getLaporanData();
  const laporan = data.find(l => l.id === id);

  if (!laporan) return;

  if (laporan.status !== "Draft") {
    alert("Hanya Draft yang bisa dikirim.");
    return;
  }

  laporan.status = "Pending";

  saveLaporanData(data);
  renderLaporanTable();
}

// ==========================
// VIEW
// ==========================
function viewLaporan(id) {
  localStorage.setItem("selectedLaporanId", id);
  window.location.href = "laporan_view.html";
}

// ==========================
// RENDER TABLE (FIX UI)
// ==========================
function renderLaporanTable() {
  const tbody = document.getElementById("laporanTable");
  tbody.innerHTML = "";

  const data = getLaporanData().slice().reverse();

  data.forEach(l => {

    // badge jenis
    const jenisBadge = `
      <span class="cs-jenis-badge ${l.type.toLowerCase()}">
        ${l.type}
      </span>
    `;

    // status pill
    const statusClass = l.status.toLowerCase();
    const statusBadge = `
      <span class="cs-status-pill ${statusClass}">
        <span class="cs-pulse"></span>
        ${l.status}
      </span>
    `;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${jenisBadge}</td>
      <td>${l.periodeMulai} s/d ${l.periodeSelesai}</td>
      <td class="cs-td-omzet">Rp ${l.totalOmzet.toLocaleString("id-ID")}</td>
      <td>${l.totalTransaksi}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="cs-action-btn">
          <button class="cs-btn-view" onclick="viewLaporan('${l.id}')">View</button>
          ${
            l.status === "Draft"
              ? `<button class="cs-btn-submit-laporan" onclick="submitLaporan('${l.id}')">Submit</button>`
              : ""
          }
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document.getElementById("btnGenerate").addEventListener("click", generateLaporan);

// ==========================
// INIT
// ==========================
renderLaporanTable();