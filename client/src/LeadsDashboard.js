import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, IconButton, Button, Chip, Avatar, Grid, Card, CardContent, Fade, Drawer, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function LeadsDashboard() {
  const [search, setSearch] = React.useState('');
  const [filterValid, setFilterValid] = React.useState('all');
  const [leads, setLeads] = React.useState([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState(null);

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const res = await fetch(`${API_BASE}/api/leads`);
    const data = await res.json();
    setLeads(data);
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

  // Statistieken
  const totalLeads = leads.length;
  const validLeads = leads.filter(l => l.valid).length;
  const duplicateLeads = leads.filter(l => l.duplicate).length;

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

  return (
    <Box sx={{ minHeight: '100vh', background: palette.bg, p: { xs: 1, md: 4 } }}>
      {/* Hero header met animatie */}
      <Fade in timeout={900}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', position: 'relative' }}>
          <Box sx={{
            position: 'absolute',
            left: -60,
            top: -40,
            width: 180,
            height: 180,
            background: 'radial-gradient(circle, #a5b4fc 0%, #f0f4ff 80%)',
            opacity: 0.4,
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(8px)'
          }} />
          <GroupIcon sx={{ fontSize: 60, color: palette.accent, zIndex: 1 }} />
          <Box sx={{ zIndex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: 1, color: palette.accent, mb: 1, textShadow: '0 2px 12px #e0e7ff' }}>
              Leads Dashboard
            </Typography>
            <Typography variant="h5" sx={{ color: palette.text, fontWeight: 400, opacity: 0.7 }}>
              Direct inzicht in alle inkomende leads, validatie en verdeling
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Statistieken cards */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1000}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #6366f1 60%, #a5b4fc 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #6366f133' }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Totaal leads</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{totalLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1200}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #06b6d4 60%, #67e8f9 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #06b6d433' }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Geldige leads</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{validLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Fade in timeout={1400}><Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #f59e42 60%, #fef08a 100%)', color: '#fff', boxShadow: '0 8px 32px 0 #f59e4233' }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.85 }}>Duplicaten</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{duplicateLeads}</Typography>
            </CardContent>
          </Card></Fade>
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        color="error"
        sx={{ mb: 2, fontWeight: 700 }}
        onClick={() => setDeleteAllDialogOpen(true)}
      >
        Verwijder alle leads
      </Button>

      {/* Filterbalk */}
      <Paper elevation={0} sx={{ mb: 4, p: { xs: 1, md: 2 }, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 4, background: '#fff', boxShadow: '0 2px 16px 0 #6366f11a' }}>
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
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'all' ? '#fff' : palette.accent, background: filterValid === 'all' ? palette.accent : '#fff', boxShadow: filterValid === 'all' ? '0 2px 8px #6366f133' : 'none' }}
        >
          Alle
        </Button>
        <Button
          variant={filterValid === 'valid' ? 'contained' : 'outlined'}
          onClick={() => setFilterValid('valid')}
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'valid' ? '#fff' : palette.accent2, background: filterValid === 'valid' ? palette.accent2 : '#fff', boxShadow: filterValid === 'valid' ? '0 2px 8px #06b6d433' : 'none' }}
        >
          Geldig
        </Button>
        <Button
          variant={filterValid === 'invalid' ? 'contained' : 'outlined'}
          onClick={() => setFilterValid('invalid')}
          sx={{ minWidth: 90, fontWeight: 700, color: filterValid === 'invalid' ? '#fff' : '#f59e42', background: filterValid === 'invalid' ? '#f59e42' : '#fff', boxShadow: filterValid === 'invalid' ? '0 2px 8px #f59e4233' : 'none' }}
        >
          Ongeldig
        </Button>
        <IconButton sx={{ color: palette.accent }}>
          <FilterListIcon />
        </IconButton>
      </Paper>

      {/* Leads tabel in card */}
      <Fade in timeout={1200}>
        <Paper elevation={0} sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 32px 0 #6366f11a', p: 0, overflow: 'hidden' }}>
          <TableContainer sx={{ background: palette.tableBg }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.accent, fontWeight: 800, fontSize: 16 }}>Naam</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>E-mail</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Telefoon</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Locatie</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Branche</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Validatie</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Duplicaat</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }}>Aangemaakt</TableCell>
                  <TableCell sx={{ background: palette.tableHeader, color: palette.text, fontWeight: 700 }} align="center">Acties</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads
                  .filter(lead =>
                    (filterValid === 'all' || (filterValid === 'valid' && lead.valid) || (filterValid === 'invalid' && !lead.valid)) &&
                    ((lead.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
                      (lead.email || '').toLowerCase().includes(search.toLowerCase()) ||
                      (lead.city || '').toLowerCase().includes(search.toLowerCase()))
                  )
                  .map(lead => (
                    <TableRow key={lead.id} hover sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#e0e7ff' } }} onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar {...stringAvatar(lead.name)} sx={{ width: 36, height: 36, fontSize: 18, mr: 1 }} />
                          <span style={{ fontWeight: 700, color: palette.text }}>{lead.name}</span>
                        </Box>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.location}</TableCell>
                      <TableCell>{lead.branche}</TableCell>
                      <TableCell>
                        {lead.valid ? <Chip label="Geldig" sx={{ background: palette.accent2, color: '#fff', fontWeight: 700 }} size="small" /> : <Chip label="Ongeldig" sx={{ background: '#f59e42', color: '#fff', fontWeight: 700 }} size="small" />}
                      </TableCell>
                      <TableCell>
                        {lead.duplicate ? <Chip label="Duplicaat" sx={{ background: palette.accent, color: '#fff', fontWeight: 700 }} size="small" /> : <Chip label="Uniek" sx={{ background: palette.accent3, color: '#fff', fontWeight: 700 }} size="small" />}
                      </TableCell>
                      <TableCell>{lead.createdAt}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small" title="Kopieer lead ID">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="info" size="small" title="Details" onClick={e => { e.stopPropagation(); setSelectedLead(lead); setDrawerOpen(true); }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" size="small" title="Verwijder lead" onClick={e => { e.stopPropagation(); setLeadToDelete(lead); setDeleteDialogOpen(true); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Fade>

      {/* Lead details drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 480 }, p: 3, background: '#f8fafc' } }}>
        {selectedLead && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar {...stringAvatar(selectedLead.name)} sx={{ width: 48, height: 48, fontSize: 24 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: palette.accent }}>{selectedLead.name}</Typography>
                <Typography variant="body2" sx={{ color: palette.text }}>{selectedLead.email}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Telefoon: <b>{selectedLead.phone}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Locatie: <b>{selectedLead.location}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Branche: <b>{selectedLead.branche}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Aangemaakt: <b>{selectedLead.createdAt}</b></Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Validatie: {selectedLead.valid ? <Chip label="Geldig" sx={{ background: palette.accent2, color: '#fff', fontWeight: 700 }} size="small" /> : <Chip label="Ongeldig" sx={{ background: '#f59e42', color: '#fff', fontWeight: 700 }} size="small" />}</Typography>
            <Typography variant="subtitle2" sx={{ color: palette.text, mb: 1 }}>Duplicaat: {selectedLead.duplicate ? <Chip label="Duplicaat" sx={{ background: palette.accent, color: '#fff', fontWeight: 700 }} size="small" /> : <Chip label="Uniek" sx={{ background: palette.accent3, color: '#fff', fontWeight: 700 }} size="small" />}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ color: palette.text, fontStyle: 'italic', opacity: 0.8 }}>{selectedLead.notes}</Typography>
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