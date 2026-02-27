const db = require("../config/db");
const stockService = require("../utils/stockService");

exports.createTransaksi = async (req, res) => {

  const { items, status } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Hitung total
    let total = 0;

    for (let item of items) {

      const [menuRows] = await connection.query(
        "SELECT harga FROM menu WHERE id = ?",
        [item.menu_id]
      );

      if (menuRows.length === 0) {
        throw new Error("Menu tidak ditemukan");
      }

      const harga = menuRows[0].harga;
      const subtotal = harga * item.qty;
      total += subtotal;
    }

    // Insert header
    const [result] = await connection.query(
      `INSERT INTO transaksi (tanggal, status, total, created_by)
       VALUES (NOW(), ?, ?, ?)`,
      [status, total, req.user.id]
    );

    const transaksiId = result.insertId;

    // Insert detail
    for (let item of items) {

      const [menuRows] = await connection.query(
        "SELECT harga FROM menu WHERE id = ?",
        [item.menu_id]
      );

      const harga = menuRows[0].harga;
      const subtotal = harga * item.qty;

      await connection.query(
        `INSERT INTO transaksi_detail 
         (transaksi_id, menu_id, qty, harga, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [transaksiId, item.menu_id, item.qty, harga, subtotal]
      );
    }

    // Jika Paid → potong stok
    if (status === "Paid") {
      await stockService.processStockDeduction(items, connection);
    }

    await connection.commit();
    connection.release();

    res.json({ message: "Transaksi berhasil", transaksiId });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};
exports.updateStatus = async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Ambil status lama
    const [rows] = await connection.query(
      "SELECT status FROM transaksi WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Transaksi tidak ditemukan");
    }

    const oldStatus = rows[0].status;

    // Jika dari Paid ke Canceled → rollback
    if (oldStatus === "Paid" && status === "Canceled") {
      await stockService.rollbackStock(id, connection);
    }

    // Update status
    await connection.query(
      "UPDATE transaksi SET status = ? WHERE id = ?",
      [status, id]
    );

    await connection.commit();
    connection.release();

    res.json({ message: "Status berhasil diupdate" });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};