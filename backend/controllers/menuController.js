const db = require("../config/db");

// GET MENU
exports.getMenu = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM menu ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE MENU
exports.createMenu = async (req, res) => {
  const { nama_menu, harga_jual } = req.body;

  if (!nama_menu || !harga_jual) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    await db.query(
      "INSERT INTO menu (nama_menu, harga_jual) VALUES (?, ?)",
      [nama_menu, harga_jual]
    );

    res.json({ success: true, message: "Menu berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE MENU
exports.deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM menu WHERE id = ?", [id]);
    res.json({ success: true, message: "Menu dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};