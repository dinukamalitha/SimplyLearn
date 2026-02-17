const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./modules/auth/User');

dotenv.config();

const forceVerify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'verified_user@example.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('User not found, creating...');
            // Create if not exists (hash password 'password123')
            // For simplicity, just update if exists. If not, we have to create.
            // Let's assume verify_cookie.js created it but failed login.
            // If not, we create one.
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash('password123', salt);

            user = await User.create({
                name: 'Verified User',
                email,
                password_hash,
                role: 'Student',
                is_verified: true
            });
            console.log('User created and verifying...');
        } else {
            user.is_verified = true;
            user.failed_login_attempts = 0;
            user.lock_until = undefined;
            await user.save();
            console.log('User verified.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

forceVerify();
