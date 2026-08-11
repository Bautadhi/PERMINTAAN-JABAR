/**
 * ==============================================================================================
 * GOOGLE APPS SCRIPT BACKEND DATABASE UNTUK APLIKASI PERMINTAAN TOKO
 * ==============================================================================================
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buka Google Spreadsheet baru (atau yang sudah ada) di Google Drive Anda.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus semua kode default di file Code.gs, lalu SALIN & TEMPEL seluruh kode di bawah ini.
 * 4. Klik ikon "Simpan" (Save / Ctrl+S).
 * 5. Klik tombol biru "Terapkan" (Deploy) -> "Penerapan baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web App).
 * 7. Isi konfigurasi:
 *    - Deskripsi: Backend Database Permintaan Toko
 *    - Jalankan sebagai: Saya (Email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone / Termasuk Anonim)  <-- SANGAT PENTING!
 * 8. Klik "Terapkan" (Deploy) -> Berikan izin akses (Authorize access) -> Lanjutkan (Advanced -> Go to ...).
 * 9. Salin URL Aplikasi Web (Web App URL) yang berakhiran "/exec".
 * 10. Buka Aplikasi Permintaan Toko -> Masuk sebagai ADMIN -> Masukkan URL tersebut di Pengaturan Database Google Sheets.
 * ==============================================================================================
 */

const SHEET_NAMES = {
  REQUESTS: 'PERMINTAAN',
  USERS: 'USERS',
  STORES: 'TOKO',
  TTD: 'TTD',
  SETTINGS: 'SETTINGS',
  CHAT: 'CHAT'
};

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initSheetHeader(sheet, sheetName);
  }
  return sheet;
}

