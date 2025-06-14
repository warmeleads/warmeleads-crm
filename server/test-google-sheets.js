const { google } = require('googleapis');
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: 'google-service-account.json', // Gebruik nu het juiste bestand
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRow() {
  const client = await auth.getClient();
  const sheetId = '1Qx6hZO_IHOWkqNbyS9BCeKeThN8eFMQxJEmgHS2qqV8'; // <-- Jouw echte sheet-id
  const tabName = 'Blad2'; // <-- Jouw tabbladnaam

  const res = await sheets.spreadsheets.values.append({
    auth: client,
    spreadsheetId: sheetId,
    range: `${tabName}!A1:Z1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [new Date().toISOString(), 'Test', 'Row', 'From', 'Minimal', 'Script']
      ]
    }
  });
  console.log('Result:', res.data);
}

appendRow().catch(console.error); 