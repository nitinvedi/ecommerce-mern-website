import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound, sendCreated } from "../utils/response.js";
import * as OrderModel from "../models/Order.js";
import * as ProductModel from "../models/Product.js";
import * as Notification from "../models/Notification.js";
import { ObjectId } from "mongodb";
import logger from "../utils/logger.js";
import { calculateTotal, calculateTax, calculateShipping } from "../config/payment.js";
import { emitOrderUpdate } from "../config/socket.js";

// Create order
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const orderData = {
    ...req.body,
    user: userId
  };

  // Validate Items
  if (!orderData.orderItems || orderData.orderItems.length === 0) {
    return sendError(res, "No order items", 400);
  }

  // Calculate prices if not provided
  if (!orderData.itemsPrice) {
    orderData.itemsPrice = orderData.orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  if (!orderData.shippingPrice) {
    orderData.shippingPrice = calculateShipping(orderData.itemsPrice);
  }

  if (!orderData.taxPrice) {
    orderData.taxPrice = calculateTax(orderData.itemsPrice);
  }

  if (!orderData.totalPrice) {
    orderData.totalPrice = calculateTotal(
      orderData.itemsPrice,
      orderData.shippingPrice
    );
  }

  // Deduction Logic with Rollback
  const deductedItems = [];
  try {
    for (const item of orderData.orderItems) {
      const result = await ProductModel.reduceStock(item.product, item.quantity);
      if (!result) {
        throw new Error(`Product ${item.name} is out of stock or insufficient quantity`);
      }
      deductedItems.push(item);
    }
  } catch (error) {
    // Rollback deducted items
    await Promise.all(
      deductedItems.map(item => ProductModel.increaseStock(item.product, item.quantity))
    );
    return sendError(res, error.message, 400);
  }

  const order = await OrderModel.createOrder(orderData);
  
  // Create notification for admin about new order
  const { getDB } = await import("../config/mongo.js");
  const db = getDB();
  const admin = await db.collection("users").findOne({ role: "admin" });
  
  if (admin) {
    const adminNotification = await Notification.createNotification({
      user: admin._id,
      type: "order",
      title: "New Order Received! 🛒",
      message: `Order #${order._id.toString().slice(-8)} placed by ${req.user.name}`,
      data: { orderId: order._id, customerId: userId }
    });

    // Emit real-time notification to admin
    const { emitAdminNotification } = await import("../socket/socketHandler.js");
    emitAdminNotification(adminNotification);
  }
  
  // Emit socket event for new order
  emitOrderUpdate(order._id.toString(), {
    status: order.status,
    message: "Order created successfully"
  });
  
  return sendCreated(res, "Order created successfully", order);
});

// Get my orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const orders = await OrderModel.getOrdersByUser(userId);
  return sendSuccess(res, "Orders retrieved successfully", orders);
});

// Get all orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  
  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await OrderModel.getAllOrders(filter);
  return sendSuccess(res, "Orders retrieved successfully", orders);
});

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const order = await OrderModel.getOrderById(id);

  if (!order) {
    return sendNotFound(res, "Order");
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== userId && userRole !== "admin") {
    return sendError(res, "Not authorized to view this order", 403);
  }

  return sendSuccess(res, "Order retrieved successfully", order);
});

// Update order
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderModel.getOrderById(id); // Fetch current order to check its status
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if status is changing to Cancelled
    if (status === "Cancelled" && order.status !== "Cancelled") {
      await Promise.all(
        order.orderItems.map(item => ProductModel.increaseStock(item.product, item.quantity))
      );
      logger.info(`Restocked items for cancelled order ${id}`);
    }

    const updatedOrder = await OrderModel.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create notification for customer when status changes
    const statusMessages = {
      Processing: {
        title: "Order Processing",
        message: `Your order #${id.slice(-8)} is now being processed`
      },
      Shipped: {
        title: "Order Shipped! 📦",
        message: `Great news! Your order #${id.slice(-8)} has been shipped and is on its way`
      },
      Delivered: {
        title: "Order Delivered ✅",
        message: `Package delivered! Enjoy your purchase from order #${id.slice(-8)}`
      },
      Cancelled: {
        title: "Order Cancelled ❌",
        message: `Order #${id.slice(-8)} has been cancelled. Refund will be processed soon.`
      }
    };

    // Normalize status to match keys (backend enums are capitalizing, usually)
    // The validation in Order.js expects 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    
    const msgStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // Ensure title case

    if (statusMessages[status] || statusMessages[msgStatus]) {
      const msg = statusMessages[status] || statusMessages[msgStatus];
      const notification = await Notification.createNotification({
        user: updatedOrder.user,
        type: "order",
        title: msg.title,
        message: msg.message,
        data: { orderId: id, status }
      });

      // Emit real-time notification via Socket.IO
      const { emitNotification } = await import("../socket/socketHandler.js");
      emitNotification(updatedOrder.user.toString(), notification);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const order = await OrderModel.getOrderById(id);

  if (!order) {
    return sendNotFound(res, "Order");
  }

  // Check authorization
  if (order.user.toString() !== userId && userRole !== "admin") {
    return sendError(res, "Not authorized to update this order", 403);
  }

  // Check for cancellation and restocking
  if (req.body.status === "Cancelled" && order.status !== "Cancelled") {
    await Promise.all(
      order.orderItems.map(item => ProductModel.increaseStock(item.product, item.quantity))
    );
    logger.info(`Restocked items for cancelled order ${id}`);
  }

  const result = await OrderModel.updateOrder(id, req.body);

  if (result.modifiedCount === 0) {
    return sendError(res, "Order not updated", 400);
  }

  const updatedOrder = await OrderModel.getOrderById(id);
  
  // Emit socket event if status changed
  if (req.body.status) {
    emitOrderUpdate(id, {
      status: req.body.status,
      message: "Order status updated"
    });

    // Send notification to customer when status changes
    const statusMessages = {
      processing: {
        title: "Order Processing",
        message: `Your order #${id.slice(-8)} is now being processed`
      },
      shipped: {
        title: "Order Shipped! 📦",
        message: `Great news! Your order #${id.slice(-8)} has been shipped and is on its way`
      },
      delivered: {
        title: "Order Delivered ✅",
        message: `Your order #${id.slice(-8)} has been delivered. Enjoy your purchase!`
      },
      cancelled: {
        title: "Order Cancelled",
        message: `Your order #${id.slice(-8)} has been cancelled`
      }
    };

    if (statusMessages[req.body.status]) {
      const notification = await Notification.createNotification({
        user: order.user,
        type: "order",
        title: statusMessages[req.body.status].title,
        message: statusMessages[req.body.status].message,
        data: { orderId: id, status: req.body.status }
      });

      // Emit real-time notification via Socket.IO
      const { emitNotification } = await import("../socket/socketHandler.js");
      emitNotification(order.user.toString(), notification);
      
      console.log(`✅ Notification sent to user ${order.user} for order ${id}`);
    }
  }
  
  return sendSuccess(res, "Order updated successfully", updatedOrder);
});

// Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const order = await OrderModel.getOrderById(id);

  if (!order) {
    return sendNotFound(res, "Order");
  }

  // Check authorization
  if (order.user.toString() !== userId && userRole !== "admin") {
    return sendError(res, "Not authorized to delete this order", 403);
  }

  await OrderModel.deleteOrder(id);
  return sendSuccess(res, "Order deleted successfully");
});

