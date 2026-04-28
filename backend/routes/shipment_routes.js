const express = require("express");
const router = express.Router();

const {
  seedDemoShipmentsController,
  getAllShipmentsController,
  getShipmentByIdController,
  updateShipmentDataController,
  getShipmentRerouteController,
  approveRerouteController
} = require("../controllers/shipment_controller");

router.post("/seed-demo", seedDemoShipmentsController);
router.get("/all", getAllShipmentsController);
router.get("/:shipmentId", getShipmentByIdController);
router.patch("/:shipmentId/update", updateShipmentDataController);
router.get("/:shipmentId/reroute", getShipmentRerouteController);
router.post("/:shipmentId/approve-reroute", approveRerouteController);

module.exports = router;