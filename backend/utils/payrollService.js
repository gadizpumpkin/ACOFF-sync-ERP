const db = require("../config/db");

exports.generatePayrollHarian = async (tanggal, userId) => {

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Ambil config
    const [configRows] = await connection.query(
      "SELECT persentase_bagi FROM payroll_config LIMIT 1"
    );

    const persen = configRows[0].persentase_bagi / 100;

    // Hitung omzet Paid hari itu
    const [omzetRows] = await connection.query(
      `SELECT IFNULL(SUM(total),0) AS omzet
       FROM transaksi
       WHERE status = 'Paid'
       AND DATE(tanggal) = ?`,
      [tanggal]
    );

    const omzet = omzetRows[0].omzet;

    // Ambil absensi hadir
    const [hadirRows] = await connection.query(
      `SELECT user_id
       FROM absensi
       WHERE tanggal = ?
       AND status = 'Hadir'`,
      [tanggal]
    );

    if (hadirRows.length === 0) {
      throw new Error("Tidak ada karyawan hadir");
    }

    const totalDibagi = omzet * persen;
    const jumlahKaryawan = hadirRows.length;
    const gajiPerOrang = totalDibagi / jumlahKaryawan;

    // Insert payroll header
    const [payrollResult] = await connection.query(
      `INSERT INTO payroll
       (periode_awal, periode_akhir, total_laba)
       VALUES (?, ?, ?)`,
      [tanggal, tanggal, totalDibagi]
    );

    const payrollId = payrollResult.insertId;

    // Insert detail
    for (let karyawan of hadirRows) {
      await connection.query(
        `INSERT INTO payroll_detail
         (payroll_id, user_id, jumlah)
         VALUES (?, ?, ?)`,
        [payrollId, karyawan.user_id, gajiPerOrang]
      );
    }

    await connection.commit();
    connection.release();

    return payrollId;

  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
};