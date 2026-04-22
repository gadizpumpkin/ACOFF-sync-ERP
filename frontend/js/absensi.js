// ==========================
// DEBUG LOAD
// ==========================
console.log("ABSENSI JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const sessionUser = getSession();
  console.log("SESSION:", sessionUser);

  if (!sessionUser) {
    alert("Session habis");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userRole").textContent = sessionUser.role;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  if (sessionUser.role !== "KARYAWAN") {
    alert("Akses ditolak");
    window.location.href = "dashboard.html";
    return;
  }

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
  // RENDER HISTORY (absensi masuk/keluar))
  // ==========================
  async function renderHistory() {
    const tbody = document.getElementById("historyTable");

    if (!tbody) {
      console.error("historyTable tidak ditemukan");
      return;
    }

    tbody.innerHTML = "";

    const data = await fetchAbsensi();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">Belum ada data</td>
        </tr>
      `;
      return;
    }

    data.forEach((a) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${a.tanggal}</td>
        <td>${a.jam_masuk || "-"}</td>
        <td>${a.jam_keluar || "-"}</td>
        <td>${a.status}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  // ==========================
  // ABSEN MASUK
  // ==========================
  async function absenMasuk() {
    console.log("CLICK MASUK");

    if (!canAbsenMasuk()) {
      alert("Belum waktunya");
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

      alert("Berhasil absen masuk");
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  // ==========================
  // ABSEN KELUAR
  // ==========================
  async function absenKeluar() {
    console.log("CLICK KELUAR");

    if (!canAbsenKeluar()) {
      alert("Belum waktunya");
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

      alert("Berhasil absen keluar");
      renderAll();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  // ==========================
  // RENDER ALL
  // ==========================
  async function renderAll() {
    console.log("RENDER ALL");
    await renderHistory();
  }

  // ==========================
  // EVENT
  // ==========================
  document.getElementById("btnMasuk")?.addEventListener("click", absenMasuk);
  document.getElementById("btnKeluar")?.addEventListener("click", absenKeluar);

  // ==========================
  // INIT
  // ==========================
  renderAll();
});