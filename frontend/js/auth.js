// Simulasi database user (sementara hardcode)
const usersDB = [
  { username: "owner", password: "123", role: "Owner" },
  { username: "manajer", password: "123", role: "Manajer" },
  { username: "karyawan", password: "123", role: "Karyawan" }
];

// Simpan session user
function setSession(user) {
  localStorage.setItem("sessionUser", JSON.stringify(user));
}

function getSession() {
  return JSON.parse(localStorage.getItem("sessionUser"));
}

function clearSession() {
  localStorage.removeItem("sessionUser");
}

// Login check
function authenticate(username, password) {
  return usersDB.find(u => u.username === username && u.password === password);
}

// RBAC menu mapping
if (role === "Owner") {
  return [
    "Lihat Laporan",
    "Audit Keuangan",
    "Approval Pembelian",
    "Approval Payroll",
    "Approval Laporan"
  ];


  if (role === "Manajer") {
  return [
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

  if (role === "Karyawan") {
    return [
      "Input Transaksi",
      "Transaksi Penjualan",
      "Cetak Struk",
      "Absensi",
      "Paycheck"
    ];
  }

  return [];
}
