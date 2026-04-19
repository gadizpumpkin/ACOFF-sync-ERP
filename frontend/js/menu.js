// ==========================
// AUTH CHECK
// ==========================
const token = localStorage.getItem("token");

if (!sessionUser && !token) {
  window.location.href = "index.html";
}

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
});

// RBAC HALAMAN
const role = sessionUser?.role?.trim().toUpperCase();

console.log("ROLE FINAL:", role);

if (role !== "MANAGER") {
  alert("Akses ditolak. Halaman ini hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// ==========================
// STORAGE
// ==========================
function getMenuData() {
  return JSON.parse(localStorage.getItem("menuData")) || [];
}

function saveMenuData(data) {
  localStorage.setItem("menuData", JSON.stringify(data));
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable() {
  const tbody = document.getElementById("menuTable");
  const count = document.getElementById("menuCount");

  tbody.innerHTML = "";

  const data = getMenuData();

  count.textContent = `${data.length} menu`;

  data.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td class="cs-td-harga">Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>
        <div class="cs-action-btn">
          <button class="cs-btn-edit" onclick="editMenu('${item.id}')">Edit</button>
          <button class="cs-btn-delete" onclick="deleteMenu('${item.id}')">Hapus</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// SUBMIT FORM (CREATE / UPDATE)
// ==========================
document.getElementById("menuForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("menuId").value;
  const nama = document.getElementById("menuNama").value.trim();
  const harga = parseInt(document.getElementById("menuHarga").value);

  let data = getMenuData();

  if (id) {
    // UPDATE
    data = data.map(item =>
      item.id === id ? { ...item, nama, harga } : item
    );
  } else {
    // CREATE
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

// ==========================
// EDIT
// ==========================
function editMenu(id) {
  const data = getMenuData();
  const item = data.find(x => x.id === id);

  document.getElementById("menuId").value = item.id;
  document.getElementById("menuNama").value = item.nama;
  document.getElementById("menuHarga").value = item.harga;

  document.getElementById("btnSubmit").innerHTML = "Update";
  document.getElementById("formTitle").textContent = "Form Edit Menu";
}

// ==========================
// DELETE
// ==========================
function deleteMenu(id) {
  if (!confirm("Yakin ingin menghapus menu ini?")) return;

  let data = getMenuData();
  data = data.filter(item => item.id !== id);

  saveMenuData(data);
  renderTable();
}

// ==========================
// RESET FORM
// ==========================
function resetForm() {
  document.getElementById("menuId").value = "";
  document.getElementById("menuNama").value = "";
  document.getElementById("menuHarga").value = "";

  document.getElementById("btnSubmit").innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Simpan
  `;

  document.getElementById("formTitle").textContent = "Form Tambah Menu";
}

document.getElementById("btnReset").addEventListener("click", resetForm);

// ==========================
// INIT
// ==========================
renderTable();