import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.KAPSO_API_KEY;
const phoneId = process.env.KAPSO_SENDER_ID;
const to = "2348149347629"; 

async function sendTest() {
  const url = `https://api.kapso.ai/meta/whatsapp/v18.0/${phoneId}/messages`;
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: { body: "Hello from CartList debug! If you see this, Kapso sending is working." }
  };

  try {
    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey }
    });
    console.log("SEND SUCCESS:", response.data);
  } catch (error: any) {
    console.error("SEND ERROR:", error.response?.data || error.message);
  }
}

sendTest();
