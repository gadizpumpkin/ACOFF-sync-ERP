const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const payrollService = require("../utils/payrollService");

exports.login = async (req, res) => {
  console.log("BODY:", req.body);
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      role: user.role,
      username: user.username
    });

  } catch (err) {
  console.log("LOGIN ERROR:", err);
  res.status(500).json({ error: err.message });
}
};
exports.generatePayroll = async (req, res) => {

  const { tanggal } = req.body;

  try {
    const payrollId = await payrollService.generatePayrollHarian(
      tanggal,
      req.user.id
    );

    res.json({
      message: "Payroll dibuat, menunggu approval",
      payrollId
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
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

    res.json({ message: "Payroll dipublish" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};