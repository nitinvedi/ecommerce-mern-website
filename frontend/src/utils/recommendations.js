// Recommendation utilities

// Get recently viewed products from localStorage
export const getRecentlyViewed = () => {
  try {
    const viewed = localStorage.getItem('recentlyViewed');
    return viewed ? JSON.parse(viewed) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

// Add product to recently viewed
export const addToRecentlyViewed = (productId) => {
  try {
    let viewed = getRecentlyViewed();
    
    // Remove if already exists
    viewed = viewed.filter(id => id !== productId);
    
    // Add to beginning
    viewed.unshift(productId);
    
    // Keep only last 10
    viewed = viewed.slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

// Get recommended products based on category
export const getRelatedProducts = (currentProduct, allProducts, limit = 4) => {
  if (!currentProduct || !allProducts) return [];
  
  return allProducts
    .filter(p => 
      p._id !== currentProduct._id && 
      p.category === currentProduct.category
    )
    .slice(0, limit);
};

// Get personalized recommendations
export const getPersonalizedRecommendations = (allProducts, recentlyViewedIds, limit = 4) => {
  if (!allProducts || recentlyViewedIds.length === 0) {
    // Return random products if no history
    return allProducts.slice(0, limit);
  }
  
  // Get categories from recently viewed
  const recentlyViewedProducts = allProducts.filter(p => 
    recentlyViewedIds.includes(p._id)
  );
  
  const viewedCategories = [...new Set(
    recentlyViewedProducts.map(p => p.category)
  )];
  
  // Get products from same categories
  const recommendations = allProducts
    .filter(p => 
      !recentlyViewedIds.includes(p._id) && 
      viewedCategories.includes(p.category)
    )
    .slice(0, limit);
  
  // Fill with random if not enough
  if (recommendations.length < limit) {
    const remaining = allProducts
      .filter(p => 
        !recentlyViewedIds.includes(p._id) && 
        !recommendations.find(r => r._id === p._id)
      )
      .slice(0, limit - recommendations.length);
    
    return [...recommendations, ...remaining];
  }
  
  return recommendations;
};

export default {
  getRecentlyViewed,
  addToRecentlyViewed,
  getRelatedProducts,
  getPersonalizedRecommendations
};
