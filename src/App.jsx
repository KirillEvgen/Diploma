import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthModal from './components/AuthModal';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={<HomePage onOpenAuth={() => setAuthModalOpen(true)} />} 
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}

export default App;

