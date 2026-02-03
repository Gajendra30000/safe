import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, lat, lng } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields (name, email and password are required)" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userData: any = { name, email, passwordHash };

    if (typeof lat === "number" && typeof lng === "number") {
      userData.lastLocation = { type: "Point", coordinates: [lng, lat] };
    }

    const user = await User.create(userData);

    const accessToken = generateAccessToken(user._id.toString());
    const tokenId = randomBytes(16).toString("hex");
    const refreshToken = generateRefreshToken(user._id.toString(), tokenId);

    user.refreshTokens.push(tokenId);
    await user.save();

    res.cookie("jid", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });

  } catch (err: any) {
    console.error("Signup error:", err?.stack || err);

    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message).join('; ');
      return res.status(400).json({ message: messages || 'Validation error' });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id.toString());
    const tokenId = randomBytes(16).toString("hex");
    const refreshToken = generateRefreshToken(user._id.toString(), tokenId);

    user.refreshTokens.push(tokenId);
    await user.save();

    res.cookie("jid", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err: any) {
    console.error("Login error:", err?.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const payload = (await import("jsonwebtoken")).verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    const { userId, tokenId } = payload;

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Invalid refresh token (user not found)" });

    if (!user.refreshTokens.includes(tokenId)) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    user.refreshTokens = user.refreshTokens.filter(t => t !== tokenId);
    const newTokenId = randomBytes(16).toString("hex");
    user.refreshTokens.push(newTokenId);
    await user.save();

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString(), newTokenId);

    res.cookie("jid", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error("Refresh error:", err?.stack || err);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(200).json({ message: "Already logged out" });

    const payload = (await import("jsonwebtoken")).verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    const { userId, tokenId } = payload;

    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== tokenId);
      await user.save();
    }

    res.clearCookie("jid", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.clearCookie("jid", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out" });
  }
}
