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

if (sessionUser.role !== "Owner") {
  alert("Akses ditolak. Halaman ini hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Approval Pembelian") window.location.href = "approval_pembelian.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getPembelianData() {
  return JSON.parse(localStorage.getItem("pembelianData")) || [];
}

function savePembelianData(data) {
  localStorage.setItem("pembelianData", JSON.stringify(data));
}

function getBahanBakuData() {
  return JSON.parse(localStorage.getItem("bahanBakuData")) || [];
}

function saveBahanBakuData(data) {
  localStorage.setItem("bahanBakuData", JSON.stringify(data));
}

// ==========================
// APPLY STOCK INCREASE (RECEIVED)
// ==========================
function applyStockIncrease(items) {
  let bahanData = getBahanBakuData();

  items.forEach(it => {
    bahanData = bahanData.map(b => {
      if (b.id === it.bahanId) {
        return { ...b, stok: b.stok + it.gram };
      }
      return b;
    });
  });

  saveBahanBakuData(bahanData);
}

// ==========================
// UPDATE STATUS
// ==========================
function approvePembelian(id) {
  let pembelianData = getPembelianData();
  const po = pembelianData.find(p => p.id === id);

  if (!po) return alert("Data pembelian tidak ditemukan.");
  if (po.status !== "Pending") return alert("Hanya pembelian Pending yang dapat di-approve.");

  po.status = "Approved";
  po.approvedBy = sessionUser.username;

  savePembelianData(pembelianData);
  renderTable();
}

function rejectPembelian(id) {
  let pembelianData = getPembelianData();
  const po = pembelianData.find(p => p.id === id);

  if (!po) return alert("Data pembelian tidak ditemukan.");
  if (po.status !== "Pending") return alert("Hanya pembelian Pending yang dapat di-reject.");

  po.status = "Rejected";
  po.approvedBy = sessionUser.username;

  savePembelianData(pembelianData);
  renderTable();
}

function receivePembelian(id) {
  let pembelianData = getPembelianData();
  const po = pembelianData.find(p => p.id === id);

  if (!po) return alert("Data pembelian tidak ditemukan.");
  if (po.status !== "Approved") return alert("Hanya pembelian Approved yang dapat diterima (Received).");

  // tambah stok
  applyStockIncrease(po.items);

  po.status = "Received";
  po.receivedAt = new Date().toLocaleString("id-ID");

  savePembelianData(pembelianData);
  renderTable();

  alert("Pembelian diterima. Stok berhasil ditambahkan.");
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable() {
  const tbody = document.getElementById("approvalTable");
  tbody.innerHTML = "";

  const pembelianData = getPembelianData();

  pembelianData.slice().reverse().forEach(po => {
    let statusClass = "status-pending";
    if (po.status === "Approved") statusClass = "status-approved";
    if (po.status === "Rejected") statusClass = "status-rejected";
    if (po.status === "Received") statusClass = "status-received";

    let actions = "";

    if (po.status === "Pending") {
      actions = `
        <button class="btn-approve" onclick="approvePembelian('${po.id}')">Approve</button>
        <button class="btn-reject" onclick="rejectPembelian('${po.id}')">Reject</button>
      `;
    } else if (po.status === "Approved") {
      actions = `
        <button class="btn-receive" onclick="receivePembelian('${po.id}')">Received</button>
      `;
    } else {
      actions = "-";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${po.id}</td>
      <td>${po.supplierNama}</td>
      <td>${po.tanggal}</td>
      <td class="${statusClass}">${po.status}</td>
      <td>Rp ${po.total.toLocaleString("id-ID")}</td>
      <td>${actions}</td>
    `;

    tbody.appendChild(tr);
  });
}

// INIT
renderTable();
