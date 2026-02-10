// ==========================
// AUTH CHECK + ROLE
// ==========================
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
    if (menu === "Kelola Bahan Baku") {
      window.location.href = "bahanbaku.html";
    } else {
      alert("Menu belum dibuat: " + menu);
    }
  });

  menuList.appendChild(li);
});

// ==========================
// DATA STORAGE (localStorage)
// ==========================
function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function saveBahanBakuData(data) {
  localStorage.setItem("bahanBakuData", JSON.stringify(data));
}

// ==========================
// RENDER TABLE + WARNING
// ==========================
function renderTable() {
  const tbody = document.getElementById("bahanBakuTable");
  tbody.innerHTML = "";

  const data = getBahanBakuData();

  data.forEach(item => {
    const status = item.stok < item.stokMin ? "LOW" : "OK";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.stok}</td>
      <td>${item.stokMin}</td>
      <td class="${status === "LOW" ? "status-low" : "status-ok"}">
        ${status}
      </td>
      <td>
        <button class="btn-edit" onclick="editBahan('${item.id}')">Edit</button>
        <button class="btn-delete" onclick="deleteBahan('${item.id}')">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  renderWarning();
}

function renderWarning() {
  const warningList = document.getElementById("stokWarningList");
  warningList.innerHTML = "";

  const data = getBahanBakuData();
  const lowStock = data.filter(item => item.stok < item.stokMin);

  if (lowStock.length === 0) {
    warningList.innerHTML = "<li>Tidak ada stok rendah.</li>";
    return;
  }

  lowStock.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `Stok ${item.nama} rendah (${item.stok} gram, minimum ${item.stokMin} gram)`;
    warningList.appendChild(li);
  });
}

// ==========================
// CRUD ACTIONS
// ==========================
document.getElementById("bahanBakuForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (sessionUser.role !== "Manajer") {
    alert("Akses ditolak. Hanya Manajer yang boleh mengelola bahan baku.");
    return;
  }

  const id = document.getElementById("idBahan").value;
  const nama = document.getElementById("namaBahan").value.trim();
  const stok = parseInt(document.getElementById("stokBahan").value);
  const stokMin = parseInt(document.getElementById("stokMin").value);

  let data = getBahanBakuData();

  if (id) {
    // UPDATE
    data = data.map(item => {
      if (item.id === id) {
        return { ...item, nama, stok, stokMin };
      }
      return item;
    });
  } else {
    // CREATE
    const newItem = {
      id: Date.now().toString(),
      nama,
      stok,
      stokMin
    };
    data.push(newItem);
  }

  saveBahanBakuData(data);
  resetForm();
  renderTable();
});

function editBahan(id) {
  if (sessionUser.role !== "Manajer") {
    alert("Akses ditolak.");
    return;
  }

  const data = getBahanBakuData();
  const item = data.find(x => x.id === id);

  document.getElementById("idBahan").value = item.id;
  document.getElementById("namaBahan").value = item.nama;
  document.getElementById("stokBahan").value = item.stok;
  document.getElementById("stokMin").value = item.stokMin;

  document.getElementById("btnSubmit").textContent = "Update";
}

function deleteBahan(id) {
  if (sessionUser.role !== "Manajer") {
    alert("Akses ditolak.");
    return;
  }

  if (!confirm("Yakin ingin menghapus bahan baku ini?")) return;

  let data = getBahanBakuData();
  data = data.filter(item => item.id !== id);

  saveBahanBakuData(data);
  renderTable();
}

function resetForm() {
  document.getElementById("idBahan").value = "";
  document.getElementById("namaBahan").value = "";
  document.getElementById("stokBahan").value = "";
  document.getElementById("stokMin").value = "";
  document.getElementById("btnSubmit").textContent = "Simpan";
}

document.getElementById("btnReset").addEventListener("click", function() {
  resetForm();
});

// ==========================
// INIT LOAD
// ==========================
renderTable();
