import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice'; // Import the logout action

const Header = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const handleLogout = () => {
        dispatch(logout()); // Use the logout action from authSlice
    };

    return (
        <header className="bg-indigo-600 text-white p-4 shadow-md rounded-b-xl w-full">
            <nav className="container mx-auto flex justify-between items-center">
                <h1 className="text-3xl font-bold rounded-lg px-3 py-1 bg-indigo-700">Tic-Tac-Toe</h1>
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                        Logout
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Header;