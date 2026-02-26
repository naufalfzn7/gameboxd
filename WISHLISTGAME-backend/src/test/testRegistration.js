/**
 * Manual Test Registration & Email
 *
 * This file shows how to manually test the registration endpoint
 * and verify email is being sent
 *
 * Usage:
 *   1. Ensure backend is running on http://localhost:3000
 *   2. Run: node src/test/testRegistration.js
 *   3. Check backend console and email inbox
 */

import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Color codes for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log("\n");
console.log(colors.blue + "=".repeat(60) + colors.reset);
console.log(
  colors.blue + "          MANUAL TEST - REGISTRATION & EMAIL" + colors.reset,
);
console.log(colors.blue + "=".repeat(60) + colors.reset);
console.log("\n");

// Test data
const testUser = {
  email: `test-${Date.now()}@gmail.com`,
  password: "TestPassword123!",
  name: "Test User " + Math.random().toString(36).substring(7),
};

console.log(colors.cyan + "📝 Test User Data:" + colors.reset);
console.log(`  📧 Email: ${testUser.email}`);
console.log(`  🔐 Password: ${testUser.password}`);
console.log(`  👤 Name: ${testUser.name}`);
console.log("\n");

// Step 1: Check Backend Connection
console.log(colors.yellow + "STEP 1: Check Backend Connection" + colors.reset);
console.log("  Connecting to:", API_URL);

axios
  .get(API_URL.replace("/api", ""))
  .then(() => {
    console.log(colors.green + "  ✅ Backend is running!\n" + colors.reset);
    performRegistration();
  })
  .catch((error) => {
    console.log(colors.red + "  ❌ Backend not responding!" + colors.reset);
    console.log(`  Error: ${error.message}`);
    console.log("\n  Make sure backend is running:");
    console.log("    cd WISHLISTGAME-backend");
    console.log("    npm run dev\n");
    process.exit(1);
  });

// Step 2: Perform Registration
async function performRegistration() {
  console.log(
    colors.yellow + "STEP 2: Send Registration Request" + colors.reset,
  );
  console.log(`  POST ${API_URL}/auth/register`);
  console.log(colors.cyan + "\n  Req body:" + colors.reset);
  console.log(`    {`);
  console.log(`      "email": "${testUser.email}",`);
  console.log(`      "password": "${testUser.password}",`);
  console.log(`      "name": "${testUser.name}"`);
  console.log(`    }\n`);

  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser, {
      validateStatus: () => true, // Don't throw on any status
    });

    console.log(
      colors.cyan + `  Res status: ${response.status}` + colors.reset,
    );
    console.log(colors.cyan + "  Res body:" + colors.reset);
    console.log(JSON.stringify(response.data, null, 4));
    console.log("\n");

    if (response.status === 201 && response.data.success) {
      console.log(
        colors.green + "  ✅ Registration successful!\n" + colors.reset,
      );
      printNextSteps();
    } else if (response.status === 400) {
      console.log(colors.red + "  ❌ Validation error!" + colors.reset);
      console.log("  Check if:");
      console.log("    • Email already exists");
      console.log("    • Password meets requirements");
      console.log("    • All fields are provided\n");
    } else {
      console.log(colors.red + "  ❌ Registration failed!" + colors.reset);
      console.log(`  Status: ${response.status}\n`);
    }
  } catch (error) {
    console.log(colors.red + "  ❌ Error during request!" + colors.reset);
    console.log(`  ${error.message}\n`);
  }
}

function printNextSteps() {
  console.log(colors.blue + "=".repeat(60) + colors.reset);
  console.log(colors.yellow + "📋 NEXT STEPS TO VERIFY EMAIL" + colors.reset);
  console.log(colors.blue + "=".repeat(60) + colors.reset);
  console.log("\n");

  console.log(colors.cyan + "1️⃣  CHECK BACKEND CONSOLE" + colors.reset);
  console.log("  Should see:");
  console.log("    📧 Sending email to: " + testUser.email);
  console.log("    ✅ Email sent successfully: [message details]");
  console.log("\n  Or error like:");
  console.log("    ❌ Email error: [error details]");
  console.log("\n");

  console.log(colors.cyan + "2️⃣  CHECK EMAIL INBOX" + colors.reset);
  console.log(`  Go to: ${testUser.email}`);
  console.log("  Look for email from: fauzannaufal807@gmail.com");
  console.log("  Subject: 'Activate Your Account'");
  console.log("\n  📝 Note:");
  console.log("    • Check SPAM/JUNK folder if not in inbox");
  console.log("    • May take 5-30 seconds to arrive");
  console.log("    • Gmail sometimes filters automated emails");
  console.log("\n");

  console.log(colors.cyan + "3️⃣  CLICK ACTIVATION LINK" + colors.reset);
  console.log("  When email arrives:");
  console.log("    • Click the activation button/link");
  console.log("    • Should redirect to frontend success page");
  console.log("    • User account becomes active in database");
  console.log("\n");

  console.log(colors.cyan + "4️⃣  TRY TO LOGIN" + colors.reset);
  console.log("  Go to: http://localhost:5173/login");
  console.log(`  Email: ${testUser.email}`);
  console.log(`  Password: ${testUser.password}`);
  console.log("  Should login successfully");
  console.log("\n");

  console.log(colors.yellow + "⚠️  IF EMAIL NOT ARRIVING:" + colors.reset);
  console.log("  1. Check backend console for errors");
  console.log("  2. Run debug script: node src/debug/emailDebug.js");
  console.log("  3. Check .env EMAIL configuration");
  console.log("  4. Verify Gmail App Password is correct");
  console.log("  5. Try different email address (@yahoo.com, @outlook.com)");
  console.log("\n");

  console.log(colors.blue + "=".repeat(60) + colors.reset);
  console.log(
    colors.green +
      "✅ Test request sent! Check above for next steps" +
      colors.reset,
  );
  console.log(colors.blue + "=".repeat(60) + colors.reset);
  console.log("\n");
}
