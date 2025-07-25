import React from 'react';

const Board = ({ board, onCellClick, currentPlayer, status }) => {
    const renderCell = (row, col) => (
        <button
            key={`${row}-${col}`}
            className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl font-bold bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm
                        ${board[row][col] === 'X' ? 'text-blue-600' : board[row][col] === 'O' ? 'text-red-600' : 'text-gray-800'}
                        ${status === 'ongoing' && board[row][col] === '' ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-default'}`}
            onClick={() => onCellClick(row, col)}
            disabled={board[row][col] !== '' || status !== 'ongoing' || currentPlayer !== 'X'} // Disable if not user's turn
        >
            {board[row][col]}
        </button>
    );

    return (
        <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-xl shadow-lg">
            {board.map((rowArr, rowIndex) =>
                rowArr.map((cell, colIndex) => renderCell(rowIndex, colIndex))
            )}
        </div>
    );
};

export default Board;
