import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "technicians";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Generate employee ID
export const generateEmployeeId = async () => {
  const collection = getCollection();
  const count = await collection.countDocuments();
  return `TECH${String(count + 1).padStart(4, '0')}`;
};

// Validation function
export const validateTechnician = (technicianData) => {
  const errors = [];

  if (!technicianData.user) {
    errors.push("User is required");
  }

  const validSpecializations = ['Mobile', 'Tablet', 'Laptop', 'Screen Repair', 'Battery Replacement', 'Software', 'Hardware', 'Other'];
  if (technicianData.specializations && Array.isArray(technicianData.specializations)) {
    technicianData.specializations.forEach(spec => {
      if (!validSpecializations.includes(spec)) {
        errors.push(`Invalid specialization: ${spec}`);
      }
    });
  }

  const validAvailability = ['Available', 'Busy', 'On Leave', 'Unavailable'];
  if (technicianData.availability && !validAvailability.includes(technicianData.availability)) {
    errors.push("Invalid availability status");
  }

  if (technicianData.experience !== undefined && technicianData.experience < 0) {
    errors.push("Experience cannot be negative");
  }

  if (technicianData.rating !== undefined && (technicianData.rating < 0 || technicianData.rating > 5)) {
    errors.push("Rating must be between 0 and 5");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate average rating
export const calculateRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { rating: 0, totalRatings: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  const rating = (sum / reviews.length).toFixed(1);
  return { rating: parseFloat(rating), totalRatings: reviews.length };
};

// Create technician
export const createTechnician = async (technicianData) => {
  const validation = validateTechnician(technicianData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const employeeId = await generateEmployeeId();
  const reviews = technicianData.reviews || [];
  const { rating, totalRatings } = calculateRating(reviews);

  const technician = {
    user: typeof technicianData.user === 'string' ? new ObjectId(technicianData.user) : technicianData.user,
    employeeId,
    specializations: technicianData.specializations || [],
    experience: technicianData.experience || 0,
    certifications: technicianData.certifications || [],
    availability: technicianData.availability || 'Available',
    currentRepairs: (technicianData.currentRepairs || []).map(id => 
      typeof id === 'string' ? new ObjectId(id) : id
    ),
    completedRepairs: technicianData.completedRepairs || 0,
    rating,
    totalRatings,
    reviews: reviews.map(review => ({
      user: typeof review.user === 'string' ? new ObjectId(review.user) : review.user,
      rating: review.rating,
      comment: review.comment ? review.comment.trim() : null
    })),
    location: {
      city: technicianData.location?.city ? technicianData.location.city.trim() : null,
      state: technicianData.location?.state ? technicianData.location.state.trim() : null,
      zip: technicianData.location?.zip ? technicianData.location.zip.trim() : null
    },
    contactInfo: {
      phone: technicianData.contactInfo?.phone ? technicianData.contactInfo.phone.trim() : null,
      alternatePhone: technicianData.contactInfo?.alternatePhone ? technicianData.contactInfo.alternatePhone.trim() : null,
      email: technicianData.contactInfo?.email ? technicianData.contactInfo.email.trim().toLowerCase() : null
    },
    isActive: technicianData.isActive !== undefined ? technicianData.isActive : true,
    joinDate: technicianData.joinDate || new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const collection = getCollection();
  const result = await collection.insertOne(technician);
  return { ...technician, _id: result.insertedId };
};

// Get technician by ID
export const getTechnicianById = async (technicianId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(technicianId) });
};

// Get technician by user ID
export const getTechnicianByUserId = async (userId) => {
  const collection = getCollection();
  return await collection.findOne({ user: new ObjectId(userId) });
};

// Get technician by employee ID
export const getTechnicianByEmployeeId = async (employeeId) => {
  const collection = getCollection();
  return await collection.findOne({ employeeId });
};

// Get all technicians
export const getAllTechnicians = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find(filter).sort({ createdAt: -1 }).toArray();
};

// Get available technicians
export const getAvailableTechnicians = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find({ ...filter, availability: 'Available', isActive: true }).toArray();
};

// Update technician
export const updateTechnician = async (technicianId, updateData) => {
  const collection = getCollection();
  
  // Recalculate rating if reviews are being updated
  if (updateData.reviews) {
    const { rating, totalRatings } = calculateRating(updateData.reviews);
    updateData.rating = rating;
    updateData.totalRatings = totalRatings;
    
    // Convert user IDs in reviews
    updateData.reviews = updateData.reviews.map(review => ({
      ...review,
      user: typeof review.user === 'string' ? new ObjectId(review.user) : review.user
    }));
  }

  // Convert IDs if they exist
  if (updateData.user && typeof updateData.user === 'string') {
    updateData.user = new ObjectId(updateData.user);
  }
  if (updateData.currentRepairs) {
    updateData.currentRepairs = updateData.currentRepairs.map(id => 
      typeof id === 'string' ? new ObjectId(id) : id
    );
  }

  // Trim string fields
  if (updateData.location) {
    if (updateData.location.city) updateData.location.city = updateData.location.city.trim();
    if (updateData.location.state) updateData.location.state = updateData.location.state.trim();
    if (updateData.location.zip) updateData.location.zip = updateData.location.zip.trim();
  }
  if (updateData.contactInfo) {
    if (updateData.contactInfo.phone) updateData.contactInfo.phone = updateData.contactInfo.phone.trim();
    if (updateData.contactInfo.alternatePhone) updateData.contactInfo.alternatePhone = updateData.contactInfo.alternatePhone.trim();
    if (updateData.contactInfo.email) updateData.contactInfo.email = updateData.contactInfo.email.trim().toLowerCase();
  }

  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };

  const result = await collection.updateOne(
    { _id: new ObjectId(technicianId) },
    { $set: updateDoc }
  );
  return result;
};

// Delete technician
export const deleteTechnician = async (technicianId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(technicianId) });
};

// Add review to technician
export const addReview = async (technicianId, reviewData) => {
  const collection = getCollection();
  const technician = await getTechnicianById(technicianId);
  
  if (!technician) {
    throw new Error("Technician not found");
  }

  const newReview = {
    user: typeof reviewData.user === 'string' ? new ObjectId(reviewData.user) : reviewData.user,
    rating: reviewData.rating,
    comment: reviewData.comment ? reviewData.comment.trim() : null
  };

  const reviews = [...(technician.reviews || []), newReview];
  const { rating, totalRatings } = calculateRating(reviews);

  await collection.updateOne(
    { _id: new ObjectId(technicianId) },
    {
      $set: {
        reviews,
        rating,
        totalRatings,
        updatedAt: new Date()
      }
    }
  );

  return newReview;
};

export default {
  createTechnician,
  getTechnicianById,
  getTechnicianByUserId,
  getTechnicianByEmployeeId,
  getAllTechnicians,
  getAvailableTechnicians,
  updateTechnician,
  deleteTechnician,
  addReview,
  validateTechnician,
  calculateRating,
  generateEmployeeId
};
