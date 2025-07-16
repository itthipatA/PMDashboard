const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Sensor data ingestion endpoint - matches your sensor format
router.post('/pm25', async (req, res) => {
  try {
    const {
      device_id,
      pm_2_5,
      pm_10,
      temperature,
      humidity,
      signal_level,
      pressure,
      battery_level
    } = req.body;
    
    // Validate required fields
    if (!device_id || pm_2_5 === undefined || pm_10 === undefined || temperature === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'device_id, pm_2_5, pm_10, and temperature are required fields'
      });
    }
    
    // Validate data ranges
    if (pm_2_5 < 0 || pm_10 < 0 || temperature < -50 || temperature > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid sensor data ranges'
      });
    }
    
    if (humidity !== undefined && (humidity < 0 || humidity > 100)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Humidity must be between 0 and 100'
      });
    }
    
    if (signal_level !== undefined && (signal_level < -100 || signal_level > 0)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Signal level must be between -100 and 0 dBm'
      });
    }
    
    // Auto-register device if it doesn't exist
    const deviceCheck = await query('SELECT device_id FROM devices WHERE device_id = $1', [device_id]);
    
    if (deviceCheck.rows.length === 0) {
      console.log(`Auto-registering new device: ${device_id}`);
      
      // Insert new device with default values
      const insertDeviceQuery = `
        INSERT INTO devices (
          device_id, 
          name, 
          model, 
          location_name, 
          status, 
          firmware_version, 
          last_seen,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (device_id) DO NOTHING;
      `;
      
      await query(insertDeviceQuery, [
        device_id,
        `Sensor ${device_id}`,
        'Auto-registered',
        `Location ${device_id}`,
        'online',
        'unknown'
      ]);
    }
    
    // Insert sensor reading with field mapping
    const insertReadingQuery = `
      INSERT INTO sensor_readings (
        device_id, 
        pm25, 
        pm10, 
        temperature, 
        humidity, 
        pressure, 
        battery_level, 
        signal_strength,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *;
    `;
    
    const result = await query(insertReadingQuery, [
      device_id,
      pm_2_5,          // pm_2_5 → pm25
      pm_10,           // pm_10 → pm10
      temperature,
      humidity || null,
      pressure || null,
      battery_level || null,
      signal_level || null  // signal_level → signal_strength
    ]);
    
    // Update device last_seen and status
    const updateDeviceQuery = `
      UPDATE devices 
      SET 
        last_seen = NOW(), 
        status = 'online',
        battery_level = COALESCE($1, battery_level),
        updated_at = NOW()
      WHERE device_id = $2;
    `;
    
    await query(updateDeviceQuery, [battery_level || null, device_id]);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Sensor data received successfully',
      data: {
        device_id,
        pm25: pm_2_5,
        pm10: pm_10,
        temperature,
        humidity,
        pressure,
        battery_level,
        signal_level,
        timestamp: result.rows[0].timestamp
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sensor data ingestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to process sensor data'
    });
  }
});

// Alternative endpoint for batch sensor data
router.post('/batch', async (req, res) => {
  try {
    const { readings } = req.body;
    
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'readings array is required'
      });
    }
    
    if (readings.length > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum 100 readings per batch'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      
      try {
        // Validate each reading
        if (!reading.device_id || reading.pm_2_5 === undefined || 
            reading.pm_10 === undefined || reading.temperature === undefined) {
          errors.push({
            index: i,
            error: 'Missing required fields',
            data: reading
          });
          continue;
        }
        
        // Auto-register device if needed
        const deviceCheck = await query('SELECT device_id FROM devices WHERE device_id = $1', [reading.device_id]);
        
        if (deviceCheck.rows.length === 0) {
          await query(`
            INSERT INTO devices (device_id, name, model, location_name, status, firmware_version, last_seen, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            ON CONFLICT (device_id) DO NOTHING;
          `, [
            reading.device_id,
            `Sensor ${reading.device_id}`,
            'Auto-registered',
            `Location ${reading.device_id}`,
            'online',
            'unknown'
          ]);
        }
        
        // Insert reading
        const result = await query(`
          INSERT INTO sensor_readings (device_id, pm25, pm10, temperature, humidity, pressure, battery_level, signal_strength, timestamp) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING *;
        `, [
          reading.device_id,
          reading.pm_2_5,
          reading.pm_10,
          reading.temperature,
          reading.humidity || null,
          reading.pressure || null,
          reading.battery_level || null,
          reading.signal_level || null
        ]);
        
        // Update device
        await query(`
          UPDATE devices 
          SET last_seen = NOW(), status = 'online', battery_level = COALESCE($1, battery_level), updated_at = NOW()
          WHERE device_id = $2;
        `, [reading.battery_level || null, reading.device_id]);
        
        results.push({
          index: i,
          success: true,
          reading_id: result.rows[0].id,
          timestamp: result.rows[0].timestamp
        });
        
      } catch (err) {
        errors.push({
          index: i,
          error: err.message,
          data: reading
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Processed ${results.length} readings successfully`,
      results: {
        successful: results.length,
        failed: errors.length,
        details: results,
        errors: errors.length > 0 ? errors : undefined
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Batch sensor data error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to process batch sensor data'
    });
  }
});

// Get sensor status (for sensor health checking)
router.get('/status/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const statusQuery = `
      SELECT 
        d.device_id,
        d.name,
        d.status,
        d.last_seen,
        d.battery_level,
        d.firmware_version,
        latest.timestamp as last_reading,
        latest.pm25,
        latest.pm10,
        latest.temperature,
        latest.signal_strength,
        EXTRACT(EPOCH FROM (NOW() - d.last_seen)) as seconds_since_last_seen
      FROM devices d
      LEFT JOIN LATERAL (
        SELECT pm25, pm10, temperature, signal_strength, timestamp
        FROM sensor_readings sr
        WHERE sr.device_id = d.device_id
        ORDER BY timestamp DESC
        LIMIT 1
      ) latest ON true
      WHERE d.device_id = $1;
    `;
    
    const result = await query(statusQuery, [deviceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Device not found'
      });
    }
    
    const device = result.rows[0];
    
    // Determine if device is healthy
    const isHealthy = device.status === 'online' && 
                     device.seconds_since_last_seen < 300; // 5 minutes
    
    res.json({
      success: true,
      device: {
        device_id: device.device_id,
        name: device.name,
        status: device.status,
        healthy: isHealthy,
        last_seen: device.last_seen,
        last_reading: device.last_reading,
        battery_level: device.battery_level,
        firmware_version: device.firmware_version,
        seconds_since_last_seen: Math.round(device.seconds_since_last_seen || 0),
        latest_data: {
          pm25: device.pm25,
          pm10: device.pm10,
          temperature: device.temperature,
          signal_strength: device.signal_strength
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get sensor status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to get sensor status'
    });
  }
});

module.exports = router;