
import { useState, useCallback } from 'react';

const SESSION_STORAGE_KEY = 'custodyAppCurrentUser';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performAuthAction = useCallback(async (action: 'login' | 'register', username: string, pin: string) => {
    setError(null);
    setIsLoading(true);

    if (!username.trim() || !pin.trim()) {
      setError("Username and PIN cannot be empty.");
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'An error occurred.');
        return false;
      }
      
      const loggedInUsername = data.user.username;
      setCurrentUser(loggedInUsername);
      sessionStorage.setItem(SESSION_STORAGE_KEY, loggedInUsername);
      return true;

    } catch (e) {
      setError('Failed to connect to the server.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const login = useCallback((username: string, pin: string) => {
    return performAuthAction('login', username, pin);
  }, [performAuthAction]);

  const register = useCallback((username: string, pin: string) => {
    return performAuthAction('register', username, pin);
  }, [performAuthAction]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  return { currentUser, login, register, logout, error, isLoading };
};