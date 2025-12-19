import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as addressController from "../controllers/addressController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all addresses
router.get("/", addressController.getAddresses);

// Get default address
router.get("/default", addressController.getDefaultAddress);

// Add address
router.post("/", addressController.addAddress);

// Update address
router.put("/:id", addressController.updateAddress);

// Set default address
router.put("/:id/default", addressController.setDefaultAddress);

// Delete address
router.delete("/:id", addressController.deleteAddress);

export default router;
