import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { sendEmail } from "../services/emailService.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

   
    const verificationCode = Math.random().toString(36).substring(2, 15);

    user = new User({
      name,
      email,
      password: hashedPassword,
      profileImage,
      isVerified: false,
      verificationCode,
    });

    await user.save();

    const verifyUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/auth/verify/${verificationCode}`;
    const html = `<p>Hi ${name},</p><p>Click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`;
    await sendEmail(email, "Verify your email", html);

    res.status(201).json({ msg: "User registered, check your email for verification link" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ verificationCode: code });

    if (!user) return res.status(400).json({ msg: "Invalid or expired verification code" });

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) return res.status(400).json({ msg: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Login successful", token });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
