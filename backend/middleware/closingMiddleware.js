const db = require("../config/db");

exports.checkClosing = async (req, res, next) => {

  try {

    let tanggal = req.body.tanggal 
      ? req.body.tanggal 
      : new Date().toISOString().slice(0,10);

    const year = new Date(tanggal).getFullYear();
    const month = new Date(tanggal).getMonth() + 1;

    // Cek monthly closing
    const [monthly] = await db.query(
      "SELECT * FROM monthly_closing WHERE year = ? AND month = ?",
      [year, month]
    );

    if (monthly.length > 0) {
      return res.status(403).json({
        error: `Periode ${year}-${month} sudah dikunci`
      });
    }

    // Cek daily closing
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
    res.status(500).json({ error: err.message });
  }
};