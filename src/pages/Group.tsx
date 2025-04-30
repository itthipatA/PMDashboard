import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Box
} from '@mui/material';
import {
  Search as SearchIcon,
  Thermostat as ThermostatIcon,
  BatteryChargingFull as BatteryIcon
} from '@mui/icons-material';
import MapComponent from '../components/MapComponent'; // Assuming MapComponent exists
import SummaryValueCard from '../components/SummaryValueCard'; // Import the card
import './Group.css'; // Import the CSS file we will create

// Dummy Data (Replace with actual data/state management)
const dummyGroups = Array.from({ length: 25 }, (_, i) => `หมู่บ้านตัวอย่าง ${String.fromCharCode(65 + i)}`);
const dummySensors = ['All', 'ซอยสุขสบาย', 'ซอยสันติสุข', 'ซอยแห่งมิตรภาพ', 'Sensor Alpha', 'Sensor Beta'];
const dummyDevices = Array.from({ length: 20 }, (_, i) => ({
  id: `Huamark Soi ${i + 1}`,
  pm25: Math.floor(Math.random() * 100) + 10,
  pm10: Math.floor(Math.random() * 150) + 20,
  temp: (Math.random() * 5 + 25).toFixed(1),
  battery: Math.floor(Math.random() * 50) + 50,
  status: Math.random() > 0.2 ? 'good' : 'unhealthy',
  location: `${(13.75 + (Math.random() - 0.5) * 0.05).toFixed(4)}, ${(100.64 + (Math.random() - 0.5) * 0.05).toFixed(4)}`
}));

const Group: React.FC = () => {
  const [groupSearch, setGroupSearch] = useState('');
  const [sensorSearch, setSensorSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // Basic filtering
  const filteredGroups = dummyGroups.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase()));
  // In reality, sensor list would depend on selectedGroup
  const filteredSensors = dummySensors.filter(s => s.toLowerCase().includes(sensorSearch.toLowerCase())); 
  // In reality, device list would depend on selectedGroup/Sensor
  const displayedDevices = dummyDevices; 

   // Extract map markers from the currently displayed devices
  const mapMarkers = displayedDevices.map(device => {
      const parts = device.location.split(',');
      const lat = parseFloat(parts[0]?.trim());
      const lng = parseFloat(parts[1]?.trim());
      if (!isNaN(lat) && !isNaN(lng)) {
          return { id: device.id, lat, lng };
      } 
      return null;
  }).filter(marker => marker !== null) as { id: string; lat: number; lng: number }[];

  const mapCenter = mapMarkers.length > 0 ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : { lat: 13.7512, lng: 100.6414 };
  const mapZoom = 12;
  const mapContainerStyle = { width: '100%', height: '100%' };

  // Dummy summary values (replace later)
  const summaryPM = { max: 116, avg: 65, min: 21 };
  const summaryTemp = { max: 112, avg: 69, min: 23 };

  return (
    <div className="group-page-container">
      
      {/* Group List Panel */}
      <Paper elevation={2} className="panel group-list-panel">
        <Box className="panel-title-bar">
          <Typography variant="h6">Group</Typography>
        </Box>
        <TextField 
          placeholder="Search..."
          variant="outlined"
          size="small"
          value={groupSearch}
          onChange={(e) => setGroupSearch(e.target.value)}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize='small'/></InputAdornment>,
          }}
          className="search-input"
        />
        <Paper elevation={0} className="list-header-card">
           <Typography variant="subtitle2">Name</Typography>
        </Paper>
        <List className="scrollable-list" dense>
          {filteredGroups.map(group => (
            <ListItemButton 
              key={group} 
              selected={selectedGroup === group}
              onClick={() => setSelectedGroup(group)}
              className="list-item"
            >
              <ListItemText primary={group} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Sensor List Panel */}
      <Paper elevation={2} className="panel sensor-list-panel">
        <Box className="panel-title-bar">
          <Typography variant="h6">Sensor</Typography> {/* Assuming 'All' is not counted */}
        </Box>
        <TextField 
          placeholder="Search..."
          variant="outlined"
          size="small"
          value={sensorSearch}
          onChange={(e) => setSensorSearch(e.target.value)}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize='small'/></InputAdornment>,
          }}
          className="search-input"
        />
         <Paper elevation={0} className="list-header-card">
           <Typography variant="subtitle2">Name</Typography>
        </Paper>
        <List className="scrollable-list" dense>
          {filteredSensors.map(sensor => (
            <ListItemButton 
              key={sensor}
              selected={selectedSensor === sensor}
              onClick={() => setSelectedSensor(sensor)}
              className="list-item"
            >
              <ListItemText primary={sensor} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Center Column: Map and Device Details */}
      <div className="center-column-container">
        <Paper elevation={2} className="panel map-panel">
          <Box className="map-container">
              <MapComponent 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  containerStyle={mapContainerStyle}
                  markers={mapMarkers}
              />
          </Box>
        </Paper>
        <Paper elevation={2} className="panel device-panel">
          <Box className="device-details-container">
              <Box className="device-list-title">
                  <Typography variant="subtitle1">Devices</Typography>
                  <Typography variant="caption">Total: {displayedDevices.length}</Typography>
              </Box>
              <ul className="device-summary-list">
                {displayedDevices.map((device) => (
                  <li key={device.id} className="device-summary-item">
                    <span className={`status-dot ${device.status}`}></span>
                    <div className="device-info">
                      <span className="device-name">{device.id}</span>
                      <span className="device-details">
                        PM2.5: {device.pm25} µg/m³ | PM10: {device.pm10} µg/m³
                      </span>
                    </div>
                    <div className="device-readings">
                      <span className="device-temp"><ThermostatIcon fontSize="inherit"/> {device.temp}°C</span>
                      <span className="device-battery"><BatteryIcon fontSize="inherit"/> {device.battery}%</span>
                    </div>
                  </li>
                ))}
              </ul>
          </Box>
        </Paper>
      </div>

      {/* Summary Panel (New) */}
      <Paper elevation={2} className="panel summary-panel">
        <Typography variant="h6" className="summary-header">PM2.5</Typography>
        <Box className="summary-cards-group">
            <SummaryValueCard title="Maximum" value={summaryPM.max} unit="µg/m³" colorClass="max-pm" />
            <SummaryValueCard title="Average" value={summaryPM.avg} unit="µg/m³" colorClass="avg-pm" />
            <SummaryValueCard title="Minimum" value={summaryPM.min} unit="µg/m³" colorClass="min-pm" />
        </Box>
        <Typography variant="h6" className="summary-header">Temperature</Typography>
         <Box className="summary-cards-group">
            <SummaryValueCard title="Maximum" value={summaryTemp.max} unit="°C" colorClass="max-temp" />
            <SummaryValueCard title="Average" value={summaryTemp.avg} unit="°C" colorClass="avg-temp" />
            <SummaryValueCard title="Minimum" value={summaryTemp.min} unit="°C" colorClass="min-temp" />
        </Box>
        <Box sx={{ mt: 2, p: 1, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography variant="caption" display="block" gutterBottom>
                Selected Group: {selectedGroup || 'ไม่ได้เลือก'}
            </Typography>
            <Typography variant="caption" display="block">
                Selected Sensor: {selectedSensor || 'ไม่ได้เลือก'}
            </Typography>
        </Box>
      </Paper>

    </div>
  );
};

export default Group; 