import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Select, MenuItem, Checkbox, List, ListItem, ListItemText, ListItemIcon, FormControl, InputLabel, CircularProgress, Alert, Card, CardContent, FormControlLabel, Fade, Stack, useMediaQuery, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

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

// Branch-specifieke mappingvelden
const branchLeadFields = {
  Thuisbatterij: [
    { value: 'naamKlant', label: 'Naam klant' },
    { value: 'datumInteresse', label: 'Datum interesse klant' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'plaatsnaam', label: 'Plaatsnaam' },
    { value: 'telefoonnummer', label: 'Telefoonnummer' },
    { value: 'email', label: 'E-mail' },
    { value: 'zonnepanelen', label: 'Zonnepanelen' },
    { value: 'dynamischContract', label: 'Dynamisch contract' },
    { value: 'stroomverbruik', label: 'Stroomverbruik' },
    { value: 'budget', label: 'Budget' },
    { value: 'redenThuisbatterij', label: 'Reden Thuisbatterij' },
  ],
  Airco: [
    { value: 'naamKlant', label: 'Naam klant' },
    { value: 'datumInteresse', label: 'Datum interesse klant' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'huisnummer', label: 'Huisnummer' },
    { value: 'plaatsnaam', label: 'Plaatsnaam' },
    { value: 'telefoonnummer', label: 'Telefoonnummer' },
    { value: 'email', label: 'E-mail' },
    { value: 'typeAirco', label: 'Type airco' },
    { value: 'koelenVerwarmen', label: 'Koelen/verwarmen?' },
    { value: 'hoeveelRuimtes', label: 'Hoeveel ruimtes?' },
    { value: 'zakelijk', label: 'Zakelijk?' },
    { value: 'koopOfHuur', label: 'Koop of huur?' },
    { value: 'boorwerkzaamheden', label: 'Boorwerkzaamheden toegestaan?' },
  ],
  'GZ Accu': [
    { value: 'naamKlant', label: 'Naam klant' },
    { value: 'datum', label: 'Datum' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'huisnummer', label: 'Huisnummer' },
    { value: 'plaatsnaam', label: 'Plaatsnaam' },
    { value: 'afstand', label: 'Afstand' },
    { value: 'binnenGebied', label: 'Binnen gebied?' },
    { value: 'verwerkt', label: 'Verwerkt?' },
    { value: 'geexporteerd', label: 'Geexporteerd?' },
    { value: 'telefoonnummer', label: 'Telefoonnummer' },
    { value: 'email', label: 'E-mail' },
    { value: 'meerDan75000', label: 'Meer dan 75.000 kWh per jaar?' },
    { value: 'zonnepanelen', label: 'Zonnepanelen?' },
    { value: 'hoeveelKwh', label: 'Hoeveel kWh opwekking?' },
    { value: 'redenAccu', label: 'Reden Accu' },
  ]
};

// Normaliseer kolomnamen voor fuzzy matching
const normalizeColumnName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Verwijder alle niet-alfanumerieke karakters
    .replace(/[éèë]/g, 'e')    // Normaliseer accenten
    .replace(/[àáâä]/g, 'a')
    .replace(/[ïî]/g, 'i')
    .replace(/[öô]/g, 'o')
    .replace(/[üû]/g, 'u');
};

// Database velden die beschikbaar zijn voor mapping
const databaseFields = [
  { value: 'firstName', label: 'Voornaam', normalized: 'firstname' },
  { value: 'lastName', label: 'Achternaam', normalized: 'lastname' },
  { value: 'email', label: 'E-mail', normalized: 'email' },
  { value: 'phone', label: 'Telefoon', normalized: 'telefoon' },
  { value: 'address', label: 'Adres', normalized: 'adres' },
  { value: 'city', label: 'Plaats', normalized: 'plaats' },
  { value: 'postalCode', label: 'Postcode', normalized: 'postcode' },
  { value: 'country', label: 'Land', normalized: 'land' },
  { value: 'createdAt', label: 'Datum interesse', normalized: 'datuminteresse' },
  { value: 'propertyType', label: 'Woningtype', normalized: 'woningtype' },
  { value: 'propertySize', label: 'Woonoppervlakte', normalized: 'woonoppervlakte' },
  { value: 'energyLabel', label: 'Energielabel', normalized: 'energielabel' },
  { value: 'budget', label: 'Budget', normalized: 'budget' },
  { value: 'timeline', label: 'Tijdspad', normalized: 'tijdspad' },
  { value: 'additionalInfo', label: 'Opmerkingen', normalized: 'opmerkingen' },
  { value: 'leadQuality', label: 'Leadkwaliteit', normalized: 'leadkwaliteit' },
];

