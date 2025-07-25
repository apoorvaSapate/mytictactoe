import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout as authLogout } from '../auth/authSlice'; // Import logout action from authSlice

const backendUrl = 'http://localhost:3000'; // Ensure this matches your Node.js server port

// Game Thunks
export const startGame = createAsyncThunk(
    'game/startGame',
    async (playerStarts, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue('No authentication token found.');
        }
        try {
            const response = await fetch(`${backendUrl}/game/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ playerStarts }),
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to start game.');
            }
            return data;
        } catch (error) {
            console.error('Start game network error:', error);
            return rejectWithValue('Network error starting game.');
        }
    }
);

export const makeMove = createAsyncThunk(
    'game/makeMove',
    async ({ sessionId, row, col }, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue('No authentication token found.');
        }
        try {
            const response = await fetch(`${backendUrl}/game/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId, row, col }),
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to make move.');
            }
            return data;
        } catch (error) {
            console.error('Make move network error:', error);
            return rejectWithValue('Network error making move.');
        }
    }
);

export const fetchStats = createAsyncThunk(
    'game/fetchStats',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue('No authentication token found.');
        }
        try {
            const response = await fetch(`${backendUrl}/game/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch statistics.');
            }
            return data.stats;
        } catch (error) {
            console.error('Fetch stats network error:', error);
            return rejectWithValue('Network error fetching statistics.');
        }
    }
);

const initialGameState = {
    sessionId: null,
    board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ],
    currentPlayer: '',
    status: 'idle', // 'idle', 'ongoing', 'user_win', 'computer_win', 'draw'
    loading: false, // These states will no longer be updated by extraReducers
    error: null,    // These states will no longer be updated by extraReducers
    stats: { wins: 0, losses: 0, draws: 0 },
    statsLoading: false, // These states will no longer be updated by extraReducers
    statsError: null,    // These states will no longer be updated by extraReducers
};

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        resetGame: (state) => {
            Object.assign(state, {
                ...initialGameState,
                stats: state.stats, // Keep existing stats
            });
        },
    },
});

export const { resetGame } = gameSlice.actions; // Export resetGame action
export default gameSlice.reducer; // Export the reducer as default
