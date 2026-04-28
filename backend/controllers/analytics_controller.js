
const db = require('../config/firebase')

const getAnalyticsController = async (req, res) => {
  try {
    const snapshot = await db.ref("analytics").once("value");
    const analytics = snapshot.val() || {};

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

module.exports = { getAnalyticsController };