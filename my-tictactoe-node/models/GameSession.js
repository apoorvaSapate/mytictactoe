const mongoose = require('mongoose'); // For MongoDB interaction

const gameSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    board: {
        type: [[String]], // 3x3 array of strings
        required: true
    },
    currentPlayer: {
        type: String, // 'X' or 'O'
        required: true
    },
    status: {
        type: String, // 'ongoing', 'user_win', 'computer_win', 'draw'
        required: true
    },
    userPlayer: {
        type: String, // 'X'
        required: true
    },
    computerPlayer: {
        type: String, // 'O'
        required: true
    }
}, { timestamps: true });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

module.exports = GameSession;