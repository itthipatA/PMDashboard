# PostgreSQL Setup Guide for PMDashboard

This guide will help you set up PostgreSQL database for the PMDashboard application on your AWS EC2 instance.

## 📋 Prerequisites

- AWS EC2 instance with Ubuntu 20.04 LTS or similar
- Root or sudo access to the server
- Basic knowledge of command line operations

## 🛠️ Installation Steps

### Step 1: Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL and additional packages
sudo apt install postgresql postgresql-contrib postgresql-client

# Check PostgreSQL version
sudo -u postgres psql -c "SELECT version();"
```

### Step 2: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database
createdb pmdashboard

# Access PostgreSQL prompt
psql
```

### Step 3: Create Database User

```sql
-- Create user for the application
CREATE USER pmuser WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pmdashboard TO pmuser;

-- Connect to the database
\c pmdashboard

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO pmuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pmuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pmuser;

-- Exit PostgreSQL
\q
```

### Step 4: Configure PostgreSQL for Remote Access (Optional)

If you need to access PostgreSQL from outside the EC2 instance:

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and modify these lines:
listen_addresses = '*'
port = 5432

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line for remote access (adjust IP range as needed):
host    all             all             0.0.0.0/0               md5
```

### Step 5: Restart PostgreSQL

```bash
# Restart PostgreSQL service
sudo systemctl restart postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

## 🗄️ Database Setup

### Step 1: Create Database Schema

```bash
# Navigate to backend directory
cd /path/to/PMDashboard/backend

# Run schema creation script
sudo -u postgres psql -d pmdashboard -f database/schema.sql
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Update these values in your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pmdashboard
DB_USER=pmuser
DB_PASSWORD=your_secure_password_here
```

### Step 3: Test Database Connection

```bash
# Install backend dependencies
npm install

# Test database connection
node -e "
const { testConnection } = require('./database/connection');
testConnection().then(success => {
  console.log(success ? '✅ Connection successful' : '❌ Connection failed');
  process.exit(success ? 0 : 1);
});
"
```

### Step 4: Seed Test Data

```bash
# Run the seed script to populate test data
npm run seed
```

## 🔧 Database Management

### Useful PostgreSQL Commands

```sql
-- Connect to database
\c pmdashboard

-- List all tables
\dt

-- Describe table structure
\d table_name

-- Check table data
SELECT * FROM devices LIMIT 5;

-- Check recent sensor readings
SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 10;

-- View database size
SELECT pg_size_pretty(pg_database_size('pmdashboard'));
```

### Performance Optimization

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor query performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC;
```

## 📊 Monitoring and Maintenance

### Regular Maintenance Tasks

```bash
# Create backup
sudo -u postgres pg_dump pmdashboard > pmdashboard_backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql -d pmdashboard < pmdashboard_backup_20240101.sql

# Check database statistics
sudo -u postgres psql -d pmdashboard -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables;
"
```

### Log Configuration

```bash
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Configure log rotation
sudo nano /etc/logrotate.d/postgresql-common
```

## 🔒 Security Best Practices

### 1. Password Security

```bash
# Generate strong password
openssl rand -base64 32

# Change user password
sudo -u postgres psql -c "ALTER USER pmuser WITH PASSWORD 'new_secure_password';"
```

### 2. Firewall Configuration

```bash
# Allow PostgreSQL through firewall (if needed)
sudo ufw allow 5432/tcp

