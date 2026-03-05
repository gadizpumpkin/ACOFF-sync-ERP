require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/transaksi", require("./routes/transaksiRoutes"));
app.use("/api/laporan", require("./routes/laporanRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/closing", require("./routes/closingRoutes"));
app.use("/api/monthly-closing", require("./routes/monthlyClosingRoutes"));
app.use("/api/report", require("./routes/reportRoutes"));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});