const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================
// GET ALL RESEP
// ==========================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.menu_id,
        m.nama_menu,
        r.bahan_id,
        b.nama_bahan AS nama_bahan, 
        r.qty
      FROM resep r
      JOIN menu m ON m.id = r.menu_id
      JOIN bahan_baku b ON b.id = r.bahan_id
      ORDER BY m.nama_menu ASC
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET RESEP ERROR:", err);
    res.status(500).json({
      error: "Gagal mengambil data resep",
      detail: err.message
    });
  }
});

// ==========================
// CREATE RESEP
// ==========================
router.post("/", async (req, res) => {
  try {
    const { menu_id, bahan_id, qty } = req.body;

    if (!menu_id || !bahan_id || !qty) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const [check] = await db.query(`
      SELECT * FROM resep
      WHERE menu_id = ? AND bahan_id = ?
    `, [menu_id, bahan_id]);

    if (check.length > 0) {
      return res.status(400).json({ error: "Resep sudah ada" });
    }

    await db.query(`
      INSERT INTO resep (menu_id, bahan_id, qty)
      VALUES (?, ?, ?)
    `, [menu_id, bahan_id, qty]);

    res.json({ message: "Resep berhasil ditambahkan" });

  } catch (err) {
    console.error("CREATE RESEP ERROR:", err);
    res.status(500).json({
      error: "Gagal menambah resep",
      detail: err.message
    });
  }
});

// ==========================
// DELETE RESEP
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM resep WHERE id = ?", [req.params.id]);
    res.json({ message: "Resep dihapus" });

  } catch (err) {
    console.error("DELETE RESEP ERROR:", err);
    res.status(500).json({
      error: "Gagal menghapus resep",
      detail: err.message
    });
  }
});

module.exports = router;