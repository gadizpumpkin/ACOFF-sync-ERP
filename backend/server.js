const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const bahanRoutes = require("./routes/bahanRoutes");
const menuRoutes = require("./routes/menuRoutes");
const resepRoutes = require("./routes/resepRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const pembelianRoutes = require("./routes/pembelianRoutes");
const absensiRoutes = require("./routes/absensiRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/bahan", bahanRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/resep", resepRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/pembelian", pembelianRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/audit", auditRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Coffee Street API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
