import React from 'react';
import { Box, Typography, Paper, TextField, Button, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Select, Chip, CircularProgress, Fade, Stack } from '@mui/material';

const leadFields = [
  { value: 'firstName', label: 'Voornaam' },
  { value: 'lastName', label: 'Achternaam' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefoon' },
  { value: 'address', label: 'Adres' },
  { value: 'city', label: 'Plaats' },
  { value: 'postalCode', label: 'Postcode' },
  { value: 'country', label: 'Land' },
  { value: 'propertyType', label: 'Woningtype' },
  { value: 'propertySize', label: 'Woonoppervlakte' },
  { value: 'energyLabel', label: 'Energielabel' },
  { value: 'budget', label: 'Budget' },
  { value: 'timeline', label: 'Tijdspad' },
  { value: 'additionalInfo', label: 'Opmerkingen' },
  { value: 'leadQuality', label: 'Leadkwaliteit' },
  { value: 'facebookLeadId', label: 'Facebook Lead ID' },
];

export default function Settings() {
  const [sheetUrl, setSheetUrl] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [loadingTabs, setLoadingTabs] = React.useState(false);
  const [sheetTabs, setSheetTabs] = React.useState([]);
  const [tabMappings, setTabMappings] = React.useState({}); // { tabName: { col: { enabled, mappedTo } } }
  const [wizardIndex, setWizardIndex] = React.useState(0);
  const [wizardActive, setWizardActive] = React.useState(false);
  const [results, setResults] = React.useState([]); // {tab, action, importResult}
  const [importing, setImporting] = React.useState(false);
  const [log, setLog] = React.useState('');

  React.useEffect(() => {
    fetch('/api/settings/sheet')
      .then(res => res.json())
      .then(data => setSheetUrl(data.sheetUrl || ''));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    await fetch('/api/settings/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl })
    });
    setSaved(true);
  };

  const handleLoadTabs = async () => {
    setLoadingTabs(true);
    setLog('Ophalen van tabbladen gestart...');
    setSheetTabs([]);
    setTabMappings({});
    setWizardIndex(0);
    setWizardActive(false);
    setResults([]);
    try {
      const res = await fetch('/api/settings/sheet-columns');
      setLog(l => l + `\n[${new Date().toLocaleTimeString()}] HTTP status: ${res.status}`);
      if (!res.ok) {
        let errText = '';
        try {
          errText = await res.text();
        } catch {}
        setLog(l => l + `\nFout: ${res.statusText} (${res.status})\nResponse: ${errText}`);
        setLoadingTabs(false);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (e) {
        setLog(l => l + `\nFout: Response is geen geldige JSON.\n${e}`);
        setLoadingTabs(false);
        return;
      }
      setLog(l => l + `\nSucces: ${data.sheetTabs?.length || 0} tabbladen gevonden.`);
      setSheetTabs(data.sheetTabs || []);
      setLoadingTabs(false);
    } catch (err) {
      setLog(l => l + `\nNetwerk- of fetch-fout: ${err.message}`);
      setLoadingTabs(false);
    }
  };

  const handleMappingChange = (tab, col, field, value) => {
    setTabMappings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [col]: {
          ...prev[tab][col],
          [field]: value
        }
      }
    }));
  };

  const handleImportTab = async () => {
    setImporting(true);
    const tab = sheetTabs[wizardIndex];
    // Stuur mapping van dit tabblad mee (optioneel: pas backend aan voor per-tabblad mapping)
    // Voor nu: alleen tabnaam meesturen
    const res = await fetch('/api/settings/import-sheet-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabName: tab.name, mapping: tabMappings[tab.name] })
    });
    const data = await res.json();
    setResults(prev => ([...prev, { tab: tab.name, action: 'imported', importResult: data }]));
    setImporting(false);
    handleNext();
  };

  const handleSkipTab = () => {
    const tab = sheetTabs[wizardIndex];
    setResults(prev => ([...prev, { tab: tab.name, action: 'skipped' }]));
    handleNext();
  };

  const handleNext = () => {
    if (wizardIndex < sheetTabs.length - 1) {
      setWizardIndex(wizardIndex + 1);
    } else {
      setWizardActive(false);
    }
  };

  const handlePrev = () => {
    if (wizardIndex > 0) {
      setWizardIndex(wizardIndex - 1);
    }
  };

  const handleStop = () => {
    setWizardActive(false);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: '#6366f1' }}>Instellingen</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <form onSubmit={handleSave} style={{ maxWidth: 500 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Google Spreadsheet URL of ID:</Typography>
          <TextField
            id="sheetUrl"
            type="text"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="https://docs.google.com/spreadsheets/d/...."
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>Opslaan</Button>
          <Button variant="outlined" onClick={handleLoadTabs} disabled={!sheetUrl || loadingTabs}>
            {loadingTabs ? <CircularProgress size={20} /> : 'Tabbladen ophalen & starten'}
          </Button>
          {saved && <Chip label="Opgeslagen!" color="success" sx={{ ml: 2 }} />}
        </form>
        {log && (
          <Box sx={{ mt: 2, p: 2, background: '#f8fafc', borderRadius: 2, color: log.startsWith('Fout') ? 'red' : 'green', fontFamily: 'monospace', fontSize: 15 }}>
            {log}
          </Box>
        )}
      </Paper>

      {/* Wizard: één tabblad per keer */}
      {wizardActive && sheetTabs[wizardIndex] && (
        <Fade in timeout={500}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#06b6d4' }}>Tabblad {wizardIndex + 1} van {sheetTabs.length}: <b>{sheetTabs[wizardIndex].name}</b></Typography>
            <Card elevation={3} sx={{ borderRadius: 4, mb: 2 }}>
              <CardContent>
                {sheetTabs[wizardIndex].columns.length === 0 && <Typography color="text.secondary">Geen kolommen gevonden.</Typography>}
                {sheetTabs[wizardIndex].columns.map(col => (
                  <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tabMappings[sheetTabs[wizardIndex].name]?.[col]?.enabled || false}
                          onChange={e => handleMappingChange(sheetTabs[wizardIndex].name, col, 'enabled', e.target.checked)}
                        />
                      }
                      label={col}
                    />
                    <Select
                      size="small"
                      value={tabMappings[sheetTabs[wizardIndex].name]?.[col]?.mappedTo || ''}
                      onChange={e => handleMappingChange(sheetTabs[wizardIndex].name, col, 'mappedTo', e.target.value)}
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
              <Button variant="outlined" color="secondary" onClick={handleSkipTab} disabled={importing}>
                Sla over
              </Button>
              <Button variant="outlined" onClick={handlePrev} disabled={wizardIndex === 0 || importing}>
                Vorige
              </Button>
              <Button variant="text" color="error" onClick={handleStop} disabled={importing}>
                Stoppen
              </Button>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Wizard klaar: overzicht */}
      {!wizardActive && results.length > 0 && (
        <Fade in timeout={500}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#06b6d4' }}>Resultaat import</Typography>
            {results.map((r, i) => (
              <Paper key={i} sx={{ p: 2, mb: 1, borderRadius: 2, background: r.action === 'imported' ? '#e0ffe0' : '#fffbe0' }}>
                <b>{r.tab}</b>: {r.action === 'imported' ? (
                  r.importResult && r.importResult.success
                    ? `Geïmporteerd (${r.importResult.imported} nieuwe leads)`
                    : `Fout: ${r.importResult?.error || 'Onbekend'}`
                ) : 'Overgeslagen'}
              </Paper>
            ))}
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleLoadTabs}>Opnieuw starten</Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
} 