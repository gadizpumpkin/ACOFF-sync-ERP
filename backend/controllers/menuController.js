const db = require("../config/db");

exports.getMenus = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM menu");
  res.json(rows);
};

exports.createMenu = async (req, res) => {
  const { nama, harga } = req.body;

  await db.query(
    "INSERT INTO menu (nama_menu, harga_jual) VALUES (?, ?)",
    [nama, harga]
  );

  res.json({ message: "Menu berhasil ditambahkan" });
};

exports.updateMenu = async (req, res) => {
  const { id } = req.params;
  const { nama, harga } = req.body;

  await db.query(
    "UPDATE menu SET nama_menu=?, harga_jual=? WHERE id=?",
    [nama, harga, id]
  );

  res.json({ message: "Menu berhasil diupdate" });
};

exports.deleteMenu = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM menu WHERE id=?", [id]);

  res.json({ message: "Menu berhasil dihapus" });
};