function initSheetHeader(sheet, sheetName) {
  let headers = [];
  if (sheetName === SHEET_NAMES.REQUESTS) {
    headers = ['NO SURAT', 'TANGGAL', 'TOKO', 'AREA', 'JENIS', 'STATUS', 'SERVICE APPROVE', 'PEMOHON', 'USER ID', 'ITEMS JSON', 'PHOTOS JSON', 'CATATAN', 'LOG JSON', 'CREATED AT'];
  } else if (sheetName === SHEET_NAMES.USERS) {
    headers = ['ID', 'USERNAME', 'PASSWORD', 'NAMA LENGKAP', 'KODE TOKO', 'NO TELEPON', 'KATEGORI', 'AREA', 'CREATED AT'];
  } else if (sheetName === SHEET_NAMES.STORES) {
    headers = ['ID', 'NAMA TOKO', 'AREA', 'KODE TOKO', 'DIBUAT OLEH'];
  } else if (sheetName === SHEET_NAMES.TTD) {
    headers = ['USER ID', 'USERNAME', 'TTD DATA URL', 'UPDATED AT'];
  } else if (sheetName === SHEET_NAMES.SETTINGS) {
    headers = ['KEY', 'VALUE', 'UPDATED AT'];
  } else if (sheetName === SHEET_NAMES.CHAT) {
    headers = ['ID', 'ROOM ID', 'SENDER USERNAME', 'SENDER NAME', 'MESSAGE', 'TIMESTAMP', 'CREATED AT'];
  }

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';

    if (action === 'ping') {
      return createJsonResponse({ status: 'success', message: 'GOOGLE APPS SCRIPT ONLINE TERHUBUNG!', timestamp: new Date().toISOString() });
    }

    if (action === 'getAllData') {
      const data = {
        status: 'success',
        requests: getRequestsData(),
        users: getUsersData(),
        stores: getStoresData(),
        ttd: getTTDData(),
        settings: getSettingsData(),
        chat: getChatData(),
        timestamp: new Date().toISOString()
      };
      return createJsonResponse(data);
    }

    if (action === 'getRequests') {
      return createJsonResponse({ status: 'success', requests: getRequestsData() });
    }

    if (action === 'getUsers') {
      return createJsonResponse({ status: 'success', users: getUsersData() });
    }

    if (action === 'getStores') {
      return createJsonResponse({ status: 'success', stores: getStoresData() });
    }

    return createJsonResponse({ status: 'error', message: 'Action doGet tidak dikenal: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000); // Kunci agar tidak terjadi tabrakan eksekusi ganda bersamaan

    let requestBody = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        requestBody = e.parameter || {};
      }
    } else if (e && e.parameter) {
      requestBody = e.parameter;
    }

    const action = requestBody.action || 'syncAll';

    // 1. SYNC SEMUA DATA (BULK SYNC)
    if (action === 'syncAll') {
      if (Array.isArray(requestBody.requests)) saveBulkRequests(requestBody.requests);
      if (Array.isArray(requestBody.users)) saveBulkUsers(requestBody.users);
      if (Array.isArray(requestBody.stores)) saveBulkStores(requestBody.stores);
      if (requestBody.ttd) saveBulkTTD(requestBody.ttd);
      if (requestBody.settings) saveBulkSettings(requestBody.settings);
      return createJsonResponse({ status: 'success', message: 'Semua data berhasil disinkronkan ke Google Spreadsheet tanpa duplikat!' });
    }

    // 2. SIMPAN / UPDATE REQUEST PERMINTAAN
    if (action === 'saveRequest') {
      saveSingleRequest(requestBody.data);
      return createJsonResponse({ status: 'success', message: 'Permintaan berhasil disimpan ke Sheet!' });
    }

    // 3. BULK SAVE REQUESTS
    if (action === 'syncRequests') {
      saveBulkRequests(requestBody.requests || []);
      return createJsonResponse({ status: 'success', message: 'Daftar permintaan berhasil disinkronkan ke Sheet!' });
    }

    // 4. HAPUS REQUEST PERMINTAAN
    if (action === 'deleteRequest') {
      deleteSingleRequest(requestBody.noSurat);
      return createJsonResponse({ status: 'success', message: 'Permintaan berhasil dihapus dari Sheet!' });
    }

    // 5. BULK DELETE REQUESTS
    if (action === 'deleteBulkRequests') {
      deleteBulkRequests(requestBody.noSuratList || []);
      return createJsonResponse({ status: 'success', message: 'Batch permintaan berhasil dihapus dari Sheet!' });
    }

    // 6. SIMPAN / UPDATE USER
    if (action === 'saveUser') {
      saveSingleUser(requestBody.data);
      return createJsonResponse({ status: 'success', message: 'Data user berhasil disimpan ke Sheet!' });
    }

    // 7. BULK SAVE USERS
    if (action === 'syncUsers') {
      saveBulkUsers(requestBody.users || []);
      return createJsonResponse({ status: 'success', message: 'Daftar user berhasil disinkronkan ke Sheet!' });
    }

    // 8. HAPUS USER (SINGLE / BULK)
    if (action === 'deleteUser') {
      deleteSingleUser(requestBody.userId, requestBody.username);
      return createJsonResponse({ status: 'success', message: 'User berhasil dihapus dari Sheet!' });
    }

    if (action === 'deleteBulkUsers') {
      deleteBulkUsers(requestBody.userIds || [], requestBody.usernames || []);
      return createJsonResponse({ status: 'success', message: 'Batch user berhasil dihapus dari Sheet!' });
    }

    // 9. SIMPAN / UPDATE TOKO
    if (action === 'saveStore') {
      saveSingleStore(requestBody.data);
      return createJsonResponse({ status: 'success', message: 'Data toko berhasil disimpan ke Sheet!' });
    }

    // 10. BULK SAVE TOKO
    if (action === 'syncStores') {
      saveBulkStores(requestBody.stores || []);
      return createJsonResponse({ status: 'success', message: 'Daftar toko berhasil disinkronkan ke Sheet!' });
    }

    // 11. HAPUS TOKO (SINGLE / BULK)
    if (action === 'deleteStore') {
      deleteSingleStore(requestBody.storeId, requestBody.storeName);
      return createJsonResponse({ status: 'success', message: 'Toko berhasil dihapus dari Sheet!' });
    }

    if (action === 'deleteBulkStores') {
      deleteBulkStores(requestBody.storeIds || [], requestBody.storeNames || []);
      return createJsonResponse({ status: 'success', message: 'Batch toko berhasil dihapus dari Sheet!' });
    }

    // 12. SIMPAN TTD
    if (action === 'saveTTD') {
      saveSingleTTD(requestBody.userId, requestBody.username, requestBody.ttdData);
      return createJsonResponse({ status: 'success', message: 'TTD berhasil disimpan ke Sheet!' });
    }

    // 13. SIMPAN SETTINGS
    if (action === 'saveSettings') {
      saveSingleSetting(requestBody.key, requestBody.value);
      return createJsonResponse({ status: 'success', message: 'Pengaturan berhasil disimpan ke Sheet!' });
    }

    // 14. SIMPAN PESAN CHAT
    if (action === 'saveChatMessage') {
      saveSingleChatMessage(requestBody.data);
      return createJsonResponse({ status: 'success', message: 'Pesan chat berhasil disimpan ke Sheet!' });
    }

    // 15. HAPUS ROOM CHAT
    if (action === 'deleteChatRoom') {
      deleteSingleChatRoom(requestBody.room);
      return createJsonResponse({ status: 'success', message: 'Room chat berhasil dihapus dari Sheet!' });
    }

    return createJsonResponse({ status: 'error', message: 'Action doPost tidak dikenal: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// OPERASI DATA SHEET: PERMINTAAN
// ==========================================
function getRequestsData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.REQUESTS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const reqMap = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const noSurat = String(r[0] || '').trim();
    if (!noSurat) continue;

    let items = [];
    try { items = JSON.parse(r[9] || '[]'); } catch(e) {}

    let photos = [];
    try { photos = JSON.parse(r[10] || '[]'); } catch(e) {}

    let log = [];
    try { log = JSON.parse(r[12] || '[]'); } catch(e) {}

    reqMap.set(noSurat.toUpperCase(), {
      noSurat: noSurat,
      tanggal: String(r[1] || ''),
      toko: String(r[2] || ''),
      area: String(r[3] || ''),
      jenis: String(r[4] || ''),
      status: String(r[5] || 'PENDING'),
      serviceApprove: r[6] === true || String(r[6]).toUpperCase() === 'TRUE',
      createdBy: String(r[7] || ''),
      userId: String(r[8] || ''),
      items: items,
      photos: photos,
      catatan: String(r[11] || ''),
      log: log,
      createdAt: String(r[13] || '')
    });
  }
  return Array.from(reqMap.values());
}

function saveSingleRequest(req) {
  if (!req || !req.noSurat) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.REQUESTS);
  const data = sheet.getDataRange().getValues();
  const targetNoSurat = String(req.noSurat).trim().toUpperCase();

  const rowValues = [
    req.noSurat,
    req.tanggal || '',
    req.toko || '',
    req.area || '',
    req.jenis || '',
    req.status || 'PENDING',
    req.serviceApprove ? 'TRUE' : 'FALSE',
    req.createdBy || '',
    req.userId || '',
    JSON.stringify(req.items || []),
    JSON.stringify(req.photos || []),
    req.catatan || '',
    JSON.stringify(req.log || []),
    req.createdAt || new Date().toISOString()
  ];

  let foundRow = -1;
  const duplicateRows = [];
  let lastFilledRow = 1;

  for (let i = 1; i < data.length; i++) {
    const colVal = String(data[i][0] || '').trim().toUpperCase();
    if (colVal) {
      lastFilledRow = i + 1;
      if (colVal === targetNoSurat) {
        if (foundRow === -1) {
          foundRow = i + 1;
        } else {
          duplicateRows.push(i + 1);
        }
      }
    }
  }

  if (foundRow !== -1) {
    // Mode edit / update status: perbarui baris spesifik yang cocok
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    // Bersihkan baris duplikat lama jika ada
    for (let d = duplicateRows.length - 1; d >= 0; d--) {
      sheet.deleteRow(duplicateRows[d]);
    }
  } else {
    // DATA BARU: DITULIS KE BARIS KOSONG BERIKUTNYA KE BAWAH (MENERUSKAN KE BAWAH)
    const targetRow = lastFilledRow + 1;
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  SpreadsheetApp.flush();
}

function saveBulkRequests(reqList) {
  if (!Array.isArray(reqList) || reqList.length === 0) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.REQUESTS);
  const existingData = sheet.getDataRange().getValues();

  const existingMap = new Map();
  const duplicateRows = [];

  for (let i = 1; i < existingData.length; i++) {
    const ns = String(existingData[i][0] || '').trim().toUpperCase();
    if (ns) {
      if (!existingMap.has(ns)) {
        existingMap.set(ns, i + 1);
      } else {
        duplicateRows.push(i + 1);
      }
    }
  }

  for (let d = duplicateRows.length - 1; d >= 0; d--) {
    sheet.deleteRow(duplicateRows[d]);
  }

  const refreshedData = sheet.getDataRange().getValues();
  const refreshedMap = new Map();
  let currentLastRow = 1;

  for (let i = 1; i < refreshedData.length; i++) {
    const ns = String(refreshedData[i][0] || '').trim().toUpperCase();
    if (ns) {
      currentLastRow = i + 1;
      refreshedMap.set(ns, i + 1);
    }
  }

  const processedKeys = new Set();

  reqList.forEach(req => {
    if (!req || !req.noSurat) return;
    const targetNoSurat = String(req.noSurat).trim().toUpperCase();
    if (processedKeys.has(targetNoSurat)) return;
    processedKeys.add(targetNoSurat);

    const rowValues = [
      req.noSurat,
      req.tanggal || '',
      req.toko || '',
      req.area || '',
      req.jenis || '',
      req.status || 'PENDING',
      req.serviceApprove ? 'TRUE' : 'FALSE',
      req.createdBy || '',
      req.userId || '',
      JSON.stringify(req.items || []),
      JSON.stringify(req.photos || []),
      req.catatan || '',
      JSON.stringify(req.log || []),
      req.createdAt || new Date().toISOString()
    ];

    if (refreshedMap.has(targetNoSurat)) {
      const rowIdx = refreshedMap.get(targetNoSurat);
      sheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // DATA BARU: DITULIS KE BARIS BERIKUTNYA KE BAWAH
      currentLastRow++;
      sheet.getRange(currentLastRow, 1, 1, rowValues.length).setValues([rowValues]);
      refreshedMap.set(targetNoSurat, currentLastRow);
    }
  });

  SpreadsheetApp.flush();
}

