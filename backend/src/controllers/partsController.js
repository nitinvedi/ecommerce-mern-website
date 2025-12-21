import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendCreated, sendNotFound } from "../utils/response.js";
import * as PartsInventory from "../models/PartsInventory.js";

// Create part
export const createPart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.createPart(req.body);
  return sendCreated(res, "Part created successfully", part);
});

// Get all parts
export const getAllParts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  const parts = await PartsInventory.getAllParts(filter);
  return sendSuccess(res, "Parts retrieved successfully", parts);
});

// Get part by ID
export const getPartById = asyncHandler(async (req, res) => {
  const part = await PartsInventory.getPartById(req.params.id);
  if (!part) return sendNotFound(res, "Part");
  return sendSuccess(res, "Part retrieved successfully", part);
});

// Update part
export const updatePart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.getPartById(req.params.id);
  if (!part) return sendNotFound(res, "Part");
  
  const updatedPart = await PartsInventory.updatePart(req.params.id, req.body);
  return sendSuccess(res, "Part updated successfully", updatedPart);
});

// Delete part
export const deletePart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.getPartById(req.params.id);
  if (!part) return sendNotFound(res, "Part");
  
  await PartsInventory.deletePart(req.params.id);
  return sendSuccess(res, "Part deleted successfully");
});

// Add Stock
export const addStock = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return sendError(res, "Invalid quantity", 400);

    const part = await PartsInventory.addStock(req.params.id, Number(quantity));
    return sendSuccess(res, "Stock added successfully", part);
});
