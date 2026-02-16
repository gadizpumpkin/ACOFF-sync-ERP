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

if (sessionUser.role !== "Manajer") {
  alert("Akses ditolak. Payroll hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Payroll") window.location.href = "payroll.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getPayrollRule() {
  return JSON.parse(localStorage.getItem("payrollRule")) || {
    payrollPercent: 30,
    method: "equal"
  };
}

function savePayrollRule(rule) {
  localStorage.setItem("payrollRule", JSON.stringify(rule));
}

function getPayrollData() {
  return JSON.parse(localStorage.getItem("payrollData")) || [];
}

function savePayrollData(data) {
  localStorage.setItem("payrollData", JSON.stringify(data));
}

function getAbsensiData() {
  return JSON.parse(localStorage.getItem("absensiData")) || [];
}

function getTransaksiData() {
  return JSON.parse(localStorage.getItem("transaksiData")) || [];
}

// ==========================
// UTIL
// ==========================
function getTodayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ==========================
// HITUNG PROFIT HARIAN
// ==========================
// profit = total penjualan hari ini (Paid) - total HPP hari ini
// (HPP harus sudah dihitung saat transaksi dibuat)
function calculateDailyProfit(tanggal) {
  const transaksi = getTransaksiData();

  const paidToday = transaksi.filter(t =>
    t.tanggal === tanggal && t.status === "Paid"
  );

  let totalRevenue = 0;
  let totalHPP = 0;

  paidToday.forEach(t => {
    totalRevenue += t.totalBayar;
    totalHPP += t.totalHPP || 0;
  });

  return {
    revenue: totalRevenue,
    hpp: totalHPP,
    profit: totalRevenue - totalHPP
  };
}

// ==========================
// GET KARYAWAN HADIR
// ==========================
function getHadirEmployees(tanggal) {
  const absensi = getAbsensiData();

  const hadir = absensi.filter(a =>
    a.tanggal === tanggal &&
    a.status === "Hadir"
  );

  return hadir.map(h => h.user);
}

// ==========================
// GENERATE PAYROLL
// ==========================
function generatePayroll() {
  const tanggal = getTodayDate();

  const payrollHistory = getPayrollData();
  const already = payrollHistory.find(p => p.tanggal === tanggal);

  if (already) {
    alert("Payroll untuk hari ini sudah dibuat.");
    return;
  }

  const rule = getPayrollRule();
  const profitInfo = calculateDailyProfit(tanggal);

  if (profitInfo.profit <= 0) {
    alert("Profit hari ini <= 0. Payroll otomatis 0.");
  }

  const payrollPool = Math.max(0, Math.floor(profitInfo.profit * (rule.payrollPercent / 100)));

  const hadirUsers = getHadirEmployees(tanggal);

  // Untuk simulasi, sistem hanya bayar yang hadir
  const jumlahHadir = hadirUsers.length;

  let detail = [];

  // Jika tidak ada yang hadir
  if (jumlahHadir === 0) {
    detail = [];
  } else {
    const gajiPerOrang = Math.floor(payrollPool / jumlahHadir);

    hadirUsers.forEach(u => {
      detail.push({
        user: u,
        hadir: true,
        gaji: gajiPerOrang
      });
    });
  }

  const payroll = {
    id: "PR-" + Date.now(),
    tanggal: tanggal,
    totalProfit: profitInfo.profit,
    payrollPool: payrollPool,
    status: "Pending",
    detail: detail
  };

  payrollHistory.push(payroll);
  savePayrollData(payrollHistory);

  renderPayrollTable();
  alert("Payroll berhasil dibuat (Pending Approval Owner).");
}

// ==========================
// SAVE RULE
// ==========================
function loadRuleForm() {
  const rule = getPayrollRule();

  document.getElementById("payrollPercent").value = rule.payrollPercent;
  document.getElementById("payrollMethod").value = rule.method;
}

document.getElementById("btnSaveRule").addEventListener("click", function() {
  const percent = parseInt(document.getElementById("payrollPercent").value);
  const method = document.getElementById("payrollMethod").value;

  if (isNaN(percent) || percent < 0 || percent > 100) {
    alert("Persentase payroll tidak valid.");
    return;
  }

  savePayrollRule({
    payrollPercent: percent,
    method: method
  });

  alert("Aturan payroll berhasil disimpan.");
});

// ==========================
// RENDER TABLE
// ==========================
function renderPayrollTable() {
  const tbody = document.getElementById("payrollTable");
  tbody.innerHTML = "";

  const payroll = getPayrollData().slice().reverse();

  payroll.forEach(p => {
    let statusClass = "status-pending";
    if (p.status === "Approved") statusClass = "status-approved";
    if (p.status === "Rejected") statusClass = "status-rejected";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.tanggal}</td>
      <td>Rp ${p.totalProfit.toLocaleString("id-ID")}</td>
      <td>Rp ${p.payrollPool.toLocaleString("id-ID")}</td>
      <td class="${statusClass}">${p.status}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document.getElementById("btnGeneratePayroll").addEventListener("click", generatePayroll);

// INIT
document.getElementById("tanggalHariIni").textContent = getTodayDate();
loadRuleForm();
renderPayrollTable();
