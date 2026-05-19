import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import axios from "axios";
import { format } from "date-fns";

dotenv.config();

const app = express();
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

// Lazy initialize Resend to avoid crashing if API key is missing
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string, req: any) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.get("host");
  const verificationLink = `${protocol}://${host}/api/auth/verify-email?token=${verificationToken}`;

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not found. Verification email not sent.");
    console.log("Verification link:", verificationLink);
    return false;
  }

  try {
    await resend.emails.send({
      from: `Cartlist <${FROM_EMAIL}>`,
      to: email,
      subject: "Verify your Cartlist account",
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #FDF8F3; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
          </div>
          <div style="background-color: #FFFFFF; padding: 40px; border-radius: 32px; box-shadow: 0 4px 20px rgba(240, 126, 72, 0.05);">
            <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #1A1A1A;">Verify your email address</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #6B7280; margin-bottom: 32px;">
              Hello ${firstName}, welcome to Cartlist! We're excited to have you on board. Please verify your email address to start managing your stockpiles.
            </p>
            <div style="text-align: center;">
              <a href="${verificationLink}" style="background-color: #F07E48; color: #FFFFFF; padding: 16px 40px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(240, 126, 72, 0.2);">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: #9CA3AF; margin-top: 32px; text-align: center;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #9CA3AF; font-size: 12px;">
            &copy; 2026 Cartlist. All rights reserved.
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (email: string, firstName: string) => {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not found. Welcome email not sent.");
    return false;
  }

  try {
    await resend.emails.send({
      from: `Cartlist <${FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Cartlist! 🚀",
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #FDF8F3; padding: 40px; color: #1A1A1A;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
            </div>
            
            <div style="background-color: #FFFFFF; padding: 48px; border-radius: 32px; box-shadow: 0 10px 30px rgba(240, 126, 72, 0.08);">
              <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 24px; color: #1A1A1A; line-height: 1.2;">Welcome to the family, ${firstName}! 🎉</h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">
                We're thrilled to have you join Cartlist. You've just taken the first step towards professional stockpile management. No more lost orders, no more confusion—just pure organization.
              </p>
              
              <div style="background-color: #FFF7F2; border-radius: 24px; padding: 32px; margin-bottom: 32px; border: 1px solid #FFE4D6;">
                <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #F07E48;">Quick Start Guide:</h2>
                <ul style="padding-left: 0; list-style-type: none; margin: 0;">
                  <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">01.</span>
                    <span style="color: #4B5563;"><strong>Log your first purchase:</strong> Head to the "Log Purchase" section to start tracking a customer's stockpile.</span>
                  </li>
                  <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">02.</span>
                    <span style="color: #4B5563;"><strong>Set deadlines:</strong> Each stockpile has an end date. We'll notify you (and your customers) as the date approaches.</span>
                  </li>
                  <li style="margin-bottom: 0; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">03.</span>
                    <span style="color: #4B5563;"><strong>Manage with ease:</strong> Use your dashboard to see total earnings, active clients, and items closing soon.</span>
                  </li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://cartlist-production.up.railway.app//dashboard" style="background-color: #F07E48; color: #FFFFFF; padding: 18px 48px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(240, 126, 72, 0.25);">
                  Go to my Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; color: #9CA3AF; text-align: center;">
                Need help? Just reply to this email or reach out to our support team. We're here to help you grow your business!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <div style="margin-bottom: 16px;">
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">Instagram</a>
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">Twitter</a>
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">LinkedIn</a>
              </div>
              <p style="color: #9CA3AF; font-size: 12px;">
                &copy; 2026 Cartlist Stockpile Solutions. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

const sendWhatsAppText = async (to: string, text: string, context?: { stockpileId?: string, vendorId?: string }) => {
  const apiKey = process.env.KAPSO_API_KEY;
  const phoneId = process.env.KAPSO_SENDER_ID;

  if (!apiKey || !phoneId) {
    console.error("[WA] MISSING CREDENTIALS: KAPSO_API_KEY or KAPSO_SENDER_ID");
    return false;
  }

  let cleaned = to.replace(/\D/g, "");
  if (cleaned.startsWith("2340")) cleaned = "234" + cleaned.substring(4);
  else if (cleaned.startsWith("0")) cleaned = "234" + cleaned.substring(1);
  else if (cleaned.length === 10) cleaned = "234" + cleaned;
  else if (cleaned.length === 13 && cleaned.startsWith("234234")) cleaned = cleaned.substring(3);
  
  const finalTo = cleaned;
  const url = `https://api.kapso.ai/meta/whatsapp/v18.0/${phoneId}/messages`;
  
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: finalTo,
    type: "text",
    text: { body: text }
  };

  try {
    console.log(`[WA] Sending TEXT to ${finalTo}: "${text.substring(0, 50)}..."`);
    const response = await axios.post(url, data, {
      headers: { 
        "Content-Type": "application/json", 
        "X-API-Key": apiKey
      },
      timeout: 25000
    });
    
    console.log(`[WA] SUCCESS: ${response.status}`);
    // Log to DB
    await MessageLog.create({
      stockpileId: context?.stockpileId,
      vendorId: context?.vendorId,
      recipientPhone: finalTo,
      templateName: "TEXT_REPLY",
      messageId: response.data.messages?.[0]?.id,
      status: "sent"
    });
    
    return true;
  } catch (error: any) {
    const errResp = error.response?.data;
    console.error(`[WA] Text error to ${finalTo}:`, error.message, JSON.stringify(errResp || {}));
    return false;
  }
};

const sendWhatsAppNotification = async (to: string, templateName: string, params: string[], context?: { stockpileId?: string, vendorId?: string }) => {
  const apiKey = process.env.KAPSO_API_KEY;
  const phoneId = process.env.KAPSO_SENDER_ID;

  if (!apiKey || !phoneId) {
    console.warn("KAPSO_API_KEY or KAPSO_SENDER_ID not found. WhatsApp notification not sent.");
    return false;
  }

  // Robust Phone Formatting for Nigeria (234)
  let cleaned = to.replace(/\D/g, "");
  
  // Handle case where user puts 2340...
  if (cleaned.startsWith("2340")) {
    cleaned = "234" + cleaned.substring(4);
  } else if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  } else if (cleaned.length === 10) {
    cleaned = "234" + cleaned;
  } else if (cleaned.length === 13 && cleaned.startsWith("234234")) {
    cleaned = cleaned.substring(3); // Fix double prefix
  }
  
  const finalTo = cleaned;

  // Use v18.0 as it is standard for stable WhatsApp API endpoints
  const url = `https://api.kapso.ai/meta/whatsapp/v18.0/${phoneId}/messages`;
  
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: finalTo,
    type: "template",
    template: {
      name: templateName,
      language: {
        policy: "deterministic",
        code: "en_US" 
      },
      components: [
        {
          type: "body",
          parameters: params.map(p => ({ 
            type: "text", 
            text: String(p || "").substring(0, 1024)
          }))
        }
      ]
    }
  };

  try {
    console.log(`[WA] Sending ${templateName} to ${finalTo}. Params:`, JSON.stringify(params));
    let response;
    try {
      response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        timeout: 25000
      });
    } catch (error: any) {
      // Fallback: If en_US fails with 404, try base "en"
      if (error.response?.status === 404 && data.template.language.code === "en_US") {
        console.warn(`[WA] Template ${templateName} not found in en_US, retrying with en...`);
        data.template.language.code = "en";
        response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
          },
          timeout: 25000
        });
      } else {
        throw error;
      }
    }
    
    const fullResponse = response.data;
    console.log(`[WA] HTTP Status ${response.status} for ${templateName}:`, JSON.stringify(fullResponse, null, 2));
    
    if (fullResponse.error) {
       throw new Error(fullResponse.error.message || "Meta API internal error");
    }

    const messageId = fullResponse.messages?.[0]?.id;
    const messageStatus = fullResponse.messages?.[0]?.message_status || "accepted";
    
    console.log(`[WA] SUCCESS: ID=${messageId}, Status=${messageStatus}`);
    
    // Log to DB
    await MessageLog.create({
      stockpileId: context?.stockpileId,
      vendorId: context?.vendorId,
      recipientPhone: finalTo,
      templateName,
      messageId,
      status: "sent"
    });
    
    return true;
  } catch (error: any) {
    const errorData = error.response?.data;
    const errorMessage = JSON.stringify(errorData || error.message);
    console.error(`Kapso WhatsApp Template error (${templateName}):`, 
      error.response?.status, 
      errorMessage
    );
    
    // Log FAILED message to DB
    await MessageLog.create({
      stockpileId: context?.stockpileId,
      vendorId: context?.vendorId,
      recipientPhone: finalTo,
      templateName,
      status: "failed",
      error: errorMessage
    });

    return false;
  }
};

// Helper to send stockpile created WhatsApp notification
const sendStockpileCreatedNotification = async (vendor: any, stockpile: any) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    
    // Items summary
    const itemsSummary = stockpile.items.map((item: any) => `${item.name}(x${item.quantity})`).join(", ");
    const closingDate = format(new Date(stockpile.endDate), "d MMM yyyy");
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    // COMPULSORY WhatsApp: Template: stockpile_created
    // Params: {{1}}Customer, {{2}}Vendor, {{3}}Items, {{4}}Total, {{5}}Link
    const sent = await sendWhatsAppNotification(
      stockpile.customerPhone, 
      "stockpile_created", 
      [
        stockpile.customerName, 
        vendor.businessName, 
        itemsSummary, 
        stockpile.totalAmount.toLocaleString(), 
        publicUrl
      ],
      { stockpileId: stockpile._id, vendorId: vendor._id }
    );

    if (sent) {
      await Stockpile.findByIdAndUpdate(stockpile._id, { 
        lastWhatsAppTemplateSent: "stockpile_created" 
      });
    }

    // Always log in-app notification
    await Notification.create({
      userId: vendor._id,
      title: "New Stockpile Started",
      message: `A new stockpile has been created for ${stockpile.customerName}.`,
      type: "success",
      stockpileId: stockpile._id
    });

    // Email remains optional
    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: `Cartlist <${FROM_EMAIL}>`,
          to: stockpile.customerEmail,
          subject: `New Stockpile Created - ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p><strong>${vendor.businessName}</strong> has created a new stockpile list for you.</p>
              <p><strong>Total Amount:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><strong>Closing Date:</strong> ${closingDate}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 100px; font-weight: bold;">View Stockpile</a></p>
            </div>
          `
        });
      }
    }
    return sent;
  } catch (error) {
    console.error("Error sending creation notification:", error);
    return false;
  }
};

const sendStockpileReminderNotification = async (vendor: any, stockpile: any) => {
  try {
    const prefs = vendor.notifications?.reminders || { email: true, sms: true, push: true, inApp: true };
    const closingDate = format(new Date(stockpile.endDate), "d MMM yyyy");
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    // COMPULSORY WhatsApp: Template: stockpile_reminder
    // Params: {{1}}Customer, {{2}}Vendor, {{3}}Date, {{4}}Total, {{5}}Link
    // Note: If delivery fails after "accepted", ensure your Meta template has exactly 5 placeholders.
    const whatsappSent = await sendWhatsAppNotification(
      stockpile.customerPhone, 
      "stockpile_reminder", 
      [
        stockpile.customerName, 
        vendor.businessName, 
        closingDate, 
        stockpile.totalAmount.toLocaleString(), 
        publicUrl
      ],
      { stockpileId: stockpile._id.toString(), vendorId: vendor._id.toString() }
    );

    // Email remains optional
    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: `Cartlist <${FROM_EMAIL}>`,
          to: stockpile.customerEmail,
          subject: `Reminder: Your Stockpile with ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p>This is a friendly reminder from <strong>${vendor.businessName}</strong>.</p>
              <p>Your stockpile list is closing on <strong>${closingDate}</strong>.</p>
              <p><strong>Current Total:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Your List</a></p>
              <p>Don't forget to finalize your orders before the closing date!</p>
            </div>
          `
        });
      }
    }
    return whatsappSent;
  } catch (error) {
    console.error("Error sending reminder notification:", error);
    return false;
  }
};

