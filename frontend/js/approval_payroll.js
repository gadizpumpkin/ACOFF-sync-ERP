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

if (sessionUser.role !== "Owner") {
  alert("Akses ditolak. Approval hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// ==========================
// RBAC MENU
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menuList.innerHTML = "";

menus.forEach(menu => {

  const li = document.createElement("li");

  const a = document.createElement("a");
  a.textContent = menu;

  switch (menu) {
    case "Dashboard":
      a.href = "dashboard.html";
      break;

    case "Approval Pembelian":
      a.href = "approval_pembelian.html";
      break;

    case "Approval Payroll":
      a.href = "approval_payroll.html";
      li.classList.add("active");
      break;

    case "Laporan":
      a.href = "laporan.html";
      break;

    case "Audit Log":
      a.href = "audit_log.html";
      break;

    default:
      a.href = "#";
  }

  li.appendChild(a);
  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getPayrollData() {
  return JSON.parse(localStorage.getItem("payrollData")) || [];
}

function savePayrollData(data) {
  localStorage.setItem("payrollData", JSON.stringify(data));
}

function getPaycheckData() {
  return JSON.parse(localStorage.getItem("paycheckData")) || [];
}

function savePaycheckData(data) {
  localStorage.setItem("paycheckData", JSON.stringify(data));
}

// ==========================
// UTIL FORMAT
// ==========================
function formatRupiah(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

// ==========================
// GENERATE PAYCHECK AFTER APPROVAL
// ==========================
function generatePaycheck(payroll) {

  let paycheck = getPaycheckData();

  payroll.detail.forEach(d => {

    paycheck.push({
      id: "PC-" + Date.now() + "-" + d.user,
      payrollId: payroll.id,
      user: d.user,
      tanggal: payroll.tanggal,
      gaji: d.gaji,
      status: "Published"
    });

  });

  savePaycheckData(paycheck);
}

// ==========================
// RENDER TABLE
// ==========================
function renderPendingPayroll() {

  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = "";

  const payroll = getPayrollData();

  const pending = payroll.filter(p => p.status === "Pending");

  if (pending.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:#888780;">
          Tidak ada payroll pending
        </td>
      </tr>
    `;

    return;
  }

  pending.forEach(p => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.tanggal}</td>

      <td class="cs-td-profit">
        ${formatRupiah(p.totalProfit)}
      </td>

      <td class="cs-td-pool">
        ${formatRupiah(p.payrollPool)}
      </td>

      <td>
        <div class="cs-action-btn">

          <button 
            class="cs-btn-view"
            onclick="viewDetail('${p.id}')"
          >
            Detail
          </button>

          <button 
            class="cs-btn-approve"
            onclick="approvePayroll('${p.id}')"
          >
            Approve
          </button>

          <button 
            class="cs-btn-reject"
            onclick="rejectPayroll('${p.id}')"
          >
            Reject
          </button>

        </div>
      </td>
    `;

    tbody.appendChild(tr);

  });

}

// ==========================
// VIEW DETAIL
// ==========================
function viewDetail(id) {

  const payroll = getPayrollData();

  const item = payroll.find(p => p.id === id);

  if (!item) {
    alert("Payroll tidak ditemukan.");
    return;
  }

  let html = `

    <div class="cs-detail-content">

      <div class="cs-detail-row">
        <div class="cs-detail-label">Tanggal</div>
        <div class="cs-detail-val">
          ${item.tanggal}
        </div>
      </div>

      <div class="cs-detail-row">
        <div class="cs-detail-label">Total Profit</div>
        <div class="cs-detail-val gold">
          ${formatRupiah(item.totalProfit)}
        </div>
      </div>

      <div class="cs-detail-row">
        <div class="cs-detail-label">Payroll Pool</div>
        <div class="cs-detail-val gold">
          ${formatRupiah(item.payrollPool)}
        </div>
      </div>

  `;

  // ======================
  // TABEL DISTRIBUSI
  // ======================
  if (item.detail.length === 0) {

    html += `
      <p style="margin-top:1rem;color:#888780;">
        Tidak ada karyawan hadir
      </p>
    `;

  } else {

    html += `
      <table class="cs-detail-table">

        <thead>
          <tr>
            <th>Karyawan</th>
            <th>Gaji</th>
          </tr>
        </thead>

        <tbody>
    `;

    item.detail.forEach(d => {

      html += `
        <tr>

          <td>
            ${d.user}
          </td>

          <td class="gold">
            ${formatRupiah(d.gaji)}
          </td>

        </tr>
      `;

    });

    html += `
        </tbody>
      </table>
    `;
  }

  // ======================
  // ACTION BUTTON
  // ======================
  html += `

      <div class="cs-detail-actions">

        <button 
          class="cs-btn-detail-approve"
          onclick="approvePayroll('${item.id}')"
        >
          Approve Payroll
        </button>

        <button 
          class="cs-btn-detail-reject"
          onclick="rejectPayroll('${item.id}')"
        >
          Reject
        </button>

      </div>

    </div>
  `;

  document.getElementById("detailPayroll").innerHTML = html;

}

// ==========================
// APPROVE
// ==========================
function approvePayroll(id) {

  let payroll = getPayrollData();

  const item = payroll.find(p => p.id === id);

  if (!item) {
    alert("Payroll tidak ditemukan.");
    return;
  }

  const confirmApprove = confirm(
    "Approve payroll ini?\nPaycheck otomatis dibuat."
  );

  if (!confirmApprove) return;

  item.status = "Approved";

  savePayrollData(payroll);

  generatePaycheck(item);

  alert("Payroll disetujui");

  renderPendingPayroll();

  document.getElementById("detailPayroll").innerHTML = `
    <div class="cs-detail-placeholder">
      Pilih payroll untuk melihat detail distribusi gaji
    </div>
  `;

}

// ==========================
// REJECT
// ==========================
function rejectPayroll(id) {

  let payroll = getPayrollData();

  const item = payroll.find(p => p.id === id);

  if (!item) {
    alert("Payroll tidak ditemukan.");
    return;
  }

  const confirmReject = confirm(
    "Reject payroll ini?"
  );

  if (!confirmReject) return;

  item.status = "Rejected";

  savePayrollData(payroll);

  alert("Payroll ditolak");

  renderPendingPayroll();

  document.getElementById("detailPayroll").innerHTML = `
    <div class="cs-detail-placeholder">
      Pilih payroll untuk melihat detail distribusi gaji
    </div>
  `;

}

// ==========================
// INIT
// ==========================
renderPendingPayroll();