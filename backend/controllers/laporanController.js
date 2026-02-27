const db = require("../config/db");

exports.laporanOmzet = async (req, res) => {

  const { start, end } = req.query;

  try {

    // 1️⃣ Total omzet
    const [omzetRows] = await db.query(
      `SELECT 
         IFNULL(SUM(total),0) AS total_omzet,
         COUNT(*) AS total_transaksi
       FROM transaksi
       WHERE status = 'Paid'
       AND tanggal BETWEEN ? AND ?`,
      [start, end]
    );

    // 2️⃣ Top menu
    const [topMenuRows] = await db.query(
      `SELECT m.nama, SUM(td.qty) AS total_terjual
       FROM transaksi_detail td
       JOIN transaksi t ON td.transaksi_id = t.id
       JOIN menu m ON td.menu_id = m.id
       WHERE t.status = 'Paid'
       AND t.tanggal BETWEEN ? AND ?
       GROUP BY m.id
       ORDER BY total_terjual DESC
       LIMIT 5`,
      [start, end]
    );

    // 3️⃣ Bahan terpakai
    const [bahanRows] = await db.query(
      `SELECT b.nama,
         SUM(td.qty * r.qty) AS total_gram
       FROM transaksi_detail td
       JOIN transaksi t ON td.transaksi_id = t.id
       JOIN resep r ON td.menu_id = r.menu_id
       JOIN bahan_baku b ON r.bahan_id = b.id
       WHERE t.status = 'Paid'
       AND t.tanggal BETWEEN ? AND ?
       GROUP BY b.id`,
      [start, end]
    );

    res.json({
      periode: { awal: start, akhir: end },
      total_omzet: omzetRows[0].total_omzet,
      total_transaksi: omzetRows[0].total_transaksi,
      top_menu: topMenuRows,
      bahan_terpakai: bahanRows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};