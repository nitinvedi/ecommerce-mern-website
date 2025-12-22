import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "orders";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
export const validateOrder = (orderData) => {
  const errors = [];

  if (!orderData.user) {
    errors.push("User is required");
  }

  if (!orderData.orderItems || !Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
    errors.push("Order items are required");
  } else {
    orderData.orderItems.forEach((item, index) => {
      if (!item.product) errors.push(`Order item ${index + 1}: Product is required`);
      if (!item.name) errors.push(`Order item ${index + 1}: Name is required`);
      if (!item.quantity || item.quantity < 1) errors.push(`Order item ${index + 1}: Valid quantity is required`);
      if (!item.price || item.price < 0) errors.push(`Order item ${index + 1}: Valid price is required`);
    });
  }

  if (!orderData.shippingAddress) {
    errors.push("Shipping address is required");
  } else {
    const { fullName, address, city, state, zip, phone } = orderData.shippingAddress;
    if (!fullName) errors.push("Shipping address: Full name is required");
    if (!address) errors.push("Shipping address: Address is required");
    if (!city) errors.push("Shipping address: City is required");
    if (!state) errors.push("Shipping address: State is required");
    if (!zip) errors.push("Shipping address: Zip is required");
    if (!phone) errors.push("Shipping address: Phone is required");
  }

  const validPaymentMethods = ['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Razorpay'];
  if (!orderData.paymentMethod || !validPaymentMethods.includes(orderData.paymentMethod)) {
    errors.push("Valid payment method is required");
  }

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (orderData.status && !validStatuses.includes(orderData.status)) {
    errors.push("Invalid order status");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create order
export const createOrder = async (orderData) => {
  const validation = validateOrder(orderData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const order = {
    user: typeof orderData.user === 'string' ? new ObjectId(orderData.user) : orderData.user,
    orderItems: orderData.orderItems.map(item => ({
      product: typeof item.product === 'string' ? new ObjectId(item.product) : item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image || ''
    })),
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    paymentResult: orderData.paymentResult || null,
    itemsPrice: orderData.itemsPrice || 0.0,
    taxPrice: orderData.taxPrice || 0.0,
    shippingPrice: orderData.shippingPrice || 0.0,
    totalPrice: orderData.totalPrice || 0.0,
    isPaid: orderData.isPaid || false,
    paidAt: orderData.paidAt || null,
    isDelivered: orderData.isDelivered || false,
    deliveredAt: orderData.deliveredAt || null,
    status: orderData.status || 'Pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const collection = getCollection();
  const result = await collection.insertOne(order);
  return { ...order, _id: result.insertedId };
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(orderId) });
};

// Get orders by user
export const getOrdersByUser = async (userId) => {
  const collection = getCollection();
  return await collection.find({ user: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
};

// Get all orders
export const getAllOrders = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find(filter).sort({ createdAt: -1 }).toArray();
};

// Update order
export const updateOrder = async (orderId, updateData) => {
  const collection = getCollection();
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };

  // Convert user and product IDs if they exist
  if (updateDoc.user && typeof updateDoc.user === 'string') {
    updateDoc.user = new ObjectId(updateDoc.user);
  }

  if (updateDoc.orderItems) {
    updateDoc.orderItems = updateDoc.orderItems.map(item => ({
      ...item,
      product: typeof item.product === 'string' ? new ObjectId(item.product) : item.product
    }));
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(orderId) },
    { $set: updateDoc }
  );
  return result;
};

// Delete order
export const deleteOrder = async (orderId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(orderId) });
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const updateData = { status, updatedAt: new Date() };

  if (status === 'Delivered') {
    updateData.isDelivered = true;
    updateData.deliveredAt = new Date();
  }

  return await updateOrder(orderId, updateData);
};

// Mark order as paid
export const markOrderAsPaid = async (orderId, paymentResult = null) => {
  return await updateOrder(orderId, {
    isPaid: true,
    paidAt: new Date(),
    paymentResult
  });
};

export default {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  markOrderAsPaid,
  validateOrder
};
