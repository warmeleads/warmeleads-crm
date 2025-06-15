import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Button } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_URL || 'https://warmeleads-crm.onrender.com';

export default function Logs() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [frontendLogs, setFrontendLogs] = React.useState([]);
  const logsRef = useRef([]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/settings/import-logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      setError('Kan logs niet ophalen');
    } finally {
      setLoading(false);
    }
  };

  // Frontend logging: vang console.log/warn/error
  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    function addLog(type, args) {
      const entry = { time: new Date().toISOString(), type, message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')};
      logsRef.current = [...logsRef.current.slice(-99), entry];
      setFrontendLogs([...logsRef.current]);
    }
    console.log = (...args) => { addLog('log', args); origLog(...args); };
    console.warn = (...args) => { addLog('warn', args); origWarn(...args); };
    console.error = (...args) => { addLog('error', args); origError(...args); };
    window.addEventListener('unhandledrejection', e => addLog('promise', [e.reason]));
    window.addEventListener('error', e => addLog('window', [e.message]));
    window.__frontendLogEvent = (type, message, extra) => {
      const entry = { time: new Date().toISOString(), type, message, extra };
      logsRef.current = [...logsRef.current.slice(-99), entry];
      setFrontendLogs([...logsRef.current]);
    };
    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    };
  }, []);

  const clearFrontendLogs = () => {
    logsRef.current = [];
    setFrontendLogs([]);
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box maxWidth={1200} mx="auto" mt={4}>
      <Typography variant="h3" fontWeight={900} mb={3} color="#6366f1">Logs & Debug</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Hier zie je de laatste 100 importlogs van de backend, inclusief details, duplicaten, fouten en waarschuwingen.
        </Typography>
        <Button onClick={fetchLogs} variant="outlined" sx={{ mb: 2 }}>Vernieuwen</Button>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {!loading && logs.length === 0 && <Alert severity="info">Geen logs gevonden.</Alert>}
        {!loading && logs.length > 0 && (
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tijdstip</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Aangemaakt</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duplicaten</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.imported}</TableCell>
                  <TableCell>{log.duplicates}</TableCell>
                  <TableCell>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {log.details && log.details.map((d, j) => (
                        <li key={j} style={{ color: d.status === 'error' ? 'red' : d.status === 'duplicate' ? '#b45309' : 'green' }}>
                          <b>{d.status}</b> | {d.facebookLeadId} | {d.tabName} {d.warning ? `| ⚠️ ${d.warning}` : ''} {d.error ? `| ❌ ${d.error}` : ''}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2} color="#6366f1">Frontend logs (lokaal)</Typography>
        <Button onClick={clearFrontendLogs} variant="outlined" sx={{ mb: 2 }}>Wis frontend logs</Button>
        {frontendLogs.length === 0 && <Alert severity="info">Geen frontend logs.</Alert>}
        {frontendLogs.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tijd</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {frontendLogs.slice().reverse().map((log, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(log.time).toLocaleTimeString()}</TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell style={{ color: log.type === 'error' ? 'red' : log.type === 'warn' ? '#b45309' : undefined }}>{log.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
} 