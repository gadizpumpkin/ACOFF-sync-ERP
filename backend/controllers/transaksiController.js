// backend/controllers/transaksiController.js

const db = require("../config/db");
const stockService = require("../utils/stockService");
const auditService = require("../utils/auditService");

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

    // 🔴 TARUH DI SINI
    if (oldStatus === "Paid" && status === "Canceled") {

      await stockService.rollbackStock(id, connection);

      await auditService.log(
        connection,
        req.user.id,
        "ROLLBACK_STOK",
        `Rollback stok untuk transaksi ID ${id}`
      );
    }

    // Update status
    await connection.query(
      "UPDATE transaksi SET status = ? WHERE id = ?",
      [status, id]
    );

    // Audit perubahan status
    await auditService.log(
      connection,
      req.user.id,
      "UPDATE_STATUS_TRANSAKSI",
      `Transaksi ID ${id} berubah dari ${oldStatus} ke ${status}`
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