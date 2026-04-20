const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const payrollService = require("../utils/payrollService");

exports.register = async (req, res) => {
  console.log("REGISTER BODY:", req.body);

  const { username, password, role, nama_lengkap } = req.body;

  try {
    // cek user
    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert ke DB
    await db.query(
      "INSERT INTO users (username, password, role, nama_lengkap) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, role, nama_lengkap]
    );

    res.json({ message: "Registrasi berhasil" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
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
      { id: user.id, role: user.role.toUpperCase() }, //FIX
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      role: user.role.toUpperCase(), //ALL UPPERCASE
      username: user.username
    });

  } catch (err) {
  console.log("LOGIN ERROR:", err);
  res.status(500).json({ error: err.message });
}
};