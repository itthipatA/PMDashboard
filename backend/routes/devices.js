const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Get all devices
router.get('/', async (req, res) => {
  try {
    const devicesQuery = `
      SELECT 
        d.id,
        d.device_id,
        d.name,
        d.model,
        d.location_name,
        d.location_lat,
        d.location_lng,
        d.status,
        d.battery_level,
        d.firmware_version,
        d.last_seen,
        d.created_at,
        dg.name as group_name,
        dg.location_area,
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
    
    const result = await query(devicesQuery);
    const devices = result.rows;
    
    // Get device counts by status
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM devices
      GROUP BY status;
    `;
    
    const statusResult = await query(statusQuery);
    const statusCounts = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    
    res.json({
      devices,
      total: devices.length,
      status_counts: statusCounts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch devices'
    });
  }
});

// Get single device by ID
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const deviceQuery = `
      SELECT 
        d.id,
        d.device_id,
        d.name,
        d.model,
        d.location_name,
        d.location_lat,
        d.location_lng,
        d.status,
        d.battery_level,
        d.firmware_version,
        d.last_seen,
        d.created_at,
        d.updated_at,
        dg.name as group_name,
        dg.description as group_description,
        dg.location_area
      FROM devices d
      LEFT JOIN device_groups dg ON d.group_id = dg.id
      WHERE d.device_id = $1;
    `;
    
    const result = await query(deviceQuery, [deviceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Device not found'
      });
    }
    
    const device = result.rows[0];
    
    // Get latest readings
    const readingsQuery = `
      SELECT 
        pm25,
        pm10,
        temperature,
        humidity,
        pressure,
        battery_level,
        signal_strength,
        timestamp
      FROM sensor_readings
      WHERE device_id = $1
      ORDER BY timestamp DESC
      LIMIT 10;
    `;
    
    const readingsResult = await query(readingsQuery, [deviceId]);
    const recentReadings = readingsResult.rows;
    
    // Get device statistics
    const statsQuery = `
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
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading
      FROM sensor_readings
      WHERE device_id = $1
        AND timestamp >= NOW() - INTERVAL '30 days';
    `;
    
    const statsResult = await query(statsQuery, [deviceId]);
    const stats = statsResult.rows[0];
    
    // Round numeric values
    Object.keys(stats).forEach(key => {
      if (stats[key] !== null && !['total_readings', 'first_reading', 'last_reading'].includes(key)) {
        stats[key] = Math.round(stats[key] * 10) / 10;
      }
    });
    
    res.json({
      device,
      recent_readings: recentReadings,
      statistics: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch device data'
    });
  }
});

// Get device readings with pagination
router.get('/:deviceId/readings', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 1000); // Max 1000 records
    const offset = (page - 1) * limit;
    
    // Optional date filtering
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    
    let whereClause = 'WHERE device_id = $1';
    let queryParams = [deviceId];
    let paramIndex = 2;
    
    if (startDate) {
      whereClause += ` AND timestamp >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClause += ` AND timestamp <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sensor_readings
      ${whereClause};
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get readings with pagination
    const readingsQuery = `
      SELECT 
        pm25,
        pm10,
        temperature,
        humidity,
        pressure,
        battery_level,
        signal_strength,
        timestamp
      FROM sensor_readings
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    
    queryParams.push(limit, offset);
    const readingsResult = await query(readingsQuery, queryParams);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      readings: readingsResult.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters: {
        start_date: startDate || null,
        end_date: endDate || null
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get device readings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch device readings'
    });
  }
});

// Update device status (for maintenance/testing)
router.patch('/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['online', 'offline', 'maintenance', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const updateQuery = `
      UPDATE devices 
      SET status = $1, updated_at = NOW()
      WHERE device_id = $2
      RETURNING device_id, name, status, updated_at;
    `;
    
    const result = await query(updateQuery, [status, deviceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Device not found'
      });
    }
    
    res.json({
      message: 'Device status updated successfully',
      device: result.rows[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update device status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update device status'
    });
  }
});

// Add new sensor reading (for sensor integration)
router.post('/:deviceId/readings', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const {
      pm25,
      pm10,
      temperature,
      humidity,
      pressure,
      battery_level,
      signal_strength
    } = req.body;
    
    // Validate required fields
    if (pm25 === undefined || pm10 === undefined || temperature === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'pm25, pm10, and temperature are required fields'
      });
    }
    
    // Validate device exists
    const deviceCheck = await query('SELECT device_id FROM devices WHERE device_id = $1', [deviceId]);
    if (deviceCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Device not found'
      });
    }
    
    // Insert new reading
    const insertQuery = `
      INSERT INTO sensor_readings (
        device_id, pm25, pm10, temperature, humidity, pressure, battery_level, signal_strength
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    
    const result = await query(insertQuery, [
      deviceId, pm25, pm10, temperature, humidity, pressure, battery_level, signal_strength
    ]);
    
    // Update device last_seen and battery_level
    const updateDeviceQuery = `
      UPDATE devices 
      SET last_seen = NOW(), battery_level = $1, status = 'online'
      WHERE device_id = $2;
    `;
    
    await query(updateDeviceQuery, [battery_level || null, deviceId]);
    
    res.status(201).json({
      message: 'Sensor reading added successfully',
      reading: result.rows[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Add sensor reading error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add sensor reading'
    });
  }
});

module.exports = router;