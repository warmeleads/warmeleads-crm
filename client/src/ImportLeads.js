import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Select, MenuItem, Checkbox, List, ListItem, ListItemText, ListItemIcon, FormControl, InputLabel, CircularProgress, Alert, Card, CardContent, FormControlLabel, Fade, Stack } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_URL || 'https://warmeleads-crm.onrender.com';

const BRANCHES = [
  { value: '', label: 'Alle branches' },
  { value: 'Thuisbatterij', label: 'Thuisbatterij' },
  { value: 'Airco', label: 'Airco' },
  { value: 'GZ Accu', label: 'GZ Accu' },
];

const leadFields = [
  { value: 'firstName', label: 'Voornaam' },
  { value: 'lastName', label: 'Achternaam' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefoon' },
  { value: 'address', label: 'Adres' },
  { value: 'city', label: 'Plaats' },
  { value: 'postalCode', label: 'Postcode' },
  { value: 'country', label: 'Land (verplicht)' },
  { value: 'latitude', label: 'Latitude (verplicht)' },
  { value: 'longitude', label: 'Longitude (verplicht)' },
  { value: 'propertyType', label: 'Woningtype' },
  { value: 'propertySize', label: 'Woonoppervlakte' },
  { value: 'energyLabel', label: 'Energielabel' },
  { value: 'budget', label: 'Budget' },
  { value: 'timeline', label: 'Tijdspad' },
  { value: 'additionalInfo', label: 'Opmerkingen' },
  { value: 'leadQuality', label: 'Leadkwaliteit' },
  { value: 'facebookLeadId', label: 'Facebook Lead ID' },
];

function ImportLeads() {
  const [step, setStep] = useState(1);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [branch, setBranch] = useState('');
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const [tabMappings, setTabMappings] = useState({});
  const [wizardIndex, setWizardIndex] = useState(0);
  const [wizardActive, setWizardActive] = useState(false);

  // Extract sheetId from URL or use as-is
  const extractSheetId = (url) => {
    if (!url) return '';
    const match = url.match(/\/d\/([\w-]+)/);
    if (match) return match[1];
    return url;
  };

  // Step 1: Ophalen van tabbladen
  const handleFetchTabs = async () => {
    setError('');
    setLoading(true);
    setTabs([]);
    setSelectedTabs([]);
    setImportResult(null);
    const id = extractSheetId(sheetUrl);
    setSheetId(id);
    try {
      const res = await fetch(`${API_BASE}/api/settings/sheet-columns?sheetId=${id}`);
      if (!res.ok) throw new Error('Kan tabbladen niet ophalen');
      const data = await res.json();
      setTabs(data.sheetTabs || []);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Selecteer tabbladen (optioneel filter op branche)
  const filteredTabs = branch
    ? tabs.filter(tab => tab.name.toLowerCase().includes(branch.toLowerCase()))
    : tabs;

  const handleToggleTab = (tabName) => {
    setSelectedTabs((prev) =>
      prev.includes(tabName)
        ? prev.filter((t) => t !== tabName)
        : [...prev, tabName]
    );
  };

  const handleSelectAll = () => {
    setSelectedTabs(filteredTabs.map(tab => tab.name));
  };
  const handleDeselectAll = () => {
    setSelectedTabs([]);
  };

  // Start mapping-wizard na tabselectie
  const handleStartMapping = () => {
    setWizardIndex(0);
    setWizardActive(true);
  };

  const handleMappingChange = (tab, col, field, value) => {
    setTabMappings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [col]: {
          ...prev[tab]?.[col],
          [field]: value
        }
      }
    }));
  };

  const handleImportTab = async () => {
    setImporting(true);
    const tab = filteredTabs[wizardIndex];
    const res = await fetch(`${API_BASE}/api/settings/import-sheet-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId,
        tabNames: [tab.name],
        branch,
        mapping: { [tab.name]: tabMappings[tab.name] }
      })
    });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    handleNext();
  };

  const handleNext = () => {
    if (wizardIndex < filteredTabs.length - 1) {
      setWizardIndex(wizardIndex + 1);
    } else {
      setWizardActive(false);
      setStep(3); // Resultaat tonen
    }
  };

  const handlePrev = () => {
    if (wizardIndex > 0) {
      setWizardIndex(wizardIndex - 1);
    }
  };

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Typography variant="h4" fontWeight={900} mb={3} color="#6366f1">Leads importeren uit Google Sheets</Typography>
      {step === 1 && (
        <Box>
          <Typography mb={2}>Voer de Google Spreadsheet URL of ID in:</Typography>
          <TextField
            label="Google Spreadsheet URL of ID"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchTabs}
            disabled={!sheetUrl || loading}
            sx={{ minWidth: 180 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Tabbladen ophalen'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      )}
      {step === 2 && !wizardActive && (
        <Box>
          <Typography mb={2}>Selecteer branche en tabbladen om te importeren:</Typography>
          <FormControl sx={{ mb: 2, minWidth: 220 }}>
            <InputLabel>Branche</InputLabel>
            <Select
              value={branch}
              label="Branche"
              onChange={e => setBranch(e.target.value)}
            >
              {BRANCHES.map(b => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Box mb={2}>
            <Button onClick={handleSelectAll} sx={{ mr: 1 }}>Alles selecteren</Button>
            <Button onClick={handleDeselectAll}>Alles deselecteren</Button>
          </Box>
          <List sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid #eee', borderRadius: 2 }}>
            {filteredTabs.map(tab => (
              <ListItem key={tab.name} button onClick={() => handleToggleTab(tab.name)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedTabs.includes(tab.name)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={tab.name}
                  secondary={tab.columns && tab.columns.length > 0 ? `Kolommen: ${tab.columns.join(', ')}` : ''}
                />
              </ListItem>
            ))}
          </List>
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartMapping}
              disabled={selectedTabs.length === 0}
              sx={{ minWidth: 180 }}
            >
              Volgende: Kolommen mappen
            </Button>
            <Button sx={{ ml: 2 }} onClick={() => setStep(1)}>Terug</Button>
          </Box>
        </Box>
      )}
      {step === 2 && wizardActive && filteredTabs[wizardIndex] && (
        <Fade in timeout={500}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#06b6d4' }}>Tabblad {wizardIndex + 1} van {filteredTabs.length}: <b>{filteredTabs[wizardIndex].name}</b></Typography>
            <Card elevation={3} sx={{ borderRadius: 4, mb: 2 }}>
              <CardContent>
                {filteredTabs[wizardIndex].columns.length === 0 && <Typography color="text.secondary">Geen kolommen gevonden.</Typography>}
                {filteredTabs[wizardIndex].columns.map(col => (
                  <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tabMappings[filteredTabs[wizardIndex].name]?.[col]?.enabled || false}
                          onChange={e => handleMappingChange(filteredTabs[wizardIndex].name, col, 'enabled', e.target.checked)}
                        />
                      }
                      label={col}
                    />
                    <Select
                      size="small"
                      value={tabMappings[filteredTabs[wizardIndex].name]?.[col]?.mappedTo || ''}
                      onChange={e => handleMappingChange(filteredTabs[wizardIndex].name, col, 'mappedTo', e.target.value)}
                      displayEmpty
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value=""><em>Niet mappen</em></MenuItem>
                      {leadFields.map(f => (
                        <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </CardContent>
            </Card>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleImportTab} disabled={importing}>
                {importing ? 'Importeren...' : 'Importeer dit tabblad'}
              </Button>
              <Button variant="outlined" onClick={handlePrev} disabled={wizardIndex === 0 || importing}>
                Vorige
              </Button>
              <Button variant="text" color="error" onClick={() => setWizardActive(false)} disabled={importing}>
                Stoppen
              </Button>
            </Stack>
          </Box>
        </Fade>
      )}
      {step === 3 && (
        <Box>
          {importResult && (
            <Alert severity={importResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {importResult.success
                ? `Succes: ${importResult.imported || 0} leads geïmporteerd.`
                : `Fout: ${importResult.error}`}
            </Alert>
          )}
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setStep(1)}>Opnieuw starten</Button>
        </Box>
      )}
    </Box>
  );
}

export default ImportLeads; 