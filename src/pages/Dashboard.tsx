import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler, // Import Filler plugin
  Title,
  Tooltip,
  Legend,
  ScriptableContext, // Import ScriptableContext
  ChartArea, // Import ChartArea
} from 'chart.js';
import {
  Thermostat,
  BatteryChargingFull,
  AccessTime,
} from '@mui/icons-material';
import MapComponent from '../components/MapComponent'; // Import the MapComponent
import SummaryValueCard from '../components/SummaryValueCard'; // Import the new component

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay'; // If using autoplay module
import 'swiper/css/free-mode'; // If using free mode module

import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler, // Register Filler plugin
  Title,
  Tooltip,
  Legend,
);

// Moved static chart data outside the component
const chartLabels = [
  '20:25', '21:25', '22:25', '23:25', '00:25', '01:25', '02:25', '03:25',
  '04:25', '05:25', '06:25', '07:25', '08:25', '09:25', '10:25', '11:25',
  '12:25', '13:25', '14:25', '15:25', '16:25', '17:25', '18:25', '19:25',
];

const hardcodedPm25Dataset = [
  35, 36, 38, 42, 45, 46, 44, 43, 42, 40, 38, 35, 33, 28, 25, 22, 20,
  21, 22, 25, 28, 30, 32, 34,
];

const hardcodedTempDataset = [
  34, 34.5, 34, 33, 32, 31, 30, 29.5, 29, 29, 29.5, 30, 31, 32, 33, 34,
  34.5, 35, 34.8, 34, 33, 32.5, 33, 34,
];

interface HeaderCardProps {
  title: string;
  value: number;
  unit: string;
  lastUpdate: string;
  color: string;
}

const HeaderCard: React.FC<HeaderCardProps> = ({
  title,
  value,
  unit,
  lastUpdate,
  color,
}) => (
  <div className="header-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="header-card-title">{title}</div>
    <div className="header-card-value">
      <span style={{ color }}>{value}</span>
      <span className="header-card-unit">{unit}</span>
    </div>
    <div className="header-card-update">
      <AccessTime fontSize="inherit" /> Last update: {lastUpdate}
    </div>
  </div>
);

