const express = require("express");
const router = express.Router();

const { triggerManualAnomalyController } = require("../controllers/admin_controller");

router.post("/trigger-anomaly", triggerManualAnomalyController);

module.exports = router;