const mongoose = require('mongoose'); // For MongoDB interaction

const userSchema = new mongoose.Schema({
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
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 }
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

module.exports = User;