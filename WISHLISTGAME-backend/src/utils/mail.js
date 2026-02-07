import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465; // 465 uses implicit TLS, 587 uses STARTTLS

export const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    console.log(
      "📧 Sending email to:",
      to,
      "via",
      process.env.EMAIL_HOST,
      port
    );

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
  }
};
