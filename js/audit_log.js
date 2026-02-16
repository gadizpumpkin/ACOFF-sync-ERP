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

// hanya Owner boleh audit log
if (sessionUser.role !== "Owner") {
  alert("Akses ditolak. Audit Log hanya untuk Owner.");
  window.location.href = "dashboard.html";
}

// RBAC MENU
const menuList = document.getElementById("menuList");
const menus = getMenuByRole(sessionUser.role);

menus.forEach(menu => {
  const li = document.createElement("li");
  li.textContent = menu;

  li.addEventListener("click", function() {
    if (menu === "Audit Log") window.location.href = "audit_log.html";
    else alert("Menu belum dibuat: " + menu);
  });

  menuList.appendChild(li);
});

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
// RENDER TABLE
// ==========================
function renderAuditTable(filterAction = "ALL") {
  const tbody = document.getElementById("auditTable");
  tbody.innerHTML = "";

  let logs = getAuditLogData().slice().reverse();

  if (filterAction !== "ALL") {
    logs = logs.filter(l => l.action === filterAction);
  }

  logs.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.timestamp}</td>
      <td>${l.actor}</td>
      <td>${l.role}</td>
      <td>${l.action}</td>
      <td>${l.targetId}</td>
      <td>${l.description}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// FILTER EVENT
// ==========================
document.getElementById("btnApplyFilter").addEventListener("click", function() {
  const action = document.getElementById("filterAction").value;
  renderAuditTable(action);
});

document.getElementById("btnResetFilter").addEventListener("click", function() {
  document.getElementById("filterAction").value = "ALL";
  renderAuditTable("ALL");
});

// ==========================
// CLEAR LOG
// ==========================
document.getElementById("btnClearLog").addEventListener("click", function() {
  if (!confirm("Yakin ingin menghapus semua audit log?")) return;

  saveAuditLogData([]);
  renderAuditTable("ALL");

  alert("Audit log berhasil dihapus.");
});

// INIT
renderAuditTable("ALL");
