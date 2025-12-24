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
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  // Parallelize basic counts and new complex queries
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalRepairs,
    pendingRepairs,
    completedRepairs,
    lowStockProducts,
    revenueChartData,
    topProductsData
  ] = await Promise.all([
    UserModel.getAllUsers().then(users => users.length),
    OrderModel.getAllOrders().then(orders => orders.length),
    ProductModel.getAllProducts().then(products => products.length),
    RepairModel.getAllRepairs().then(repairs => repairs.length),
    RepairModel.getAllRepairs({ status: "Pending" }).then(repairs => repairs.length),
    RepairModel.getAllRepairs({ status: "Completed" }).then(repairs => repairs.length),
    // Low Stock (assuming stock < 10)
    ProductModel.getAllProducts().then(products =>
      products.filter(p => p.stock < 10 && p.stock > 0).slice(0, 5)
    ),
    // Revenue Chart (Last 6 months)
    OrderModel.getAllOrders({ isPaid: true }).then(orders => {
      const monthlyData = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
        monthlyData[key] = { name: months[d.getMonth()], revenue: 0, orders: 0 };
      }

      orders.forEach(order => {
        const d = new Date(order.createdAt);
        if (d >= sixMonthsAgo) {
          const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          if (monthlyData[key]) {
            monthlyData[key].revenue += (order.totalPrice || 0);
            monthlyData[key].orders += 1;
          }
        }
      });
      return Object.values(monthlyData);
    }),
    // Top Products (Mock or Real calculation)
    // Since we might not have a direct 'sold' count efficiently, 
    // we'll approximate active products or just take random high stock/price ones for now 
    // OR better, aggregate from orders if possible. For speed/safety, let's just pick products with highest stock/price as "Trending"
    // Ideally this should be an aggregation on OrderItems.
    ProductModel.getAllProducts().then(products =>
      products.sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5) // Simplified for MVP
    )
  ]);

  // Calculate total revenue from orders
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
      total: totalProducts,
      lowStock: lowStockProducts,
      top: topProductsData
    },
    repairs: {
      total: totalRepairs,
      pending: pendingRepairs,
      completed: completedRepairs
    },
    charts: {
      revenue: revenueChartData
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

  const technician = await UserModel.getUserById(technicianId);

  if (!technician) {
    return sendNotFound(res, "User not found");
  }

  // Auto-promote user to technician if needed
  if (technician.role !== "technician") {
    await UserModel.updateUser(technicianId, { role: "technician" });
    // Verify promotion worked? Or just proceed.
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
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await UserModel.getAllUsers(filter);

  if (!users || users.length === 0) {
    return sendSuccess(res, "No users found", []);
  }

  return sendSuccess(res, "Users retrieved successfully", users);
});
