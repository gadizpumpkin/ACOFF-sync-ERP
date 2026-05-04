const db = require("../config/db");

// ==========================
// GENERATE PAYROLL
// ==========================
exports.generatePayroll = async (req, res) => {
  const { periode_awal, periode_akhir, total_gaji } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO payroll 
      (periode_awal, periode_akhir, total_gaji, processed_by, status)
      VALUES (?, ?, ?, ?, 'Pending')`,
      [periode_awal, periode_akhir, total_gaji, req.user.id]
    );

    res.json({
      message: "Payroll dibuat, menunggu approval",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// GET PENDING PAYROLL
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
      LEFT JOIN users u ON p.processed_by = u.id
      WHERE p.status = 'Pending'
      ORDER BY p.created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// APPROVE PAYROLL
// ==========================
exports.approvePayroll = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE payroll 
       SET status = 'Published',
           approved_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: "Payroll berhasil di-approve" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// REJECT PAYROLL
// ==========================
exports.rejectPayroll = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE payroll 
       SET status = 'Rejected',
           approved_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: "Payroll ditolak" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};