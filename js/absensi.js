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

if (sessionUser.role !== "Karyawan") {
  alert("Akses ditolak. Absensi hanya untuk Karyawan.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Absensi") window.location.href = "absensi.html";
    else if (menu === "Transaksi Penjualan") window.location.href = "transaksi.html";
    else if (menu === "Paycheck") alert("Belum dibuat (paycheck)");
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getAbsensiData() {
  return JSON.parse(localStorage.getItem("absensiData")) || [];
}

function saveAbsensiData(data) {
  localStorage.setItem("absensiData", JSON.stringify(data));
}

// ==========================
// UTIL DATE
// ==========================
function getTodayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getCurrentTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

// ==========================
// SHIFT VALIDATION
// ==========================
// aturan shift:
// masuk mulai 19:00
// keluar mulai 00:00
function canAbsenMasuk() {
  const d = new Date();
  const hour = d.getHours();
  return hour >= 19;
}

function canAbsenKeluar() {
  const d = new Date();
  const hour = d.getHours();
  return hour >= 0 && hour <= 3; 
  // keluar jam 00:00 - 03:00 (toleransi)
}

// ==========================
// CHECK TODAY STATUS
// ==========================
function getTodayAbsensi() {
  const absensi = getAbsensiData();
  const today = getTodayDate();

  return absensi.find(a => a.tanggal === today && a.user === sessionUser.username);
}

// ==========================
// ABSEN MASUK
// ==========================
function absenMasuk() {
  if (!canAbsenMasuk()) {
    alert("Belum waktunya absen masuk. Minimal jam 19:00.");
    return;
  }

  const today = getTodayAbsensi();
  if (today && today.jamMasuk) {
    alert("Anda sudah absen masuk hari ini.");
    return;
  }

  const absensi = getAbsensiData();

  absensi.push({
    id: "ABS-" + Date.now(),
    user: sessionUser.username,
    tanggal: getTodayDate(),
    jamMasuk: getCurrentTime(),
    jamKeluar: null,
    status: "Belum Lengkap"
  });

  saveAbsensiData(absensi);

  renderTodayStatus();
  renderHistory();
  alert("Absen masuk berhasil.");
}

// ==========================
// ABSEN KELUAR
// ==========================
function absenKeluar() {
  if (!canAbsenKeluar()) {
    alert("Belum waktunya absen keluar. Minimal jam 00:00.");
    return;
  }

  let absensi = getAbsensiData();
  const today = getTodayDate();

  const record = absensi.find(a => a.tanggal === today && a.user === sessionUser.username);

  if (!record) {
    alert("Anda belum absen masuk hari ini.");
    return;
  }

  if (record.jamKeluar) {
    alert("Anda sudah absen keluar hari ini.");
    return;
  }

  record.jamKeluar = getCurrentTime();
  record.status = "Hadir";

  saveAbsensiData(absensi);

  renderTodayStatus();
  renderHistory();
  alert("Absen keluar berhasil. Status Hadir.");
}

// ==========================
// RENDER TODAY STATUS
// ==========================
function renderTodayStatus() {
  const todayText = document.getElementById("tanggalHariIni");
  const jamText = document.getElementById("jamSekarang");
  const statusText = document.getElementById("statusHariIni");

  todayText.textContent = getTodayDate();
  jamText.textContent = getCurrentTime();

  const record = getTodayAbsensi();

  if (!record) {
    statusText.textContent = "Belum Absen";
    statusText.className = "status-waiting";
    return;
  }

  if (record.jamMasuk && !record.jamKeluar) {
    statusText.textContent = "Sudah Masuk (Belum Keluar)";
    statusText.className = "status-belum-lengkap";
    return;
  }

  if (record.jamMasuk && record.jamKeluar) {
    statusText.textContent = "Hadir";
    statusText.className = "status-hadir";
    return;
  }
}

// ==========================
// RENDER HISTORY
// ==========================
function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const absensi = getAbsensiData().filter(a => a.user === sessionUser.username);

  absensi.slice().reverse().forEach(a => {
    let statusClass = "status-waiting";
    if (a.status === "Hadir") statusClass = "status-hadir";
    if (a.status === "Belum Lengkap") statusClass = "status-belum-lengkap";
    if (a.status === "Tidak Hadir") statusClass = "status-tidak-hadir";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.tanggal}</td>
      <td>${a.jamMasuk || "-"}</td>
      <td>${a.jamKeluar || "-"}</td>
      <td class="${statusClass}">${a.status}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT LISTENER
// ==========================
document.getElementById("btnMasuk").addEventListener("click", absenMasuk);
document.getElementById("btnKeluar").addEventListener("click", absenKeluar);

// ==========================
// LIVE CLOCK UPDATE
// ==========================
setInterval(() => {
  document.getElementById("jamSekarang").textContent = getCurrentTime();
}, 1000);

// INIT
renderTodayStatus();
renderHistory();
