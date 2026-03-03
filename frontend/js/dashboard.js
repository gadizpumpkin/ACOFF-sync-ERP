const sessionUser = getSession();

if (!sessionUser) {
  window.location.href = "index.html";
}

document.getElementById("userRole").textContent = sessionUser.role;
document.getElementById("welcomeTitle").textContent =
  "Selamat datang, " + sessionUser.username + " (" + sessionUser.role + ")";

const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    alert("Anda membuka menu: " + menu);
    // nanti diarahkan ke halaman modul masing-masing
    if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    if (menu === "Kelola Menu") window.location.href = "menu.html";
    if (menu === "Kelola Resep") window.location.href = "resep.html";

  });

  menuList.appendChild(li);
});

document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  window.location.href = "index.html";
});
async function loadLowStock() {

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/dashboard/low-stock", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  const badge = document.getElementById("lowStockBadge");

  if (data.total_low_stock > 0) {
    badge.style.display = "inline-block";
    badge.innerText = data.total_low_stock + " Low Stock";
  } else {
    badge.style.display = "none";
  }
}
setInterval(() => {
  loadLowStock();
}, 30000);

loadLowStock();

