import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "warranties";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Create warranty
export const createWarranty = async (warrantyData) => {
  const warrantyPeriodDays = warrantyData.warrantyPeriodDays || 90; // Default 90 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + warrantyPeriodDays);
  
  const warranty = {
    repair: typeof warrantyData.repair === 'string' 
      ? new ObjectId(warrantyData.repair) 
      : warrantyData.repair,
    user: typeof warrantyData.user === 'string' 
      ? new ObjectId(warrantyData.user) 
      : warrantyData.user,
    warrantyPeriodDays,
    startDate,
    endDate,
    status: 'active', // active, expired, claimed
    claimDetails: null,
    claimedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const collection = getCollection();
  const result = await collection.insertOne(warranty);
  return { ...warranty, _id: result.insertedId };
};

// Get warranty by repair ID
export const getWarrantyByRepairId = async (repairId) => {
  const collection = getCollection();
  return await collection.findOne({ repair: new ObjectId(repairId) });
};

// Get warranty by ID
export const getWarrantyById = async (warrantyId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(warrantyId) });
};

// Get warranties by user
export const getWarrantiesByUser = async (userId) => {
  const collection = getCollection();
  return await collection
    .find({ user: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
};

// Claim warranty
export const claimWarranty = async (warrantyId, claimDetails) => {
  const collection = getCollection();
  
  const warranty = await getWarrantyById(warrantyId);
  
  if (!warranty) {
    throw new Error("Warranty not found");
  }
  
  if (warranty.status === 'claimed') {
    throw new Error("Warranty already claimed");
  }
  
  if (warranty.status === 'expired' || new Date() > warranty.endDate) {
    throw new Error("Warranty has expired");
  }
  
  await collection.updateOne(
    { _id: new ObjectId(warrantyId) },
    {
      $set: {
        status: 'claimed',
        claimDetails: {
          issue: claimDetails.issue,
          description: claimDetails.description,
          claimedAt: new Date()
        },
        claimedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
  
  return await getWarrantyById(warrantyId);
};

// Update expired warranties (cron job)
export const updateExpiredWarranties = async () => {
  const collection = getCollection();
  const now = new Date();
  
  return await collection.updateMany(
    { endDate: { $lt: now }, status: 'active' },
    { $set: { status: 'expired', updatedAt: now } }
  );
};

// Check if warranty is valid
export const isWarrantyValid = async (warrantyId) => {
  const warranty = await getWarrantyById(warrantyId);
  
  if (!warranty) return false;
  if (warranty.status !== 'active') return false;
  if (new Date() > warranty.endDate) return false;
  
  return true;
};

export default {
  createWarranty,
  getWarrantyByRepairId,
  getWarrantyById,
  getWarrantiesByUser,
  claimWarranty,
  updateExpiredWarranties,
  isWarrantyValid
};
