import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  InputAdornment, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Checkbox,
  Button,
  Box
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
// Import Date Calendar components
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; // Use DateCalendar
import dayjs, { Dayjs } from 'dayjs'; // Import dayjs
import isBetweenPlugin from 'dayjs/plugin/isBetween'; // Import isBetween plugin
import isSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter'; // Import isSameOrAfter plugin
import './Report.css'; // Import the correct CSS

// Dummy data (replace with actual data fetching later)
const dummyGroups = ['All', 'Group A', 'Group B', 'Group C', 'Industrial Area', 'Residential Zone'];
const dummySensors = ['Sensor 001', 'Sensor 002', 'Sensor 003', 'Sensor 004', 'Sensor 005', 'Sensor 006'];

dayjs.extend(isBetweenPlugin); // Extend dayjs with the plugin
dayjs.extend(isSameOrAfterPlugin); // Extend dayjs with the plugin

// Helper function to check if a day is between start and end (exclusive)
const dayIsBetween = (day: Dayjs, start: Dayjs | null, end: Dayjs | null): boolean => {
  if (!start || !end) return false;
  // Ensure start is before end for comparison
  const rangeStart = start.isBefore(end) ? start : end;
  const rangeEnd = start.isBefore(end) ? end : start;
  // Use isBetween plugin (exclusive by default)
  return day.isBetween(rangeStart, rangeEnd, 'day');
};

interface ReportProps {
  isDarkMode?: boolean; // Add isDarkMode prop
}

