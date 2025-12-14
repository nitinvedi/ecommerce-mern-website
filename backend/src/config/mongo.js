import { MongoClient } from "mongodb";

let db;
let client;

// MongoDB connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Connect to MongoDB
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    client = new MongoClient(process.env.MONGO_URI, options);
    await client.connect();
    
    const dbName = process.env.DB_NAME || "repairEcommerce";
    db = client.db(dbName);

    console.log("✅ MongoDB Connected (Native Driver)");
    console.log(`📦 Database: ${dbName}`);
    
    // Test connection
    await db.admin().ping();
    console.log("✅ MongoDB Connection Test Successful");
    
    return db;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

// Get database instance
export const getDB = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
};

// Get MongoDB client
export const getClient = () => {
  if (!client) {
    throw new Error("MongoDB client not connected. Call connectDB() first.");
  }
  return client;
};

// Close database connection
export const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log("✅ MongoDB connection closed");
    }
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
  }
};

// Check database connection status
export const isConnected = () => {
  return db !== undefined && client !== undefined;
};
