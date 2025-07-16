const { query, testConnection } = require('./connection');

// Sample device groups
const deviceGroups = [
  { name: 'หมู่บ้านอยู่ดี', description: 'Residential area monitoring', location_area: 'หัวหมาก' },
  { name: 'หมู่บ้านมีสุข', description: 'Community happiness zone', location_area: 'บางกะปิ' },
  { name: 'หมู่บ้านมีเงิน', description: 'Commercial district', location_area: 'พระโขนง' },
  { name: 'หมู่บ้านป่าเขา', description: 'Forest hill community', location_area: 'ลาดพร้าว' },
  { name: 'Industrial Estate', description: 'Industrial monitoring zone', location_area: 'ลาดกระบัง' }
];

// Sample devices
const devices = [
  {
    device_id: 'Station-01',
    name: 'Station 01 - Industrial Estate',
    model: 'SE-100',
    location_name: 'Industrial Estate Main Gate',
    location_lat: 13.7512,
    location_lng: 100.6414,
    group_id: 5,
    status: 'online',
    battery_level: 78,
    firmware_version: '1.2.3'
  },
  {
    device_id: 'Station-02',
    name: 'Station 02 - Downtown',
    model: 'SE-100',
    location_name: 'Downtown Shopping Center',
    location_lat: 13.7480,
    location_lng: 100.6390,
    group_id: 3,
    status: 'online',
    battery_level: 12,
    firmware_version: '1.2.3'
  },
  {
    device_id: 'Station-03',
    name: 'Station 03 - New City',
    model: 'SE-100',
    location_name: 'New City Residential',
    location_lat: 13.7550,
    location_lng: 100.6450,
    group_id: 1,
    status: 'online',
    battery_level: 95,
    firmware_version: '1.2.3'
  },
  {
    device_id: 'Station-04',
    name: 'Station 04 - ชานเมือง',
    model: 'SE-100',
    location_name: 'ชานเมือง Community Center',
    location_lat: 13.7600,
    location_lng: 100.6300,
    group_id: 2,
    status: 'online',
    battery_level: 54,
    firmware_version: '1.2.3'
  },
  {
    device_id: 'Station-05',
    name: 'Station 05 - สวนสาธารณะ',
    model: 'SE-100',
    location_name: 'Public Park Central',
    location_lat: 13.7450,
    location_lng: 100.6500,
    group_id: 4,
    status: 'online',
    battery_level: 82,
    firmware_version: '1.2.3'
  }
];

// Generate realistic sensor readings for the last 7 days
const generateSensorReadings = () => {
  const readings = [];
  const now = new Date();
  const deviceIds = devices.map(d => d.device_id);
  
  // Generate 7 days of hourly data
  for (let days = 0; days < 7; days++) {
    for (let hours = 0; hours < 24; hours++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - days);
      timestamp.setHours(hours, Math.floor(Math.random() * 60), 0, 0);
      
      deviceIds.forEach((deviceId, index) => {
        // Simulate realistic air quality patterns
        const isRushHour = hours >= 7 && hours <= 9 || hours >= 17 && hours <= 19;
        const isNight = hours >= 22 || hours <= 6;
        const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;
        
        // Base PM2.5 values (different for each station)
        const basePM25Values = [45, 32, 18, 22, 15]; // From original deviceData
        let pm25 = basePM25Values[index] + (Math.random() - 0.5) * 10;
        
        // Apply time-based variations
        if (isRushHour && !isWeekend) pm25 += Math.random() * 15;
        if (isNight) pm25 -= Math.random() * 8;
        if (isWeekend) pm25 -= Math.random() * 5;
        
        // Ensure positive values
        pm25 = Math.max(5, pm25);
        
        // PM10 is typically 1.5-2x higher than PM2.5
        const pm10 = pm25 * (1.5 + Math.random() * 0.5);
        
        // Temperature variations (Bangkok climate)
        const baseTemp = 27 + Math.sin((hours - 6) * Math.PI / 12) * 5; // Daily cycle
        const temperature = baseTemp + (Math.random() - 0.5) * 3;
        
        // Humidity (inverse relationship with temperature)
        const humidity = 75 - (temperature - 27) * 2 + (Math.random() - 0.5) * 10;
        
        // Battery level (slowly decreasing over time)
        const batteryBase = devices[index].battery_level;
        const batteryDecay = days * 0.5 + Math.random() * 2;
        const battery_level = Math.max(10, batteryBase - batteryDecay);
        
        // Signal strength (random but realistic)
        const signal_strength = -30 - Math.random() * 40;
        
        readings.push({
          device_id: deviceId,
          pm25: Math.round(pm25 * 10) / 10,
          pm10: Math.round(pm10 * 10) / 10,
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.round(Math.max(30, Math.min(95, humidity)) * 10) / 10,
          pressure: Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10,
          battery_level: Math.round(battery_level),
          signal_strength: Math.round(signal_strength),
          timestamp: timestamp.toISOString()
        });
      });
    }
  }
  
  return readings;
};

