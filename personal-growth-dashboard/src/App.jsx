import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import DailyOverview from './pages/DailyOverview';
import SchedulePage from './pages/SchedulePage';
import ExtraUpPage from './pages/ExtraUpPage';
import ChoresPage from './pages/ChoresPage';

export default function App() {
  const { currentUser: user, loading } = useAuth();

  // 1. Loading State (Black background to prevent flash)
  if (loading) return <div className="min-h-screen bg-[#0f0f0f]"></div>;

  // 2. Unauthenticated -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. Authenticated -> Dashboard Layout
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DailyOverview />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/extra-up" element={<ExtraUpPage />} />
        <Route path="/chores" element={<ChoresPage />} />
      </Route>
    </Routes>
  );
}
