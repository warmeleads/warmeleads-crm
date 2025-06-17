import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LeadsDashboard from './LeadsDashboard';
import GroupIcon from '@mui/icons-material/Group';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Typography, IconButton, Drawer, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Settings from './Settings';
import ImportLeads from './ImportLeads';
import BugReportIcon from '@mui/icons-material/BugReport';
import Logs from './Logs';
import ColumnManagement from './ColumnManagement';

function Leads() {
  return <div><h2>Leads</h2><p>Hier komt het overzicht van leads.</p></div>;
}
function Customers() {
  return <div><h2>Klanten</h2><p>Hier komt het overzicht van klanten.</p></div>;
}

function Sidebar({ open, onClose, palette, isMobile }) {
  const location = useLocation();
  const menuItems = [
    { path: '/', label: 'Leads Dashboard', icon: <GroupIcon /> },
    { path: '/customers', label: 'Klanten', icon: <ListAltIcon /> },
    { path: '/settings', label: 'Instellingen', icon: <SettingsIcon /> },
    { path: '/import', label: 'Import Leads', icon: <BugReportIcon /> },
    { path: '/logs', label: 'Logs', icon: <BugReportIcon /> },
    { path: '/column-management', label: 'Kolom Beheer', icon: <SettingsIcon /> }
  ];
  return (
    <Box sx={{
      width: 240,
      background: palette.sidebar,
      color: palette.sidebarText,
      padding: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      boxShadow: '4px 0 32px 0 #6366f133',
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
      minHeight: '100vh',
      zIndex: 10
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
        <GroupIcon sx={{ fontSize: 36, color: '#fff', filter: 'drop-shadow(0 2px 8px #06b6d4)' }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', letterSpacing: 1, textShadow: '0 2px 12px #06b6d4' }}>
          Dashboard
        </Typography>
      </Box>
      <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
        {menuItems.map(item => (
          <li key={item.path} style={{ marginBottom: 24 }}>
            <Link
              style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '16px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: location.pathname === item.path ? palette.sidebarActive : 'none',
                color: location.pathname === item.path ? palette.accent : '#fff',
                boxShadow: location.pathname === item.path ? '0 2px 12px #fff3' : 'none',
                filter: location.pathname === item.path ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
                fontSize: isMobile ? 20 : 18,
                minHeight: isMobile ? 56 : 44
              }}
              to={item.path}
              onClick={onClose}
            >
              {React.cloneElement(item.icon, { sx: { fontSize: 28, color: location.pathname === item.path ? palette.accent : '#fff' } })}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </Box>
  );
}

function App() {
  const palette = {
    accent: '#6366f1',
    accent2: '#06b6d4',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
    sidebar: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    sidebarActive: '#fff',
    sidebarText: '#e0e7ff',
    sidebarHover: 'rgba(255,255,255,0.08)',
  };
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: palette.bg }}>
        {isMobile ? (
          <>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ position: 'fixed', top: 16, left: 16, zIndex: 2000, background: '#fff', boxShadow: '0 2px 8px #6366f133' }}
              size="large"
            >
              <MenuIcon sx={{ fontSize: 32, color: palette.accent }} />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} palette={palette} isMobile={isMobile} />
            </Drawer>
          </>
        ) : (
          <Sidebar open palette={palette} isMobile={isMobile} />
        )}
        <Box component="main" sx={{ flex: 1, p: { xs: 1, md: 4 }, color: '#222', background: 'none', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<LeadsDashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/import" element={<ImportLeads />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/column-management" element={<ColumnManagement />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
