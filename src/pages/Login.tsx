import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper // Use Paper for the containers
} from '@mui/material';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '1' && password === '1') {
      onLogin();
    } else {
      setError('Invalid credentials. Use 1/1'); // Shortened error
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="login-container">
      {/* Left Info Area - Combined into one card */}
      <div className="login-info-area">
        <Paper elevation={3} className="info-card">
          <img src="/rf-logo.png" alt="RF Logo" className="info-logo" />
          <Typography variant="h5" className="info-title">Smart Air Pollution</Typography>
          <Typography variant="h5" className="info-title">Monitoring System</Typography>
        </Paper>
      </div>

      {/* Right Login Form Area (Circle) */}
      <Paper elevation={5} className="login-form-circle">
        <Typography variant="h4" component="h1" className="login-title">LOGIN</Typography>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>} 
          
          <TextField
            label="Username"
            variant="standard" // Underline only
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          
          <TextField
            label="Password"
            type="password"
            variant="standard" // Underline only
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            className="login-button"
          >
            LOGIN
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login; 