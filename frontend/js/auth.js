function setSession(user) {
  localStorage.setItem("userSession", JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem("userSession");
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem("userSession");
}

function getMenuByRole(role) {
  if (role === "OWNER") {
    return [
      "Dashboard",
      "Export P&L",
      "Audit Keuangan",
      "Approval Pembelian",
      "Approval Payroll",
      "Approval Laporan"
    ];
  }

  if (role === "MANAGER") {
    return [
      "Dashboard",
      "Kelola Menu",
      "Kelola Resep",
      "Kelola Bahan Baku",
      "Kelola Supplier",
      "Pembelian Bahan Baku",
      "Absensi",
      "Payroll",
      "Generate Laporan"
    ];
  }

  if (role === "KARYAWAN") {
    return [
      "Dashboard",
      "Transaksi Penjualan",
      "Cetak Struk",
      "Absensi",
      "Paycheck"
    ];
  }

  return [];
}