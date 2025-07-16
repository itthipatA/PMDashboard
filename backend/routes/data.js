const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Get specific data type (PM2.5, PM10, or temperature)
router.get('/:dataType', async (req, res) => {
  try {
    const { dataType } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    const deviceId = req.query.device_id;
    
    // Validate data type
    const validTypes = ['pm25', 'pm10', 'temperature', 'humidity'];
    if (!validTypes.includes(dataType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid data type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
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
    
    const dataQuery = `
      SELECT 
        device_id,
        ${dataType},
        timestamp
      FROM sensor_readings
      ${whereClause}
      ORDER BY timestamp ASC;
    `;
    
    const result = await query(dataQuery, queryParams);
    
    // Group data by hour for better performance
    const groupedData = {};
    result.rows.forEach(row => {
      const hour = new Date(row.timestamp).toISOString().slice(0, 13) + ':00:00Z';
      if (!groupedData[hour]) {
        groupedData[hour] = {
          timestamp: hour,
          values: [],
          devices: new Set()
        };
      }
      
      groupedData[hour].values.push(row[dataType]);
      groupedData[hour].devices.add(row.device_id);
    });
    
    // Calculate averages for each hour
    const chartData = Object.values(groupedData).map(hour => ({
      timestamp: hour.timestamp,
      value: Math.round((hour.values.reduce((a, b) => a + b, 0) / hour.values.length) * 10) / 10,
      device_count: hour.devices.size
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      data: chartData,
      data_type: dataType,
      period: `${hours} hours`,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get data type error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch data'
    });
  }
});

// Get latest values for specific data type
router.get('/:dataType/latest', async (req, res) => {
  try {
    const { dataType } = req.params;
    const deviceId = req.query.device_id;
    
    // Validate data type
    const validTypes = ['pm25', 'pm10', 'temperature', 'humidity'];
    if (!validTypes.includes(dataType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid data type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
    let whereClause = '';
    let queryParams = [];
    
    if (deviceId) {
      whereClause = 'WHERE device_id = $1';
      queryParams.push(deviceId);
    }
    
    const latestQuery = `
      SELECT 
        device_id,
        ${dataType},
        timestamp
      FROM sensor_readings
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT 10;
    `;
    
    const result = await query(latestQuery, queryParams);
    
    // Calculate statistics
    const values = result.rows.map(row => row[dataType]).filter(val => val !== null);
    const stats = values.length > 0 ? {
      latest: values[0],
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    } : null;
    
    res.json({
      readings: result.rows,
      statistics: stats,
      data_type: dataType,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get latest data type error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch latest data'
    });
  }
});

// Get statistics for specific data type
router.get('/:dataType/stats', async (req, res) => {
  try {
    const { dataType } = req.params;
    const period = req.query.period || '24h';
    const deviceId = req.query.device_id;
    
    // Validate data type
    const validTypes = ['pm25', 'pm10', 'temperature', 'humidity'];
    if (!validTypes.includes(dataType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid data type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
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
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_readings,
        AVG(${dataType}) as average,
        MAX(${dataType}) as maximum,
        MIN(${dataType}) as minimum,
        STDDEV(${dataType}) as std_deviation,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${dataType}) as median,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${dataType}) as percentile_95
      FROM sensor_readings
      ${whereClause}
      AND ${dataType} IS NOT NULL;
    `;
    
    const result = await query(statsQuery, queryParams);
    const stats = result.rows[0];
    
    // Round numeric values
    Object.keys(stats).forEach(key => {
      if (stats[key] !== null && key !== 'total_readings') {
        stats[key] = Math.round(stats[key] * 10) / 10;
      }
    });
    
    // Get hourly trends
    const trendQuery = `
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        AVG(${dataType}) as avg_value,
        COUNT(*) as reading_count
      FROM sensor_readings
      ${whereClause}
      AND ${dataType} IS NOT NULL
      GROUP BY DATE_TRUNC('hour', timestamp)
      ORDER BY hour DESC
      LIMIT 24;
    `;
    
    const trendResult = await query(trendQuery, queryParams);
    const trends = trendResult.rows.map(row => ({
      hour: row.hour,
      average: Math.round(row.avg_value * 10) / 10,
      count: parseInt(row.reading_count)
    }));
    
    res.json({
      statistics: stats,
      trends: trends.reverse(), // Most recent first
      data_type: dataType,
      period,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get data type stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch statistics'
    });
  }
});

// Get comparison data between two data types
router.get('/compare/:dataType1/:dataType2', async (req, res) => {
  try {
    const { dataType1, dataType2 } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    const deviceId = req.query.device_id;
    
    // Validate data types
    const validTypes = ['pm25', 'pm10', 'temperature', 'humidity'];
    if (!validTypes.includes(dataType1) || !validTypes.includes(dataType2)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid data type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
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
    
    const comparisonQuery = `
      SELECT 
        device_id,
        ${dataType1},
        ${dataType2},
        timestamp
      FROM sensor_readings
      ${whereClause}
      AND ${dataType1} IS NOT NULL
      AND ${dataType2} IS NOT NULL
      ORDER BY timestamp ASC;
    `;
    
    const result = await query(comparisonQuery, queryParams);
    
    // Group data by hour for better performance
    const groupedData = {};
    result.rows.forEach(row => {
      const hour = new Date(row.timestamp).toISOString().slice(0, 13) + ':00:00Z';
      if (!groupedData[hour]) {
        groupedData[hour] = {
          timestamp: hour,
          values1: [],
          values2: [],
          devices: new Set()
        };
      }
      
      groupedData[hour].values1.push(row[dataType1]);
      groupedData[hour].values2.push(row[dataType2]);
      groupedData[hour].devices.add(row.device_id);
    });
    
    // Calculate averages for each hour
    const chartData = Object.values(groupedData).map(hour => ({
      timestamp: hour.timestamp,
      [dataType1]: Math.round((hour.values1.reduce((a, b) => a + b, 0) / hour.values1.length) * 10) / 10,
      [dataType2]: Math.round((hour.values2.reduce((a, b) => a + b, 0) / hour.values2.length) * 10) / 10,
      device_count: hour.devices.size
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Calculate correlation coefficient
    const calculateCorrelation = (x, y) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };
    
    const values1 = chartData.map(d => d[dataType1]);
    const values2 = chartData.map(d => d[dataType2]);
    const correlation = calculateCorrelation(values1, values2);
    
    res.json({
      data: chartData,
      comparison: {
        data_type_1: dataType1,
        data_type_2: dataType2,
        correlation: Math.round(correlation * 1000) / 1000,
        correlation_strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                             Math.abs(correlation) > 0.3 ? 'moderate' : 'weak'
      },
      period: `${hours} hours`,
      device_filter: deviceId || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get comparison data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch comparison data'
    });
  }
});

module.exports = router;