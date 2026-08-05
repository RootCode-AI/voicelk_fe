import { useState } from 'react';
import AuthPage from './components/AuthPage';
import MainLayout from './components/MainLayout';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated
    ? <MainLayout />
    : <AuthPage onLogin={() => setIsAuthenticated(true)} />;
}

export default App;
