exports.log = async (connection, userId, aksi, keterangan) => {
  await connection.query(
    `INSERT INTO audit_log (user_id, aksi, keterangan)
     VALUES (?, ?, ?)`,
    [userId, aksi, keterangan]
  );
};