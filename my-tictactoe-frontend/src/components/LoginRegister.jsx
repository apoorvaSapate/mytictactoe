import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser } from './features/auth/authSlice'; // Adjust the import path as necessary

const LoginRegister = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (error) {
            setMessage(error);
            setIsError(true);
        } else {
            setMessage(''); // Clear error message when error state changes to null
        }
    }, [error]);

    // Import registerUser and loginUser from authSlice
    const { registerUser, loginUser } = require('./features/auth/authSlice'); // Dynamic import for demonstration

    const handleRegister = async () => {
        setMessage('');
        setIsError(false);
        const resultAction = await dispatch(registerUser({ email, password }));
        if (registerUser.fulfilled.match(resultAction)) {
            setMessage('Registration successful!');
            setIsError(false);
        } else if (registerUser.rejected.match(resultAction)) {
            setMessage(resultAction.payload || 'Registration failed.');
            setIsError(true);
        }
    };

    const handleLogin = async () => {
        setMessage('');
        setIsError(false);
        const resultAction = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(resultAction)) {
            setMessage('Login successful!');
            setIsError(false);
        } else if (loginUser.rejected.match(resultAction)) {
            setMessage(resultAction.payload || 'Login failed.');
            setIsError(true);
        }
    };

    if (isAuthenticated) {
        return null; // This component should not be visible if authenticated
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Access Your Game</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Logging In...' : 'Login'}
            </button>
            {message && (
                <div className={`mt-6 p-4 rounded-lg w-full text-center ${isError ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default LoginRegister;