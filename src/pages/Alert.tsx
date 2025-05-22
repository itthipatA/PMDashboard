import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button, // Using Button for filters for better semantics
} from '@mui/material';
import {
  Search as SearchIcon,
  CircleOutlined as StatusIcon,
} from '@mui/icons-material';
import './Alert.css'; // Use specific CSS for this page

// Sample data structure for alerts
interface AlertData {
  id: number;
  read: boolean;
  date: string;
  name: string;
  model: string | null; // Model might be null
  group: string;
  details: string;
  type: 'event' | 'device' | 'risk'; // Added type for filtering
}

const dummyAlerts: AlertData[] = [
  {
    id: 1,
    read: false,
    date: '7/3/2568',
    name: 'Huamark Soi 1',
    model: 'SE-100',
    group: 'หมู่บ้านอยู่ดี',
    details: 'ตรวจพบอุปกรณ์ Down เมื่อ 7/3/2568 10.45 น.',
    type: 'device',
  },
  {
    id: 2,
    read: false,
    date: '7/3/2568',
    name: 'Huamark Soi 2',
    model: 'SE-100',
    group: 'หมู่บ้านอยู่ดี',
    details: 'ตรวจพบอุปกรณ์ Down เมื่อ 7/3/2568 10.45 น.',
    type: 'device',
  },
  {
    id: 3,
    read: true,
    date: '7/3/2568',
    name: 'Huamark Soi 3',
    model: 'SE-100',
    group: 'หมู่บ้านมีสุข',
    details: 'ตรวจพบอุปกรณ์ UP เมื่อ 7/3/2568 8.40 น.',
    type: 'device',
  },
  {
    id: 4,
    read: false,
    date: '28/2/2568',
    name: 'Huamark Soi 4',
    model: 'SE-100',
    group: 'หมู่บ้านมีสุข',
    details: 'อุณหภูมิ ของอุปกรณ์สูงผิดปกติ',
    type: 'risk',
  },
  {
    id: 5,
    read: true,
    date: '21/2/2568',
    name: 'ซอยสุขสบาย',
    model: null,
    group: 'หมู่บ้านแสงดาวแห่งการเติบโต',
    details: 'มีปริมาณค่าฝุ่น PM2.5 เกินกำหนด',
    type: 'event',
  },
  {
    id: 6,
    read: true,
    date: '15/2/2568',
    name: 'หมู่บ้านสวนสวยของการใช้ชีวิต',
    model: null,
    group: 'All',
    details: 'มีปริมาณค่าฝุ่น PM2.5 เกินกำหนด',
    type: 'event',
  },
  {
    id: 7,
    read: true,
    date: '7/3/2568',
    name: 'หมู่บ้านแห่งความฝันและการเติบโต',
    model: null,
    group: 'All',
    details: 'มีปริมาณค่าฝุ่น PM2.5 เกินกำหนด',
    type: 'event',
  },
  {
    id: 8,
    read: false,
    date: '28/2/2568',
    name: 'Huamark Soi 8',
    model: 'SE-100',
    group: 'หมู่บ้านมิตรภาพแห่งความสงบ',
    details: 'มีปริมาณค่าฝุ่น PM2.5 เกินกำหนด',
    type: 'risk',
  },
  {
    id: 9,
    read: true,
    date: '21/2/2568',
    name: 'Huamark Soi 4',
    model: 'SE-100',
    group: 'หมู่บ้านมีสุข',
    details: 'ตรวจพบอุปกรณ์ UP เมื่อ 7/3/2568 8.40 น.',
    type: 'device',
  },
];

const Alert: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'event', 'device', 'risk'

  const filteredAlerts = dummyAlerts.filter((alert) => {
    const matchesSearchTerm =
      alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.model &&
        alert.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterType =
      activeFilter === 'all' ? true : alert.type === activeFilter;

    return matchesSearchTerm && matchesFilterType;
  });

  // Dummy stats (could also be memoized if alerts data grows significantly)
  const totalAlerts = dummyAlerts.length;
  const readAlerts = dummyAlerts.filter((a) => a.read).length;
  const unreadAlerts = totalAlerts - readAlerts;

  return (
    <div className="page-container alert-page-container">
      {/* Left Filter Column */}
      <div className="alert-filters">
        <Button
          variant={activeFilter === 'all' ? 'contained' : 'outlined'}
          className={`filter-button all ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Event
        </Button>
        <Button
          variant={activeFilter === 'event' ? 'contained' : 'outlined'}
          className={`filter-button event ${activeFilter === 'event' ? 'active' : ''}`}
          onClick={() => setActiveFilter('event')}
        >
          Event Alerts
        </Button>
        <Button
          variant={activeFilter === 'device' ? 'contained' : 'outlined'}
          className={`filter-button device ${activeFilter === 'device' ? 'active' : ''}`}
          onClick={() => setActiveFilter('device')}
        >
          Device Alerts
        </Button>
        <Button
          variant={activeFilter === 'risk' ? 'contained' : 'outlined'}
          className={`filter-button risk ${activeFilter === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveFilter('risk')}
        >
          Risk Alerts
        </Button>
      </div>

      {/* Right Content Column */}
      <div className="alert-content">
        {/* Header Section */}
        <div className="alert-header">
          <div className="alert-stats">
            <span>{totalAlerts} Alerts</span>
            <span className="read-stat">{readAlerts} Read</span>
            <span className="unread-stat">{unreadAlerts} Unread</span>
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
        <Paper elevation={2} className="alert-table-paper">
          <TableContainer className="alert-table-container">
            <Table stickyHeader aria-label="alert table">
              <TableHead>
                <TableRow>
                  <TableCell>Read/Unread</TableCell>
                  <TableCell>Date Alerts</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Notification Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <StatusIcon
                        className={`status-icon ${alert.read ? 'read' : 'unread'}`}
                        aria-label={alert.read ? 'Alert read' : 'Alert unread'}
                      />
                    </TableCell>
                    <TableCell>{alert.date}</TableCell>
                    <TableCell>{alert.name}</TableCell>
                    <TableCell>{alert.model || '-'}</TableCell>
                    <TableCell>{alert.group}</TableCell>
                    <TableCell>{alert.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </div>
  );
};

export default Alert;
