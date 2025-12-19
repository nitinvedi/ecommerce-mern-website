import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as wishlistController from "../controllers/wishlistController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get wishlist
router.get("/", wishlistController.getWishlist);

// Add to wishlist
router.post("/:productId", wishlistController.addToWishlist);

// Check if product is in wishlist
router.get("/check/:productId", wishlistController.checkWishlist);

// Remove from wishlist
router.delete("/:productId", wishlistController.removeFromWishlist);

// Clear wishlist
router.delete("/", wishlistController.clearWishlist);

export default router;
