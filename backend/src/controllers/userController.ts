import { Request, Response, RequestHandler } from 'express'
import User from '../models/User'
import bcrypt from 'bcrypt';

export const me: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).userId;
        const user = await User.findById(userId).select("-passwordHash -refreshTokens");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const updateLocation: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).userId;
        const lng = req.body.lng ?? req.body.longitude;
        const lat = req.body.lat ?? req.body.latitude;

        if (typeof lng !== 'number' || typeof lat !== 'number') {
            return res.status(400).json({ message: "Invalid coordinates" });
        }

        const user = await User.findByIdAndUpdate(userId, {
            lastLocation: { type: "Point", coordinates: [lng, lat] }
        }, {
            new: true
        }).select("-passwordHash -refreshTokens");
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const updateProfile: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { name, currentPassword, newPassword } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Name is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update name
        user.name = name.trim();

        // If changing password
        if (currentPassword && newPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

            if (!isValidPassword) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.passwordHash = hashedPassword;
        }

        await user.save();

        // Return user without sensitive fields
        const userResponse: any = user.toObject();
        delete userResponse.passwordHash;
        delete userResponse.refreshTokens;

        res.json({
            success: true,
            user: userResponse
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: "Server Error" });
    }
}
