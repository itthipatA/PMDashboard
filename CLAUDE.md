# PMDashboard - Environmental Monitoring System

## Project Overview

PMDashboard is a comprehensive environmental monitoring system designed to track air quality data from IoT sensor stations. The system monitors PM2.5/PM10 levels, temperature, battery status, and device locations across multiple monitoring stations in real-time.

### Key Features
- **Real-time Monitoring**: Live tracking of air quality parameters
- **Interactive Dashboard**: Charts, maps, and device status visualization
- **Device Management**: Comprehensive IoT sensor station administration
- **Alert System**: Configurable notifications for air quality thresholds
- **Multi-language Support**: English and Thai language interface
- **Responsive Design**: Mobile and desktop optimized interface

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Sensors   │    │   Frontend      │    │   Backend       │
│   (PM2.5/PM10) │────▶│   (React +      │────▶│   (Node.js +    │
│   (Temperature) │    │    TypeScript)  │    │    Express)     │
│   (Battery)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                         ┌─────────────────┐    ┌─────────────────┐
                         │   Google Maps   │    │   PostgreSQL    │
                         │   Integration   │    │   Database      │
                         │                 │    │   (AWS EC2)     │
                         └─────────────────┘    └─────────────────┘
```

### Infrastructure
- **Frontend Hosting**: GitHub Pages (Development) / AWS S3 + CloudFront (Production)
- **Backend Hosting**: AWS EC2 instance
- **Database**: PostgreSQL on AWS EC2
- **Real-time Communication**: WebSocket connections
- **External APIs**: Google Maps API for location services

## Current Tech Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 6.3.1
- **UI Library**: Material-UI (MUI) v5.15.12
- **Charts**: Chart.js 4.4.2 + react-chartjs-2 5.2.0
- **Maps**: @react-google-maps/api 2.20.6
- **Routing**: React Router DOM 6.22.3
- **HTTP Client**: Axios 1.6.7
- **Internationalization**: react-i18next 14.1.0
- **Date Handling**: Day.js 1.11.13
- **UI Enhancements**: Swiper 11.2.6 for carousels

### Development Tools
- **TypeScript**: 5.2.2
- **Linting**: Built-in TypeScript strict mode
- **Bundler**: Vite with React plugin
- **Version Control**: Git with GitHub

### Current Project Structure
```
PMDashboard/
├── public/                     # Static assets
│   ├── images/                # Mascot and partner logos
│   └── index.html
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── MapComponent.tsx  # Google Maps integration
│   │   └── SummaryValueCard.tsx # Data display cards
│   ├── pages/                # Route-specific pages
│   │   ├── Dashboard.tsx     # Main dashboard with charts
│   │   ├── Device.tsx        # Device management table
│   │   ├── Map.tsx          # Full-screen map view
│   │   ├── Alert.tsx        # Alert management
│   │   ├── Report.tsx       # Data reporting
│   │   ├── Group.tsx        # Device grouping
│   │   ├── License.tsx      # License information
│   │   ├── Login.tsx        # Authentication
│   │   └── Mascot.tsx       # Mascot/status page
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.js          # Vite build configuration
└── .github/workflows/       # GitHub Actions for deployment
```

## Development Phases

### Phase 1: Frontend Enhancement & Optimization

**Current Focus - Building upon existing React foundation**

#### Component Architecture Improvements
- Refactor existing components for better modularity and reusability
- Create a standardized component library with consistent props interfaces
- Implement proper component composition patterns
- Add React.memo optimization for performance-critical components

#### TypeScript & Data Management
- Define comprehensive TypeScript interfaces for all sensor data structures
- Create type-safe API client with proper error handling
- Implement data validation schemas for form inputs
- Add proper null/undefined handling throughout the application

#### State Management Implementation
- Evaluate and implement global state solution (Zustand recommended for simplicity)
- Create stores for user authentication, sensor data, and application settings
- Implement proper state persistence for user preferences
- Add optimistic updates for better user experience

#### UI/UX Enhancements
- Implement comprehensive responsive design for mobile/tablet devices
- Add proper loading states and skeleton screens
- Create error boundaries with user-friendly error messages
- Enhance accessibility with proper ARIA labels and keyboard navigation
- Implement dark/light theme toggle functionality

#### Routing & Navigation
- Add protected routes based on authentication status
- Implement proper route guards and redirects
- Add breadcrumb navigation for better UX
- Create dynamic routing for device-specific pages

#### Performance Optimization
- Implement code splitting with React.lazy for route-based chunking
- Add proper memoization for expensive calculations
- Optimize chart rendering performance
- Implement virtual scrolling for large device lists

### Phase 2: Backend API Development

**Building the server infrastructure on AWS EC2**

#### Server Architecture Setup
- Design and implement RESTful API with Express.js framework
- Set up proper middleware stack (CORS, rate limiting, request logging)
- Implement API versioning strategy
- Create comprehensive API documentation with OpenAPI/Swagger

#### Database Schema Design
- Design normalized PostgreSQL schema for sensor data storage
- Create tables for:
  - **devices**: Device registration and metadata
  - **sensor_readings**: Time-series data storage with proper indexing
  - **users**: User accounts and authentication
  - **device_groups**: Logical grouping of monitoring stations
  - **alerts**: Alert configurations and notification history
  - **system_logs**: Audit trails and system events

#### Real-time Data Infrastructure
- Implement WebSocket server for live data streaming
- Create pub/sub system for device status updates
- Add data aggregation endpoints for dashboard statistics
- Implement proper connection management and reconnection logic

#### Data Processing Pipeline
- Create data validation and sanitization layers
- Implement data aggregation for historical reports
- Add data export functionality (CSV, JSON formats)
- Create automated data cleanup procedures for old records

#### Security Implementation
- Add JWT-based authentication system
- Implement proper password hashing and validation
- Create API key management for IoT device authentication
- Add input validation and SQL injection prevention

### Phase 3: Integration & Authentication

**Connecting frontend and backend with security**

#### API Integration
- Replace mock data with real API calls throughout the frontend
- Implement proper error handling for network failures
- Add retry logic for failed requests
- Create offline-first data synchronization

#### Authentication System
- Implement complete user registration and login flows
- Add role-based access control (Admin, Operator, Viewer)
- Create user profile management interface
- Implement password reset and email verification

#### Real-time Features
- Connect WebSocket client for live sensor data updates
- Implement real-time dashboard updates without page refreshes
- Add live device status monitoring
- Create real-time alert notifications

#### Advanced Features
- Implement data filtering and search capabilities
- Add historical data visualization with date range selection
- Create custom dashboard configuration options
- Implement data export functionality from the frontend

#### User Management
- Create admin panel for user management
- Implement device assignment to users/groups
- Add audit logging for user actions
- Create user activity monitoring

### Phase 4: Production Deployment & Monitoring

**Preparing for production deployment on AWS EC2**

#### Production Environment Setup
- Configure production-ready EC2 instance with proper security groups
- Set up SSL certificates and domain configuration
- Implement proper environment variable management
- Create separate staging and production environments

#### CI/CD Pipeline
- Set up automated testing pipeline with GitHub Actions
- Implement automated deployment to EC2 on successful builds
- Add database migration management
- Create rollback procedures for failed deployments

#### Monitoring & Logging
- Implement comprehensive application logging with structured logs
- Set up monitoring for system performance and uptime
- Add error tracking and alerting for production issues
- Create health check endpoints for load balancer integration

#### Database Management
- Implement automated database backups
- Set up database performance monitoring
- Create disaster recovery procedures
- Implement database connection pooling for performance

#### Performance & Scalability
- Implement caching strategies for frequently accessed data
- Add CDN configuration for static assets
- Optimize database queries and add proper indexing
- Implement horizontal scaling preparation

#### Security Hardening
- Configure proper firewall rules and security groups
- Implement intrusion detection and prevention
- Add rate limiting and DDoS protection
- Regular security audits and vulnerability assessments

## API Specifications

### Authentication Endpoints
```
POST /api/auth/login         # User authentication
POST /api/auth/register      # User registration
POST /api/auth/refresh       # Token refresh
POST /api/auth/logout        # User logout
POST /api/auth/reset-password # Password reset
```

### Device Management
```
GET    /api/devices          # List all devices
GET    /api/devices/:id      # Get device details
POST   /api/devices          # Register new device
PUT    /api/devices/:id      # Update device info
DELETE /api/devices/:id      # Remove device
GET    /api/devices/:id/status # Get device status
```

### Sensor Data
```
GET    /api/sensors/readings      # Get sensor readings with filtering
POST   /api/sensors/readings      # Submit new sensor data
GET    /api/sensors/statistics    # Get aggregated statistics
GET    /api/sensors/export        # Export data to CSV/JSON
GET    /api/sensors/realtime      # WebSocket endpoint for live data
```

### Alert Management
```
GET    /api/alerts               # List alert configurations
POST   /api/alerts               # Create new alert
PUT    /api/alerts/:id           # Update alert configuration
DELETE /api/alerts/:id           # Delete alert
GET    /api/alerts/history       # Get alert notification history
```

## Database Schema

### Core Tables

#### devices
```sql
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(50),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    group_id INTEGER REFERENCES device_groups(id),
    status VARCHAR(20) DEFAULT 'offline',
    battery_level INTEGER,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### sensor_readings
