require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const menuRoutes = require("./routes/menuRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/transaksi", require("./routes/transaksiRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/laporan", require("./routes/laporanRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/closing", require("./routes/closingRoutes"));
app.use("/api/supplier", require("./routes/supplierRoutes"));
app.use("/api/monthly-closing", require("./routes/monthlyClosingRoutes"));
app.use("/api/report", require("./routes/reportRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// route utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});



