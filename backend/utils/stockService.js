const db = require("../config/db");

exports.processStockDeduction = async (items, connection) => {

  for (let item of items) {

    // Ambil resep menu
    const [resepRows] = await connection.query(
      `SELECT bahan_id, qty 
       FROM resep 
       WHERE menu_id = ?`,
      [item.menu_id]
    );

    if (resepRows.length === 0) {
      throw new Error("Resep tidak ditemukan untuk menu ID " + item.menu_id);
    }

    for (let resep of resepRows) {

      const totalKebutuhan = resep.qty * item.qty;

      // Cek stok bahan
      const [bahanRows] = await connection.query(
        `SELECT stok FROM bahan_baku WHERE id = ? FOR UPDATE`,
        [resep.bahan_id]
      );

      if (bahanRows.length === 0) {
        throw new Error("Bahan tidak ditemukan");
      }

      const stokSekarang = bahanRows[0].stok;

      if (stokSekarang < totalKebutuhan) {
        throw new Error("Stok tidak cukup untuk bahan ID " + resep.bahan_id);
      }

      // Kurangi stok
      await connection.query(
        `UPDATE bahan_baku 
         SET stok = stok - ? 
         WHERE id = ?`,
        [totalKebutuhan, resep.bahan_id]
      );
    }
  }
};