function deleteSingleRequest(noSurat) {
  if (!noSurat) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.REQUESTS);
  const data = sheet.getDataRange().getValues();
  const target = String(noSurat).trim().toUpperCase();

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0] || '').trim().toUpperCase() === target) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

function deleteBulkRequests(noSuratList) {
  if (!Array.isArray(noSuratList) || noSuratList.length === 0) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.REQUESTS);
  const data = sheet.getDataRange().getValues();
  const targets = new Set(noSuratList.map(n => String(n).trim().toUpperCase()));

  for (let i = data.length - 1; i >= 1; i--) {
    if (targets.has(String(data[i][0] || '').trim().toUpperCase())) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

// ==========================================
// OPERASI DATA SHEET: USERS
// ==========================================
function getUsersData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const userMap = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const username = String(r[1] || '').trim();
    if (!username) continue;

    userMap.set(username.toUpperCase(), {
      id: String(r[0] || `USR-${Date.now()}-${i}`),
      username: username,
      password: String(r[2] || '123'),
      fullName: String(r[3] || username),
      storeCode: String(r[4] || ''),
      phone: String(r[5] || ''),
      category: String(r[6] || 'TOKO').toUpperCase(),
      area: String(r[7] || 'BDG').toUpperCase(),
      createdAt: String(r[8] || '')
    });
  }
  return Array.from(userMap.values());
}

