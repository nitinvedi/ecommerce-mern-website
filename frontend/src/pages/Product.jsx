import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Plus, Minus, ArrowLeft, Heart } from 'lucide-react';
import { api, API_ENDPOINTS } from '../config/api.js';
import { useCart } from '../context/CartContext.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product.isActive) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.REVIEWS(id), review);
      toast.success('Review submitted successfully!');
      setReview({ rating: 5, comment: '' });
      fetchProduct(); // Refresh product to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Product not found</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.startsWith('http') 
                    ? product.images[selectedImage] 
                    : `http://localhost:5000${product.images[selectedImage]}`}
                  alt={product.name}
                  className="w-full h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-slate-700 rounded-lg">
                  <span className="text-slate-400">No image available</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-slate-700'
                    }`}
                  >
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-xl text-white">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-slate-400">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₹{product.price?.toLocaleString()}</span>
              {product.stock !== undefined && (
                <p className="text-slate-400 mt-2">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <p className="text-slate-400 mb-2">Category: <span className="text-white">{product.category}</span></p>
              {product.brand && (
                <p className="text-slate-400 mb-2">Brand: <span className="text-white">{product.brand}</span></p>
              )}
            </div>

            {product.isActive ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-slate-300">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full px-6 py-4 bg-slate-700 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
          
          {user && (
            <form onSubmit={handleSubmitReview} className="bg-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-slate-300 mb-2">Rating</label>
                <select
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-slate-300 mb-2">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">{review.name}</span>
                  </div>
                  <p className="text-slate-300">{review.comment}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
