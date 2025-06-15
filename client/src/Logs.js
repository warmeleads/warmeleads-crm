import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function Logs() {
  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <Typography variant="h3" fontWeight={900} mb={3} color="#6366f1">Logs & Debug</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Hier komen straks alle uitgebreide logs van backend en frontend te staan. Je kunt hier straks alles terugvinden over imports, fouten, warnings, API-calls en meer.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (Deze pagina is een basis. Wil je specifieke logdata of filters? Laat het weten!)
        </Typography>
      </Paper>
    </Box>
  );
} 