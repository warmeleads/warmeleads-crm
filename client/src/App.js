import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LeadsDashboard from './LeadsDashboard';
import GroupIcon from '@mui/icons-material/Group';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Typography } from '@mui/material';
import Settings from './Settings';
import ImportLeads from './ImportLeads';
import BugReportIcon from '@mui/icons-material/BugReport';
import Logs from './Logs';

function Leads() {
  return <div><h2>Leads</h2><p>Hier komt het overzicht van leads.</p></div>;
}
function Customers() {
  return <div><h2>Klanten</h2><p>Hier komt het overzicht van klanten.</p></div>;
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

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: palette.bg }}>
        <nav style={{
          width: 240,
          background: palette.sidebar,
          color: palette.sidebarText,
          padding: 32,
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
            <li style={{ marginBottom: 24 }}>
              <Link style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: window.location.pathname === '/' ? palette.sidebarActive : 'none',
                color: window.location.pathname === '/' ? palette.accent : '#fff',
                boxShadow: window.location.pathname === '/' ? '0 2px 12px #fff3' : 'none',
                filter: window.location.pathname === '/' ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
              }} to="/">
                <ListAltIcon sx={{ fontSize: 24, color: window.location.pathname === '/' ? palette.accent : '#fff' }} />
                Leads
              </Link>
            </li>
            <li style={{ marginBottom: 24 }}>
              <Link style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: window.location.pathname === '/customers' ? palette.sidebarActive : 'none',
                color: window.location.pathname === '/customers' ? palette.accent : '#fff',
                boxShadow: window.location.pathname === '/customers' ? '0 2px 12px #fff3' : 'none',
                filter: window.location.pathname === '/customers' ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
              }} to="/customers">
                <GroupIcon sx={{ fontSize: 24, color: window.location.pathname === '/customers' ? palette.accent : '#fff' }} />
                Klanten
              </Link>
            </li>
            <li style={{ marginBottom: 24 }}>
              <Link style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: window.location.pathname === '/import' ? palette.sidebarActive : 'none',
                color: window.location.pathname === '/import' ? palette.accent : '#fff',
                boxShadow: window.location.pathname === '/import' ? '0 2px 12px #fff3' : 'none',
                filter: window.location.pathname === '/import' ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
              }} to="/import">
                <ListAltIcon sx={{ fontSize: 24, color: window.location.pathname === '/import' ? palette.accent : '#fff' }} />
                Importeren
              </Link>
            </li>
            <li style={{ marginBottom: 24 }}>
              <Link style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: window.location.pathname === '/logs' ? palette.sidebarActive : 'none',
                color: window.location.pathname === '/logs' ? palette.accent : '#fff',
                boxShadow: window.location.pathname === '/logs' ? '0 2px 12px #fff3' : 'none',
                filter: window.location.pathname === '/logs' ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
              }} to="/logs">
                <BugReportIcon sx={{ fontSize: 24, color: window.location.pathname === '/logs' ? palette.accent : '#fff' }} />
                Logs & Debug
              </Link>
            </li>
            <li>
              <Link style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '12px 20px',
                borderRadius: 12,
                transition: 'background 0.2s',
                background: window.location.pathname === '/settings' ? palette.sidebarActive : 'none',
                color: window.location.pathname === '/settings' ? palette.accent : '#fff',
                boxShadow: window.location.pathname === '/settings' ? '0 2px 12px #fff3' : 'none',
                filter: window.location.pathname === '/settings' ? 'drop-shadow(0 2px 8px #06b6d4)' : 'none',
                cursor: 'pointer',
              }} to="/settings">
                <SettingsIcon sx={{ fontSize: 24, color: window.location.pathname === '/settings' ? palette.accent : '#fff' }} />
                Instellingen
              </Link>
            </li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: 32, color: '#222', background: 'none' }}>
          <Routes>
            <Route path="/" element={<LeadsDashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/import" element={<ImportLeads />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
