const db = require("../config/db");
const payrollService = require("../utils/payrollService");

exports.generatePayroll = async (req, res) => {

  const { tanggal } = req.body;

  try {
    const payrollId = await payrollService.generatePayrollHarian(tanggal);

    res.json({
      message: "Payroll dibuat, menunggu approval",
      payrollId
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.approvePayroll = async (req, res) => {

  const { id } = req.params;

  try {
    await db.query(
      `UPDATE payroll
       SET status = 'Published',
           approved_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: "Payroll dipublish" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};