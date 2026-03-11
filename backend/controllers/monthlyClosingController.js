const db = require("../config/db");

exports.closeMonth = async (req, res) => {

  const { year, month } = req.body;

  if (!year || !month) {
    return res.status(400).json({
      error: "year dan month wajib"
    });
  }

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // Cek sudah pernah lock
    const [existing] = await connection.query(
      "SELECT * FROM monthly_closing WHERE year=? AND month=?",
      [year, month]
    );

    if (existing.length > 0) {
      throw new Error("Bulan sudah dikunci");
    }

    // Validasi: semua hari sudah closing
    const [days] = await connection.query(`
      SELECT COUNT(DISTINCT DATE(tanggal)) AS total_hari
      FROM transaksi
      WHERE YEAR(tanggal)=? AND MONTH(tanggal)=?
    `, [year, month]);

    const [closedDays] = await connection.query(`
      SELECT COUNT(*) AS total_closed
      FROM closing
      WHERE YEAR(tanggal)=? AND MONTH(tanggal)=?
    `, [year, month]);

    if (days[0].total_hari !== closedDays[0].total_closed) {
      throw new Error("Masih ada hari yang belum closing");
    }

    await connection.query(`
      INSERT INTO monthly_closing (year, month, closed_by)
      VALUES (?, ?, ?)
    `, [year, month, req.user.id]);

    await connection.commit();
    connection.release();

    res.json({
      message: `Periode ${year}-${month} berhasil dikunci`
    });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};