// Helper function to create gradient
const createGradient = (
  ctx: CanvasRenderingContext2D,
  chartArea: ChartArea | undefined,
  color: string,
) => {
  if (!chartArea) {
    // If chartArea is undefined, return a fallback color or null
    // This can happen during the initial render or if the chart is not visible
    return `rgba(${hexToRgb(color)}, 0.1)`; // Fallback to a light version of the color
  }
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top,
  );
  gradient.addColorStop(0, `rgba(${hexToRgb(color)}, 0)`); // Start transparent
  gradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0.4)`); // End with semi-transparent color
  return gradient;
};

// Helper function to convert hex to rgb values string
const hexToRgb = (hex: string): string => {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
    // 6 digits
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `${r}, ${g}, ${b}`;
};

// Updated interface
interface DeviceSampleData {
  id: string;
  pm25: number;
  pm10: number;
  temp: number;
  battery: number;
  status: string;
  location: string; // Added location
}

const deviceData: DeviceSampleData[] = [
  {
    id: 'Station 01 - Industrial Estate',
    pm25: 45,
    pm10: 62,
    temp: 27.5,
    battery: 78,
    status: 'good',
    location: '13.7512, 100.6414',
  },
  {
    id: 'Station 02 - Downtown',
    pm25: 32,
    pm10: 48,
    temp: 26.8,
    battery: 12,
    status: 'unhealthy',
    location: '13.7480, 100.6390',
  },
  {
    id: 'Station 03 - New City',
    pm25: 18,
    pm10: 35,
    temp: 28.3,
    battery: 95,
    status: 'good',
    location: '13.7550, 100.6450',
  },
  {
    id: 'Station 04 - ชานเมือง',
    pm25: 22,
    pm10: 40,
    temp: 29.2,
    battery: 54,
    status: 'good',
    location: '13.7600, 100.6300',
  },
  {
    id: 'Station 05 - สวนสาธารณะ',
    pm25: 15,
    pm10: 29,
    temp: 27.8,
    battery: 82,
    status: 'good',
    location: '13.7450, 100.6500',
  },
];

interface DashboardProps {
  isDarkMode: boolean; // Added isDarkMode prop
}

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  // State to track screen size for potential JS-based adjustments
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 576);

  // Effect to update screen size state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 576);
    };
    // Optional: Debounce resize handler for performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const debouncedHandleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        handleResize();
      }, 200); // Adjust debounce delay as needed (e.g., 200ms)
    };

    window.addEventListener('resize', debouncedHandleResize);

    // Cleanup listener on component unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // --- Dynamic Chart Styling based on isDarkMode ---
  const { tickColor, gridColor, pm25BorderColor, tempBorderColor } =
    React.useMemo(() => {
      const primaryColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--primary-color')
          .trim() || '#0d6efd';
      const tempColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--temp-color')
          .trim() || '#e83e8c';
      const textSecondaryLightVal =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--text-secondary-light')
          .trim() || '#6c757d';
      const textSecondaryDarkVal =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--text-secondary-dark')
          .trim() || '#adb5bd';

      return {
        tickColor: isDarkMode ? textSecondaryDarkVal : textSecondaryLightVal,
        gridColor: isDarkMode
          ? 'rgba(58, 63, 90, 0.3)'
          : 'rgba(224, 224, 224, 0.4)',
        pm25BorderColor: primaryColor,
        tempBorderColor: tempColor,
      };
    }, [isDarkMode]);

  const pm25Data = React.useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: 'PM2.5 (µg/m³)',
        data: hardcodedPm25Dataset,
        fill: true,
        borderColor: pm25BorderColor,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const chartArea = context.chart.chartArea;
          return createGradient(ctx, chartArea, pm25BorderColor);
        },
        tension: 0.4,
      },
    ],
  }), [pm25BorderColor]); // Depends on pm25BorderColor which is memoized by isDarkMode

  const tempData = React.useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: hardcodedTempDataset,
        fill: true,
        borderColor: tempBorderColor,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const chartArea = context.chart.chartArea;
          return createGradient(ctx, chartArea, tempBorderColor);
        },
        tension: 0.4,
      },
    ],
  }), [tempBorderColor]); // Depends on tempBorderColor which is memoized by isDarkMode

  // --- Chart Options ---
  const commonChartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: tickColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: tickColor,
        },
        beginAtZero: true,
      },
    },
  }), [gridColor, tickColor]);

  const pm25ChartOptions = React.useMemo(() => ({
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: { display: false, text: 'PM2.5 Trend', color: tickColor },
      legend: { ...commonChartOptions.plugins.legend, labels: { color: tickColor } },
      tooltip: { titleColor: tickColor, bodyColor: tickColor },
    },
    scales: {
      ...commonChartOptions.scales,
      y: { ...commonChartOptions.scales.y, title: { display: true, text: 'PM2.5 (µg/m³)', color: tickColor } },
      x: { ...commonChartOptions.scales.x, title: { display: false, text: 'Time', color: tickColor } },
    },
  }), [commonChartOptions, tickColor]);

  const tempChartOptions = React.useMemo(() => ({
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: { display: false, text: 'Temperature Trend', color: tickColor },
      legend: { ...commonChartOptions.plugins.legend, labels: { color: tickColor } },
      tooltip: { titleColor: tickColor, bodyColor: tickColor },
    },
    scales: {
      ...commonChartOptions.scales,
      y: { ...commonChartOptions.scales.y, title: { display: true, text: 'Temperature (°C)', color: tickColor } },
      x: { ...commonChartOptions.scales.x, title: { display: false, text: 'Time', color: tickColor } },
    },
  }), [commonChartOptions, tickColor]);

  // Define map style for Dashboard
  const dashboardMapContainerStyle = {
    width: '100%',
    height: '100%', // Let the CSS container define the height
  };
  const dashboardMapCenter = { lat: 13.7512, lng: 100.6414 }; // Same example center
  const dashboardMapZoom = 11; // Slightly more zoomed out for overview

  // Extract marker data from deviceData
  const mapMarkers = deviceData
    .map((device) => {
      // Basic parsing, assumes location is "lat, lng"
      const parts = device.location.split(',');
      const lat = parseFloat(parts[0]?.trim());
      const lng = parseFloat(parts[1]?.trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { id: device.id, lat, lng };
      }
      return null; // Return null for invalid locations
    })
    .filter((marker) => marker !== null) as {
    id: string;
    lat: number;
    lng: number;
  }[]; // Filter out nulls and assert type

  // Dummy data for summary cards (replace with actual calculations later)
  const maxPm25 = 117;
  const avgPm25 = 64;
  const minPm25 = 20;

  // Dummy data for temp summary cards
  const maxTemp = 117; // Example, same as image
  const avgTemp = 64; // Example, same as image
  const minTemp = 20; // Example, same as image

  return (
    <div className="dashboard-container">
      {/* Replace ticker wrapper with Swiper */}
      <div className="header-swiper-container">
        {' '}
        {/* Keep a container if needed for margins etc. */}
        <Swiper
          modules={[Autoplay, FreeMode]} // Add modules
          slidesPerView={'auto'} // Show as many slides as fit
          spaceBetween={24} // Gap between slides
          loop={true} // Enable continuous loop
          freeMode={true} // Enable free dragging/momentum
          speed={5000} // Animation speed (ms) - TUNE THIS for smooth continuous scroll
          autoplay={{
            delay: 0, // Start immediately for continuous effect
            disableOnInteraction: false, // Keep playing after user interaction
            pauseOnMouseEnter: true, // Pause when mouse is over
          }}
          className="header-swiper"
        >
          {/* Render first set */}
          {deviceData.map((device) => (
            <SwiperSlide key={device.id} style={{ width: '260px' }}>
              <HeaderCard
                title={device.id}
                value={device.pm25}
                unit="µg/m³"
                lastUpdate="N/A"
                color="var(--accent-orange)"
              />
            </SwiperSlide>
          ))}
          {/* Render second set for loop */}
          {deviceData.map((device) => (
            <SwiperSlide
              key={`${device.id}-duplicate`}
              style={{ width: '260px' }}
            >
              <HeaderCard
                title={device.id}
                value={device.pm25}
                unit="µg/m³"
                lastUpdate="N/A"
                color="var(--accent-orange)"
                aria-hidden="true" // Hide duplicates from accessibility tree
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="chart-column">
          {/* PM2.5 Chart Card */}
          <div className="chart-card pm25-chart-card">
            <h3>PM2.5 Level (24h)</h3>
            <div className="chart-wrapper">
              <Line
                key={isSmallScreen ? 'sm' : 'lg'}
                data={pm25Data}
                options={pm25ChartOptions}
              />
            </div>
            {/* Summary cards moved outside */}
          </div>

          {/* PM2.5 Summary Cards Row */}
          <div className="pm25-summary-container summary-card-row">
            <SummaryValueCard
              title="Maximum"
              value={maxPm25}
              unit="µg/m³"
              colorClass="max-pm"
            />
            <SummaryValueCard
              title="Average"
              value={avgPm25}
              unit="µg/m³"
              colorClass="avg-pm"
            />
            <SummaryValueCard
              title="Minimum"
              value={minPm25}
              unit="µg/m³"
              colorClass="min-pm"
            />
          </div>

          {/* Temperature Chart Card */}
          <div className="chart-card temp-chart-card">
            <h3>Temperature (24h)</h3>
            <div className="chart-wrapper">
              <Line
                key={isSmallScreen ? 'sm-temp' : 'lg-temp'}
                data={tempData}
                options={tempChartOptions}
              />
            </div>
          </div>

          {/* Temperature Summary Cards Row */}
          <div className="temp-summary-container summary-card-row">
            <SummaryValueCard
              title="Maximum"
              value={maxTemp}
              unit="°C"
              colorClass="max-temp"
            />
            <SummaryValueCard
              title="Average"
              value={avgTemp}
              unit="°C"
              colorClass="avg-temp"
            />
            <SummaryValueCard
              title="Minimum"
              value={minTemp}
              unit="°C"
              colorClass="min-temp"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="info-column">
          <div className="map-card">
            <MapComponent
              center={dashboardMapCenter}
              zoom={dashboardMapZoom}
              containerStyle={dashboardMapContainerStyle}
              markers={mapMarkers} // Pass markers derived from device data
              isDarkMode={isDarkMode} // Use the prop
            />
          </div>
          <div className="device-card">
            <h3>
              Device{' '}
              <span className="total-devices">Total: {deviceData.length}</span>
            </h3>
            <ul className="device-list">
              {deviceData.map((device) => (
                <li key={device.id} className="device-list-item">
                  <span
                    className={`status-dot ${device.status === 'good' ? 'good' : 'unhealthy'}`}
                  ></span>
                  <div className="device-info">
                    <span className="device-name">{device.id}</span>
                    <span className="device-details">
                      PM2.5: {device.pm25} µg/m³ | PM10: {device.pm10} µg/m³
                    </span>
                  </div>
                  <div className="device-readings">
                    <span className="device-temp">
                      <Thermostat fontSize="inherit" /> {device.temp}°C
                    </span>
                    <span className="device-battery">
                      <BatteryChargingFull fontSize="inherit" />{' '}
                      {device.battery}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
