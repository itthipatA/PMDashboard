import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mascot from './pages/Mascot';
import Map from './pages/Map';
import Device from './pages/Device';
import Group from './pages/Group';
import Report from './pages/Report';
import Alert from './pages/Alert';
import License from './pages/License';
import './App.css';

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'places',
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'th'
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.error(
      'Google Maps API Key is missing in App.tsx. Check .env file (VITE_GOOGLE_MAPS_API_KEY).',
    );
    // Render a message or a fallback UI if the API key is missing
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          color: '#ff0000',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <h1>Configuration Error</h1>
        <p>
          The Google Maps API Key is not configured. Please check the
          application setup. Maps functionality will be unavailable.
        </p>
      </div>
    );
  }

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey || ''}
      libraries={libraries}
      loadingElement={<div>Loading Maps...</div>}
      onError={(error) => console.error('Maps LoadScript Error:', error)}
    >
      <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Router>
          {isAuthenticated ? (
            <div className="app-container">
              <Sidebar
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                language={language}
                toggleLanguage={toggleLanguage}
              />
              <main className="content">
                <Routes>
                  <Route path="/" element={<Dashboard isDarkMode={darkMode} />} />
                  <Route path="/mascot" element={<Mascot />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/device" element={<Device />} />
                  <Route path="/group" element={<Group />} />
                  <Route
                    path="/report"
                    element={<Report isDarkMode={darkMode} />}
                  />
                  <Route path="/alert" element={<Alert />} />
                  <Route path="/license" element={<License />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Routes>
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
          )}
        </Router>
      </div>
    </LoadScript>
  );
}

export default App;
