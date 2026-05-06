// ==========================
// AUTH
// ==========================
const sessionUser = getSession();
const token = localStorage.getItem("token");

if (!sessionUser || !token) {
  window.location.href = "index.html";
}

document.getElementById("userRole").textContent = sessionUser.role;

// logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

// ==========================
// ROLE VALIDATION
// ==========================
if (!["MANAGER", "OWNER"].includes(sessionUser.role)) {
  alert("Akses ditolak");
  window.location.href = "dashboard.html";
}

// ==========================
// STATE
// ==========================
let laporanData = [];

// ==========================
// GENERATE LAPORAN (API)
// ==========================
async function generateLaporan() {
  const jenis = document.getElementById("jenisLaporan").value;
  const mulai = document.getElementById("periodeMulai").value;
  const selesai = document.getElementById("periodeSelesai").value;

  if (!mulai || !selesai) {
    alert("Periode harus diisi");
    return;
  }

  if (new Date(mulai) > new Date(selesai)) {
    alert("Tanggal tidak valid");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/laporan/omzet?start=${mulai}&end=${selesai}`,
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    if (!res.ok) throw new Error("Gagal ambil data");

    const data = await res.json();

    const laporan = {
      id: "LP-" + Date.now(),
      type: jenis,
      periode: `${mulai} s/d ${selesai}`,
      omzet: data.total_omzet,
      transaksi: data.total_transaksi,
      topMenu: data.top_menu,
      bahan: data.bahan_terpakai,
      status: "Draft"
    };

    laporanData.push(laporan);
    renderTable();

  } catch (err) {
    console.error(err);
    alert("Error ambil laporan");
  }
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable() {
  const tbody = document.getElementById("laporanTable");
  tbody.innerHTML = "";

  laporanData.slice().reverse().forEach(l => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${l.type}</td>
      <td>${l.periode}</td>
      <td>Rp ${Number(l.omzet).toLocaleString("id-ID")}</td>
      <td>${l.transaksi}</td>
      <td>${l.status}</td>
      <td>
        <button onclick="viewDetail('${l.id}')">Detail</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// VIEW DETAIL
// ==========================
function viewDetail(id) {
  const laporan = laporanData.find(l => l.id === id);

  if (!laporan) return;

  let detail = `
OMZET: Rp ${laporan.omzet}

TOP MENU:
${laporan.topMenu.map(m => `- ${m.nama_menu} (${m.total_terjual})`).join("\n")}

BAHAN TERPAKAI:
${laporan.bahan.map(b => `- ${b.nama_bahan} (${b.total_pakai})`).join("\n")}
  `;

  alert(detail);
}

// ==========================
document.getElementById("btnGenerate").addEventListener("click", generateLaporan);