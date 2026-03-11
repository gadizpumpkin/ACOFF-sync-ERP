const db = require("../config/db");

exports.getMenuPerformance = async (req, res) => {

  const { start_date, end_date } = req.query;

  try {

    const [rows] = await db.query(`
      SELECT 
        m.id,
        m.nama_menu,

        SUM(td.qty) AS qty_sold,

        SUM(td.subtotal) AS revenue,

        SUM(td.subtotal_modal) AS cogs,

        SUM(td.subtotal - td.subtotal_modal) AS profit,

        ROUND(
          (SUM(td.subtotal - td.subtotal_modal) /
           NULLIF(SUM(td.subtotal),0)) * 100
        ,2) AS profit_margin

      FROM transaksi_detail td

      JOIN transaksi t
        ON t.id = td.transaksi_id

      JOIN menu m
        ON m.id = td.menu_id

      WHERE t.status = 'Paid'

      AND DATE(t.tanggal) BETWEEN ? AND ?

      GROUP BY m.id, m.nama_menu

      ORDER BY profit DESC
    `,[start_date,end_date]);

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};