const sendStockpileUpdateNotification = async (vendor: any, stockpile: any, itemsAdded: any[]) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    const itemsSummary = itemsAdded.map((item: any) => `${item.name}(x${item.quantity})`).join(", ");
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    // COMPULSORY WhatsApp: Template: stockpile_updated
    // Params: {{1}}Customer, {{2}}Vendor, {{3}}ItemsAdded, {{4}}Total, {{5}}Link
    const sent = await sendWhatsAppNotification(
      stockpile.customerPhone, 
      "stockpile_updated", 
      [
        stockpile.customerName, 
        vendor.businessName, 
        itemsSummary, 
        stockpile.totalAmount.toLocaleString(), 
        publicUrl
      ]
    );

    if (sent) {
      await Stockpile.findByIdAndUpdate(stockpile._id, { 
        lastWhatsAppTemplateSent: "stockpile_updated" 
      });
    }

    await Notification.create({
      userId: vendor._id,
      title: "Stockpile Updated",
      message: `You've added items to ${stockpile.customerName}'s stockpile.`,
      type: "info",
      stockpileId: stockpile._id
    });

    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: `Cartlist <${FROM_EMAIL}>`,
          to: stockpile.customerEmail,
          subject: `Stockpile Update from ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p><strong>${vendor.businessName}</strong> has updated your stockpile list.</p>
              <p><strong>Current Total:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Full List</a></p>
            </div>
          `
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error sending update notification:", error);
    return false;
  }
};

const sendStockpileExtensionNotification = async (vendor: any, stockpile: any) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    const closingDate = format(new Date(stockpile.endDate), "d MMM yyyy");
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    // COMPULSORY WhatsApp: Template: stockpile_extended
    // Params: {{1}}Customer, {{2}}Vendor, {{3}}Items, {{4}}NewDate, {{5}}Link
    const itemsSummary = stockpile.items.map((item: any) => `${item.name}(x${item.quantity})`).join(", ");
    const sent = await sendWhatsAppNotification(
      stockpile.customerPhone, 
      "stockpile_extended", 
      [stockpile.customerName, vendor.businessName, itemsSummary, closingDate, publicUrl]
    );

    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: `Cartlist <${FROM_EMAIL}>`,
          to: stockpile.customerEmail,
          subject: `${vendor.businessName} has extended your stockpile deadline`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p><strong>${vendor.businessName}</strong> has updated the closing date for your stockpile to <strong>${closingDate}</strong>.</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Updated Status</a></p>
            </div>
          `
        });
      }
    }
    return sent;
  } catch (error) {
    console.error("Error sending extension notification:", error);
    return false;
  }
};

const sendStockpileClosedNotification = async (vendor: any, stockpile: any) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    // COMPULSORY WhatsApp: Template: stockpile_closed
    // Params: {{1}}Customer, {{2}}Vendor, {{3}}Items, {{4}}Total, {{5}}Link
    const itemsSummary = stockpile.items.map((item: any) => `${item.name}(x${item.quantity})`).join(", ");
    const sent = await sendWhatsAppNotification(
      stockpile.customerPhone, 
      "stockpile_closed", 
      [stockpile.customerName, vendor.businessName, itemsSummary, stockpile.totalAmount.toLocaleString(), publicUrl],
      { stockpileId: stockpile._id, vendorId: vendor._id }
    );

    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: `Cartlist <${FROM_EMAIL}>`,
          to: stockpile.customerEmail,
          subject: `Stockpile Closed - ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p>Great news! Your stockpile at <strong>${vendor.businessName}</strong> has been marked as <strong>completed</strong>.</p>
              <p><strong>Total Amount:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Final Details</a></p>
            </div>
          `
        });
      }
    }

    await Notification.create({
      userId: vendor._id,
      title: "Stockpile Closed",
      message: `You've closed ${stockpile.customerName}'s stockpile.`,
      type: "success",
      stockpileId: stockpile._id
    });
    return sent;
  } catch (error) {
    console.error("Error sending closure notification:", error);
    return false;
  }
};

// Trust proxy is required for secure cookies behind a proxy (Cloud Run/AI Studio)
app.set("trust proxy", 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.set("trust proxy", 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// --- DEBUG ENDPOINT (REMOVABLE) ---
app.get("/api/debug/vendors", async (req, res) => {
  const vendors = await User.find({ role: "vendor" }).select("email whatsappNumber businessName").limit(50);
  res.json(vendors);
});

// WhatsApp Webhook for delivery callbacks
app.post("/api/webhooks/whatsapp", async (req, res) => {
  try {
    // Log full webhook payload for debugging
    await WebhookLog.create({ payload: req.body, headers: req.headers });
    console.log("WHATSAPP WEBHOOK RECEIVED:", JSON.stringify(req.body, null, 2));

  // Support both Meta nested structure and potential flatted structure from aggregators
  let value = req.body.entry?.[0]?.changes?.[0]?.value;
  
  // Kapso specific structure handling
  if (!value && req.body.message) {
    value = {
      messages: [req.body.message],
      metadata: { phone_number_id: req.body.phone_number_id || req.body.conversation?.phone_number_id }
    };
  }

  if (!value && (req.body.messaging_product === "whatsapp" || req.body.messages || req.body.statuses)) {
    value = req.body;
  }

  if (!value) {
    console.log("[Webhook] Invalid payload structure or not a WhatsApp event");
    return res.status(200).send("NOT_A_WHATSAPP_EVENT");
  }
  
  // Handle Message Status updates
  if (value?.statuses) {
    console.log("[Webhook] Processing statuses:", value.statuses.length);
    for (const status of value.statuses) {
      const recipient = status.recipient_id;
      const msgStatus = status.status; // delivered, read, sent, failed
      const msgId = status.id;
      
      console.log(`>>> MESSAGE STATUS UPDATE: ID ${msgId} for ${recipient} is now [${msgStatus.toUpperCase()}]`);
      
      // Update the log in our database
      await MessageLog.findOneAndUpdate(
        { messageId: msgId },
        { status: msgStatus as any },
        { upsert: false }
      ).catch(err => console.error("[Webhook] Error updating log status:", err));

      if (status.errors) {
        console.error(`!!! WEBHOOK DELIVERY ERROR for ${msgId} (${recipient}):`, JSON.stringify(status.errors));
      }
    }
  }

  // Handle Incoming Messages (This identifies customer/vendor interaction)
  if (value?.messages) {
    for (const message of value.messages) {
      const from = message.from; // Sender's phone number
      const originalText = message.text?.body || message.button?.text || "";
      const text = originalText.toLowerCase().trim();
      console.log(`>>> INCOMING WHATSAPP MESSAGE from ${from}: "${originalText}"`);

      // Master Ping Test (Always works if webhook is connected)
      if (text === "ping") {
        await sendWhatsAppText(from, "🏓 PONG! Your CartList bot connection is active. Type 'menu' to start.");
        continue;
      }

      if (text === "reset" || text === "restart") {
        console.log("[Webhook] RESET COMMAND RECEIVED - clearing session");
        await BotSession.deleteOne({ phoneNumber: from });
        await sendWhatsAppText(from, "🔄 Session reset. You can now start fresh. Type 'hi' to see the menu.");
        continue;
      }

      try {
        const cleanPhone = from.replace(/\D/g, "");
        const shortPhone = cleanPhone.slice(-10);

        // 0. Check if sender is a registered user/vendor
        console.log(`[Webhook] Searching for user with phone suffix: ${shortPhone} or full: ${cleanPhone}`);
        let vendor = await User.findOne({
          $or: [
            { whatsappNumber: { $regex: shortPhone + "$" } },
            { whatsappNumber: cleanPhone },
            { whatsappNumber: "0" + shortPhone },
            { whatsappNumber: "234" + shortPhone },
            { whatsappNumber: "0" + cleanPhone }
          ]
        });

        if (vendor) {
          console.log(`[Webhook] VENDOR DETECTED: ${vendor.businessName || vendor.firstName} (${from})`);
          await handleVendorBot(from, text, vendor);
          continue; 
        }

        // If not a vendor, check if we have a registration session in progress
        const cleanFrom = from.replace(/\D/g, "");
        const regSession = await BotSession.findOne({ phoneNumber: cleanFrom, vendorId: null });
        if (regSession) {
          console.log(`[Webhook] UNKNOWN USER BOT SESSION DETECTED: ${from}`);
          await handleUnknownUserBot(from, text, regSession);
          continue;
        }

        // Potential registration trigger for unknown numbers
        const starts = ["hi", "hello", "hey", "start", "menu", "home", "0", "reset", "create", "account"];
        const lowerText = text.toLowerCase().trim();
        if (starts.some(s => lowerText.includes(s))) {
          console.log(`[Webhook] UNKNOWN USER STARTING BOT: ${from}`);
          await handleUnknownUserBot(from, text, null);
          continue;
        }

        // 0c. Regular Customer Check
        // Handle phone matching by looking at the last 10 digits
        console.log(`[Webhook] CUSTOMER DETECTED or unrecognized phone: ${from}`);
        
        console.log(`[Webhook] Phone Suffix: ${shortPhone} (extracted from ${from})`);
        
        // Update all customer records with this phone suffix
        const updateResult = await Customer.updateMany(
          { phone: { $regex: shortPhone + "$" } }, 
          { hasInteractedWithWhatsApp: true }
        );
        console.log(`[Webhook] Updated ${updateResult.modifiedCount} customers with interaction status.`);

        // 2. Find their most recent active stockpile
        // Extract ID from message if present (e.g. "ID: 6d5e...")
        const idMatch = text.match(/id:\s*([a-f0-9]{24})/i);
        const explicitlyProvidedId = idMatch ? idMatch[1] : null;

        let stockpile;
        if (explicitlyProvidedId && mongoose.Types.ObjectId.isValid(explicitlyProvidedId)) {
          console.log(`[Webhook] Message contains explicit ID: ${explicitlyProvidedId}. Fetching.`);
          // When an ID is provided, we can be more lenient with status (customer might be viewing an old one)
          // but usually they care about active or recently completed ones.
          stockpile = await Stockpile.findOne({ 
            _id: explicitlyProvidedId,
            isDeleted: { $ne: true }
          });
        }
        
        // Fallback to phone number if no ID found or specific find failed
        if (!stockpile) {
          console.log(`[Webhook] No valid explicit ID found or find failed. Searching by phone suffix: ${shortPhone}`);
          stockpile = await Stockpile.findOne({ 
            customerPhone: { $regex: shortPhone + "$" }, 
            status: "active",
            isDeleted: { $ne: true }
          }).sort({ createdAt: -1 }); 
        }

        if (stockpile) {
          console.log(`[Webhook] Proceeding with customer stockpile: ${stockpile._id} (Status: ${stockpile.status})`);
          const stockpileVendor = await User.findById(stockpile.vendorId);
          
          if (stockpileVendor) {
            console.log(`[Webhook] Matching vendor found: ${stockpileVendor.businessName}`);
            
            // Generate link
            const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
            const publicUrl = `${baseUrl}/view/${stockpile._id}`;
            const businessName = stockpileVendor.businessName || "your vendor";

            // 1. Send immediate TEXT reply (since we're in the 24h window)
            const replyText = `Hi ${stockpile.customerName}! Here is the link to view your stockpile from ${businessName}: ${publicUrl}`;
            await sendWhatsAppText(from, replyText, { stockpileId: stockpile._id.toString(), vendorId: stockpileVendor._id.toString() });

            // 2. Trigger the appropriate TEMPLATE notification (even if sent before)
            // This ensures templates are working and reinforces the communication.
            if (stockpile.status === "active") {
              await sendStockpileCreatedNotification(stockpileVendor, stockpile).catch(() => false);
            } else if (stockpile.status === "closed") {
              await sendStockpileClosedNotification(stockpileVendor, stockpile).catch(() => false);
            }
          } else {
            console.error(`[Webhook] ERROR: Vendor ${stockpile.vendorId} not found for stockpile ${stockpile._id}`);
          }
        } else {
          // Fallback: If no stockpile found, but they said "view", "stockpile", "hi" or "hello"
          const fallbacks = ["view", "stockpile", "hi", "hello", "hey", "help"];
          if (fallbacks.some(keyword => text.includes(keyword))) {
            await sendWhatsAppText(from, "Hi there! Welcome to Cartlist. We couldn't find an active stockpile linked to this number. If you are a vendor, please ensure your WhatsApp number is correct in your settings!")
              .catch(err => console.error("Fallback text failed:", err));
          }
          console.log(`[Webhook] No suitable stockpile found for phone suffix ending in ${shortPhone}`);
        }
      } catch (err) {
        console.error("[Webhook] CRITICAL ERROR processing incoming message:", err);
      }
    }
  }

  } catch (err: any) {
    console.error("[Webhook] GLOBAL ERROR in WhatsApp route:", err);
    return res.status(200).send("ERROR_BUT_ACKNOWLEDGED"); // Always 200 to Meta
  }
});

// Webhook verification (GET challenge)
app.get("/api/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("WEBHOOK VERIFICATION (GET):", JSON.stringify(req.query, null, 2));

  if (challenge) {
    console.log("WEBHOOK VERIFICATION SUCCESSFUL (CHALLENGE RETURNED)");
    res.set("Content-Type", "text/plain");
    return res.status(200).send(challenge);
  }
  
  res.sendStatus(403);
});

// --- VENDOR BOT LOGIC (v1.5) ---

const handleUnknownUserBot = async (from: string, text: string, existingSession: any) => {
  const cleanPhone = from.replace(/\D/g, "");
  let session = existingSession;

  if (!session) {
    session = await BotSession.create({
      phoneNumber: cleanPhone,
      vendorId: null,
      state: "WELCOME_UNKNOWN",
      lastActive: new Date()
    });
    
    return sendWhatsAppText(from, "Welcome to CartList! 👋 I help vendors manage their stockpile customers automatically.\n\nWould you like to:\n1️⃣ Create a new account\n2️⃣ I already have an account - link this number");
  }

  // Update activity
  session.lastActive = new Date();
  const input = text.trim();

  // Reset/Menu command
  if (input === "0" || input.toLowerCase() === "menu") {
    session.state = "WELCOME_UNKNOWN";
    session.data = {};
    await session.save();
    return sendWhatsAppText(from, "Welcome to CartList! 👋 I help vendors manage their stockpile customers automatically.\n\nWould you like to:\n1️⃣ Create a new account\n2️⃣ I already have an account - link this number");
  }

  // State Machine for Unregistered Users
  switch (session.state) {
    case "WELCOME_UNKNOWN":
      if (input === "1") {
        session.state = "REG_BUSINESS_NAME";
        await session.save();
        await sendWhatsAppText(from, "Let's create your account. I'll ask a few quick questions.\n\nWhat is your business name?");
      } else if (input === "2") {
        await sendWhatsAppText(from, "Hi! To link this number, please log in to your account at CartList.com and update your WhatsApp number in Settings. Once done, type 'menu' here.");
      } else {
        await sendWhatsAppText(from, "I didn't get that. Please reply with 1 or 2.");
      }
      break;

    case "REG_BUSINESS_NAME":
      if (input.length < 2) return sendWhatsAppText(from, "Business name is too short. Please enter your business name:");
      session.data.businessName = input;
      session.state = "REG_OWNER_NAME";
      await session.save();
      await sendWhatsAppText(from, "Got it! What is your full name (business owner)?");
      break;

    case "REG_OWNER_NAME":
      if (input.split(" ").length < 2) return sendWhatsAppText(from, "Please enter your full name (First and Last name):");
      session.data.ownerName = input;
      session.state = "REG_EMAIL";
      await session.save();
      await sendWhatsAppText(from, "What is your email address?");
      break;

    case "REG_EMAIL":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) return sendWhatsAppText(from, "Invalid email format. Please enter a valid email address:");
      
      // Check if email exists
      const existing = await User.findOne({ email: input.toLowerCase() });
      if (existing) {
        return sendWhatsAppText(from, "This email is already registered. Please go to CartList.com to log in or use a different email:");
      }
      
      session.data.email = input.toLowerCase();
      session.state = "REG_PASSWORD";
      await session.save();
      await sendWhatsAppText(from, "Create a password for your account (min. 8 characters, include a number):");
      break;

    case "REG_PASSWORD":
      if (input.length < 8 || !/\d/.test(input)) {
        return sendWhatsAppText(from, "Password must be at least 8 characters and include at least one number:");
      }
      
      try {
        const hashedPassword = await bcrypt.hash(input, 12);
        const names = session.data.ownerName.split(" ");
        const firstName = names[0];
        const lastName = names.slice(1).join(" ");

        const newUser = await User.create({
          email: session.data.email,
          password: hashedPassword,
          firstName,
          lastName,
          businessName: session.data.businessName,
          ownerName: session.data.ownerName,
          whatsappNumber: cleanPhone,
          role: "vendor",
          isEmailVerified: true // Auto-verify since they have the phone? Or keep false? 
          // For now let's set to true to avoid friction as requested in some contexts, 
          // but usually we'd send an email.
        });

        await session.deleteOne(); // Cleanup session

        await sendWhatsAppText(from, `✅ Account created!\n\nWelcome to CartList, ${session.data.businessName}! 🎉\n\nYour web dashboard: CartList.com/dashboard\n\nWhat would you like to do first?\n1️⃣ Log a Purchase\n2️⃣ View main menu`);
        
        // Create a new session for the now-registered vendor
        await BotSession.create({
          phoneNumber: cleanPhone,
          vendorId: newUser._id,
          state: "POST_REG_CHOICE",
          lastActive: new Date()
        });
      } catch (err) {
        console.error("Bot Registration Error:", err);
        await sendWhatsAppText(from, "❌ Sorry, there was an error creating your account. Please try again on CartList.com.");
        await session.deleteOne();
      }
      break;

    default:
      session.state = "WELCOME_UNKNOWN";
      await session.save();
      await sendWhatsAppText(from, "I had trouble understanding that. Let's start over.\n\nWould you like to:\n1️⃣ Create a new account\n2️⃣ I already have an account - link this number");
  }
};

const handleVendorBot = async (from: string, text: string, vendor: any) => {
  const cleanPhone = from.replace(/\D/g, "");
  let session = await BotSession.findOne({ phoneNumber: cleanPhone });

  if (!session) {
    session = await BotSession.create({
      phoneNumber: cleanPhone,
      vendorId: vendor._id,
      state: "MAIN_MENU",
      lastActive: new Date()
    });
  } else {
    // Session timeout logic
    const now = new Date();
    const diff = (now.getTime() - new Date(session.lastActive).getTime()) / (1000 * 60);
    if (diff > 30) {
      session.state = "MAIN_MENU";
      session.data = {};
      session.failCount = 0;
    }
    session.lastActive = now;
    await session.save();
  }

  const input = text.trim();
  const lowerInput = input.toLowerCase();

  // Master reset/menu command
  if (["0", "menu", "hi", "hello", "reset", "home"].includes(lowerInput)) {
    session.state = "MAIN_MENU";
    session.data = {};
    session.failCount = 0;
    await session.save();
    return sendMainMenu(from, vendor);
  }

  // Handle Input based on current state
  try {
    let handled: boolean = false;
    switch (session.state) {
      case "MAIN_MENU": handled = await handleMainMenuInput(from, input, session, vendor); break;
      case "LOG_PURCHASE_NAME": handled = await handleLogPurchaseName(from, input, session, vendor); break;
      case "LOG_PURCHASE_PHONE": handled = await handleLogPurchasePhone(from, input, session, vendor); break;
      case "LOG_PURCHASE_EMAIL": handled = await handleLogPurchaseEmail(from, input, session, vendor); break;
      case "LOG_PURCHASE_CLOSE_DATE": handled = await handleLogPurchaseCloseDate(from, input, session, vendor); break;
      case "LOG_PURCHASE_DELIVERY_PAID": handled = await handleLogPurchaseDeliveryPaid(from, input, session, vendor); break;
      case "LOG_PURCHASE_ITEM_NAME": handled = await handleLogPurchaseItemName(from, input, session, vendor); break;
      case "LOG_PURCHASE_ITEM_PRICE": handled = await handleLogPurchaseItemPrice(from, input, session, vendor); break;
      case "LOG_PURCHASE_ITEM_QUANTITY": handled = await handleLogPurchaseItemQuantity(from, input, session, vendor); break;
      case "LOG_PURCHASE_ADD_ANOTHER": handled = await handleLogPurchaseAddAnother(from, input, session, vendor); break;
      case "LOG_PURCHASE_CONFIRM": handled = await handleLogPurchaseConfirm(from, input, session, vendor); break;
      case "VIEW_STOCKPILE_LIST": handled = await handleViewStockpileList(from, input, session, vendor); break;
      case "STOCKPILE_DETAIL": handled = await handleStockpileDetailAction(from, input, session, vendor); break;
      case "VIEW_CUSTOMERS": handled = await handleViewCustomers(from, input, session, vendor); break;
      case "CUSTOMER_DETAIL": handled = await handleCustomerDetailAction(from, input, session, vendor); break;
      case "SEND_REMINDER_SELECT": handled = await handleSendReminderSelect(from, input, session, vendor); break;
      case "REMINDER_CONFIRM": handled = await handleReminderConfirm(from, input, session, vendor); break;
      case "ACCOUNT_SETTINGS": handled = await handleAccountSettingsInput(from, input, session, vendor); break;
      case "UPDATE_BIZ_NAME": handled = await handleUpdateBizName(from, input, session, vendor); break;
      case "UPDATE_EMAIL": handled = await handleUpdateEmail(from, input, session, vendor); break;
      case "POST_REG_CHOICE": handled = await handlePostRegChoice(from, input, session, vendor); break;
      default:
        session.state = "MAIN_MENU";
        await session.save();
        await sendMainMenu(from, vendor);
        handled = true;
    }

    if (!handled) {
      session.failCount = (session.failCount || 0) + 1;
      if (session.failCount >= 3) {
        session.state = "MAIN_MENU";
        session.data = {};
        session.failCount = 0;
        await session.save();
        await sendWhatsAppText(from, "I had trouble understanding your replies. Starting over - here's the main menu.");
        return sendMainMenu(from, vendor);
      }
      await session.save();
    } else {
      session.failCount = 0;
      await session.save();
    }
  } catch (err) {
    console.error("Bot Logic Error:", err);
    await sendWhatsAppText(from, "❌ Something went wrong. Let's return to the main menu.");
    session.state = "MAIN_MENU";
    await session.save();
    return sendMainMenu(from, vendor);
  }
};

const handlePostRegChoice = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text === "1") {
    session.state = "LOG_PURCHASE_NAME";
    await sendWhatsAppText(from, "📦 Log a Purchase\n\nWhat is the customer's full name?");
    return true;
  } else if (text === "2") {
    session.state = "MAIN_MENU";
    await sendMainMenu(from, vendor);
    return true;
  }
  return false;
};

// --- LOGGING HELPERS ---
const sendMainMenu = async (from: string, vendor: any) => {
  const menu = `Welcome back, ${vendor.businessName || vendor.firstName}! 👋 What would you like to do?

