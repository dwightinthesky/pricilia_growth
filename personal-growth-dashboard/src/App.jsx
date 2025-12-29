import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import DailyOverview from './pages/DailyOverview';
import SchedulePage from './pages/SchedulePage';
import ExtraUp from './pages/ExtraUp';
import ChoresPage from './pages/ChoresPage';
import CommandPalette from './components/CommandPalette';

import FinancePage from './pages/FinancePage';
import PricingPage from './pages/Pricing';
import BillingSettings from './components/settings/BillingSettings';
import useSubscription from './hooks/useSubscription';

export default function App() {
  const { currentUser: user, loading } = useAuth();
  const sub = useSubscription(user);

  // 1. Loading State (Black background to prevent flash)
  if (loading) return <div className="min-h-screen bg-[#0f0f0f]"></div>;

  // 2. Unauthenticated -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. Authenticated -> Dashboard Layout
  return (
    <>
      <CommandPalette />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DailyOverview />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/extra-up" element={<ExtraUp />} />
          <Route path="/chores" element={<ChoresPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route
            path="/pricing"
            element={
              <PricingPage
                currentPlanId={sub.planId}
                onSelectPlan={(planId) => sub.setPlan(planId)}
              />
            }
          />
          <Route path="/settings" element={<BillingSettings />} />
        </Route>
      </Routes>
    </>
  );
}