function saveSingleUser(user) {
  if (!user || !user.username) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const targetUsername = String(user.username).trim().toUpperCase();
  const targetId = user.id ? String(user.id).trim().toUpperCase() : '';

  const rowValues = [
    user.id || `USR-${Date.now()}`,
    user.username,
    user.password || '123',
    user.fullName || user.username,
    user.storeCode || '',
    user.phone || '',
    user.category || 'TOKO',
    user.area || 'BDG',
    user.createdAt || new Date().toISOString()
  ];

  let foundRow = -1;
  const duplicateRows = [];
  let lastFilledRow = 1;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0] || '').trim().toUpperCase();
    const rowUser = String(data[i][1] || '').trim().toUpperCase();
    if (rowUser || rowId) {
      lastFilledRow = i + 1;
      if (rowUser === targetUsername || (targetId && rowId === targetId)) {
        if (foundRow === -1) {
          foundRow = i + 1;
        } else {
          duplicateRows.push(i + 1);
        }
      }
    }
  }

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    for (let d = duplicateRows.length - 1; d >= 0; d--) {
      sheet.deleteRow(duplicateRows[d]);
    }
  } else {
    // DATA BARU: DITULIS KE BARIS KOSONG BERIKUTNYA KE BAWAH
    const targetRow = lastFilledRow + 1;
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  SpreadsheetApp.flush();
}

