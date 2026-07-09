/**
 * Google Sheets Configuration
 * Sesuaikan dengan Sheet ID dan range Anda
 */

const SHEET_CONFIG = {
  // Google Sheets ID
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  
  // Sheet Names & Ranges
  SHEETS: {
    TOKO: {
      name: 'TOKO',
      range: 'A2:C1000',
      columns: {
        nama: 0,        // Kolom A - Nama Toko
        sales: 1,       // Kolom B - Sales
        area: 2         // Kolom C - Area Service
      }
    },
    UNIT: {
      name: 'UNIT',
      range: 'A2:B1000',
      columns: {
        id: 0,          // Kolom A - Unit ID
        type: 1         // Kolom B - Type
      }
    },
    DATA: {
      name: 'DATA',
      range: 'A1:H1000',
      columns: {
        noSurat: 0,     // Kolom A - Nomor Surat
        tanggal: 1,     // Kolom B - Tanggal
        toko: 2,        // Kolom C - Nama Toko
        type: 3,        // Kolom D - Type Unit
        seri: 4,        // Kolom E - Seri Unit
        detail: 5,      // Kolom F - Detail Barang (JSON)
        status: 6,      // Kolom G - Status
        gambar: 7       // Kolom H - Gambar (base64)
      }
    },
    CAP: {
      name: 'CAP',
      range: 'A2:B1000',
      columns: {
        toko: 0,        // Kolom A - Nama Toko
        cap: 1          // Kolom B - Cap (base64)
      }
    },
    PDS: {
      name: 'PDS',
      range: 'A2:B1000',
      columns: {
        toko: 0,        // Kolom A - Nama Toko
        service: 1      // Kolom B - Service
      }
    },
    DM: {
      name: 'DM',
      range: 'A2:C1000',
      columns: {
        nama: 0,        // Kolom A - Nama DM
        whatsapp: 1,    // Kolom B - WhatsApp
        email: 2        // Kolom C - Email
      }
    }
  },
  
  // Status Options
  STATUS: {
    PENDING: 'PENDING',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    DONE: 'DONE'
  },
  
  // Nomor Surat Format: PRMNT/JAB/TH/BULAN/URUT
  DOCUMENT_PREFIX: 'PRMNT/JAB',
  
  // WhatsApp API Config
  WHATSAPP: {
    API_URL: 'https://api.whatsapp.com/send',
    API_KEY: 'YOUR_WHATSAPP_API_KEY'
  }
};
