import jwt from "jsonwebtoken";
import { createUser, getUserByEmail, matchPassword } from "../models/User.js";
import { generateToken } from "../config/jwt.js";
import { sendSuccess, sendError, sendCreated } from "../utils/response.js";
import logger from "../utils/logger.js";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const createdUser = await createUser({
            name,
            email,
            password
        });

        const token = generateToken({ id: createdUser._id.toString() });

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
        const token = generateToken({ id: user._id.toString() });

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

        const db = getDB();
        const usersCollection = db.collection("users");

        // check existing user
        let user = await usersCollection.findOne({ email: payload.email });

        // if new user → create in DB
        if (!user) {
            user = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                googleId: payload.sub,
                createdAt: new Date()
            };

            await usersCollection.insertOne(user);
        }

        // generate app token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

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
        console.error("Google Login Error:", err);
        res.status(500).json({ success: false, message: "Google login failed" });
    }
};
