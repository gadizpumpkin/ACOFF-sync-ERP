const db = require("../config/db");

exports.closeToday = async (req, res) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    const today = new Date().toISOString().slice(0,10);

    // Cek sudah closing belum
    const [existing] = await connection.query(
      "SELECT * FROM closing WHERE tanggal = ?",
      [today]
    );

    if (existing.length > 0) {
      throw new Error("Hari ini sudah ditutup");
    }

    // HITUNG OMZET
    const [omzetRows] = await connection.query(`
      SELECT IFNULL(SUM(total),0) AS omzet
      FROM transaksi
      WHERE status='Paid'
      AND DATE(tanggal)=?
    `, [today]);

    // HITUNG COGS (SNAPSHOT)
    const [cogsRows] = await connection.query(`
      SELECT IFNULL(SUM(subtotal_modal),0) AS cogs
      FROM transaksi_detail td
      JOIN transaksi t ON t.id = td.transaksi_id
      WHERE t.status='Paid'
      AND DATE(t.tanggal)=?
    `, [today]);

    // HITUNG PAYROLL
    const [payrollRows] = await connection.query(`
      SELECT IFNULL(SUM(total_gaji),0) AS payroll
      FROM payroll
      WHERE status='Approved'
      AND DATE(tanggal)=?
    `, [today]);

    const omzet = omzetRows[0].omzet;
    const cogs = cogsRows[0].cogs;
    const payroll = payrollRows[0].payroll;
    const netProfit = omzet - cogs - payroll;

    // SIMPAN SNAPSHOT PNL
    await connection.query(`
      INSERT INTO laporan_pnl (tanggal, omzet, cogs, payroll, net_profit)
      VALUES (?, ?, ?, ?, ?)
    `, [today, omzet, cogs, payroll, netProfit]);

    // SIMPAN CLOSING
    await connection.query(`
      INSERT INTO closing (tanggal, closed_by)
      VALUES (?, ?)
    `, [today, req.user.id]);

    await connection.commit();
    connection.release();

    res.json({
      message: "Closing berhasil",
      laporan: {
        tanggal: today,
        omzet,
        cogs,
        payroll,
        net_profit: netProfit
      }
    });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};
