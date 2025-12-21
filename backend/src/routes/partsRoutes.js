import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdminOrTechnician, protectTechnician } from "../middleware/technicianMiddleware.js";
import {
  createPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  addStock
} from "../controllers/partsController.js";

const router = express.Router();

// All routes require at least technician access
router.use(protect);
router.use(protectAdminOrTechnician);

router.route("/")
  .get(getAllParts)
  .post(createPart);

router.route("/:id")
  .get(getPartById)
  .put(updatePart)
  .delete(deletePart);

router.post("/:id/stock", addStock);

export default router;
