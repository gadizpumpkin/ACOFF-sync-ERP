// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  window.location.href = "index.html";
});

if (sessionUser.role !== "Owner") {
  alert("Akses ditolak. Approval hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Approval Payroll") window.location.href = "approval_payroll.html";
    else alert("Menu belum dibuat: " + menu);
  });

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

  pending.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.tanggal}</td>
      <td>Rp ${p.totalProfit.toLocaleString("id-ID")}</td>
      <td>Rp ${p.payrollPool.toLocaleString("id-ID")}</td>
      <td>
        <div class="action-btn">
          <button class="btn-view" onclick="viewDetail('${p.id}')">Detail</button>
          <button class="btn-approve" onclick="approvePayroll('${p.id}')">Approve</button>
          <button class="btn-reject" onclick="rejectPayroll('${p.id}')">Reject</button>
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

  if (!item) return alert("Payroll tidak ditemukan.");

  let html = `
    <p><b>Tanggal:</b> ${item.tanggal}</p>
    <p><b>Total Profit:</b> Rp ${item.totalProfit.toLocaleString("id-ID")}</p>
    <p><b>Payroll Pool:</b> Rp ${item.payrollPool.toLocaleString("id-ID")}</p>
    <h4>Detail Pembagian</h4>
  `;

  if (item.detail.length === 0) {
    html += `<p>Tidak ada karyawan hadir.</p>`;
  } else {
    html += `<ul>`;
    item.detail.forEach(d => {
      html += `<li>${d.user} → Rp ${d.gaji.toLocaleString("id-ID")}</li>`;
    });
    html += `</ul>`;
  }

  document.getElementById("detailPayroll").innerHTML = html;
}

// ==========================
// APPROVE
// ==========================
function approvePayroll(id) {
  let payroll = getPayrollData();
  const item = payroll.find(p => p.id === id);

  if (!item) return alert("Payroll tidak ditemukan.");

  if (!confirm("Approve payroll ini? Setelah approve, paycheck akan dibuat.")) return;

  item.status = "Approved";

  savePayrollData(payroll);

  // generate paycheck
  generatePaycheck(item);

  alert("Payroll disetujui dan paycheck berhasil dibuat.");
  renderPendingPayroll();
  document.getElementById("detailPayroll").innerHTML = "Pilih payroll untuk melihat detail.";
}

// ==========================
// REJECT
// ==========================
function rejectPayroll(id) {
  let payroll = getPayrollData();
  const item = payroll.find(p => p.id === id);

  if (!item) return alert("Payroll tidak ditemukan.");

  if (!confirm("Reject payroll ini?")) return;

  item.status = "Rejected";

  savePayrollData(payroll);

  alert("Payroll ditolak.");
  renderPendingPayroll();
  document.getElementById("detailPayroll").innerHTML = "Pilih payroll untuk melihat detail.";
}

// INIT
renderPendingPayroll();
