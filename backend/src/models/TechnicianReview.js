import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "technician_reviews";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
export const validateReview = (reviewData) => {
  const errors = [];
  
  if (!reviewData.technician) {
    errors.push("Technician is required");
  }
  
  if (!reviewData.user) {
    errors.push("User is required");
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create review
export const createReview = async (reviewData) => {
  const validation = validateReview(reviewData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }
  
  const collection = getCollection();
  
  // Check if user already reviewed this technician for this repair
  if (reviewData.repair) {
    const existingReview = await collection.findOne({
      user: new ObjectId(reviewData.user),
      technician: new ObjectId(reviewData.technician),
      repair: new ObjectId(reviewData.repair)
    });
    
    if (existingReview) {
      throw new Error("You have already reviewed this technician for this repair");
    }
  }
  
  const review = {
    technician: typeof reviewData.technician === 'string' 
      ? new ObjectId(reviewData.technician) 
      : reviewData.technician,
    user: typeof reviewData.user === 'string' 
      ? new ObjectId(reviewData.user) 
      : reviewData.user,
    repair: reviewData.repair 
      ? (typeof reviewData.repair === 'string' 
        ? new ObjectId(reviewData.repair) 
        : reviewData.repair)
      : null,
    rating: reviewData.rating,
    comment: reviewData.comment ? reviewData.comment.trim() : '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(review);
  return { ...review, _id: result.insertedId };
};

// Get reviews by technician
export const getReviewsByTechnician = async (technicianId) => {
  const collection = getCollection();
  return await collection
    .find({ technician: new ObjectId(technicianId) })
    .sort({ createdAt: -1 })
    .toArray();
};

// Get review by ID
export const getReviewById = async (reviewId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(reviewId) });
};

// Calculate technician rating
export const calculateTechnicianRating = async (technicianId) => {
  const reviews = await getReviewsByTechnician(technicianId);
  
  if (reviews.length === 0) {
    return { rating: 0, numReviews: 0 };
  }
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const rating = (sum / reviews.length).toFixed(1);
  
  return {
    rating: parseFloat(rating),
    numReviews: reviews.length
  };
};

// Update review
export const updateReview = async (reviewId, updateData) => {
  const collection = getCollection();
  
  if (updateData.comment) {
    updateData.comment = updateData.comment.trim();
  }
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };
  
  await collection.updateOne(
    { _id: new ObjectId(reviewId) },
    { $set: updateDoc }
  );
  
  return await getReviewById(reviewId);
};

// Delete review
export const deleteReview = async (reviewId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(reviewId) });
};

export default {
  createReview,
  getReviewsByTechnician,
  getReviewById,
  calculateTechnicianRating,
  updateReview,
  deleteReview,
  validateReview
};
