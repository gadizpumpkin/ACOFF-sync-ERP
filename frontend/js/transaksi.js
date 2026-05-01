// ==========================
// AUTH CHECK
// ==========================
const sessionUser = getSession();
if (!sessionUser) window.location.href = "index.html";

document.getElementById("userRole").textContent = sessionUser.role;

document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

// ==========================
// BASE API
// ==========================
const BASE_URL = "http://localhost:5000/api";

// ==========================
// GLOBAL
// ==========================
let cart = [];
let menuGlobal = [];

// ==========================
// LOAD MENU
// ==========================
async function loadMenuDropdown() {
  const select = document.getElementById("selectMenu");
  select.innerHTML = `<option disabled selected>-- Pilih menu --</option>`;

  try {
    const res = await fetch(`${BASE_URL}/menu`);
    const menus = await res.json();

    menuGlobal = menus;

    menus.forEach(m => {
      if (m.status !== "ACTIVE") return;

      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nama_menu} (Rp ${Number(m.harga_jual).toLocaleString("id-ID")})`;

      select.appendChild(opt);
    });

  } catch (err) {
    console.error("LOAD MENU ERROR:", err);
  }
}

// ==========================
// CART
// ==========================
function addToCart(menuId, qty) {
  const menu = menuGlobal.find(m => String(m.id) === String(menuId));
  if (!menu) return alert("Menu tidak ditemukan");

  const exist = cart.find(i => i.menuId == menuId);

  if (exist) {
    exist.qty += qty;
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
  cart = cart.filter(i => i.menuId !== menuId);
  renderCart();
}

function calculateTotal() {
  return cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
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
      <td><button class="cs-btn-delete">Hapus</button></td>
    `;

    tr.querySelector(".cs-btn-delete").onclick = () => removeFromCart(item.menuId);

    tbody.appendChild(tr);
  });

  document.getElementById("totalHarga").textContent =
    "Rp " + calculateTotal().toLocaleString("id-ID");
}

// ==========================
// CREATE TRANSACTION (DB)
// ==========================
async function createTransaction() {
  if (cart.length === 0) {
    return alert("Keranjang kosong");
  }

  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    const payload = {
      items: cart.map(item => ({
        menu_id: item.menuId,
        qty: item.qty,
        harga: item.harga
      }))
    };

    console.log("PAYLOAD:", payload);

    const res = await fetch(`${BASE_URL}/transaksi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    console.log("RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data.error || data.message || "Gagal transaksi");
    }

    alert("Transaksi berhasil! ID: " + data.transaksi_id);

    cart = [];
    renderCart();

    loadHistory();

  } catch (err) {
    console.error("TRANSAKSI ERROR:", err);
    alert(err.message);
  }
}

// ==========================
// 🔥 HISTORY FROM DB
// ==========================
async function loadHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/transaksi`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    console.log("HISTORY:", data);

    // VALIDASI
    if (!Array.isArray(data)) {
      throw new Error(data.message || "Data bukan array");
    }

    data.forEach(trx => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${trx.id}</td>
        <td>${new Date(trx.tanggal).toLocaleString("id-ID")}</td>
        <td>${trx.status}</td>
        <td>Rp ${Number(trx.total).toLocaleString("id-ID")}</td>
        <td>-</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("LOAD HISTORY ERROR:", err);
  }
}

// ==========================
// EVENT
// ==========================
document.getElementById("transaksiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (sessionUser.role !== "KARYAWAN") {
    return alert("Hanya Karyawan");
  }

  const menuId = document.getElementById("selectMenu").value;
  const qty = parseInt(document.getElementById("qtyMenu").value);

  if (!menuId) return alert("Pilih menu");

  addToCart(menuId, qty);
});

document.getElementById("btnPaid").onclick = createTransaction;

document.getElementById("btnCancel").onclick = () => {
  cart = [];
  renderCart();
};

// ==========================
// INIT
// ==========================
loadMenuDropdown();
renderCart();
loadHistory();