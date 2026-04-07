// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();

if (!sessionUser) {
  window.location.href = "index.html";
}

// ==========================
// HEADER INFO
// ==========================
document.getElementById("userRole").textContent = sessionUser.role;

const welcomeEl = document.getElementById("welcomeTitle");
if (welcomeEl) {
  welcomeEl.textContent =
    "Selamat datang, " + sessionUser.username + " (" + sessionUser.role + ")";
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
  "Generate Laporan": "laporan.html",
  "Lihat Laporan": "laporan.html"
};

// ==========================
// RENDER MENU (SESUAI CSS)
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

// kosongkan dulu (biar tidak double)
menuList.innerHTML = "";

menus.forEach(menu => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = menu;

  // kasih link kalau ada
  if (menuRoutes[menu]) {
    a.href = menuRoutes[menu];
  } else {
    a.href = "#";
  }

  li.appendChild(a);
  menuList.appendChild(li);
});

// ==========================
// LOGOUT
// ==========================
document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

// ==========================
// EXPORT PNL
// ==========================
function exportPnl() {
  const year = 2026;
  const month = 3;

  const token = localStorage.getItem("token");

  window.open(
    `http://localhost:5000/api/report/export-pnl?year=${year}&month=${month}&token=${token}`
  );
}

// ============================
// LOW STOCK BADGE (OWNER)
// ============================
async function loadLowStock() {

  if (sessionUser.role !== "Owner") return;

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
      badge.style.display = "inline-block";
      badge.innerText = data.total_low_stock + " Low Stock";
    } else {
      badge.style.display = "none";
    }

  } catch (err) {
    console.error("Low stock error:", err);
  }
}

// klik badge
const badge = document.getElementById("lowStockBadge");

if (badge) {
  badge.addEventListener("click", async () => {

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
  });
}

// INIT
loadLowStock();
setInterval(loadLowStock, 30000);