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
    if (menu === "Kelola Supplier") window.location.href = "supplier.html";
    else if (menu === "Pembelian Bahan Baku") window.location.href = "pembelian.html";
    else if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getSupplierData() {
  return JSON.parse(localStorage.getItem("supplierData")) || [];
}

function saveSupplierData(data) {
  localStorage.setItem("supplierData", JSON.stringify(data));
}

// ==========================
// CRUD
// ==========================
function addSupplier(nama, hp, alamat) {
  const suppliers = getSupplierData();

  const supplier = {
    id: "SUP-" + Date.now(),
    nama,
    hp,
    alamat
  };

  suppliers.push(supplier);
  saveSupplierData(suppliers);
}

function updateSupplier(id, nama, hp, alamat) {
  let suppliers = getSupplierData();

  suppliers = suppliers.map(s => {
    if (s.id === id) {
      return { ...s, nama, hp, alamat };
    }
    return s;
  });

  saveSupplierData(suppliers);
}

function deleteSupplier(id) {
  let suppliers = getSupplierData();
  suppliers = suppliers.filter(s => s.id !== id);
  saveSupplierData(suppliers);
}

// ==========================
// RENDER TABLE
// ==========================
function renderSupplierTable() {
  const tbody = document.getElementById("supplierTable");
  tbody.innerHTML = "";

  const suppliers = getSupplierData();

  suppliers.forEach(s => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.nama}</td>
      <td>${s.hp}</td>
      <td>${s.alamat}</td>
      <td>
        <div class="action-btn">
          <button class="btn-edit" onclick="editSupplier('${s.id}')">Edit</button>
          <button class="btn-delete" onclick="removeSupplier('${s.id}')">Hapus</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EDIT MODE
// ==========================
function editSupplier(id) {
  const suppliers = getSupplierData();
  const supplier = suppliers.find(s => s.id === id);

  if (!supplier) return alert("Supplier tidak ditemukan.");

  document.getElementById("supplierId").value = supplier.id;
  document.getElementById("supplierNama").value = supplier.nama;
  document.getElementById("supplierHp").value = supplier.hp;
  document.getElementById("supplierAlamat").value = supplier.alamat;

  document.getElementById("btnSubmit").textContent = "Update Supplier";
}

// ==========================
// DELETE
// ==========================
function removeSupplier(id) {
  if (!confirm("Yakin ingin menghapus supplier ini?")) return;

  deleteSupplier(id);
  renderSupplierTable();

  alert("Supplier berhasil dihapus.");
}

// ==========================
// FORM SUBMIT
// ==========================
document.getElementById("supplierForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("supplierId").value;
  const nama = document.getElementById("supplierNama").value.trim();
  const hp = document.getElementById("supplierHp").value.trim();
  const alamat = document.getElementById("supplierAlamat").value.trim();

  if (!nama || !hp || !alamat) {
    alert("Semua field wajib diisi.");
    return;
  }

  if (id) {
    updateSupplier(id, nama, hp, alamat);
    alert("Supplier berhasil diupdate.");
  } else {
    addSupplier(nama, hp, alamat);
    alert("Supplier berhasil ditambahkan.");
  }

  resetForm();
  renderSupplierTable();
});

// RESET FORM
function resetForm() {
  document.getElementById("supplierId").value = "";
  document.getElementById("supplierNama").value = "";
  document.getElementById("supplierHp").value = "";
  document.getElementById("supplierAlamat").value = "";
  document.getElementById("btnSubmit").textContent = "Simpan Supplier";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

// INIT
renderSupplierTable();
