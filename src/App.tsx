import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleAnalytics } from './components/GoogleAnalytics';

// Layout
import AppShell from './components/AppShell';

// Pages
import Landing from './pages/Landing';
import TourHealth from './pages/TourHealth';
import Roadmap from './pages/Roadmap';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

export default function App() {
  const location = useLocation();

  return (
    <>
      <GoogleAnalytics />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Protected App Shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/health" replace />} />
            <Route path="health" element={<TourHealth />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="admin" element={<Admin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
