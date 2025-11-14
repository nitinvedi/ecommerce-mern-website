import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            userNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Mongo DB connected');
    } catch (error) {
        console.log('MongoDB connection failed', error.message)
    }
    process.exit();
}

export default connectDB;