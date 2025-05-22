import React from 'react';
// import { LocationOn } from '@mui/icons-material'; // No longer needed
import MapComponent from '../components/MapComponent'; // Import the new component
import { Paper } from '@mui/material'; // Import Paper
import './PageCommon.css';

// Example markers (replace with actual data later) - Moved to module scope
const sampleMarkers = [
  { id: 1, lat: 13.7512, lng: 100.6414 },
  { id: 2, lat: 13.755, lng: 100.645 },
  { id: 3, lat: 13.748, lng: 100.639 },
];

// Define map container style to fill its parent (the card) - Moved to module scope
const mapContainerStyle = {
  width: '100%',
  height: '100%', // Use 100% height relative to the card
};

// Define center and zoom level - Moved to module scope
const center = { lat: 13.7512, lng: 100.6414 }; // Example center (Bangkok)
const zoom = 13;

const Map: React.FC = () => {
  return (
    <div className="page-container map-page-container">
      <div className="page-content">
        {/* Wrap MapComponent in a Paper component */}
        <Paper elevation={3} className="info-card map-card-standalone">
          {' '}
          {/* Use info-card or a specific class */}
          <MapComponent
            center={center}
            zoom={zoom}
            containerStyle={mapContainerStyle}
            markers={sampleMarkers} // Pass sample markers
          />
        </Paper>
      </div>
    </div>
  );
};

export default Map;
