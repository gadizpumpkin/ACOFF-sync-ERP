// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

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
// STORAGE
// ==========================
const getData = (key, defaultVal = []) =>
  JSON.parse(localStorage.getItem(key)) || defaultVal;

const saveData = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

// ==========================
// RULE
// ==========================
function getPayrollRule() {
  return getData("payrollRule", {
    payrollPercent: 30,
    method: "equal"
  });
}

function savePayrollRule(rule) {
  saveData("payrollRule", rule);
}

// ==========================
// UTIL
// ==========================
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatRupiah(num) {
  return "Rp " + (num || 0).toLocaleString("id-ID");
}

// ==========================
// HITUNG PROFIT
// ==========================
function calculateDailyProfit(tanggal) {
  const transaksi = getData("transaksiData");

  const filtered = transaksi.filter(t =>
    t.tanggal === tanggal && t.status === "Paid"
  );

  let revenue = 0;
  let hpp = 0;

  filtered.forEach(t => {
    revenue += t.totalBayar || 0;
    hpp += t.totalHPP || 0;
  });

  return {
    revenue,
    hpp,
    profit: revenue - hpp
  };
}

// ==========================
// ABSENSI
// ==========================
function getHadirEmployees(tanggal) {
  const absensi = getData("absensiData");

  return absensi
    .filter(a => a.tanggal === tanggal && a.status === "Hadir")
    .map(a => a.user);
}

// ==========================
// GENERATE PAYROLL
// ==========================
function generatePayroll() {
  const tanggal = getTodayDate();
  let payrollData = getData("payrollData");

  // cek duplikasi
  if (payrollData.some(p => p.tanggal === tanggal)) {
    alert("Payroll hari ini sudah dibuat.");
    return;
  }

  const rule = getPayrollRule();
  const { profit } = calculateDailyProfit(tanggal);

  const payrollPool = Math.max(
    0,
    Math.floor(profit * (rule.payrollPercent / 100))
  );

  const hadirUsers = getHadirEmployees(tanggal);
  const jumlah = hadirUsers.length;

  let detail = [];

  if (jumlah > 0) {
    const gaji = Math.floor(payrollPool / jumlah);

    detail = hadirUsers.map(u => ({
      user: u,
      gaji,
      hadir: true
    }));
  }

  const newPayroll = {
    id: "PR-" + Date.now(),
    tanggal,
    totalProfit: profit,
    payrollPool,
    status: "Pending",
    detail
  };

  payrollData.push(newPayroll);
  saveData("payrollData", payrollData);

  renderTable();
  alert("Payroll berhasil dibuat!");
}

// ==========================
// RULE FORM
// ==========================
function loadRuleForm() {
  const rule = getPayrollRule();

  document.getElementById("payrollPercent").value = rule.payrollPercent;
  document.getElementById("payrollMethod").value = rule.method;
}

document.getElementById("btnSaveRule").addEventListener("click", () => {
  const percent = parseInt(document.getElementById("payrollPercent").value);
  const method = document.getElementById("payrollMethod").value;

  if (isNaN(percent) || percent < 0 || percent > 100) {
    alert("Persentase tidak valid (0 - 100)");
    return;
  }

  savePayrollRule({ payrollPercent: percent, method });
  alert("Aturan payroll disimpan.");
});

// ==========================
// STATUS UI
// ==========================
function getStatusHTML(status) {
  let className = "pending";

  if (status === "Approved") className = "approved";
  if (status === "Rejected") className = "rejected";

  return `
    <span class="cs-status-pill ${className}">
      <span class="cs-pulse"></span>
      ${status}
    </span>
  `;
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable() {
  const tbody = document.getElementById("payrollTable");
  tbody.innerHTML = "";

  const payroll = getData("payrollData").slice().reverse();

  payroll.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.tanggal}</td>
      <td>${formatRupiah(p.totalProfit)}</td>
      <td>${formatRupiah(p.payrollPool)}</td>
      <td>${getStatusHTML(p.status)}</td>
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
loadRuleForm();
renderTable();