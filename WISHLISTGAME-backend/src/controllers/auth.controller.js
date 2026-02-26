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
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }

  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  // ✅ GUNAKAN DOMAIN PRODUCTION
  const appUrl = process.env.APP_URL || "https://gameboxd-backend.vercel.app";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const activationLink = `${appUrl}/api/auth/activate/${newUser.id}`;

  const activationEmailTemplate = (name, activationLink) => `
    <div style="font-family: Arial, sans-serif; background-color:#f7f7f7; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px;">
        <h2 style="text-align:center;">Welcome to Game Wishlist 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Please verify your email by clicking the button below:</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="${activationLink}"
             style="background:#4f46e5;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;">
            Activate Your Account
          </a>
        </div>
        <p style="font-size:13px;color:#999;">If you did not request this, ignore this email.</p>
      </div>
    </div>
  `;

  // ❗ JANGAN await
  sendEmail(
    newUser.email,
    "Activate Your Account",
    activationEmailTemplate(newUser.name, activationLink),
  );

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
