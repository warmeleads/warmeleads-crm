module.exports = {
  Thuisbatterij: {
    firstName: row => (row['Naam klant'] ? row['Naam klant'].split(' ')[0] : 'Onbekend'),
    lastName: row => (row['Naam klant'] && row['Naam klant'].split(' ').length > 1 ? row['Naam klant'].split(' ').slice(1).join(' ') : ''),
    email: row => row['E-mail'] || row['Email'] || '',
    phone: row => row['Telefoonnummer'] || row['Telefoon'] || '',
    city: row => row['Plaatsnaam'] || row['plaats'] || '',
    postalCode: row => row['Postcode'] || '',
    address: row => (row['Postcode'] && row['Plaatsnaam'] ? `${row['Postcode']} ${row['Plaatsnaam']}` : ''),
    country: () => 'Netherlands',
    createdAt: row => row['Datum interesse klant'] ? new Date(row['Datum interesse klant'].split('-').reverse().join('-')).toISOString() : new Date().toISOString(),
    budget: row => row['Budget'] || '',
    zonnepanelen: row => row['Zonnepanelen'] || '',
    redenThuisbatterij: row => row['Reden Thuisbatterij?'] || '',
    // ...meer velden naar wens
  },
  Airco: {
    firstName: row => row['Naam klant'] || row['Voornaam'] || row['naam'] || 'Onbekend',
    lastName: row => row['Achternaam'] || row['leadnaam'] || '',
    email: row => row['E-mail'] || row['Email'] || '',
    phone: row => row['Telefoonnummer'] || row['Telefoon'] || '',
    city: row => row['Plaatsnaam'] || row['plaats'] || '',
    typeAirco: row => row['Type airco'] || '',
    ruimtes: row => row['Hoeveel ruimtes?'] || '',
    zakelijk: row => row['Zakelijk?'] || '',
    koopOfHuur: row => row['Koop of huur?'] || '',
    // ...meer velden naar wens
  },
  'GZ Accu': {
    firstName: row => row['Naam klant'] || row['Voornaam'] || row['naam'] || 'Onbekend',
    email: row => row['E-mail'] || row['Email'] || '',
    phone: row => row['Telefoonnummer'] || row['Telefoon'] || '',
    city: row => row['plaatsnaam'] || row['Plaatsnaam'] || row['plaats'] || '',
    postalCode: row => row['Postcode'] || '',
    huisnummer: row => row['Huisnummer'] || '',
    kwhPerJaar: row => row['Meer dan 75.000 kWh per jaar?'] || '',
    zonnepanelen: row => row['Zonnepanelen?'] || '',
    kwhOpwekking: row => row['Hoeveel kWh opwekking?'] || '',
    reden: row => row['Reden Accu'] || '',
    // ...meer velden naar wens
  }
}; 