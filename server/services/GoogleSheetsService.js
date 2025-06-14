const { google } = require('googleapis');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    // Laad service account credentials UITSLUITEND uit environment variable
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        this.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        logger.error('GOOGLE_SERVICE_ACCOUNT_JSON is geen geldige JSON!');
        this.sheets = null;
        return;
      }
    } else {
      logger.warn('Geen GOOGLE_SERVICE_ACCOUNT_JSON gevonden. Google Sheets integratie werkt niet.');
      this.sheets = null;
      return;
    }

    this.jwtClient = new google.auth.JWT(
      this.credentials.client_email,
      null,
      this.credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    this.sheets = google.sheets({ version: 'v4', auth: this.jwtClient });
  }

  /**
   * Append a row to a Google Sheet
   * @param {string} sheetId - The Google Sheet ID
   * @param {string} sheetName - The name of the sheet/tab
   * @param {Array} rowData - Array of values to append
   * @returns {Promise<string>} - Row range or ID
   */
  async appendRow(sheetId, sheetName, rowData) {
    if (!this.sheets) {
      logger.warn('Google Sheets API not configured. Skipping appendRow.');
      return null;
    }
    if (!sheetId || typeof sheetId !== 'string' || sheetId.trim() === '') {
      logger.error('Geen geldige Google Sheet ID opgegeven aan appendRow.');
      throw new Error('Geen geldige Google Sheet ID opgegeven.');
    }
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === '') {
      logger.error('Geen geldige tabbladnaam opgegeven aan appendRow.');
      throw new Error('Geen geldige tabbladnaam opgegeven.');
    }
    try {
      await this.jwtClient.authorize();
      // Controleer of de sheetId bestaat
      let sheetNames;
      try {
        sheetNames = await this.getAllSheetNames(sheetId);
      } catch (err) {
        logger.error(`Google Sheet ID niet gevonden: ${sheetId}`, err);
        throw new Error(`Google Sheet ID niet gevonden: ${sheetId}`);
      }
      if (!sheetNames.includes(sheetName)) {
        logger.error(`Tabblad '${sheetName}' niet gevonden in Google Sheet ID: ${sheetId}`);
        throw new Error(`Tabblad '${sheetName}' niet gevonden in Google Sheet ID: ${sheetId}`);
      }
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });
      logger.info(`Appended row to Google Sheet: ${sheetId} (${sheetName})`, rowData);
      return response.data.updates.updatedRange;
    } catch (error) {
      logger.error('Error appending row to Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Haal alle rijen op uit een Google Sheet tabblad
   * @param {string} sheetId - De Google Sheet ID
   * @param {string} sheetName - De naam van het tabblad
   * @returns {Promise<Array>} - Array van rijen (elke rij is een array van cellen)
   */
  async getAllRows(sheetId, sheetName) {
    if (!this.sheets) {
      logger.warn('Google Sheets API not configured. Skipping getAllRows.');
      return [];
    }
    if (!sheetId || typeof sheetId !== 'string' || sheetId.trim() === '') {
      logger.error('Geen geldige Google Sheet ID opgegeven aan getAllRows.');
      throw new Error('Geen geldige Google Sheet ID opgegeven.');
    }
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === '') {
      logger.error('Geen geldige tabbladnaam opgegeven aan getAllRows.');
      throw new Error('Geen geldige tabbladnaam opgegeven.');
    }
    try {
      await this.jwtClient.authorize();
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}`
      });
      return response.data.values || [];
    } catch (error) {
      logger.error('Error reading rows from Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Haal alle tabbladnamen op uit een Google Sheet
   * @param {string} sheetId - De Google Sheet ID
   * @returns {Promise<Array<string>>} - Array van sheet/tab namen
   */
  async getAllSheetNames(sheetId) {
    if (!this.sheets) {
      logger.warn('Google Sheets API not configured. Skipping getAllSheetNames.');
      return [];
    }
    if (!sheetId || typeof sheetId !== 'string' || sheetId.trim() === '') {
      logger.error('Geen geldige Google Sheet ID opgegeven aan getAllSheetNames.');
      throw new Error('Geen geldige Google Sheet ID opgegeven.');
    }
    try {
      await this.jwtClient.authorize();
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: sheetId
      });
      const sheets = response.data.sheets || [];
      return sheets.map(s => s.properties.title);
    } catch (error) {
      logger.error('Error reading sheet names from Google Sheet:', error);
      throw error;
    }
  }
}

module.exports = GoogleSheetsService; 