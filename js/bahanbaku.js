// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function() {
  clearSession();
  window.location.href = "index.html";
});

if (sessionUser.role !== "Manajer") {
  alert("Akses ditolak. Halaman ini hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    else if (menu === "Kelola Supplier") window.location.href = "supplier.html";
    else if (menu === "Pembelian Bahan Baku") window.location.href = "pembelian.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function saveBahanBakuData(data) {
  localStorage.setItem("bahanBakuData", JSON.stringify(data));
}

// ==========================
// CRUD
// ==========================
function addBahan(nama, stok, stok_minimum) {
  const bahan = getBahanBakuData();

  bahan.push({
    id: "BB-" + Date.now(),
    nama: nama,
    stok: stok,
    stok_minimum: stok_minimum,
    satuan: "gram"
  });

  saveBahanBakuData(bahan);
}

function updateBahan(id, nama, stok, stok_minimum) {
  let bahan = getBahanBakuData();

  bahan = bahan.map(b => {
    if (b.id === id) {
      return {
        ...b,
        nama,
        stok,
        stok_minimum
      };
    }
    return b;
  });

  saveBahanBakuData(bahan);
}

function deleteBahan(id) {
  let bahan = getBahanBakuData();
  bahan = bahan.filter(b => b.id !== id);
  saveBahanBakuData(bahan);
}

// ==========================
// RENDER TABLE + NOTIF
// ==========================
function renderBahanTable() {
  const tbody = document.getElementById("bahanTable");
  tbody.innerHTML = "";

  const bahan = getBahanBakuData();

  bahan.forEach(b => {
    const status = b.stok < b.stok_minimum ? "LOW STOCK" : "AMAN";
    const statusClass = b.stok < b.stok_minimum ? "status-low" : "status-safe";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.nama}</td>
      <td>${b.stok}</td>
      <td>${b.stok_minimum}</td>
      <td class="${statusClass}">${status}</td>
      <td>
        <div class="action-btn">
          <button class="btn-edit" onclick="editBahan('${b.id}')">Edit</button>
          <button class="btn-delete" onclick="removeBahan('${b.id}')">Hapus</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  renderNotif();
}

function renderNotif() {
  const notifBox = document.getElementById("notifBox");
  const notifList = document.getElementById("notifList");
  notifList.innerHTML = "";

  const bahan = getBahanBakuData();
  const lowStock = bahan.filter(b => b.stok < b.stok_minimum);

  if (lowStock.length === 0) {
    notifBox.style.display = "none";
    return;
  }

  notifBox.style.display = "block";

  lowStock.forEach(b => {
    const li = document.createElement("li");
    li.textContent = `${b.nama} stok rendah: ${b.stok} gram (minimum ${b.stok_minimum} gram)`;
    notifList.appendChild(li);
  });
}

// ==========================
// EDIT MODE
// ==========================
function editBahan(id) {
  const bahan = getBahanBakuData();
  const item = bahan.find(b => b.id === id);

  if (!item) return alert("Bahan baku tidak ditemukan.");

  document.getElementById("bahanId").value = item.id;
  document.getElementById("bahanNama").value = item.nama;
  document.getElementById("bahanStok").value = item.stok;
  document.getElementById("bahanMin").value = item.stok_minimum;

  document.getElementById("btnSubmit").textContent = "Update";
}

function removeBahan(id) {
  if (!confirm("Yakin ingin menghapus bahan baku ini?")) return;

  deleteBahan(id);
  renderBahanTable();

  alert("Bahan baku berhasil dihapus.");
}

// ==========================
// FORM SUBMIT
// ==========================
document.getElementById("bahanForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("bahanId").value;
  const nama = document.getElementById("bahanNama").value.trim();
  const stok = parseInt(document.getElementById("bahanStok").value);
  const stokMin = parseInt(document.getElementById("bahanMin").value);

  if (!nama || isNaN(stok) || isNaN(stokMin)) {
    alert("Data tidak valid.");
    return;
  }

  if (stok < 0 || stokMin < 0) {
    alert("Stok tidak boleh negatif.");
    return;
  }

  if (id) {
    updateBahan(id, nama, stok, stokMin);
    alert("Bahan baku berhasil diupdate.");
  } else {
    addBahan(nama, stok, stokMin);
    alert("Bahan baku berhasil ditambahkan.");
  }

  resetForm();
  renderBahanTable();
});

// RESET FORM
function resetForm() {
  document.getElementById("bahanId").value = "";
  document.getElementById("bahanNama").value = "";
  document.getElementById("bahanStok").value = "";
  document.getElementById("bahanMin").value = "";
  document.getElementById("btnSubmit").textContent = "Simpan";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

// INIT
renderBahanTable();
