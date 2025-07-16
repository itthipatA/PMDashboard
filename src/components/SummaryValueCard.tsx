import React from 'react';
import { Paper, Typography } from '@mui/material';
import './SummaryValueCard.css'; // We will create this CSS file

interface SummaryValueCardProps {
  title: string;
  value: number;
  unit: string;
  colorClass: 'max-pm' | 'avg-pm' | 'min-pm' | 'max-temp' | 'avg-temp' | 'min-temp'; // Update colorClass types
}

const SummaryValueCard: React.FC<SummaryValueCardProps> = ({ title, value, unit, colorClass }) => {
  return (
    <Paper elevation={1} className={`summary-value-card ${colorClass}`}>
      <Typography variant="caption" className="summary-card-title">{title}</Typography>
      <div className="summary-card-value-container">
        <Typography variant="h4" component="span" className="summary-card-value">{value}</Typography>
        <Typography variant="body2" component="span" className="summary-card-unit">{unit}</Typography>
      </div>
    </Paper>
  );
};

export default SummaryValueCard; 