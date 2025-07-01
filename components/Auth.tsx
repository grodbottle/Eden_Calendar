
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (username: string, pin: string) => Promise<boolean>;
  onRegister: (username: string, pin: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (isRegister) {
      await onRegister(username, pin);
    } else {
      await onLogin(username, pin);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
          {isRegister ? 'Create Account' : "Eden's Calendar"}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          {isRegister ? 'Create a PIN to secure your calendar.' : 'Please log in to continue.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isLoading}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                4-Digit PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={4}
                minLength={4}
                pattern="\d{4}"
                title="PIN must be 4 digits"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
          </fieldset>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : (isRegister ? 'Register' : 'Login')}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline" disabled={isLoading}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;