// server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Required for frontend to communicate with backend
const mongoose = require('mongoose'); // For MongoDB interaction
require('dotenv').config(); // Load environment variables from .env file

const User = require('./models/User');
const GameSession = require('./models/GameSession');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const JWT_SECRET = process.env.JWT_SECRET; // Get secret from environment variables
const MONGODB_URL = process.env.MONGODB_URL; // MongoDB connection URL

// Ensure JWT_SECRET and MONGODB_URL are set
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not defined. Please set it in your .env file.');
    process.exit(1); // Exit the process if the secret is not configured
}
if (!MONGODB_URL) {
    console.error('ERROR: MONGODB_URL is not defined.');
    process.exit(1); // Exit the process if the MongoDB URL is not configured
}

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Use bodyParser.json() for JSON payloads
app.use(cors()); // Enable CORS for all routes

/**
 * Checks if a player has won the game.
 * @param {Array<Array<string>>} board - The current 3x3 game board.
 * @param {string} player - The player to check ('X' or 'O').
 * @returns {boolean} True if the player has won, false otherwise.
 */
function checkWinner(board, player) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
            return true;
        }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
        if (board[0][j] === player && board[1][j] === player && board[2][j] === player) {
            return true;
        }
    }
    // Check diagonals
    if (
        (board[0][0] === player && board[1][1] === player && board[2][2] === player) ||
        (board[0][2] === player && board[1][1] === player && board[2][0] === player)
    ) {
        return true;
    }
    return false;
}

/**
 * Checks if the game is a draw.
 * @param {Array<Array<string>>} board - The current 3x3 game board.
 * @returns {boolean} True if the game is a draw, false otherwise.
 */
function checkDraw(board) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                return false; // Found an empty cell, not a draw yet
            }
        }
    }
    return true; // All cells filled, no winner, so it's a draw
}

/**
 * Gets available moves on the board.
 * @param {Array<Array<string>>} board - The current 3x3 game board.
 * @returns {Array<{row: number, col: number}>} An array of available moves.
 */
function getAvailableMoves(board) {
    const moves = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === '') {
                moves.push({ row: r, col: c });
            }
        }
    }
    return moves;
}

/**
 * Implements a simple AI for the computer's move (random move for simplicity).
 * In a real Python API, this would be a more sophisticated AI (e.g., Minimax).
 * @param {Array<Array<string>>} board - The current 3x3 game board.
 * @returns {{row: number, col: number} | null} The computer's chosen move, or null if no moves available.
 */
function getComputerMove(board) {
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) {
        return null;
    }
    
    // Randomly select one of the available moves
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

/**
 * Updates user statistics based on game outcome.
 * @param {string} userId - The ID of the user.
 * @param {string} outcome - The outcome of the game ('win', 'loss', 'draw').
 */
async function updateStatistics(userId, outcome) {
    try {
        let updateQuery = {};
        if (outcome === 'win') {
            updateQuery = { $inc: { 'stats.wins': 1 } };
        } else if (outcome === 'loss') {
            updateQuery = { $inc: { 'stats.losses': 1 } };
        } else if (outcome === 'draw') {
            updateQuery = { $inc: { 'stats.draws': 1 } };
        }
        await User.findByIdAndUpdate(userId, updateQuery);
    } catch (error) {
        console.error('Error updating user statistics:', error);
    }
}

// --- JWT Authentication Middleware ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach user payload to request (id, email)
        next();
    });
}

// --- Routes ---

// 1. User Authentication
/**
 * @api {post} /register Register a new user
 */
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            passwordHash: hashedPassword,
            stats: { wins: 0, losses: 0, draws: 0 }
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * @api {post} /login Log in a user
 */
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 2. Gameplay Session (Protected Routes)

/**
 * @api {post} /game/start Start a new game session
 */
