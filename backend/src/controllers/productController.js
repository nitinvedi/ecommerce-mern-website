import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound, sendCreated, sendPaginated } from "../utils/response.js";
import * as ProductModel from "../models/Product.js";
import { getPagination } from "../utils/helpers.js";
import logger from "../utils/logger.js";

// Get all products
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = {};

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by brand
  if (req.query.brand) {
    filter.brand = req.query.brand;
  }

  // Search by name
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: "i" };
  }

  // Only active products for non-admin users
  if (req.user?.role !== "admin") {
    filter.isActive = true;
  }

  const products = await ProductModel.getAllProducts(filter);

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return sendPaginated(res, paginatedProducts, {
    page,
    limit,
    total: products.length
  });
});

// Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.getProductById(id);

  if (!product) {
    return sendNotFound(res, "Product");
  }

  // Check if product is active (unless admin)
  if (!product.isActive && req.user?.role !== "admin") {
    return sendNotFound(res, "Product");
  }

  return sendSuccess(res, "Product retrieved successfully", product);
});

// Create product (admin only)
export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };

  // Normalize numbers/booleans from form-data
  if (productData.price !== undefined) productData.price = Number(productData.price);
  if (productData.stock !== undefined) productData.stock = Number(productData.stock);
  if (productData.isActive !== undefined) {
    productData.isActive = productData.isActive === "true" || productData.isActive === true;
  }
  if (productData.featured !== undefined) {
    productData.featured = productData.featured === "true" || productData.featured === true;
  }

  // If images were sent as JSON string (when no new uploads), parse them
  if (typeof productData.images === "string") {
    try {
      productData.images = JSON.parse(productData.images);
    } catch {
      // ignore parse error; fallback handled below
    }
  }

  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    productData.images = req.files.map(file => file.path);
  }

  const product = await ProductModel.createProduct(productData);
  return sendCreated(res, "Product created successfully", product);
});

// Update product (admin only)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.getProductById(id);

  if (!product) {
    return sendNotFound(res, "Product");
  }

  const updateData = { ...req.body };

  // Normalize numbers/booleans from form-data
  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
  }
  if (updateData.featured !== undefined) {
    updateData.featured = updateData.featured === "true" || updateData.featured === true;
  }

  // Parse persisted images if provided (when no new uploads)
  if (typeof updateData.images === "string") {
    try {
      updateData.images = JSON.parse(updateData.images);
    } catch {
      // ignore
    }
  }
  if (typeof updateData.existingImages === "string") {
    try {
      const existing = JSON.parse(updateData.existingImages);
      if (!updateData.images && Array.isArray(existing)) {
        updateData.images = existing;
      }
    } catch {
      // ignore
    }
  }

  // Update images if new files uploaded
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map(file => file.path);
  }

  const result = await ProductModel.updateProduct(id, updateData);

  if (result.modifiedCount === 0) {
    return sendError(res, "Product not updated", 400);
  }

  const updatedProduct = await ProductModel.getProductById(id);
  return sendSuccess(res, "Product updated successfully", updatedProduct);
});

// Delete product (admin only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.getProductById(id);

  if (!product) {
    return sendNotFound(res, "Product");
  }

  await ProductModel.deleteProduct(id);
  return sendSuccess(res, "Product deleted successfully");
});

// Add review to product
export const addProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return sendError(res, "Rating must be between 1 and 5", 400);
  }

  const product = await ProductModel.getProductById(id);

  if (!product) {
    return sendNotFound(res, "Product");
  }

  const reviewData = {
    user: userId,
    name: req.user.name,
    rating: parseInt(rating),
    comment
  };

  await ProductModel.addReview(id, reviewData);
  const updatedProduct = await ProductModel.getProductById(id);

  return sendSuccess(res, "Review added successfully", updatedProduct);
});

