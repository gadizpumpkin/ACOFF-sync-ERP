const db = require("../config/db");

// ==========================
// GET ALL
// ==========================
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        nama_bahan AS nama,
        stok,
        min_stok AS minimal_stok
      FROM bahan_baku
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil data bahan baku" });
  }
};

// ==========================
// CREATE
// ==========================
exports.create = async (req, res) => {
  try {
    const { nama, stok, minimal_stok } = req.body;

    await db.query(`
      INSERT INTO bahan_baku 
      (nama_bahan, satuan, stok, min_stok, harga_rata)
      VALUES (?, 'gram', ?, ?, 0)
    `, [nama, stok, minimal_stok]);

    res.json({ message: "Bahan baku berhasil ditambahkan" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal simpan bahan baku" });
  }
};

// ==========================
// UPDATE
// ==========================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, stok, minimal_stok } = req.body;

    await db.query(`
      UPDATE bahan_baku
      SET 
        nama_bahan = ?,
        stok = ?,
        min_stok = ?
      WHERE id = ?
    `, [nama, stok, minimal_stok, id]);

    res.json({ message: "Bahan baku berhasil diupdate" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update bahan baku" });
  }
};

// ==========================
// DELETE
// ==========================
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM bahan_baku WHERE id = ?", [id]);

    res.json({ message: "Bahan baku berhasil dihapus" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal hapus bahan baku" });
  }
};