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

function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function getPembelianData() {
  return JSON.parse(localStorage.getItem("pembelianData")) || [];
}

function savePembelianData(data) {
  localStorage.setItem("pembelianData", JSON.stringify(data));
}

// ==========================
// CART
// ==========================
let cart = [];

function renderCart() {
  const tbody = document.getElementById("cartTable");
  tbody.innerHTML = "";

  cart.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.bahanNama}</td>
      <td>${item.gram} gram</td>
      <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>
        <button class="cs-btn-delete" onclick="removeCart('${item.bahanId}')">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalPembelian").textContent =
    "Rp " + calculateTotal().toLocaleString("id-ID");
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.harga, 0);
}

function removeCart(bahanId) {
  cart = cart.filter(item => item.bahanId !== bahanId);
  renderCart();
}

// ==========================
// LOAD DROPDOWN
// ==========================
function loadDropdowns() {
  const supplierSelect = document.getElementById("selectSupplier");
  const bahanSelect = document.getElementById("selectBahan");

  const suppliers = getSupplierData();
  const bahan = getBahanBakuData();

  // reset + default option
  supplierSelect.innerHTML = `<option value="" disabled selected>-- Pilih supplier --</option>`;
  bahanSelect.innerHTML = `<option value="" disabled selected>-- Pilih bahan --</option>`;

  suppliers.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.nama;
    supplierSelect.appendChild(opt);
  });

  bahan.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.nama;
    bahanSelect.appendChild(opt);
  });
}

// ==========================
// FORM SUBMIT (ADD CART)
// ==========================
document.getElementById("pembelianForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const supplierId = document.getElementById("selectSupplier").value;
  const bahanId = document.getElementById("selectBahan").value;
  const gram = parseInt(document.getElementById("jumlahGram").value);
  const harga = parseInt(document.getElementById("hargaTotal").value);

  if (!supplierId || !bahanId || !gram || !harga) {
    alert("Semua field harus diisi.");
    return;
  }

  const bahan = getBahanBakuData().find(b => b.id === bahanId);

  if (!bahan) {
    alert("Bahan tidak ditemukan.");
    return;
  }

  if (cart.find(c => c.bahanId === bahanId)) {
    alert("Bahan sudah ada di keranjang.");
    return;
  }

  cart.push({
    bahanId,
    bahanNama: bahan.nama,
    gram,
    harga
  });

  // reset input
  document.getElementById("jumlahGram").value = "";
  document.getElementById("hargaTotal").value = "";

  renderCart();
});

// ==========================
// SUBMIT PEMBELIAN
// ==========================
document.getElementById("btnSubmitPembelian").addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Keranjang kosong.");
    return;
  }

  const supplierId = document.getElementById("selectSupplier").value;
  const supplier = getSupplierData().find(s => s.id === supplierId);

  if (!supplier) {
    alert("Supplier tidak valid.");
    return;
  }

  const pembelianData = getPembelianData();

  const pembelian = {
    id: "PO-" + Date.now(),
    supplierId: supplier.id,
    supplierNama: supplier.nama,
    tanggal: new Date().toLocaleString("id-ID"),
    status: "Pending",
    total: calculateTotal(),
    items: cart,
    createdBy: sessionUser.username,
    approvedBy: null,
    receivedAt: null
  };

  pembelianData.push(pembelian);
  savePembelianData(pembelianData);

  cart = [];
  renderCart();
  renderHistory();

  alert("Pembelian berhasil (Pending approval Owner).");
});

// ==========================
// RESET CART
// ==========================
document.getElementById("btnResetCart").addEventListener("click", function () {
  cart = [];
  renderCart();
});

// ==========================
// STATUS BADGE (CSS SYNC)
// ==========================
function getStatusBadge(status) {
  let cls = "pending";

  if (status === "Approved") cls = "approved";
  if (status === "Rejected") cls = "rejected";
  if (status === "Received") cls = "received";

  return `
    <span class="cs-status-pill ${cls}">
      <span class="cs-pulse"></span>
      ${status}
    </span>
  `;
}

// ==========================
// HISTORY TABLE
// ==========================
function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const data = getPembelianData();

  data.slice().reverse().forEach(po => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${po.id}</td>
      <td>${po.supplierNama}</td>
      <td>${po.tanggal}</td>
      <td>${getStatusBadge(po.status)}</td>
      <td>Rp ${po.total.toLocaleString("id-ID")}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// INIT
// ==========================
loadDropdowns();
renderCart();
renderHistory();