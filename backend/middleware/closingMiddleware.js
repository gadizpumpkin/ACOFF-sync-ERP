const db = require("../config/db");

exports.checkClosing = async (req, res, next) => {

  try {

    // Ambil tanggal transaksi (jika ada)
    let tanggal;

    if (req.body.tanggal) {
      tanggal = req.body.tanggal;
    } else {
      tanggal = new Date().toISOString().slice(0,10);
    }

    const [rows] = await db.query(
      "SELECT * FROM closing WHERE tanggal = ?",
      [tanggal]
    );

    if (rows.length > 0) {
      return res.status(403).json({
        error: `Tanggal ${tanggal} sudah ditutup`
      });
    }

    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};