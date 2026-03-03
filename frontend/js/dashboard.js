const sessionUser = getSession();

if (!sessionUser) {
  window.location.href = "index.html";
}

// Header info
document.getElementById("userRole").textContent = sessionUser.role;
document.getElementById("welcomeTitle").textContent =
  "Selamat datang, " + sessionUser.username + " (" + sessionUser.role + ")";

// Menu rendering
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {

    if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    if (menu === "Kelola Menu") window.location.href = "menu.html";
    if (menu === "Kelola Resep") window.location.href = "resep.html";

  });

  menuList.appendChild(li);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});


// ============================
// LOW STOCK BADGE (OWNER ONLY)
// ============================

async function loadLowStock() {

  // Hanya Owner yang perlu badge ini
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
    console.error("Low stock fetch error:", err);
  }
}

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
// Jalankan pertama kali
loadLowStock();

// Auto refresh setiap 30 detik
setInterval(loadLowStock, 30000);