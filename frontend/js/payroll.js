// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

const token = localStorage.getItem("token");

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

if (sessionUser.role !== "MANAGER") {
  alert("Akses ditolak. Payroll hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// ==========================
// UTIL
// ==========================
function formatRupiah(num) {
  return "Rp " + (num || 0).toLocaleString("id-ID");
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// ==========================
// HITUNG PROFIT (AMBIL DARI API)
// ==========================
async function calculateDailyProfit(tanggal) {
  try {
    const res = await fetch(`http://localhost:5000/api/transaksi/profit?tanggal=${tanggal}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    return data.profit || 0;

  } catch (err) {
    console.error("Error ambil profit:", err);
    return 0;
  }
}

// ==========================
// GENERATE PAYROLL (API)
// ==========================
async function generatePayroll() {

  const tanggal = getTodayDate();

  try {

    const res = await fetch(
      "http://localhost:5000/api/payroll/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          periode_awal: tanggal,
          periode_akhir: tanggal
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Gagal generate payroll");
      return;
    }

    alert(data.message);

    loadPayroll();

  } catch (err) {

    console.error(err);

    alert("Terjadi error");
  }
}

// ==========================
// LOAD PAYROLL DARI DATABASE
// ==========================
async function loadPayroll() {
  try {
    const res = await fetch("http://localhost:5000/api/payroll/pending", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    renderTable(data);

  } catch (err) {
    console.error("Error load payroll:", err);
  }
}

// ==========================
// STATUS UI
// ==========================
function getStatusHTML(status) {
  let className = "pending";

  if (status === "Published") className = "approved";
  if (status === "Rejected") className = "rejected";

  return `
    <span class="cs-status-pill ${className}">
      <span class="cs-pulse"></span>
      ${status}
    </span>
  `;
}

// ==========================
// RENDER TABLE (DATABASE)
// ==========================
function renderTable(payroll) {
  const tbody = document.getElementById("payrollTable");
  tbody.innerHTML = "";

  payroll.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.periode_awal} - ${p.periode_akhir}</td>
      <td>${formatRupiah(p.total_gaji)}</td>
      <td>${getStatusHTML(p.status)}</td>
      <td>${p.processed_by || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document
  .getElementById("btnGeneratePayroll")
  .addEventListener("click", generatePayroll);

// ==========================
// INIT
// ==========================
loadPayroll();