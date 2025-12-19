import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "appointments";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Time slots
export const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM"
];

// Validation function
export const validateAppointment = (appointmentData) => {
  const errors = [];
  
  if (!appointmentData.user) {
    errors.push("User is required");
  }
  
  if (!appointmentData.date) {
    errors.push("Date is required");
  }
  
  if (!appointmentData.timeSlot || !TIME_SLOTS.includes(appointmentData.timeSlot)) {
    errors.push("Valid time slot is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create appointment
export const createAppointment = async (appointmentData) => {
  const validation = validateAppointment(appointmentData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }
  
  const collection = getCollection();
  
  // Check if slot is available
  const appointmentDate = new Date(appointmentData.date);
  appointmentDate.setHours(0, 0, 0, 0);
  
  const existingAppointment = await collection.findOne({
    date: appointmentDate,
    timeSlot: appointmentData.timeSlot,
    status: { $ne: 'cancelled' }
  });
  
  if (existingAppointment) {
    throw new Error("This time slot is already booked");
  }
  
  const appointment = {
    user: typeof appointmentData.user === 'string' 
      ? new ObjectId(appointmentData.user) 
      : appointmentData.user,
    repair: appointmentData.repair 
      ? (typeof appointmentData.repair === 'string' 
        ? new ObjectId(appointmentData.repair) 
        : appointmentData.repair)
      : null,
    date: appointmentDate,
    timeSlot: appointmentData.timeSlot,
    deviceType: appointmentData.deviceType || null,
    issue: appointmentData.issue || null,
    notes: appointmentData.notes ? appointmentData.notes.trim() : null,
    technician: appointmentData.technician 
      ? (typeof appointmentData.technician === 'string' 
        ? new ObjectId(appointmentData.technician) 
        : appointmentData.technician)
      : null,
    status: 'scheduled', // scheduled, completed, cancelled
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(appointment);
  return { ...appointment, _id: result.insertedId };
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(appointmentId) });
};

// Get appointments by user
export const getAppointmentsByUser = async (userId) => {
  const collection = getCollection();
  return await collection
    .find({ user: new ObjectId(userId) })
    .sort({ date: -1, timeSlot: 1 })
    .toArray();
};

// Get appointments by technician
export const getAppointmentsByTechnician = async (technicianId) => {
  const collection = getCollection();
  return await collection
    .find({ technician: new ObjectId(technicianId) })
    .sort({ date: -1, timeSlot: 1 })
    .toArray();
};

// Get all appointments
export const getAllAppointments = async (filter = {}) => {
  const collection = getCollection();
  return await collection
    .find(filter)
    .sort({ date: -1, timeSlot: 1 })
    .toArray();
};

// Get available slots for a date
export const getAvailableSlots = async (date) => {
  const collection = getCollection();
  
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  
  const bookedAppointments = await collection
    .find({
      date: appointmentDate,
      status: { $ne: 'cancelled' }
    })
    .toArray();
  
  const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
  const availableSlots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
  
  return availableSlots;
};

// Update appointment
export const updateAppointment = async (appointmentId, updateData) => {
  const collection = getCollection();
  
  const appointment = await getAppointmentById(appointmentId);
  
  if (!appointment) {
    throw new Error("Appointment not found");
  }
  
  // If rescheduling, check new slot availability
  if (updateData.date || updateData.timeSlot) {
    const newDate = updateData.date ? new Date(updateData.date) : appointment.date;
    newDate.setHours(0, 0, 0, 0);
    const newTimeSlot = updateData.timeSlot || appointment.timeSlot;
    
    const existingAppointment = await collection.findOne({
      _id: { $ne: new ObjectId(appointmentId) },
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $ne: 'cancelled' }
    });
    
    if (existingAppointment) {
      throw new Error("This time slot is already booked");
    }
    
    if (updateData.date) {
      updateData.date = newDate;
    }
  }
  
  // Trim string fields
  if (updateData.notes) updateData.notes = updateData.notes.trim();
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date()
  };
  
  await collection.updateOne(
    { _id: new ObjectId(appointmentId) },
    { $set: updateDoc }
  );
  
  return await getAppointmentById(appointmentId);
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  const collection = getCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(appointmentId) },
    {
      $set: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    }
  );
  
  return await getAppointmentById(appointmentId);
};

// Complete appointment
export const completeAppointment = async (appointmentId) => {
  const collection = getCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(appointmentId) },
    {
      $set: {
        status: 'completed',
        updatedAt: new Date()
      }
    }
  );
  
  return await getAppointmentById(appointmentId);
};

// Get upcoming appointments (for reminders)
export const getUpcomingAppointments = async () => {
  const collection = getCollection();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return await collection
    .find({
      date: tomorrow,
      status: 'scheduled',
      reminderSent: false
    })
    .toArray();
};

// Mark reminder as sent
export const markReminderSent = async (appointmentId) => {
  const collection = getCollection();
  
  return await collection.updateOne(
    { _id: new ObjectId(appointmentId) },
    { $set: { reminderSent: true } }
  );
};

export default {
  createAppointment,
  getAppointmentById,
  getAppointmentsByUser,
  getAppointmentsByTechnician,
  getAllAppointments,
  getAvailableSlots,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  getUpcomingAppointments,
  markReminderSent,
  validateAppointment,
  TIME_SLOTS
};