// Sample alert history
const generateAlertHistory = () => {
  const alerts = [];
  const now = new Date();
  const deviceIds = devices.map(d => d.device_id);
  
  // Generate some sample alerts for the last 30 days
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    const alertTypes = ['pm25_high', 'pm10_high', 'device_offline', 'battery_low'];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    let message, value, threshold, severity;
    
    switch (alertType) {
      case 'pm25_high':
        value = 50 + Math.random() * 50;
        threshold = 50;
        severity = value > 75 ? 'high' : 'medium';
        message = `PM2.5 level exceeded threshold: ${value.toFixed(1)} µg/m³`;
        break;
      case 'pm10_high':
        value = 80 + Math.random() * 70;
        threshold = 80;
        severity = value > 120 ? 'high' : 'medium';
        message = `PM10 level exceeded threshold: ${value.toFixed(1)} µg/m³`;
        break;
      case 'device_offline':
        severity = 'high';
        message = 'Device went offline unexpectedly';
        break;
      case 'battery_low':
        value = Math.random() * 15;
        threshold = 15;
        severity = value < 5 ? 'high' : 'medium';
        message = `Battery level critically low: ${value.toFixed(0)}%`;
        break;
    }
    
    alerts.push({
      device_id: deviceId,
      alert_type: alertType,
      severity,
      message,
      value,
      threshold,
      is_resolved: Math.random() > 0.3,
      resolved_at: Math.random() > 0.3 ? new Date(timestamp.getTime() + Math.random() * 3600000).toISOString() : null,
      created_at: timestamp.toISOString()
    });
  }
  
  return alerts;
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await query('DELETE FROM alert_history');
    await query('DELETE FROM sensor_readings');
    await query('DELETE FROM devices');
    await query('DELETE FROM device_groups');
    await query('DELETE FROM users');
    
    // Reset sequences
    await query('ALTER SEQUENCE device_groups_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE devices_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    
    // Insert device groups
    console.log('📁 Inserting device groups...');
    for (const group of deviceGroups) {
      await query(
        'INSERT INTO device_groups (name, description, location_area) VALUES ($1, $2, $3)',
        [group.name, group.description, group.location_area]
      );
    }
    
    // Insert devices
    console.log('📡 Inserting devices...');
    for (const device of devices) {
      await query(
        `INSERT INTO devices (device_id, name, model, location_name, location_lat, location_lng, 
         group_id, status, battery_level, firmware_version, last_seen) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          device.device_id, device.name, device.model, device.location_name,
          device.location_lat, device.location_lng, device.group_id,
          device.status, device.battery_level, device.firmware_version,
          new Date().toISOString()
        ]
      );
    }
    
    // Insert sensor readings
    console.log('📊 Generating and inserting sensor readings...');
    const readings = generateSensorReadings();
    
    // Insert readings in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < readings.length; i += batchSize) {
      const batch = readings.slice(i, i + batchSize);
      const values = batch.map(r => 
        `('${r.device_id}', ${r.pm25}, ${r.pm10}, ${r.temperature}, ${r.humidity}, ${r.pressure}, ${r.battery_level}, ${r.signal_strength}, '${r.timestamp}')`
      ).join(',');
      
      await query(`
        INSERT INTO sensor_readings (device_id, pm25, pm10, temperature, humidity, pressure, battery_level, signal_strength, timestamp)
        VALUES ${values}
      `);
      
      console.log(`   Inserted ${Math.min(i + batchSize, readings.length)}/${readings.length} readings`);
    }
    
    // Insert alert history
    console.log('🚨 Inserting alert history...');
    const alerts = generateAlertHistory();
    for (const alert of alerts) {
      await query(
        `INSERT INTO alert_history (device_id, alert_type, severity, message, value, threshold, is_resolved, resolved_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          alert.device_id, alert.alert_type, alert.severity, alert.message,
          alert.value, alert.threshold, alert.is_resolved, alert.resolved_at, alert.created_at
        ]
      );
    }
    
    // Insert default user
    console.log('👤 Creating default user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('1', 10);
    await query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
      ['admin', 'admin@rf.co.th', hashedPassword, 'Administrator', 'admin']
    );
    
    // Show summary
    console.log('\n✅ Database seeding completed successfully!');
    console.log('📈 Summary:');
    
    const groupCount = await query('SELECT COUNT(*) FROM device_groups');
    const deviceCount = await query('SELECT COUNT(*) FROM devices');
    const readingCount = await query('SELECT COUNT(*) FROM sensor_readings');
    const alertCount = await query('SELECT COUNT(*) FROM alert_history');
    const userCount = await query('SELECT COUNT(*) FROM users');
    
    console.log(`   Device Groups: ${groupCount.rows[0].count}`);
    console.log(`   Devices: ${deviceCount.rows[0].count}`);
    console.log(`   Sensor Readings: ${readingCount.rows[0].count}`);
    console.log(`   Alert History: ${alertCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    
    console.log('\n🔑 Default login credentials:');
    console.log('   Username: admin');
    console.log('   Password: 1');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };