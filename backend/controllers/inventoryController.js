const db = require("../config/db");

exports.getLedger = async (req,res)=>{

  const { bahan_id } = req.params;

  const [rows] = await db.query(`
    SELECT *
    FROM inventory_ledger
    WHERE bahan_id=?
    ORDER BY tanggal DESC
  `,[bahan_id]);

  res.json(rows);
};