import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon
} from '@mui/icons-material';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (username === '1' && password === '1') {
        onLogin();
      } else {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="modern-login-container">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Main Login Card */}
      <Paper elevation={24} className="login-card">
        <Box className="login-content">
          {/* Logo Section */}
          <Box className="logo-section">
            <div className="logo-container">
              <img src={`${import.meta.env.BASE_URL}rf-logo.png`} alt="RF Logo" className="modern-logo" />
              <Typography variant="h5" className="company-name">
                RF Application
              </Typography>
            </div>
            <Divider className="logo-divider">
              <Chip label="Environmental Monitoring" size="small" className="system-chip" />
            </Divider>
          </Box>

          {/* System Title */}
          <Box className="title-section">
            <Typography variant="h4" className="main-title">
              Welcome Back
            </Typography>
            <Typography variant="body1" className="subtitle">
              Air Quality Monitoring System
            </Typography>
            <Typography variant="caption" className="thai-subtitle">
              ระบบตรวจวัดคุณภาพอากาศ
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} className="modern-form">
            {error && (
              <Box className="error-container">
                <Typography variant="body2" className="error-text">
                  {error}
                </Typography>
              </Box>
            )}

            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="modern-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className="input-icon" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="modern-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="input-icon" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      className="visibility-toggle"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              className="modern-login-button"
              startIcon={isLoading ? null : <LoginIcon />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Demo Credentials Info */}
            <Box className="demo-info">
              <Typography variant="caption" className="demo-text">
                Demo: Username: 1, Password: 1
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box className="login-footer">
            <Typography variant="caption" className="footer-text">
              © 2024 RF Application Co., Ltd.
            </Typography>
            <Typography variant="caption" className="footer-text">
              Real-time Environmental Monitoring
            </Typography>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default Login; 