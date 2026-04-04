// ==========================
// AUTH CHECK + ROLE
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
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

function saveBahanBakuData(data) {
  localStorage.setItem("bahanBakuData", JSON.stringify(data));
}

function getResepData() {
  return JSON.parse(localStorage.getItem("resepData")) || [];
}

function getTransaksiData() {
  return JSON.parse(localStorage.getItem("transaksiData")) || [];
}

function saveTransaksiData(data) {
  localStorage.setItem("transaksiData", JSON.stringify(data));
}

// ==========================
// GLOBAL CART
// ==========================
let cart = [];

// ==========================
// LOAD MENU DROPDOWN
// ==========================
function loadMenuDropdown() {
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.innerHTML = `<option value="" disabled selected>-- Pilih menu --</option>`;

  const menus = getMenuData();

  if (menus.length === 0) {
    selectMenu.innerHTML = `<option value="">Menu kosong</option>`;
    return;
  }

  menus.forEach(m => {
    const opt = document.createElement("option");
    opt.value = String(m.id);
    opt.textContent = `${m.nama} (Rp ${m.harga.toLocaleString("id-ID")})`;
    selectMenu.appendChild(opt);
  });
}

// ==========================
// CART LOGIC
// ==========================
function addToCart(menuId, qty) {
  const menuData = getMenuData();
  const menu = menuData.find(m => String(m.id) === String(menuId));

  if (!menu) {
    alert("Menu tidak ditemukan.");
    return;
  }

  const existing = cart.find(item => item.menuId === menuId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      menuId: menu.id,
      nama: menu.nama,
      harga: menu.harga,
      qty: qty
    });
  }

  renderCart();
}

function removeFromCart(menuId) {
  cart = cart.filter(item => item.menuId !== menuId);
  renderCart();
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
}

