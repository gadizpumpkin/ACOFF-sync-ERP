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
      "Lihat Laporan",
      "Audit Keuangan",
      "Approval Pembelian",
      "Approval Payroll",
      "Approval Laporan"
    ];
  }

  if (role === "MANAGER") {
    return [
      "Dashboard",
      "Transaksi Penjualan",
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
      "Input Transaksi",
      "Transaksi Penjualan",
      "Cetak Struk",
      "Absensi",
      "Paycheck"
    ];
  }

  return [];
}