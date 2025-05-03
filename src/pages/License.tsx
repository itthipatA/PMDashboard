import React from 'react';
import { Paper } from '@mui/material'; // Use Paper for card elements
import './License.css'; // Use specific CSS for this page

// Sample data for license details
interface LicenseDetail {
  id: number;
  title: string;
  contractNo: string;
  period: string;
  licenseKey: string;
  deviceSupport: number;
  status: 'on' | 'off';
}

const licenseData: LicenseDetail[] = [
  {
    id: 1,
    title: 'โครงการตรวจวัดและติดตามคุณภาพฝุ่นละออง PM2.5 เพื่อการป้องกันและควบคุมมลพิษทางอากาศ ปี 2568',
    contractNo: '1230850384',
    period: '1 มกราคม 2568 - 30 มกราคม 2571',
    licenseKey: '3YLMSP',
    deviceSupport: 30,
    status: 'on',
  },
  {
    id: 2,
    title: 'โครงการจัดการและลดมลพิษจากฝุ่นละอองขนาดเล็ก PM2.5 เพื่อคุณภาพชีวิตที่ดีขึ้นในชุมชน ปี 2567',
    contractNo: '1230858281',
    period: '1 ตุลาคม 2567 - 31 ตุลาคม 2570',
    licenseKey: '3YLMSP67',
    deviceSupport: 50,
    status: 'on',
  },
  {
    id: 3,
    title: 'โครงการจัดการและลดมลพิษจากฝุ่นละอองขนาดเล็ก PM2.5 เพื่อคุณภาพชีวิตที่ดีขึ้นในชุมชน ปี 2565',
    contractNo: '1230858281',
    period: '1 กันยายน 2566 - 30 กันยายน 2567',
    licenseKey: '1YLMSP66',
    deviceSupport: 50,
    status: 'off',
  },
];

const License: React.FC = () => {
  return (
    <div className="page-container license-page-container">
      <Paper elevation={3} className="license-main-paper">
        {/* Left Column */}
        <div className="license-left-column">
          <div className="company-logo-placeholder">
            {/* Placeholder for the RF logo */}
            <span className="logo-text-rf">rf</span>
            <span>บริษัท อาร์เอฟ แอพพิเคชั่น จำกัด</span>
          </div>
          <div className="system-info">
            <h2>Smart Air Pollution Monitoring System</h2>
            <p>1.0.2.45 Version</p>
            <p>Service By RF Application Co., Ltd</p>
          </div>
          <div className="contact-info">
            <p>Application Co., Ltd</p>
            <p>15, Soi Hua Mak 9, Hua Mak Subdistrict,</p>
            <p>Bang Kapi District, Bangkok 10240</p>
            <p>Tel : 0-2732-3319, 02-732-3372, 02-732-3373 Fax : 0-2732-2290 www.rf.co.th</p>
            <p>E-mail : info@rf.co.th, info@rfapplication.co.th</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="license-right-column">
          <div className="partner-logo-placeholder">
            {/* Placeholder for partner logo */} 
            <img src={`${import.meta.env.BASE_URL}Partner-logo.png`} alt="Partner Logo"/> 
            <h3>สำนักงานเขตบางกะปิ</h3>
          </div>
          <div className="license-details-container">
            {licenseData.map((license) => (
              <Paper key={license.id} elevation={1} className="license-card">
                <h4>{license.title}</h4>
                <p>เลขที่สัญญา: {license.contractNo}</p>
                <p>ระยะเวลา: {license.period}</p>
                <p>License: {license.licenseKey}</p>
                <p>Device Support: {license.deviceSupport}</p>
                <p className={`status ${license.status === 'on' ? 'on-service' : 'off-service'}`}>
                  STATUS {license.status === 'on' ? 'ON SERVICE' : 'OFF SERVICE'}
                </p>
              </Paper>
            ))}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default License;
