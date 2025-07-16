const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Get latest dashboard data
router.get('/latest', async (req, res) => {
  try {
    // Get latest readings for all devices
    const devicesQuery = `
      SELECT 
        d.device_id,
        d.name,
        d.status,
        d.location_name,
        d.location_lat,
        d.location_lng,
        d.battery_level,
        d.last_seen,
        dg.name as group_name,
        latest.pm25,
        latest.pm10,
        latest.temperature,
        latest.humidity,
        latest.timestamp as last_reading
      FROM devices d
      LEFT JOIN device_groups dg ON d.group_id = dg.id
      LEFT JOIN LATERAL (
        SELECT pm25, pm10, temperature, humidity, timestamp
        FROM sensor_readings sr
        WHERE sr.device_id = d.device_id
        ORDER BY timestamp DESC
        LIMIT 1
      ) latest ON true
      ORDER BY d.name;
    `;
    
    const devicesResult = await query(devicesQuery);
    const devices = devicesResult.rows;
    
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT device_id) as total_devices,
        COUNT(DISTINCT CASE WHEN status = 'online' THEN device_id END) as online_devices,
        COUNT(DISTINCT CASE WHEN status = 'offline' THEN device_id END) as offline_devices,
        AVG(battery_level) as avg_battery
      FROM devices;
    `;
    
    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];
    
    // Get latest readings summary
    const summaryQuery = `
      SELECT 
        AVG(pm25) as avg_pm25,
        MAX(pm25) as max_pm25,
        MIN(pm25) as min_pm25,
        AVG(pm10) as avg_pm10,
        MAX(pm10) as max_pm10,
        MIN(pm10) as min_pm10,
        AVG(temperature) as avg_temperature,
        MAX(temperature) as max_temperature,
        MIN(temperature) as min_temperature
      FROM sensor_readings
      WHERE timestamp >= NOW() - INTERVAL '1 hour';
    `;
    
    const summaryResult = await query(summaryQuery);
    const summary = summaryResult.rows[0];
    
    // Round numeric values
    Object.keys(summary).forEach(key => {
      if (summary[key] !== null) {
        summary[key] = Math.round(summary[key] * 10) / 10;
      }
    });
    
    res.json({
      devices,
      stats: {
        total_devices: parseInt(stats.total_devices),
        online_devices: parseInt(stats.online_devices),
        offline_devices: parseInt(stats.offline_devices),
        avg_battery: Math.round(stats.avg_battery || 0)
      },
      summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard latest data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get historical data for charts
router.get('/historical/:hours', async (req, res) => {
  try {
    const hours = parseInt(req.params.hours) || 24;
    const deviceId = req.query.device_id;
    
    // Validate hours parameter
    if (hours < 1 || hours > 168) { // Max 7 days
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Hours must be between 1 and 168 (7 days)'
      });
    }
    
    let whereClause = 'WHERE timestamp >= NOW() - INTERVAL $1';
    let queryParams = [`${hours} hours`];
    
    if (deviceId) {
      whereClause += ' AND device_id = $2';
      queryParams.push(deviceId);
    }
    
    const historicalQuery = `
      SELECT 
        device_id,
        pm25,
        pm10,
        temperature,
        humidity,
        timestamp
      FROM sensor_readings
      ${whereClause}
      ORDER BY timestamp ASC;
    `;
    
    const result = await query(historicalQuery, queryParams);
    
    // Group data by hour for better performance
    const groupedData = {};
    result.rows.forEach(row => {
      const hour = new Date(row.timestamp).toISOString().slice(0, 13) + ':00:00Z';
      if (!groupedData[hour]) {
        groupedData[hour] = {
          timestamp: hour,
          pm25: [],
          pm10: [],
          temperature: [],
          devices: new Set()
        };
      }
      
      groupedData[hour].pm25.push(row.pm25);
      groupedData[hour].pm10.push(row.pm10);
      groupedData[hour].temperature.push(row.temperature);
      groupedData[hour].devices.add(row.device_id);
    });
    
    // Calculate averages for each hour
    const chartData = Object.values(groupedData).map(hour => ({
      timestamp: hour.timestamp,
      pm25: Math.round((hour.pm25.reduce((a, b) => a + b, 0) / hour.pm25.length) * 10) / 10,
      pm10: Math.round((hour.pm10.reduce((a, b) => a + b, 0) / hour.pm10.length) * 10) / 10,
      temperature: Math.round((hour.temperature.reduce((a, b) => a + b, 0) / hour.temperature.length) * 10) / 10,
      device_count: hour.devices.size
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      data: chartData,
      period: `${hours} hours`,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard historical data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch historical data'
    });
  }
});

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const period = req.query.period || '24h';
    const deviceId = req.query.device_id;
    
    // Convert period to hours
    const periodHours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[period] || 24;
    
    let whereClause = 'WHERE timestamp >= NOW() - INTERVAL $1';
    let queryParams = [`${periodHours} hours`];
    
    if (deviceId) {
      whereClause += ' AND device_id = $2';
      queryParams.push(deviceId);
    }
    
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_readings,
        AVG(pm25) as avg_pm25,
        MAX(pm25) as max_pm25,
        MIN(pm25) as min_pm25,
        AVG(pm10) as avg_pm10,
        MAX(pm10) as max_pm10,
        MIN(pm10) as min_pm10,
        AVG(temperature) as avg_temperature,
        MAX(temperature) as max_temperature,
        MIN(temperature) as min_temperature,
        AVG(humidity) as avg_humidity,
        MAX(humidity) as max_humidity,
        MIN(humidity) as min_humidity
      FROM sensor_readings
      ${whereClause};
    `;
    
    const result = await query(summaryQuery, queryParams);
    const summary = result.rows[0];
    
    // Round numeric values
    Object.keys(summary).forEach(key => {
      if (summary[key] !== null && key !== 'total_readings') {
        summary[key] = Math.round(summary[key] * 10) / 10;
      }
    });
    
    res.json({
      summary,
      period,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch summary data'
    });
  }
});

module.exports = router;