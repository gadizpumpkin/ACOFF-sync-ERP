exports.createTransaksi = async (req, res) => {

  const { items } = req.body;
  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    let lowStockWarnings = [];

    // Insert transaksi awal
    const [result] = await connection.query(`
      INSERT INTO transaksi (tanggal, total, status)
      VALUES (NOW(), 0, 'Paid')
    `);

    const transaksiId = result.insertId;
    let totalTransaksi = 0;

    // Loop setiap menu
    for (let item of items) {

      const [resep] = await connection.query(`
        SELECT rd.bahan_id, rd.qty, bb.harga, bb.stok, bb.minimal_stok, bb.nama
        FROM resep_detail rd
        JOIN bahan_baku bb ON bb.id = rd.bahan_id
        WHERE rd.menu_id = ?
        FOR UPDATE
      `, [item.menu_id]);

      if (resep.length === 0) {
        throw new Error("Resep tidak ditemukan");
      }

      let modalPerMenu = 0;

      // VALIDASI STOK DULU
      for (let bahan of resep) {

        const totalKebutuhan = bahan.qty * item.qty;

        if (bahan.stok < totalKebutuhan) {
          throw new Error(
            `Stok ${bahan.nama} tidak cukup`
          );
        }

        modalPerMenu += bahan.qty * bahan.harga;
      }

      // Kurangi stok + cek threshold
      for (let bahan of resep) {

        const totalKebutuhan = bahan.qty * item.qty;

        await connection.query(`
          UPDATE bahan_baku
          SET stok = stok - ?
          WHERE id = ?
        `, [totalKebutuhan, bahan.bahan_id]);

        // Ambil stok terbaru
        const [stokBaru] = await connection.query(`
          SELECT stok, minimal_stok, nama
          FROM bahan_baku
          WHERE id = ?
        `, [bahan.bahan_id]);

        const dataBahan = stokBaru[0];

        if (dataBahan.stok <= dataBahan.minimal_stok) {

          lowStockWarnings.push({
            bahan: dataBahan.nama,
            stok: dataBahan.stok,
            minimal: dataBahan.minimal_stok
          });

          await auditService.log(
            connection,
            req.user?.id || null,
            "LOW_STOCK_WARNING",
            `Stok bahan ${dataBahan.nama} rendah (${dataBahan.stok})`
          );
        }
      }

      const subtotalJual = item.qty * item.harga;
      const subtotalModal = modalPerMenu * item.qty;

      totalTransaksi += subtotalJual;

      // Snapshot COGS
      await connection.query(`
        INSERT INTO transaksi_detail
        (transaksi_id, menu_id, qty, harga_jual, subtotal, harga_modal, subtotal_modal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        transaksiId,
        item.menu_id,
        item.qty,
        item.harga,
        subtotalJual,
        modalPerMenu,
        subtotalModal
      ]);
    }

    // Update total transaksi
    await connection.query(`
      UPDATE transaksi
      SET total = ?
      WHERE id = ?
    `, [totalTransaksi, transaksiId]);

    await connection.commit();
    connection.release();

    res.json({
      message: "Transaksi berhasil",
      transaksi_id: transaksiId,
      warning_stok: lowStockWarnings
    });

  } catch (err) {

    await connection.rollback();
    connection.release();

    res.status(400).json({ error: err.message });
  }
};