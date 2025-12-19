import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "addresses";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
export const validateAddress = (addressData) => {
  const errors = [];
  
  if (!addressData.fullName || addressData.fullName.trim().length === 0) {
    errors.push("Full name is required");
  }
  
  if (!addressData.phone || addressData.phone.trim().length === 0) {
    errors.push("Phone number is required");
  }
  
  if (!addressData.address || addressData.address.trim().length === 0) {
    errors.push("Address is required");
  }
  
  if (!addressData.city || addressData.city.trim().length === 0) {
    errors.push("City is required");
  }
  
  if (!addressData.state || addressData.state.trim().length === 0) {
    errors.push("State is required");
  }
  
  if (!addressData.zip || addressData.zip.trim().length === 0) {
    errors.push("ZIP code is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create address
export const createAddress = async (userId, addressData) => {
  const validation = validateAddress(addressData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }
  
  const collection = getCollection();
  
  // If this is the first address or marked as default, set as default
  const existingAddresses = await getAddressesByUser(userId);
  const isDefault = existingAddresses.length === 0 || addressData.isDefault === true;
  
  // If setting as default, unset other defaults
  if (isDefault) {
    await collection.updateMany(
      { user: new ObjectId(userId) },
      { $set: { isDefault: false } }
    );
  }
  
  const address = {
    user: new ObjectId(userId),
    fullName: addressData.fullName.trim(),
    phone: addressData.phone.trim(),
    address: addressData.address.trim(),
    city: addressData.city.trim(),
    state: addressData.state.trim(),
    zip: addressData.zip.trim(),
    label: addressData.label || 'home', // home, work, other
    isDefault,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(address);
  return { ...address, _id: result.insertedId };
};

// Get addresses by user
export const getAddressesByUser = async (userId) => {
  const collection = getCollection();
  return await collection
    .find({ user: new ObjectId(userId) })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();
};

// Get address by ID
export const getAddressById = async (addressId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(addressId) });
};

// Get default address
export const getDefaultAddress = async (userId) => {
  const collection = getCollection();
  return await collection.findOne({
    user: new ObjectId(userId),
    isDefault: true
  });
};

// Update address
export const updateAddress = async (addressId, userId, updateData) => {
  const collection = getCollection();
  
  // Verify ownership
  const address = await collection.findOne({
    _id: new ObjectId(addressId),
    user: new ObjectId(userId)
  });
  
  if (!address) {
    throw new Error("Address not found or unauthorized");
  }
  
  // If setting as default, unset other defaults
  if (updateData.isDefault === true) {
    await collection.updateMany(
      { user: new ObjectId(userId), _id: { $ne: new ObjectId(addressId) } },
      { $set: { isDefault: false } }
    );
  }
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };
  
  // Trim string fields
  if (updateDoc.fullName) updateDoc.fullName = updateDoc.fullName.trim();
  if (updateDoc.phone) updateDoc.phone = updateDoc.phone.trim();
  if (updateDoc.address) updateDoc.address = updateDoc.address.trim();
  if (updateDoc.city) updateDoc.city = updateDoc.city.trim();
  if (updateDoc.state) updateDoc.state = updateDoc.state.trim();
  if (updateDoc.zip) updateDoc.zip = updateDoc.zip.trim();
  
  await collection.updateOne(
    { _id: new ObjectId(addressId) },
    { $set: updateDoc }
  );
  
  return await getAddressById(addressId);
};

// Set default address
export const setDefaultAddress = async (addressId, userId) => {
  const collection = getCollection();
  
  // Verify ownership
  const address = await collection.findOne({
    _id: new ObjectId(addressId),
    user: new ObjectId(userId)
  });
  
  if (!address) {
    throw new Error("Address not found or unauthorized");
  }
  
  // Unset all defaults for this user
  await collection.updateMany(
    { user: new ObjectId(userId) },
    { $set: { isDefault: false } }
  );
  
  // Set this address as default
  await collection.updateOne(
    { _id: new ObjectId(addressId) },
    { $set: { isDefault: true, updatedAt: new Date() } }
  );
  
  return await getAddressById(addressId);
};

// Delete address
export const deleteAddress = async (addressId, userId) => {
  const collection = getCollection();
  
  // Verify ownership
  const address = await collection.findOne({
    _id: new ObjectId(addressId),
    user: new ObjectId(userId)
  });
  
  if (!address) {
    throw new Error("Address not found or unauthorized");
  }
  
  // If deleting default address, set another as default
  if (address.isDefault) {
    const otherAddresses = await collection
      .find({ user: new ObjectId(userId), _id: { $ne: new ObjectId(addressId) } })
      .limit(1)
      .toArray();
    
    if (otherAddresses.length > 0) {
      await collection.updateOne(
        { _id: otherAddresses[0]._id },
        { $set: { isDefault: true } }
      );
    }
  }
  
  return await collection.deleteOne({ _id: new ObjectId(addressId) });
};

export default {
  createAddress,
  getAddressesByUser,
  getAddressById,
  getDefaultAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  validateAddress
};
