import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon,
  Pets as MascotIcon,
  Map as MapIcon,
  DevicesOther as DeviceIcon,
  Group as GroupIcon,
  Assessment as ReportIcon,
  Notifications as AlertIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import './Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  toggleLanguage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onLogout, 
  darkMode, 
  toggleDarkMode,
  language,
  toggleLanguage
}) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { name: 'Mascot', path: '/mascot', icon: <MascotIcon /> },
    { name: 'Map', path: '/map', icon: <MapIcon /> },
    { name: 'Device', path: '/device', icon: <DeviceIcon /> },
    { name: 'Group', path: '/group', icon: <GroupIcon /> },
    { name: 'Report', path: '/report', icon: <ReportIcon /> },
    { name: 'Alert', path: '/alert', icon: <AlertIcon /> },
  ];

  return (
    <div className={`sidebar ${darkMode ? 'sidebar-dark' : 'sidebar-light'}`}>
      <div className="sidebar-header">
        <img src="/rf-logo.png" alt="RF Logo" className="sidebar-logo" />
        <h2>Smart Environment monitor</h2>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink 
            to={item.path} 
            key={item.name}
            className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
          >
            <div className="menu-icon">{item.icon}</div>
            <div className="menu-text">{item.name}</div>
          </NavLink>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button className="footer-button" onClick={toggleDarkMode}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </button>
        
        <button className="footer-button" onClick={toggleLanguage}>
          <TranslateIcon />
          <span>{language.toUpperCase()}</span>
        </button>
        
        <button className="footer-button" onClick={onLogout}>
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 