import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import './Mascot.css'; // Use specific CSS for this page

// Sample group data
const dummyGroups = [
  'All',
  'หมู่บ้านศิริสุขแห่งความสงบสุข',
  'หมู่บ้านมั่งคั่งรุ่งเรืองตลอดกาล',
  'หมู่บ้านอ้อมกอดแห่งความสุข',
  'หมู่บ้านมิตรภาพแห่งความสงบ',
  'หมู่บ้านสันติสุขอันแสนอบอุ่น',
  'หมู่บ้านชุมชนแห่งความรักและความหวัง',
  'หมู่บ้านอยู่ดี',
  'หมู่บ้านมีสุข',
  'หมู่บ้านมีเงิน',
  'หมู่บ้านป่าเขา',
];

const Mascot: React.FC = () => {
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [currentMascot, setCurrentMascot] = useState('');
  const [pm25Level, setPm25Level] = useState<number | null>(null); // Store PM2.5 level

  const filteredGroups = dummyGroups.filter(group =>
    group.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  // Dummy data for display
  const currentGroupName = 'หมู่บ้านอยู่ดี';
  const currentTime = '5 มีนาคม 2568 8.00 น.';
  

  // Function to toggle fullscreen
  const handleToggleFullScreen = () => {
    const elem = mainContentRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Effect to listen for fullscreen changes (e.g., pressing Esc)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Simulate fetching PM2.5 data
  useEffect(() => {
    // Replace with actual API call
    const fetchPM25 = () => {
      // Example: Random PM2.5 value for demonstration
      const level = Math.random() * 100;
      setPm25Level(level);
    };
    fetchPM25();
    // Optionally, set an interval to refresh data
    // const intervalId = setInterval(fetchPM25, 60000); // Fetch every minute
    // return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Determine which mascot image to display based on pm25Level
    let mascotImageSrc = '';
    if (pm25Level === null) {
      mascotImageSrc = 'Mascot-normal.png'; // Default or loading state
    } else if (pm25Level <= 35) {
      mascotImageSrc = 'Mascot-good.png'; // Good air quality
    } else if (pm25Level <= 75) {
      mascotImageSrc = 'Mascot-normal.png'; // Moderate air quality
    } else {
      mascotImageSrc = 'Mascot-bad.png'; // Bad air quality
    }
    setCurrentMascot(`${import.meta.env.BASE_URL}${mascotImageSrc}`);
  }, [pm25Level]);

  return (
    <div className="page-container mascot-page-container">
      {/* Left Toolbar */}
      <div className="mascot-toolbar">
        <IconButton className="toolbar-button">
          <DownloadIcon />
        </IconButton>
        <IconButton className="toolbar-button">
          <ShareIcon />
        </IconButton>
        <IconButton className="toolbar-button" onClick={handleToggleFullScreen}>
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </div>

      {/* Main Content Area */}
      <div className="mascot-main-content" ref={mainContentRef}>
        <div className="welcome-text">
          <Typography variant="h5">วันนี้ {currentGroupName}</Typography>
          <Typography variant="h4">คุณภาพอากาศดีมาก!</Typography>
          
        </div>

        <div className="mascot-display-area">
          <div className="mascot-image-wrapper">
            {currentMascot && (
              <img src={currentMascot} alt="Mascot" className="mascot-image" />
            )}
          </div>
          {/* Conditional rendering for the leaf overlay */}
          {pm25Level !== null && pm25Level > 0 && (
            <img src={`${import.meta.env.BASE_URL}leaf.png`} alt="Leaf decoration" className="pm25-leaf-overlay" />
          )}
          <div className="pm25-circle">
            <Typography variant="h6" className="pm25-label">PM2.5</Typography>
            <Typography variant="h2" component="p" className="pm25-value">{pm25Level !== null ? pm25Level.toFixed(1) : 'Loading...'}</Typography>
            <Typography variant="h5" className="pm25-unit">µg/m³</Typography>
          </div>
        </div>
        <Typography variant="subtitle1" className="timestamp">ตรวจวัดเมื่อ {currentTime}</Typography>
      </div>

      {/* Right Group Panel */}
      <Paper elevation={3} className="mascot-group-panel">
        <Typography variant="h6" className="group-header">Group</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          fullWidth
          value={groupSearchTerm}
          onChange={(e) => setGroupSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          className="group-search-bar"
        />
        <List className="group-list" dense>
          {filteredGroups.map((group, index) => (
            <ListItem key={index} button className="group-list-item">
              <ListItemText primary={group} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default Mascot; 