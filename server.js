import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ── CORS Fix — allow Netlify & localhost ──
app.use(
  cors({
    origin: [
      "https://arbajtechnologypvtltd.com",
      "https://www.arbajtechnologypvtltd.com",
      "https://arbajtechnology.netlify.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

// ── Health Check ──
app.get("/", (req, res) => {
  res.json({ status: "Server is running!" });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

// ── Nodemailer Transporter (Updated SMTP) ──
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Contact Form API ──
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      error: "Required fields missing",
    });
  }

  try {
    const mailOptions = {
      from: `"Arbaj Technology Website" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Service:</b> ${service || "Not specified"}</p>
        <p><b>Message:</b> ${message || "No message provided"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Email error:", err);

    res.status(500).json({
      success: false,
      error: "Email sending failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
