const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    admissionNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true
    },
    mobileNo: {
        type: String,
        required: true,
        trim: true
    },
    
    school: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    credits: {
        type: Number,
        default: 0,
        min: 0
    },
    school_id: {
        type: Number,
        default: 1
    },
    department: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    completion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    quiz_avg: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    badges: {
        type: Number,
        default: 0,
        min: 0
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastLoginDate: {
        type: String
    },
    streakFreezeUsed: {
        type: Boolean,
        default: false
    },
    serialNo: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
// admissionNo is already unique via the schema definition, so no extra index needed here.
// Email is intentionally NOT unique to allow multiple students without email / with duplicate emails.
// If a unique index on email_1 already exists in MongoDB from an older schema,
// please drop it once with: db.students.dropIndex('email_1')
studentSchema.index({ school_id: 1 });
studentSchema.index({ school: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);

