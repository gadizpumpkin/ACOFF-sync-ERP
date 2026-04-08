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

if (sessionUser.role !== "Owner") {
  alert("Akses ditolak. Approval hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// ==========================
// RBAC MENU
// ==========================
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menuList.innerHTML = "";

menus.forEach(menu => {

  const li = document.createElement("li");

  const a = document.createElement("a");
  a.textContent = menu;

  switch (menu) {

    case "Dashboard":
      a.href = "dashboard.html";
      break;

    case "Approval Pembelian":
      a.href = "approval_pembelian.html";
      break;

    case "Approval Payroll":
      a.href = "approval_payroll.html";
      break;

    case "Approval Laporan":
      a.href = "approval_laporan.html";
      li.classList.add("active");
      break;

    case "Audit Log":
      a.href = "audit_log.html";
      break;

    default:
      a.href = "#";
  }

  li.appendChild(a);
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

// ==========================
// UTIL FORMAT
// ==========================
function formatRupiah(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

// ==========================
// RENDER TABLE
// ==========================
function renderPendingLaporan() {

  const tbody = document.getElementById("pendingTable");

  tbody.innerHTML = "";

  const laporan = getLaporanData();

  const pending = laporan.filter(l => l.status === "Pending");

  if (pending.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#888780;">
          Tidak ada laporan pending
        </td>
      </tr>
    `;

    return;
  }

  pending.forEach(l => {

    const tr = document.createElement("tr");

    const jenisClass =
      l.jenis === "Weekly"
        ? "cs-jenis-badge weekly"
        : "cs-jenis-badge monthly";

    tr.innerHTML = `

      <td>
        <span class="${jenisClass}">
          ${l.jenis}
        </span>
      </td>

      <td>
        ${l.periode}
      </td>

      <td class="cs-td-omzet">
        ${formatRupiah(l.totalOmzet)}
      </td>

      <td>
        ${l.totalTransaksi}
      </td>

      <td>

        <div class="cs-action-btn">

          <button
            class="cs-btn-view"
            onclick="viewDetail('${l.id}')"
          >
            Detail
          </button>

          <button
            class="cs-btn-approve"
            onclick="approveLaporan('${l.id}')"
          >
            Approve
          </button>

          <button
            class="cs-btn-reject"
            onclick="rejectLaporan('${l.id}')"
          >
            Reject
          </button>

        </div>

      </td>

    `;

    tbody.appendChild(tr);

  });

}

// ==========================
// VIEW DETAIL
// ==========================
function viewDetail(id) {

  const laporan = getLaporanData();

  const item = laporan.find(l => l.id === id);

  if (!item) {
    alert("Laporan tidak ditemukan");
    return;
  }

  alert(

`
Jenis      : ${item.jenis}

Periode    : ${item.periode}

Total Omzet:
${formatRupiah(item.totalOmzet)}

Total Transaksi:
${item.totalTransaksi}

Catatan:
${item.catatan || "-"}

`
  );

}

// ==========================
// APPROVE
// ==========================
function approveLaporan(id) {

  let laporan = getLaporanData();

  const item = laporan.find(l => l.id === id);

  if (!item) {
    alert("Laporan tidak ditemukan");
    return;
  }

  const confirmApprove = confirm(
    "Approve laporan ini?"
  );

  if (!confirmApprove) return;

  item.status = "Approved";

  saveLaporanData(laporan);

  alert("Laporan disetujui");

  renderPendingLaporan();

}

// ==========================
// REJECT
// ==========================
function rejectLaporan(id) {

  let laporan = getLaporanData();

  const item = laporan.find(l => l.id === id);

  if (!item) {
    alert("Laporan tidak ditemukan");
    return;
  }

  const confirmReject = confirm(
    "Reject laporan ini?"
  );

  if (!confirmReject) return;

  item.status = "Rejected";

  saveLaporanData(laporan);

  alert("Laporan ditolak");

  renderPendingLaporan();

}

// ==========================
// INIT
// ==========================
renderPendingLaporan();