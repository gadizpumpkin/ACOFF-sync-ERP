const db = require("../config/db");
const auditService = require("../utils/auditService");
const ledgerService = require("../utils/inventoryLedgerService");

// ==========================
// GET ALL PEMBELIAN
// ==========================
exports.getAllPembelian = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.tanggal,
        p.total,
        p.status,
        s.nama_supplier
      FROM pembelian p
      LEFT JOIN supplier s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil pembelian" });
  }
};

// ==========================
// CREATE PEMBELIAN
// ==========================
exports.createPembelian = async (req, res) => {
  const { supplierId, items, total } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO pembelian (supplier_id, total, status, created_by)
       VALUES (?, ?, 'DRAFT', ?)`,
      [supplierId, total, req.user.id]
    );

    const pembelianId = result.insertId;

    for (let item of items) {
      const subtotal = item.gram * item.harga;

      await connection.query(
        `INSERT INTO pembelian_detail 
        (pembelian_id, bahan_id, qty, harga, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [pembelianId, item.bahanId, item.gram, item.harga, subtotal]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      message: "Pembelian berhasil disimpan",
      id: pembelianId
    });

  } catch (err) {
    await connection.rollback();
    connection.release();

    console.error(err);
    res.status(500).json({ message: "Gagal simpan pembelian" });
  }
};

// ==========================
// UPDATE STATUS
// ==========================
exports.updateStatusPembelian = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // normalisasi
    if (!status) throw new Error("Status kosong");
    status = status.trim().toUpperCase();

    const [rows] = await connection.query(
      "SELECT status FROM pembelian WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Pembelian tidak ditemukan");
    }

    const oldStatus = rows[0].status;

    // validasi
    if (oldStatus === "DRAFT" && !["APPROVED", "REJECTED"].includes(status)) {
      throw new Error("Status tidak valid");
    }

    if (oldStatus === "APPROVED" && status !== "RECEIVED") {
      throw new Error("Status tidak valid");
    }

    if (oldStatus === "RECEIVED") {
      throw new Error("Sudah selesai");
    }

    // jika received → tambah stok
    if (status === "RECEIVED") {

      const [details] = await connection.query(
        "SELECT bahan_id, qty FROM pembelian_detail WHERE pembelian_id = ?",
        [id]
      );

      for (let item of details) {
        await connection.query(
          `UPDATE bahan_baku SET stok = stok + ? WHERE id = ?`,
          [item.qty, item.bahan_id]
        );

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

      await auditService.log(
        connection,
        req.user.id,
        "STOK_MASUK",
        `Stok masuk dari pembelian ${id}`
      );
    }

    await connection.query(
      `UPDATE pembelian 
       SET status = ?, approved_by = ?
       WHERE id = ?`,
      [status, req.user.id, id]
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