const Report: React.FC<ReportProps> = ({ isDarkMode = false }) => { // Receive and default isDarkMode prop
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [sensorSearchTerm, setSensorSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  // State for static calendar selection
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // Filtering logic (basic)
  const filteredGroups = dummyGroups.filter(g => g.toLowerCase().includes(groupSearchTerm.toLowerCase()));
  const filteredSensors = dummySensors.filter(s => s.toLowerCase().includes(sensorSearchTerm.toLowerCase()));

  // Handlers (basic implementations)
  const handleToggleGroup = (value: string) => () => {
    const currentIndex = selectedGroups.indexOf(value);
    const newSelected = [...selectedGroups];
    if (currentIndex === -1) newSelected.push(value); else newSelected.splice(currentIndex, 1);
    setSelectedGroups(newSelected);
  };

  const handleToggleSensor = (value: string) => () => {
    const currentIndex = selectedSensors.indexOf(value);
    const newSelected = [...selectedSensors];
    if (currentIndex === -1) newSelected.push(value); else newSelected.splice(currentIndex, 1);
    setSelectedSensors(newSelected);
  };

  // Handler for static calendar date selection
  const handleDateChange = (newValue: Dayjs | null) => {
    if (!newValue) return;

    const today = newValue.startOf('day');
    const currentStart = startDate ? startDate.startOf('day') : null;
    const currentEnd = endDate ? endDate.startOf('day') : null;

    if (!currentStart || today.isBefore(currentStart) || (currentStart && currentEnd)) {
      setStartDate(today);
      setEndDate(null);
    } else if (currentStart && !currentEnd) {
       if (today.isSameOrAfter(currentStart)) { // Use the plugin method
         setEndDate(today);
       } else { 
         setStartDate(today);
         setEndDate(null);
       }
    }
  };

  // Helper to format date for display
  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('DD/MM/YYYY') : '...'; // Use '...' for unset date
  };

  // Use the isDarkMode prop passed from the parent
  // const isDarkMode = document.body.classList.contains('dark-mode'); // REMOVE internal calculation
  const weekDayLabelColor = isDarkMode ? '#e0e0e0' : 'var(--text-secondary-light)';
  const datePickerHeaderColor = isDarkMode ? '#e0e0e0' : 'var(--text-light)';
  const datePickerArrowColor = isDarkMode ? '#adb5bd' : 'var(--text-secondary-light)';
  const datePickerDayColor = isDarkMode ? '#e0e0e0' : 'var(--text-light)';
  const datePickerDisabledDayColor = isDarkMode ? 'rgba(173, 181, 189, 0.5)' : 'rgba(108, 117, 125, 0.5)';

  return (
    // Use the main container class from Report.css
    <div className="report-page-container">

      {/* Group Selection Panel */}
      <Paper elevation={3} className="selection-panel group-panel">
        <Typography variant="h6" className="panel-header">Select Group</Typography>
        <TextField
          variant="outlined" size="small" placeholder="Search Groups..." fullWidth
          value={groupSearchTerm}
          onChange={(e) => setGroupSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
          className="search-bar"
        />
        <List dense className="selection-list">
          <ListItem divider className='list-header'>Group</ListItem>
          {filteredGroups.map((group) => (
            <ListItem key={group} disablePadding>
              <ListItemButton 
                role={undefined} 
                onClick={handleToggleGroup(group)} 
                dense
                sx={{ // Apply sx to ListItemButton instead
                  color: isDarkMode ? 'var(--text-dark)' : 'var(--text-light)',
                  '.MuiListItemText-primary': { // Target inner text explicitly if needed
                     color: isDarkMode ? 'var(--text-dark)' : 'var(--text-light)'
                  }
                }}
              >
                <Checkbox edge="start" checked={selectedGroups.indexOf(group) !== -1} tabIndex={-1} disableRipple size="small"/>
                <ListItemText primary={group} /> 
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <div className="selection-count">
          <Typography variant="caption">{selectedGroups.length} Selected</Typography>
        </div>
      </Paper>

      {/* Sensor Selection Panel */}
      <Paper elevation={3} className="selection-panel sensor-panel">
        <Typography variant="h6" className="panel-header">Select Sensor</Typography>
        <TextField
          variant="outlined" size="small" placeholder="Search Sensors..." fullWidth
          value={sensorSearchTerm}
          onChange={(e) => setSensorSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
          className="search-bar"
        />
         <List dense className="selection-list">
          <ListItem divider className='list-header'>Sensor ID</ListItem>
          {filteredSensors.map((sensor) => (
            <ListItem key={sensor} disablePadding>
              <ListItemButton 
                role={undefined} 
                onClick={handleToggleSensor(sensor)} 
                dense
                sx={{ // Apply sx to ListItemButton instead
                  color: isDarkMode ? 'var(--text-dark)' : 'var(--text-light)',
                  '.MuiListItemText-primary': { // Target inner text explicitly if needed
                     color: isDarkMode ? 'var(--text-dark)' : 'var(--text-light)'
                  }
                }}
              >
                <Checkbox edge="start" checked={selectedSensors.indexOf(sensor) !== -1} tabIndex={-1} disableRipple size="small"/>
                <ListItemText primary={sensor} /> 
              </ListItemButton>
            </ListItem>
          ))}
        </List>
         <div className="selection-count">
          <Typography variant="caption">{selectedSensors.length} Selected</Typography>
        </div>
      </Paper>

      {/* Date Selection Panel - Using Static DateCalendar */}
      <Paper elevation={3} className="selection-panel date-panel">
        <Typography variant="h6" className="panel-header">Select Date Range</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Adjust Box for top alignment and push text to bottom-left */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', // Keep calendar centered horizontally
            gap: 1, 
            p: 1,
            flexGrow: 1, // Box still fills vertical space
            // justifyContent: 'center' // REMOVE this
          }}>
            <DateCalendar
              value={startDate} // Control the calendar view if needed
              onChange={handleDateChange}
              // Add slotProps back to apply custom styles
              slotProps={{
                day: (ownerState) => {
                  const { day } = ownerState; 
                  const isInRange = dayIsBetween(day, startDate, endDate);
                  const isSelectedStart = startDate && day.isSame(startDate, 'day');
                  const isSelectedEnd = endDate && day.isSame(endDate, 'day'); 

                  let dayClassName = '';
                  if (isInRange) {
                    dayClassName += ' in-range-day';
                  }
                  if (isSelectedStart) {
                    dayClassName += ' start-date-selected';
                  }
                  if (isSelectedEnd) {
                    dayClassName += ' end-date-selected';
                  }
                  
                  return {
                    className: dayClassName.trim(), 
                  } as any;
                },
              }}
              // Add sx prop for deeper customization
              sx={{
                // Weekday Labels (S M T W T F S) - Target specific class
                '.MuiDayCalendar-weekDayLabel': { // Use MuiDayCalendar-weekDayLabel class
                  color: weekDayLabelColor,
                },
                // Month/Year Header
                '.MuiPickersCalendarHeader-label': {
                  color: datePickerHeaderColor, 
                },
                // Arrow Buttons (Left/Right)
                '.MuiPickersArrowSwitcher-button': {
                  color: datePickerArrowColor,
                },
                // Dropdown Arrow Icon (Month/Year Switch)
                '.MuiPickersCalendarHeader-switchViewIcon': {
                    color: datePickerArrowColor, 
                },
                // Default Day Number Color
                '.MuiPickersDay-root': {
                  color: datePickerDayColor,
                },
                // Disabled Day Number Color
                '.MuiPickersDay-root.Mui-disabled': {
                  color: datePickerDisabledDayColor,
                },
                // Year Selection Button Color
                '.MuiYearCalendar-button': {
                  color: datePickerDayColor,
                }
                // Note: Selected/Range day colors are handled by CSS classes via slotProps
              }}
            />
             {/* Add mt: 'auto' and alignSelf: 'flex-start' */}
             <Typography 
               variant="body2" 
               sx={{ 
                 mt: 'auto', // Push to bottom
                 alignSelf: 'flex-start', // Align to left
                 pt: 1 // Add some top padding
               }}
             >
               Start: {formatDate(startDate)} | End: {formatDate(endDate)}
             </Typography>
          </Box>
        </LocalizationProvider>
      </Paper>

      {/* Report Preview Panel */}
      <Paper elevation={3} className="report-preview-panel">
         {/* Header Text */}
         <Typography variant="overline" display="block" className="report-header-text">
           SMART ENVIRONMENT MONITORING
         </Typography>
         
         {/* Title Section */}
         <div className="report-title-section">
           <div className="title-line"></div>
           <Typography variant="h1">PM2.5 Monitoring Data<br />Report Generator</Typography>
         </div>

         {/* Report Details Placeholder */}
         <div className="report-details">
           <p><strong>Selected Groups:</strong> {selectedGroups.join(', ') || 'None'}</p>
           <p><strong>Selected Sensors:</strong> {selectedSensors.join(', ') || 'None'}</p>
           {/* Display formatted dates from state */}
           <p><strong>Date Range:</strong> {formatDate(startDate)} - {formatDate(endDate)}</p>
           <p><em>(Report content will be generated here based on selections)</em></p>
         </div>

         {/* Footer */}
         <div className="report-footer">
            <span className="logo-text-rf-small">rF</span>
            <span>Application Co., Ltd. | www.rf.co.th</span>
         </div>

         {/* Download Section */}
         <div className="download-section">
           {/* <Typography variant="caption">Download Report</Typography> */}
           <Button variant="contained" startIcon={<DownloadIcon />}>Download PDF</Button>
         </div>
      </Paper>

    </div>
  );
};

export default Report; 