import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { api } from './services/api';
import { LOADING_DELAY_MS } from './constants/loading';

const AUTH_KEY = 'inventory_auth_user';

function getStoredUser() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredUser()));
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async ({ username, password }) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      const response = await api.login({ username, password });
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
      const user = response.user;
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
    } finally {
      localStorage.removeItem(AUTH_KEY);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={loginError}
      />
    );
  }

  return <DashboardPage currentUser={currentUser} onLogout={handleLogout} isLoggingOut={isSubmitting} />;
}

export default App;
