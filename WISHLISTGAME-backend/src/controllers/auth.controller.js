import asyncHandler from "../middlewares/asyncHandler.js";
import { prisma } from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/encrypt.js";
import * as yup from "yup";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/mail.js";

// Validation Schema
const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(6)
    .required()
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character",
    ),
  name: yup.string().min(2).max(50).required(),
});

// REGISTER
export const register = asyncHandler(async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log("🔐 REGISTRATION REQUEST RECEIVED");
  console.log("=".repeat(60));
  console.log("📧 Email:", req.body.email);
  console.log("👤 Name:", req.body.name);

  try {
    console.log("✓ Validating input...");
    await registerSchema.validate(req.body, { abortEarly: false });
    console.log("✓ Validation passed");
  } catch (err) {
    console.log("❌ Validation failed:", err.errors);
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }

  const { email, password, name } = req.body;

  console.log("✓ Checking if user already exists...");
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("❌ User already exists:", email);
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  console.log("✓ User does not exist, creating...");
  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log("✓ User created successfully, ID:", newUser.id);

  // ✅ GUNAKAN DOMAIN PRODUCTION
  const appUrl = process.env.APP_URL || "https://gameboxd-backend.vercel.app";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const activationLink = `${appUrl}/api/auth/activate/${newUser.id}`;

  console.log("📧 Preparing activation email...");
  console.log("   From:", process.env.EMAIL_FROM);
  console.log("   To:", newUser.email);
  console.log("   Subject: Activate Your Account");
  console.log("   Link:", activationLink);

  const activationEmailTemplate = (name, activationLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your Account</title>
    </head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f7f7;padding:20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:10px;padding:30px;max-width:600px;">
              <tr>
                <td align="center">
                  <h2 style="color:#333;margin:0 0 20px 0;font-size:24px;">Welcome to Game Wishlist 🎉</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 0;">
                  <p style="margin:0 0 15px 0;color:#333;font-size:16px;">Hi <strong>${name}</strong>,</p>
                  <p style="margin:0 0 25px 0;color:#555;font-size:15px;">Please verify your email by clicking the button below:</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:20px 0;">
                  <a href="${activationLink}" 
                     style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                    Activate Your Account
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 0 0 0;">
                  <p style="margin:0;font-size:13px;color:#999;text-align:center;">If you did not request this, please ignore this email.</p>
                  <p style="margin:15px 0 0 0;font-size:12px;color:#999;text-align:center;">Or copy this link: <a href="${activationLink}" style="color:#4f46e5;word-break:break-all;">${activationLink}</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send activation email - MUST AWAIT in serverless environment
  console.log("🚀 Sending activation email...");

  try {
    const emailResult = await sendEmail(
      newUser.email,
      "Activate Your Account",
      activationEmailTemplate(newUser.name, activationLink),
    );

    if (emailResult.success) {
      console.log("✅ Email sent successfully to:", newUser.email);
      console.log("   Message ID:", emailResult.messageId);
    } else {
      console.error("❌ Email send failed:", emailResult.error);
      // Don't block registration if email fails, just log it
    }
  } catch (error) {
    console.error("❌ Error during email send:", error.message);
    // Don't block registration if email fails, just log it
  }

  console.log("=".repeat(60) + "\n");

  return res.status(201).json({
    success: true,
    message:
      "Register successful. Please check your email to activate your account.",
  });
});

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  email = email.trim().toLowerCase();
  password = password.trim();

  console.log("RAW EMAIL:", `"${req.body.email}"`);
  console.log("TRIMMED:", `"${req.body.email.trim()}"`);
  console.log("REQ BODY:", req.body);
  console.log("EMAIL:", req.body.email);
  console.log("PASSWORD:", req.body.password);
  console.log("BODY:", req.body);

  try {
    await loginSchema.validate(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is not activated. Please check your email.",
    });
  }

  delete user.password;

  const token = generateToken({ id: user.id });

  //set token in httpOnly cookie
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

export const logout = asyncHandler(async (req, res) => {
  // Since JWT is stateless, logout can be handled on the client side by deleting the token.
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const activateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ GUNAKAN FRONTEND URL
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Cari user
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  // Jika user tidak ditemukan
  if (!existingUser) {
    return res.send(`
      <h1>Invalid Activation Link</h1>
      <p>User does not exist.</p>
    `);
  }

  // Jika sudah aktif
  if (existingUser.isActive) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Already Activated</title>
        <style>
          body { font-family: Arial; text-align:center; padding:40px; background:#f7f7f7; }
          .card {
            background:#ffffff;
            padding:30px;
            border-radius:10px;
            max-width:450px;
            margin:auto;
            box-shadow:0 4px 12px rgba(0,0,0,0.1);
          }
          h2 { color:#4f46e5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Hello ${existingUser.name}! 👋</h2>
          <p>Your account is already activated.</p>
          <a href="${frontendUrl}/login"
            style="display:inline-block;margin-top:20px;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
            Go to Login
          </a>
        </div>
      </body>
      </html>
    `);
  }

  // Aktivasi akun
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
  });

  // Render halaman sukses
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Account Activated</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background:#f3f4f6; 
          padding:40px; 
          text-align:center;
        }
        .card {
          background:#ffffff;
          padding:35px;
          border-radius:12px;
          max-width:480px;
          margin:auto;
          box-shadow:0 4px 18px rgba(0,0,0,0.1);
        }
        h2 { 
          color:#4f46e5; 
          margin-bottom:10px; 
          font-size:26px;
        }
        p {
          color:#444;
          font-size:16px;
        }
        a {
          display:inline-block;
          margin-top:25px;
          padding:12px 24px;
          background:#4f46e5;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-size:16px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>🎉 Selamat ${user.name}! 🎉</h2>
        <p>Akun kamu berhasil diaktivasi.</p>
        <a href="${frontendUrl}/login">Login Sekarang</a>
      </div>
    </body>
    </html>
  `);
});

export const changeEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ GUNAKAN FRONTEND URL
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Cari user
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  // Jika user tidak ditemukan
  if (!existingUser) {
    return res.send(`
      <h1>Invalid Activation Link</h1>
      <p>User does not exist.</p>
    `);
  }
  // Jika tidak ada newEmail
  if (!existingUser.newEmail) {
    return res.send(`
      <h1>No Email Change Requested</h1>
      <p>There is no pending email change for this account.</p>
    `);
  }

  // Update email
  const user = await prisma.user.update({
    where: { id },
    data: { email: existingUser.newEmail, newEmail: null },
  });
  // Render halaman sukses simpel saja
  res.send(
    `<h1>Email Successfully Changed</h1>
     <p>Your email has been updated to ${user.email}.</p>
      <a href="${frontendUrl}/login">Go to Login</a>
     `,
  );
});
