// backend/controllers/absensiController.js

const db = require("../config/db");

// ==========================
// HITUNG TOTAL JAM
// ==========================
function hitungJam(masuk, keluar) {
  if (!masuk || !keluar) return 0;

  const [h1, m1] = masuk.split(":").map(Number);
  const [h2, m2] = keluar.split(":").map(Number);

  let start = h1 * 60 + m1;
  let end = h2 * 60 + m2;

  if (end < start) end += 24 * 60;

  return ((end - start) / 60).toFixed(2);
}

// ==========================
// GET ABSENSI BY USER
// ==========================
exports.getByUser = async (req, res) => {
  const { username } = req.params;

  console.log("GET ABSENSI:", username);

  try {
    const [rows] = await db.query(
      `SELECT a.*, u.username 
       FROM absensi a
       JOIN users u ON a.user_id = u.id
       WHERE u.username = ?
       ORDER BY a.tanggal DESC`,
      [username]
    );

    console.log("DATA DITEMUKAN:", rows.length);

    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR GET:", err);
    res.status(500).json({ message: "Error ambil data" });
  }
};

// ==========================
// ABSEN MASUK
// ==========================
exports.masuk = async (req, res) => {
  const { user, tanggal, jam_masuk } = req.body;

  console.log("ABSEN MASUK:", req.body);

  try {
    // STEP 1: ambil user
    console.log("STEP 1: GET USER");

    const [userRows] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [user]
    );

    console.log("STEP 2: USER RESULT =", userRows);

    if (userRows.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user_id = userRows[0].id;

    // STEP 3: cek sudah absen
    console.log("STEP 3: CEK ABSENSI");

    const [cek] = await db.query(
      "SELECT * FROM absensi WHERE user_id=? AND tanggal=?",
      [user_id, tanggal]
    );

    console.log("STEP 4: CEK RESULT =", cek);

    if (cek.length > 0) {
      return res.status(400).json({ message: "Sudah absen hari ini" });
    }

    // STEP 5: insert
    console.log("STEP 5: INSERT");

    const [result] = await db.query(
      `INSERT INTO absensi (user_id, tanggal, jam_masuk, status)
       VALUES (?, ?, ?, 'HADIR')`,
      [user_id, tanggal, jam_masuk]
    );

    console.log("✅ INSERT SUCCESS:", result.insertId);

    res.json({ message: "Absen masuk berhasil" });

  } catch (err) {
    console.error("❌ ERROR MASUK:", err);
    res.status(500).json({ message: "Gagal absen masuk" });
  }
};

// ==========================
// ABSEN KELUAR
// ==========================
exports.keluar = async (req, res) => {
  const { user, tanggal, jam_keluar } = req.body;

  console.log("ABSEN KELUAR:", req.body);

  try {
    console.log("STEP 1: GET USER");

    const [userRows] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [user]
    );

    console.log("STEP 2: USER RESULT =", userRows);

    if (userRows.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user_id = userRows[0].id;

    console.log("STEP 3: GET ABSENSI");

    const [rows] = await db.query(
      "SELECT * FROM absensi WHERE user_id=? AND tanggal=?",
      [user_id, tanggal]
    );

    console.log("STEP 4: DATA =", rows);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Belum absen masuk" });
    }

    const data = rows[0];

    if (data.jam_keluar) {
      return res.status(400).json({ message: "Sudah absen keluar" });
    }

    const total = hitungJam(data.jam_masuk, jam_keluar);

    console.log("STEP 5: UPDATE");

    await db.query(
      `UPDATE absensi 
       SET jam_keluar=?, total_jam=? 
       WHERE id=?`,
      [jam_keluar, total, data.id]
    );

    console.log("✅ UPDATE SUCCESS");

    res.json({ message: "Absen keluar berhasil" });

  } catch (err) {
    console.error("❌ ERROR KELUAR:", err);
    res.status(500).json({ message: "Gagal absen keluar" });
  }
};