function saveBulkUsers(userList) {
  if (!Array.isArray(userList) || userList.length === 0) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  const existingData = sheet.getDataRange().getValues();

  const existingMap = new Map();
  const duplicateRows = [];

  for (let i = 1; i < existingData.length; i++) {
    const uName = String(existingData[i][1] || '').trim().toUpperCase();
    if (uName) {
      if (!existingMap.has(uName)) {
        existingMap.set(uName, i + 1);
      } else {
        duplicateRows.push(i + 1);
      }
    }
  }

  for (let d = duplicateRows.length - 1; d >= 0; d--) {
    sheet.deleteRow(duplicateRows[d]);
  }

  const refreshedData = sheet.getDataRange().getValues();
  const refreshedMap = new Map();
  let currentLastRow = 1;

  for (let i = 1; i < refreshedData.length; i++) {
    const uName = String(refreshedData[i][1] || '').trim().toUpperCase();
    if (uName) {
      currentLastRow = i + 1;
      refreshedMap.set(uName, i + 1);
    }
  }

  const processedKeys = new Set();

  userList.forEach(u => {
    if (!u || !u.username) return;
    const targetUser = String(u.username).trim().toUpperCase();
    if (processedKeys.has(targetUser)) return;
    processedKeys.add(targetUser);

    const rowValues = [
      u.id || `USR-${Date.now()}`,
      u.username,
      u.password || '123',
      u.fullName || u.username,
      u.storeCode || '',
      u.phone || '',
      u.category || 'TOKO',
      u.area || 'BDG',
      u.createdAt || new Date().toISOString()
    ];

    if (refreshedMap.has(targetUser)) {
      const rowIdx = refreshedMap.get(targetUser);
      sheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // DATA BARU: DITULIS KE BARIS BERIKUTNYA KE BAWAH
      currentLastRow++;
      sheet.getRange(currentLastRow, 1, 1, rowValues.length).setValues([rowValues]);
      refreshedMap.set(targetUser, currentLastRow);
    }
  });

  SpreadsheetApp.flush();
}

function deleteSingleUser(userId, username) {
  const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const targetId = userId ? String(userId).trim().toUpperCase() : '';
  const targetUser = username ? String(username).trim().toUpperCase() : '';

  for (let i = data.length - 1; i >= 1; i--) {
    const rowId = String(data[i][0] || '').trim().toUpperCase();
    const rowUser = String(data[i][1] || '').trim().toUpperCase();
    if ((targetId && rowId === targetId) || (targetUser && rowUser === targetUser)) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

function deleteBulkUsers(userIds, usernames) {
  const sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const targetIdSet = new Set((userIds || []).map(id => String(id).trim().toUpperCase()));
  const targetUserSet = new Set((usernames || []).map(u => String(u).trim().toUpperCase()));

  for (let i = data.length - 1; i >= 1; i--) {
    const rowId = String(data[i][0] || '').trim().toUpperCase();
    const rowUser = String(data[i][1] || '').trim().toUpperCase();
    if (targetIdSet.has(rowId) || targetUserSet.has(rowUser)) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

// ==========================================
// OPERASI DATA SHEET: TOKO
// ==========================================
function getStoresData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.STORES);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const storeMap = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[1] || '').trim();
    const area = String(r[2] || 'BDG').trim().toUpperCase();
    if (!name) continue;

    const key = `${name.toUpperCase()}_${area}`;
    storeMap.set(key, {
      id: String(r[0] || `STK-${Date.now()}-${i}`),
      fullName: name,
      area: area,
      storeCode: String(r[3] || ''),
      createdBy: String(r[4] || 'ADMIN')
    });
  }
  return Array.from(storeMap.values());
}

