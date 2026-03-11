const db = require("../config/db");
const auditService = require("../utils/auditService");
const ledgerService = require("../utils/inventoryLedgerService");

exports.updateStatusPembelian = async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // Ambil status lama
    const [rows] = await connection.query(
      "SELECT status FROM pembelian WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Pembelian tidak ditemukan");
    }

    const oldStatus = rows[0].status;

    // Validasi alur status
    if (oldStatus === "Pending" && !["Approved","Rejected"].includes(status)) {
      throw new Error("Status tidak valid");
    }

    if (oldStatus === "Approved" && status !== "Received") {
      throw new Error("Status tidak valid");
    }

    if (oldStatus === "Received") {
      throw new Error("Pembelian sudah diterima");
    }

    // Jika berubah ke Received → update stok + ledger
    if (status === "Received") {

      const [details] = await connection.query(
        "SELECT bahan_id, qty FROM pembelian_detail WHERE pembelian_id = ?",
        [id]
      );

      for (let item of details) {

        // Update stok
        await connection.query(
          `UPDATE bahan_baku
           SET stok = stok + ?
           WHERE id = ?`,
          [item.qty, item.bahan_id]
        );

        // Record inventory ledger
        await ledgerService.record(
          connection,
          item.bahan_id,
          "PURCHASE_RECEIVED",
          item.qty,
          0,
          id,
          "PURCHASE",
          req.user.id
        );

      }

      // Audit log stok masuk
      await auditService.log(
        connection,
        req.user.id,
        "STOK_MASUK",
        `Stok bertambah dari pembelian ID ${id}`
      );
    }

    // Update status pembelian
    await connection.query(
      `UPDATE pembelian
       SET status = ?,
           approved_by = ?
       WHERE id = ?`,
      [status, req.user.id, id]
    );

    // Audit perubahan status
    await auditService.log(
      connection,
      req.user.id,
      "UPDATE_STATUS_PEMBELIAN",
      `Pembelian ID ${id} berubah dari ${oldStatus} ke ${status}`
    );

    await connection.commit();
    connection.release();

    res.json({ message: "Status pembelian berhasil diupdate" });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};