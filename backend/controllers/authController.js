const db = require("../config/db");
const stockService = require("../utils/stockService");

exports.createTransaksi = async (req, res) => {
  const { items, status } = req.body;

  try {
    if (status === "Paid") {
      const validStock = await stockService.checkStock(items);
      if (!validStock.ok)
        return res.status(400).json({ message: validStock.message });
    }

    const [result] = await db.query(
      "INSERT INTO transaksi (tanggal, status) VALUES (NOW(), ?)",
      [status]
    );

    const transaksiId = result.insertId;

    for (let item of items) {
      await db.query(
        "INSERT INTO transaksi_detail (transaksi_id, menu_id, qty) VALUES (?, ?, ?)",
        [transaksiId, item.menu_id, item.qty]
      );
    }

    if (status === "Paid") {
      await stockService.reduceStock(items);
    }

    res.json({ message: "Transaksi berhasil" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
