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

if (sessionUser.role !== "Manajer") {
  alert("Akses ditolak. Generate laporan hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Generate Laporan") window.location.href = "laporan.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

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

  const sorted = Object.entries(counter)
    .map(([menuId, qty]) => {
      const menu = menuData.find(m => m.id === menuId);
      return { menu: menu ? menu.nama : "Unknown", qty };
    })
    .sort((a, b) => b.qty - a.qty);

  return sorted.slice(0, 5);
}

// ==========================
// CALCULATE BAHAN TERPAKAI
// ==========================
function calculateBahanTerpakai(transaksiList) {
  const resep = getResepData();
  const bahanData = getBahanBakuData();

  let usage = {}; // bahanId => total gram

  transaksiList.forEach(t => {
    t.items.forEach(item => {
      const resepMenu = resep.filter(r => r.menuId === item.menuId);

      resepMenu.forEach(r => {
        const totalGram = r.gram * item.qty;
        usage[r.bahanId] = (usage[r.bahanId] || 0) + totalGram;
      });
    });
  });

  return Object.entries(usage).map(([bahanId, gram]) => {
    const bahan = bahanData.find(b => b.id === bahanId);
    return {
      bahan: bahan ? bahan.nama : "Unknown",
      gram: gram
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
    alert("Periode mulai tidak boleh lebih besar dari selesai.");
    return;
  }

  const transaksi = getTransaksiData();

  const transaksiPeriode = transaksi.filter(t =>
    t.status === "Paid" && isDateInRange(t.tanggal, mulai, selesai)
  );

  let totalOmzet = 0;
  transaksiPeriode.forEach(t => totalOmzet += t.totalBayar);

  const laporan = {
    id: "LP-" + Date.now(),
    type: jenis,
    periodeMulai: mulai,
    periodeSelesai: selesai,
    totalOmzet: totalOmzet,
    totalTransaksi: transaksiPeriode.length,
    topMenu: calculateTopMenu(transaksiPeriode),
    bahanTerpakai: calculateBahanTerpakai(transaksiPeriode),
    transaksiDetail: transaksiPeriode,
    status: "Draft",
    createdBy: sessionUser.username,
    approvedBy: null
  };

  const laporanData = getLaporanData();
  laporanData.push(laporan);
  saveLaporanData(laporanData);

  renderLaporanTable();
  alert("Laporan berhasil dibuat (Draft).");
}

// ==========================
// SUBMIT TO OWNER
// ==========================
function submitLaporan(id) {
  let laporanData = getLaporanData();
  const laporan = laporanData.find(l => l.id === id);

  if (!laporan) return alert("Laporan tidak ditemukan.");

  if (laporan.status !== "Draft") {
    alert("Hanya laporan Draft yang bisa dikirim approval.");
    return;
  }

  laporan.status = "Pending";

  saveLaporanData(laporanData);

  alert("Laporan berhasil dikirim ke Owner untuk approval.");
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
// RENDER TABLE
// ==========================
function renderLaporanTable() {
  const tbody = document.getElementById("laporanTable");
  tbody.innerHTML = "";

  const laporan = getLaporanData().slice().reverse();

  laporan.forEach(l => {
    let statusClass = "status-draft";
    if (l.status === "Pending") statusClass = "status-pending";
    if (l.status === "Approved") statusClass = "status-approved";
    if (l.status === "Rejected") statusClass = "status-rejected";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.type}</td>
      <td>${l.periodeMulai} s/d ${l.periodeSelesai}</td>
      <td>Rp ${l.totalOmzet.toLocaleString("id-ID")}</td>
      <td>${l.totalTransaksi}</td>
      <td class="${statusClass}">${l.status}</td>
      <td>
        <button class="btn-view" onclick="viewLaporan('${l.id}')">View</button>
        <button class="btn-submit" onclick="submitLaporan('${l.id}')">Submit</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// EVENT
document.getElementById("btnGenerate").addEventListener("click", generateLaporan);

// INIT
renderLaporanTable();
