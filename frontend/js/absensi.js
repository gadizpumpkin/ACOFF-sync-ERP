// ==========================
// DEBUG LOAD
// ==========================
console.log("ABSENSI JS LOADED");

// ==========================
// DOM READY
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  // ==========================
  // AUTH CHECK
  // ==========================
  const sessionUser = getSession();
  console.log("SESSION:", sessionUser);

  if (!sessionUser) {
    alert("Session habis, silakan login ulang");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userRole").textContent = sessionUser.role;

  document.getElementById("logoutBtn").addEventListener("click", function () {
    clearSession();
    window.location.href = "index.html";
  });

  if (sessionUser.role !== "KARYAWAN") {
    alert("Akses ditolak. Absensi hanya untuk Karyawan.");
    window.location.href = "dashboard.html";
    return;
  }

  // ==========================
  // BASE URL API
  // ==========================
  const BASE_URL = "http://localhost:5000/api/absensi";

  // ==========================
  // UTIL
  // ==========================
  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function getCurrentTime() {
    return new Date().toTimeString().slice(0, 5);
  }

  function canAbsenMasuk() {
    return new Date().getHours() >= 19;
  }

  function canAbsenKeluar() {
    const h = new Date().getHours();
    return h >= 0 && h <= 3;
  }

  // ==========================
  // FETCH DATA 
  // ==========================
  async function fetchAbsensi() {
    try {
      console.log("FETCH ABSENSI...");
      const res = await fetch(`${BASE_URL}/${sessionUser.username}`);

      if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        return [];
      }

      const data = await res.json();
      console.log("DATA:", data);
      return data;
    } catch (err) {
      console.error("FETCH ERROR:", err);
      return [];
    }
  }

  // ==========================
  // GET TODAY
  // ==========================
  async function getTodayAbsensi() {
    const data = await fetchAbsensi();
    const today = getTodayDate();

    return data.find(
      (a) => a.tanggal === today && a.user === sessionUser.username
    );
  }

  // ==========================
  // ABSEN MASUK
  // ==========================
  async function absenMasuk() {
    console.log("CLICK MASUK");

    if (!canAbsenMasuk()) {
      alert("Belum waktunya absen masuk (≥19:00)");
      return;
    }

    const todayData = await getTodayAbsensi();
    if (todayData) {
      alert("Sudah absen hari ini");
      return;
    }

    try {
      const res = await fetch(BASE_URL + "/masuk", {
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Absen masuk berhasil");
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server");
    }
  }

  // ==========================
  // ABSEN KELUAR
  // ==========================
  async function absenKeluar() {
    console.log("CLICK KELUAR");

    if (!canAbsenKeluar()) {
      alert("Belum waktunya absen keluar (00:00–03:00)");
      return;
    }

    try {
      const res = await fetch(BASE_URL + "/keluar", {
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Absen keluar berhasil");
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server");
    }
  }

  // ==========================
  // RENDER
  // ==========================
  async function renderAll() {
    console.log("RENDER...");
    await fetchAbsensi();
  }

  // ==========================
  // EVENT LISTENER 
  // ==========================
  const btnMasuk = document.getElementById("btnMasuk");
  const btnKeluar = document.getElementById("btnKeluar");

  if (!btnMasuk) {
    console.error("btnMasuk TIDAK DITEMUKAN");
  } else {
    btnMasuk.addEventListener("click", absenMasuk);
  }

  if (!btnKeluar) {
    console.error("btnKeluar TIDAK DITEMUKAN");
  } else {
    btnKeluar.addEventListener("click", absenKeluar);
  }

  // ==========================
  // INIT
  // ==========================
  renderAll();
});