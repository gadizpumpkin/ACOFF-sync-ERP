// ==========================
// AUTH
// ==========================
const sessionUser = getSession();

if (!sessionUser) {
  window.location.href = "index.html";
}

const token = localStorage.getItem("token");

document.getElementById("userRole").textContent =
  sessionUser.role;

document.getElementById("logoutBtn")
.addEventListener("click", () => {

  clearSession();

  window.location.href = "index.html";
});

// ==========================
// ROLE CHECK
// ==========================
if (
  sessionUser.role !== "MANAGER" &&
  sessionUser.role !== "OWNER"
) {
  alert("Akses ditolak");

  window.location.href = "dashboard.html";
}

// ==========================
// UTIL
// ==========================
function getTodayDate() {

  return new Date()
    .toISOString()
    .split("T")[0];
}

function formatRupiah(num) {

  return "Rp " +
    Number(num || 0)
    .toLocaleString("id-ID");
}

// ==========================
// GENERATE PAYROLL
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

    console.log(data);

    if (!res.ok) {

      alert(data.error || "Gagal generate payroll");

      return;
    }

    alert(data.message);

    loadPayroll();

  } catch (err) {

    console.error(err);

    alert("Backend tidak dapat diakses");
  }
}

// ==========================
// LOAD PAYROLL
// ==========================
async function loadPayroll() {

  try {

    const res = await fetch(
      "http://localhost:5000/api/payroll/pending",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    renderTable(data);

  } catch (err) {

    console.error(
      "Error load payroll:",
      err
    );
  }
}

// ==========================
// STATUS UI
// ==========================
function getStatusHTML(status) {

  let className = "pending";

  if (status === "Published") {
    className = "approved";
  }

  if (status === "Rejected") {
    className = "rejected";
  }

  return `
    <span class="cs-status-pill ${className}">
      ${status}
    </span>
  `;
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable(payroll) {

  const tbody =
    document.getElementById("payrollTable");

  tbody.innerHTML = "";

  payroll.forEach((p) => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>
        ${p.periode_awal}
        -
        ${p.periode_akhir}
      </td>

      <td>
        ${formatRupiah(p.total_gaji)}
      </td>

      <td>
        ${getStatusHTML(p.status)}
      </td>

      <td>
        ${p.processed_by || "-"}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document
  .getElementById("btnGeneratePayroll")
  .addEventListener(
    "click",
    generatePayroll
  );

// ==========================
// INIT
// ==========================
loadPayroll();