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

if (sessionUser.role !== "Karyawan") {
  alert("Akses ditolak. Paycheck hanya untuk Karyawan.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Paycheck") window.location.href = "paycheck.html";
    else if (menu === "Absensi") window.location.href = "absensi.html";
    else if (menu === "Transaksi Penjualan") window.location.href = "transaksi.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getPaycheckData() {
  return JSON.parse(localStorage.getItem("paycheckData")) || [];
}

// ==========================
// RENDER PAYCHECK
// ==========================
function renderPaycheckTable() {
  const tbody = document.getElementById("paycheckTable");
  tbody.innerHTML = "";

  const paycheck = getPaycheckData().filter(p => p.user === sessionUser.username);

  paycheck.slice().reverse().forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.tanggal}</td>
      <td>Rp ${p.gaji.toLocaleString("id-ID")}</td>
      <td class="status-published">${p.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// INIT
renderPaycheckTable();
