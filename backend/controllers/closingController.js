const db = require("../config/db");

exports.closeToday = async (req, res) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    const today = new Date().toISOString().slice(0,10);

    const [existing] = await connection.query(
      "SELECT * FROM closing WHERE tanggal = ?",
      [today]
    );

    if (existing.length > 0) {
      throw new Error("Hari ini sudah ditutup");
    }

    await connection.query(`
      INSERT INTO closing (tanggal, closed_by)
      VALUES (?, ?)
    `, [today, req.user.id]);

    await connection.commit();
    connection.release();

    res.json({ message: "Closing harian berhasil" });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};