```sql
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id),
    pm25 DECIMAL(8,2),
    pm10 DECIMAL(8,2),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    battery_level INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_readings_device_time ON sensor_readings(device_id, timestamp);
CREATE INDEX idx_readings_timestamp ON sensor_readings(timestamp);
```

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## AWS EC2 Deployment Guide

### Prerequisites
- AWS EC2 instance (t3.medium or larger recommended)
- Ubuntu 20.04 LTS or similar
- PostgreSQL 12+ installed and configured
- Node.js 18+ installed
- Domain name and SSL certificate (optional but recommended)

### Backend Deployment Steps

1. **Server Setup**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL (if not already installed)
sudo apt install postgresql postgresql-contrib
```

2. **Database Configuration**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE pmdashboard;
CREATE USER pmuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pmdashboard TO pmuser;
\q
```

3. **Application Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/PMDashboard.git
cd PMDashboard

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
nano .env

# Run database migrations
npm run migrate

# Start application with PM2
pm2 start npm --name "pmdashboard" -- run start
pm2 startup
pm2 save
```

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pmdashboard
DB_USER=pmuser
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to web server (nginx/apache) or S3
# Copy dist/ folder contents to web root
```

### Security Configuration
```bash
# Configure UFW firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Configure nginx reverse proxy (recommended)
sudo apt install nginx
# Configure nginx to proxy requests to Node.js application
```

## Development Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/yourusername/PMDashboard.git
cd PMDashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests (when implemented)
```

## Contributing Guidelines

### Code Standards
- Use TypeScript for all new code
- Follow React functional component patterns
- Use meaningful component and variable names
- Implement proper error handling
- Add JSDoc comments for complex functions
- Maintain consistent code formatting

### Git Workflow
1. Create feature branch from main
2. Make atomic commits with clear messages
3. Test thoroughly before pushing
4. Create pull request with detailed description
5. Ensure CI passes before merging

### Testing Requirements
- Unit tests for utility functions
- Component tests for React components
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## Current Status

**Phase 1 in Progress**: Currently in frontend enhancement phase, working with existing React codebase and preparing for backend integration.

**Next Immediate Steps**:
1. Refactor existing components for better structure
2. Implement proper TypeScript interfaces
3. Add state management solution
4. Enhance responsive design
5. Prepare for Phase 2 backend development

---

*Last Updated: [Current Date]*
*Project Status: Development Phase 1*