function saveSingleStore(store) {
  if (!store || !store.fullName) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.STORES);
  const data = sheet.getDataRange().getValues();
  const targetName = String(store.fullName).trim().toUpperCase();
  const targetArea = String(store.area || '').trim().toUpperCase();

  const rowValues = [
    store.id || `STK-${Date.now()}`,
    store.fullName,
    store.area || 'BDG',
    store.storeCode || '',
    store.createdBy || 'ADMIN'
  ];

  let foundRow = -1;
  const duplicateRows = [];
  let lastFilledRow = 1;

  for (let i = 1; i < data.length; i++) {
    const rowName = String(data[i][1] || '').trim().toUpperCase();
    const rowArea = String(data[i][2] || '').trim().toUpperCase();
    if (rowName) {
      lastFilledRow = i + 1;
      if (rowName === targetName && (!targetArea || rowArea === targetArea)) {
        if (foundRow === -1) {
          foundRow = i + 1;
        } else {
          duplicateRows.push(i + 1);
        }
      }
    }
  }

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    for (let d = duplicateRows.length - 1; d >= 0; d--) {
      sheet.deleteRow(duplicateRows[d]);
    }
  } else {
    // DATA BARU: DITULIS KE BARIS KOSONG BERIKUTNYA KE BAWAH
    const targetRow = lastFilledRow + 1;
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  SpreadsheetApp.flush();
}

function saveBulkStores(storeList) {
  if (!Array.isArray(storeList) || storeList.length === 0) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.STORES);
  const existingData = sheet.getDataRange().getValues();

  const existingMap = new Map();
  const duplicateRows = [];

  for (let i = 1; i < existingData.length; i++) {
    const name = String(existingData[i][1] || '').trim().toUpperCase();
    const area = String(existingData[i][2] || 'BDG').trim().toUpperCase();
    if (name) {
      const key = `${name}_${area}`;
      if (!existingMap.has(key)) {
        existingMap.set(key, i + 1);
      } else {
        duplicateRows.push(i + 1);
      }
    }
  }

  for (let d = duplicateRows.length - 1; d >= 0; d--) {
    sheet.deleteRow(duplicateRows[d]);
  }

  const refreshedData = sheet.getDataRange().getValues();
  const refreshedMap = new Map();
  let currentLastRow = 1;

  for (let i = 1; i < refreshedData.length; i++) {
    const name = String(refreshedData[i][1] || '').trim().toUpperCase();
    const area = String(refreshedData[i][2] || 'BDG').trim().toUpperCase();
    if (name) {
      currentLastRow = i + 1;
      refreshedMap.set(`${name}_${area}`, i + 1);
    }
  }

  const processedKeys = new Set();

  storeList.forEach(s => {
    if (!s || !s.fullName) return;
    const key = `${String(s.fullName).trim().toUpperCase()}_${String(s.area || 'BDG').trim().toUpperCase()}`;
    if (processedKeys.has(key)) return;
    processedKeys.add(key);

    const rowValues = [
      s.id || `STK-${Date.now()}`,
      s.fullName,
      s.area || 'BDG',
      s.storeCode || '',
      s.createdBy || 'ADMIN'
    ];

    if (refreshedMap.has(key)) {
      const rowIdx = refreshedMap.get(key);
      sheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // DATA BARU: DITULIS KE BARIS BERIKUTNYA KE BAWAH
      currentLastRow++;
      sheet.getRange(currentLastRow, 1, 1, rowValues.length).setValues([rowValues]);
      refreshedMap.set(key, currentLastRow);
    }
  });

  SpreadsheetApp.flush();
}

