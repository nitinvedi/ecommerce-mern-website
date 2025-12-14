import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound, sendCreated } from "../utils/response.js";
import * as OrderModel from "../models/Order.js";
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

  const order = await OrderModel.createOrder(orderData);
  
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

