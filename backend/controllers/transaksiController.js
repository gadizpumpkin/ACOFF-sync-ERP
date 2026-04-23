const db = require("../config/db");
const stockService = require("../utils/stockService");

exports.createTransaksi = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { user, items, total, status } = req.body;

    await connection.beginTransaction();

    // ==========================
    // GET USER ID
    // ==========================
    const [userRow] = await connection.query(
      "SELECT id FROM users WHERE username = ?",
      [user]
    );

    if (!userRow.length) {
      throw new Error("User tidak ditemukan");
    }

    const user_id = userRow[0].id;

    // ==========================
    // INSERT TRANSAKSI
    // ==========================
    const [trxResult] = await connection.query(
      `INSERT INTO transaksi 
      (tanggal, total, metode_bayar, status, created_by) 
      VALUES (NOW(), ?, ?, ?, ?)`,
      [total, "CASH", status, user_id] // ✅ FIX DISINI
    );

    const transaksi_id = trxResult.insertId;

    // ==========================
    // INSERT DETAIL
    // ==========================
    for (const item of items) {
      await connection.query(
        `INSERT INTO transaksi_detail 
        (transaksi_id, menu_id, qty, harga, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [
          transaksi_id,
          item.menuId,
          item.qty,
          item.harga,
          item.harga * item.qty
        ]
      );
    }

    // ==========================
    // STOCK (ONLY PAID)
    // ==========================
    if (status === "Paid") {
      await stockService.processStockDeduction(
        transaksi_id,
        user_id,
        items.map(i => ({
          menu_id: i.menuId,
          qty: i.qty
        })),
        connection
      );
    }

    await connection.commit();

    res.json({
      message: "Transaksi berhasil",
      transaksi_id
    });

  } catch (err) {
    await connection.rollback();
    console.error("ERROR TRANSAKSI:", err);

    res.status(500).json({
      message: err.message
    });

  } finally {
    connection.release();
  }
};