// Nieuwe automatische mapping functie die alleen branchLeadFields gebruikt
const getAutoMapping = (columnName, branch, tabName) => {
  const normalizedColumn = normalizeColumnName(columnName);
  const branchFields = branchLeadFields[getBranchFromTab(tabName)] || [];

  // Zoek exacte match in branch fields
  const exactMatch = branchFields.find(field => normalizeColumnName(field.label) === normalizedColumn);
  if (exactMatch) {
    return exactMatch.value;
  }
  // Zoek gedeeltelijke matches
  const partialMatch = branchFields.find(field =>
    normalizeColumnName(field.label).includes(normalizedColumn) ||
    normalizedColumn.includes(normalizeColumnName(field.label))
  );
  if (partialMatch) {
    return partialMatch.value;
  }
  return '';
};

// In de mapping-wizard: bepaal branche uit tabbladnaam
const getBranchFromTab = (tabName) => {
  if (!tabName) return '';
  if (tabName.toLowerCase().includes('thuisbatterij')) return 'Thuisbatterij';
  if (tabName.toLowerCase().includes('airco')) return 'Airco';
  if (tabName.toLowerCase().includes('gz accu')) return 'GZ Accu';
  return '';
};

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
  const isMobile = useMediaQuery('(max-width:600px)');
  const [previewRows, setPreviewRows] = useState({});

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
    // Automatische mapping voorstellen
    const autoMappings = {};
    selectedTabs.forEach(tabName => {
      const tab = tabs.find(t => t.name === tabName);
      if (tab && tab.columns) {
        autoMappings[tabName] = {};
        tab.columns.forEach(column => {
          const autoMapping = getAutoMapping(column, branch, tabName);
          autoMappings[tabName][column] = {
            enabled: !!autoMapping,
            mappedTo: autoMapping
          };
        });
      }
    });
    setTabMappings(autoMappings);
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

  // Haal preview data op voor een tabblad
  const fetchPreviewRows = async (tabName) => {
    if (previewRows[tabName]) return; // al opgehaald
    try {
      const res = await fetch(`${API_BASE}/api/settings/sheet-preview?sheetId=${sheetId}&tabName=${encodeURIComponent(tabName)}&limit=3`);
      if (!res.ok) return;
      const data = await res.json();
      setPreviewRows(prev => ({ ...prev, [tabName]: data.rows || [] }));
    } catch {}
  };

  // Haal preview op als mapping-wizard start voor een tabblad
  React.useEffect(() => {
    if (step === 2 && wizardActive && filteredTabs[wizardIndex]) {
      fetchPreviewRows(filteredTabs[wizardIndex].name);
    }
    // eslint-disable-next-line
  }, [step, wizardActive, wizardIndex]);

  return (
    <Box maxWidth={700} mx="auto" mt={isMobile ? 1 : 4} px={isMobile ? 0.5 : 2}>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900} mb={isMobile ? 2 : 3} color="#6366f1">Leads importeren uit Google Sheets</Typography>
      {step === 1 && (
        <Box>
          <Typography mb={isMobile ? 1 : 2}>Voer de Google Spreadsheet URL of ID in:</Typography>
          <TextField
            label="Google Spreadsheet URL of ID"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            fullWidth
            sx={{ mb: isMobile ? 1 : 2 }}
            size={isMobile ? "small" : "medium"}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchTabs}
            disabled={!sheetUrl || loading}
            sx={{ minWidth: isMobile ? '100%' : 180, py: 1.5, fontSize: isMobile ? 16 : 14 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Tabbladen ophalen'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      )}
      {step === 2 && !wizardActive && (
        <Box>
          <Typography mb={isMobile ? 1 : 2}>Selecteer branche en tabbladen om te importeren:</Typography>
          <FormControl sx={{ mb: isMobile ? 1 : 2, minWidth: 220 }} size={isMobile ? "small" : "medium"}>
            <InputLabel>Branche</InputLabel>
            <Select
              value={branch}
              label="Branche"
              onChange={e => setBranch(e.target.value)}
            >
              {BRANCHES.map(b => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Box mb={isMobile ? 1 : 2} display="flex" flexDirection={isMobile ? "column" : "row"} gap={1}>
            <Button onClick={handleSelectAll} sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto' }}>Alles selecteren</Button>
            <Button onClick={handleDeselectAll} sx={{ width: isMobile ? '100%' : 'auto' }}>Alles deselecteren</Button>
          </Box>
          <List sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid #eee', borderRadius: 2 }}>
            {filteredTabs.map(tab => (
              <ListItem key={tab.name} button onClick={() => handleToggleTab(tab.name)} sx={{ minHeight: isMobile ? 56 : 44 }}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedTabs.includes(tab.name)}
                    tabIndex={-1}
                    disableRipple
                    sx={{ width: isMobile ? 32 : 24, height: isMobile ? 32 : 24 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={tab.name}
                  secondary={tab.columns && tab.columns.length > 0 ? `Kolommen: ${tab.columns.join(', ')}` : ''}
                  primaryTypographyProps={{ fontSize: isMobile ? 18 : 16 }}
                />
              </ListItem>
            ))}
          </List>
          <Box mt={isMobile ? 2 : 3} display="flex" flexDirection={isMobile ? "column" : "row"} gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartMapping}
              disabled={selectedTabs.length === 0}
              sx={{ minWidth: isMobile ? '100%' : 180, py: 1.5, fontSize: isMobile ? 16 : 14 }}
            >
              Volgende: Kolommen mappen
            </Button>
            <Button sx={{ ml: isMobile ? 0 : 2, width: isMobile ? '100%' : 'auto', py: 1.5, fontSize: isMobile ? 16 : 14 }} onClick={() => setStep(1)}>Terug</Button>
          </Box>
        </Box>
      )}
      {step === 2 && wizardActive && filteredTabs[wizardIndex] && (
        <Fade in timeout={500}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: isMobile ? 1 : 2, fontWeight: 700, color: '#06b6d4' }}>Tabblad {wizardIndex + 1} van {filteredTabs.length}: <b>{filteredTabs[wizardIndex].name}</b></Typography>
            {/* Preview van sheetdata */}
            {previewRows[filteredTabs[wizardIndex].name] && previewRows[filteredTabs[wizardIndex].name].length > 0 && (
              <Paper sx={{ mb: 2, p: 1, background: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#6366f1', fontWeight: 700 }}>Voorbeeld data uit Google Sheet:</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {filteredTabs[wizardIndex].columns.map(col => (
                          <TableCell key={col} sx={{ fontWeight: 700 }}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewRows[filteredTabs[wizardIndex].name].map((row, i) => (
                        <TableRow key={i}>
                          {filteredTabs[wizardIndex].columns.map(col => (
                            <TableCell key={col}>{row[col] ?? ''}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            <Card elevation={3} sx={{ borderRadius: 4, mb: isMobile ? 1 : 2 }}>
              <CardContent>
                {filteredTabs[wizardIndex].columns.length === 0 && <Typography color="text.secondary">Geen kolommen gevonden.</Typography>}
                {filteredTabs[wizardIndex].columns.map(col => (
                  <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Typography sx={{ minWidth: 120, fontWeight: 500 }}>{col}</Typography>
                    <Select
                      size={isMobile ? "medium" : "small"}
                      value={tabMappings[filteredTabs[wizardIndex].name]?.[col]?.mappedTo || ''}
                      onChange={e => handleMappingChange(filteredTabs[wizardIndex].name, col, 'mappedTo', e.target.value)}
                      displayEmpty
                      sx={{ minWidth: isMobile ? 200 : 160 }}
                    >
                      <MenuItem value=""><em>Niet mappen</em></MenuItem>
                      {(branchLeadFields[getBranchFromTab(filteredTabs[wizardIndex].name)] || []).map(f => (
                        <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </CardContent>
            </Card>
            <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mt: isMobile ? 1 : 2 }}>
              <Button variant="contained" color="primary" onClick={handleImportTab} disabled={importing} sx={{ py: 1.5, fontSize: isMobile ? 16 : 14 }}>
                {importing ? 'Importeren...' : 'Importeer dit tabblad'}
              </Button>
              <Button variant="outlined" onClick={handlePrev} disabled={wizardIndex === 0 || importing} sx={{ py: 1.5, fontSize: isMobile ? 16 : 14 }}>
                Vorige
              </Button>
              <Button variant="text" color="error" onClick={() => setWizardActive(false)} disabled={importing} sx={{ py: 1.5, fontSize: isMobile ? 16 : 14 }}>
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
          <Button variant="contained" sx={{ mt: 2, width: isMobile ? '100%' : 'auto', py: 1.5, fontSize: isMobile ? 16 : 14 }} onClick={() => setStep(1)}>Opnieuw starten</Button>
        </Box>
      )}
    </Box>
  );
}

export default ImportLeads; 