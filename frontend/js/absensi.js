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

if (sessionUser.role !== "KARYAWAN") {
  alert("Akses ditolak. Absensi hanya untuk Karyawan.");
  window.location.href = "dashboard.html";
}

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
// UTIL DATE & TIME
// ==========================
function getTodayDate() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

// ==========================
// SHIFT VALIDATION
// ==========================
function canAbsenMasuk() {
  return new Date().getHours() >= 19;
}

function canAbsenKeluar() {
  const h = new Date().getHours();
  return h >= 0 && h <= 3;
}

// ==========================
// GET DATA HARI INI
// ==========================
function getTodayAbsensi() {
  const today = getTodayDate();
  return getAbsensiData().find(
    (a) => a.tanggal === today && a.user === sessionUser.username
  );
}

// ==========================
// ABSEN MASUK
// ==========================
function absenMasuk() {
  if (!canAbsenMasuk()) {
    alert("Belum waktunya absen masuk (≥19:00)");
    return;
  }

  if (getTodayAbsensi()) {
    alert("Sudah absen masuk hari ini");
    return;
  }

  const data = getAbsensiData();

  data.push({
    id: "ABS-" + Date.now(),
    user: sessionUser.username,
    tanggal: getTodayDate(),
    jamMasuk: getCurrentTime(),
    jamKeluar: null,
    status: "Belum Lengkap",
  });

  saveAbsensiData(data);
  renderAll();
  alert("Absen masuk berhasil");
}

// ==========================
// ABSEN KELUAR
// ==========================
function absenKeluar() {
  if (!canAbsenKeluar()) {
    alert("Belum waktunya absen keluar (00:00–03:00)");
    return;
  }

  const data = getAbsensiData();
  const today = getTodayDate();

  const record = data.find(
    (a) => a.tanggal === today && a.user === sessionUser.username
  );

  if (!record) {
    alert("Belum absen masuk");
    return;
  }

  if (record.jamKeluar) {
    alert("Sudah absen keluar");
    return;
  }

  record.jamKeluar = getCurrentTime();
  record.status = "Hadir";

  saveAbsensiData(data);
  renderAll();
  alert("Absen keluar berhasil");
}

// ==========================
// HITUNG DURASI
// ==========================
function hitungDurasi(masuk, keluar) {
  if (!masuk || !keluar) return "-";

  const [h1, m1] = masuk.split(":").map(Number);
  const [h2, m2] = keluar.split(":").map(Number);

  let start = h1 * 60 + m1;
  let end = h2 * 60 + m2;

  if (end < start) end += 24 * 60;

  const diff = end - start;
  const jam = Math.floor(diff / 60);
  const menit = diff % 60;

  return `${jam}j ${menit}m`;
}

// ==========================
// RENDER STATUS HARI INI
// ==========================
function renderTodayStatus() {
  const statusEl = document.getElementById("statusHariIni");
  const masukEl = document.getElementById("displayJamMasuk");
  const keluarEl = document.getElementById("displayJamKeluar");
  const durasiEl = document.getElementById("displayDurasi");

  const record = getTodayAbsensi();

  if (!record) {
    statusEl.textContent = "Belum Absen";
    statusEl.className = "cs-status-pill waiting";
    masukEl.textContent = "-";
    keluarEl.textContent = "-";
    durasiEl.textContent = "-";
    return;
  }

  masukEl.textContent = record.jamMasuk || "-";
  keluarEl.textContent = record.jamKeluar || "-";
  durasiEl.textContent = hitungDurasi(record.jamMasuk, record.jamKeluar);

  if (record.jamMasuk && !record.jamKeluar) {
    statusEl.textContent = "Sudah Masuk";
    statusEl.className = "cs-status-pill partial";
  } else if (record.jamMasuk && record.jamKeluar) {
    statusEl.textContent = "Hadir";
    statusEl.className = "cs-status-pill hadir";
  }
}

// ==========================
// RENDER TOTAL HADIR
// ==========================
function renderTotalHadir() {
  const totalEl = document.getElementById("totalHadir");

  const total = getAbsensiData().filter(
    (a) => a.user === sessionUser.username && a.status === "Hadir"
  ).length;

  totalEl.textContent = total;
}

// ==========================
// RENDER HISTORY
// ==========================
function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const data = getAbsensiData().filter(
    (a) => a.user === sessionUser.username
  );

  data.reverse().forEach((a) => {
    let cls = "waiting";
    if (a.status === "Hadir") cls = "hadir";
    else if (a.status === "Belum Lengkap") cls = "partial";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.tanggal}</td>
      <td>${a.jamMasuk || "-"}</td>
      <td>${a.jamKeluar || "-"}</td>
      <td><span class="cs-status-pill ${cls}">${a.status}</span></td>
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
// RENDER ALL
// ==========================
function renderAll() {
  renderTodayStatus();
  renderHistory();
  renderTotalHadir();
}

// ==========================
// INIT
// ==========================
renderAll();