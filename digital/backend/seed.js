const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/digitalmodel');

async function seed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/DigitalPayment');
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
