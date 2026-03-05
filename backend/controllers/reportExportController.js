const db = require("../config/db");
const PDFDocument = require("pdfkit");

exports.exportMonthlyPnlPDF = async (req, res) => {

  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      error: "year dan month wajib"
    });
  }

  try {

    const [rows] = await db.query(`
      SELECT 
        SUM(omzet) AS omzet,
        SUM(cogs) AS cogs,
        SUM(payroll) AS payroll,
        SUM(net_profit) AS net_profit
      FROM laporan_pnl
      WHERE YEAR(tanggal)=? AND MONTH(tanggal)=?
    `, [year, month]);

    const data = rows[0];

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-${year}-${month}.pdf`
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("LAPORAN KEUANGAN BULANAN", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).text(`Periode : ${month}-${year}`);

    doc.moveDown();

    doc.text(`Total Omzet : Rp ${data.omzet || 0}`);
    doc.text(`Total COGS : Rp ${data.cogs || 0}`);
    doc.text(`Total Payroll : Rp ${data.payroll || 0}`);
    doc.text(`Net Profit : Rp ${data.net_profit || 0}`);

    doc.moveDown();

    doc.text("Disetujui oleh Owner", { align: "right" });

    doc.moveDown(3);

    doc.text("____________________", { align: "right" });

    doc.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};