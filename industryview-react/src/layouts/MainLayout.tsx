import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import NavBar from '../components/navigation/NavBar';
import './MainLayout.css';

/**
 * Main application layout with sidebar navigation.
 * - Desktop: fixed sidebar on the left, content on the right
 * - Mobile: top navbar with hamburger menu, full-width content
 */
export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
