import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppStateProvider } from './contexts/AppStateContext';
import { router } from './routes';

// Import i18n initialization (side-effect)
import './i18n';

// Import global styles
import './styles/variables.css';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </AuthProvider>
  );
}
