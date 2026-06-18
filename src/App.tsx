import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AuthProvider } from './contexts';
import { Toaster } from 'sonner';
import './App.css';

const router = createRouter({ routeTree });

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
