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
// BASE URL API
// ==========================
const BASE_URL = "http://localhost:3000/api/absensi";

// ==========================
// UTIL DATE & TIME
// ==========================
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
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
// FETCH DATA ABSENSI (API)
// ==========================
async function fetchAbsensi() {
  const res = await fetch(`${BASE_URL}/${sessionUser.username}`);
  return await res.json();
}

// ==========================
// GET TODAY DATA
// ==========================
async function getTodayAbsensi() {
  const data = await fetchAbsensi();
  const today = getTodayDate();

  return data.find(
    (a) => a.tanggal === today && a.user === sessionUser.username
  );
}

// ==========================
// ABSEN MASUK (POST)
// ==========================
async function absenMasuk() {
  if (!canAbsenMasuk()) {
    alert("Belum waktunya absen masuk (≥19:00)");
    return;
  }

  const todayData = await getTodayAbsensi();
  if (todayData) {
    alert("Sudah absen masuk hari ini");
    return;
  }

  await fetch(BASE_URL + "/masuk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: sessionUser.username,
      tanggal: getTodayDate(),
      jamMasuk: getCurrentTime(),
    }),
  });

  alert("Absen masuk berhasil");
  renderAll();
}

// ==========================
// ABSEN KELUAR (PUT)
// ==========================
async function absenKeluar() {
  if (!canAbsenKeluar()) {
    alert("Belum waktunya absen keluar (00:00–03:00)");
    return;
  }

  const todayData = await getTodayAbsensi();

  if (!todayData) {
    alert("Belum absen masuk");
    return;
  }

  if (todayData.jamKeluar) {
    alert("Sudah absen keluar");
    return;
  }

  await fetch(BASE_URL + "/keluar", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: sessionUser.username,
      tanggal: getTodayDate(),
      jamKeluar: getCurrentTime(),
    }),
  });

  alert("Absen keluar berhasil");
  renderAll();
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
  return `${Math.floor(diff / 60)}j ${diff % 60}m`;
}

// ==========================
// RENDER STATUS
// ==========================
async function renderTodayStatus() {
  const statusEl = document.getElementById("statusHariIni");
  const masukEl = document.getElementById("displayJamMasuk");
  const keluarEl = document.getElementById("displayJamKeluar");
  const durasiEl = document.getElementById("displayDurasi");

  const record = await getTodayAbsensi();

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
  } else {
    statusEl.textContent = "Hadir";
    statusEl.className = "cs-status-pill hadir";
  }
}

// ==========================
// RENDER HISTORY
// ==========================
async function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const data = await fetchAbsensi();

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
// TOTAL HADIR
// ==========================
async function renderTotalHadir() {
  const totalEl = document.getElementById("totalHadir");

  const data = await fetchAbsensi();
  const total = data.filter(
    (a) => a.user === sessionUser.username && a.status === "Hadir"
  ).length;

  totalEl.textContent = total;
}

// ==========================
// EVENT
// ==========================
document.getElementById("btnMasuk").addEventListener("click", absenMasuk);
document.getElementById("btnKeluar").addEventListener("click", absenKeluar);

// ==========================
// INIT
// ==========================
async function renderAll() {
  await renderTodayStatus();
  await renderHistory();
  await renderTotalHadir();
}

renderAll();