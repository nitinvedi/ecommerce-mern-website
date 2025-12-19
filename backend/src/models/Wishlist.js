import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "wishlists";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Create or update wishlist
export const addToWishlist = async (userId, productId) => {
  const collection = getCollection();
  
  const wishlist = await collection.findOne({ user: new ObjectId(userId) });
  
  if (wishlist) {
    // Check if product already exists
    const productExists = wishlist.products.some(
      p => p.toString() === productId.toString()
    );
    
    if (productExists) {
      throw new Error("Product already in wishlist");
    }
    
    // Add product to existing wishlist
    await collection.updateOne(
      { user: new ObjectId(userId) },
      { 
        $push: { products: new ObjectId(productId) },
        $set: { updatedAt: new Date() }
      }
    );
  } else {
    // Create new wishlist
    await collection.insertOne({
      user: new ObjectId(userId),
      products: [new ObjectId(productId)],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return await getWishlistByUser(userId);
};

// Remove from wishlist
export const removeFromWishlist = async (userId, productId) => {
  const collection = getCollection();
  
  await collection.updateOne(
    { user: new ObjectId(userId) },
    { 
      $pull: { products: new ObjectId(productId) },
      $set: { updatedAt: new Date() }
    }
  );
  
  return await getWishlistByUser(userId);
};

// Get wishlist by user
export const getWishlistByUser = async (userId) => {
  const collection = getCollection();
  return await collection.findOne({ user: new ObjectId(userId) });
};

// Clear wishlist
export const clearWishlist = async (userId) => {
  const collection = getCollection();
  
  await collection.updateOne(
    { user: new ObjectId(userId) },
    { 
      $set: { products: [], updatedAt: new Date() }
    }
  );
  
  return { products: [] };
};

// Check if product is in wishlist
export const isInWishlist = async (userId, productId) => {
  const collection = getCollection();
  
  const wishlist = await collection.findOne({
    user: new ObjectId(userId),
    products: new ObjectId(productId)
  });
  
  return !!wishlist;
};

export default {
  addToWishlist,
  removeFromWishlist,
  getWishlistByUser,
  clearWishlist,
  isInWishlist
};
