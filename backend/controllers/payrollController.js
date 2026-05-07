const db = require("../config/db");

// ==========================
// GENERATE PAYROLL
// ==========================
exports.generatePayroll = async (req, res) => {

  const { periode_awal, periode_akhir } = req.body;

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    // ==========================
    // HITUNG PROFIT
    // ==========================
    const [profitRows] = await connection.query(`
      SELECT
        COALESCE(SUM(total), 0) AS profit
      FROM transaksi
      WHERE DATE(tanggal) 
      BETWEEN ? AND ?
      AND status = 'CLOSED'
    `, [periode_awal, periode_akhir]);

    const profit = Number(profitRows[0].profit);

    if (profit <= 0) {
      throw new Error("Profit hari ini 0");
    }

    // ==========================
    // ABSENSI HADIR
    // ==========================
    const [employees] = await connection.query(`
      SELECT
        a.user_id,
        u.role,
        SUM(a.total_jam) AS total_jam
      FROM absensi a
      JOIN users u
      ON a.user_id = u.id
      WHERE a.tanggal
      BETWEEN ? AND ?
      AND a.status = 'HADIR'
      GROUP BY a.user_id
    `, [periode_awal, periode_akhir]);

    if (employees.length === 0) {
      throw new Error("Tidak ada karyawan hadir");
    }

    // ==========================
    // INSERT PAYROLL
    // ==========================
    const [payrollResult] = await connection.query(`
      INSERT INTO payroll
      (
        periode_awal,
        periode_akhir,
        total_gaji,
        processed_by,
        status
      )
      VALUES (?, ?, 0, ?, 'Pending')
    `, [
      periode_awal,
      periode_akhir,
      req.user.id
    ]);

    const payrollId = payrollResult.insertId;

    let totalPayroll = 0;

    // ==========================
    // INSERT DETAIL
    // ==========================
    for (const emp of employees) {

      const [rateRows] = await connection.query(`
        SELECT rate_per_jam
        FROM payroll_config
        WHERE role = ?
        LIMIT 1
      `, [emp.role]);

      const rate = Number(
        rateRows[0]?.rate_per_jam || 0
      );

      const totalJam = Number(
        emp.total_jam || 0
      );

      const totalGaji = totalJam * rate;

      totalPayroll += totalGaji;

      await connection.query(`
        INSERT INTO payroll_detail
        (
          payroll_id,
          user_id,
          total_jam,
          rate,
          total_gaji
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        payrollId,
        emp.user_id,
        totalJam,
        rate,
        totalGaji
      ]);
    }

    // ==========================
    // UPDATE TOTAL
    // ==========================
    await connection.query(`
      UPDATE payroll
      SET total_gaji = ?
      WHERE id = ?
    `, [
      totalPayroll,
      payrollId
    ]);

    await connection.commit();

    connection.release();

    res.json({
      message: "Payroll berhasil dibuat"
    });

  } catch (err) {

    await connection.rollback();

    connection.release();

    console.error("PAYROLL ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// GET PAYROLL
// ==========================
exports.getPendingPayroll = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT
        p.id,
        p.periode_awal,
        p.periode_akhir,
        p.total_gaji,
        p.status,
        p.created_at,
        u.username AS processed_by
      FROM payroll p
      LEFT JOIN users u
      ON p.processed_by = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// APPROVE
// ==========================
exports.approvePayroll = async (req, res) => {

  const { id } = req.params;

  try {

    await db.query(`
      UPDATE payroll
      SET status = 'Published',
          approved_by = ?
      WHERE id = ?
    `, [req.user.id, id]);

    res.json({
      message: "Payroll approved"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};

// ==========================
// REJECT
// ==========================
exports.rejectPayroll = async (req, res) => {

  const { id } = req.params;

  try {

    await db.query(`
      UPDATE payroll
      SET status = 'Rejected',
          approved_by = ?
      WHERE id = ?
    `, [req.user.id, id]);

    res.json({
      message: "Payroll rejected"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};