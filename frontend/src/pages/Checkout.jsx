import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  Truck,
  ShieldCheck,
  Banknote,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowLeft
} from "lucide-react";
import { api, API_ENDPOINTS, SOCKET_URL } from "../config/api.js";
import { validate, validateForm } from "../utils/validation.js";
import { useCart } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import CheckoutProgress from "../components/CheckoutProgress.jsx";

// ... (keeping imports)

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [errors, setErrors] = useState({});

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zip: user?.address?.zip || "",
    phone: user?.phone || ""
  });

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18;
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleRazorpayPayment = async (orderPayload) => {
    try {
      // 1. Create Razorpay Order
      const response = await api.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
        amount: orderPayload.totalPrice
      });

      const order = response.data;

      if (!order) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Ram Mobile Store",
        description: "Purchase Transaction",
        image: "/logo1.png",
        order_id: order.id,
        handler: async function (response) {
          // Payment Success
          try {
            // Verify Payment on Backend
            const verifyRes = await api.post(API_ENDPOINTS.PAYMENT.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (!verifyRes.success) {
              console.error("Verification failed data:", verifyRes);
              throw new Error("Payment verification failed on backend");
            }
            console.log("Payment verified, creating order...");

            const finalOrderData = {
              ...orderPayload,
              paymentMethod: "Razorpay",
              paymentResult: {
                id: response.razorpay_payment_id,
                status: "completed",
                email_address: user.email,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              isPaid: true,
              paidAt: new Date(),
              status: "Processing"
            };

            const res = await api.post(API_ENDPOINTS.ORDERS.BASE, finalOrderData);
            console.log("Order created successfully:", res.data);
            toast.success("Payment Successful! Order Placed.");
            clearCart();
            navigate(`/orders/${res.data._id}`);

          } catch (err) {
            console.error("Order Creation Error Full:", err);
            const msg = err.response?.data?.message || err.message || "Order creation failed";
            toast.error(`Order Failed: ${msg}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#2563EB"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast.error(response.error.description || "Payment Failed");
        setLoading(false);
      });
      rzp1.open();

    } catch (err) {
      console.error("Payment initiation error:", err);
      console.error("Error response:", err.response);
      toast.error(err.response?.data?.message || err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const schema = {
      fullName: validate.name,
      address: (v) => validate.required(v, "Address"),
      city: (v) => validate.required(v, "City"),
      state: (v) => validate.required(v, "State"),
      zip: validate.pincode,
      phone: validate.phone
    };

    const { isValid, errors: newErrors } = validateForm(shippingAddress, schema);
    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fix errors in address");
      return;
    }

    setLoading(true);

    const orderData = {
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0] || ""
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      shippingPrice: shipping,
      totalPrice: total
    };

    if (paymentMethod === "Razorpay") {
      await handleRazorpayPayment(orderData);
    } else {
      try {
        const res = await api.post(API_ENDPOINTS.ORDERS.BASE, orderData);
        toast.success("Order placed successfully");
        clearCart();
        navigate(`/orders/${res.data.data._id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to place order");
      } finally {
        setLoading(false);
      }
    }
  };

  const paymentOptions = [
    { id: "Cash on Delivery", icon: Banknote, label: "Cash on Delivery", sub: "Pay when you receive" },
    { id: "Razorpay", icon: CreditCard, label: "Online Payment", sub: "Card, UPI, Net Banking" },
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <button
          onClick={() => navigate('/cart')}
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:bg-gray-100 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Cart
        </button>

        <div className="mb-12">
          <CheckoutProgress currentStep={2} />
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">

          {/* LEFT: Forms */}
          <div className="lg:col-span-2 space-y-8">

            {/* Address Section */}
            <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.fullName ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.phone ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    required
                    placeholder="Flat No, Building, Street"
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.address ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    required
                    placeholder="New York"
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.city ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleChange}
                      required
                      placeholder="NY"
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.state ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP / Postal</label>
                    <input
                      name="zip"
                      value={shippingAddress.zip}
                      onChange={handleChange}
                      required
                      placeholder="10001"
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ${errors.zip ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                    />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-500">Select how you'd like to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${paymentMethod === option.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <option.icon size={28} className={paymentMethod === option.id ? 'text-blue-600' : 'text-gray-400'} />
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{option.label}</div>
                      <div className="text-[10px] text-gray-500">{option.sub}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                      {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-[380px]">
            <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Order Summary
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{cartItems.length} items</span>
              </h3>

              {/* Items Mini List */}
              <div className="max-h-60 overflow-y-auto pr-2 mb-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.images?.[0]?.startsWith("http") ? item.images[0] : `${SOCKET_URL}${item.images[0]}`}
                      className="w-12 h-12 bg-gray-50 rounded-lg object-contain p-1 border border-gray-100"
                      alt=""
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-800/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={18} /> Pay ₹{total.toLocaleString()}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-600" />
                Secure SSL Encrypted Transaction
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
