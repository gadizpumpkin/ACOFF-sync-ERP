const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { updateStatusPembelian } = require("../controllers/pembelianController");

router.put(
  "/:id/status",
  verifyToken,
  allowRoles("MANAGER", "OWNER"),
  updateStatusPembelian
);