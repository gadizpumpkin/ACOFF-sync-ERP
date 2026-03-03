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