1️⃣ Log a Purchase
2️⃣ View Stockpile List
3️⃣ View Customers
4️⃣ Send a Reminder
5️⃣ Dashboard Summary
6️⃣ Account Settings

Reply with a number to continue.`;
  await sendWhatsAppText(from, menu);
};

const handleMainMenuInput = async (from: string, text: string, session: any, vendor: any) => {
  switch (text.trim()) {
    case "1":
      session.state = "LOG_PURCHASE_NAME";
      await sendWhatsAppText(from, "📦 Log a Purchase\n\nWhat is the customer's full name?");
      return true;
    case "2":
      session.state = "VIEW_STOCKPILE_LIST";
      return listStockpiles(from, vendor, 1);
    case "3":
      session.state = "VIEW_CUSTOMERS";
      return listCustomers(from, vendor, 1);
    case "4":
      session.state = "SEND_REMINDER_SELECT";
      return showReminderMenu(from, vendor);
    case "5":
      await sendDashboardSummary(from, vendor);
      return true;
    case "6":
      session.state = "ACCOUNT_SETTINGS";
      await sendAccountSettings(from, vendor);
      return true;
    default:
      await sendWhatsAppText(from, "I didn't get that. Please reply with a number: 1 = Log a Purchase, 2 = Stockpile List, etc.");
      return false;
  }
};

// --- LOG PURCHASE FLOW (4.4) ---
const handleLogPurchaseName = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  if (text.length < 2) {
    await sendWhatsAppText(from, "Please enter a valid name:");
    return false;
  }
  session.data = { customerName: text };
  session.state = "LOG_PURCHASE_PHONE";
  await sendWhatsAppText(from, `What is ${text}'s WhatsApp number? (e.g. 08012345678)`);
  return true;
};

const handleLogPurchasePhone = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  const clean = text.replace(/\D/g, "");
  if (clean.length < 10) {
    await sendWhatsAppText(from, "Please enter a valid phone number (e.g. 08012345678):");
    return false;
  }
  session.data.customerPhone = clean;
  session.state = "LOG_PURCHASE_EMAIL";
  await sendWhatsAppText(from, `What is ${session.data.customerName}'s email address? (type 'skip' to skip)`);
  return true;
};

const handleLogPurchaseEmail = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  const email = text.toLowerCase().trim();
  if (email !== "skip" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await sendWhatsAppText(from, "Invalid email. Please enter a valid email or type 'skip':");
    return false;
  }
  session.data.customerEmail = email === "skip" ? null : email;
  session.state = "LOG_PURCHASE_CLOSE_DATE";
  await sendWhatsAppText(from, `When does ${session.data.customerName}'s stockpile close? (e.g. 28/06/2025)`);
  return true;
};

