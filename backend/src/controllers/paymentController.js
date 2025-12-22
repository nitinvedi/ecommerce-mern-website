import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Initialize Razorpay
// checking if env vars are present handled by validation or runtime error if missing
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return sendError(res, "Amount is required", 400);
  }

  const instance = getRazorpayInstance();

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    console.log("Creating Razorpay order with amount:", options.amount);
    const order = await instance.orders.create(options);
    console.log("Razorpay order created:", order.id);
    // We send back the order details which contains the id
    sendSuccess(res, "Razorpay order created", order);
  } catch (error) {
    console.error("Razorpay Order Creation Error Full:", JSON.stringify(error, null, 2));
    const errorMessage = error.error?.description || error.message || "Unknown Razorpay error";
    sendError(res, "Failed to create Razorpay order: " + errorMessage, 500, errorMessage);
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, "Missing payment details", 400);
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return sendSuccess(res, "Payment verified successfully", {
      valid: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } else {
    return sendError(res, "Invalid signature", 400);
  }
});
