import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface MapMarker {
  lat: number;
  lng: number;
  id: string | number; // Unique identifier for the key prop
}

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: MapMarker[];
  containerStyle: React.CSSProperties;
  isDarkMode?: boolean; // Ensure this prop is defined
}

// Standard Google Maps dark style (Keep this definition)
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  markers = [],
  containerStyle,
  isDarkMode = false,
}) => {
  // No need to load script or check apiKey here anymore
  // const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  // if (!apiKey) { ... }

  // Directly return GoogleMap assuming script is loaded by a parent
  return (
    // <LoadScript googleMapsApiKey={apiKey}>
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        fullscreenControl: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        styles: isDarkMode ? darkMapStyles : [], // Apply dark styles conditionally
      }}
    >
      {/* Render markers if provided */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
        />
      ))}
    </GoogleMap>
    // </LoadScript>
  );
};

export default MapComponent;
