const db = require("../config/db");

exports.checkClosing = async (req, res, next) => {
  try {
    let tanggal = req.body.tanggal
      ? req.body.tanggal
      : new Date().toISOString().slice(0, 10);

    const dateObj = new Date(tanggal);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    // ==========================
    // MONTHLY CHECK
    // ==========================
    let monthly = [];
    try {
      [monthly] = await db.query(`
        SELECT * FROM monthly_closing
        WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
      `, [month, year]);
    } catch (err) {
      console.warn("Monthly closing tidak digunakan / kolom tidak ada");
    }

    if (monthly.length > 0) {
      return res.status(403).json({
        error: `Periode ${year}-${month} sudah dikunci`
      });
    }

    // ==========================
    // DAILY CHECK 
    // ==========================
    const [daily] = await db.query(
      "SELECT * FROM closing WHERE tanggal = ?",
      [tanggal]
    );

    if (daily.length > 0) {
      return res.status(403).json({
        error: `Tanggal ${tanggal} sudah ditutup`
      });
    }

    next();

  } catch (err) {
    console.error("CLOSING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};