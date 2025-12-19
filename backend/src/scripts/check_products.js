
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.db.collection('products');

        const total = await collection.countDocuments();
        console.log(`Total products: ${total}`);

        const activeCount = await collection.countDocuments({ isActive: true });
        console.log(`Active products: ${activeCount}`);

        const inactiveCount = await collection.countDocuments({ isActive: false });
        console.log(`Inactive products: ${inactiveCount}`);

        const noActiveFieldCount = await collection.countDocuments({ isActive: { $exists: false } });
        console.log(`Products without isActive field: ${noActiveFieldCount}`);

        if (total > 0) {
            const sample = await collection.find({}).limit(3).toArray();
            console.log("Sample products:", JSON.stringify(sample, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
        process.exit();
    }
};

checkData();
