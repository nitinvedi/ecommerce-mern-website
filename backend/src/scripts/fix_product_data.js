import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

const fixData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const result = await Product.updateMany(
            { name: { $regex: /iphone 18/i } },
            {
                $set: {
                    name: "iPhone 18",
                    price: 99999
                }
            }
        );

        console.log(`Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
        process.exit();
    }
};

fixData();