const handleLogPurchaseCloseDate = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  const dateParts = text.split("/");
  let date: Date;

  if (dateParts.length === 3) {
    // dd/mm/yyyy
    date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
  } else {
    date = new Date(text);
  }

  if (isNaN(date.getTime()) || date < new Date()) {
    await sendWhatsAppText(from, "Invalid or past date. Please use dd/mm/yyyy (e.g. 28/06/2025):");
    return false;
  }

  session.data.endDate = date.toISOString();
  session.state = "LOG_PURCHASE_DELIVERY_PAID";
  await sendWhatsAppText(from, "Has the delivery fee been paid?\n\n1️⃣ Yes - paid ✅\n2️⃣ No - not yet ❌");
  return true;
};

const handleLogPurchaseDeliveryPaid = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  if (text === "1") {
    session.data.deliveryPaid = true;
  } else if (text === "2") {
    session.data.deliveryPaid = false;
  } else {
    await sendWhatsAppText(from, "Please reply 1 for Yes or 2 for No:");
    return false;
  }

  session.data.items = [];
  session.state = "LOG_PURCHASE_ITEM_NAME";
  await sendWhatsAppText(from, "Now let's add the items. 🛒\n\nItem 1 - What is the item name?");
  return true;
};

const handleLogPurchaseItemName = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  if (text.length < 1) return false;
  session.data.currentItem = { name: text };
  session.state = "LOG_PURCHASE_ITEM_PRICE";
  await sendWhatsAppText(from, `Price per unit for ${text}? (in NGN)`);
  return true;
};

const handleLogPurchaseItemPrice = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  const price = parseFloat(text.replace(/,/g, ""));
  if (isNaN(price)) {
    await sendWhatsAppText(from, "Please enter a valid price (numbers only):");
    return false;
  }
  session.data.currentItem.price = price;
  session.state = "LOG_PURCHASE_ITEM_QUANTITY";
  await sendWhatsAppText(from, "Quantity?");
  return true;
};

const handleLogPurchaseItemQuantity = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  const qty = parseInt(text);
  if (isNaN(qty) || qty < 1) {
    await sendWhatsAppText(from, "Please enter a valid quantity:");
    return false;
  }
  
  const item = { ...session.data.currentItem, quantity: qty };
  session.data.items.push(item);
  delete session.data.currentItem;
  
  session.state = "LOG_PURCHASE_ADD_ANOTHER";
  const total = item.price * item.quantity;
  await sendWhatsAppText(from, `✅ Added: ${item.name} x${qty} = ₦${total.toLocaleString()}\n\nAdd another item?\n1️⃣ Yes - add another\n2️⃣ No - I'm done`);
  return true;
};

const handleLogPurchaseAddAnother = async (from: string, text: string, session: any, _vendor: any): Promise<boolean> => {
  if (text === "1") {
    session.state = "LOG_PURCHASE_ITEM_NAME";
    await sendWhatsAppText(from, `Item ${session.data.items.length + 1} - What is the item name?`);
    return true;
  } else if (text === "2") {
    session.state = "LOG_PURCHASE_CONFIRM";
    const total = session.data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    let summary = `📋 Purchase Summary:\n`;
    summary += `Customer: ${session.data.customerName}\n`;
    summary += `Phone: ${session.data.customerPhone}\n`;
    summary += `Delivery: ${session.data.deliveryPaid ? "Paid ✅" : "Not Paid ❌"}\n`;
    summary += `Stockpile closes: ${format(new Date(session.data.endDate), "d MMMM yyyy")}\n`;
    summary += `Items:\n`;
    session.data.items.forEach((item: any) => {
      summary += `• ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}\n`;
    });
    summary += `\nGrand Total: ₦${total.toLocaleString()}\n\nConfirm and log?\n1️⃣ Yes - confirm ✅\n2️⃣ Edit - start over\n3️⃣ Cancel`;
    
    await sendWhatsAppText(from, summary);
    return true;
  }
  return false;
};

const handleLogPurchaseConfirm = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text === "1") {
    // SAVE TO DB
    const totalAmount = session.data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // 1. Update/Create Stockpile
    let stockpile = await Stockpile.findOne({
      vendorId: vendor._id,
      customerPhone: { $regex: session.data.customerPhone + "$" },
      status: "active",
      isDeleted: { $ne: true }
    });

    if (stockpile) {
      stockpile.items.push(...session.data.items);
      stockpile.totalAmount += totalAmount;
      await stockpile.save();
      await sendStockpileUpdateNotification(vendor, stockpile, session.data.items);
    } else {
      stockpile = await Stockpile.create({
        vendorId: vendor._id,
        customerName: session.data.customerName,
        customerPhone: session.data.customerPhone,
        customerEmail: session.data.customerEmail,
        endDate: new Date(session.data.endDate),
        items: session.data.items,
        totalAmount: totalAmount,
        deliveryStatus: session.data.deliveryPaid ? "paid" : "pending"
      });
      await sendStockpileCreatedNotification(vendor, stockpile);
    }

    // 2. Update CRM
    await Customer.findOneAndUpdate(
      { vendorId: vendor._id, phone: session.data.customerPhone },
      { 
        name: session.data.customerName, 
        email: session.data.customerEmail || undefined 
      },
      { upsert: true }
    );

    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const publicUrl = `${baseUrl}/view/${stockpile._id}`;

    await sendWhatsAppText(from, `✅ Logged! ${session.data.customerName}'s total is now ₦${stockpile.totalAmount.toLocaleString()}.\n\n` +
      `${session.data.customerName} has been notified on WhatsApp. ✉️\n\n` +
      `Her view link:\n${publicUrl}\n\nShare this link with her anytime.\n\n` +
      `What next?\n1️⃣ Log another purchase\n0️⃣ Main menu`);
    
    session.state = "MAIN_MENU"; // Wait, spec says 1/0 choice. Let's stay in a limbo or special state? 
    // Spec says "What next? 1=Log another, 0=Main menu".
    // I'll set state to MAIN_MENU but handle the 1/0 in handleMainMenuInput if I want, or just stay in IDLE.
    // For simplicity, stay in MAIN_MENU and handle 1/0.
    return true;
  } else if (text === "2") {
    session.state = "LOG_PURCHASE_NAME";
    await sendWhatsAppText(from, "Okay, let's start over. What is the customer's full name?");
    return true;
  } else if (text === "3") {
    session.state = "MAIN_MENU";
    await sendWhatsAppText(from, "Cancelled.");
    await sendMainMenu(from, vendor);
    return true;
  }
  return false;
};

// --- VIEW STOCKPILE LIST FLOW (4.5) ---
const listStockpiles = async (from: string, vendor: any, page: number): Promise<boolean> => {
  const pageSize = 10;
  const stockpiles = await Stockpile.find({ 
    vendorId: vendor._id, 
    status: "active",
    isDeleted: { $ne: true } 
  }).sort({ endDate: 1 }).skip((page - 1) * pageSize).limit(pageSize);

  if (stockpiles.length === 0 && page === 1) {
    await sendWhatsAppText(from, "You have no active stockpiles at the moment.");
    await sendMainMenu(from, vendor);
    return true;
  }

  let text = `📋 Active Stockpiles (Page ${page}):\n\n`;
  stockpiles.forEach((s, i) => {
    const idx = (page - 1) * pageSize + i + 1;
    text += `${idx}. ${s.customerName}\n   💰 ₦${s.totalAmount.toLocaleString()}\n   ⏳ Closes: ${format(new Date(s.endDate), "d MMM")}\n\n`;
  });
  
  if (stockpiles.length === pageSize) {
    text += "Reply with 'next' for more.\n";
  }
  text += "\nReply with a number to view details, or '0' for Menu.";
  
  const cleanPhone = from.replace(/\D/g, "");
  const session = await BotSession.findOne({ phoneNumber: cleanPhone });
  if (session) {
    session.data.stockpiles = stockpiles.map(s => s._id.toString());
    session.data.currentPage = page;
    await session.save();
  }

  await sendWhatsAppText(from, text);
  return true;
};

const handleViewStockpileList = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text.toLowerCase() === "next") {
    return listStockpiles(from, vendor, (session.data.currentPage || 1) + 1);
  }
  
  const idx = parseInt(text) - 1;
  const stockpiles = session.data.stockpiles || [];
  if (isNaN(idx) || idx < 0 || idx >= stockpiles.length) return false;

  const stockpileId = stockpiles[idx];
  const s = await Stockpile.findById(stockpileId);
  if (!s) return false;

  const daysLeft = Math.ceil((new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
  const publicUrl = `${baseUrl}/view/${s._id}`;

  let detail = `👤 Customer: ${s.customerName}\n📞 Phone: ${s.customerPhone}\n\nItems:\n`;
  s.items.forEach(item => {
    detail += `• ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}\n`;
  });
  detail += `\n💰 Grand Total: ₦${s.totalAmount.toLocaleString()}\n`;
  detail += `🚚 Delivery: ${s.deliveryStatus === "paid" ? "Paid ✅" : "Unpaid ❌"}\n`;
  detail += `⏳ Days Remaining: ${daysLeft}\n`;
  detail += `🔗 View Link: ${publicUrl}\n\n`;
  detail += `Options:\n1️⃣ Add item to this list\n2️⃣ Send reminder\n3️⃣ Copy view link\n4️⃣ Mark delivery as paid\n0️⃣ Back to list`;

  session.state = "STOCKPILE_DETAIL";
  session.data.activeStockpileId = s._id.toString();
  await session.save();
  await sendWhatsAppText(from, detail);
  return true;
};

const handleStockpileDetailAction = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  const sId = session.data.activeStockpileId;
  const s = await Stockpile.findById(sId);
  if (!s) return false;

  switch (text) {
    case "1":
      session.state = "LOG_PURCHASE_ITEM_NAME";
      session.data.customerName = s.customerName;
      session.data.customerPhone = s.customerPhone;
      session.data.endDate = s.endDate;
      session.data.items = []; // New items to add
      await session.save();
      await sendWhatsAppText(from, "What is the item name?");
      return true;
    case "2":
      await sendStockpileReminderNotification(vendor, s);
      await sendWhatsAppText(from, `✅ Reminder sent to ${s.customerName}`);
      return true;
    case "3":
      const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
      await sendWhatsAppText(from, `${baseUrl}/view/${s._id}`);
      return true;
    case "4":
      s.deliveryStatus = "paid";
      await s.save();
      await sendWhatsAppText(from, "✅ Delivery marked as paid!");
      return true;
    case "0":
      session.state = "VIEW_STOCKPILE_LIST";
      return listStockpiles(from, vendor, session.data.currentPage || 1);
    default:
      return false;
  }
};

// --- VIEW CUSTOMERS FLOW (4.6) ---
const listCustomers = async (from: string, vendor: any, page: number): Promise<boolean> => {
  const pageSize = 10;
  const customers = await Customer.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

  if (customers.length === 0 && page === 1) {
    await sendWhatsAppText(from, "You have no customers saved yet.");
    await sendMainMenu(from, vendor);
    return true;
  }

  let text = `👥 Customers (Page ${page}):\n\n`;
  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    const idx = (page - 1) * pageSize + i + 1;
    // Calculate total spend (mock logic or real aggregation)
    const stockpiles = await Stockpile.find({ vendorId: vendor._id, customerPhone: { $regex: c.phone.slice(-10) + "$" } });
    const totalSpend = stockpiles.reduce((acc, s) => acc + s.totalAmount, 0);
    const lastActive = stockpiles.length > 0 ? format(stockpiles[stockpiles.length - 1].updatedAt, "d MMM yyyy") : "N/A";
    
    text += `${idx}. ${c.name}\n   💰 Total Spend: ₦${totalSpend.toLocaleString()}\n   📅 Last Active: ${lastActive}\n\n`;
  }

  if (customers.length === pageSize) text += "Reply 'next' for more.\n";
  text += "\nReply with a number to view profile, or '0' for Menu.";

  const cleanPhone = from.replace(/\D/g, "");
  const session = await BotSession.findOne({ phoneNumber: cleanPhone });
  if (session) {
    session.data.customers = customers.map(c => c._id.toString());
    session.data.currentPage = page;
    await session.save();
  }

  await sendWhatsAppText(from, text);
  return true;
};

