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
// BASE URL API
// ==========================
const BASE_URL = "http://localhost:5000/api";

// ==========================
// GLOBAL DATA
// ==========================
let cart = [];
let menuGlobal = []; // ambil dari DB

// ==========================
// LOAD MENU DROPDOWN (API)
// ==========================
async function loadMenuDropdown() {
  const selectMenu = document.getElementById("selectMenu");

  selectMenu.innerHTML = `<option value="" disabled selected>-- Pilih menu --</option>`;

  try {
    const res = await fetch(`${BASE_URL}/menu`);
    const menus = await res.json();

    console.log("MENU API:", menus);

    // simpan ke global
    menuGlobal = menus;

    if (!menus.length) {
      selectMenu.innerHTML = `<option value="">Menu kosong</option>`;
      return;
    }

    menus.forEach(m => {
      // hanya tampilkan menu ACTIVE
      if (m.status !== "ACTIVE") return;

      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nama_menu} (Rp ${Number(m.harga_jual).toLocaleString("id-ID")})`;

      selectMenu.appendChild(opt);
    });

  } catch (err) {
    console.error("ERROR FETCH MENU:", err);
    selectMenu.innerHTML = `<option value="">Gagal load menu</option>`;
  }
}

// ==========================
// CART LOGIC (LOCAL)
// ==========================
function addToCart(menuId, qty) {
  const menu = menuGlobal.find(m => String(m.id) === String(menuId));

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
      nama: menu.nama_menu,
      harga: Number(menu.harga_jual),
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
        <button class="cs-btn-delete">Hapus</button>
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
// TRANSAKSI (Sementara masih local)
// ==========================
function getTransaksiData() {
  return JSON.parse(localStorage.getItem("transaksiData")) || [];
}

function saveTransaksiData(data) {
  localStorage.setItem("transaksiData", JSON.stringify(data));
}

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
    createdBy: sessionUser.username
  };

  transaksiData.push(trx);
  saveTransaksiData(transaksiData);

  cart = [];
  renderCart();
  renderHistory();

  alert("Transaksi berhasil: " + status);
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
      <td>-</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// EVENT
// ==========================
document.getElementById("transaksiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (sessionUser.role !== "KARYAWAN") {
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