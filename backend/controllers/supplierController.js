const db = require("../config/db");

// GET
exports.getAll = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM supplier");
  res.json(rows);
};

// CREATE
exports.create = async (req, res) => {
  const { nama, hp, alamat } = req.body;

  await db.query(
    "INSERT INTO supplier (nama, hp, alamat) VALUES (?, ?, ?)",
    [nama, hp, alamat]
  );

  res.json({ message: "Supplier ditambahkan" });
};

// UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nama, hp, alamat } = req.body;

  await db.query(
    "UPDATE supplier SET nama=?, hp=?, alamat=? WHERE id=?",
    [nama, hp, alamat, id]
  );

  res.json({ message: "Supplier diupdate" });
};

// DELETE
exports.remove = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM supplier WHERE id=?", [id]);

  res.json({ message: "Supplier dihapus" });
};