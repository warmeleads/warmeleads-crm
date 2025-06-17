import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, IconButton, Button, Chip, Avatar, Grid, Card, CardContent, Fade, Drawer, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Switch, FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_BASE = process.env.REACT_APP_API_URL || 'https://warmeleads-crm.onrender.com';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      color: '#fff',
      fontWeight: 700,
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
    },
    children: name.split(' ').map(n => n[0]).join('').toUpperCase(),
  };
}

// Kolommen per branche/type
const LEAD_TYPE_COLUMNS = {
  Thuisbatterij: [
    { key: 'firstName', label: 'Voornaam' },
    { key: 'lastName', label: 'Achternaam' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefoonnummer' },
    { key: 'address', label: 'Adres' },
    { key: 'city', label: 'Plaatsnaam' },
    { key: 'postalCode', label: 'Postcode' },
    { key: 'sheetBranche', label: 'Branche' },
    { key: 'leadTypeName', label: 'Lead Type' },
    { key: 'createdAt', label: 'Aangemaakt' },
  ],
  Airco: [
    { key: 'firstName', label: 'Voornaam' },
    { key: 'lastName', label: 'Achternaam' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefoonnummer' },
    { key: 'address', label: 'Adres' },
    { key: 'city', label: 'Plaatsnaam' },
    { key: 'postalCode', label: 'Postcode' },
    { key: 'sheetBranche', label: 'Branche' },
    { key: 'leadTypeName', label: 'Lead Type' },
    { key: 'createdAt', label: 'Aangemaakt' },
  ],
  'GZ Accu': [
    { key: 'firstName', label: 'Voornaam' },
    { key: 'lastName', label: 'Achternaam' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefoonnummer' },
    { key: 'address', label: 'Adres' },
    { key: 'city', label: 'Plaatsnaam' },
    { key: 'postalCode', label: 'Postcode' },
    { key: 'sheetBranche', label: 'Branche' },
    { key: 'leadTypeName', label: 'Lead Type' },
    { key: 'createdAt', label: 'Aangemaakt' },
  ]
};

const LEAD_TYPES = ['Thuisbatterij', 'Airco', 'GZ Accu', 'Overige'];

export default function LeadsDashboard() {
  const [search, setSearch] = React.useState('');
  const [filterValid, setFilterValid] = React.useState('all');
  const [leads, setLeads] = React.useState([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState(0);
  const [debugMode, setDebugMode] = React.useState(false);
  const [logsViewer, setLogsViewer] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    console.log('[FRONTEND] Start fetchLeads...');
    console.log('[FRONTEND] API_BASE:', API_BASE);
    
    try {
      const res = await fetch(`${API_BASE}/api/leads`);
      console.log('[FRONTEND] Response status:', res.status);
      console.log('[FRONTEND] Response headers:', Object.fromEntries(res.headers.entries()));
      
      const data = await res.json();
      console.log('[FRONTEND] Response data type:', typeof data);
      console.log('[FRONTEND] Response data is array:', Array.isArray(data));
      console.log('[FRONTEND] Response data length:', data?.length);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('[FRONTEND] Eerste 3 leads uit response:');
        data.slice(0, 3).forEach((lead, index) => {
          console.log(`[FRONTEND] Lead ${index + 1}:`, {
            id: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            createdAt: lead.createdAt,
            leadTypeId: lead.leadTypeId,
            sheetBranche: lead.sheetBranche,
            LeadType: lead.LeadType
          });
        });
      } else {
        console.warn('[FRONTEND] GEEN LEADS ONTVANGEN van API!');
        console.log('[FRONTEND] Volledige response data:', data);
      }
      
      setLeads(data);
      console.log('[FRONTEND] Leads state gezet, nieuwe lengte:', data?.length);
      
    } catch (error) {
      console.error('[FRONTEND] Error bij fetchLeads:', error);
      console.error('[FRONTEND] Error stack:', error.stack);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDeleteLead = async (id) => {
    await fetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
    setDeleteDialogOpen(false);
  };

  const handleDeleteAllLeads = async () => {
    await fetch(`${API_BASE}/api/leads`, { method: 'DELETE' });
    fetchLeads();
    setDeleteAllDialogOpen(false);
  };

  // Zorg dat leads altijd een array is
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Statistieken
  const totalLeads = safeLeads.length;
  const validLeads = safeLeads.filter(l => l.valid).length;
  const duplicateLeads = safeLeads.filter(l => l.duplicate).length;

  // Kleurenpalet
  const palette = {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
    card: 'linear-gradient(135deg, #fff 60%, #e3f2fd 100%)',
    accent: '#6366f1',
    accent2: '#06b6d4',
    accent3: '#22d3ee',
    text: '#222',
    tableBg: '#f4f7fa',
    tableHeader: '#e0e7ff',
  };

  // Groepeer leads per branche/type
  const groupedLeads = {
    Thuisbatterij: safeLeads.filter(l => (l.sheetBranche || '').toLowerCase().includes('thuisbatterij')),
    Airco: safeLeads.filter(l => (l.sheetBranche || '').toLowerCase().includes('airco')),
    'GZ Accu': safeLeads.filter(l => (l.sheetBranche || '').toLowerCase().includes('gz accu')),
    Overige: safeLeads.filter(l => {
      const b = (l.sheetBranche || '').toLowerCase();
      return b && !b.includes('thuisbatterij') && !b.includes('airco') && !b.includes('gz accu');
    })
  };

  // Helper: detecteer mobiel
  const isMobile = window.innerWidth < 600;

  return (
    <Box sx={{ minHeight: '100vh', background: palette.bg, p: { xs: 0.5, md: 4 } }}>
      {/* Hero header met animatie */}
      <Fade in timeout={900}>
        <Box sx={{ mb: { xs: 2, md: 5 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3, justifyContent: 'center', position: 'relative' }}>
          <Box sx={{
            position: 'absolute',
            left: { xs: -30, md: -60 },
            top: { xs: -20, md: -40 },
            width: { xs: 90, md: 180 },
            height: { xs: 90, md: 180 },
            background: 'radial-gradient(circle, #a5b4fc 0%, #f0f4ff 80%)',
            opacity: 0.4,
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(8px)'
          }} />
          <GroupIcon sx={{ fontSize: { xs: 36, md: 60 }, color: palette.accent, zIndex: 1 }} />
          <Box sx={{ zIndex: 1 }}>
            <Typography variant={isMobile ? "h4" : "h2"} sx={{ fontWeight: 900, letterSpacing: 1, color: palette.accent, mb: 1, textShadow: '0 2px 12px #e0e7ff' }}>
              Leads Dashboard
            </Typography>
            <Typography variant={isMobile ? "body1" : "h5"} sx={{ color: palette.text, fontWeight: 400, opacity: 0.7 }}>
              Direct inzicht in alle inkomende leads, validatie en verdeling
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Statistieken cards */}
      <Grid container spacing={2} sx={{ mb: { xs: 2, md: 4 }, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1000}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #6366f1 60%, #a5b4fc 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #6366f133', mb: { xs: 2, sm: 0 } }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Totaal leads</Typography>
              <Typography variant={isMobile ? "h4" : "h2"} sx={{ fontWeight: 800 }}>{totalLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1200}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #06b6d4 60%, #67e8f9 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #06b6d433', mb: { xs: 2, sm: 0 } }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Geldige leads</Typography>
              <Typography variant={isMobile ? "h4" : "h2"} sx={{ fontWeight: 800 }}>{validLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1400}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #f59e42 60%, #fef08a 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #f59e4233', mb: { xs: 2, sm: 0 } }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Duplicaten</Typography>
              <Typography variant={isMobile ? "h4" : "h2"} sx={{ fontWeight: 800 }}>{duplicateLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        color="error"
        sx={{ mb: 2, fontWeight: 700, width: { xs: '100%', sm: 'auto' }, py: 1.5, fontSize: { xs: 16, sm: 14 } }}
        onClick={() => setDeleteAllDialogOpen(true)}
      >
        Verwijder alle leads
      </Button>

      {/* Filterbalk */}
      <Paper elevation={0} sx={{ mb: 4, p: { xs: 1, md: 2 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, borderRadius: 4, background: '#fff', boxShadow: '0 2px 16px 0 #6366f11a' }}>
        <TextField
          variant="outlined"
          size="medium"
          placeholder="Zoek op naam, e-mail, locatie..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 320 }, background: '#f8fafc', borderRadius: 2 }}
        />
        <Button
          variant={filterValid === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilterValid('all')}
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'all' ? '#fff' : palette.accent, background: filterValid === 'all' ? palette.accent : '#fff', boxShadow: filterValid === 'all' ? '0 2px 8px #6366f133' : 'none', py: 1.2, fontSize: { xs: 15, sm: 14 } }}
        >
          Alle
        </Button>
        <Button
          variant={filterValid === 'valid' ? 'contained' : 'outlined'}
          onClick={() => setFilterValid('valid')}
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'valid' ? '#fff' : palette.accent2, background: filterValid === 'valid' ? palette.accent2 : '#fff', boxShadow: filterValid === 'valid' ? '0 2px 8px #06b6d433' : 'none', py: 1.2, fontSize: { xs: 15, sm: 14 } }}
        >
          Geldig
        </Button>
        <Button
          variant={filterValid === 'invalid' ? 'contained' : 'outlined'}
          onClick={() => setFilterValid('invalid')}
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'invalid' ? '#fff' : '#f59e42', background: filterValid === 'invalid' ? '#f59e42' : '#fff', boxShadow: filterValid === 'invalid' ? '0 2px 8px #f59e4233' : 'none', py: 1.2, fontSize: { xs: 15, sm: 14 } }}
        >
          Ongeldig
        </Button>
        <IconButton sx={{ color: palette.accent, fontSize: { xs: 28, sm: 24 } }}>
          <FilterListIcon />
        </IconButton>
      </Paper>

      <FormControlLabel
        control={<Switch checked={debugMode} onChange={e => setDebugMode(e.target.checked)} color="primary" />}
        label="Debug modus: alle ruwe leads tonen"
        sx={{ mb: 2 }}
      />
      
      <FormControlLabel
        control={<Switch checked={logsViewer} onChange={e => {
          setLogsViewer(e.target.checked);
          if (e.target.checked) {
            fetchLogs();
          }
        }} color="secondary" />}
        label="Logs Viewer: alle systeem logs bekijken"
        sx={{ mb: 2, ml: 2 }}
      />
      
      {logsViewer && (
        <Paper elevation={0} sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 32px 0 #6366f11a', p: 3, mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: palette.accent }}>
              Systeem Logs (Laatste 24 uur)
            </Typography>
            <Button 
              variant="outlined" 
              onClick={fetchLogs}
              disabled={loadingLogs}
              startIcon={<RefreshIcon />}
            >
              {loadingLogs ? 'Laden...' : 'Vernieuwen'}
            </Button>
          </Box>
          
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                {loadingLogs ? 'Logs laden...' : 'Geen logs gevonden'}
              </Typography>
            ) : (
              logs.map((log, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    borderRadius: 2, 
                    background: log.type === 'ERROR' ? '#fef2f2' : 
                               log.type === 'IMPORT' ? '#f0f9ff' :
                               log.type === 'API' ? '#f0fdf4' :
                               log.type === 'FRONTEND' ? '#fefce8' : '#f8fafc',
                    border: '1px solid',
                    borderColor: log.type === 'ERROR' ? '#fecaca' : 
                                log.type === 'IMPORT' ? '#bae6fd' :
                                log.type === 'API' ? '#bbf7d0' :
                                log.type === 'FRONTEND' ? '#fef08a' : '#e2e8f0'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 700, 
                      color: log.type === 'ERROR' ? '#dc2626' : 
                             log.type === 'IMPORT' ? '#0284c7' :
                             log.type === 'API' ? '#16a34a' :
                             log.type === 'FRONTEND' ? '#ca8a04' : '#64748b'
                    }}>
                      {log.type || 'UNKNOWN'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(log.timestamp).toLocaleString('nl-NL')}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {log.message}
                  </Typography>
                  
                  {log.data && Object.keys(log.data).length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Data:
                      </Typography>
                      {log.message && log.message.includes('Ruwe sheetdata van tabblad geïmporteerd') && log.data.header && log.data.previewRows ? (
                        <Box sx={{ mt: 1, mb: 1, overflow: 'auto', maxWidth: '100%' }}>
                          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  {log.data.header.map((col, i) => (
                                    <TableCell key={i} sx={{ fontWeight: 700 }}>{col}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {log.data.previewRows.map((row, i) => (
                                  <TableRow key={i}>
                                    {row.map((cell, j) => (
                                      <TableCell key={j}>{String(cell ?? '')}</TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          mt: 0.5, 
                          p: 1, 
                          background: '#f8fafc', 
                          borderRadius: 1, 
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxHeight: 200,
                          overflow: 'auto'
                        }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Paper>
      )}

      {/* Waarschuwing als er onbekende leads zijn */}
      {groupedLeads.Overige.length > 0 && (
        <Box sx={{ mb: 2, p: 2, background: '#fffbe0', borderRadius: 2, color: '#b45309', fontWeight: 700 }}>
          Let op: Er zijn {groupedLeads.Overige.length} leads met een onbekende branche. Controleer de tabbladnamen in Google Sheets!
        </Box>
      )}

      {debugMode ? (
        <Paper elevation={0} sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 32px 0 #6366f11a', p: 0, overflow: 'auto', mb: 6 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(safeLeads[0] || {}).map(key => (
                    <TableCell key={key} sx={{ fontWeight: 700 }}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {safeLeads.map(lead => (
                  <TableRow key={lead.id}>
                    {Object.keys(safeLeads[0] || {}).map(key => (
                      <TableCell key={key}>{String(lead[key] ?? '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 4 }}>
          {LEAD_TYPES.map((type, idx) => (
            <Tab key={type} label={type + ' Leads'} />
          ))}
        </Tabs>
      )}

      {LEAD_TYPES.map((type, idx) => (
        activeTab === idx && (
          <Box key={type} sx={{ mb: 6 }}>
            {isMobile ? (
              <Box>
                {groupedLeads[type].map(lead => (
                  <Card key={lead.id} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 2px 12px #6366f11a', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar {...stringAvatar(`${lead.firstName} ${lead.lastName}`)} sx={{ width: 40, height: 40, fontSize: 18 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: palette.accent }}>{lead.firstName} {lead.lastName}</Typography>
                        <Typography variant="body2" sx={{ color: palette.text }}>{lead.email}</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    {(LEAD_TYPE_COLUMNS[type] || Object.keys(lead).map(k => ({ key: k, label: k }))).map(col => (
                      col.key !== 'firstName' && col.key !== 'lastName' && col.key !== 'email' && (
                        <Typography key={col.key} variant="body2" sx={{ color: palette.text, mb: 0.5 }}>
                          <b>{col.label}:</b> {col.key === 'createdAt' && lead[col.key] ? new Date(lead[col.key]).toLocaleString('nl-NL') : lead[col.key] || ''}
                        </Typography>
                      )
                    ))}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <IconButton color="primary" size="medium" title="Kopieer lead ID">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="info" size="medium" title="Details" onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" size="medium" title="Verwijder lead" onClick={() => { setLeadToDelete(lead); setDeleteDialogOpen(true); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 32px 0 #6366f11a', p: 0, overflow: 'hidden' }}>
                <TableContainer sx={{ background: palette.tableBg }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {(LEAD_TYPE_COLUMNS[type] || Object.keys(groupedLeads[type][0] || {}).map(k => ({ key: k, label: k }))).map(col => (
                          <TableCell key={col.key} sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>{col.label}</TableCell>
                        ))}
                        <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Acties</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedLeads[type].map(lead => (
                        <TableRow key={lead.id} hover>
                          {(LEAD_TYPE_COLUMNS[type] || Object.keys(lead).map(k => ({ key: k, label: k }))).map(col => (
                            <TableCell key={col.key}>
                              {col.key === 'createdAt' && lead[col.key] 
                                ? new Date(lead[col.key]).toLocaleString('nl-NL')
                                : lead[col.key] || ''}
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <IconButton color="primary" size="small" title="Kopieer lead ID">
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="info" size="small" title="Details" onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="error" size="small" title="Verwijder lead" onClick={() => { setLeadToDelete(lead); setDeleteDialogOpen(true); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        )
      ))}

      {/* Lead details drawer */}
      <Drawer anchor={isMobile ? "bottom" : "right"} open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 480 }, height: isMobile ? '90vh' : 'auto', p: 3, background: '#f8fafc' } }}>
        {selectedLead && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar {...stringAvatar(`${selectedLead.firstName} ${selectedLead.lastName}`)} sx={{ width: 48, height: 48, fontSize: 24 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: palette.accent }}>{`${selectedLead.firstName} ${selectedLead.lastName}`}</Typography>
                <Typography variant="body2" sx={{ color: palette.text }}>{selectedLead.email}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Telefoon: <b>{selectedLead.phone || 'Niet opgegeven'}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Adres: <b>{selectedLead.address || 'Niet opgegeven'}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Plaats: <b>{selectedLead.city || 'Niet opgegeven'}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Postcode: <b>{selectedLead.postalCode || 'Niet opgegeven'}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Branche: <b>{selectedLead.sheetBranche}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Lead Type: <b>{selectedLead.leadTypeName}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Aangemaakt: <b>{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString('nl-NL') : 'Onbekend'}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Lead ID: <b>{selectedLead.id}</b></Typography>
          </Box>
        )}
      </Drawer>

      {/* Verwijder lead dialoog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Lead verwijderen</DialogTitle>
        <DialogContent>Weet je zeker dat je deze lead wilt verwijderen?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuleren</Button>
          <Button color="error" onClick={() => handleDeleteLead(leadToDelete.id)}>Verwijderen</Button>
        </DialogActions>
      </Dialog>

      {/* Verwijder alle leads dialoog */}
      <Dialog open={deleteAllDialogOpen} onClose={() => setDeleteAllDialogOpen(false)}>
        <DialogTitle>Alle leads verwijderen</DialogTitle>
        <DialogContent>Weet je zeker dat je <b>alle</b> leads wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)}>Annuleren</Button>
          <Button color="error" onClick={handleDeleteAllLeads}>Alles verwijderen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 