-- PMDashboard Database Schema
-- Air Quality Monitoring System

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS device_groups CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Device groups table
CREATE TABLE device_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location_area VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(50),
    location_name VARCHAR(100),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    group_id INTEGER REFERENCES device_groups(id),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    firmware_version VARCHAR(20),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings table (time-series data)
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE CASCADE,
    pm25 DECIMAL(8,2) CHECK (pm25 IS NULL OR pm25 >= 0),
    pm10 DECIMAL(8,2) CHECK (pm10 IS NULL OR pm10 >= 0),
    temperature DECIMAL(5,2) CHECK (temperature IS NULL OR (temperature >= -50 AND temperature <= 100)),
    humidity DECIMAL(5,2) CHECK (humidity IS NULL OR (humidity >= 0 AND humidity <= 100)),
    pressure DECIMAL(8,2),
    battery_level INTEGER CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100)),
    signal_strength INTEGER CHECK (signal_strength IS NULL OR (signal_strength >= -100 AND signal_strength <= 0)),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert history table
CREATE TABLE alert_history (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('pm25_high', 'pm10_high', 'device_offline', 'battery_low', 'sensor_error')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    value DECIMAL(10,2),
    threshold DECIMAL(10,2),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_group_id ON devices(group_id);

CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, timestamp DESC);
CREATE INDEX idx_sensor_readings_pm25 ON sensor_readings(pm25);
CREATE INDEX idx_sensor_readings_pm10 ON sensor_readings(pm10);

CREATE INDEX idx_alert_history_device_id ON alert_history(device_id);
CREATE INDEX idx_alert_history_timestamp ON alert_history(created_at DESC);
CREATE INDEX idx_alert_history_type ON alert_history(alert_type);
CREATE INDEX idx_alert_history_resolved ON alert_history(is_resolved);

-- Create trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at 
    BEFORE UPDATE ON devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_groups_updated_at 
    BEFORE UPDATE ON device_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for dashboard summary
CREATE VIEW dashboard_summary AS
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
) latest ON true;

-- Create view for device statistics
CREATE VIEW device_statistics AS
SELECT 
    device_id,
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
GROUP BY device_id;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pmuser;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pmuser;