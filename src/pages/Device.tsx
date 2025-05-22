import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper, // For the card/table container
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Search as SearchIcon,
  CircleOutlined as StatusIcon, // Using CircleOutlined for status
} from '@mui/icons-material';
import './Device.css'; // Change to specific CSS file

// Sample data structure based on the image
interface DeviceData {
  id: number;
  status: 'online' | 'offline';
  name: string;
  model: string;
  address: string;
  group: string;
  battery: number;
  temperature: number;
  location: string; // Combined lat/lon for simplicity
  lastSeen: string;
}

const dummyDevices: DeviceData[] = [
  {
    id: 1,
    status: 'online',
    name: 'Huamark Soi 1',
    model: 'SE-100',
    address: '123000001',
    group: 'หมู่บ้านอยู่ดี',
    battery: 100,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 2,
    status: 'online',
    name: 'Huamark Soi 2',
    model: 'SE-100',
    address: '123000002',
    group: 'หมู่บ้านอยู่ดี',
    battery: 100,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 3,
    status: 'offline',
    name: 'Huamark Soi 3',
    model: 'SE-100',
    address: '123000003',
    group: 'หมู่บ้านมีสุข',
    battery: 20,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 4,
    status: 'online',
    name: 'Huamark Soi 4',
    model: 'SE-100',
    address: '123000004',
    group: 'หมู่บ้านมีสุข',
    battery: 60,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 5,
    status: 'offline',
    name: 'Huamark Soi 5',
    model: 'SE-100',
    address: '123000005',
    group: 'หมู่บ้านมีสุข',
    battery: 100,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 6,
    status: 'online',
    name: 'Huamark Soi 6',
    model: 'SE-100',
    address: '123000006',
    group: 'หมู่บ้านมีเงิน',
    battery: 80,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 7,
    status: 'online',
    name: 'Huamark Soi 7',
    model: 'SE-100',
    address: '123000006',
    group: 'หมู่บ้านมีเงิน',
    battery: 90,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 8,
    status: 'online',
    name: 'Huamark Soi 8',
    model: 'SE-100',
    address: '123000006',
    group: 'หมู่บ้านป่าเขา',
    battery: 100,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  {
    id: 9,
    status: 'online',
    name: 'Huamark Soi 9',
    model: 'SE-100',
    address: '123000006',
    group: 'หมู่บ้านป่าเขา',
    battery: 100,
    temperature: 27,
    location: '13.751267621123151, 100.64142426654561',
    lastSeen: '2025/3/5 11.30',
  },
  // Add more devices to test scrolling if needed
];

const Device: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Basic filtering logic (can be expanded)
  const filteredDevices = dummyDevices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.address.includes(searchTerm) ||
      device.group.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Dummy stats
  const totalDevices = dummyDevices.length;
  const onlineDevices = dummyDevices.filter(
    (d) => d.status === 'online',
  ).length;
  const offlineDevices = totalDevices - onlineDevices;

  return (
    <div className="page-container device-page-container">
      {/* Header Section */}
      <div className="device-header">
        <div className="device-stats">
          <span>{totalDevices} Device</span>
          <span className="online-stat">{onlineDevices} Online</span>
          <span className="offline-stat">{offlineDevices} Offline</span>
        </div>
        <div className="search-container">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <Paper elevation={2} className="table-paper">
        <TableContainer className="table-container">
          <Table stickyHeader aria-label="device table">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Device Address</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Battery</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <StatusIcon
                      className={`status-icon ${device.status}`}
                      aria-label={device.status === 'online' ? 'Device online' : 'Device offline'}
                    />
                  </TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.model}</TableCell>
                  <TableCell>{device.address}</TableCell>
                  <TableCell>{device.group}</TableCell>
                  <TableCell>{device.battery}%</TableCell>
                  <TableCell>{device.temperature}°C</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>{device.lastSeen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default Device;
