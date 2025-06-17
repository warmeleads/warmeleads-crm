import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Fade, Card, CardContent, Grid, Chip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE = process.env.REACT_APP_API_URL || 'https://warmeleads-crm.onrender.com';

export default function ColumnManagement() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBranch, setEditingBranch] = useState(null);
  const [newBranch, setNewBranch] = useState('');
  const [newColumns, setNewColumns] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/branch-columns`);
      const data = await response.json();
      
      if (data.success) {
        setBranches(data.branches);
      } else {
        setError('Fout bij ophalen branches');
      }
    } catch (error) {
      setError('Netwerkfout bij ophalen branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranch = async () => {
    try {
      if (!newBranch.trim()) {
        setError('Branche naam is verplicht');
        return;
      }

      if (newColumns.length === 0) {
        setError('Tenminste één kolom is verplicht');
        return;
      }

      const response = await fetch(`${API_BASE}/api/branch-columns/${newBranch}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: newColumns })
      });

      const data = await response.json();
      
      if (data.success) {
        setDialogOpen(false);
        setNewBranch('');
        setNewColumns([]);
        fetchBranches();
      } else {
        setError(data.error || 'Fout bij opslaan branch');
      }
    } catch (error) {
      setError('Netwerkfout bij opslaan branch');
    }
  };

  const handleDeleteBranch = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/branch-columns/${branchToDelete}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setDeleteDialogOpen(false);
        setBranchToDelete(null);
        fetchBranches();
      } else {
        setError(data.error || 'Fout bij verwijderen branch');
      }
    } catch (error) {
      setError('Netwerkfout bij verwijderen branch');
    }
  };

  const addColumn = () => {
    setNewColumns([...newColumns, { key: '', label: '', order: newColumns.length + 1 }]);
  };

  const updateColumn = (index, field, value) => {
    const updated = [...newColumns];
    updated[index] = { ...updated[index], [field]: value };
    setNewColumns(updated);
  };

  const removeColumn = (index) => {
    setNewColumns(newColumns.filter((_, i) => i !== index));
  };

  const openEditDialog = (branch) => {
    setEditingBranch(branch);
    setNewBranch(branch.branch);
    setNewColumns(branch.columns);
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingBranch(null);
    setNewBranch('');
    setNewColumns([{ key: '', label: '', order: 1 }]);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#6366f1' }}>
        Kolom Beheer
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Beheer vaste kolomtitels per branche voor lead imports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewDialog}
          sx={{ 
            background: 'linear-gradient(120deg, #6366f1 60%, #a5b4fc 100%)',
            color: '#fff',
            fontWeight: 700
          }}
        >
          Nieuwe Branche
        </Button>
      </Box>

      <Grid container spacing={3}>
        {branches.map((branch) => (
          <Grid item xs={12} md={6} lg={4} key={branch.id}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    {branch.branch}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => openEditDialog(branch)}
                      sx={{ color: '#6366f1' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => { setBranchToDelete(branch.branch); setDeleteDialogOpen(true); }}
                      sx={{ color: '#ef4444' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {branch.columns.length} kolommen
                </Typography>

                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {branch.columns.map((column, index) => (
                    <Chip
                      key={index}
                      label={`${column.label} (${column.key})`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5, background: '#f3f4f6' }}
                    />
                  ))}
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
                  Laatst bijgewerkt: {new Date(branch.updatedAt).toLocaleDateString('nl-NL')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog voor nieuwe/bewerken branch */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBranch ? 'Bewerk Branche' : 'Nieuwe Branche'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Branche naam"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Kolommen
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Volgorde</TableCell>
                  <TableCell>Kolom Key</TableCell>
                  <TableCell>Kolom Label</TableCell>
                  <TableCell>Acties</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newColumns.map((column, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.order}
                        onChange={(e) => updateColumn(index, 'order', parseInt(e.target.value) || 1)}
                        type="number"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.key}
                        onChange={(e) => updateColumn(index, 'key', e.target.value)}
                        placeholder="bijv. naamKlant"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.label}
                        onChange={(e) => updateColumn(index, 'label', e.target.value)}
                        placeholder="bijv. Naam klant"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => removeColumn(index)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addColumn}
            sx={{ mb: 2 }}
          >
            Kolom Toevoegen
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CancelIcon />}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSaveBranch} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ background: '#6366f1' }}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog voor verwijderen */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Branche Verwijderen</DialogTitle>
        <DialogContent>
          <Typography>
            Weet je zeker dat je de branche "{branchToDelete}" wilt verwijderen? 
            Dit kan niet ongedaan worden gemaakt.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleDeleteBranch} color="error" variant="contained">
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 