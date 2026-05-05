// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
const token = localStorage.getItem("token");

console.log("SESSION USER:", sessionUser);
console.log("ROLE:", sessionUser?.role);

// cek login
if (!sessionUser) {
  window.location.href = "index.html";
}

// tampilkan role
document.getElementById("userRole").textContent = sessionUser.role;

// logout
document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
});

//debugging: pastikan role sudah benar sebelum cek akses
console.log("SEBELUM ROLE CHECK");

if (sessionUser.role !== "OWNER") {
  console.log("MASUK IF ROLE");
  alert("Akses ditolak. Approval Payroll hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

console.log("LOLOS ROLE CHECK");

// hanya Owner boleh approve payroll
if (sessionUser.role !== "OWNER") {
  alert("Akses ditolak. Approval Payroll hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// ==========================
// FORMAT
// ==========================
function formatRupiah(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

// ==========================
// FETCH DATA
// ==========================
async function getPendingPayroll() {
  try {
    const res = await fetch("http://localhost:5000/api/payroll/pending", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    return await res.json();

  } catch (err) {
    console.error(err);
    return [];
  }
}

// ==========================
// RENDER TABLE
// ==========================
async function renderPendingPayroll() {

  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = "";

  const data = await getPendingPayroll();

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#888;">
          Tidak ada payroll pending
        </td>
      </tr>
    `;
    return;
  }

  data.forEach(p => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.periode_awal} s/d ${p.periode_akhir}</td>
      <td>${formatRupiah(p.total_gaji)}</td>
      <td>${p.processed_by || "-"}</td>
      <td>
        <button onclick="approvePayroll(${p.id})">Approve</button>
        <button onclick="rejectPayroll(${p.id})">Reject</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// APPROVE
// ==========================
async function approvePayroll(id) {

  if (!confirm("Approve payroll ini?")) return;

  try {

    const res = await fetch(`http://localhost:5000/api/payroll/approve/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    alert(data.message);

    renderPendingPayroll();

  } catch (err) {
    console.error(err);
    alert("Terjadi error");
  }
}

// ==========================
// REJECT
// ==========================
async function rejectPayroll(id) {

  if (!confirm("Reject payroll ini?")) return;

  try {

    const res = await fetch(`http://localhost:5000/api/payroll/reject/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    alert(data.message);

    renderPendingPayroll();

  } catch (err) {
    console.error(err);
    alert("Terjadi error");
  }
}

// ==========================
// INIT
// ==========================
renderPendingPayroll();