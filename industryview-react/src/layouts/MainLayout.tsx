import { useState } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/navigation/Sidebar';
import NavBar from '../components/navigation/NavBar';
import { pageVariants } from '../lib/motion';
import './MainLayout.css';

/**
 * Freezes the outlet at mount time so AnimatePresence exit animations
 * keep rendering the OLD route instead of the new one.
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

/**
 * Main application layout with sidebar navigation.
 * Mirrors the Flutter app's Scaffold + NavBarWidget pattern.
 * - Desktop: fixed sidebar on the left, content on the right
 * - Mobile: top navbar with hamburger menu, full-width content
 */
export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="main-layout">
      <Sidebar />
      <NavBar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FrozenOutlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
