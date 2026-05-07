const db = require("../config/db");

// ==========================
// CREATE TRANSAKSI
// ==========================
exports.createTransaksi = async (req, res) => {
  const { items, metode_bayar } = req.body;

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // ==========================
    // INSERT TRANSAKSI
    // ==========================
    const [result] = await connection.query(`
      INSERT INTO transaksi
      (
        tanggal,
        total,
        metode_bayar,
        status,
        created_by
      )
      VALUES
      (
        NOW(),
        0,
        ?,
        'OPEN',
        ?
      )
    `, [
      metode_bayar || "Cash",
      req.user.id
    ]);

    const transaksiId = result.insertId;

    let total = 0;

    // ==========================
    // DETAIL
    // ==========================
    for (const item of items) {

      const subtotal = item.qty * item.harga;

      total += subtotal;

      await connection.query(`
        INSERT INTO transaksi_detail
        (
          transaksi_id,
          menu_id,
          qty,
          harga,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        transaksiId,
        item.menu_id,
        item.qty,
        item.harga,
        subtotal
      ]);
    }

    // ==========================
    // UPDATE TOTAL
    // ==========================
    await connection.query(`
      UPDATE transaksi
      SET total = ?
      WHERE id = ?
    `, [total, transaksiId]);

    await connection.commit();

    connection.release();

    res.json({
      message: "Transaksi berhasil",
      transaksi_id: transaksiId
    });

  } catch (err) {

    await connection.rollback();

    connection.release();

    console.error("TRANSAKSI ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// GET ALL TRANSAKSI
// ==========================
exports.getAllTransaksi = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT *
      FROM transaksi
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// UPDATE STATUS
// ==========================
exports.updateStatus = async (req, res) => {

  const { id } = req.params;

  try {

    await db.query(`
      UPDATE transaksi
      SET status = 'CLOSED'
      WHERE id = ?
    `, [id]);

    res.json({
      message: "Status transaksi diupdate"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// GET DAILY PROFIT
// ==========================
exports.getDailyProfit = async (req, res) => {

  const { tanggal } = req.query;

  try {

    const [rows] = await db.query(`
      SELECT
        COALESCE(SUM(total), 0) AS profit
      FROM transaksi
      WHERE DATE(tanggal) = ?
      AND status = 'CLOSED'
    `, [tanggal]);

    res.json({
      tanggal,
      profit: Number(rows[0].profit)
    });

  } catch (err) {

    console.error("PROFIT ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};