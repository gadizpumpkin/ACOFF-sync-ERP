// ==========================
// ISOLATED SCOPE 
// ==========================
(function () {

  // ==========================
  // AUTH & SESSION
  // ==========================
  console.log("SESSION:", getSession());
  const sessionUser = getSession();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  console.log("SESSION:", sessionUser);
  console.log("ROLE:", sessionUser?.role);
  console.log("MENUS:", getMenuByRole(sessionUser?.role));

  // redirect kalau tidak login
  if (!sessionUser && !token) {
    window.location.href = "index.html";
    return;
  }

  // ==========================
  // HEADER INFO
  // ==========================
  const roleEl = document.getElementById("userRole");
  if (roleEl && sessionUser) {
    roleEl.textContent = sessionUser.role;
  }

  const welcomeEl = document.getElementById("welcomeTitle");
  if (welcomeEl && username) {
    welcomeEl.textContent = `Selamat datang, ${username} 👋`;
  }

  // ==========================
  // MENU MAPPING
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
  "Approval Payroll": "approval_payroll.html",
  "Approval Laporan": "approval_laporan.html",
  "Audit Keuangan": "audit_log.html",
  "Generate Laporan": "laporan.html",
  "Lihat Laporan": "laporan.html",
  "Paycheck": "paycheck.html"
};

  // ==========================
  // RENDER MENU
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
  window.exportPnl = function () {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    window.open(
      `http://localhost:5000/api/report/export-pnl?year=${year}&month=${month}&token=${token}`
    );
  };

  // ==========================
  // LOW STOCK
  // ==========================
  async function loadLowStock() {

    if (!sessionUser || sessionUser.role !== "Owner") return;

    try {
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
  // BADGE CLICK
  // ==========================
  const badge = document.getElementById("lowStockBadge");

  if (badge) {
    badge.addEventListener("click", async () => {

      try {
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

})();