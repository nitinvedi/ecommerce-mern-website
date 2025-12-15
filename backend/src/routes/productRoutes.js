import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { admin, protectAdmin } from "../middleware/adminMiddleware.js";
import { protectAdminOrTechnician } from "../middleware/technicianMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview
} from "../controllers/productController.js";
import { uploadProductImages, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProductById);

// Protected routes
router.post("/:id/reviews", protect, addProductReview);

// Admin / Technician routes
// Allow both admins and technicians to create & update products,
// but keep hard deletes restricted to admins only.
router.post(
  "/",
  protectAdminOrTechnician,
  uploadProductImages,
  handleUploadError,
  createProduct
);
router.put(
  "/:id",
  protectAdminOrTechnician,
  uploadProductImages,
  handleUploadError,
  updateProduct
);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;

