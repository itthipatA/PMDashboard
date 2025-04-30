import React from 'react';
// import { LocationOn } from '@mui/icons-material'; // No longer needed
import MapComponent from '../components/MapComponent'; // Import the new component
import { Paper } from '@mui/material'; // Import Paper
import './PageCommon.css';

// Example markers (replace with actual data later)
const sampleMarkers = [
  { id: 1, lat: 13.7512, lng: 100.6414 },
  { id: 2, lat: 13.7550, lng: 100.6450 },
  { id: 3, lat: 13.7480, lng: 100.6390 },
];

const Map: React.FC = () => {
  // Define map container style to fill its parent (the card)
  const mapContainerStyle = {
    width: '100%',
    height: '100%' // Use 100% height relative to the card
  };

  // Define center and zoom level
  const center = { lat: 13.7512, lng: 100.6414 }; // Example center (Bangkok)
  const zoom = 13;

  return (
    <div className="page-container map-page-container">
      
      <div className="page-content">
        {/* Wrap MapComponent in a Paper component */}
        <Paper elevation={3} className="info-card map-card-standalone"> { /* Use info-card or a specific class */ }
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