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

if (sessionUser.role !== "OWNER") {
  alert("Akses ditolak. Halaman ini hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// ==========================
// RBAC MENU (optional jika ingin dinamis)
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

// mapping route halaman
const menuRoutes = {
  "Dashboard": "dashboard.html",
  "Approval Pembelian": "approval_pembelian.html",
  "Approval Payroll": "approval_payroll.html",
  "Approval Laporan": "approval_laporan.html",
  "Lihat Laporan": "laporan_view.html",
  "Audit Keuangan": "audit_log.html"
};

menuList.innerHTML = "";

menus.forEach(menu => {
  const li = document.createElement("li");

  const a = document.createElement("a");
  a.href = menuRoutes[menu] || "#";
  a.textContent = menu;

  if (!menuRoutes[menu]) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Menu belum dibuat: " + menu);
    });
  }

  li.appendChild(a);
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
    // Sesuaikan dengan class pill CSS
    let statusClass = "cs-status-pill pending";
    if (po.status === "Approved") statusClass = "cs-status-pill approved";
    if (po.status === "Rejected") statusClass = "cs-status-pill rejected";
    if (po.status === "Received") statusClass = "cs-status-pill received";

    let actions = "";

    if (po.status === "Pending") {
      actions = `
        <div class="cs-action-btn">
          <button class="cs-btn-approve" onclick="approvePembelian('${po.id}')">Approve</button>
          <button class="cs-btn-reject" onclick="rejectPembelian('${po.id}')">Reject</button>
        </div>
      `;
    } else if (po.status === "Approved") {
      actions = `
        <div class="cs-action-btn">
          <button class="cs-btn-receive" onclick="receivePembelian('${po.id}')">Received</button>
        </div>
      `;
    } else {
      actions = "-";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="cs-td-id">${po.id}</td>
      <td>${po.supplierNama}</td>
      <td>${po.tanggal}</td>
      <td><span class="${statusClass}"><span class="cs-pulse"></span>${po.status}</span></td>
      <td class="cs-td-total">Rp ${po.total.toLocaleString("id-ID")}</td>
      <td>${actions}</td>
    `;

    tbody.appendChild(tr);
  });
}

// INIT
renderTable();