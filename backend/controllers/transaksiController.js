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

    // Insert transaksi utama
    const [result] = await connection.query(`
      INSERT INTO transaksi (tanggal, total, status)
      VALUES (NOW(), 0, 'Paid')
    `);

    const transaksiId = result.insertId;

    let totalTransaksi = 0;

    // Loop item
    for (let item of items) {

      // Ambil resep + harga bahan saat ini
      const [resep] = await connection.query(`
        SELECT rd.bahan_id, rd.qty, bb.harga
        FROM resep_detail rd
        JOIN bahan_baku bb ON bb.id = rd.bahan_id
        WHERE rd.menu_id = ?
      `, [item.menu_id]);

      let modalPerMenu = 0;

      for (let bahan of resep) {

        const totalQtyBahan = bahan.qty * item.qty;

        // Hitung modal snapshot
        modalPerMenu += bahan.qty * bahan.harga;

        // Kurangi stok
        await connection.query(`
          UPDATE bahan_baku
          SET stok = stok - ?
          WHERE id = ?
        `, [totalQtyBahan, bahan.bahan_id]);
      }

      const subtotalJual = item.qty * item.harga;
      const subtotalModal = modalPerMenu * item.qty;

      totalTransaksi += subtotalJual;

      //SNAPSHOT DISIMPAN 
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

    //Update total transaksi
    await connection.query(`
      UPDATE transaksi
      SET total = ?
      WHERE id = ?
    `, [totalTransaksi, transaksiId]);

    await connection.commit();
    connection.release();

    res.json({ message: "Transaksi berhasil dibuat" });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};