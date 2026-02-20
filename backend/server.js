require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transaksi", require("./routes/transaksiRoutes"));
app.use("/api/bahan", require("./routes/bahanRoutes"));
app.use("/api/pembelian", require("./routes/pembelianRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/laporan", require("./routes/laporanRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
