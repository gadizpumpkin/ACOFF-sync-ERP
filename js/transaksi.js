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
    if (menu === "Transaksi Penjualan") window.location.href = "transaksi.html";
    else if (menu === "Kelola Menu") window.location.href = "menu.html";
    else if (menu === "Kelola Resep") window.location.href = "resep.html";
    else if (menu === "Kelola Bahan Baku") window.location.href = "bahanbaku.html";
    else alert("Menu belum dibuat: " + menu);
  });

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
  selectMenu.innerHTML = "";

  const menus = getMenuData();

  if (menus.length === 0) {
    selectMenu.innerHTML = `<option value="">Menu kosong</option>`;
    return;
  }

  menus.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.nama} (Rp ${m.harga.toLocaleString("id-ID")})`;
    selectMenu.appendChild(opt);
  });
}

// ==========================
// CART LOGIC
// ==========================
function addToCart(menuId, qty) {
  const menuData = getMenuData();
  const menu = menuData.find(m => m.id === menuId);

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
  return cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
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
        <button class="btn-delete" onclick="removeFromCart('${item.menuId}')">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalHarga").textContent =
    "Rp " + calculateTotal().toLocaleString("id-ID");
}

// ==========================
// STOCK VALIDATION BASED ON RECIPE
// ==========================
function validateStockForCart() {
  const resepData = getResepData();
  const bahanData = getBahanBakuData();

  // hitung kebutuhan bahan baku total
  let kebutuhan = {};

  cart.forEach(item => {
    const resepMenu = resepData.filter(r => r.menuId === item.menuId);

    resepMenu.forEach(r => {
      const totalGram = r.gram * item.qty;
      if (!kebutuhan[r.bahanId]) kebutuhan[r.bahanId] = 0;
      kebutuhan[r.bahanId] += totalGram;
    });
  });

  // cek stok
  for (const bahanId in kebutuhan) {
    const bahan = bahanData.find(b => b.id === bahanId);
    if (!bahan) return { valid: false, message: "Bahan baku tidak ditemukan." };

    if (bahan.stok < kebutuhan[bahanId]) {
      return {
        valid: false,
        message: `Stok ${bahan.nama} tidak cukup. Dibutuhkan ${kebutuhan[bahanId]} gram, stok tersedia ${bahan.stok} gram`
      };
    }
  }

  return { valid: true, kebutuhan };
}

// ==========================
// APPLY STOCK (DECREASE)
// ==========================
function applyStockDecrease(kebutuhan) {
  let bahanData = getBahanBakuData();

  for (const bahanId in kebutuhan) {
    bahanData = bahanData.map(b => {
      if (b.id === bahanId) {
        return { ...b, stok: b.stok - kebutuhan[bahanId] };
      }
      return b;
    });
  }

  saveBahanBakuData(bahanData);
}

// ==========================
// ROLLBACK STOCK (INCREASE)
// ==========================
function rollbackStockIncrease(kebutuhan) {
  let bahanData = getBahanBakuData();

  for (const bahanId in kebutuhan) {
    bahanData = bahanData.map(b => {
      if (b.id === bahanId) {
        return { ...b, stok: b.stok + kebutuhan[bahanId] };
      }
      return b;
    });
  }

  saveBahanBakuData(bahanData);
}

// ==========================
// SAVE TRANSACTION
// ==========================
function createTransaction(status) {
  if (cart.length === 0) {
    alert("Keranjang masih kosong.");
    return;
  }

  const transaksiData = getTransaksiData();
  const total = calculateTotal();

  const transaksi = {
    id: "TRX-" + Date.now(),
    tanggal: new Date().toLocaleString("id-ID"),
    status: status,
    total: total,
    items: cart,
    kebutuhanBahan: null,
    createdBy: sessionUser.username
  };

  // jika paid: cek stok + kurangi stok
  if (status === "Paid") {
    const check = validateStockForCart();

    if (!check.valid) {
      alert(check.message);
      return;
    }

    transaksi.kebutuhanBahan = check.kebutuhan;
    applyStockDecrease(check.kebutuhan);
  }

  transaksiData.push(transaksi);
  saveTransaksiData(transaksiData);

  // reset cart
  cart = [];
  renderCart();
  renderHistory();

  if (status === "Paid") {
    generateReceipt(transaksi);
  }

  alert("Transaksi berhasil disimpan: " + status);
}

// ==========================
// CANCEL TRANSACTION
// ==========================
function cancelTransaction(trxId) {
  let transaksiData = getTransaksiData();
  const trx = transaksiData.find(t => t.id === trxId);

  if (!trx) return alert("Transaksi tidak ditemukan.");

  if (trx.status === "Canceled") {
    alert("Transaksi sudah canceled.");
    return;
  }

  // rollback jika sebelumnya paid
  if (trx.status === "Paid" && trx.kebutuhanBahan) {
    rollbackStockIncrease(trx.kebutuhanBahan);
  }

  trx.status = "Canceled";

  saveTransaksiData(transaksiData);
  renderHistory();

  alert("Transaksi berhasil dibatalkan + stok rollback.");
}

// ==========================
// RECEIPT GENERATION
// ==========================
function generateReceipt(trx) {
  const receiptBox = document.getElementById("receiptBox");
  const receiptContent = document.getElementById("receiptContent");

  let html = `
    <p><b>Coffee Street</b></p>
    <p>ID: ${trx.id}</p>
    <p>Tanggal: ${trx.tanggal}</p>
    <p>Kasir: ${trx.createdBy}</p>
    <hr/>
    <ul>
  `;

  trx.items.forEach(item => {
    html += `<li>${item.nama} x${item.qty} = Rp ${(item.harga * item.qty).toLocaleString("id-ID")}</li>`;
  });

  html += `
    </ul>
    <hr/>
    <p><b>Total: Rp ${trx.total.toLocaleString("id-ID")}</b></p>
    <p>Status: ${trx.status}</p>
  `;

  receiptContent.innerHTML = html;
  receiptBox.style.display = "block";
}

// ==========================
// HISTORY TABLE
// ==========================
function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  const transaksiData = getTransaksiData();

  transaksiData.slice().reverse().forEach(trx => {
    let statusClass = "status-draft";
    if (trx.status === "Paid") statusClass = "status-paid";
    if (trx.status === "Canceled") statusClass = "status-canceled";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${trx.id}</td>
      <td>${trx.tanggal}</td>
      <td class="${statusClass}">${trx.status}</td>
      <td>Rp ${trx.total.toLocaleString("id-ID")}</td>
      <td>
        <button class="btn-secondary" onclick="generateReceipt(${JSON.stringify(trx).replace(/"/g, '&quot;')})">
          Struk
        </button>
        <button class="btn-danger" onclick="cancelTransaction('${trx.id}')">
          Cancel
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT HANDLER
// ==========================
document.getElementById("transaksiForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (sessionUser.role !== "Karyawan") {
    alert("Akses ditolak. Hanya Karyawan yang boleh input transaksi.");
    return;
  }

  const menuId = document.getElementById("selectMenu").value;
  const qty = parseInt(document.getElementById("qtyMenu").value);

  if (!menuId) {
    alert("Pilih menu terlebih dahulu.");
    return;
  }

  addToCart(menuId, qty);
});

document.getElementById("btnSaveDraft").addEventListener("click", function() {
  if (sessionUser.role !== "Karyawan") {
    alert("Akses ditolak.");
    return;
  }
  createTransaction("Draft");
});

document.getElementById("btnPaid").addEventListener("click", function() {
  if (sessionUser.role !== "Karyawan") {
    alert("Akses ditolak.");
    return;
  }
  createTransaction("Paid");
});




// ==========================
// INIT
// ==========================
loadMenuDropdown();
renderCart();
renderHistory();
