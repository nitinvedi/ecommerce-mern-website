// Payment Gateway Configuration

// Razorpay Configuration (for Indian payments)
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  enabled: process.env.RAZORPAY_ENABLED === "true"
};

// Stripe Configuration (for international payments)
export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  enabled: process.env.STRIPE_ENABLED === "true"
};

// PayPal Configuration
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  mode: process.env.PAYPAL_MODE || "sandbox", // sandbox or live
  enabled: process.env.PAYPAL_ENABLED === "true"
};

// Payment Configuration
export const paymentConfig = {
  // Default payment method
  defaultMethod: process.env.DEFAULT_PAYMENT_METHOD || "Cash on Delivery",
  
  // Currency
  currency: process.env.PAYMENT_CURRENCY || "INR",
  
  // Tax configuration
  taxRate: parseFloat(process.env.TAX_RATE) || 0.18, // 18% GST
  
  // Shipping charges
  shippingCharges: {
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 500,
    standardShipping: parseFloat(process.env.STANDARD_SHIPPING_CHARGE) || 50,
    expressShipping: parseFloat(process.env.EXPRESS_SHIPPING_CHARGE) || 100
  },
  
  // Payment gateways
  razorpay: razorpayConfig,
  stripe: stripeConfig,
  paypal: paypalConfig,
  
  // Enable/Disable
  enabled: process.env.PAYMENT_ENABLED !== "false"
};

// Calculate shipping charges
export const calculateShipping = (orderTotal) => {
  if (orderTotal >= paymentConfig.shippingCharges.freeShippingThreshold) {
    return 0;
  }
  return paymentConfig.shippingCharges.standardShipping;
};

// Calculate tax
export const calculateTax = (subtotal) => {
  return subtotal * paymentConfig.taxRate;
};

// Calculate total
export const calculateTotal = (subtotal, shipping = 0) => {
  const tax = calculateTax(subtotal);
  return subtotal + tax + shipping;
};

export default paymentConfig;

