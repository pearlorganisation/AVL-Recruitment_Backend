import bcrypt from "bcrypt";
import User from "./auth.model.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.js";
import crypto from "crypto";


//Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email already registered",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const verificationToken =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpire:
        Date.now() + 15 * 60 * 1000,
    });

    const verifyUrl =
      `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Email",
      html: `
    <h2>Email Verification</h2>
    <p>Please verify your email</p>
    <a href="${verifyUrl}">
      Verify Email
    </a>
  `,
    });

    return res.status(201).json({
      success: true,
      message:
        "Verification email sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Verify Email
export const verifyEmail = async (
  req,
  res
) => {
  try {
    const { token } = req.params;

    const user =
      await User.findOne({
        verificationToken: token,
        verificationTokenExpire: {
          $gt: Date.now(),
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire =
      null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password required",
      });
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }



    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Please verify your email first",
      });
    }

    const accessToken =
      generateAccessToken(user);

    const refreshToken =
      generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Refresh and Rotate Token Controller
export const refreshAccessToken = async (
  req,
  res
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(
      decoded.id
    );

    if (
      !user ||
      user.refreshToken !== refreshToken
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken =
      generateAccessToken(user);

    const newRefreshToken =
      generateRefreshToken(user);

    user.refreshToken =
      newRefreshToken;

    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token expired",

    });
  }
};

//Log out
export const logoutUser = async (
  req,
  res
) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      {
        refreshToken: null,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};