app.post('/game/start', authenticateToken, async (req, res) => {
    const { playerStarts } = req.body;
    const userId = req.user.id; // User ID from JWT

    if (typeof playerStarts !== 'boolean') {
        return res.status(400).json({ message: 'playerStarts (boolean) is required' });
    }

    const initialBoard = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    let currentPlayer = playerStarts ? 'X' : 'O'; // 'X' for user, 'O' for computer
    let status = 'ongoing';

    // If computer starts, make its first move
    if (!playerStarts) {
        const computerMove = getComputerMove(initialBoard);
        if (computerMove) {
            initialBoard[computerMove.row][computerMove.col] = 'O'; // Computer is 'O'
            // After computer's move, check if it won or drew (unlikely on first move but good practice)
            if (checkWinner(initialBoard, 'O')) {
                status = 'computer_win'; // Specific status for computer win
                await updateStatistics(userId, 'loss');
            } else if (checkDraw(initialBoard)) {
                status = 'draw';
                await updateStatistics(userId, 'draw');
            } else {
                currentPlayer = 'X'; // Switch back to user's turn
            }
        }
    }

    try {
        const newGameSession = new GameSession({
            userId,
            board: initialBoard,
            currentPlayer,
            status,
            userPlayer: 'X', // User is always 'X'
            computerPlayer: 'O' // Computer is always 'O'
        });
        await newGameSession.save();

        res.json({
            sessionId: newGameSession._id,
            board: newGameSession.board,
            currentPlayer: newGameSession.currentPlayer,
            status: newGameSession.status
        });
    } catch (error) {
        console.error('Error starting game session:', error);
        res.status(500).json({ message: 'Server error starting game' });
    }
});

/**
 * @api {post} /game/move Make a move in an ongoing game
 */
app.post('/game/move', authenticateToken, async (req, res) => {
    const { sessionId, row, col } = req.body;
    const userId = req.user.id; // User ID from JWT

    try {
        const session = await GameSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Game session not found' });
        }
        
        if (session.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized for this game session' });
        }
      
        if (session.currentPlayer !== session.userPlayer) {
            return res.status(400).json({ message: 'It is not your turn' });
        }
        if (row < 0 || row > 2 || col < 0 || col > 2 || session.board[row][col] !== '') {
            return res.status(400).json({ message: 'Invalid move: cell already taken or out of bounds' });
        }

        // User makes a move ('X')
        session.board[row][col] = session.userPlayer;

        // Check for user win
        if (checkWinner(session.board, session.userPlayer)) {
            session.status = 'user_win';
            await updateStatistics(userId, 'win');
        }
        // Check for draw after user's move (only if not already won by user)
        else if (checkDraw(session.board)) {
            session.status = 'draw';
            await updateStatistics(userId, 'draw');
        }
        // If game is still ongoing after user's move, it's computer's turn
        else {
            session.currentPlayer = session.computerPlayer;

            const computerMove = getComputerMove(session.board);
            if (computerMove) {
                session.board[computerMove.row][computerMove.col] = session.computerPlayer;

                // Check for computer win after its move
                if (checkWinner(session.board, session.computerPlayer)) {
                    session.status = 'computer_win';
                    await updateStatistics(userId, 'loss');
                }
                // Check for draw after computer's move (only if not already won by computer)
                else if (checkDraw(session.board)) {
                    session.status = 'draw';
                    await updateStatistics(userId, 'draw');
                }
                // If game is still ongoing after computer's move, switch back to user's turn
                else {
                    session.currentPlayer = session.userPlayer;
                }
            } else {
                // This case means no available moves for computer, so it's a draw
                session.status = 'draw';
                await updateStatistics(userId, 'draw');
            }
        }

        await session.save(); // Save the updated session to MongoDB

        // Send the final state after all moves and checks
        res.json({
            board: session.board,
            currentPlayer: session.currentPlayer,
            status: session.status
        });
    } catch (error) {
        console.error('Error making move:', error);
        res.status(500).json({ message: 'Server error processing move' });
    }
});


// 3. Statistics Tracking (Protected Route)

/**
 * @api {get} /game/stats Get user's game statistics
 */
app.get('/game/stats', authenticateToken, async (req, res) => {
    const userId = req.user.id; // User ID from JWT
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ stats: user.stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

app.listen(PORT, () => console.log(`Node.js Tic-Tac-Toe Backend listening on port ${PORT}`));
