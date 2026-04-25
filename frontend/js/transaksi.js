const BASE_URL = "http://localhost:5000/api";
const sessionUser = getSession();

if (!sessionUser || !sessionUser.token) {
  alert("Session habis, silakan login ulang");
  window.location.href = "index.html";
}

// tampilkan role
document.getElementById("userRole").textContent = sessionUser.role;

// logout
document.getElementById("logoutBtn").addEventListener("click", function () {
  clearSession();
  window.location.href = "index.html";
});

let cart = [];

// ==========================
// LOAD MENU (PAKAI TOKEN)
// ==========================
async function loadMenuDropdown() {
  const selectMenu = document.getElementById("selectMenu");

  try {
    const res = await fetch(`${BASE_URL}/menu`, {
      headers: {
        "Authorization": "Bearer " + getToken() // 🔥 FIX
      }
    });

    const menus = await res.json();

    selectMenu.innerHTML = `<option value="" disabled selected>-- Pilih menu --</option>`;

    if (!menus.length) {
      selectMenu.innerHTML = `<option>Menu kosong</option>`;
      return;
    }

    menus.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nama_menu} (Rp ${Number(m.harga_jual).toLocaleString("id-ID")})`;
      selectMenu.appendChild(opt);
    });

  } catch (err) {
    console.error(err);
    selectMenu.innerHTML = `<option>Gagal load</option>`;
  }
}

// ==========================
// ADD TO CART
// ==========================
async function addToCart(menuId, qty) {
  try {
    const res = await fetch(`${BASE_URL}/menu`, {
      headers: {
        "Authorization": "Bearer " + getToken()
      }
    });

    const menus = await res.json();
    const menu = menus.find(m => m.id == menuId);

    if (!menu) return alert("Menu tidak ditemukan");

    const existing = cart.find(i => i.menuId == menuId);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        menuId: menu.id,
        nama: menu.nama_menu,
        harga: menu.harga_jual,
        qty
      });
    }

    renderCart();

  } catch (err) {
    console.error(err);
  }
}

// ==========================
// RENDER CART
// ==========================
function renderCart() {
  const tbody = document.getElementById("cartTable");
  tbody.innerHTML = "";

  cart.forEach(item => {
    const tr = document.createElement("tr");
    const subtotal = item.harga * item.qty;

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>${item.qty}</td>
      <td>Rp ${subtotal.toLocaleString("id-ID")}</td>
      <td><button onclick="removeFromCart(${item.menuId})">Hapus</button></td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalHarga").textContent =
    "Rp " + calculateTotal().toLocaleString("id-ID");
}

function removeFromCart(menuId) {
  cart = cart.filter(i => i.menuId != menuId);
  renderCart();
}

function calculateTotal() {
  return cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
}

// ==========================
// CREATE TRANSACTION (FIX TOKEN)
// ==========================
async function createTransaction(status) {
  if (!cart.length) return alert("Keranjang kosong");

  try {
    const res = await fetch(`${BASE_URL}/transaksi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken() // 🔥 FIX UTAMA
      },
      body: JSON.stringify({
        user: sessionUser.username,
        items: cart.map(i => ({
          menuId: i.menuId,
          qty: i.qty,
          harga: i.harga
        })),
        status
      })
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    alert("Transaksi berhasil");

    cart = [];
    renderCart();

  } catch (err) {
    console.error(err);
    alert("ERROR: " + err.message);
  }
}

// ==========================
// EVENT
// ==========================
document.getElementById("transaksiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const menuId = document.getElementById("selectMenu").value;
  const qty = parseInt(document.getElementById("qtyMenu").value);

  if (!menuId) return alert("Pilih menu");

  addToCart(menuId, qty);
});

document.getElementById("btnPaid").onclick = () => createTransaction("Paid");
document.getElementById("btnSaveDraft").onclick = () => createTransaction("Draft");

// ==========================
loadMenuDropdown();
renderCart();