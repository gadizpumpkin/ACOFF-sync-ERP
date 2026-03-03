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
exports.createTransaksi = async (req, res) => {

  const { items } = req.body;
  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // Insert transaksi awal
    const [result] = await connection.query(`
      INSERT INTO transaksi (tanggal, total, status)
      VALUES (NOW(), 0, 'Paid')
    `);

    const transaksiId = result.insertId;
    let totalTransaksi = 0;

    // Loop setiap menu yang dibeli
    for (let item of items) {

      // Ambil resep + harga bahan
      const [resep] = await connection.query(`
        SELECT rd.bahan_id, rd.qty, bb.harga, bb.stok
        FROM resep_detail rd
        JOIN bahan_baku bb ON bb.id = rd.bahan_id
        WHERE rd.menu_id = ?
        FOR UPDATE
      `, [item.menu_id]);

      if (resep.length === 0) {
        throw new Error("Resep tidak ditemukan");
      }

      let modalPerMenu = 0;

      // VALIDASI STOK DULU
      for (let bahan of resep) {

        const totalKebutuhan = bahan.qty * item.qty;

        if (bahan.stok < totalKebutuhan) {
          throw new Error(
            `Stok tidak cukup untuk bahan ID ${bahan.bahan_id}`
          );
        }

        modalPerMenu += bahan.qty * bahan.harga;
      }

      // Jika semua aman → kurangi stok
      for (let bahan of resep) {

        const totalKebutuhan = bahan.qty * item.qty;

        await connection.query(`
          UPDATE bahan_baku
          SET stok = stok - ?
          WHERE id = ?
        `, [totalKebutuhan, bahan.bahan_id]);
      }

      const subtotalJual = item.qty * item.harga;
      const subtotalModal = modalPerMenu * item.qty;

      totalTransaksi += subtotalJual;

      // Simpan snapshot COGS
      await connection.query(`
        INSERT INTO transaksi_detail
        (transaksi_id, menu_id, qty, harga_jual, subtotal, harga_modal, subtotal_modal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        transaksiId,
        item.menu_id,
        item.qty,
        item.harga,
        subtotalJual,
        modalPerMenu,
        subtotalModal
      ]);
    }

    // Update total transaksi
    await connection.query(`
      UPDATE transaksi
      SET total = ?
      WHERE id = ?
    `, [totalTransaksi, transaksiId]);

    await connection.commit();
    connection.release();

    res.json({
      message: "Transaksi berhasil",
      transaksi_id: transaksiId
    });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};