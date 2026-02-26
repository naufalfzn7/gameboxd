import { prisma } from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as yup from "yup";
import { hashPassword } from "../utils/encrypt.js";
import { sendEmail } from "../utils/mail.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
// Schema khusus user update dirinya sendiri
const userUpdateSchema = yup.object({
  name: yup.string().min(2).max(50).required(),
  password: yup
    .string()
    .min(6)
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character",
    )
    .optional(),
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id; // lebih aman
  const { name, password, email } = req.body;

  // Validasi input
  try {
    await userUpdateSchema.validate(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (password) dataToUpdate.password = await hashPassword(password);

  // Jika email diubah
  let emailActivationRequired = false;
  if (email && email !== req.user.email) {
    // set email baru & inactive dulu
    dataToUpdate.newEmail = email;
    emailActivationRequired = true;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Jika email diubah, kirim email aktivasi
  if (emailActivationRequired) {
    const appUrl = process.env.APP_URL || "https://gameboxd-backend.vercel.app";
    const activationLink = `${appUrl}/api/auth/changeEmail/${userId}`;

    const activationEmailTemplate = (name, activationLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activate Your New Email</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f7f7f7;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f7f7;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:10px;padding:30px;max-width:600px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <tr>
                  <td align="center">
                    <h2 style="color:#333;margin:0 0 20px 0;font-size:24px;">Activate Your New Email 🎉</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 0;">
                    <p style="margin:0 0 15px 0;color:#444;font-size:16px;">Hi <strong>${name}</strong>,</p>
                    <p style="margin:0 0 25px 0;color:#555;font-size:15px;">You updated your email. Please verify it by clicking the button below.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="${activationLink}" 
                       style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                      Activate Email
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 0;">
                    <p style="margin:0 0 10px 0;color:#666;font-size:14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                    <p style="margin:0;background-color:#f3f4f6;padding:12px;border-radius:6px;word-break:break-all;font-size:14px;color:#333;">
                      ${activationLink}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 0 0 0;border-top:1px solid #e5e7eb;">
                    <p style="margin:10px 0 0 0;font-size:13px;color:#999;text-align:center;">If you did not change your email, please ignore this email.</p>
                    <p style="margin:10px 0 0 0;font-size:12px;color:#999;text-align:center;">© ${new Date().getFullYear()} Game Wishlist. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email - MUST AWAIT in serverless environment
    try {
      const emailResult = await sendEmail(
        email,
        "Activate Your New Email",
        activationEmailTemplate(updatedUser.name, activationLink),
      );

      if (emailResult.success) {
        console.log("✅ Email change verification sent to:", email);
      } else {
        console.error(
          "❌ Failed to send email change verification:",
          emailResult.error,
        );
      }
    } catch (error) {
      console.error(
        "Failed to send email change verification to",
        email,
        ":",
        error,
      );
    }
  }

  res.status(200).json({
    success: true,
    data: updatedUser,
    message: emailActivationRequired
      ? "Email updated. Please activate your new email to continue using your account."
      : "Profile updated successfully.",
  });
});

// Schema khusus admin (lebih fleksibel)
const adminUpdateSchema = yup.object({
  name: yup.string().min(2).max(50).optional(),
  password: yup
    .string()
    .min(6)
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character",
    )
    .optional(),
  role: yup.string().optional(),
  isActive: yup.boolean().optional(),
});
export const updateUserAsAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await adminUpdateSchema.validate(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }

  const { name, role, isActive, password } = req.body;

  const dataToUpdate = { name, role, isActive };

  if (password) {
    dataToUpdate.password = await hashPassword(password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const users = await prisma.user.findMany({
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   res.status(200).json({
//     success: true,
//     data: users,
//   });
// });

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const skip = (page - 1) * limit;

  // filter search
  const whereCondition = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { role: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  // ambil data
  const users = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // total data (untuk hitung total halaman)
  const totalUsers = await prisma.user.count({
    where: whereCondition,
  });

  res.status(200).json({
    success: true,
    data: users,
    meta: {
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
export const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
