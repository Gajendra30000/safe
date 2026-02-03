import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

let twilioClient: any;

function getTwilioClient() {
    if (!twilioClient) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;

        if (!sid || !sid.startsWith("AC")) {
            console.warn("⚠️ Twilio Account SID is missing or invalid. SMS notifications will be disabled.");
            return null;
        }

        try {
            twilioClient = twilio(sid, token);
        } catch (error) {
            console.error("❌ Failed to initialize Twilio client:", error);
            return null;
        }
    }
    return twilioClient;
}

export async function sendSMSNotification(
    to: string,
    userName: string,
    googleMapsLink: string
) {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.warn("⏭️ Skipping SMS: Twilio client not initialized.");
            return;
        }

        await client.messages.create({
            body: `🚨 EMERGENCY: ${userName} needs help! View location: ${googleMapsLink}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`✅ SMS sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send SMS to ${to}:`, error);
    }
}