const handleViewCustomers = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text.toLowerCase() === "next") {
    return listCustomers(from, vendor, (session.data.currentPage || 1) + 1);
  }

  const idx = parseInt(text) - 1;
  const customers = session.data.customers || [];
  if (isNaN(idx) || idx < 0 || idx >= customers.length) return false;

  const customerId = customers[idx];
  const c = await Customer.findById(customerId);
  if (!c) return false;

  const stockpiles = await Stockpile.find({ vendorId: vendor._id, customerPhone: { $regex: c.phone.slice(-10) + "$" } });
  const totalSpend = stockpiles.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const lastActive = stockpiles.length > 0 ? format(stockpiles[stockpiles.length - 1].updatedAt, "d MMM yyyy") : "N/A";

  let detail = `👤 Customer Profile: ${c.name}\n📞 Phone: ${c.phone}\n📧 Email: ${c.email || "N/A"}\n\n💰 Total Spend: ₦${totalSpend.toLocaleString()}\n📦 Number of Stockpiles: ${stockpiles.length}\n📅 Last Active: ${lastActive}\n\n`;
  detail += `Options:\n1️⃣ View stockpile history\n2️⃣ Log purchase for this customer\n3️⃣ Add/edit note\n0️⃣ Back`;

  session.state = "CUSTOMER_DETAIL";
  session.data.activeCustomerId = c._id.toString();
  await session.save();
  await sendWhatsAppText(from, detail);
  return true;
};

const handleCustomerDetailAction = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  const cId = session.data.activeCustomerId;
  const c = await Customer.findById(cId);
  if (!c) return false;

  switch (text) {
    case "0":
      session.state = "VIEW_CUSTOMERS";
      return listCustomers(from, vendor, session.data.currentPage || 1);
    case "2":
      session.state = "LOG_PURCHASE_CLOSE_DATE"; // Skip name/phone
      session.data.customerName = c.name;
      session.data.customerPhone = c.phone;
      session.data.customerEmail = c.email;
      await session.save();
      await sendWhatsAppText(from, `📦 Log Purchase for ${c.name}\n\nWhen does this stockpile close? (e.g. 28/06/2025)`);
      return true;
    default:
      await sendWhatsAppText(from, "Feature coming soon! Type '0' to go back.");
      return true;
  }
};

// --- REMINDER FLOW (4.7) ---
const showReminderMenu = async (from: string, vendor: any): Promise<boolean> => {
  const stockpiles = await Stockpile.find({ 
    vendorId: vendor._id, 
    status: "active",
    isDeleted: { $ne: true } 
  }).sort({ endDate: 1 }).limit(10);

  if (stockpiles.length === 0) {
    await sendWhatsAppText(from, "No active stockpiles found.");
    await sendMainMenu(from, vendor);
    return true;
  }

  let text = `🔔 Send Reminder\n\nSelect a customer:\n`;
  stockpiles.forEach((s, i) => {
    const daysLeft = Math.ceil((new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    text += `${i + 1}. ${s.customerName} (${daysLeft} days left)\n`;
  });
  text += `\nA. SEND TO ALL\n0. Back`;

  const cleanPhone = from.replace(/\D/g, "");
  const session = await BotSession.findOne({ phoneNumber: cleanPhone });
  if (session) {
    session.data.stockpiles = stockpiles.map(s => s._id.toString());
    await session.save();
  }

  await sendWhatsAppText(from, text);
  return true;
};

const handleSendReminderSelect = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text.toLowerCase() === "a" || text.toLowerCase() === "all") {
    const stockpiles = await Stockpile.find({ vendorId: vendor._id, status: "active", isDeleted: { $ne: true } });
    await sendWhatsAppText(from, `Are you sure you want to send reminders to ALL ${stockpiles.length} customers?\n\n1️⃣ Yes\n2️⃣ Cancel`);
    session.state = "REMINDER_CONFIRM";
    session.data.targetId = "all";
    await session.save();
    return true;
  }

  const idx = parseInt(text) - 1;
  const stockpiles = session.data.stockpiles || [];
  if (isNaN(idx) || idx < 0 || idx >= stockpiles.length) return false;

  const s = await Stockpile.findById(stockpiles[idx]);
  if (!s) return false;

  await sendWhatsAppText(from, `Send reminder to ${s.customerName}? Their current total is ₦${s.totalAmount.toLocaleString()} and stockpile closes on ${format(new Date(s.endDate), "d MMM")}.\n\n1️⃣ Yes\n2️⃣ Cancel`);
  session.state = "REMINDER_CONFIRM";
  session.data.targetId = s._id.toString();
  await session.save();
  return true;
};

const handleReminderConfirm = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (text === "1") {
    if (session.data.targetId === "all") {
      const stockpiles = await Stockpile.find({ vendorId: vendor._id, status: "active", isDeleted: { $ne: true } });
      for (const s of stockpiles) {
        await sendStockpileReminderNotification(vendor, s);
      }
      await sendWhatsAppText(from, `✅ Reminders sent to all ${stockpiles.length} customers!`);
    } else {
      const s = await Stockpile.findById(session.data.targetId);
      if (s) {
        await sendStockpileReminderNotification(vendor, s);
        await sendWhatsAppText(from, `✅ Reminder sent to ${s.customerName}`);
      }
    }
  } else {
    await sendWhatsAppText(from, "Cancelled.");
  }
  session.state = "MAIN_MENU";
  await session.save();
  await sendMainMenu(from, vendor);
  return true;
};

// --- SUMMARY & SETTINGS ---
const sendDashboardSummary = async (from: string, vendor: any) => {
  const activeStockpiles = await Stockpile.find({ vendorId: vendor._id, status: "active", isDeleted: { $ne: true } });
  const totalValue = activeStockpiles.reduce((acc, s) => acc + s.totalAmount, 0);
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayPurchases = activeStockpiles.filter(s => s.updatedAt >= startOfDay);
  const closingThisWeek = activeStockpiles.filter(s => {
    const diff = (new Date(s.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });
  const deliveryUnpaid = activeStockpiles.filter(s => s.deliveryStatus !== "paid").length;

  const card = `📊 Dashboard Summary:\n\n` +
    `👥 Active Customers: ${activeStockpiles.length}\n` +
    `💰 Total Stockpile Value: ₦${totalValue.toLocaleString()}\n` +
    `🛒 Logged Today: ${todayPurchases.length}\n` +
    `⏳ Closing This Week: ${closingThisWeek.length}\n` +
    `🚚 Delivery Unpaid: ${deliveryUnpaid}\n\n` +
    `1️⃣ View full dashboard at CartList.com\n0️⃣ Main menu`;
    
  await sendWhatsAppText(from, card);
};

const sendAccountSettings = async (from: string, vendor: any) => {
  const settings = `⚙️ Account Settings\n\n` +
    `1️⃣ Update business name\n` +
    `2️⃣ Update email\n` +
    `3️⃣ View current plan\n` +
    `4️⃣ Get dashboard link\n` +
    `5️⃣ Help\n` +
    `0️⃣ Back`;
  await sendWhatsAppText(from, settings);
};

const handleAccountSettingsInput = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  switch (text) {
    case "1":
      session.state = "UPDATE_BIZ_NAME";
      await session.save();
      await sendWhatsAppText(from, "Enter your new business name:");
      return true;
    case "2":
      session.state = "UPDATE_EMAIL";
      await session.save();
      await sendWhatsAppText(from, "Enter your new email address:");
      return true;
    case "3":
      await sendWhatsAppText(from, `Current Plan: FREE\nRenewal: N/A\nUpgrade: https://www.usecartlist.com/pricing`);
      return true;
    case "4":
      await sendWhatsAppText(from, "https://www.usecartlist.com/dashboard");
      return true;
    case "5":
      await sendWhatsAppText(from, "Help & Support: support@usecartlist.com");
      return true;
    case "0":
      session.state = "MAIN_MENU";
      await session.save();
      await sendMainMenu(from, vendor);
      return true;
    default:
      return false;
  }
};

const handleUpdateBizName = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  vendor.businessName = text;
  await vendor.save();
  await sendWhatsAppText(from, `✅ Business name updated to: ${text}`);
  session.state = "ACCOUNT_SETTINGS";
  await session.save();
  await sendAccountSettings(from, vendor);
  return true;
};

const handleUpdateEmail = async (from: string, text: string, session: any, vendor: any): Promise<boolean> => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
  vendor.email = text;
  await vendor.save();
  await sendWhatsAppText(from, `✅ Email updated to: ${text}`);
  session.state = "ACCOUNT_SETTINGS";
  await session.save();
  await sendAccountSettings(from, vendor);
  return true;
};

// --- END VENDOR BOT LOGIC ---

// --- AUTOMATED REMINDER SCHEDULER (v1.5) ---
const runAutomatedReminders = async () => {
  try {
    console.log("[Scheduler] Checking for pending reminders...");
    const now = new Date();
    
    // Find active stockpiles
    const stockpiles = await Stockpile.find({ 
      status: "active", 
      isDeleted: { $ne: true } 
    });
    
    for (const s of stockpiles) {
      const vendor = await User.findById(s.vendorId);
      if (!vendor) continue;
      
      const diffDays = Math.ceil((new Date(s.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let milestone = "";
      if (diffDays === 7) milestone = "7days";
      else if (diffDays === 3) milestone = "3days";
      else if (diffDays === 1) milestone = "1day";
      else if (diffDays === 0) milestone = "today";
      
      if (milestone && !s.sentMilestones.includes(milestone)) {
        console.log(`[Scheduler] Sending ${milestone} reminder for ${s.customerName} (Stockpile: ${s._id})`);
        const sent = await sendStockpileReminderNotification(vendor, s);
        if (sent) {
          s.sentMilestones.push(milestone);
          await s.save();
        }
      }
    }
  } catch (err) {
    console.error("[Scheduler] Error running reminders:", err);
  }
};

// Run reminders every 12 hours
setInterval(runAutomatedReminders, 12 * 60 * 60 * 1000);
// Trigger once on start after a delay
setTimeout(runAutomatedReminders, 10000);

// Authentication Middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    let token = req.cookies.token;
    
    // Fallback to Authorization header if cookie is missing (common in iframes)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    
    // Update last active in background
    User.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).exec().catch(err => console.error("Update lastActive error:", err));
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// MongoDB Connection
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));
} else {
  console.warn("MONGODB_URI not found in environment variables. Database features will not work.");
}

