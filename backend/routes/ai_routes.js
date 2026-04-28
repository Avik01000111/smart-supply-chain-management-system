const express = require("express");
const router = express.Router();

const { askCopilotController } = require("../controllers/ai_controller");

router.post("/copilot-query", askCopilotController);

module.exports = router;