function renderCart() {
  const tbody = document.getElementById("cartTable");
  tbody.innerHTML = "";

  cart.forEach(item => {
    const subtotal = item.harga * item.qty;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>${item.qty}</td>
      <td>Rp ${subtotal.toLocaleString("id-ID")}</td>
      <td>
        <button class="cs-btn-delete" data-id="${item.menuId}">Hapus</button>
      </td>
    `;

    tr.querySelector(".cs-btn-delete").addEventListener("click", () => {
      removeFromCart(item.menuId);
    });

    tbody.appendChild(tr);
  });

  document.getElementById("totalHarga").textContent =
    "Rp " + calculateTotal().toLocaleString("id-ID");
}

// ==========================
// VALIDASI STOK
// ==========================
function validateStockForCart() {
  const resepData = getResepData();
  const bahanData = getBahanBakuData();

  let kebutuhan = {};

  cart.forEach(item => {
    const resepMenu = resepData.filter(r => String(r.menuId) === String(item.menuId));

    resepMenu.forEach(r => {
      const totalGram = r.gram * item.qty;
      if (!kebutuhan[r.bahanId]) kebutuhan[r.bahanId] = 0;
      kebutuhan[r.bahanId] += totalGram;
    });
  });

  for (const bahanId in kebutuhan) {
    const bahan = bahanData.find(b => String(b.id) === String(bahanId));

    if (!bahan) return { valid: false, message: "Bahan tidak ditemukan." };

    if (bahan.stok < kebutuhan[bahanId]) {
      return {
        valid: false,
        message: `Stok ${bahan.nama} kurang (${bahan.stok})`
      };
    }
  }

  return { valid: true, kebutuhan };
}

// ==========================
// STOCK UPDATE
// ==========================
function applyStockDecrease(kebutuhan) {
  let bahanData = getBahanBakuData();

  bahanData = bahanData.map(b => {
    if (kebutuhan[b.id]) {
      return { ...b, stok: b.stok - kebutuhan[b.id] };
    }
    return b;
  });

  saveBahanBakuData(bahanData);
}

function rollbackStockIncrease(kebutuhan) {
  let bahanData = getBahanBakuData();

  bahanData = bahanData.map(b => {
    if (kebutuhan[b.id]) {
      return { ...b, stok: b.stok + kebutuhan[b.id] };
    }
    return b;
  });

  saveBahanBakuData(bahanData);
}

// ==========================
// CREATE TRANSACTION
// ==========================
function createTransaction(status) {
  if (cart.length === 0) return alert("Keranjang kosong.");

  const transaksiData = getTransaksiData();
  const total = calculateTotal();

  const trx = {
    id: "TRX-" + Date.now(),
    tanggal: new Date().toLocaleString("id-ID"),
    status,
    total,
    items: cart,
    kebutuhanBahan: null,
    createdBy: sessionUser.username
  };

  if (status === "Paid") {
    const check = validateStockForCart();

    if (!check.valid) return alert(check.message);

    trx.kebutuhanBahan = check.kebutuhan;
    applyStockDecrease(check.kebutuhan);
  }

  transaksiData.push(trx);
  saveTransaksiData(transaksiData);

  cart = [];
  renderCart();
  renderHistory();

  if (status === "Paid") generateReceipt(trx);

  alert("Transaksi berhasil: " + status);
}

// ==========================
// CANCEL TRANSACTION
// ==========================
function cancelTransaction(trxId) {
  let data = getTransaksiData();
  const trx = data.find(t => t.id === trxId);

  if (!trx) return alert("Tidak ditemukan.");

  if (trx.status === "Canceled") return alert("Sudah dibatalkan.");

  if (trx.status === "Paid" && trx.kebutuhanBahan) {
    rollbackStockIncrease(trx.kebutuhanBahan);
  }

  trx.status = "Canceled";
  saveTransaksiData(data);
  renderHistory();
}

// ==========================
// RECEIPT
// ==========================
function generateReceipt(trx) {
  const box = document.getElementById("receiptBox");
  const content = document.getElementById("receiptContent");

  let html = `
    <p><b>Coffee Street</b></p>
    <p>ID: ${trx.id}</p>
    <p>Tanggal: ${trx.tanggal}</p>
    <p>Kasir: ${trx.createdBy}</p>
    <hr/>
    <ul>
  `;

  trx.items.forEach(i => {
    html += `<li>${i.nama} x${i.qty} = Rp ${(i.harga * i.qty).toLocaleString("id-ID")}</li>`;
  });

  html += `
    </ul>
    <hr/>
    <p><b>Total: Rp ${trx.total.toLocaleString("id-ID")}</b></p>
    <p>Status: ${trx.status}</p>
  `;

  content.innerHTML = html;
  box.style.display = "block";
}

// ==========================
// HISTORY
// ==========================
function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const data = getTransaksiData();

  data.slice().reverse().forEach(trx => {
    let statusClass = "cs-status-pill draft";
    if (trx.status === "Paid") statusClass = "cs-status-pill paid";
    if (trx.status === "Canceled") statusClass = "cs-status-pill canceled";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${trx.id}</td>
      <td>${trx.tanggal}</td>
      <td><span class="${statusClass}">${trx.status}</span></td>
      <td>Rp ${trx.total.toLocaleString("id-ID")}</td>
      <td></td>
    `;

    const actionTd = tr.children[4];

    // tombol struk
    const btnView = document.createElement("button");
    btnView.className = "cs-btn-view";
    btnView.textContent = "Struk";
    btnView.onclick = () => generateReceipt(trx);

    // tombol cancel
    const btnCancel = document.createElement("button");
    btnCancel.className = "cs-btn-cancel";
    btnCancel.textContent = "Cancel";
    btnCancel.onclick = () => cancelTransaction(trx.id);

    actionTd.appendChild(btnView);
    actionTd.appendChild(btnCancel);

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document.getElementById("transaksiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (sessionUser.role !== "Karyawan") {
    return alert("Hanya Karyawan.");
  }

  const menuId = document.getElementById("selectMenu").value;
  const qty = parseInt(document.getElementById("qtyMenu").value);

  if (!menuId) return alert("Pilih menu.");

  addToCart(menuId, qty);
});

document.getElementById("btnSaveDraft").onclick = () => createTransaction("Draft");
document.getElementById("btnPaid").onclick = () => createTransaction("Paid");

document.getElementById("btnCancel").onclick = () => {
  cart = [];
  renderCart();
};

// ==========================
// INIT
// ==========================
loadMenuDropdown();
renderCart();
renderHistory();