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

function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function getResepData() {
  return JSON.parse(localStorage.getItem("resepData")) || [];
}

function saveResepData(data) {
  localStorage.setItem("resepData", JSON.stringify(data));
}

// LOAD DROPDOWN
function loadDropdowns() {
  const menuSelect = document.getElementById("selectMenu");
  const bahanSelect = document.getElementById("selectBahan");

  menuSelect.innerHTML = "";
  bahanSelect.innerHTML = "";

  const menus = getMenuData();
  const bahan = getBahanBakuData();

  if (menus.length === 0) {
    menuSelect.innerHTML = `<option value="">Menu kosong (buat menu dulu)</option>`;
  } else {
    menus.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.nama;
      menuSelect.appendChild(opt);
    });
  }

  if (bahan.length === 0) {
    bahanSelect.innerHTML = `<option value="">Bahan baku kosong (buat bahan dulu)</option>`;
  } else {
    bahan.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.nama;
      bahanSelect.appendChild(opt);
    });
  }
}

// RENDER TABLE
function renderTable() {
  const tbody = document.getElementById("resepTable");
  tbody.innerHTML = "";

  const resepData = getResepData();
  const menuData = getMenuData();
  const bahanData = getBahanBakuData();

  resepData.forEach(item => {
    const menu = menuData.find(m => m.id === item.menuId);
    const bahan = bahanData.find(b => b.id === item.bahanId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${menu ? menu.nama : "(Menu dihapus)"}</td>
      <td>${bahan ? bahan.nama : "(Bahan dihapus)"}</td>
      <td>${item.gram}</td>
      <td>
        <button class="btn-delete" onclick="deleteResep('${item.id}')">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ADD RESEP DETAIL
document.getElementById("resepForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (sessionUser.role !== "Manajer") {
    alert("Akses ditolak. Hanya Manajer yang dapat mengelola resep.");
    return;
  }

  const menuId = document.getElementById("selectMenu").value;
  const bahanId = document.getElementById("selectBahan").value;
  const gram = parseInt(document.getElementById("jumlahGram").value);

  if (!menuId || !bahanId) {
    alert("Menu atau bahan baku belum tersedia.");
    return;
  }

  let resepData = getResepData();

  // Cegah duplikasi resep untuk menu + bahan baku sama
  const exists = resepData.find(r => r.menuId === menuId && r.bahanId === bahanId);

  if (exists) {
    alert("Resep untuk menu dan bahan baku ini sudah ada.");
    return;
  }

  resepData.push({
    id: Date.now().toString(),
    menuId,
    bahanId,
    gram
  });

  saveResepData(resepData);
  document.getElementById("jumlahGram").value = "";
  renderTable();
});

function deleteResep(id) {
  if (!confirm("Yakin ingin menghapus detail resep ini?")) return;

  let resepData = getResepData();
  resepData = resepData.filter(r => r.id !== id);

  saveResepData(resepData);
  renderTable();
}

// INIT
loadDropdowns();
renderTable();
