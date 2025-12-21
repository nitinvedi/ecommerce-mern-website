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
    // New fields for enhanced features
    variants: productData.variants || [], // [{name, value, price, stock, images}]
    viewCount: 0,
    tags: productData.tags || [],
    specifications: productData.specifications || {},
    discountPercent: productData.discountPercent || 0,
    discountedPrice: productData.discountPercent 
      ? productData.price - (productData.price * productData.discountPercent / 100)
      : productData.price,
    isActive: productData.isActive !== undefined ? productData.isActive : true,
    isRefurbished: productData.isRefurbished || false,
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

// Reduce stock atomically
export const reduceStock = async (id, quantity) => {
  const collection = getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id), stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { returnDocument: "after" }
  );
  return result;
};

// Increase stock (for cancellations/rollbacks)
export const increaseStock = async (id, quantity) => {
  const collection = getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { stock: quantity } },
    { returnDocument: "after" }
  );
  return result;
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

// Increment view count
export const incrementViewCount = async (productId) => {
  const collection = getCollection();
  await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $inc: { viewCount: 1 } }
  );
};

// Search products with filters
export const searchProducts = async (searchParams) => {
  const collection = getCollection();
  
  // Default to active only, unless explicit override (e.g. for admins)
  const query = {};
  if (!searchParams.includeInactive) {
      query.isActive = true;
  }
  
  // Text search
  if (searchParams.q) {
    query.$or = [
      { name: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.q, 'i')] } }
    ];
  }
  
  // Category filter
  if (searchParams.category) {
    query.category = searchParams.category;
  }
  
  // Brand filter
  if (searchParams.brand) {
    query.brand = searchParams.brand;
  }
  
  // Price range filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    query.price = {};
    if (searchParams.minPrice) query.price.$gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) query.price.$lte = parseFloat(searchParams.maxPrice);
  }
  
  // Rating filter
  if (searchParams.minRating) {
    query.rating = { $gte: parseFloat(searchParams.minRating) };
  }
  
  // Availability filter
  if (searchParams.inStock === 'true') {
    query.stock = { $gt: 0 };
  }
  
  // Sorting
  let sort = { createdAt: -1 }; // default: newest
  if (searchParams.sort === 'price_asc') sort = { price: 1 };
  else if (searchParams.sort === 'price_desc') sort = { price: -1 };
  else if (searchParams.sort === 'popular') sort = { viewCount: -1 };
  else if (searchParams.sort === 'rating') sort = { rating: -1 };
  else if (searchParams.sort === '-createdAt') sort = { createdAt: -1 }; // Explicit support
  
  // Pagination
  const page = parseInt(searchParams.page) || 1;
  const limit = parseInt(searchParams.limit) || 20;
  const skip = (page - 1) * limit;
  
  const products = await collection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await collection.countDocuments(query);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
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
  calculateRating,
  incrementViewCount,
  searchProducts
};
