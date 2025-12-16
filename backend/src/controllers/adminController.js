import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound } from "../utils/response.js";
import * as UserModel from "../models/User.js";
import * as OrderModel from "../models/Order.js";
import * as ProductModel from "../models/Product.js";
import * as RepairModel from "../models/Repair.js";
import * as TechnicianModel from "../models/Technician.js";
import logger from "../utils/logger.js";
import { emitOrderUpdate, emitRepairUpdate } from "../config/socket.js";

// Get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalRepairs,
    pendingRepairs,
    completedRepairs
  ] = await Promise.all([
    UserModel.getAllUsers().then(users => users.length),
    OrderModel.getAllOrders().then(orders => orders.length),
    ProductModel.getAllProducts().then(products => products.length),
    RepairModel.getAllRepairs().then(repairs => repairs.length),
    RepairModel.getAllRepairs({ status: "Pending" }).then(repairs => repairs.length),
    RepairModel.getAllRepairs({ status: "Completed" }).then(repairs => repairs.length)
  ]);

  // Calculate revenue from orders
  const orders = await OrderModel.getAllOrders({ isPaid: true });
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return sendSuccess(res, "Dashboard stats retrieved successfully", {
    users: {
      total: totalUsers
    },
    orders: {
      total: totalOrders,
      revenue: totalRevenue
    },
    products: {
      total: totalProducts
    },
    repairs: {
      total: totalRepairs,
      pending: pendingRepairs,
      completed: completedRepairs
    }
  });
});

// Get recent activities
export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const [recentOrders, recentRepairs, recentUsers] = await Promise.all([
    OrderModel.getAllOrders().then(orders => 
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit)
    ),
    RepairModel.getAllRepairs().then(repairs => 
      repairs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit)
    ),
    UserModel.getAllUsers().then(users => 
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit)
    )
  ]);

  return sendSuccess(res, "Recent activities retrieved successfully", {
    orders: recentOrders,
    repairs: recentRepairs,
    users: recentUsers
  });
});

// Update order status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await OrderModel.getOrderById(id);

  if (!order) {
    return sendNotFound(res, "Order");
  }

  await OrderModel.updateOrderStatus(id, status);
  const updatedOrder = await OrderModel.getOrderById(id);

  // Emit socket event
  emitOrderUpdate(id, {
    status,
    message: "Order status updated by admin"
  });

  return sendSuccess(res, "Order status updated successfully", updatedOrder);
});

// Assign technician to repair
export const assignTechnician = asyncHandler(async (req, res) => {
  const { repairId } = req.params;
  const { technicianId } = req.body;

  const repair = await RepairModel.getRepairById(repairId);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  const technician = await TechnicianModel.getTechnicianById(technicianId);

  if (!technician) {
    return sendNotFound(res, "Technician");
  }

  await RepairModel.updateRepair(repairId, { technician: technicianId });
  const updatedRepair = await RepairModel.getRepairById(repairId);

  // Emit socket event
  emitRepairUpdate(repairId, {
    status: updatedRepair.status,
    note: "Technician assigned"
  });

  return sendSuccess(res, "Technician assigned successfully", updatedRepair);
});

// Get all users (admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.getAllUsers();

  if (!users || users.length === 0) {
    return sendSuccess(res, "No users found", []);
  }

  return sendSuccess(res, "Users retrieved successfully", users);
});
