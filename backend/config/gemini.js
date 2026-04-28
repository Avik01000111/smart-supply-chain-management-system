const axios = require("axios");

let nvidiaClient = null;

function initializeNvidiaAI() {
  try {
    if (nvidiaClient) {
      return nvidiaClient;
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY is missing in .env file");
    }

    nvidiaClient = axios.create({
      baseURL: "https://integrate.api.nvidia.com/v1",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      timeout: 30000
    });

    console.log("✅ NVIDIA AI Initialized Successfully");

    return nvidiaClient;

  } catch (error) {
    console.error("❌ NVIDIA AI Initialization Failed:", error.message);
    process.exit(1);
  }
}

module.exports = initializeNvidiaAI();

