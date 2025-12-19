import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "parts_inventory";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
export const validatePart = (partData) => {
  const errors = [];
  
  if (!partData.name || partData.name.trim().length === 0) {
    errors.push("Part name is required");
  }
  
  if (!partData.sku || partData.sku.trim().length === 0) {
    errors.push("SKU is required");
  }
  
  if (partData.price === undefined || partData.price < 0) {
    errors.push("Valid price is required");
  }
  
  if (partData.stock === undefined || partData.stock < 0) {
    errors.push("Valid stock quantity is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create part
export const createPart = async (partData) => {
  const validation = validatePart(partData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }
  
  const collection = getCollection();
  
  // Check if SKU already exists
  const existingPart = await collection.findOne({ sku: partData.sku.trim() });
  if (existingPart) {
    throw new Error("Part with this SKU already exists");
  }
  
  const part = {
    name: partData.name.trim(),
    sku: partData.sku.trim(),
    category: partData.category || 'General', // Screen, Battery, Camera, etc.
    description: partData.description ? partData.description.trim() : null,
    price: partData.price,
    stock: partData.stock,
    reorderLevel: partData.reorderLevel || 10,
    supplier: partData.supplier ? partData.supplier.trim() : null,
    usageHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(part);
  return { ...part, _id: result.insertedId };
};

// Get all parts
export const getAllParts = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find(filter).sort({ name: 1 }).toArray();
};

// Get part by ID
export const getPartById = async (partId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(partId) });
};

// Get part by SKU
export const getPartBySKU = async (sku) => {
  const collection = getCollection();
  return await collection.findOne({ sku: sku.trim() });
};

// Get low stock parts
export const getLowStockParts = async () => {
  const collection = getCollection();
  return await collection
    .find({ $expr: { $lte: ["$stock", "$reorderLevel"] } })
    .sort({ stock: 1 })
    .toArray();
};

// Update part
export const updatePart = async (partId, updateData) => {
  const collection = getCollection();
  
  // Trim string fields
  if (updateData.name) updateData.name = updateData.name.trim();
  if (updateData.sku) updateData.sku = updateData.sku.trim();
  if (updateData.description) updateData.description = updateData.description.trim();
  if (updateData.supplier) updateData.supplier = updateData.supplier.trim();
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };
  
  await collection.updateOne(
    { _id: new ObjectId(partId) },
    { $set: updateDoc }
  );
  
  return await getPartById(partId);
};

// Deduct stock (when used in repair)
export const deductStock = async (partId, quantity, repairId = null) => {
  const collection = getCollection();
  
  const part = await getPartById(partId);
  
  if (!part) {
    throw new Error("Part not found");
  }
  
  if (part.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${part.stock}, Requested: ${quantity}`);
  }
  
  const usageRecord = {
    quantity,
    repair: repairId ? new ObjectId(repairId) : null,
    usedAt: new Date()
  };
  
  await collection.updateOne(
    { _id: new ObjectId(partId) },
    {
      $inc: { stock: -quantity },
      $push: { usageHistory: usageRecord },
      $set: { updatedAt: new Date() }
    }
  );
  
  return await getPartById(partId);
};

// Add stock (when restocking)
export const addStock = async (partId, quantity) => {
  const collection = getCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(partId) },
    {
      $inc: { stock: quantity },
      $set: { updatedAt: new Date() }
    }
  );
  
  return await getPartById(partId);
};

// Delete part
export const deletePart = async (partId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(partId) });
};

// Get parts by category
export const getPartsByCategory = async (category) => {
  const collection = getCollection();
  return await collection.find({ category }).sort({ name: 1 }).toArray();
};

export default {
  createPart,
  getAllParts,
  getPartById,
  getPartBySKU,
  getLowStockParts,
  updatePart,
  deductStock,
  addStock,
  deletePart,
  getPartsByCategory,
  validatePart
};