function deleteSingleStore(storeId, storeName) {
  const sheet = getOrCreateSheet(SHEET_NAMES.STORES);
  const data = sheet.getDataRange().getValues();
  const targetId = storeId ? String(storeId).trim().toUpperCase() : '';
  const targetName = storeName ? String(storeName).trim().toUpperCase() : '';

  for (let i = data.length - 1; i >= 1; i--) {
    const rowId = String(data[i][0]).trim().toUpperCase();
    const rowName = String(data[i][1]).trim().toUpperCase();
    if ((targetId && rowId === targetId) || (targetName && rowName === targetName)) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

function deleteBulkStores(storeIds, storeNames) {
  const sheet = getOrCreateSheet(SHEET_NAMES.STORES);
  const data = sheet.getDataRange().getValues();
  const targetIdSet = new Set((storeIds || []).map(id => String(id).trim().toUpperCase()));
  const targetNameSet = new Set((storeNames || []).map(n => String(n).trim().toUpperCase()));

  for (let i = data.length - 1; i >= 1; i--) {
    const rowId = String(data[i][0]).trim().toUpperCase();
    const rowName = String(data[i][1]).trim().toUpperCase();
    if (targetIdSet.has(rowId) || targetNameSet.has(rowName)) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

// ==========================================
// OPERASI DATA SHEET: TTD
// ==========================================
function getTTDData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.TTD);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {};

  const ttdMap = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const key = String(r[1] || r[0]).toUpperCase();
    if (key && r[2]) {
      ttdMap[key] = String(r[2]);
    }
  }
  return ttdMap;
}

function saveSingleTTD(userId, username, ttdData) {
  if (!ttdData || (!userId && !username)) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.TTD);
  const data = sheet.getDataRange().getValues();
  const targetKey = String(username || userId).trim().toUpperCase();

  const rowValues = [
    userId || '',
    username || '',
    ttdData,
    new Date().toISOString()
  ];

  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    const rUser = String(data[i][1] || data[i][0]).trim().toUpperCase();
    if (rUser === targetKey) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function saveBulkTTD(ttdObj) {
  if (!ttdObj || typeof ttdObj !== 'object') return;
  const sheet = getOrCreateSheet(SHEET_NAMES.TTD);
  sheet.clearContents();
  initSheetHeader(sheet, SHEET_NAMES.TTD);

  const keys = Object.keys(ttdObj);
  if (keys.length === 0) return;

  const rows = keys.map(k => [
    '',
    k,
    ttdObj[k],
    new Date().toISOString()
  ]);

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

// ==========================================
// OPERASI DATA SHEET: SETTINGS
// ==========================================
function getSettingsData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.SETTINGS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {};

  const settingsMap = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const key = String(r[0]).trim();
    if (key) {
      let val = r[1];
      if (val instanceof Date) {
        const hrs = String(val.getHours()).padStart(2, '0');
        const mins = String(val.getMinutes()).padStart(2, '0');
        val = `${hrs}:${mins}`;
      } else {
        val = String(val !== undefined && val !== null ? val : '');
      }
      settingsMap[key] = val;
    }
  }
  return settingsMap;
}

function saveSingleSetting(key, val) {
  if (!key) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const targetKey = String(key).trim();
  const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);

  const rowValues = [targetKey, valStr, new Date().toISOString()];

  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetKey) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function saveBulkSettings(settingsObj) {
  if (!settingsObj || typeof settingsObj !== 'object') return;
  const sheet = getOrCreateSheet(SHEET_NAMES.SETTINGS);
  sheet.clearContents();
  initSheetHeader(sheet, SHEET_NAMES.SETTINGS);

  const keys = Object.keys(settingsObj);
  if (keys.length === 0) return;

  const rows = keys.map(k => [
    k,
    typeof settingsObj[k] === 'object' ? JSON.stringify(settingsObj[k]) : String(settingsObj[k]),
    new Date().toISOString()
  ]);

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

// ==========================================
// OPERASI DATA SHEET: CHAT
// ==========================================
function getChatData() {
  const sheet = getOrCreateSheet(SHEET_NAMES.CHAT);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const chatList = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[4]) continue;

    chatList.push({
      id: String(r[0] || `MSG-${i}`),
      roomId: String(r[1] || 'GLOBAL'),
      senderUsername: String(r[2] || ''),
      senderName: String(r[3] || ''),
      message: String(r[4] || ''),
      timestamp: Number(r[5] || Date.now()),
      createdAt: String(r[6] || '')
    });
  }
  return chatList;
}

function saveSingleChatMessage(msg) {
  if (!msg || !msg.message) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.CHAT);
  sheet.appendRow([
    msg.id || `MSG-${Date.now()}`,
    msg.roomId || 'GLOBAL',
    msg.senderUsername || '',
    msg.senderName || '',
    msg.message,
    msg.timestamp || Date.now(),
    new Date().toISOString()
  ]);
}

function deleteSingleChatRoom(roomId) {
  if (!roomId) return;
  const sheet = getOrCreateSheet(SHEET_NAMES.CHAT);
  const data = sheet.getDataRange().getValues();
  const targetRoom = String(roomId).trim().toUpperCase();

  for (let i = data.length - 1; i >= 1; i--) {
    const rRoom = String(data[i][1]).trim().toUpperCase();
    if (rRoom === targetRoom) {
      sheet.deleteRow(i + 1);
    }
  }
}