# Restrict to specific IP ranges
sudo ufw allow from 10.0.0.0/8 to any port 5432
```

### 3. SSL Configuration

```bash
# Enable SSL in postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check listening ports
   sudo netstat -tlnp | grep 5432
   ```

2. **Authentication Failed**
   ```bash
   # Check pg_hba.conf configuration
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   
   # Restart after changes
   sudo systemctl restart postgresql
   ```

3. **Permission Denied**
   ```sql
   -- Grant missing permissions
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pmuser;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pmuser;
   ```

4. **Database Connection Pool Issues**
   ```bash
   # Check active connections
   sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
   
   # Adjust max_connections if needed
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```

### Performance Issues

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time, stddev_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📞 Support

If you encounter issues:

1. Check PostgreSQL logs: `/var/log/postgresql/`
2. Verify configuration files in `/etc/postgresql/14/main/`
3. Test connection with: `psql -h localhost -U pmuser -d pmdashboard`
4. Check firewall settings: `sudo ufw status`

For production deployment, consider:
- Regular automated backups
- Monitoring with tools like pgAdmin or Grafana
- Performance tuning based on your specific workload
- Setting up replication for high availability

## 🔌 Sensor Integration

### Testing Sensor Data Ingestion

Your sensors should send data to the `/api/pm25` endpoint. Test with your exact format:

```bash
# Test with your sensor data format
curl -X POST "http://localhost:3001/api/pm25" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEV001",
    "pm_10": 48.7,
    "pm_2_5": 24.0,
    "temperature": 30.5,
    "humidity": 66.0,
    "signal_level": -89.0
  }'
```

### Field Mapping

The API automatically maps your sensor fields to database fields:

| Sensor Field | Database Field | Required | Notes |
|-------------|---------------|----------|-------|
| `device_id` | `device_id` | ✅ | Device identifier |
| `pm_2_5` | `pm25` | ✅ | PM2.5 level (µg/m³) |
| `pm_10` | `pm10` | ✅ | PM10 level (µg/m³) |
| `temperature` | `temperature` | ✅ | Temperature (°C) |
| `humidity` | `humidity` | ❌ | Humidity (%) |
| `signal_level` | `signal_strength` | ❌ | Signal strength (dBm) |
| `pressure` | `pressure` | ❌ | Atmospheric pressure |
| `battery_level` | `battery_level` | ❌ | Battery level (%) |

### Auto-Registration

New devices are automatically registered when they first send data:
- Device name: `Sensor {device_id}`
- Model: `Auto-registered`
- Location: `Location {device_id}`
- Status: `online`

### Sensor API Endpoints

```bash
# Send sensor data (your format)
POST /api/pm25

# Send batch sensor data
POST /api/batch

# Check sensor status
GET /api/status/{device_id}
```

### Production Setup

Update your sensor configuration to use your production server:

```bash
# Production endpoint
curl -X POST "http://43.208.134.162:3001/api/pm25" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEV001",
    "pm_10": 48.7,
    "pm_2_5": 24.0,
    "temperature": 30.5,
    "humidity": 66.0,
    "signal_level": -89.0
  }'
```

### Troubleshooting Sensor Issues

1. **Connection Refused**
   ```bash
   # Check if server is running
   curl -s http://localhost:3001/health
   
   # Check server logs
   npm run dev
   ```

2. **Data Validation Errors**
   ```bash
   # Check sensor data format
   {
     "device_id": "DEV001",      # Required: string
     "pm_2_5": 24.0,             # Required: number >= 0
     "pm_10": 48.7,              # Required: number >= 0
     "temperature": 30.5,        # Required: number -50 to 100
     "humidity": 66.0,           # Optional: number 0 to 100
     "signal_level": -89.0       # Optional: number -100 to 0
   }
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   node -e "
   const { testConnection } = require('./database/connection');
   testConnection().then(success => {
     console.log(success ? '✅ DB Connected' : '❌ DB Failed');
   });
   "
   ```

4. **Timezone Issues**
   ```bash
   # Check server timezone
   timedatectl
   
   # Set timezone (if needed)
   sudo timedatectl set-timezone Asia/Bangkok
   ```

### Monitoring Sensor Data

```sql
-- Check recent sensor data
SELECT device_id, pm25, pm10, temperature, timestamp 
FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check device status
SELECT device_id, name, status, last_seen, battery_level 
FROM devices 
WHERE status = 'online';

-- Check auto-registered devices
SELECT device_id, name, model, created_at 
FROM devices 
WHERE model = 'Auto-registered';
```

---

**Next Steps**: Once PostgreSQL is set up, run the backend server with `npm run dev` to start the API server. Your sensors can immediately start sending data to `/api/pm25`.