import * as Address from "../models/Address.js";

// Get user addresses
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.getAddressesByUser(req.user._id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get default address
export const getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.getDefaultAddress(req.user._id);
    if (!address) {
      return res.status(404).json({ message: "No default address found" });
    }
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const address = await Address.createAddress(req.user._id, req.body);
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.updateAddress(id, req.user._id, req.body);
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.setDefaultAddress(id, req.user._id);
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await Address.deleteAddress(id, req.user._id);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAddresses,
  getDefaultAddress,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
};
