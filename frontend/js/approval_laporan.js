document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // AUTH
  // ==========================
  const sessionUser = getSession();

  if (!sessionUser) {
    window.location.href = "index.html";
    return;
  }

  const role = sessionUser.role.trim().toUpperCase();

  if (role !== "OWNER") {
    alert("Akses hanya untuk OWNER");
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("userRole").textContent = role;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  // ==========================
  // SIDEBAR DINAMIS
  // ==========================
  const menuList = document.getElementById("menuList");

  const menuConfig = {
    OWNER: [
      { name: "Dashboard", url: "dashboard.html" },
      { name: "Approval Pembelian", url: "approval_pembelian.html" },
      { name: "Approval Payroll", url: "approval_payroll.html" },
      { name: "Approval Laporan", url: "approval_laporan.html" },
      { name: "Lihat Laporan", url: "laporan_view.html" },
      { name: "Audit Log", url: "audit_log.html" }
    ]
  };

  menuList.innerHTML = "";

  menuConfig[role].forEach(menu => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = menu.url;
    a.textContent = menu.name;

    if (window.location.pathname.includes(menu.url)) {
      li.classList.add("active");
    }

    li.appendChild(a);
    menuList.appendChild(li);
  });

  // ==========================
  // DATA
  // ==========================
  function getData() {
    return JSON.parse(localStorage.getItem("laporanData")) || [];
  }

  function saveData(data) {
    localStorage.setItem("laporanData", JSON.stringify(data));
  }

  // ==========================
  // RENDER
  // ==========================
  function render(data = null) {
    const tbody = document.getElementById("pendingTable");
    tbody.innerHTML = "";

    if (!data) {
      data = getData().filter(d => (d.status || "Pending") === "Pending");
    }

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">Tidak ada data</td></tr>`;
      updateSummary([]);
      return;
    }

    data.forEach(d => {
      const laba = (d.penjualan || 0) - (d.pembelian || 0) - (d.payroll || 0);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${d.tanggal || "-"}</td>
        <td>Rp ${(d.penjualan || 0).toLocaleString("id-ID")}</td>
        <td>Rp ${(d.pembelian || 0).toLocaleString("id-ID")}</td>
        <td>Rp ${(d.payroll || 0).toLocaleString("id-ID")}</td>
        <td>Rp ${laba.toLocaleString("id-ID")}</td>
        <td>${d.status || "Pending"}</td>
        <td>
          <button onclick="approve('${d.id}')">Approve</button>
          <button onclick="reject('${d.id}')">Reject</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    updateSummary(data);
  }

  // ==========================
  // SUMMARY
  // ==========================
  function updateSummary(data) {
    let totalPenjualan = 0;
    let totalPembelian = 0;
    let totalPayroll = 0;

    data.forEach(d => {
      totalPenjualan += d.penjualan || 0;
      totalPembelian += d.pembelian || 0;
      totalPayroll += d.payroll || 0;
    });

    const laba = totalPenjualan - totalPembelian - totalPayroll;

    document.getElementById("totalPenjualan").textContent =
      "Rp " + totalPenjualan.toLocaleString("id-ID");

    document.getElementById("totalPembelian").textContent =
      "Rp " + totalPembelian.toLocaleString("id-ID");

    document.getElementById("totalPayroll").textContent =
      "Rp " + totalPayroll.toLocaleString("id-ID");

    const labaEl = document.getElementById("labaBersih");
    labaEl.textContent = "Rp " + laba.toLocaleString("id-ID");

    labaEl.style.color = laba >= 0 ? "green" : "red";
  }

  // ==========================
  // FILTER
  // ==========================
  document.getElementById("btnLoadReport").addEventListener("click", () => {
    const periode = document.getElementById("periode").value;
    const bulan = document.getElementById("bulan").value;

    let data = getData();

    if (periode === "monthly" && bulan) {
      data = data.filter(d => d.tanggal?.startsWith(bulan));
    }

    data = data.filter(d => (d.status || "Pending") === "Pending");

    render(data);
  });

  // ==========================
  // APPROVE / REJECT
  // ==========================
  window.approve = function(id) {
    let data = getData();

    data = data.map(d =>
      d.id === id ? { ...d, status: "Approved" } : d
    );

    saveData(data);
    render();
  };

  window.reject = function(id) {
    let data = getData();

    data = data.map(d =>
      d.id === id ? { ...d, status: "Rejected" } : d
    );

    saveData(data);
    render();
  };

  // ==========================
  // INIT
  // ==========================
  render();

});