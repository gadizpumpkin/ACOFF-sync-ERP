const db = require("../config/db");

// ==========================
// HELPER HITUNG JAM
// ==========================
function hitungTotalJam(jamMasuk, jamKeluar) {
  if (!jamMasuk || !jamKeluar) return 0;

  const [h1, m1] = jamMasuk.split(":").map(Number);
  const [h2, m2] = jamKeluar.split(":").map(Number);

  let start = h1 * 60 + m1;
  let end = h2 * 60 + m2;

  if (end < start) end += 24 * 60;

  const diff = end - start;
  return (diff / 60).toFixed(2);
}

// ==========================
// GET ABSENSI BY USERNAME
// ==========================
exports.getAbsensiByUser = (req, res) => {
  const { username } = req.params;
  console.log("GET ABSENSI:", username);

  const query = `
    SELECT a.*, u.username as user
    FROM absensi a
    JOIN users u ON a.user_id = u.id
    WHERE u.username = ?
    ORDER BY a.tanggal DESC
  `;

  db.query(query, [username], (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.sqlMessage,
      });
    }

    console.log("RESULT:", result);
    res.json(result);
  });
};

// ==========================
// ABSEN MASUK
// ==========================
exports.absenMasuk = (req, res) => {
  const { user, tanggal, jamMasuk } = req.body;
  console.log("ABSEN MASUK:", req.body);

  const getUser = "SELECT id FROM users WHERE username = ?";
  db.query(getUser, [user], (err, userResult) => {
    if (err) {
      console.error("ERROR USER:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (userResult.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user_id = userResult[0].id;

    const checkQuery =
      "SELECT * FROM absensi WHERE user_id = ? AND tanggal = ?";
    db.query(checkQuery, [user_id, tanggal], (err, checkResult) => {
      if (err) {
        console.error("CHECK ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({ message: "Sudah absen" });
      }

      const insertQuery = `
        INSERT INTO absensi (user_id, tanggal, jam_masuk, status)
        VALUES (?, ?, ?, 'HADIR')
      `;

      db.query(insertQuery, [user_id, tanggal, jamMasuk], (err) => {
        if (err) {
          console.error("INSERT ERROR:", err);
          return res.status(500).json({ message: "Gagal absen masuk" });
        }

        res.json({ message: "Absen masuk berhasil" });
      });
    });
  });
};

// ==========================
// ABSEN KELUAR
// ==========================
exports.absenKeluar = (req, res) => {
  const { user, tanggal, jamKeluar } = req.body;
  console.log("ABSEN KELUAR:", req.body);

  const getUser = "SELECT id FROM users WHERE username = ?";
  db.query(getUser, [user], (err, userResult) => {
    if (err) {
      console.error("ERROR USER:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (userResult.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user_id = userResult[0].id;

    const getAbsensi =
      "SELECT * FROM absensi WHERE user_id = ? AND tanggal = ?";
    db.query(getAbsensi, [user_id, tanggal], (err, result) => {
      if (err) {
        console.error("GET ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Belum absen masuk" });
      }

      const data = result[0];

      if (data.jam_keluar) {
        return res.status(400).json({ message: "Sudah absen keluar" });
      }

      const totalJam = hitungTotalJam(
        data.jam_masuk,
        jamKeluar
      );

      const updateQuery = `
        UPDATE absensi 
        SET jam_keluar = ?, total_jam = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [jamKeluar, totalJam, data.id], (err) => {
        if (err) {
          console.error("UPDATE ERROR:", err);
          return res.status(500).json({ message: "Gagal absen keluar" });
        }

        res.json({ message: "Absen keluar berhasil" });
      });
    });
  });
};