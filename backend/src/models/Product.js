import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "products";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Validation function
const DEFAULT_IMAGE = "/uploads/products/default.png";

export const validateProduct = (productData) => {
  const errors = [];

  if (!productData.name || productData.name.trim().length === 0) {
    errors.push("Product name is required");
  } else if (productData.name.length > 200) {
    errors.push("Product name cannot exceed 200 characters");
  }

  if (!productData.description || productData.description.trim().length === 0) {
    errors.push("Product description is required");
  }

  if (productData.price === undefined || productData.price === null) {
    errors.push("Product price is required");
  } else if (productData.price < 0) {
    errors.push("Price cannot be negative");
  }

  // Images are optional; a default image will be applied if none provided.

  const validCategories = ['Mobile', 'Tablet', 'Laptop', 'Accessories', 'Parts', 'Other'];
  if (!productData.category || !validCategories.includes(productData.category)) {
    errors.push("Valid product category is required");
  }

  if (productData.stock !== undefined && productData.stock < 0) {
    errors.push("Stock cannot be negative");
  }

  if (productData.rating !== undefined && (productData.rating < 0 || productData.rating > 5)) {
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
    return { rating: 0, numReviews: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  const rating = (sum / reviews.length).toFixed(1);
  return { rating: parseFloat(rating), numReviews: reviews.length };
};

// Create product
export const createProduct = async (productData) => {
  const validation = validateProduct(productData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const reviews = productData.reviews || [];
  const { rating, numReviews } = calculateRating(reviews);

  const images =
    productData.images && Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : [DEFAULT_IMAGE];

  const product = {
    name: productData.name.trim(),
    description: productData.description.trim(),
    price: productData.price,
    images,
    category: productData.category || 'Other',
    brand: productData.brand ? productData.brand.trim() : null,
    stock: productData.stock !== undefined ? productData.stock : 0,
    rating,
    numReviews,
    reviews: reviews.map(review => ({
      user: typeof review.user === 'string' ? new ObjectId(review.user) : review.user,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt || new Date(),
      updatedAt: review.updatedAt || new Date()
    })),
    isActive: productData.isActive !== undefined ? productData.isActive : true,
    featured: productData.featured || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const collection = getCollection();
  const result = await collection.insertOne(product);
  return { ...product, _id: result.insertedId };
};

// Get product by ID
export const getProductById = async (productId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(productId) });
};

// Get all products
export const getAllProducts = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find(filter).sort({ createdAt: -1 }).toArray();
};

// Get active products
export const getActiveProducts = async (filter = {}) => {
  const collection = getCollection();
  return await collection.find({ ...filter, isActive: true }).sort({ createdAt: -1 }).toArray();
};

// Update product
export const updateProduct = async (productId, updateData) => {
  const collection = getCollection();
  
  // Recalculate rating if reviews are being updated
  if (updateData.reviews) {
    const { rating, numReviews } = calculateRating(updateData.reviews);
    updateData.rating = rating;
    updateData.numReviews = numReviews;
    
    // Convert user IDs in reviews
    updateData.reviews = updateData.reviews.map(review => ({
      ...review,
      user: typeof review.user === 'string' ? new ObjectId(review.user) : review.user,
      createdAt: review.createdAt || new Date(),
      updatedAt: review.updatedAt || new Date()
    }));
  }

  // Trim string fields
  if (updateData.name) updateData.name = updateData.name.trim();
  if (updateData.description) updateData.description = updateData.description.trim();
  if (updateData.brand) updateData.brand = updateData.brand.trim();

  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };

  const result = await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: updateDoc }
  );
  return result;
};

// Delete product
export const deleteProduct = async (productId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(productId) });
};

// Add review to product
export const addReview = async (productId, reviewData) => {
  const collection = getCollection();
  const product = await getProductById(productId);
  
  if (!product) {
    throw new Error("Product not found");
  }

  const newReview = {
    user: typeof reviewData.user === 'string' ? new ObjectId(reviewData.user) : reviewData.user,
    name: reviewData.name,
    rating: reviewData.rating,
    comment: reviewData.comment,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const reviews = [...(product.reviews || []), newReview];
  const { rating, numReviews } = calculateRating(reviews);

  await collection.updateOne(
    { _id: new ObjectId(productId) },
    {
      $set: {
        reviews,
        rating,
        numReviews,
        updatedAt: new Date()
      }
    }
  );

  return newReview;
};

export default {
  createProduct,
  getProductById,
  getAllProducts,
  getActiveProducts,
  updateProduct,
  deleteProduct,
  addReview,
  validateProduct,
  calculateRating
};
