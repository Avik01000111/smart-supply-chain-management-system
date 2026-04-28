require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Firebase + Gemini Initialization
require("./config/firebase");
require("./config/gemini");

const app = express();

app.use(cors());
app.use(express.json());


// ================================
// ROUTE IMPORTS
// ================================
const shipmentRoutes = require("./routes/shipment_routes");
const aiRoutes = require("./routes/ai_routes");
const adminRoutes = require("./routes/admin_routes");
const analyticsRoutes = require("./routes/analytics_routes");


// ================================
// ROUTE MOUNTING
// ================================
app.use("/api/shipment", shipmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);


// ================================
// HEALTH ROUTE
// ================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running successfully"
  });
});


// ================================
// START CRON JOBS
// ================================
const { startLiveShipmentUpdateJob } = require("./services/jobs/liveShipmentUpdate_job");
const { startAnalyticsRefreshJob } = require("./services/jobs/analyticsRefresh_job");

startLiveShipmentUpdateJob();
startAnalyticsRefreshJob();


// ================================
// SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});