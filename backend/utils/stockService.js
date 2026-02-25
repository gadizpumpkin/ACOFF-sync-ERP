const db = require("../config/db");

exports.checkStock = async (items) => {
  for (let item of items) {
    const [resep] = await db.query(
      "SELECT bahan_id, gram FROM resep WHERE menu_id = ?",
      [item.menu_id]
    );

    for (let r of resep) {
      const needed = r.gram * item.qty;

      const [bahan] = await db.query(
        "SELECT stok_gram FROM bahan_baku WHERE id = ?",
        [r.bahan_id]
      );

      if (bahan[0].stok_gram < needed) {
        return {
          ok: false,
          message: "Stok tidak cukup"
        };
      }
    }
  }

  return { ok: true };
};

exports.reduceStock = async (items) => {
  for (let item of items) {
    const [resep] = await db.query(
      "SELECT bahan_id, gram FROM resep WHERE menu_id = ?",
      [item.menu_id]
    );

    for (let r of resep) {
      const needed = r.gram * item.qty;

      await db.query(
        "UPDATE bahan_baku SET stok_gram = stok_gram - ? WHERE id = ?",
        [needed, r.bahan_id]
      );
    }
  }
};