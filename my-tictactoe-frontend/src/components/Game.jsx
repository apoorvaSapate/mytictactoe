import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame, makeMove, fetchStats, resetGame } from '../features/game/gameSlice';
import Board from './Board';

const Game = () => {
    const dispatch = useDispatch();
    const { sessionId, board, currentPlayer, status, loading, error } = useSelector((state) => state.game);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (error) {
            setMessage(error);
            setIsError(true);
        } else {
            setMessage('');
            setIsError(false);
        }
    }, [error]);

    const handleStartGame = async (playerStarts) => {
        setMessage('');
        setIsError(false);
        const resultAction = await dispatch(startGame(playerStarts));
        if (startGame.rejected.match(resultAction)) {
            setMessage(resultAction.payload || 'Failed to start game.');
            setIsError(true);
        }
    };

    const handleCellClick = async (row, col) => {
        if (status !== 'ongoing' || currentPlayer !== 'X') {
            setMessage('It is not your turn or the game is not ongoing.');
            setIsError(true);
            return;
        }
        setMessage('');
        setIsError(false);
        const resultAction = await dispatch(makeMove({ sessionId, row, col }));
        if (makeMove.rejected.match(resultAction)) {
            setMessage(resultAction.payload || 'Failed to make move.');
            setIsError(true);
        }
    };

    const getStatusMessage = () => {
        if (status === 'user_win') return 'You Win!';
        if (status === 'computer_win') return 'Computer Wins!';
        if (status === 'draw') return 'It\'s a Draw!';
        if (status === 'ongoing') {
            return currentPlayer === 'X' ? 'Your Turn (X)' : 'Computer\'s Turn (O)';
        }
        return 'Choose who starts!';
    };

    if (!isAuthenticated) {
        return null; // This component should not be visible if not authenticated
    }

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Tic-Tac-Toe Game</h2>

            <div className="text-xl font-semibold mb-6 text-gray-700">
                {loading ? 'Loading...' : getStatusMessage()}
            </div>

            {status === 'idle' || status === 'user_win' || status === 'computer_win' || status === 'draw' ? (
                <div className="flex flex-col space-y-4 w-full max-w-xs">
                    <button
                        onClick={() => handleStartGame(true)}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Game (You Go First)
                    </button>
                    <button
                        onClick={() => handleStartGame(false)}
                        disabled={loading}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Game (Computer Goes First)
                    </button>
                    <button
                        onClick={() => dispatch(resetGame())}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                        Reset Game State
                    </button>
                </div>
            ) : (
                <Board board={board} onCellClick={handleCellClick} currentPlayer={currentPlayer} status={status} />
            )}

            {message && (
                <div className={`mt-6 p-4 rounded-lg w-full text-center ${isError ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-blue-100 text-blue-700 border border-blue-400'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default Game;