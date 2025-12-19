import * as Wishlist from "../models/Wishlist.js";
import { getProductById } from "../models/Product.js";

// Get user wishlist with populated product details
export const getWishlist = async (req, res) => {
  try {
    console.log("=== GET WISHLIST REQUEST ===");
    console.log("User:", req.user?._id);
    
    if (!req.user || !req.user._id) {
      console.log("ERROR: User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const wishlist = await Wishlist.getWishlistByUser(req.user._id);
    console.log("Wishlist found:", wishlist);
    
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      console.log("Wishlist is empty, returning empty array");
      return res.json({ products: [] });
    }
    
    console.log("Fetching product details for:", wishlist.products.length, "products");
    
    // Populate product details
    const productDetails = await Promise.all(
      wishlist.products.map(async (productId) => {
        try {
          const product = await getProductById(productId);
          return product;
        } catch (error) {
          console.error("Error fetching product:", productId, error);
          return null;
        }
      })
    );
    
    const validProducts = productDetails.filter(p => p !== null);
    console.log("Valid products found:", validProducts.length);
    
    res.json({ products: validProducts });
  } catch (error) {
    console.error("=== WISHLIST ERROR ===");
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to get wishlist" });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    console.log("=== ADD TO WISHLIST ===");
    console.log("User:", req.user?._id);
    console.log("Product ID:", req.params.productId);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    // Verify product exists
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const wishlist = await Wishlist.addToWishlist(req.user._id, productId);
    console.log("Product added to wishlist successfully");
    res.json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    console.error("=== ADD TO WISHLIST ERROR ===");
    console.error(error);
    if (error.message === "Product already in wishlist") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Failed to add to wishlist" });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    console.log("=== REMOVE FROM WISHLIST ===");
    console.log("Product ID:", req.params.productId);
    
    const { productId } = req.params;
    const wishlist = await Wishlist.removeFromWishlist(req.user._id, productId);
    console.log("Product removed successfully");
    res.json({ message: "Removed from wishlist", wishlist });
  } catch (error) {
    console.error("=== REMOVE FROM WISHLIST ERROR ===");
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    console.log("=== CLEAR WISHLIST ===");
    const wishlist = await Wishlist.clearWishlist(req.user._id);
    console.log("Wishlist cleared successfully");
    res.json({ message: "Wishlist cleared", wishlist });
  } catch (error) {
    console.error("=== CLEAR WISHLIST ERROR ===");
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Check if product is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const isInWishlist = await Wishlist.isInWishlist(req.user._id, productId);
    res.json({ isInWishlist });
  } catch (error) {
    console.error("=== CHECK WISHLIST ERROR ===");
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
};
