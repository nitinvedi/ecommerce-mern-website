
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sampleProducts = [
    {
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        description: "The ultimate iPhone. Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever.",
        price: 159900,
        category: "Mobile",
        stock: 50,
        isActive: true,
        images: ["/uploads/products/default-phone.png"],
        featured: true
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        description: "Galaxy AI is here. Epic design, new titanium exterior, and a built-in S Pen.",
        price: 129999,
        category: "Mobile",
        stock: 35,
        isActive: true,
        images: ["/uploads/products/default-phone.png"],
        featured: true
    },
    {
        name: "MacBook Air M3",
        brand: "Apple",
        description: "Lean. Mean. M3 machine. Supercharged by the M3 chip.",
        price: 114900,
        category: "Laptop",
        stock: 20,
        isActive: true,
        images: ["/uploads/products/default-laptop.png"],
        featured: true
    },
    {
        name: "Sony WH-1000XM5",
        brand: "Sony",
        description: "Industry-leading noise canceling headphones with Auto NC Optimizer.",
        price: 29990,
        category: "Accessories",
        stock: 100,
        isActive: true,
        images: ["/uploads/products/default-accessory.png"],
        featured: false
    },
    {
        name: "iPad Air",
        brand: "Apple",
        description: "Light. Bright. Full of might. Now with the M2 chip.",
        price: 59900,
        category: "Tablet",
        stock: 45,
        isActive: true,
        images: ["/uploads/products/default-tablet.png"],
        featured: false
    }
];

const seedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.db.collection('products');

        // Optional: clear existing products? 
        // For safety, let's just insert if empty or append.
        // Actually, let's upsert based on name to avoid duplicates.

        let addedCount = 0;

        for (const p of sampleProducts) {
            const result = await collection.updateOne(
                { name: p.name },
                { $setOnInsert: { ...p, createdAt: new Date(), updatedAt: new Date(), viewCount: 0, rating: 0, numReviews: 0, reviews: [] } },
                { upsert: true }
            );
            if (result.upsertedCount > 0) addedCount++;
        }

        console.log(`Successfully seeded ${addedCount} new products.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
        process.exit();
    }
};

seedProducts();
