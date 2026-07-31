import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/auth';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute, PublicRoute, OnboardingGuard } from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CoachPage from './pages/CoachPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutPlanDetailPage from './pages/WorkoutPlanDetailPage';
import WorkoutSessionPage from './pages/WorkoutSessionPage';
import NutritionPage from './pages/NutritionPage';
import FoodLogPage from './pages/FoodLogPage';
import ProgressPage from './pages/ProgressPage';
import WeightPage from './pages/WeightPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MemoryPage from './pages/MemoryPage';
import DocumentsPage from './pages/DocumentsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import PhotosPage from './pages/PhotosPage';
import NotFoundPage from './pages/NotFoundPage';
import ComingSoonPage from './pages/ComingSoonPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<OnboardingGuard><DashboardPage /></OnboardingGuard>} />
              <Route path="/coach" element={<OnboardingGuard><CoachPage /></OnboardingGuard>} />
              <Route path="/workouts" element={<OnboardingGuard><WorkoutsPage /></OnboardingGuard>} />
              <Route path="/workouts/:planId" element={<OnboardingGuard><WorkoutPlanDetailPage /></OnboardingGuard>} />
              <Route path="/workouts/session/:sessionId" element={<OnboardingGuard><WorkoutSessionPage /></OnboardingGuard>} />
              <Route path="/nutrition" element={<OnboardingGuard><NutritionPage /></OnboardingGuard>} />
              <Route path="/nutrition/log" element={<OnboardingGuard><FoodLogPage /></OnboardingGuard>} />
              <Route path="/nutrition/meal-plans" element={<OnboardingGuard><ComingSoonPage title="Meal Plans" feature="AI meal plan generation" /></OnboardingGuard>} />
              <Route path="/nutrition/recipes" element={<OnboardingGuard><ComingSoonPage title="Recipes" feature="Recipe generator" /></OnboardingGuard>} />
              <Route path="/nutrition/grocery" element={<OnboardingGuard><ComingSoonPage title="Grocery Lists" feature="Grocery list generation" /></OnboardingGuard>} />
              <Route path="/progress" element={<OnboardingGuard><ProgressPage /></OnboardingGuard>} />
              <Route path="/progress/weight" element={<OnboardingGuard><WeightPage /></OnboardingGuard>} />
              <Route path="/progress/measurements" element={<OnboardingGuard><ComingSoonPage title="Body Measurements" feature="Body measurement tracking" /></OnboardingGuard>} />
              <Route path="/progress/records" element={<OnboardingGuard><ComingSoonPage title="Personal Records" feature="Personal records history" /></OnboardingGuard>} />
              <Route path="/photos" element={<OnboardingGuard><PhotosPage /></OnboardingGuard>} />
              <Route path="/documents" element={<OnboardingGuard><DocumentsPage /></OnboardingGuard>} />
              <Route path="/calendar" element={<OnboardingGuard><CalendarPage /></OnboardingGuard>} />
              <Route path="/reports" element={<OnboardingGuard><ReportsPage /></OnboardingGuard>} />
              <Route path="/profile" element={<OnboardingGuard><ProfilePage /></OnboardingGuard>} />
              <Route path="/settings" element={<OnboardingGuard><SettingsPage /></OnboardingGuard>} />
              <Route path="/memory" element={<OnboardingGuard><MemoryPage /></OnboardingGuard>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
