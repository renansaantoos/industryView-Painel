import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppStateProvider } from './contexts/AppStateContext';
import { router } from './routes';
import { gtagPageView } from './utils/gtag';

// Import i18n initialization (side-effect)
import './i18n';

// Import global styles
import './styles/variables.css';
import './styles/globals.css';

export default function App() {
  // Track SPA route changes for Google Analytics
  useEffect(() => {
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state === 'idle') {
        gtagPageView(state.location.pathname);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </AuthProvider>
  );
}
