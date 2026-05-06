const db = require("../config/db");

exports.laporanOmzet = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: "Parameter tanggal wajib diisi" });
  }

  try {
    // ==========================
    // OMZET
    // ==========================
    const [omzetRows] = await db.query(
      `SELECT 
         IFNULL(SUM(total), 0) AS total_omzet,
         COUNT(*) AS total_transaksi
       FROM transaksi
       WHERE status = 'CLOSED'
       AND tanggal BETWEEN ? AND ?`,
      [start, end]
    );

    // ==========================
    // TOP MENU
    // ==========================
    const [topMenuRows] = await db.query(
      `SELECT 
         m.nama_menu, 
         SUM(td.qty) AS total_terjual
       FROM transaksi_detail td
       JOIN transaksi t ON td.transaksi_id = t.id
       JOIN menu m ON td.menu_id = m.id
       WHERE t.status = 'CLOSED'
       AND t.tanggal BETWEEN ? AND ?
       GROUP BY m.id
       ORDER BY total_terjual DESC
       LIMIT 5`,
      [start, end]
    );

    // ==========================
    // BAHAN TERPAKAI
    // ==========================
    const [bahanRows] = await db.query(
      `SELECT 
         b.nama_bahan,
         SUM(td.qty * r.qty) AS total_pakai
       FROM transaksi_detail td
       JOIN transaksi t ON td.transaksi_id = t.id
       JOIN resep r ON td.menu_id = r.menu_id
       JOIN bahan_baku b ON r.bahan_id = b.id
       WHERE t.status = 'CLOSED'
       AND t.tanggal BETWEEN ? AND ?
       GROUP BY b.id`,
      [start, end]
    );

    res.json({
      periode: { start, end },
      total_omzet: omzetRows[0].total_omzet,
      total_transaksi: omzetRows[0].total_transaksi,
      top_menu: topMenuRows,
      bahan_terpakai: bahanRows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};