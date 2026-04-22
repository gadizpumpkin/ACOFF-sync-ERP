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

// hanya karyawan
if (sessionUser.role !== "KARYAWAN") {
  alert("Akses ditolak. Paycheck hanya untuk Karyawan.");
  window.location.href = "dashboard.html";
}

// ==========================
// RBAC MENU (optional, biar konsisten)
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menuList.innerHTML = ""; // reset dulu

menus.forEach(menu => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = menu;

  // routing sederhana
  if (menu === "Dashboard") a.href = "dashboard.html";
  else if (menu === "Absensi") a.href = "absensi.html";
  else if (menu === "Transaksi") a.href = "transaksi.html";
  else if (menu === "Paycheck") {
    a.href = "paycheck.html";
    li.classList.add("active");
  } else if (menu === "Laporan") a.href = "laporan.html";
  else a.href = "#";

  li.appendChild(a);
  menuList.appendChild(li);
});

// ==========================
// STORAGE (AMBIL DARI PAYROLL)
// ==========================
function getPayrollData() {
  return JSON.parse(localStorage.getItem("payrollData")) || [];
}

// ==========================
// FORMAT STATUS UI
// ==========================
function getStatusHTML(status) {
  if (status === "Approved") {
    return `<span class="cs-status-pill published">
              <span class="cs-pulse"></span> Published
            </span>`;
  }

  return `<span class="cs-status-pill pending">
            <span class="cs-pulse"></span> Pending
          </span>`;
}

// ==========================
// RENDER PAYCHECK
// ==========================
function renderPaycheckTable() {
  const tbody = document.getElementById("paycheckTable");
  tbody.innerHTML = "";

  const payroll = getPayrollData();

  let myPaychecks = [];

  // ambil hanya data milik user
  payroll.forEach(p => {
    if (!p.detail) return;

    p.detail.forEach(d => {
      if (d.user === sessionUser.username) {
        myPaychecks.push({
          tanggal: p.tanggal,
          gaji: d.gaji,
          status: p.status
        });
      }
    });
  });

  // jika kosong
  if (myPaychecks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:#888;">
          Belum ada data gaji
        </td>
      </tr>
    `;
    return;
  }

  // render
  myPaychecks
    .slice()
    .reverse()
    .forEach(p => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${p.tanggal}</td>
        <td class="cs-td-gaji">Rp ${p.gaji.toLocaleString("id-ID")}</td>
        <td>${getStatusHTML(p.status)}</td>
      `;

      tbody.appendChild(tr);
    });
}

// ==========================
// EXPORT
// ==========================
function getMyPaycheckData() {
  const payroll = getPayrollData();
  let result = [];

  payroll.forEach(p => {
    if (!p.detail) return;

    p.detail.forEach(d => {
      if (d.user === sessionUser.username) {
        result.push({
          tanggal: p.tanggal,
          gaji: d.gaji,
          status: p.status
        });
      }
    });
  });

  return result;
}

function exportPaycheckExcel() {
  const data = getMyPaycheckData();

  let rows = [];
  rows.push(["Slip Gaji Coffee Street"]);
  rows.push(["Karyawan", sessionUser.username]);
  rows.push([]);
  rows.push(["Tanggal", "Gaji", "Status"]);

  data.forEach(p => {
    rows.push([p.tanggal, p.gaji, p.status]);
  });

  exportToCSV(`paycheck_${sessionUser.username}.csv`, rows);
}

// ==========================
// EVENT
// ==========================
document
  .getElementById("btnExportPaycheckPDF")
  .addEventListener("click", function () {
    exportToPDF();
  });

document
  .getElementById("btnExportPaycheckExcel")
  .addEventListener("click", exportPaycheckExcel);

// ==========================
// INIT
// ==========================
renderPaycheckTable();