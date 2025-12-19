import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "invoices";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Generate invoice number
const generateInvoiceNumber = async () => {
  const collection = getCollection();
  const count = await collection.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
};

// Create invoice
export const createInvoice = async (invoiceData) => {
  const invoiceNumber = await generateInvoiceNumber();
  
  const invoice = {
    order: typeof invoiceData.order === 'string' 
      ? new ObjectId(invoiceData.order) 
      : invoiceData.order,
    user: typeof invoiceData.user === 'string' 
      ? new ObjectId(invoiceData.user) 
      : invoiceData.user,
    invoiceNumber,
    items: invoiceData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    })),
    subtotal: invoiceData.subtotal || 0,
    taxRate: invoiceData.taxRate || 0.18, // 18% GST
    taxAmount: invoiceData.taxAmount || 0,
    shippingCharge: invoiceData.shippingCharge || 0,
    totalAmount: invoiceData.totalAmount || 0,
    gstDetails: {
      gstin: invoiceData.gstDetails?.gstin || null,
      cgst: invoiceData.gstDetails?.cgst || 0,
      sgst: invoiceData.gstDetails?.sgst || 0,
      igst: invoiceData.gstDetails?.igst || 0
    },
    billingAddress: invoiceData.billingAddress,
    shippingAddress: invoiceData.shippingAddress,
    paymentMethod: invoiceData.paymentMethod || 'Cash on Delivery',
    pdfPath: null, // Will be set after PDF generation
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const collection = getCollection();
  const result = await collection.insertOne(invoice);
  return { ...invoice, _id: result.insertedId };
};

// Get invoice by order ID
export const getInvoiceByOrderId = async (orderId) => {
  const collection = getCollection();
  return await collection.findOne({ order: new ObjectId(orderId) });
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(invoiceId) });
};

// Get invoice by invoice number
export const getInvoiceByNumber = async (invoiceNumber) => {
  const collection = getCollection();
  return await collection.findOne({ invoiceNumber });
};

// Get invoices by user
export const getInvoicesByUser = async (userId) => {
  const collection = getCollection();
  return await collection
    .find({ user: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
};

// Update invoice (e.g., to set PDF path)
export const updateInvoice = async (invoiceId, updateData) => {
  const collection = getCollection();
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };
  
  await collection.updateOne(
    { _id: new ObjectId(invoiceId) },
    { $set: updateDoc }
  );
  
  return await getInvoiceById(invoiceId);
};

// Delete invoice
export const deleteInvoice = async (invoiceId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(invoiceId) });
};

// Get all invoices
export const getAllInvoices = async (filter = {}) => {
  const collection = getCollection();
  return await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
};

export default {
  createInvoice,
  getInvoiceByOrderId,
  getInvoiceById,
  getInvoiceByNumber,
  getInvoicesByUser,
  updateInvoice,
  deleteInvoice,
  getAllInvoices
};
