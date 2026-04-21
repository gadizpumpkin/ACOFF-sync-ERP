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

// hanya Owner boleh audit log
if (sessionUser.role !== "OWNER") {
  alert("Akses ditolak. Audit Log hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// ==========================
// STORAGE
// ==========================
function getAuditLogData() {
  return JSON.parse(localStorage.getItem("auditLogData")) || [];
}

function saveAuditLogData(data) {
  localStorage.setItem("auditLogData", JSON.stringify(data));
}

// ==========================
// HELPER BADGE
// ==========================
function getActionBadge(action) {
  let className = "other";
  let label = action;

  if (action.includes("APPROVE")) {
    className = "approve";
    label = action.replace("APPROVE_", "Approve ");
  } else if (action.includes("REJECT")) {
    className = "reject";
    label = action.replace("REJECT_", "Reject ");
  }

  return `<span class="cs-aksi-badge ${className}">${label}</span>`;
}

function getRoleBadge(role) {
  return `<span class="cs-role-pill">${role}</span>`;
}

// ==========================
// RENDER TABLE
// ==========================
function renderAuditTable(filterAction = "ALL") {
  const tbody = document.getElementById("auditTable");
  tbody.innerHTML = "";

  let logs = getAuditLogData().slice().reverse();

  if (filterAction !== "ALL") {
    logs = logs.filter(l => l.action === filterAction);
  }

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:#888;">
          Tidak ada data audit log
        </td>
      </tr>
    `;
    return;
  }

  logs.forEach(l => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="cs-td-timestamp">${l.timestamp}</td>
      <td>${l.actor}</td>
      <td>${getRoleBadge(l.role)}</td>
      <td>${getActionBadge(l.action)}</td>
      <td class="cs-td-target">${l.targetId || "-"}</td>
      <td>${l.description || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// FILTER EVENT
// ==========================
document.getElementById("btnApplyFilter").addEventListener("click", function () {
  const action = document.getElementById("filterAction").value;
  renderAuditTable(action);
});

document.getElementById("btnResetFilter").addEventListener("click", function () {
  document.getElementById("filterAction").value = "ALL";
  renderAuditTable("ALL");
});

// ==========================
// CLEAR LOG
// ==========================
document.getElementById("btnClearLog").addEventListener("click", function () {
  if (!confirm("Yakin ingin menghapus semua audit log?")) return;

  saveAuditLogData([]);
  renderAuditTable("ALL");

  alert("Audit log berhasil dihapus.");
});

// ==========================
// INIT
// ==========================
renderAuditTable("ALL");