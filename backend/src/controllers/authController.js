import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

const generateToken = (userId) => {
    return jwt.sign({id: userId, process.env.JWT_SECRET}, {expiresIn: '30d'});
}

export const registerUser = async (req, res) => {
    try {
        const {name, email, password, phone} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({message: 'Please fill all required fields'});
        }

        
    }
}