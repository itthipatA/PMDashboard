# PMDashboard - Environmental Monitoring System

<div align="center">
  <img src="public/images/rf-logo.png" alt="RF Logo" width="200" height="80">
  
  **Real-time Air Quality Monitoring Dashboard**
  
  [![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 🌟 Overview

PMDashboard is a comprehensive environmental monitoring system designed to track real-time air quality data from IoT sensor stations. The system provides live monitoring of PM2.5/PM10 levels, temperature, humidity, and device status across multiple monitoring stations with an intuitive web-based dashboard.

### 🚀 Live Demo
- **Development**: [GitHub Pages](https://itthipata.github.io/PMDashboard/)
- **Production**: [AWS Deployment](http://43.208.134.162:3001) (Replace with your actual domain)

## ✨ Features

### 📊 Real-time Monitoring
- Live tracking of air quality parameters (PM2.5, PM10, Temperature, Humidity)
- Interactive charts with historical data visualization
- Device status monitoring and battery level tracking

### 🗺️ Interactive Dashboard
- Google Maps integration for sensor location visualization
- Responsive design optimized for desktop and mobile
- Multi-language support (English/Thai)

### 🔧 Device Management
- Comprehensive IoT sensor station administration
- Auto-registration of new sensor devices
- Device grouping and location management

### 🚨 Alert System
- Configurable notifications for air quality thresholds
- Real-time alert management interface
- Historical alert tracking

### 📈 Data Analytics
- PM2.5/PM10 data toggle functionality
- Statistical analysis and reporting
- Export capabilities for data analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Sensors   │    │   Frontend      │    │   Backend API   │
│   (PM2.5/PM10) │────▶│   (React +      │────▶│   (Node.js +    │
│   (Temperature) │    │    TypeScript)  │    │    Express)     │
│   (Humidity)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                         ┌─────────────────┐    ┌─────────────────┐
                         │   Google Maps   │    │   PostgreSQL    │
                         │   Integration   │    │   Database      │
                         │                 │    │   (AWS EC2)     │
                         └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2 + TypeScript 5.2
- **Build Tool**: Vite 5.4
- **UI Library**: Material-UI (MUI) v5.15
- **Charts**: Chart.js + react-chartjs-2
- **Maps**: Google Maps API
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Security**: Helmet, CORS, Rate Limiting
- **Authentication**: bcrypt password hashing

### Infrastructure
- **Frontend Hosting**: GitHub Pages / AWS S3 + CloudFront
- **Backend Hosting**: AWS EC2
- **Database**: PostgreSQL on AWS EC2
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/itthipatA/PMDashboard.git
cd PMDashboard
```

#### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

#### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start backend server
npm run dev
```

#### 4. Database Setup
Follow the comprehensive guide in [`backend/docs/POSTGRES_SETUP.md`](backend/docs/POSTGRES_SETUP.md) for:
- PostgreSQL installation and configuration
- Database schema creation
- Sample data seeding
- Production deployment setup

## 🔌 Sensor Integration

### Sensor Data Format
Your IoT sensors should send data to the `/api/pm25` endpoint using this exact format:

```bash
curl -X POST "http://your-server:3001/api/pm25" \
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
| Sensor Field | Database Field | Required | Notes |
|-------------|---------------|----------|-------|
| `device_id` | `device_id` | ✅ | Device identifier |
| `pm_2_5` | `pm25` | ✅ | PM2.5 level (µg/m³) |
| `pm_10` | `pm10` | ✅ | PM10 level (µg/m³) |
| `temperature` | `temperature` | ✅ | Temperature (°C) |
| `humidity` | `humidity` | ❌ | Humidity (%) |
| `signal_level` | `signal_strength` | ❌ | Signal strength (dBm) |

### Auto-Registration
New devices are automatically registered when they first send data with default settings.

## 📚 API Reference

### Dashboard Endpoints
- `GET /api/dashboard/latest` - Latest data from all devices
- `GET /api/dashboard/historical/:hours` - Historical chart data
- `GET /api/dashboard/summary` - Summary statistics

### Device Management
- `GET /api/devices` - List all devices
- `GET /api/devices/:deviceId` - Get device details
- `GET /api/devices/:deviceId/readings` - Get device readings with pagination
- `PATCH /api/devices/:deviceId/status` - Update device status

### Sensor Data Ingestion
- `POST /api/pm25` - Receive sensor data (your format)
- `POST /api/batch` - Batch sensor data upload
- `GET /api/status/:deviceId` - Check sensor status

### Data Analysis
- `GET /api/data/:dataType` - Get specific data type (pm25, pm10, temperature)
- `GET /api/data/:dataType/latest` - Latest values for data type
- `GET /api/data/:dataType/stats` - Statistical analysis
- `GET /api/data/compare/:dataType1/:dataType2` - Compare two data types

## 🚀 Deployment

### Production Deployment (AWS EC2)

1. **Backend Deployment**:
   ```bash
   # On your EC2 instance
   git clone https://github.com/itthipatA/PMDashboard.git
   cd PMDashboard/backend
   npm install --production
   npm run build
   npm start
   ```

2. **Frontend Deployment**:
   ```bash
   # Build for production
   npm run build
   
   # Deploy to GitHub Pages
   npm run deploy
   ```

3. **Database Setup**:
   Follow [`backend/docs/POSTGRES_SETUP.md`](backend/docs/POSTGRES_SETUP.md) for complete PostgreSQL setup on AWS EC2.

### Environment Variables
```env
# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pmdashboard
DB_USER=pmuser
DB_PASSWORD=your_secure_password

# Optional
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## 📁 Project Structure

```
PMDashboard/
├── backend/                    # Backend API server
│   ├── database/              # Database setup and migrations
│   ├── routes/                # API endpoints
│   ├── docs/                  # Documentation
│   └── server.js              # Main server file
├── src/                       # Frontend source code
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── public/                    # Static assets
├── .github/workflows/         # CI/CD configuration
└── docs/                     # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **RF Company** - Project sponsor and logo
- **Material-UI** - UI component library
- **Chart.js** - Data visualization
- **Google Maps** - Location services
- **PostgreSQL** - Database system

## 📞 Support

For issues and questions:
- 📧 Email: [support@rf.co.th](mailto:support@rf.co.th)
- 🐛 Issues: [GitHub Issues](https://github.com/itthipatA/PMDashboard/issues)
- 📖 Documentation: [Project Wiki](https://github.com/itthipatA/PMDashboard/wiki)

---

<div align="center">
  <p>Built with ❤️ for environmental monitoring</p>
  <p>© 2024 RF Company. All rights reserved.</p>
</div>