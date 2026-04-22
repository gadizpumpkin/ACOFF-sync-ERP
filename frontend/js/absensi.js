const BASE_URL = "http://localhost:5000/api/absensi";

const sessionUser = getSession();
if (!sessionUser) location.href = "index.html";

// ==========================
// FETCH DATA
// ==========================
async function fetchData() {
  const res = await fetch(`${BASE_URL}/${sessionUser.username}`);
  return await res.json();
}

// ==========================
// ABSEN MASUK
// ==========================
async function absenMasuk() {
  const res = await fetch(BASE_URL + "/masuk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: sessionUser.username,
      tanggal: new Date().toISOString().split("T")[0],
      jam_masuk: new Date().toTimeString().slice(0, 5),
    }),
  });

  const data = await res.json();
  alert(data.message);
  render();
}

// ==========================
// ABSEN KELUAR
// ==========================
async function absenKeluar() {
  const res = await fetch(BASE_URL + "/keluar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: sessionUser.username,
      tanggal: new Date().toISOString().split("T")[0],
      jam_keluar: new Date().toTimeString().slice(0, 5),
    }),
  });

  const data = await res.json();
  alert(data.message);
  render();
}

// ==========================
// RENDER TABLE
// ==========================
async function render() {
  const tbody = document.getElementById("historyTable");
  const data = await fetchData();

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4">Belum ada data</td></tr>`;
    return;
  }

  data.forEach((a) => {
    tbody.innerHTML += `
      <tr>
        <td>${a.tanggal}</td>
        <td>${a.jam_masuk || "-"}</td>
        <td>${a.jam_keluar || "-"}</td>
        <td>${a.status}</td>
      </tr>
    `;
  });
}

// ==========================
document.getElementById("btnMasuk").onclick = absenMasuk;
document.getElementById("btnKeluar").onclick = absenKeluar;

render();