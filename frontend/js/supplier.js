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

if (sessionUser.role !== "Manajer") {
  alert("Akses ditolak. Halaman ini hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

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

  suppliers.push({
    id: "SUP-" + Date.now(),
    nama,
    hp,
    alamat
  });

  saveSupplierData(suppliers);
}

function updateSupplier(id, nama, hp, alamat) {
  let suppliers = getSupplierData();

  suppliers = suppliers.map(s =>
    s.id === id ? { ...s, nama, hp, alamat } : s
  );

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
  const count = document.getElementById("supplierCount");

  tbody.innerHTML = "";

  const suppliers = getSupplierData();

  // update badge count
  count.textContent = suppliers.length + " supplier";

  if (suppliers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="cs-empty">Belum ada supplier</div>
        </td>
      </tr>
    `;
    return;
  }

  suppliers.forEach(s => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.nama}</td>
      <td>${s.hp}</td>
      <td class="cs-td-alamat">${s.alamat}</td>
      <td>
        <div class="cs-action-btn"></div>
      </td>
    `;

    const actionDiv = tr.querySelector(".cs-action-btn");

    // tombol edit
    const btnEdit = document.createElement("button");
    btnEdit.className = "cs-btn-edit";
    btnEdit.textContent = "Edit";
    btnEdit.onclick = () => editSupplier(s.id);

    // tombol delete
    const btnDelete = document.createElement("button");
    btnDelete.className = "cs-btn-delete";
    btnDelete.textContent = "Hapus";
    btnDelete.onclick = () => removeSupplier(s.id);

    actionDiv.appendChild(btnEdit);
    actionDiv.appendChild(btnDelete);

    tbody.appendChild(tr);
  });
}

// ==========================
// EDIT MODE
// ==========================
function editSupplier(id) {
  const supplier = getSupplierData().find(s => s.id === id);

  if (!supplier) return alert("Supplier tidak ditemukan.");

  document.getElementById("supplierId").value = supplier.id;
  document.getElementById("supplierNama").value = supplier.nama;
  document.getElementById("supplierHp").value = supplier.hp;
  document.getElementById("supplierAlamat").value = supplier.alamat;

  document.getElementById("btnSubmit").textContent = "Update Supplier";
  document.getElementById("formTitle").textContent = "Edit Supplier";
}

// ==========================
// DELETE
// ==========================
function removeSupplier(id) {
  if (!confirm("Yakin hapus supplier ini?")) return;

  deleteSupplier(id);
  renderSupplierTable();
}

// ==========================
// FORM SUBMIT
// ==========================
document.getElementById("supplierForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("supplierId").value;
  const nama = document.getElementById("supplierNama").value.trim();
  const hp = document.getElementById("supplierHp").value.trim();
  const alamat = document.getElementById("supplierAlamat").value.trim();

  if (!nama || !hp || !alamat) {
    return alert("Semua field wajib diisi.");
  }

  if (id) {
    updateSupplier(id, nama, hp, alamat);
  } else {
    addSupplier(nama, hp, alamat);
  }

  resetForm();
  renderSupplierTable();
});

// ==========================
// RESET FORM
// ==========================
function resetForm() {
  document.getElementById("supplierId").value = "";
  document.getElementById("supplierNama").value = "";
  document.getElementById("supplierHp").value = "";
  document.getElementById("supplierAlamat").value = "";

  document.getElementById("btnSubmit").textContent = "Simpan Supplier";
  document.getElementById("formTitle").textContent = "Form Tambah Supplier";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

// ==========================
// INIT
// ==========================
renderSupplierTable();