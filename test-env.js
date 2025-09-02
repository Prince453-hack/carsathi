// Simple test to check if environment variables are accessible
const axios = require("axios");
const https = require("https");

async function testEnvVars() {
  try {
    console.log("Testing environment variables endpoint...");

    // Create a simple test endpoint that just returns env status
    const response = await axios.get("https://carsathi.in/api/test-env", {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000,
    });

    console.log("✅ Env test response:", response.data);
  } catch (error) {
    console.log("❌ Env test failed:", error.response?.status);
    console.log("This endpoint probably doesn't exist yet");
  }
}

testEnvVars();
