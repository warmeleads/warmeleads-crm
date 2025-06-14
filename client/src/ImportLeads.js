import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Select, MenuItem, Checkbox, List, ListItem, ListItemText, ListItemIcon, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';

const BRANCHES = [
  { value: '', label: 'Alle branches' },
  { value: 'Thuisbatterij', label: 'Thuisbatterij' },
  { value: 'Airco', label: 'Airco' },
  { value: 'GZ Accu', label: 'GZ Accu' },
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
      const res = await fetch(`/api/settings/sheet-columns?sheetId=${id}`);
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

  // Step 3: Importeren
  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    setError('');
    try {
      const res = await fetch('/api/settings/import-sheet-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          tabNames: selectedTabs,
          branch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Importeren mislukt');
      setImportResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
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
      {step === 2 && (
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
              onClick={handleImport}
              disabled={selectedTabs.length === 0 || importing}
              sx={{ minWidth: 180 }}
            >
              {importing ? <CircularProgress size={24} /> : 'Importeren'}
            </Button>
            <Button sx={{ ml: 2 }} onClick={() => setStep(1)}>Terug</Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {importResult && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {importResult.success
                ? `Succes: ${importResult.imported || 0} leads geïmporteerd.`
                : `Fout: ${importResult.error}`}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

export default ImportLeads; 