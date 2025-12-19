import { getDB } from "../config/mongo.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "users";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
export const validateUser = (userData) => {
  const errors = [];

  if (!userData.name || userData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (userData.name.length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Valid email is required");
  }

  if (userData.password && userData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  const validRoles = ['user', 'technician', 'admin'];
  if (userData.role && !validRoles.includes(userData.role)) {
    errors.push("Invalid role");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Match password
export const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Create user
export const createUser = async (userData) => {
  const validation = validateUser(userData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const collection = getCollection();
  
  // Check if user already exists
  const existingUser = await collection.findOne({ email: userData.email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = userData.password ? await hashPassword(userData.password) : null;

  const user = {
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    phone: userData.phone ? userData.phone.trim() : null,
    role: userData.role || 'user',
    // Keep basic address for backward compatibility, but use Address collection for multiple addresses
    address: {
      street: userData.address?.street ? userData.address.street.trim() : null,
      city: userData.address?.city ? userData.address.city.trim() : null,
      state: userData.address?.state ? userData.address.state.trim() : null,
      zip: userData.address?.zip ? userData.address.zip.trim() : null
    },
    // New fields for enhanced features
    profilePicture: userData.profilePicture || null,
    socialLinks: {
      facebook: userData.socialLinks?.facebook || null,
      twitter: userData.socialLinks?.twitter || null,
      instagram: userData.socialLinks?.instagram || null,
      linkedin: userData.socialLinks?.linkedin || null
    },
    preferences: {
      newsletter: userData.preferences?.newsletter !== false,
      notifications: userData.preferences?.notifications !== false,
      language: userData.preferences?.language || 'en'
    },
    recentlyViewed: [], // Array of product IDs
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(user);
  const createdUser = { ...user, _id: result.insertedId };
  
  // Remove password from returned object
  delete createdUser.password;
  return createdUser;
};

// Get user by ID
export const getUserById = async (userId) => {
  const collection = getCollection();
  const user = await collection.findOne({ _id: new ObjectId(userId) });
  if (user && user.password) {
    delete user.password;
  }
  return user;
};

// Get user by email
export const getUserByEmail = async (email, includePassword = false) => {
  const collection = getCollection();
  const user = await collection.findOne({ email: email.toLowerCase().trim() });
  if (user && !includePassword && user.password) {
    delete user.password;
  }
  return user;
};

// Get user by reset token (and ensure not expired)
export const getUserByResetToken = async (token) => {
  const collection = getCollection();
  const now = new Date();
  const user = await collection.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: now }
  });
  return user;
};

// Get user by ID including password (internal use)
export const getUserByIdWithPassword = async (userId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(userId) });
};

// Get all users
export const getAllUsers = async (filter = {}) => {
  const collection = getCollection();
  const users = await collection.find(filter).toArray();
  // Remove passwords from all users
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Update user
export const updateUser = async (userId, updateData) => {
  const collection = getCollection();
  
  // Hash password if it's being updated
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  // Trim string fields
  if (updateData.name) updateData.name = updateData.name.trim();
  if (updateData.email) updateData.email = updateData.email.toLowerCase().trim();
  if (updateData.phone) updateData.phone = updateData.phone.trim();
  
  if (updateData.address) {
    if (updateData.address.street) updateData.address.street = updateData.address.street.trim();
    if (updateData.address.city) updateData.address.city = updateData.address.city.trim();
    if (updateData.address.state) updateData.address.state = updateData.address.state.trim();
    if (updateData.address.zip) updateData.address.zip = updateData.address.zip.trim();
  }

  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };

  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateDoc }
  );
  return result;
};

// Update password directly (helper)
export const updatePassword = async (userId, newPassword) => {
  const hashed = await hashPassword(newPassword);
  const collection = getCollection();
  return await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    }
  );
};

// Delete user
export const deleteUser = async (userId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(userId) });
};

// Helper to remove password from user object
export const removePassword = (user) => {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export default {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  validateUser,
  hashPassword,
  matchPassword,
  removePassword
};
