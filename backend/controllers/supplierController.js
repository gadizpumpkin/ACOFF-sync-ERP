const db = require("../config/db");

// ==========================
// AMBIL DATA
// ==========================
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM supplier");
    res.json(rows);
  } catch (err) {
    console.error("GET SUPPLIER ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data supplier" });
  }
};

// ==========================
// BUAT DATA BARU
// ==========================
exports.create = async (req, res) => {
  try {
    const { nama, hp, alamat } = req.body;

    // VALIDASI
    if (!nama || !hp || !alamat) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    await db.query(
      "INSERT INTO supplier (nama_supplier, kontak, alamat) VALUES (?, ?, ?)",
      [nama, hp, alamat]
    );

    res.json({ message: "Supplier berhasil ditambahkan" });
  } catch (err) {
    console.error("CREATE SUPPLIER ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan data supplier" });
  }
};

// ==========================
// UOPDATE DATA
// ==========================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, hp, alamat } = req.body;

    if (!nama || !hp || !alamat) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    const [result] = await db.query(
      "UPDATE supplier SET nama_supplier=?, kontak=?, alamat=? WHERE id=?",
      [nama, hp, alamat, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    res.json({ message: "Supplier berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE SUPPLIER ERROR:", err);
    res.status(500).json({ message: "Gagal update supplier" });
  }
};

// ==========================
// DELETE SUPPLIER
// ==========================
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM supplier WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    res.json({ message: "Supplier berhasil dihapus" });
  } catch (err) {
    console.error("DELETE SUPPLIER ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus supplier" });
  }
};