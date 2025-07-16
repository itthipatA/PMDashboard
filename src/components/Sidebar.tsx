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
  VerifiedUser as LicenseIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import './Sidebar.css';
import { Typography } from '@mui/material';

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
    { name: 'License', path: '/license', icon: <LicenseIcon /> },
  ];

  return (
    <div className={`sidebar ${darkMode ? 'sidebar-dark' : 'sidebar-light'}`}>
      <div className="sidebar-content">
        {/* Logo and Title */}
        <div className="sidebar-header">
          <img src={`${import.meta.env.BASE_URL}rf-logo.png`} alt="RF Logo" className="sidebar-logo" />
          <Typography variant="h6" component="h1" className="sidebar-title">ระบบตรวจวัดคุณภาพอากาศ</Typography>
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
    </div>
  );
};

export default Sidebar; 