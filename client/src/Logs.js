import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Button } from '@mui/material';

export default function Logs() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings/import-logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      setError('Kan logs niet ophalen');
    } finally {
      setLoading(false);
    }
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
    </Box>
  );
} 