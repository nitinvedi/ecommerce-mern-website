import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/repair.css';
import Navbar from '../components/Navbar';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function Repair() {
  const [formData, setFormData] = useState({
    // Device Information
    deviceType: '',
    brand: '',
    model: '',
    deviceColor: '',
    imeiNumber: '',
    
    // Problem Details
    issue: '',
    problemDescription: '',
    images: [],
    
    // Pickup & Contact Details
    fullName: '',
    phoneNumber: '',
    pickupAddress: '',
    city: '',
    pincode: '',
    pickupDate: '',
    pickupTimeSlot: '',
    
    // Price Section
    estimatedRepairCost: ''
  });

  // Auth modal state
  const [authModal, setAuthModal] = useState(null); // null, 'signin', or 'signup'
  const openSignIn = () => setAuthModal('signin');
  const closeAuth = () => setAuthModal(null);
  const switchToSignUp = () => setAuthModal('signup');
  const switchToSignIn = () => setAuthModal('signin');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Repair Form Submitted:', formData);
    // Handle form submission here
    alert('Repair request submitted successfully! We will contact you soon.');
  };

  return (
    <div className="repair-page min-h-screen bg-linear-to-b from-black via-gray-900 to-black">
      <Navbar openSignUp={openSignIn} />
      
      <div className="repair-container py-12 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
              Book Your Repair
            </h1>
            <p className="text-gray-400 text-lg">
              Fill out the form below and we'll schedule a pickup for your device
            </p>
          </div>

          <form onSubmit={handleSubmit} className="repair-form">
            {/* A. Device Information */}
            <section className="form-section">
              <h2 className="section-title">Device Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Device Type <span className="required">*</span></label>
                  <select 
                    name="deviceType" 
                    value={formData.deviceType}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Device Type</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Brand <span className="required">*</span></label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Apple, Samsung, OnePlus"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model <span className="required">*</span></label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., iPhone 14, Galaxy S23"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Device Color</label>
                  <input
                    type="text"
                    name="deviceColor"
                    value={formData.deviceColor}
                    onChange={handleChange}
                    placeholder="e.g., Black, White, Blue"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>IMEI Number <span className="optional-text">(Optional)</span></label>
                  <input
                    type="text"
                    name="imeiNumber"
                    value={formData.imeiNumber}
                    onChange={handleChange}
                    placeholder="15-digit IMEI (optional)"
                    className="form-input"
                  />
                </div>
              </div>
            </section>

            {/* B. Problem Details */}
            <section className="form-section">
              <h2 className="section-title">Problem Details</h2>
              
              <div className="form-group">
                <label>Select Issue <span className="required">*</span></label>
                <select 
                  name="issue" 
                  value={formData.issue}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Issue</option>
                  <option value="Screen Damage">Screen Damage</option>
                  <option value="Battery">Battery</option>
                  <option value="Camera">Camera</option>
                  <option value="Mic">Mic</option>
                  <option value="Not Turning On">Not Turning On</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Describe the Problem <span className="required">*</span></label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleChange}
                  placeholder="Please describe the issue in detail..."
                  className="form-input form-textarea"
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Images (Optional)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="imageUpload" className="file-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Click to upload or drag and drop</span>
                    <span className="file-hint">PNG, JPG, GIF up to 10MB</span>
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* C. Pickup & Contact Details */}
            <section className="form-section">
              <h2 className="section-title">Pickup & Contact Details</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Pickup Address <span className="required">*</span></label>
                  <textarea
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    className="form-input form-textarea"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pincode <span className="required">*</span></label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Pickup Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Pickup Time Slot <span className="required">*</span></label>
                  <select 
                    name="pickupTimeSlot" 
                    value={formData.pickupTimeSlot}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Time Slot</option>
                    <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                    <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
                    <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM</option>
                  </select>
                </div>
              </div>
            </section>

            {/* D. Price Section */}
            <section className="form-section">
              <h2 className="section-title">Price Information</h2>
              
              <div className="price-info">
                <div className="price-item">
                  <span className="price-label">Estimated inspection fee:</span>
                  <span className="price-value">₹0 - ₹199</span>
                </div>
                
                <div className="form-group">
                  <label>Estimated Repair Cost (if known)</label>
                  <input
                    type="text"
                    name="estimatedRepairCost"
                    value={formData.estimatedRepairCost}
                    onChange={handleChange}
                    placeholder="Enter estimated cost (optional)"
                    className="form-input"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="submit-section">
              <button type="submit" className="submit-btn">
                Book Repair
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* AUTH MODAL */}
      {authModal === 'signin' && (
        <div className="signup-modal fixed inset-0 z-99999">
          <SignIn onClose={closeAuth} onSwitchToSignUp={switchToSignUp} />
        </div>
      )}
      {authModal === 'signup' && (
        <div className="signup-modal fixed inset-0 z-99999">
          <SignUp onClose={closeAuth} onSwitchToSignIn={switchToSignIn} />
        </div>
      )}
    </div>
  );
}
