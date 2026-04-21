// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
});

// ==========================
// RBAC MENU (TIDAK RUSAK SIDEBAR HTML)
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

// OPTIONAL: kalau mau dynamic replace, aktifkan ini
// menuList.innerHTML = "";

menus.forEach(menu => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = menu;
  a.href = "#";

  a.addEventListener("click", function () {
    if (menu === "Kelola Menu") window.location.href = "menu.html";
    else if (menu === "Kelola Resep") window.location.href = "resep.html";
    else if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    else alert("Menu belum dibuat: " + menu);
  });

  li.appendChild(a);
  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
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

// ==========================
// LOAD DROPDOWN
// ==========================
function loadDropdowns() {
  const menuSelect = document.getElementById("selectMenu");
  const bahanSelect = document.getElementById("selectBahan");

  menuSelect.innerHTML = `<option value="" disabled selected>-- Pilih menu --</option>`;
  bahanSelect.innerHTML = `<option value="" disabled selected>-- Pilih bahan --</option>`;

  const menus = getMenuData();
  const bahan = getBahanBakuData();

  if (menus.length === 0) {
    menuSelect.innerHTML += `<option value="">Menu kosong</option>`;
  } else {
    menus.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.nama;
      menuSelect.appendChild(opt);
    });
  }

  if (bahan.length === 0) {
    bahanSelect.innerHTML += `<option value="">Bahan kosong</option>`;
  } else {
    bahan.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.nama;
      bahanSelect.appendChild(opt);
    });
  }
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable() {
  const tbody = document.getElementById("resepTable");
  const countEl = document.getElementById("resepCount");

  tbody.innerHTML = "";

  const resepData = getResepData();
  const menuData = getMenuData();
  const bahanData = getBahanBakuData();

  if (resepData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="cs-empty">
          Belum ada data resep
        </td>
      </tr>
    `;
  }

  resepData.forEach(item => {
    const menu = menuData.find(m => m.id === item.menuId);
    const bahan = bahanData.find(b => b.id === item.bahanId);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div class="cs-menu-tag">
          <span class="cs-menu-dot"></span>
          ${menu ? menu.nama : "(Menu dihapus)"}
        </div>
      </td>
      <td>${bahan ? bahan.nama : "(Bahan dihapus)"}</td>
      <td>
        <span class="cs-gram-badge">
          ${item.gram}
          <span class="cs-gram-unit">gram</span>
        </span>
      </td>
      <td>
        <button class="cs-btn-delete" onclick="deleteResep('${item.id}')">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // UPDATE COUNT
  countEl.textContent = `${resepData.length} resep`;
}

// ==========================
// ADD RESEP
// ==========================
document.getElementById("resepForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (sessionUser.role !== "MANAGER") {
    alert("Akses ditolak. Hanya Manajer.");
    return;
  }

  const menuId = document.getElementById("selectMenu").value;
  const bahanId = document.getElementById("selectBahan").value;
  const gram = parseFloat(document.getElementById("jumlahGram").value);

  if (!menuId || !bahanId) {
    alert("Menu atau bahan belum dipilih.");
    return;
  }

  let resepData = getResepData();

  const exists = resepData.find(r => r.menuId === menuId && r.bahanId === bahanId);

  if (exists) {
    alert("Resep sudah ada.");
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

// ==========================
// DELETE
// ==========================
function deleteResep(id) {
  if (!confirm("Yakin hapus resep ini?")) return;

  let resepData = getResepData();
  resepData = resepData.filter(r => r.id !== id);

  saveResepData(resepData);
  renderTable();
}

// ==========================
// INIT
// ==========================
loadDropdowns();
renderTable();
