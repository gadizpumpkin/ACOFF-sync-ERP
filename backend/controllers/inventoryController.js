const db = require("../config/db");

// ==========================
// GET ALL BAHAN BAKU
// ==========================
exports.getAllBahan = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM bahan_baku");
  res.json(rows);
};

// ==========================
// CREATE BAHAN
// ==========================
exports.createBahan = async (req, res) => {
  const { nama, stok, minimal_stok } = req.body;

  await db.query(
    "INSERT INTO bahan_baku (nama, stok, minimal_stok) VALUES (?, ?, ?)",
    [nama, stok, minimal_stok]
  );

  res.json({ message: "Bahan berhasil ditambahkan" });
};

// ==========================
// UPDATE BAHAN
// ==========================
exports.updateBahan = async (req, res) => {
  const { id } = req.params;
  const { nama, stok, minimal_stok } = req.body;

  await db.query(
    "UPDATE bahan_baku SET nama=?, stok=?, minimal_stok=? WHERE id=?",
    [nama, stok, minimal_stok, id]
  );

  res.json({ message: "Bahan berhasil diupdate" });
};

// ==========================
// DELETE BAHAN
// ==========================
exports.deleteBahan = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM bahan_baku WHERE id=?", [id]);

  res.json({ message: "Bahan berhasil dihapus" });
};

// ==========================
// LEDGER
// ==========================
exports.getLedger = async (req,res)=>{
  const { bahan_id } = req.params;

  const [rows] = await db.query(`
    SELECT *
    FROM inventory_ledger
    WHERE bahan_id=?
    ORDER BY tanggal DESC
  `,[bahan_id]);

  res.json(rows);
};