// User Schema
const userSchema = new mongoose.Schema({
  businessName: { type: String },
  ownerName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  whatsappNumber: { type: String },
  password: { type: String },
  gender: { type: String },
  profilePicture: { type: String, default: "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp" }, // Custom default avatar
  businessCategory: { type: String },
  language: { type: String, default: "English" },
  timezone: { type: String, default: "+1 GMT" },
  currency: { type: String, default: "Naira" },
  role: { type: String, enum: ["vendor", "admin"], default: "vendor" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  lastActiveAt: { type: Date, default: Date.now },
  notifications: {
    stockpileUpdates: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    reminders: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    customerActivity: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    systemAlerts: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordAttempts: [{ type: Date }],
  hasSeenWelcome: { type: Boolean, default: true },
  lateFeeAmount: { type: Number, default: 0 },
  enableLateFees: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Stockpile Schema
const stockpileSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  endDate: { type: Date, required: true },
  deliveryPaid: { type: Boolean, default: false },
  deliveryDue: { type: Number, default: 0 },
  deliveryStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  sentMilestones: { type: [String], default: [] }, // ['5days', '2days', 'today']
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  totalAmount: { type: Number, default: 0 },
  lastWhatsAppTemplateSent: { type: String }, // Tracks the last template successfully sent
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Stockpile = mongoose.model("Stockpile", stockpileSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "urgent", "success"], default: "info" },
  isRead: { type: Boolean, default: false },
  stockpileId: { type: mongoose.Schema.Types.ObjectId, ref: "Stockpile" },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

// Waitlist Schema
const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

// Message Log Schema (for WhatsApp tracking)
const messageLogSchema = new mongoose.Schema({
  stockpileId: { type: mongoose.Schema.Types.ObjectId, ref: "Stockpile" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipientPhone: { type: String, required: true },
  templateName: { type: String, required: true },
  status: { type: String, enum: ["sent", "delivered", "failed", "read", "accepted", "deleted"], default: "sent" },
  error: { type: String },
  messageId: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const MessageLog = mongoose.model("MessageLog", messageLogSchema);

// Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ["user", "stockpile", "system", "message"] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

// Webhook Log Schema
const webhookLogSchema = new mongoose.Schema({
  payload: { type: mongoose.Schema.Types.Mixed },
  headers: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const WebhookLog = mongoose.model("WebhookLog", webhookLogSchema);

// Bot Session Schema
const botSessionSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  state: { type: String, default: "IDLE" },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  failCount: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

const BotSession = mongoose.model("BotSession", botSessionSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  note: { type: String, default: "" },
  hasInteractedWithWhatsApp: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

customerSchema.index({ vendorId: 1, phone: 1 }, { unique: true });
const Customer = mongoose.model("Customer", customerSchema);

// Public Stockpile View Route
app.get("/api/public/stockpiles/:id", async (req, res) => {
  try {
    const stockpile = await Stockpile.findById(req.params.id);
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(stockpile.vendorId).select("businessName ownerName whatsappNumber profilePicture notifications enableLateFees lateFeeAmount currency");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Calculate late fee if enabled and deadline passed
    let lateFee = 0;
    if (vendor.enableLateFees && vendor.lateFeeAmount > 0 && stockpile.status === "active") {
      const deadline = new Date(stockpile.endDate);
      const now = new Date();
      if (now > deadline) {
        const diffTime = Math.abs(now.getTime() - deadline.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lateFee = diffDays * vendor.lateFeeAmount;
      }
    }

    // Notify vendor of activity if enabled
    const prefs = vendor.notifications?.customerActivity || { email: true, sms: false, push: true, inApp: true };
    
    if (prefs.inApp !== false) {
      await Notification.create({
        userId: vendor._id,
        title: "Stockpile Viewed",
        message: `${stockpile.customerName} just viewed their stockpile list.`,
        type: "info",
        stockpileId: stockpile._id
      });
    }

    // You could also send email/push here if enabled in prefs

    res.json({ 
      ...stockpile.toObject(), 
      vendorId: vendor,
      lateFee: lateFee,
      isOverdue: lateFee > 0
    });
  } catch (error) {
    console.error("Fetch public stockpile error:", error);
    res.status(500).json({ message: "Error fetching stockpile" });
  }
});

app.post("/api/waitlist", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Store in database
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: "Already on the waitlist!" });
    }

    const waitlistEntry = new Waitlist({ email });
    await waitlistEntry.save();

    // Send email notification to usecartlist@gmail.com
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: `Cartlist Waitlist <${FROM_EMAIL}>`,
          to: "usecartlist@gmail.com",
          subject: "New Waitlist Signup! 🚀",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Waitlist Submission</h2>
              <p>A new user has just joined the Cartlist waitlist!</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
          `
        });
      } catch (err) {
        console.error("Failed to send waitlist email notification:", err);
      }
    } else {
      console.log("New waitlist signup (Resend not configured):", email);
    }

    res.status(201).json({ message: "Successfully joined waitlist" });
  } catch (error) {
    console.error("Waitlist error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: `Cartlist Contact <${FROM_EMAIL}>`,
          to: "hello@usecartlist.com",
          replyTo: email,
          subject: `New Message from ${name}`,
          html: `
            <div style="font-family: 'Inter', sans-serif; background-color: #FDF8F3; padding: 40px; color: #1A1A1A; border-radius: 24px;">
              <div style="background-color: #FFFFFF; padding: 32px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <h2 style="color: #F07E48; margin-top: 0;">New Contact Form Message</h2>
                <hr style="border: 0; border-top: 1px solid #F3F4F6; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; white-space: pre-wrap;">
                  ${message}
                </div>
                <p style="font-size: 12px; color: #9CA3AF; margin-top: 30px;">
                  This message was sent from the Cartlist contact form.
                </p>
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error("Resend error in contact form:", err);
        // We still return success if the message was logged or just to give user feedback, 
        // but ideally we'd want to know if it failed.
      }
    } else {
      console.log("Contact form submission (Resend not configured):", { name, email, message });
    }

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/stockpiles/:id/remind", authenticate, async (req: any, res) => {
  try {
    const vendorId = req.userId;
    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const success = await sendStockpileReminderNotification(vendor, stockpile);

    if (success) {
      res.json({ message: "Reminder sent successfully" });
    } else {
      res.status(400).json({ message: "Failed to send WhatsApp reminder. Check if the customer's phone number is correct or if your WhatsApp API balance is low." });
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Error sending reminder" });
  }
});

// Auth Routes
app.get("/api/auth/google/url", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  console.log("Generating Google Auth URL with redirect_uri:", redirectUri);

  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}` });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const baseUrl = (process.env.APP_URL || "https://www.usecartlist.com").replace(/\/$/, "");
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    
    console.log("Exchanging Google code with redirect_uri:", redirectUri);

    // Exchange code for tokens
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Google
    const googleUserResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const googleUser = googleUserResponse.data;

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      user = new User({
        email: googleUser.email,
        ownerName: googleUser.name,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        googleId: googleUser.id,
        isEmailVerified: true, // Google emails are verified
        hasSeenWelcome: false,
        profilePicture: googleUser.picture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp",
      });
      await user.save();
      
      // Send welcome email for new Google users
      await sendWelcomeEmail(user.email, user.firstName || user.ownerName.split(" ")[0]);
    } else if (!user.googleId) {
      // Link Google account to existing email account
      user.googleId = googleUser.id;
      user.isEmailVerified = true;
      if (!user.profilePicture || user.profilePicture.includes("profile%20picture.webp")) {
        user.profilePicture = googleUser.picture;
      }
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Send success message and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}',
                user: ${JSON.stringify({
                  id: user._id,
                  businessName: user.businessName,
                  ownerName: user.ownerName,
                  email: user.email,
                  profilePicture: user.profilePicture,
                  hasSeenWelcome: user.hasSeenWelcome,
                  googleId: user.googleId,
                  role: user.role
                })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Google OAuth error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
});
// ... (existing auth routes)

// Dashboard Data Route
app.get("/api/user/profile", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.patch("/api/user/profile", authenticate, async (req: any, res) => {
  try {
    const updates = req.body;
    console.log("Updating profile for user:", req.userId, "with updates:", JSON.stringify(updates));
    // Don't allow password updates here
    delete updates.password;
    
    // Explicitly check for late fee fields in the request body
    const user = await User.findByIdAndUpdate(
      req.userId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User updated successfully:", user._id);
    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.post("/api/user/change-password", authenticate, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
});

// Notification Routes
app.get("/api/notifications", authenticate, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    // Check for new notifications based on stockpile dates
    const activeStockpiles = await Stockpile.find({ vendorId: userId, status: "active" });
    const now = new Date();
    
    for (const stockpile of activeStockpiles) {
      const endDate = new Date(stockpile.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let milestone = "";
      let title = "";
      let message = "";
      let type: "info" | "warning" | "urgent" = "info";
      
      if (diffDays === 5) {
        milestone = "5days";
        title = "Stockpile Closing Soon";
        message = `${stockpile.customerName}'s stockpile will close in 5 days.`;
        type = "info";
      } else if (diffDays === 2) {
        milestone = "2days";
        title = "Stockpile Closing in 2 Days";
        message = `${stockpile.customerName}'s stockpile will close in 2 days. Please notify the customer.`;
        type = "warning";
      } else if (diffDays <= 0) {
        milestone = "today";
        title = "Stockpile Closing Today";
        message = `${stockpile.customerName}'s stockpile closes today.`;
        type = "urgent";
      }
      
      if (milestone && !stockpile.sentMilestones.includes(milestone)) {
        await Notification.create({
          userId,
          title,
          message,
          type,
          stockpileId: stockpile._id
        });
        
        stockpile.sentMilestones.push(milestone);
        await stockpile.save();
      }
    }
    
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.patch("/api/notifications/:id/read", authenticate, async (req: any, res: any) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

app.post("/api/notifications/read-all", authenticate, async (req: any, res: any) => {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

app.get("/api/dashboard/stats", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { period, startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    if (period === "today") {
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { createdAt: { $gte: startOfToday } };
    } else if (period === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (period === "thisMonth") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: firstDayOfMonth } };
    } else if (period === "allTime") {
      dateFilter = {};
    } else if (period === "custom" && startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // Fetch all non-deleted stockpiles to include closed ones in total value as requested
    const allStockpiles = await Stockpile.find({ vendorId, isDeleted: { $ne: true } });
    
    // Filter by date if needed (for the selected period)
    const filteredStockpiles = dateFilter.hasOwnProperty('createdAt') 
      ? allStockpiles.filter(s => {
          const filter = dateFilter as any;
          const createdAt = new Date(s.createdAt);
          if (filter.createdAt.$lte) {
            return createdAt >= filter.createdAt.$gte && createdAt <= filter.createdAt.$lte;
          }
          return createdAt >= filter.createdAt.$gte;
        })
      : allStockpiles;

    // We still need active ones for specific stats like 'closing soon'
    const activeStockpiles = filteredStockpiles.filter(s => s.status === "active");
    const allActiveStockpiles = allStockpiles.filter(s => s.status === "active");

    const stats = {
      // Calculate total value by summing all items in ALL stockpiles (active + closed)
      // The user wants to see every amount of stockpiled orders regardless of whether they are open or closed
      totalValue: filteredStockpiles.reduce((sum, s) => {
        const stockpileTotal = s.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        return sum + stockpileTotal;
      }, 0),
      // Active clients are those with currently active stockpiles
      activeClients: new Set(activeStockpiles.map(s => s.customerPhone)).size,
      // Total orders includes both active and closed stockpiles
      totalOrders: filteredStockpiles.length,
      // Unpaid deliveries should include all stockpiles that are not paid
      unpaidDeliveries: allStockpiles.filter(s => !s.deliveryPaid).length,
      closingSoon: activeStockpiles.filter(s => {
        const diff = new Date(s.endDate).getTime() - new Date().getTime();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
      }).length,
      logsToday: allStockpiles.reduce((sum, s) => {
        const today = new Date().setHours(0, 0, 0, 0);
        return sum + s.items.filter(item => new Date(item.addedAt).getTime() >= today).length;
      }, 0)
    };

    const recentPurchases = await Stockpile.find({ vendorId, isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(5);

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const closingSoonList = await Stockpile.find({ 
      vendorId, 
      status: "active",
      endDate: { $gt: now, $lte: sevenDaysFromNow }
    })
      .sort({ endDate: 1 })
      .limit(5);

    res.json({ stats, recentPurchases, closingSoonList });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// Customer Search Route
app.get("/api/customers/search", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { q } = req.query;

    if (!q) return res.json([]);

    const customers = await Stockpile.aggregate([
      { $match: { vendorId } },
      {
        $match: {
          $or: [
            { customerName: { $regex: q, $options: "i" } },
            { customerPhone: { $regex: q, $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: "$customerPhone",
          name: { $first: "$customerName" },
          phone: { $first: "$customerPhone" },
          email: { $first: "$customerEmail" }
        }
      },
      { $limit: 10 }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Search customers error:", error);
    res.status(500).json({ message: "Error searching customers" });
  }
});

app.get("/api/customers/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;

    // Get or create customer record for notes
    let customer = await Customer.findOne({ vendorId, phone });
    
    // Get all stockpiles for this customer
    const stockpiles = await Stockpile.find({ vendorId, customerPhone: phone }).sort({ createdAt: -1 });
    
    if (stockpiles.length === 0 && !customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If customer record doesn't exist but stockpiles do, create it
    if (!customer && stockpiles.length > 0) {
      customer = new Customer({
        vendorId,
        name: stockpiles[0].customerName,
        phone: stockpiles[0].customerPhone,
        email: stockpiles[0].customerEmail
      });
      await customer.save();
    }

    // Calculate stats
    const totalAmountPurchased = stockpiles.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalNotPaid = stockpiles.filter(s => !s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0);
    
    // Time spent in stockpile (average duration of active stockpiles)
    const activeStockpiles = stockpiles.filter(s => s.status === "active");
    let avgTimeSpent = 0;
    if (activeStockpiles.length > 0) {
      const totalDays = activeStockpiles.reduce((sum, s) => {
        const start = new Date(s.createdAt).getTime();
        const now = new Date().getTime();
        return sum + Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      }, 0);
      avgTimeSpent = Math.ceil(totalDays / activeStockpiles.length);
    }

    // Average amount of item
    let avgItemPrice = 0;
    const allItems = stockpiles.flatMap(s => s.items);
    if (allItems.length > 0) {
      avgItemPrice = Math.round(totalAmountPurchased / allItems.length);
    }

    const history = stockpiles.flatMap(s => 
      s.items.map(item => ({
        _id: s._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        date: item.addedAt,
        status: s.status === "closed" ? "Delivered" : "Pending",
        isDelivered: s.status === "closed"
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      customer: {
        name: customer?.name || stockpiles[0].customerName,
        phone: customer?.phone || stockpiles[0].customerPhone,
        email: customer?.email || stockpiles[0].customerEmail,
        note: customer?.note || "",
        hasActiveStockpile: activeStockpiles.length > 0,
        deliveryPaid: activeStockpiles.length > 0 ? activeStockpiles[0].deliveryPaid : false
      },
      stats: {
        totalAmountPurchased,
        totalNotPaid,
        avgTimeSpent,
        avgItemPrice
      },
      history
    });
  } catch (error) {
    console.error("Fetch customer details error:", error);
    res.status(500).json({ message: "Error fetching customer details" });
  }
});

app.patch("/api/customers/:phone/note", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;
    const { note } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { vendorId, phone },
      { note },
      { new: true, upsert: true }
    );

    res.json(customer);
  } catch (error) {
    console.error("Update customer note error:", error);
    res.status(500).json({ message: "Error updating customer note" });
  }
});

app.delete("/api/customers/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;

    await Stockpile.deleteMany({ vendorId, customerPhone: phone });
    await Customer.deleteOne({ vendorId, phone });

    res.json({ message: "Customer and all their records deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Error deleting customer" });
  }
});

// Stockpile Management Routes
app.get("/api/stockpiles", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { status, search, filter } = req.query;

    let query: any = { vendorId, isDeleted: { $ne: true } };
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const now = new Date();
    if (filter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.createdAt = { $gte: startOfDay };
    } else if (filter === "thisMonth") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: firstDayOfMonth };
    }

    let sort: any = { updatedAt: -1 };
    if (filter === "oldest") {
      sort = { createdAt: 1 };
    } else if (filter === "newest") {
      sort = { updatedAt: -1 };
    } else if (filter === "closingSoon") {
      sort = { endDate: 1 };
    }

    const stockpiles = await Stockpile.find(query).sort(sort);
    res.json(stockpiles);
  } catch (error) {
    console.error("Fetch stockpiles error:", error);
    res.status(500).json({ message: "Error fetching stockpiles" });
  }
});

app.get("/api/stockpiles/stats", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    
    // Fetch all non-deleted stockpiles for total stats
    const allStockpiles = await Stockpile.find({ vendorId, isDeleted: { $ne: true } });
    // Filter for active stockpiles for specific counts
    const activeStockpiles = allStockpiles.filter(s => s.status === "active");
    
    const stats = {
      totalEarnings: allStockpiles.reduce((sum, s) => sum + s.totalAmount, 0),
      paidAmount: allStockpiles.filter(s => s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0),
      notPaidAmount: allStockpiles.filter(s => !s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0),
      totalStockpileCount: allStockpiles.length,
      openStockpileCount: activeStockpiles.length,
      closedStockpileCount: allStockpiles.filter(s => s.status === "closed").length,
      deliveryPaidCount: allStockpiles.filter(s => s.deliveryPaid).length,
      deliveryUnpaidCount: allStockpiles.filter(s => !s.deliveryPaid).length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Fetch stockpile stats error:", error);
    res.status(500).json({ message: "Error fetching stockpile stats" });
  }
});

app.get("/api/customers", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    
    const customers = await Stockpile.aggregate([
      { $match: { vendorId } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$customerPhone",
          customerName: { $first: "$customerName" },
          customerEmail: { $first: "$customerEmail" },
          totalSpend: { $sum: "$totalAmount" },
          totalItems: { $sum: { $size: "$items" } },
          lastPurchaseDate: { $max: "$updatedAt" },
          firstPurchaseDate: { $min: "$createdAt" },
          activeStockpiles: {
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$status", "active"] }, { $ne: ["$isDeleted", true] }] }, 
                1, 
                0
              ] 
            }
          },
          unpaidDeliveries: {
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$deliveryPaid", false] }, { $ne: ["$isDeleted", true] }] }, 
                1, 
                0
              ] 
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          phone: "$_id",
          name: "$customerName",
          email: "$customerEmail",
          totalSpend: 1,
          totalItems: 1,
          lastPurchaseDate: 1,
          firstPurchaseDate: 1,
          status: { $cond: [{ $gt: ["$activeStockpiles", 0] }, "active", "inactive"] },
          hasUnpaidDelivery: { $gt: ["$unpaidDeliveries", 0] }
        }
      },
      { $sort: { lastPurchaseDate: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

app.get("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);

    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    res.json(stockpile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stockpile" });
  }
});

app.patch("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { customerName, customerPhone, customerEmail, endDate, deliveryPaid, deliveryDue, items, totalAmount, status, appendItems } = req.body;

    const updateData: any = {};
    if (customerName) updateData.customerName = customerName;
    if (customerPhone) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (endDate) updateData.endDate = new Date(endDate);
    if (deliveryPaid !== undefined) updateData.deliveryPaid = deliveryPaid;
    if (deliveryDue !== undefined) updateData.deliveryDue = deliveryDue;
    if (status) updateData.status = status;

    const originalStockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!originalStockpile) return res.status(404).json({ message: "Stockpile not found" });

    let stockpile;
    if (appendItems && items) {
      stockpile = await Stockpile.findOneAndUpdate(
        { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
        { 
          $push: { items: { $each: items } },
          $inc: { totalAmount: totalAmount || 0 },
          ...updateData
        },
        { new: true }
      );
    } else {
      if (items) updateData.items = items;
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
      stockpile = await Stockpile.findOneAndUpdate(
        { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
        updateData,
        { new: true }
      );
    }

    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(vendorId);
    if (vendor) {
      // Send WhatsApp notification if items were appended
      if (appendItems && items && items.length > 0) {
        await sendStockpileUpdateNotification(vendor, stockpile, items);
      }

      // Send extension notification if endDate was changed
      if (endDate && new Date(endDate).getTime() !== new Date(originalStockpile.endDate).getTime()) {
        await sendStockpileExtensionNotification(vendor, stockpile);
      }

      // Send closed notification if status changed to closed
      if (status === "closed" && originalStockpile.status !== "closed") {
        await sendStockpileClosedNotification(vendor, stockpile);
      }
    }

    res.json(stockpile);
  } catch (error) {
    console.error("Update stockpile error:", error);
    res.status(500).json({ message: "Error updating stockpile" });
  }
});

app.patch("/api/stockpiles/:id/status", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { status } = req.body;

    const stockpile = await Stockpile.findOneAndUpdate(
      { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    // Send closed notification if status changed to closed
    if (status === "closed") {
      const vendor = await User.findById(vendorId);
      if (vendor) {
        await sendStockpileClosedNotification(vendor, stockpile);
      }
    }

    res.json(stockpile);
  } catch (error) {
    res.status(500).json({ message: "Error updating stockpile status" });
  }
});

app.patch("/api/stockpiles/:id/toggle-delivery", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    stockpile.status = stockpile.status === "active" ? "closed" : "active";
    const statusChangedToClosed = stockpile.status === "closed";
    stockpile.updatedAt = new Date();
    await stockpile.save();

    if (statusChangedToClosed) {
      const vendor = await User.findById(vendorId);
      if (vendor) {
        await sendStockpileClosedNotification(vendor, stockpile);
      }
    }

    res.json(stockpile);
  } catch (error) {
    console.error("Toggle delivery error:", error);
    res.status(500).json({ message: "Error toggling delivery status" });
  }
});

app.patch("/api/stockpiles/bulk-status", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    await Stockpile.updateMany(
      { _id: { $in: ids }, vendorId, isDeleted: { $ne: true } },
      { status, updatedAt: new Date() }
    );

    if (status === "closed") {
      const vendor = await User.findById(vendorId);
      if (vendor) {
        const stockpiles = await Stockpile.find({ _id: { $in: ids }, vendorId, status: "closed" });
        for (const s of stockpiles) {
          await sendStockpileClosedNotification(vendor, s);
        }
      }
    }

    res.json({ message: `Successfully marked ${ids.length} stockpiles as ${status}` });
  } catch (error) {
    console.error("Bulk status update error:", error);
    res.status(500).json({ message: "Error updating stockpiles" });
  }
});

