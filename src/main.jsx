import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID - use environment variable or fallback
// Note: The current client ID may not work with localhost origins
// You need to configure authorized origins in Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "763987383458-vaeflgq802aj7fntk0u86qhi9q43s9gs.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) => {
        console.error('Google OAuth script load error:', error);
      }}
      onScriptLoadSuccess={() => {
        console.log('Google OAuth script loaded successfully');
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
