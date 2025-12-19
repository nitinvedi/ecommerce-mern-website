import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";
import * as Order from "../models/Order.js";
import * as Repair from "../models/Repair.js";
import * as Wishlist from "../models/Wishlist.js";

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total orders
    const orders = await Order.getOrdersByUser(userId);
    const totalOrders = orders.length;

    // Get active repairs (not completed or cancelled)
    const db = getDB();
    const repairsCollection = db.collection("repairs");
    const activeRepairs = await repairsCollection.countDocuments({
      customer: new ObjectId(userId),
      status: { $nin: ["completed", "cancelled"] }
    });

    // Get wishlist count
    const wishlist = await Wishlist.getWishlistByUser(userId);
    const wishlistCount = wishlist?.products?.length || 0;

    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    // Account status (you can enhance this based on your logic)
    const accountStatus = req.user.isVerified ? "Verified" : "Active";

    res.json({
      totalOrders,
      activeRepairs,
      wishlistCount,
      totalSpent,
      accountStatus,
      userName: req.user.name
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ message: error.message || "Failed to get dashboard summary" });
  }
};

// Get user's orders with filters
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, startDate, endDate } = req.query;

    let orders = await Order.getOrdersByUser(userId);

    // Apply filters
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      orders = orders.filter(order => new Date(order.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      orders = orders.filter(order => new Date(order.createdAt) <= end);
    }

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: error.message || "Failed to get orders" });
  }
};

// Reorder (create new order from existing order)
export const reorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Get original order
    const originalOrder = await Order.getOrderById(orderId);

    if (!originalOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership
    if (originalOrder.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Create new order with same items
    const newOrderData = {
      user: userId,
      orderItems: originalOrder.orderItems,
      shippingAddress: originalOrder.shippingAddress,
      paymentMethod: originalOrder.paymentMethod,
      itemsPrice: originalOrder.itemsPrice,
      shippingPrice: originalOrder.shippingPrice,
      totalPrice: originalOrder.totalPrice
    };

    const newOrder = await Order.createOrder(newOrderData);

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ message: error.message || "Failed to reorder" });
  }
};

export default {
  getDashboardSummary,
  getMyOrders,
  reorder
};
