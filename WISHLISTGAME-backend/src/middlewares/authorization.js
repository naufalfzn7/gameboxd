import { prisma } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware autentikasi.
 * Mendukung token dari cookie httpOnly atau header Authorization.
 */
export const authentication = async (req, res, next) => {
  try {
    // Ambil token dari cookie atau header
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no token provided",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: token expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Unauthorized: invalid token",
      });
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true, // bisa tambah field lain sesuai kebutuhan
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is not activated",
      });
    }

    // Simpan user dan token di request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error("Authentication middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware otorisasi berbasis role.
 * @param {...string} roles - daftar role yang diizinkan
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no user info",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
