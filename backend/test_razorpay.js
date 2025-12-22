
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);

try {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "test",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "test",
    });
    console.log("Razorpay instance created successfully");
} catch (error) {
    console.error("Error creating Razorpay instance:", error);
}
