import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://arbajtechnologypvtltd.com",
      "https://www.arbajtechnologypvtltd.com",
      "https://arbajtechnology.netlify.app",
      "http://localhost:5173",
      "https://arbaj-website-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(express.json());




// app.options("/(*)", cors());
// Resend setup
const resend = new Resend(process.env.RESEND_API_KEY);

// health check
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.get("/health", (req, res) => {
  res.send("OK");
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

    const { data, error } = await resend.emails.send({
      from: "Arbaj Technology <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL,
      subject: `New Inquiry from ${name}`,
      html: `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
     
      <p><b>Message:</b> ${message || "No message provided"}</p>
      `,
    });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Email sent successfully",
      id: data.id,
    });
  } catch (err) {
    console.log("EMAIL ERROR:", err);

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
