/**
 * Email Debug Script
 * Run: node src/debug/emailDebug.js
 *
 * Script ini digunakan untuk debug email configuration dan test email sending
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, "../../.env");
console.log(`\n📂 Looking for .env at: ${envPath}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ .env file loaded\n");
} else {
  console.log("❌ .env file NOT found!\n");
  process.exit(1);
}

// ==============================================
// SECTION 1: Check Environment Variables
// ==============================================
console.log("=====================================");
console.log("SECTION 1: Environment Variables Check");
console.log("=====================================\n");

const requiredVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
];

let allVarsPresent = true;
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Hide sensitive data
    let displayValue = value;
    if (varName === "EMAIL_PASS") {
      displayValue = "***" + value.slice(-4);
    } else if (varName === "EMAIL_USER") {
      displayValue = "***" + value.slice(-10);
    }
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log("\n❌ Missing email configuration! Check your .env file.\n");
  process.exit(1);
}

console.log("\n✅ All required variables are set!\n");

// ==============================================
// SECTION 2: Test SMTP Connection
// ==============================================
console.log("=====================================");
console.log("SECTION 2: SMTP Connection Test");
console.log("=====================================\n");

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465;

console.log(`📧 SMTP Details:`);
console.log(`   Host: ${process.env.EMAIL_HOST}`);
console.log(`   Port: ${port}`);
console.log(`   Secure (TLS): ${secure}`);
console.log(`   User: ***${process.env.EMAIL_USER.slice(-10)}`);

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add debugging
  logger: true,
  debug: true,
});

console.log("\n🔍 Verifying SMTP connection...\n");

transport.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection FAILED!");
    console.error("\n📋 Error Details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.response) {
      console.error(`   SMTP Response: ${error.response}`);
    }

    console.log("\n🔧 Troubleshooting Tips:");
    if (error.code === "EAUTH") {
      console.log("   • Issue: Authentication failed");
      console.log(
        "   • Solution 1: Check EMAIL_USER and EMAIL_PASS are correct",
      );
      console.log(
        "   • Solution 2: For Gmail, use App Password NOT regular password",
      );
      console.log(
        "   • Solution 3: Enable 2-Step Verification on Gmail account",
      );
      console.log("   • Solution 4: Check no spaces in EMAIL_PASS");
    } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.log("   • Issue: Cannot connect to SMTP server");
      console.log("   • Solution 1: Check EMAIL_HOST is correct");
      console.log("   • Solution 2: Check internet connection");
      console.log("   • Solution 3: Firewall might be blocking port " + port);
      console.log("   • Solution 4: Try port 465 instead of 587");
    } else if (error.code === "ETIMEDOUT") {
      console.log("   • Issue: Connection timeout");
      console.log("   • Solution 1: Check internet connection");
      console.log("   • Solution 2: Try different network");
      console.log("   • Solution 3: Increase timeout or try port 465");
    }

    process.exit(1);
  } else {
    console.log("✅ SMTP Connection SUCCESS!");
    console.log("   Email transport is ready to send emails\n");
    testEmailSending();
  }
});

// ==============================================
// SECTION 3: Test Email Sending
// ==============================================
async function testEmailSending() {
  console.log("=====================================");
  console.log("SECTION 3: Send Test Email");
  console.log("=====================================\n");

  // Ask for test email
  const testEmail = process.env.EMAIL_USER; // Send to sender email

  console.log(`📧 Sending test email to: ${testEmail}\n`);

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: "🧪 Test Email - Email Configuration Working!",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">✅ Email Configuration is Working!</h2>
              <p>Congratulations! Your email system is configured correctly and can send emails.</p>
              
              <h3 style="color: #333;">Email Details:</h3>
              <ul>
                <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                <li><strong>To:</strong> ${testEmail}</li>
                <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</li>
                <li><strong>SMTP Port:</strong> ${port}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              </ul>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                This is a test email sent from your Game Wishlist backend email debug script.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("\n📋 Email Response Details:");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);

    console.log(
      "\n✅ All tests passed! Your email system is working correctly.",
    );
    console.log("\n🚀 Next steps:");
    console.log("   1. Check your email inbox for the test email");
    console.log("   2. Check spam/junk folder if not in inbox");
    console.log("   3. If you received it, registration emails will work!");
    console.log("   4. If you didn't receive it, check firewall/antivirus\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to send test email!");
    console.error("\n📋 Error Details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.response) {
      console.error(`   SMTP Response: ${error.response}`);
    }

    console.log("\n🔧 Troubleshooting:");
    console.log("   • Connection verified but sending failed");
    console.log("   • This might be a temporary issue");
    console.log("   • Try again in a few moments\n");

    process.exit(1);
  }
}
