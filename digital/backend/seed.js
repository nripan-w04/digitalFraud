import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './model/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database...');

        const adminEmail = 'admin@fraudguard.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('AdminPassword123', 10);
            const admin = new User({
                username: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin'
            });
            await admin.save();
            console.log('Admin seeded successfully!');
            console.log('Email: admin@fraudguard.com');
            console.log('Password: AdminPassword123');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seed();
