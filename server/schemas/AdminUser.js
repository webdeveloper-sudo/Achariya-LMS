const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['Admin'],
            default: 'Admin'
        }
    },
    {
        timestamps: true
    }
);

adminUserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);


