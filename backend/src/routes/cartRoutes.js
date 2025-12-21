import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import cartController from "../controllers/cartController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", cartController.getCart);
router.post("/sync", cartController.syncCart);
router.put("/", cartController.updateCart);

export default router;
