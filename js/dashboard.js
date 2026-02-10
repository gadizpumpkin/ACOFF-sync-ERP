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
  });

  menuList.appendChild(li);
});

document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  window.location.href = "index.html";
});
