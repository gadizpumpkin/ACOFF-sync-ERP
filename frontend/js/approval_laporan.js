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
  alert("Akses ditolak. Approval laporan hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Approval Laporan") window.location.href = "approval_laporan.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

// ==========================
// STORAGE
// ==========================
function getLaporanData() {
  return JSON.parse(localStorage.getItem("laporanData")) || [];
}

function saveLaporanData(data) {
  localStorage.setItem("laporanData", JSON.stringify(data));
}

// VIEW
function viewLaporan(id) {
  localStorage.setItem("selectedLaporanId", id);
  window.location.href = "laporan_view.html";
}

// APPROVE
function approveLaporan(id) {
  let laporan = getLaporanData();
  const item = laporan.find(l => l.id === id);

  if (!item) return alert("Laporan tidak ditemukan.");

  if (!confirm("Approve laporan ini? Setelah approve laporan menjadi Published.")) return;

  item.status = "Approved";
  item.approvedBy = sessionUser.username;

  saveLaporanData(laporan);

  alert("Laporan berhasil disetujui dan dipublish.");
  renderPending();
}

// REJECT
function rejectLaporan(id) {
  let laporan = getLaporanData();
  const item = laporan.find(l => l.id === id);

  if (!item) return alert("Laporan tidak ditemukan.");

  if (!confirm("Reject laporan ini?")) return;

  item.status = "Rejected";
  item.approvedBy = sessionUser.username;

  saveLaporanData(laporan);

  alert("Laporan ditolak.");
  renderPending();
}

// RENDER
function renderPending() {
  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = "";

  const laporan = getLaporanData().filter(l => l.status === "Pending");

  laporan.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.type}</td>
      <td>${l.periodeMulai} s/d ${l.periodeSelesai}</td>
      <td>Rp ${l.totalOmzet.toLocaleString("id-ID")}</td>
      <td>${l.totalTransaksi}</td>
      <td>
        <div class="action-btn">
          <button class="btn-view" onclick="viewLaporan('${l.id}')">View</button>
          <button class="btn-approve" onclick="approveLaporan('${l.id}')">Approve</button>
          <button class="btn-reject" onclick="rejectLaporan('${l.id}')">Reject</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// INIT
renderPending();
