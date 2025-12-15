import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "repairs";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Generate tracking ID
export const generateTrackingId = async () => {
  const collection = getCollection();
  const count = await collection.countDocuments();
  return `REP${String(count + 1).padStart(6, '0')}`;
};

// Validation function
export const validateRepair = (repairData) => {
  const errors = [];

  if (!repairData.user) {
    errors.push("User is required");
  }

  const validDeviceTypes = ['Mobile', 'Tablet', 'Laptop'];
  if (!repairData.deviceType || !validDeviceTypes.includes(repairData.deviceType)) {
    errors.push("Valid device type is required");
  }

  if (!repairData.brand || repairData.brand.trim().length === 0) {
    errors.push("Brand is required");
  }

  if (!repairData.model || repairData.model.trim().length === 0) {
    errors.push("Model is required");
  }

  const validIssues = ['Screen Damage', 'Battery', 'Camera', 'Mic', 'Not Turning On', 'Other'];
  if (!repairData.issue || !validIssues.includes(repairData.issue)) {
    errors.push("Valid issue type is required");
  }

  if (!repairData.problemDescription || repairData.problemDescription.trim().length === 0) {
    errors.push("Problem description is required");
  }

  if (!repairData.fullName || repairData.fullName.trim().length === 0) {
    errors.push("Full name is required");
  }

  if (!repairData.phoneNumber || repairData.phoneNumber.trim().length === 0) {
    errors.push("Phone number is required");
  }

  if (!repairData.pickupAddress || repairData.pickupAddress.trim().length === 0) {
    errors.push("Pickup address is required");
  }

  if (!repairData.city || repairData.city.trim().length === 0) {
    errors.push("City is required");
  }

  if (!repairData.pincode || repairData.pincode.trim().length === 0) {
    errors.push("Pincode is required");
  }

  const validStatuses = [
    'Pending',
    'Confirmed',
    'In Progress',
    'Diagnosed',
    'Repairing',
    'Quality Check',
    'Completed',
    'Delivered',
    'Cancelled'
  ];
  if (repairData.status && !validStatuses.includes(repairData.status)) {
    errors.push("Invalid repair status");
  }

  if (repairData.estimatedRepairCost !== undefined && repairData.estimatedRepairCost < 0) {
    errors.push("Estimated repair cost cannot be negative");
  }

  if (repairData.finalRepairCost !== undefined && repairData.finalRepairCost < 0) {
    errors.push("Final repair cost cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create repair
export const createRepair = async (repairData) => {
  const validation = validateRepair(repairData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const trackingId = await generateTrackingId();

  const repair = {
    user: typeof repairData.user === 'string' ? new ObjectId(repairData.user) : repairData.user,
    deviceType: repairData.deviceType,
    brand: repairData.brand.trim(),
    model: repairData.model.trim(),
    deviceColor: repairData.deviceColor ? repairData.deviceColor.trim() : null,
    imeiNumber: repairData.imeiNumber ? repairData.imeiNumber.trim() : null,
    issue: repairData.issue || 'Other',
    problemDescription: repairData.problemDescription.trim(),
    images: repairData.images || [],
    fullName: repairData.fullName.trim(),
    phoneNumber: repairData.phoneNumber.trim(),
    pickupAddress: repairData.pickupAddress.trim(),
    city: repairData.city.trim(),
    pincode: repairData.pincode.trim(),
    pickupDate: repairData.pickupDate ? new Date(repairData.pickupDate) : null,
    pickupTimeSlot: repairData.pickupTimeSlot ? repairData.pickupTimeSlot.trim() : null,
    estimatedRepairCost: repairData.estimatedRepairCost || 0,
    finalRepairCost: repairData.finalRepairCost || null,
    status: repairData.status || 'Pending',
    technician: repairData.technician ? (typeof repairData.technician === 'string' ? new ObjectId(repairData.technician) : repairData.technician) : null,
    statusUpdates: [],
    trackingId,
    notes: repairData.notes ? repairData.notes.trim() : null,
    completedAt: null,
    deliveredAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const collection = getCollection();
  const result = await collection.insertOne(repair);
  return { ...repair, _id: result.insertedId };
};

// Get repair by ID
export const getRepairById = async (repairId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(repairId) });
};

// Get repair by tracking ID
export const getRepairByTrackingId = async (trackingId) => {
  const collection = getCollection();
  return await collection.findOne({ trackingId });
};

// Get repairs by user
export const getRepairsByUser = async (userId) => {
  const collection = getCollection();
  return await collection.find({ user: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
};

// Get repairs by technician
export const getRepairsByTechnician = async (technicianId) => {
  const collection = getCollection();
  return await collection.find({ technician: new ObjectId(technicianId) }).sort({ createdAt: -1 }).toArray();
};

// Get all repairs
export const getAllRepairs = async (filter = {}) => {
  const collection = getCollection();

  const normalizedFilter = { ...filter };

  // Normalize IDs to ObjectId where applicable
  if (normalizedFilter.user && typeof normalizedFilter.user === "string") {
    normalizedFilter.user = new ObjectId(normalizedFilter.user);
  }
  if (normalizedFilter.technician && typeof normalizedFilter.technician === "string") {
    normalizedFilter.technician = new ObjectId(normalizedFilter.technician);
  }

  return await collection.find(normalizedFilter).sort({ createdAt: -1 }).toArray();
};

// Update repair
export const updateRepair = async (repairId, updateData) => {
  const collection = getCollection();
  
  // Convert IDs if they exist
  if (updateData.user && typeof updateData.user === 'string') {
    updateData.user = new ObjectId(updateData.user);
  }
  if (updateData.technician && typeof updateData.technician === 'string') {
    updateData.technician = new ObjectId(updateData.technician);
  }

  // Trim string fields
  if (updateData.brand) updateData.brand = updateData.brand.trim();
  if (updateData.model) updateData.model = updateData.model.trim();
  if (updateData.deviceColor) updateData.deviceColor = updateData.deviceColor.trim();
  if (updateData.imeiNumber) updateData.imeiNumber = updateData.imeiNumber.trim();
  if (updateData.problemDescription) updateData.problemDescription = updateData.problemDescription.trim();
  if (updateData.fullName) updateData.fullName = updateData.fullName.trim();
  if (updateData.phoneNumber) updateData.phoneNumber = updateData.phoneNumber.trim();
  if (updateData.pickupAddress) updateData.pickupAddress = updateData.pickupAddress.trim();
  if (updateData.city) updateData.city = updateData.city.trim();
  if (updateData.pincode) updateData.pincode = updateData.pincode.trim();
  if (updateData.pickupTimeSlot) updateData.pickupTimeSlot = updateData.pickupTimeSlot.trim();
  if (updateData.notes) updateData.notes = updateData.notes.trim();

  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };

  const result = await collection.updateOne(
    { _id: new ObjectId(repairId) },
    { $set: updateDoc }
  );
  return result;
};

// Add status update
export const addStatusUpdate = async (repairId, status, note = '', updatedBy = null) => {
  const collection = getCollection();
  const repair = await getRepairById(repairId);
  
  if (!repair) {
    throw new Error("Repair not found");
  }

  const statusUpdate = {
    status,
    note: note.trim(),
    updatedBy: updatedBy ? (typeof updatedBy === 'string' ? new ObjectId(updatedBy) : updatedBy) : null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const statusUpdates = [...(repair.statusUpdates || []), statusUpdate];
  
  const updateData = {
    status,
    statusUpdates,
    updatedAt: new Date()
  };

  if (status === 'Completed') {
    updateData.completedAt = new Date();
  }
  if (status === 'Delivered') {
    updateData.deliveredAt = new Date();
  }

  await collection.updateOne(
    { _id: new ObjectId(repairId) },
    { $set: updateData }
  );

  return statusUpdate;
};

// Delete repair
export const deleteRepair = async (repairId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(repairId) });
};

export default {
  createRepair,
  getRepairById,
  getRepairByTrackingId,
  getRepairsByUser,
  getRepairsByTechnician,
  getAllRepairs,
  updateRepair,
  addStatusUpdate,
  deleteRepair,
  validateRepair,
  generateTrackingId
};
