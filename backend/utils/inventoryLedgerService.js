const db = require("../config/db");

exports.record = async (
  connection,
  bahan_id,
  event_type,
  qty_in,
  qty_out,
  reference_id,
  reference_type,
  user_id
) => {

  const [last] = await connection.query(
    "SELECT saldo FROM inventory_ledger WHERE bahan_id=? ORDER BY id DESC LIMIT 1",
    [bahan_id]
  );

  const lastSaldo = last.length ? last[0].saldo : 0;

  const newSaldo = lastSaldo + qty_in - qty_out;

  await connection.query(`
    INSERT INTO inventory_ledger
    (bahan_id,event_type,qty_in,qty_out,saldo,reference_id,reference_type,created_by)
    VALUES (?,?,?,?,?,?,?,?)
  `,[
    bahan_id,
    event_type,
    qty_in,
    qty_out,
    newSaldo,
    reference_id,
    reference_type,
    user_id
  ]);
};