app.post("/api/stockpiles/bulk-delete", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const result = await Stockpile.updateMany(
      { _id: { $in: ids }, vendorId },
      { isDeleted: true, updatedAt: new Date() }
    );
    
    res.json({ message: `Successfully deleted ${result.modifiedCount} stockpiles` });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Error deleting stockpiles" });
  }
});

app.delete("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);

    const result = await Stockpile.updateOne(
      { _id: req.params.id, vendorId },
      { isDeleted: true, updatedAt: new Date() }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "Stockpile not found" });

    res.json({ message: "Stockpile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stockpile" });
  }
});

app.get("/api/customers/check/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = req.userId;
    const { phone } = req.params;
    
    // Find the most recent stockpile for this customer to get their name
    const existingStockpile = await Stockpile.findOne({ 
      vendorId, 
      customerPhone: phone,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    if (existingStockpile) {
      // Check if they have an active stockpile
      const activeStockpile = await Stockpile.findOne({
        vendorId,
        customerPhone: phone,
        status: "active",
        isDeleted: { $ne: true }
      });

      return res.json({ 
        exists: true, 
        customerName: existingStockpile.customerName,
        hasActiveStockpile: !!activeStockpile,
        activeStockpileId: activeStockpile?._id,
        endDate: activeStockpile?.endDate
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error("Check customer error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/stockpile/log", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { customerName, customerPhone, customerEmail, endDate, deliveryPaid, deliveryDue, items, totalAmount } = req.body;
    
    // Get vendor info for WhatsApp message
    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Check for an active stockpile for this customer
    let isNew = false;
    let stockpile = await Stockpile.findOne({
      vendorId,
      customerPhone,
      status: "active",
      isDeleted: { $ne: true }
    });

    if (stockpile) {
      // Append items and update total
      stockpile.items.push(...items.map((item: any) => ({ ...item, addedAt: new Date() })));
      stockpile.totalAmount += totalAmount;
      if (deliveryPaid !== undefined) stockpile.deliveryPaid = deliveryPaid;
      if (deliveryDue !== undefined) stockpile.deliveryDue = deliveryDue;
      await stockpile.save();
    } else {
      // Create new stockpile
      stockpile = new Stockpile({
        vendorId,
        customerName,
        customerPhone,
        customerEmail,
        endDate: new Date(endDate),
        deliveryPaid,
        deliveryDue: deliveryDue || 0,
        items,
        totalAmount,
        status: "active"
      });
      await stockpile.save();
      isNew = true;
    }

    // Update or create customer record
    await Customer.findOneAndUpdate(
      { vendorId, phone: customerPhone },
      { 
        name: customerName, 
        email: customerEmail,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true }
    );

    // Send WhatsApp Notification via Kapso
    if (isNew) {
      await sendStockpileCreatedNotification(vendor, stockpile);
    } else {
      await sendStockpileUpdateNotification(vendor, stockpile, items);
    }

    res.status(201).json({ 
      message: "Purchase logged successfully", 
      stockpile: {
        _id: stockpile._id,
        customerName: stockpile.customerName,
        totalAmount: stockpile.totalAmount,
        itemsCount: stockpile.items.length,
        endDate: stockpile.endDate
      }
    });
  } catch (error) {
    console.error("Log purchase error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- ADMIN SYSTEM ---

const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      console.error("isAdmin: User not found", req.userId);
      return res.status(403).json({ message: "Forbidden: User not found" });
    }
    if (user.role !== "admin") {
      console.error("isAdmin: User is not admin", user.email, user.role);
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  } catch (error: any) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ message: "Internal server error in admin check", error: error.message });
  }
};

// Log Admin Action Helper
const logAdminAction = async (adminId: string, action: string, targetType: string, targetId?: string, details?: string) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details
    });
  } catch (err) {
    console.error("Admin Log Error:", err);
  }
};

