
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { sendEmail } from '../src/utils/emailService.js';

const testEmail = async () => {
    console.log("Testing Email Service...");
    console.log("User:", process.env.EMAIL_USER ? "Set" : "Not Set");
    console.log("Pass:", process.env.EMAIL_PASSWORD ? "Set" : "Not Set");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error("Missing credentials!");
        return;
    }

    const result = await sendEmail({
        to: process.env.EMAIL_USER, // Send to self
        subject: "Test Email from Debugger",
        html: "<h1>It Works!</h1><p>Email service is configured correctly.</p>",
        text: "It verify email service is working."
    });

    console.log("Result:", result);
};

testEmail();
