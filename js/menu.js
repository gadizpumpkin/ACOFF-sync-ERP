// AUTH CHECK
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  window.location.href = "index.html";
});

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Kelola Menu") window.location.href = "menu.html";
    else if (menu === "Kelola Resep") window.location.href = "resep.html";
    else if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// STORAGE
function getMenuData() {
  return JSON.parse(localStorage.getItem("menuData")) || [];
}

function saveMenuData(data) {
  localStorage.setItem("menuData", JSON.stringify(data));
}

// RENDER
function renderTable() {
  const tbody = document.getElementById("menuTable");
  tbody.innerHTML = "";

  const data = getMenuData();

  data.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>
        <button class="btn-edit" onclick="editMenu('${item.id}')">Edit</button>
        <button class="btn-delete" onclick="deleteMenu('${item.id}')">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// CRUD
document.getElementById("menuForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (sessionUser.role !== "Manajer") {
    alert("Akses ditolak. Hanya Manajer yang dapat mengelola menu.");
    return;
  }

  const id = document.getElementById("menuId").value;
  const nama = document.getElementById("menuNama").value.trim();
  const harga = parseInt(document.getElementById("menuHarga").value);

  let data = getMenuData();

  if (id) {
    data = data.map(item => {
      if (item.id === id) return { ...item, nama, harga };
      return item;
    });
  } else {
    data.push({
      id: Date.now().toString(),
      nama,
      harga
    });
  }

  saveMenuData(data);
  resetForm();
  renderTable();
});

function editMenu(id) {
  const data = getMenuData();
  const item = data.find(x => x.id === id);

  document.getElementById("menuId").value = item.id;
  document.getElementById("menuNama").value = item.nama;
  document.getElementById("menuHarga").value = item.harga;

  document.getElementById("btnSubmit").textContent = "Update";
}

function deleteMenu(id) {
  if (!confirm("Yakin ingin menghapus menu ini?")) return;

  let data = getMenuData();
  data = data.filter(item => item.id !== id);

  saveMenuData(data);
  renderTable();
}

function resetForm() {
  document.getElementById("menuId").value = "";
  document.getElementById("menuNama").value = "";
  document.getElementById("menuHarga").value = "";
  document.getElementById("btnSubmit").textContent = "Simpan";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

// INIT
renderTable();
