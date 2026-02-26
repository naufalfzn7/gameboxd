import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465; // 465 uses implicit TLS, 587 uses STARTTLS

// Log email configuration on startup (hide sensitive data)
console.log("📧 Email Configuration:", {
  host: process.env.EMAIL_HOST,
  port,
  secure,
  user: process.env.EMAIL_USER
    ? "***" + process.env.EMAIL_USER.slice(-10)
    : "NOT SET",
  from: process.env.EMAIL_FROM,
});

export const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 2000, // Rate limit: 1 message per 2 seconds
    rateLimit: true,
  },
  connectionTimeout: 5000,
  socketTimeout: 10000,
});

// Test connection on startup
transport.verify((error, success) => {
  if (error) {
    console.error("❌ Email transport verification failed:", error.message);
  } else {
    console.log("✅ Email transport ready");
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    // Validate email configuration
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      throw new Error(
        "Email configuration incomplete. Check EMAIL_HOST, EMAIL_USER, EMAIL_PASS",
      );
    }

    console.log(
      "📧 Sending email to:",
      to,
      "via",
      process.env.EMAIL_HOST + ":" + port,
    );

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to,
      subject,
      response: info.response,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      details: error,
    });

    return { success: false, error: error.message };
  }
};
