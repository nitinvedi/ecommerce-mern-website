import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "carts";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Get cart by user
export const getCartByUser = async (userId) => {
  const collection = getCollection();
  return await collection.findOne({ user: new ObjectId(userId) });
};

// Update entire cart (for sync/replace)
export const updateCart = async (userId, products) => {
  const collection = getCollection();
  
  // Format products to ensure ObjectIds
  const formattedProducts = products.map(p => ({
    product: new ObjectId(p.product || p._id),
    quantity: Number(p.quantity)
  }));
  
  await collection.updateOne(
    { user: new ObjectId(userId) },
    { 
       $set: { 
          products: formattedProducts,
          updatedAt: new Date()
       },
       $setOnInsert: {
          createdAt: new Date()
       }
    },
    { upsert: true }
  );
  
  return await getCartByUser(userId);
};

// Clear cart
export const clearCart = async (userId) => {
  const collection = getCollection();
  await collection.deleteOne({ user: new ObjectId(userId) });
};

export default {
  getCartByUser,
  updateCart,
  clearCart
};
