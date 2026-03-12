import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://arbajtechnologypvtltd.com",
      "https://www.arbajtechnologypvtltd.com",
      "https://arbajtechnology.netlify.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  }),
);

// health check
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    family: 4,
  },
});

// SMTP verify (debug)
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP Server Ready");
  }
});

// contact API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Required fields missing",
      });
    }

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
  } catch (error) {
    console.log("EMAIL ERROR:", error);

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
