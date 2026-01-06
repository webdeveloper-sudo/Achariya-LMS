const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminUser = require('./schemas/AdminUser');

const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/';
const DB_NAME = 'achariya_students_db'; // New database name

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI + DB_NAME, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB:', DB_NAME);

        // One-time cleanup: drop old unique index on email if it exists
        try {
            const db = mongoose.connection.db;
            const indexes = await db.collection('students').indexes();
            const emailIndex = indexes.find((idx) => idx.name === 'email_1');
            if (emailIndex) {
                console.log('⚙️ Dropping legacy index "email_1" from students collection...');
                await db.collection('students').dropIndex('email_1');
                console.log('✅ Dropped legacy index "email_1".');
            }
        } catch (cleanupErr) {
            console.warn('⚠️ Could not check/drop legacy email_1 index:', cleanupErr.message);
        }

        // Seed default admin user if not exists
        try {
            const adminEmail = 'admin@achariya.org';
            const existingAdmin = await AdminUser.findOne({ email: adminEmail.toLowerCase() });
            if (!existingAdmin) {
                console.log('👤 Seeding default admin user...');
                const password = '123';
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                await AdminUser.create({
                    email: adminEmail,
                    passwordHash,
                    role: 'Admin'
                });
                console.log('✅ Default admin user created:', adminEmail);
            } else {
                console.log('ℹ️ Admin user already exists:', adminEmail);
            }
        } catch (seedErr) {
            console.error('⚠️ Failed to seed default admin user:', seedErr.message);
        }
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

// Immediately connect when this module is imported
connectDB();

module.exports = {
    connectDB,
    mongoose
};


