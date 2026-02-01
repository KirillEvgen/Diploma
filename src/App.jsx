import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CoursePage from './pages/CoursePage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
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
        <Route 
          path="/course/:id" 
          element={<CoursePage onOpenAuth={() => setAuthModalOpen(true)} />} 
        />
        <Route 
          path="/profile" 
          element={<ProfilePage onOpenAuth={() => setAuthModalOpen(true)} />} 
        />
        <Route 
          path="/course/:courseId/workout/:workoutId" 
          element={<WorkoutPage onOpenAuth={() => setAuthModalOpen(true)} />} 
        />
      </Routes>
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default App;