// Admin Dashboard Overview
app.get("/api/admin/stats", authenticate, isAdmin, async (req, res) => {
  try {
    const totalVendors = await User.countDocuments({ role: { $ne: "admin" } });
    const totalCustomers = await Customer.countDocuments();
    const activeStockpiles = await Stockpile.countDocuments({ status: "active", isDeleted: { $ne: true } });
    const closedStockpiles = await Stockpile.countDocuments({ status: "closed", isDeleted: { $ne: true } });
    
    // Revenue tracking (₦)
    const revenueStats = await Stockpile.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, totalValue: { $sum: "$totalAmount" } } }
    ]);
    const totalValue = revenueStats[0]?.totalValue || 0;

    // Messaging tracking
    const totalMessages = await MessageLog.countDocuments();
    const failedMessages = await MessageLog.countDocuments({ status: "failed" });
    
    // Today's activity
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    // Current metrics (already fetched above)
    
    // Previous metrics (for percentage calculation)
    const vendorsYesterdayTotal = await User.countDocuments({ role: { $ne: "admin" }, createdAt: { $lt: startOfToday } });
    const customersYesterdayTotal = await Customer.countDocuments({ createdAt: { $lt: startOfToday } });
    const activeStockpilesYesterdayTotal = await Stockpile.countDocuments({ status: "active", isDeleted: { $ne: true }, createdAt: { $lt: startOfToday } });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const vendorsToday = await User.countDocuments({ role: { $ne: "admin" }, createdAt: { $gte: startOfToday } });
    const customersToday = await Customer.countDocuments({ createdAt: { $gte: startOfToday } });
    const stockpilesToday = await Stockpile.countDocuments({ createdAt: { $gte: startOfToday }, isDeleted: { $ne: true } });
    const completedStockpilesToday = await Stockpile.countDocuments({ 
      status: "closed", 
      updatedAt: { $gte: startOfToday },
      isDeleted: { $ne: true } 
    });
    const messagesSentToday = await MessageLog.countDocuments({ createdAt: { $gte: startOfToday } });
    const messagesFailedToday = await MessageLog.countDocuments({ status: "failed", createdAt: { $gte: startOfToday } });
    const revenueTodayStats = await Stockpile.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenueToday = revenueTodayStats[0]?.total || 0;

    const revenueYesterdayStats = await Stockpile.aggregate([
      { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenueYesterday = revenueYesterdayStats[0]?.total || 0;

    // Top Vendors by Volume
    const topVendors = await Stockpile.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { 
          _id: "$vendorId", 
          totalValue: { $sum: "$totalAmount" },
          stockpileCount: { $sum: 1 }
      }},
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendor"
      }},
      { $unwind: "$vendor" },
      { $project: {
          name: "$vendor.businessName",
          profilePicture: "$vendor.profilePicture",
          totalValue: 1,
          stockpileCount: 1
      }}
    ]);

    // Recent Stockpiles
    const recentStockpiles = await Stockpile.find({ isDeleted: { $ne: true } })
      .populate("vendorId", "businessName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Messages
    const recentMessages = await MessageLog.find()
      .populate("stockpileId", "customerName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Failed Messages
    const failedMessagesList = await MessageLog.find({ status: "failed" })
      .populate("stockpileId", "customerName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Admin Activity
    const recentActivity = await AdminLog.find()
      .populate("adminId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      overview: {
        totalVendors,
        totalCustomers,
        activeStockpiles,
        closedStockpiles,
        totalValue,
        totalMessages,
        failedMessages
      },
      today: {
        vendors: vendorsToday,
        customers: customersToday,
        stockpiles: stockpilesToday,
        completedStockpiles: completedStockpilesToday,
        messagesSent: messagesSentToday,
        failedMessages: messagesFailedToday,
        revenue: revenueToday,
        vendorsChange: calculateChange(totalVendors, vendorsYesterdayTotal),
        customersChange: calculateChange(totalCustomers, customersYesterdayTotal),
        stockpilesChange: calculateChange(activeStockpiles, activeStockpilesYesterdayTotal),
        revenueChange: calculateChange(revenueToday, revenueYesterday)
      },
      topVendors,
      recentStockpiles,
      recentMessages,
      failedMessagesList,
      recentActivity
    });
  } catch (err: any) {
    console.error("Admin Stats Detail Error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ message: "Error fetching admin stats", detail: err.message });
  }
});

// Admin User Management
app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { search, status, role } = req.query;
    const query: any = {};
    
    if (role) {
      query.role = role;
    } else {
      // Default to showing everyone who is NOT an admin (vendors, and potentially legacy users)
      query.role = { $ne: "admin" };
    }
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsappNumber: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const users = await User.find(query).sort({ lastActiveAt: -1 });
    
    // Add activity data for each user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const stockpileCount = await Stockpile.countDocuments({ vendorId: u._id, isDeleted: { $ne: true } });
      const totalVolume = await Stockpile.aggregate([
        { $match: { vendorId: u._id, isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return {
        ...u.toObject(),
        stockpileCount,
        totalVolume: totalVolume[0]?.total || 0
      };
    }));

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Admin Customer Management
app.get("/api/admin/customers", authenticate, isAdmin, async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("vendorId", "businessName")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all customers" });
  }
});

// Update User Status (Suspend/Activate)
app.post("/api/admin/users/:id/status", authenticate, isAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await logAdminAction(req.userId, `UPDATE_STATUS_${status.toUpperCase()}`, "user", user._id.toString(), `Status changed to ${status}`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating user status" });
  }
});

// Admin Stockpile Management
app.get("/api/admin/stockpiles", authenticate, isAdmin, async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const query: any = { isDeleted: { $ne: true } };
    
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    const stockpiles = await Stockpile.find(query)
      .populate("vendorId", "businessName email")
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(stockpiles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stockpiles" });
  }
});

// Force Close Stockpile
app.post("/api/admin/stockpiles/:id/close", authenticate, isAdmin, async (req: any, res) => {
  try {
    const stockpile = await Stockpile.findByIdAndUpdate(req.params.id, { status: "closed" }, { new: true });
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });
    
    await logAdminAction(req.userId, "FORCE_CLOSE", "stockpile", stockpile._id.toString(), "Admin forced close");
    res.json(stockpile);
  } catch (err) {
    res.status(500).json({ message: "Error closing stockpile" });
  }
});

// Admin Messaging Monitor
app.get("/api/admin/message-logs", authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const logs = await MessageLog.find(query)
      .populate("vendorId", "businessName")
      .populate("stockpileId", "customerName")
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

app.get("/api/admin/webhook-logs", authenticate, isAdmin, async (req, res) => {
  try {
    const logs = await WebhookLog.find({}).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching webhook logs" });
  }
});

// Retry Failed Message
app.post("/api/admin/message-logs/:id/retry", authenticate, isAdmin, async (req: any, res) => {
  try {
    const log = await MessageLog.findById(req.params.id).populate("vendorId").populate("stockpileId");
    if (!log) return res.status(404).json({ message: "Log not found" });

    const vendor = log.vendorId as any;
    const stockpile = log.stockpileId as any;
    
    if (!vendor || !stockpile) return res.status(400).json({ message: "Context missing for retry" });

    let success = false;
    if (log.templateName === "stockpile_created") {
      success = await sendStockpileCreatedNotification(vendor, stockpile);
    } else if (log.templateName === "stockpile_closed") {
      success = await sendStockpileClosedNotification(vendor, stockpile);
    } else if (log.templateName === "stockpile_extended") {
      success = await sendStockpileExtensionNotification(vendor, stockpile);
    } else if (log.templateName === "stockpile_reminder") {
      success = await sendStockpileReminderNotification(vendor, stockpile);
    }

    if (success) {
      await MessageLog.findByIdAndUpdate(log._id, { status: "sent", error: null });
      await logAdminAction(req.userId, "RETRY_SUCCESS", "message", log._id.toString());
      res.json({ message: "Retry successful" });
    } else {
      res.status(500).json({ message: "Retry failed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrying message" });
  }
});

app.get("/api/admin/audit-logs", authenticate, isAdmin, async (req, res) => {
  try {
    const logs = await (AdminLog as any).find()
      .populate("adminId", "businessName email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

app.get("/api/admin/check-setup", async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    res.json({ needsSetup: !adminExists });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create Admin (Internal/Manual)
app.post("/api/admin/create", authenticate, isAdmin, async (req: any, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "admin",
      businessName: "Cartlist Admin",
      whatsappNumber: "0",
      isEmailVerified: true
    });

    await newAdmin.save();
    await logAdminAction(req.userId, "CREATE_ADMIN", "user", newAdmin._id.toString(), `New admin created: ${email}`);
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin" });
  }
});

// EMERGENCY: Setup first admin (only works if no admins exist)
app.post("/api/admin/setup-initial", async (req, res) => {
  console.log("INITIAL ADMIN SETUP REQUEST RECEIVED");
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Setup blocked: Admin already exists");
      return res.status(403).json({ message: "Blocked: Admins already exist" });
    }

    const { email, password, firstName, lastName } = req.body;
    console.log(`Setting up admin for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if user already exists (as a vendor/customer)
    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      console.log("Existing user found, promoting to primary admin");
      user.role = "admin";
      user.password = hashedPassword; // Update password to the new admin one
      user.isEmailVerified = true;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      await user.save();
    } else {
      console.log("Creating new primary admin identity");
      user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "admin",
        businessName: "Primary Admin",
        whatsappNumber: "0",
        isEmailVerified: true
      });
      await user.save();
    }

    console.log("Primary admin created/promoted successfully");
    res.status(201).json({ message: "First admin created. Route now locked." });
  } catch (err: any) {
    console.error("Admin Setup failed error:", err);
    res.status(500).json({ message: `Setup failed: ${err.message}` });
  }
});

app.post("/api/auth/register", async (req, res) => {
  console.log("Register request received:", req.body.email);
  
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. ReadyState:", mongoose.connection.readyState);
    return res.status(500).json({ message: "Database connection error. Please try again later." });
  }

  try {
    const { businessName, ownerName, email, whatsappNumber, password, businessCategory, gender } = req.body;

    if (!businessName || !ownerName || !email || !whatsappNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    // Split ownerName into firstName and lastName
    const nameParts = ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const user = new User({
      businessName,
      ownerName,
      firstName,
      lastName,
      email,
      whatsappNumber,
      password: hashedPassword,
      businessCategory,
      gender,
      isEmailVerified: false,
      hasSeenWelcome: false,
      verificationToken
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken, req);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        email: user.email,
        profilePicture: user.profilePicture,
        hasSeenWelcome: user.hasSeenWelcome,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });

    // Generate new token if needed, or reuse existing one
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString("hex");
      await user.save();
    }

    const firstName = user.firstName || user.ownerName.split(" ")[0];
    const sent = await sendVerificationEmail(email, firstName, user.verificationToken, req);

    if (sent) {
      res.json({ message: "Verification email resent successfully" });
    } else {
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).send("Verification token is missing");

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send("Invalid or expired verification token");

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await (user as any).save();

    // Send welcome email after email verification
    await sendWelcomeEmail(user.email, user.firstName || user.ownerName.split(" ")[0]);

    // Log the user in automatically
    const authToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Internal server error during verification");
  }
});

app.post("/api/auth/login", async (req, res) => {
  console.log("Login request received:", req.body.email);

  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. ReadyState:", mongoose.connection.readyState);
    return res.status(500).json({ message: "Database connection error. Please try again later." });
  }

  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please use the Google button to login." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const expiresIn = rememberMe ? "30d" : "24h";
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true, // Added for better iframe support
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      token, // Send token in body as well
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        hasSeenWelcome: user.hasSeenWelcome,
        googleId: user.googleId,
        whatsappNumber: user.whatsappNumber,
        businessCategory: user.businessCategory,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/auth/profile", authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedUpdates = [
      "businessName", "firstName", "lastName", "ownerName", 
      "whatsappNumber", "gender", "language", "timezone", 
      "currency", "notifications", "profilePicture"
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        (user as any)[key] = req.body[key];
      }
    });

    await (user as any).save();
    res.json({ user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.post("/api/auth/change-password", authenticate, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user registered with Google, they might not have a password
    if (user.googleId && !user.password) {
      // Allow setting a password for the first time if they came from Google
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res.json({ message: "Password set successfully" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if user exists
      return res.json({ message: "If an account exists with that email, an OTP has been sent." });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

    // Filter attempts to only keep those from the last 5 minutes
    user.resetPasswordAttempts = (user.resetPasswordAttempts || []).filter(
      (attempt: Date) => attempt > fiveMinutesAgo
    );

    // Check for 60s cooldown
    const lastAttempt = user.resetPasswordAttempts[user.resetPasswordAttempts.length - 1];
    if (lastAttempt && lastAttempt > sixtySecondsAgo) {
      const waitTime = Math.ceil((lastAttempt.getTime() + 60000 - now.getTime()) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${waitTime} seconds before requesting another OTP.`,
        retryAfter: waitTime
      });
    }

    // Check for 3 attempts in 5 minutes
    if (user.resetPasswordAttempts.length >= 3) {
      const firstAttempt = user.resetPasswordAttempts[0];
      const waitTime = Math.ceil((firstAttempt.getTime() + 300000 - now.getTime()) / 1000);
      return res.status(429).json({ 
        message: `Too many requests. Please wait ${Math.ceil(waitTime / 60)} minutes before trying again.`,
        retryAfter: waitTime
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Add current attempt
    user.resetPasswordAttempts.push(now);
    await user.save();

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: `Cartlist <${FROM_EMAIL}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family: 'Inter', sans-serif; background-color: #FDF8F3; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
            </div>
            <div style="background-color: #FFFFFF; padding: 40px; border-radius: 32px; box-shadow: 0 4px 20px rgba(240, 126, 72, 0.05);">
              <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #1A1A1A;">Reset your password</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #6B7280; margin-bottom: 32px;">
                Your OTP for password reset is:
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 800; color: #F07E48; letter-spacing: 4px;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #9CA3AF; text-align: center;">
                This OTP will expire in 10 minutes.
              </p>
            </div>
          </div>
        `
      });
    } else {
      console.log("OTP for", email, "is", otp);
    }

    res.json({ message: "If an account exists with that email, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
