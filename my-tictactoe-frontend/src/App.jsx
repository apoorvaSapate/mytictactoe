import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import store from './app/store';
import Header from './components/Header';
import LoginRegister from './components/LoginRegister';
import Stats from './components/Stats';

// Main App Component
function App() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [view, setView] = useState('login'); // 'login', 'game', 'stats'

    // Effect to redirect based on authentication status
    useEffect(() => {
        if (isAuthenticated) {
            setView('game'); // Redirect to game if already authenticated
        } else {
            setView('login');
        }
    }, [isAuthenticated]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans text-gray-800">
            <Header />

            <div className="flex flex-col md:flex-row md:space-x-8 mt-8 w-full justify-center items-start">
                {isAuthenticated && (
                    <nav className="mb-8 md:mb-0 md:w-1/4 max-w-xs w-full bg-white p-6 rounded-xl shadow-lg">
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => setView('game')}
                                    className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition duration-200 ease-in-out
                                        ${view === 'game' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Play Game
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setView('stats')}
                                    className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition duration-200 ease-in-out
                                        ${view === 'stats' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    View Statistics
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}

                <main className="w-full md:w-3/4 flex justify-center">
                    {!isAuthenticated && <LoginRegister />}
                    {isAuthenticated && view === 'game' && <Game />}
                    {isAuthenticated && view === 'stats' && <Stats />}
                </main>
            </div>
        </div>
    );
}

// Export the main App component wrapped with Redux Provider
export default function ProvidedApp() {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
}
