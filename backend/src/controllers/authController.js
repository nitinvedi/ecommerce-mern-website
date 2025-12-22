import crypto from "crypto";
import {
    createUser,
    getUserByEmail,
    matchPassword,
    getUserByResetToken,
    getUserByIdWithPassword,
    updatePassword
} from "../models/User.js";
import { generateToken } from "../config/jwt.js";
import { sendSuccess, sendError, sendCreated } from "../utils/response.js";
import logger from "../utils/logger.js";
import { OAuth2Client } from "google-auth-library";
import { getDB } from "../config/mongo.js";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, termsAgreed } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        // 1. Strict Terms Validation
        if (termsAgreed !== true) {
            return res.status(400).json({ message: "You must agree to the Terms and Conditions" });
        }

        // 2. Strong Password Validation
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        // Regex: 
        // (?=.*[a-z]) -> at least one lower
        // (?=.*[A-Z]) -> at least one upper
        // (?=.*\d)    -> at least one digit
        // (?=.*[\W_]) -> at least one special char (non-word or underscore)
        // .{8,}       -> at least 8 chars total
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const createdUser = await createUser({
            name,
            email,
            password
        });

        const token = generateToken({ id: createdUser._id.toString(), role: createdUser.role });

        return sendCreated(res, "Signup successful", {
            token,
            user: createdUser
        });

    } catch (err) {
        logger.error("Registration error", err);
        const message = err.message || "Server error";
        const isValidationError = err.message && err.message !== "Server error";
        return sendError(res, message, isValidationError ? 400 : 500);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, "Email and password are required", 400);
        }

        // Get user with password
        const user = await getUserByEmail(email, true);

        if (!user || !user.password) {
            return sendError(res, "Invalid credentials", 401);
        }

        // Check password
        const isMatch = await matchPassword(password, user.password);

        if (!isMatch) {
            return sendError(res, "Invalid credentials", 401);
        }

        // Generate token
        const token = generateToken({ id: user._id.toString(), role: user.role });

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return sendSuccess(res, "Login successful", {
            token,
            user: userWithoutPassword
        });

    } catch (err) {
        logger.error("Login error", err);
        return sendError(res, "Server error", 500);
    }
};


// Change password (authenticated)
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, "Current and new password are required", 400);
        }

        const user = await getUserByIdWithPassword(userId);
        if (!user || !user.password) {
            return sendError(res, "User not found", 404);
        }

        const isMatch = await matchPassword(currentPassword, user.password);
        if (!isMatch) {
            return sendError(res, "Current password is incorrect", 401);
        }

        await updatePassword(userId, newPassword);
        return sendSuccess(res, "Password updated successfully");
    } catch (err) {
        logger.error("Change password error", err);
        return sendError(res, "Server error", 500);
    }
};

// Forgot password (request reset)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendError(res, "Email is required", 400);
        }

        const user = await getUserByEmail(email, true);
        if (!user) {
            return sendSuccess(res, "If an account exists, a reset link has been generated");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const db = getDB();
        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: expires,
                    updatedAt: new Date()
                }
            }
        );

        return sendSuccess(res, "Reset token generated", { resetToken, expires });
    } catch (err) {
        logger.error("Forgot password error", err);
        return sendError(res, "Server error", 500);
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return sendError(res, "Token and new password are required", 400);
        }

        const user = await getUserByResetToken(token);
        if (!user) {
            return sendError(res, "Invalid or expired token", 400);
        }

        await updatePassword(user._id.toString(), newPassword);
        return sendSuccess(res, "Password reset successful");
    } catch (err) {
        logger.error("Reset password error", err);
        return sendError(res, "Server error", 500);
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential)
            return res.status(400).json({ success: false, message: "No credential provided" });

        // 🔍 Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Prefer model helpers to keep validation consistent
        let user = await getUserByEmail(payload.email, true);
        const db = getDB();
        const usersCollection = db.collection("users");

        if (user) {
            // User exists: Update googleId and picture if missing or changed (Sync Profile)
            const updates = {};
            if (!user.googleId) updates.googleId = payload.sub; // Link account
            if (user.picture !== payload.picture) updates.picture = payload.picture; // Sync Avatar

            if (Object.keys(updates).length > 0) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { ...updates, updatedAt: new Date() } }
                );
                // Update local user object to reflect changes immediately
                if (updates.googleId) user.googleId = updates.googleId;
                if (updates.picture) user.picture = updates.picture;
            }
        } else {
            // Create a lightweight user record for Google sign-in
            const result = await usersCollection.insertOne({
                name: payload.name,
                email: payload.email.toLowerCase().trim(),
                picture: payload.picture,
                googleId: payload.sub,
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date()
            });

            user = {
                _id: result.insertedId,
                name: payload.name,
                email: payload.email
            };
        }

        // generate app token via existing JWT helper
        const token = generateToken({ id: user._id.toString(), role: user.role });

        return res.json({
            success: true,
            message: "Google Login Success",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Google Login Detailed Error:", {
            message: err.message,
            stack: err.stack,
            configuredClientId: process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing"
        });
        res.status(500).json({
            success: false,
            message: "Google login failed",
            debug: err.message // Temporary: sending error to frontend for debugging
        });
    }
};
