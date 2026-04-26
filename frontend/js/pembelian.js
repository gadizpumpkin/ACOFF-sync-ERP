// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
const token = localStorage.getItem("token");

if (!sessionUser || !token) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

if (sessionUser.role !== "MANAGER") {
  alert("Akses ditolak. Halaman ini hanya untuk Manajer.");
  window.location.href = "dashboard.html";
}

// ==========================
// GLOBAL DATA
// ==========================
let supplierList = [];
let bahanList = [];
let cart = [];

// ==========================
// SUPPLIER FROM API
// ==========================
async function loadSuppliers() {
  const supplierSelect = document.getElementById("selectSupplier");

  try {
    const res = await fetch("http://localhost:5000/api/supplier", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Gagal ambil supplier");

    const data = await res.json();
    supplierList = data;

    supplierSelect.innerHTML = `<option value="" disabled selected>-- Pilih supplier --</option>`;

    data.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.nama_supplier;
      supplierSelect.appendChild(opt);
    });

  } catch (err) {
    console.error(err);
    alert("Gagal load supplier dari server");
  }
}

// ==========================
// BAHAN DARI API
// ==========================
async function loadBahanBaku() {
  try {
    const res = await fetch("http://localhost:5000/api/bahanbaku", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Gagal ambil bahan baku");

    return await res.json();

  } catch (err) {
    console.error(err);
    alert("Gagal load bahan baku dari server");
    return [];
  }
}

// ==========================
// LOAD DROPDOWN
// ==========================
async function loadDropdowns() {
  const bahanSelect = document.getElementById("selectBahan");

  await loadSuppliers();

  bahanList = await loadBahanBaku();

  bahanSelect.innerHTML = `<option value="" disabled selected>-- Pilih bahan --</option>`;

  bahanList.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.nama;
    bahanSelect.appendChild(opt);
  });
}

// ==========================
// CART
// ==========================
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
        <button onclick="removeCart('${item.bahanId}')">Hapus</button>
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
// ADD TO CART
// ==========================
document.getElementById("pembelianForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const bahanId = document.getElementById("selectBahan").value;
  const gram = parseInt(document.getElementById("jumlahGram").value);
  const harga = parseInt(document.getElementById("hargaTotal").value);

  if (!bahanId || !gram || !harga) {
    alert("Semua field harus diisi.");
    return;
  }

  const bahan = bahanList.find(b => b.id == bahanId);

  if (!bahan) {
    alert("Bahan tidak ditemukan.");
    return;
  }

  if (cart.find(c => c.bahanId == bahanId)) {
    alert("Bahan sudah ada di keranjang.");
    return;
  }

  cart.push({
    bahanId,
    bahanNama: bahan.nama,
    gram,
    harga
  });

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
  const supplier = supplierList.find(s => s.id == supplierId);

  if (!supplier) {
    alert("Supplier tidak valid.");
    return;
  }

  const pembelian = {
    id: "PO-" + Date.now(),
    supplierId: supplier.id,
    supplierNama: supplier.nama_supplier,
    tanggal: new Date().toLocaleString("id-ID"),
    status: "Pending",
    total: calculateTotal(),
    items: cart,
    createdBy: sessionUser.username
  };

  console.log("DATA PEMBELIAN:", pembelian);

  alert("Pembelian berhasil dibuat (simulasi, belum masuk DB)");

  cart = [];
  renderCart();
});

// ==========================
// INIT
// ==========================
loadDropdowns();
renderCart();