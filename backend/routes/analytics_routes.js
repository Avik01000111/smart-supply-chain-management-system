const express = require("express");
const router = express.Router();

const { getAnalyticsController } = require("../controllers/analytics_controller");

router.get("/dashboard", getAnalyticsController);

module.exports = router;