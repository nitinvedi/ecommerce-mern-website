import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trime: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'technician', 'admin']
    },
    address: {
        street: {type: String, default: null},
        city: {type: String, default: null},
        state: {type: String, default: null},
        zip: {type: String, default: null}
    }
}, {timestamps: true});

userSchema.pre()
