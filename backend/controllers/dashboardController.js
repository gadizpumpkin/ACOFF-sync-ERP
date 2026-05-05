const db = require("../config/db");

exports.getOwnerSummary = async (req, res) => {
  try {

    // OMZET HARI INI
    const [omzetRows] = await db.query(`
      SELECT IFNULL(SUM(total),0) AS omzet,
             COUNT(*) AS total_transaksi
      FROM transaksi
      WHERE status='Paid'
      AND DATE(tanggal)=CURDATE()
    `);

    // COGS HARI INI
    const [cogsRows] = await db.query(`
      SELECT IFNULL(SUM(rd.qty * bb.harga),0) AS cogs
      FROM transaksi_detail td
      JOIN resep_detail rd ON rd.menu_id = td.menu_id
      JOIN bahan_baku bb ON bb.id = rd.bahan_id
      JOIN transaksi t ON t.id = td.transaksi_id
      WHERE t.status='Paid'
      AND DATE(t.tanggal)=CURDATE()
    `);

    // PAYROLL HARI INI
    const [payrollRows] = await db.query(`
    SELECT IFNULL(SUM(total_gaji),0) AS payroll
    FROM payroll
    WHERE status='Approved'
    AND DATE(tanggal)=CURDATE()
    `);

    const omzet = omzetRows[0].omzet;
    const cogs = cogsRows[0].cogs;
    const payroll = payrollRows[0].payroll;

    const netProfit = omzet - cogs - payroll;

    res.json({
      omzet_hari_ini: omzet,
      cogs_harian: cogs,
      payroll_harian: payroll,
      net_profit_harian: netProfit,
      total_transaksi: omzetRows[0].total_transaksi
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getLowStockAlert = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT id, nama_bahan, stok, min_stok
      FROM bahan_baku
      WHERE stok <= min_stok
      ORDER BY stok ASC
    `);

    res.json(rows);

  } catch (err) {
    console.error("LOW STOCK ALERT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getLowStock = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT id, nama_bahan, stok, min_stok
      FROM bahan_baku
      WHERE stok <= min_stok
      ORDER BY stok ASC
    `);

    res.json({
      total_low_stock: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("LOW STOCK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getPnlByDate = async (req, res) => {

  const { tanggal } = req.query;

  const [rows] = await db.query(
    "SELECT * FROM laporan_pnl WHERE tanggal = ?",
    [tanggal]
  );

  res.json(rows[0] || {});
};
exports.getMonthlyPnl = async (req, res) => {

  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      error: "Parameter year dan month wajib"
    });
  }

  try {

    const [rows] = await db.query(`
      SELECT 
        SUM(omzet) AS total_omzet,
        SUM(cogs) AS total_cogs,
        SUM(payroll) AS total_payroll,
        SUM(net_profit) AS total_net_profit
      FROM laporan_pnl
      WHERE YEAR(tanggal) = ?
      AND MONTH(tanggal) = ?
    `, [year, month]);

    const data = rows[0];

    // HITUNG MARGIN
    const grossMargin = 
      data.total_omzet > 0
        ? ((data.total_omzet - data.total_cogs) / data.total_omzet) * 100
        : 0;

    const netMargin =
      data.total_omzet > 0
        ? (data.total_net_profit / data.total_omzet) * 100
        : 0;

    res.json({
      periode: `${year}-${month}`,
      total_omzet: data.total_omzet || 0,
      total_cogs: data.total_cogs || 0,
      total_payroll: data.total_payroll || 0,
      total_net_profit: data.total_net_profit || 0,
      gross_margin_percent: grossMargin,
      net_margin_percent: netMargin
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};