const db = require("../config/db");
const ledgerService = require("./inventoryLedgerService");

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
      // Catat di inventory ledger
      await ledgerService.record(
        connection,
        bahan_id,
        "SALE_DEDUCTION",
        0,
        qty,
        transaksi_id,
        "TRANSACTION",
        user_id
      );
    }
  }
};
exports.rollbackStock = async (transaksiId, connection) => {

  const [details] = await connection.query(
    `SELECT menu_id, qty 
     FROM transaksi_detail 
     WHERE transaksi_id = ?`,
    [transaksiId]
  );

  for (let item of details) {

    const [resepRows] = await connection.query(
      `SELECT bahan_id, qty 
       FROM resep 
       WHERE menu_id = ?`,
      [item.menu_id]
    );

    for (let resep of resepRows) {

      const totalReturn = resep.qty * item.qty;

      await connection.query(
        `UPDATE bahan_baku 
         SET stok = stok + ? 
         WHERE id = ?`,
        [totalReturn, resep.bahan_id]
      );
      await ledgerService.record(
        connection,
        bahan_id,
        "TRANSACTION_CANCEL",
        qty,
        0,
        transaksi_id,
        "TRANSACTION",
        user_id
     );
    }
  }
};