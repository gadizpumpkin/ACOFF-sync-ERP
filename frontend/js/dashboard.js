// ==========================
// AUTH CHECK (SINKRON HTML)
// ==========================
const sessionUser = getSession();
const token = localStorage.getItem("token");

// fallback kalau pakai token saja
if (!sessionUser && !token) {
  window.location.href = "index.html";
}

// ==========================
// HEADER INFO
// ==========================
const roleEl = document.getElementById("userRole");
if (roleEl && sessionUser) {
  roleEl.textContent = sessionUser.role;
}

// welcome (HTML sudah ada script juga, jadi kita handle aman)
const welcomeEl = document.getElementById("welcomeTitle");
if (welcomeEl && sessionUser) {
  welcomeEl.textContent = `Selamat datang, ${sessionUser.username} 👋`;
}

// ==========================
// MENU MAPPING (ROUTING)
// ==========================
const menuRoutes = {
  "Dashboard": "dashboard.html",
  "Absensi": "absensi.html",
  "Transaksi Penjualan": "transaksi.html",
  "Kelola Menu": "menu.html",
  "Kelola Resep": "resep.html",
  "Kelola Bahan Baku": "bahanbaku.html",
  "Kelola Supplier": "supplier.html",
  "Pembelian Bahan Baku": "pembelian.html",
  "Approval Pembelian": "approval_pembelian.html",
  "Generate Laporan": "laporan.html",
  "Lihat Laporan": "laporan.html"
};

// ==========================
// RENDER MENU (SESUAI CSS)
// ==========================
const menuList = document.getElementById("menuList");

if (menuList && sessionUser) {
  const menus = getMenuByRole(sessionUser.role);

  menuList.innerHTML = "";

  menus.forEach(menu => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = menu;
    a.href = menuRoutes[menu] || "#";

    // aktifkan highlight menu dashboard
    if (menu === "Dashboard") {
      li.classList.add("active");
    }

    li.appendChild(a);
    menuList.appendChild(li);
  });
}

// ==========================
// LOGOUT
// ==========================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    clearSession();
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// ==========================
// EXPORT PNL
// ==========================
function exportPnl() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const token = localStorage.getItem("token");

  window.open(
    `http://localhost:5000/api/report/export-pnl?year=${year}&month=${month}&token=${token}`
  );
}

// ============================
// LOW STOCK BADGE (OWNER ONLY)
// ============================
async function loadLowStock() {

  if (!sessionUser || sessionUser.role !== "Owner") return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/dashboard/low-stock", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401) {
      clearSession();
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return;
    }

    const data = await res.json();
    const badge = document.getElementById("lowStockBadge");

    if (!badge) return;

    if (data.total_low_stock > 0) {
      badge.style.display = "inline-flex";
      badge.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1.5l4.5 8H1.5L6 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M6 5v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="6" cy="9" r="0.5" fill="currentColor"/>
        </svg>
        ${data.total_low_stock} Low Stock
      `;
    } else {
      badge.style.display = "none";
    }

  } catch (err) {
    console.error("Low stock error:", err);
  }
}

// ==========================
// BADGE CLICK DETAIL
// ==========================
const badge = document.getElementById("lowStockBadge");

if (badge) {
  badge.addEventListener("click", async () => {

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/dashboard/low-stock", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      const data = await res.json();

      let detail = "LOW STOCK:\n\n";

      data.data.forEach(item => {
        detail += `${item.nama} → Stok: ${item.stok} (Min: ${item.minimal_stok})\n`;
      });

      alert(detail);

    } catch (err) {
      console.error(err);
    }
  });
}

// ==========================
// INIT
// ==========================
loadLowStock();
setInterval(loadLowStock, 30000);