// 1. SUPABASE CLIENT & CREDENTIALS
const SUPABASE_URL = 'https://vnlylgbkjmztnvjjgpjw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_C7-RE-meqDyD8iXvp4COew_9Yhn8SWS';
const SUPABASE_SECRET_KEY = 'sb_secret_9pTnKospBREpQH-QFngvnA_01fidjs7';
const SUPABASE_JWKS_URL = 'https://vnlylgbkjmztnvjjgpjw.supabase.co/auth/v1/.well-known/jwks.json';

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

window.isFirebaseOnline = true;
window.isSupabaseOnline = true;

function updateGlobalConnectionDotStatus() {
  const dot = document.getElementById('firebaseOnlineDot');
  if (!dot) return;

  const fb = !!window.isFirebaseOnline;
  const sb = !!window.isSupabaseOnline;

  if (fb && sb) {
    dot.style.background = '#10b981';
    dot.style.boxShadow = '0 0 10px #10b981';
    dot.title = 'STATUS KONEKSI SISTEM: ONLINE TERHUBUNG (HIJAU)';
    dot.onclick = () => showNotif('STATUS KONEKSI SISTEM: ONLINE TERHUBUNG SANGAT BAIK (HIJAU)', 'success');
  } else if (fb && !sb) {
    dot.style.background = '#f59e0b';
    dot.style.boxShadow = '0 0 10px #f59e0b';
    dot.title = 'STATUS KONEKSI SISTEM: KONEKSI STABIL (ORANGE)';
    dot.onclick = () => showNotif('STATUS KONEKSI SISTEM: TERHUBUNG KONEKSI UTAMA (ORANGE)', 'warning');
  } else if (!fb && sb) {
    dot.style.background = '#f59e0b';
    dot.style.boxShadow = '0 0 10px #f59e0b';
    dot.title = 'STATUS KONEKSI SISTEM: KONEKSI CADANGAN (ORANGE)';
    dot.onclick = () => showNotif('STATUS KONEKSI SISTEM: TERHUBUNG KONEKSI CADANGAN (ORANGE)', 'warning');
  } else {
    dot.style.background = '#ef4444';
    dot.style.boxShadow = '0 0 10px #ef4444';
    dot.title = 'STATUS KONEKSI SISTEM: OFFLINE / TERPUTUS (MERAH)';
    dot.onclick = () => showNotif('STATUS KONEKSI SISTEM: OFFLINE / TERPUTUS (MERAH)', 'error');
  }
}
window.updateGlobalConnectionDotStatus = updateGlobalConnectionDotStatus;

// PARSE PHOTOS HELPER FUNCTION (HANDLES ARRAYS, JSON STRINGS, SINGLE URLS)
function parsePhotosArray(rawPhotos) {
  if (!rawPhotos) return [];
  if (Array.isArray(rawPhotos)) {
    return rawPhotos.map(p => typeof p === 'string' ? p.trim() : (p ? String(p) : '')).filter(p => p.length > 0);
  }
  if (typeof rawPhotos === 'string') {
    const trimmed = rawPhotos.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(p => typeof p === 'string' ? p.trim() : (p ? String(p) : '')).filter(p => p.length > 0);
        }
      } catch (e) {}
    }
    if (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
      return [trimmed];
    }
  }
  return [];
}
window.parsePhotosArray = parsePhotosArray;

// CLEAN KEEP-ALIVE PING (PREVENTS 404 & 401 CONSOLE ERRORS)
async function pingSupabaseKeepAlive() {
  if (supabase) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY }
      });
      window.isSupabaseOnline = (res.ok || res.status === 200);
    } catch (e) {
      window.isSupabaseOnline = false;
    }
  } else {
    window.isSupabaseOnline = false;
  }
  updateGlobalConnectionDotStatus();
}
try {
  pingSupabaseKeepAlive();
} catch (e) {}

// FIREBASE LIVE CONNECTION MONITOR
if (typeof firebase !== 'undefined' && firebase.database) {
  try {
    firebase.database().ref('.info/connected').on('value', (snap) => {
      window.isFirebaseOnline = (snap.val() === true);
      updateGlobalConnectionDotStatus();
    });
  } catch (e) {}
}

// STORAGE KEYS (V7_HARD_RESET_CLEAN)
const USERS_DB_KEY = 'STORE_USERS_DB_V7_CLEAN';
const REQUESTS_DB_KEY = 'STORE_REQUESTS_DB_V7_CLEAN';
const CHAT_DB_KEY = 'STORE_CHAT_DB_V7_CLEAN';
const CHAT_MESSAGES_KEY = 'STORE_CHAT_MESSAGES_V7_CLEAN';
const CHAT_ROOM_DB_KEY = 'STORE_CHAT_ROOM_DB_V7_CLEAN';
const TTD_DB_KEY = 'STORE_TTD_DB_V7_CLEAN';
const SESSION_KEY = 'STORE_ACTIVE_SESSION_V7_CLEAN';
const THEME_KEY = 'STORE_ACTIVE_THEME_V7_CLEAN';
const DESIGN_MODE_KEY = 'STORE_DESIGN_MODE_V7_CLEAN';

// NORMAL DESIGN MODE ONLY
const DESIGN_MODES = [
  { id: 'normal', btnName: 'DESAIN: NORMAL', name: 'DESAIN NORMAL' }
];

function getSavedDesignMode() {
  return 'normal';
}

function updateBodyClasses(specificTheme) {
  const savedTheme = specificTheme || (typeof localStorage !== 'undefined' ? localStorage.getItem('APP_SELECTED_THEME') : null) || (typeof appStorage !== 'undefined' ? appStorage.getItem(THEME_KEY) : null) || 'dark-mode';
  
  const allThemes = ['dark-mode', 'light-mode', 'classic-mode', 'neon-mode', 'forest-mode', 'sunset-mode', 'ocean-mode', 'coffee-mode', 'purple-mode', 'crimson-mode'];
  
  allThemes.forEach(t => {
    document.body.classList.remove(t);
    document.documentElement.classList.remove(t);
  });
  
  document.body.classList.remove('design-mode-normal', 'design-mode-3d-kayu-gold', 'design-mode-3d-emerald-glass', 'design-mode-3d-stealth-black', 'design-mode-3d-neumorphism', 'design-mode-3d-glassmorphism', 'design-mode-3d-embossed', 'design-mode-3d-isometric');
  document.body.style.background = '';
  document.body.style.color = '';

  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);
  document.body.classList.add(savedTheme);
  document.body.classList.add('design-mode-normal');

  if (typeof THEME_MODES !== 'undefined' && Array.isArray(THEME_MODES)) {
    const idx = THEME_MODES.findIndex(t => t.id === savedTheme);
    currentThemeIndex = idx !== -1 ? idx : 0;
  }
  if (typeof updateThemeIcon === 'function') {
    updateThemeIcon();
  }
}
window.updateBodyClasses = updateBodyClasses;
window.applyThemeToDocument = updateBodyClasses;

function loadSavedDesignMode() {
  updateBodyClasses();
}

function toggleDesignMode() {
  const currentMode = getSavedDesignMode();
  const currentIndex = DESIGN_MODES.findIndex(m => m.id === currentMode);
  const nextIndex = (currentIndex + 1) % DESIGN_MODES.length;
  const nextMode = DESIGN_MODES[nextIndex].id;
  gantiDesignMode(nextMode, true);
}

function updateDesignModeButtonUI(mode) {
  const btnText = document.getElementById('designModeBtnText');
  const headerBtnText = document.getElementById('headerDesignModeText');
  const found = DESIGN_MODES.find(m => m.id === mode) || DESIGN_MODES[0];
  if (btnText) {
    btnText.textContent = found.btnName;
  }
  if (headerBtnText) {
    headerBtnText.textContent = found.btnName;
  }
}

function gantiDesignMode(newMode, userInitiated = true) {
  if (!newMode || !DESIGN_MODES.some(m => m.id === newMode)) {
    newMode = 'normal';
  }

  appStorage.setItem(DESIGN_MODE_KEY, newMode);
  updateBodyClasses();

  const found = DESIGN_MODES.find(m => m.id === newMode) || DESIGN_MODES[0];

  if (userInitiated) {
    if (typeof showNotif === 'function') {
      showNotif(`MODE DESAIN DIUBAH KE: ${found.name.toUpperCase()}`, 'success');
    }

    if (currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'))) {
      if (typeof pushCentralCloudDB === 'function') {
        try { pushCentralCloudDB(); } catch(e) {}
      }
    }
  }
}
window.getSavedDesignMode = getSavedDesignMode;
window.loadSavedDesignMode = loadSavedDesignMode;
window.gantiDesignMode = gantiDesignMode;
window.toggleDesignMode = toggleDesignMode;
window.updateBodyClasses = updateBodyClasses;
const STORES_DB_KEY = 'STORE_CUSTOM_TOKO_LIST_V7_CLEAN';
const DELETED_STORES_KEY = 'STORE_DELETED_TOKO_LIST_V7_CLEAN';
const NOTIFICATIONS_DB_KEY = 'STORE_SYSTEM_NOTIFICATIONS_V7_CLEAN';
const KODE_UNIT_MAP_KEY = 'STORE_KODE_UNIT_MAP_V7_CLEAN';
const FEATURE_PHOTOS_KEY = 'STORE_FEATURE_PHOTOS_V7_CLEAN';
const DELETED_REQUESTS_KEY = 'STORE_DELETED_REQUESTS_V7_CLEAN';
const DELETED_USERS_KEY = 'STORE_DELETED_USERS_V7_CLEAN';
const FONTE_TOKEN_KEY = 'STORE_FONTE_TOKEN_KEY_V7_CLEAN';
const ADMIN_REMINDER_KEY = 'STORE_ADMIN_REMINDER_KEY_V7_CLEAN';
const ADMIN_SECRET_KEY_STORAGE_KEY = 'STORE_ADMIN_SECRET_KEY_V7_CLEAN';
const ADMIN_SCRIPT_URL_KEY = 'STORE_ADMIN_SCRIPT_URL_V7_CLEAN';
const FIREBASE_USER_CONFIG_KEY = 'STORE_FIREBASE_USER_CONFIG_V7_CLEAN';
const GLOBAL_THEME_KEY = 'STORE_GLOBAL_APP_THEME_V7_CLEAN';
const LOCAL_USER_THEME_KEY = 'STORE_LOCAL_USER_THEME_V7_CLEAN';
const LAST_ADMIN_THEME_TIME_KEY = 'STORE_LAST_ADMIN_THEME_TIME_V7_CLEAN';

function getActiveAppliedTheme() {
  const localUserTheme = (typeof appStorage !== 'undefined' ? appStorage.getItem(LOCAL_USER_THEME_KEY) : null);
  const globalTheme = (typeof appStorage !== 'undefined' ? appStorage.getItem(GLOBAL_THEME_KEY) : null);
  return localUserTheme || globalTheme || 'light';
}

function applyThemeToDocument(theme) {
  const t = theme || getActiveAppliedTheme();
  document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-theme', t);

  if (t === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  }
}
window.applyThemeToDocument = applyThemeToDocument;

async function setGlobalAdminTheme(themeName) {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  const now = Date.now();

  if (typeof appStorage !== 'undefined') {
    appStorage.setItem(GLOBAL_THEME_KEY, themeName);
    appStorage.setItem(LOCAL_USER_THEME_KEY, themeName);
    appStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, String(now));
  }
  try { localStorage.setItem(GLOBAL_THEME_KEY, themeName); } catch(e) {}
  try { localStorage.setItem(LOCAL_USER_THEME_KEY, themeName); } catch(e) {}
  try { localStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, String(now)); } catch(e) {}
  applyThemeToDocument(themeName);

  if (isSysAdmin) {
    if (typeof supabase !== 'undefined' && supabase) {
      try {
        try {
          await supabase.from('lookup').upsert({
            code: 'GLOBAL_THEME',
            type: themeName,
            updated_at: new Date().toISOString()
          });
        } catch (e) {}

        const themeRow = {
          id: '__SYSTEM_GLOBAL_THEME__',
          no_surat: '__SYSTEM_GLOBAL_THEME__',
          tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
          toko: 'SYSTEM',
          area: 'ALL',
          jenis: 'SYSTEM',
          catatan: JSON.stringify({ theme: themeName, updatedBy: currentUser.username, time: now }),
          items: [],
          photos: [],
          status: 'DONE',
          service_approve: true,
          created_by: 'ADMIN',
          created_at: new Date().toISOString()
        };
        await supabase.from('permintaan_toko').upsert(themeRow);
      } catch(e) {
        console.warn('[SUPABASE GLOBAL THEME SAVE ERROR]:', e);
      }
    }

    if (typeof dbRealtime !== 'undefined' && dbRealtime) {
      try {
        dbRealtime.ref('settings/global_theme').set({ theme: themeName, updatedBy: currentUser.username, time: now });
      } catch(e) {}
    }

    // Theme notification silent
  } else {
    // Theme notification silent
  }
}
window.setGlobalAdminTheme = setGlobalAdminTheme;

function toggleTheme() {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  const currentTheme = getActiveAppliedTheme();
  const newTheme = (currentTheme === 'light') ? 'dark' : 'light';

  if (isSysAdmin) {
    // ADMIN: CHANGE THEME FOR ALL DEVICES GLOBALLY
    setGlobalAdminTheme(newTheme);
  } else {
    // NON-ADMIN USER: SAVE & APPLY THEME PREFERENCE ON LOCAL DEVICE ONLY
    if (typeof appStorage !== 'undefined') {
      appStorage.setItem(LOCAL_USER_THEME_KEY, newTheme);
    }
    try { localStorage.setItem(LOCAL_USER_THEME_KEY, newTheme); } catch(e) {}
    applyThemeToDocument(newTheme);
    // Theme notification silent
  }
}
window.toggleTheme = toggleTheme;

try {
  applyThemeToDocument();
} catch(e) {}

if (!window.appStorage) {
  const fallbackMemory = {};
  window.appStorage = {
    getItem(key) {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      } catch (e) {}
      return Object.prototype.hasOwnProperty.call(fallbackMemory, key) ? String(fallbackMemory[key]) : null;
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, String(value));
      } catch (e) {}
      fallbackMemory[key] = String(value);
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      delete fallbackMemory[key];
    },
    clear() {
      try {
        localStorage.clear();
      } catch (e) {}
      Object.keys(fallbackMemory).forEach(key => delete fallbackMemory[key]);
    }
  };
}

function getSavedAdminSecretKey() {
  return (appStorage.getItem(ADMIN_SECRET_KEY_STORAGE_KEY) || '').trim();
}

function saveAdminSecretKey(secretKey) {
  const cleanKey = (secretKey || '').trim();
  if (cleanKey) {
    appStorage.setItem(ADMIN_SECRET_KEY_STORAGE_KEY, cleanKey);
  } else {
    appStorage.removeItem(ADMIN_SECRET_KEY_STORAGE_KEY);
  }
}

function loadSavedAdminSecretKey() {
  const input = document.getElementById('adminSecretKeySettingInput');
  if (input) {
    input.value = getSavedAdminSecretKey();
  }
}

function simpanAdminSecretKey() {
  const input = document.getElementById('adminSecretKeySettingInput');
  const value = input ? input.value.trim() : '';
  saveAdminSecretKey(value);
  showNotif(value ? 'SECRET KEY SUPABASE BERHASIL DISIMPAN!' : 'SECRET KEY SUPABASE DIHAPUS!', 'info');
}

function getSystemNotifications() {
  const raw = appStorage.getItem(NOTIFICATIONS_DB_KEY) || '[]';
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) return parsed.items;
  } catch(e) {}
  return [];
}

function getSystemNotifsClearedTimestamp() {
  const raw = appStorage.getItem(NOTIFICATIONS_DB_KEY) || '[]';
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.clearedAt) return Number(parsed.clearedAt) || 0;
  } catch(e) {}
  return 0;
}

function shouldEmitImportantNotification(targetRoles, targetArea, message, noSurat = '') {
  const normalized = String(message || '').trim();
  if (!normalized) return false;

  const importantPatterns = [
    'PERMINTAAN BARU',
    'DISETUJUI SERVICE',
    'DISETUJUI DM',
    'TELAH DISETUJUI DM',
    'APPROVAL DM',
    'MOHON APPROVAL DM',
    'DITOLAK DM',
    'DITOLAK SERVICE',
    'DITOLAK',
    'SELESAI (DONE)',
    'REMINDER PENDING'
  ];

  const containsImportant = importantPatterns.some(pattern => normalized.toUpperCase().includes(pattern));
  if (!containsImportant) return false;

  const noSuratKey = String(noSurat || '').trim();
  if (noSuratKey && noSuratKey.startsWith('PRMT/')) {
    return true;
  }

  return true;
}

function tambahNotifikasiSistem(targetRoles, targetArea, message, noSurat = '') {
  if (!shouldEmitImportantNotification(targetRoles, targetArea, message, noSurat)) {
    return;
  }

  const notifs = getSystemNotifications();
  const clearedAt = getSystemNotifsClearedTimestamp();
  const normalizedRoles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
  const dedupeKey = `${String(noSurat || '').trim()}|${String(targetArea || 'ALL')}|${String(message || '').trim()}`;
  const alreadyExists = notifs.some(n => {
    const nKey = `${String(n.noSurat || '').trim()}|${String(n.targetArea || 'ALL')}|${String(n.message || '').trim()}`;
    return nKey === dedupeKey;
  });

  if (alreadyExists) return;

  const newNotif = {
    id: `NTF-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    targetRoles: normalizedRoles,
    targetArea: targetArea || 'ALL',
    message: message,
    noSurat: noSurat,
    time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}`,
    readBy: []
  };
  notifs.unshift(newNotif);
  if (notifs.length > 100) notifs.pop();
  
  const payload = clearedAt ? { clearedAt, items: notifs } : notifs;
  appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload));
  try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload)); } catch(e) {}

  if (typeof supabase !== 'undefined' && supabase) {
    try {
      supabase.from('notifications').upsert({
        id: newNotif.id,
        target_roles: newNotif.targetRoles,
        target_area: newNotif.targetArea,
        message: newNotif.message,
        no_surat: newNotif.noSurat,
        time: newNotif.time,
        read_by: newNotif.readBy || []
      }).catch(e => console.warn('[SUPABASE NOTIF TABLE NOTICE]:', e));

      const systemNotifRow = {
        id: '__SYSTEM_NOTIFICATIONS__',
        no_surat: '__SYSTEM_NOTIFICATIONS__',
        tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
        toko: 'SYSTEM',
        area: 'ALL',
        jenis: 'SYSTEM',
        catatan: JSON.stringify(payload),
        items: [],
        photos: [],
        status: 'DONE',
        service_approve: true,
        created_by: 'SYSTEM',
        created_at: new Date().toISOString()
      };
      supabase.from('permintaan_toko').upsert(systemNotifRow).then(({ error }) => {
        if (error) console.warn('[SUPABASE NOTIF SAVE NOTICE]:', error.message);
      });
    } catch(e) {}
  }

  updateNotifBellCounter();
}

function getAccessibleNotifications() {
  if (!currentUser) return [];
  const notifs = (typeof getSystemNotifications === 'function' ? getSystemNotifications() : []) || [];
  const requests = (typeof getRequestsFromDB === 'function' ? getRequestsFromDB() : []) || [];
  const userCat = String(currentUser.category || '').toUpperCase();
  const userArea = String(currentUser.area || '').toUpperCase();
  const userUname = String(currentUser.username || '').toUpperCase();
  const userFullName = String(currentUser.fullName || '').toUpperCase();
  const isSysAdmin = userCat === 'ADMIN' || userUname === 'ADMIN';

  let filtered = notifs.filter(n => {
    if (!n) return false;

    if (isSysAdmin) return true;

    // 1. STRICT AREA FILTER: MUST MATCH USER'S AREA OR ALL (DM HANDLES ALL AREAS GLOBALLY)
    const targetArea = String(n.targetArea || 'ALL').toUpperCase();
    const areaMatch = (targetArea === 'ALL' || userArea === 'ALL' || userCat === 'DM' || isAreaMatch(userArea, targetArea));
    if (!areaMatch) return false;

    // 2. STRICT ROLE MATCH PER LOGIN CATEGORY
    const targetRoles = Array.isArray(n.targetRoles) ? n.targetRoles.map(r => String(r).toUpperCase()) : [];
    const roleMatch = (
      targetRoles.includes('ALL') ||
      targetRoles.includes(userCat) ||
      (userCat === 'DM' && targetRoles.includes('DM')) ||
      (userCat === 'SERVICE' && targetRoles.includes('SERVICE')) ||
      (userCat === 'TOKO' && targetRoles.includes('TOKO')) ||
      (userCat === 'SALES' && (targetRoles.includes('SALES') || targetRoles.includes('TOKO')))
    );
    if (!roleMatch) return false;

    // 3. STRICT CREATOR MATCH FOR TOKO / SALES USER
    if ((userCat === 'TOKO' || userCat === 'SALES') && n.noSurat && Array.isArray(requests)) {
      const req = requests.find(r => r && r.noSurat === n.noSurat);
      if (req) {
        const isMyRequest = (
          req.userId === currentUser.id ||
          String(req.createdBy || '').toUpperCase() === userUname ||
          String(req.createdBy || '').toUpperCase() === userFullName ||
          String(req.toko || '').toUpperCase() === userFullName
        );
        if (!isMyRequest) return false;
      }
    }

    return true;
  });

  const clearedAt = getSystemNotifsClearedTimestamp();

  // 4. DYNAMIC SYNTHESIS ACCORDING TO SPECIFIC ROLES & AREA
  // A. UNTUK SERVICE (PPRV SERVICE / PENDING - MENUNGGU APPROVAL SERVICE IN USER'S AREA)
  if (userCat === 'SERVICE' || isSysAdmin) {
    const servicePendingReqs = requests.filter(r => {
      if (clearedAt && r.createdAt) {
        const reqTime = new Date(r.createdAt).getTime();
        if (reqTime <= clearedAt) return false;
      }
      const areaMatched = (!r.area || userArea === 'ALL' || isSysAdmin || isAreaMatch(userArea, r.area));
      const isWaitingService = (!r.serviceApprove && r.status === 'PENDING');
      return areaMatched && isWaitingService;
    });

    servicePendingReqs.forEach(r => {
      const exists = filtered.some(n => n.noSurat === r.noSurat && String(n.message || '').includes('SERVICE'));
      if (!exists) {
        filtered.unshift({
          id: `NTF-SRV-${r.noSurat}`,
          targetRoles: ['SERVICE'],
          targetArea: r.area || userArea,
          message: `PERMINTAAN BARU #${r.noSurat} DARI ${r.toko}. MOHON APPROVAL SERVICE.`,
          noSurat: r.noSurat,
          time: r.tanggalInput || r.createdAt || getFormattedDateDDMMYYYY(),
          readBy: []
        });
      }
    });

    // A2. UNTUK SERVICE (NOTIFIKASI DARI DM KETIKA DI-APPROVE ATAU DI-TOLAK OLEH DM)
    const dmApprovedReqs = requests.filter(r => {
      if (clearedAt && r.createdAt) {
        const reqTime = new Date(r.createdAt).getTime();
        if (reqTime <= clearedAt) return false;
      }
      const areaMatched = (!r.area || userArea === 'ALL' || isSysAdmin || isAreaMatch(userArea, r.area));
      const isApprovedByDm = (r.serviceApprove === true && r.status === 'APPROVE');
      return areaMatched && isApprovedByDm;
    });

    dmApprovedReqs.forEach(r => {
      const exists = filtered.some(n => n.noSurat === r.noSurat && String(n.message || '').includes('DISETUJUI DM'));
      if (!exists) {
        filtered.unshift({
          id: `NTF-SRV-DM-APP-${r.noSurat}`,
          targetRoles: ['SERVICE'],
          targetArea: r.area || userArea,
          message: `PERMINTAAN #${r.noSurat} DARI ${r.toko} TELAH DISETUJUI DM. SILAKAN DIPROSES.`,
          noSurat: r.noSurat,
          time: r.tanggalInput || r.createdAt || getFormattedDateDDMMYYYY(),
          readBy: []
        });
      }
    });

    const dmRejectedReqs = requests.filter(r => {
      if (clearedAt && r.createdAt) {
        const reqTime = new Date(r.createdAt).getTime();
        if (reqTime <= clearedAt) return false;
      }
      const isAreaMatch = (!r.area || r.area.toUpperCase() === userArea || userArea === 'ALL' || isSysAdmin);
      const isRejectedByDm = (r.status === 'REJECT' && String(r.catatan || '').includes('DM'));
      return isAreaMatch && isRejectedByDm;
    });

    dmRejectedReqs.forEach(r => {
      const exists = filtered.some(n => n.noSurat === r.noSurat && String(n.message || '').includes('DITOLAK DM'));
      if (!exists) {
        filtered.unshift({
          id: `NTF-SRV-DM-REJ-${r.noSurat}`,
          targetRoles: ['SERVICE'],
          targetArea: r.area || userArea,
          message: `PERMINTAAN #${r.noSurat} DARI ${r.toko} DITOLAK DM. CATATAN: ${r.catatan || '-'}`,
          noSurat: r.noSurat,
          time: r.tanggalInput || r.createdAt || getFormattedDateDDMMYYYY(),
          readBy: []
        });
      }
    });
  }

  // B. UNTUK DM (TUNGGU DM - MENUNGGU APPROVAL DM DARI SEMUA AREA)
  if (userCat === 'DM' || isSysAdmin) {
    const dmPendingReqs = requests.filter(r => {
      if (clearedAt && r.createdAt) {
        const reqTime = new Date(r.createdAt).getTime();
        if (reqTime <= clearedAt) return false;
      }
      const isWaitingDm = (r.serviceApprove === true && r.status === 'PENDING');
      return isWaitingDm;
    });

    dmPendingReqs.forEach(r => {
      const exists = filtered.some(n => n.noSurat === r.noSurat && String(n.message || '').includes('DM'));
      if (!exists) {
        filtered.unshift({
          id: `NTF-DM-${r.noSurat}`,
          targetRoles: ['DM'],
          targetArea: 'ALL',
          message: `MOHON APPROVAL DM: Permintaan #${r.noSurat} dari ${r.toko} (${r.area}) telah disetujui Service & menanti Approval DM Anda.`,
          noSurat: r.noSurat,
          time: r.tanggalInput || r.createdAt || getFormattedDateDDMMYYYY(),
          readBy: []
        });
      }
    });
  }

  // C. UNTUK CREATOR / TOKO / SALES
  if (userCat === 'TOKO' || userCat === 'SALES') {
    const tokoPendingReqs = requests.filter(r => {
      if (clearedAt && r.createdAt) {
        const reqTime = new Date(r.createdAt).getTime();
        if (reqTime <= clearedAt) return false;
      }
      const isMine = (
        r.userId === currentUser.id ||
        String(r.createdBy || '').toUpperCase() === userUname ||
        String(r.createdBy || '').toUpperCase() === userFullName ||
        String(r.toko || '').toUpperCase() === userFullName
      );
      return isMine && r.status === 'PENDING';
    });

    tokoPendingReqs.forEach(r => {
      const exists = filtered.some(n => n.noSurat === r.noSurat);
      if (!exists) {
        const stageMsg = r.serviceApprove ? 'SEDANG MENUNGGU APPROVAL DM' : 'SEDANG MENUNGGU APPROVAL SERVICE';
        filtered.unshift({
          id: `NTF-TK-${r.noSurat}`,
          targetRoles: ['TOKO', 'SALES'],
          targetArea: r.area || userArea,
          message: `PERMINTAAN Anda #${r.noSurat} (${stageMsg}).`,
          noSurat: r.noSurat,
          time: r.tanggalInput || r.createdAt || getFormattedDateDDMMYYYY(),
          readBy: []
        });
      }
    });
  }

  return filtered;
}

let globalRealtimeLoopInterval = null;

function startGlobalRealtimeLoop() {
  if (globalRealtimeLoopInterval) {
    clearInterval(globalRealtimeLoopInterval);
    globalRealtimeLoopInterval = null;
  }
}

function updateNotifBellCounter() {
  const bellBtn = document.getElementById('notifBellBtn');
  const badgeEl = document.getElementById('notifBellBadge');
  if (!bellBtn || !badgeEl) return;

  if (!currentUser || (document.getElementById('loginPage') && document.getElementById('loginPage').classList.contains('active'))) {
    bellBtn.style.setProperty('display', 'none', 'important');
    return;
  }

  bellBtn.style.display = 'flex';

  const userNotifs = getAccessibleNotifications();
  const unreadCount = userNotifs.filter(n => {
    if (!n || !n.readBy) return true;
    return !n.readBy.includes(currentUser.id) && !n.readBy.includes(currentUser.username);
  }).length;

  if (unreadCount > 0) {
    badgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badgeEl.style.display = 'flex';
  } else {
    badgeEl.style.display = 'none';
  }
}

function bukaNotificationModal() {
  const popup = document.getElementById('popupNotifList');
  if (!popup) return;

  if (typeof loadNotificationList === 'function') {
    loadNotificationList();
  }

  popup.style.display = 'flex';
  popup.classList.add('show');
  
  if (typeof pushPopupHistoryState === 'function') {
    pushPopupHistoryState();
  }
}

function tutupNotificationModal() {
  const popup = document.getElementById('popupNotifList');
  if (!popup) return;
  popup.style.display = 'none';
  popup.classList.remove('show');
}

function loadNotificationList() {
  const container = document.getElementById('notifListBody');
  if (!container) return;
  container.innerHTML = '';

  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );
  const btnHapusNotif = document.getElementById('btnHapusSemuaNotifSystem');
  if (btnHapusNotif) {
    btnHapusNotif.style.display = isSysAdmin ? 'inline-block' : 'none';
  }

  const userNotifs = getAccessibleNotifications();

  if (userNotifs.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12.5px;">BELUM ADA NOTIFIKASI MASUK.</div>`;
    return;
  }

  userNotifs.forEach(n => {
    const isRead = n.readBy.includes(currentUser.id) || n.readBy.includes(currentUser.username);
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: ${isRead ? 'var(--bg-box)' : 'var(--bg-header)'};
      cursor: pointer;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      transition: background 0.2s;
    `;
    item.onclick = () => clickNotificationItem(n.id, n.noSurat);

    item.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isRead ? '#64748b' : '#0284c7'}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
        <span class="material-symbols-rounded" style="font-size: 18px;">notifications</span>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 12.5px; font-weight: ${isRead ? '500' : '700'}; color: var(--text-main); line-height: 1.4;">
          ${n.message}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 10px; color: var(--text-muted);">
          <span>${n.time}</span>
          ${n.noSurat ? `<span style="color: var(--primary); font-weight: 600;">#${n.noSurat}</span>` : ''}
        </div>
      </div>
      ${!isRead ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; margin-top: 6px; flex-shrink: 0;"></div>` : ''}
    `;
    container.appendChild(item);
  });
}

function clickNotificationItem(notifId, noSurat) {
  markNotifAsRead(notifId, noSurat);

  const notifListPopup = document.getElementById('popupNotifList');
  if (notifListPopup) {
    notifListPopup.style.display = 'none';
    notifListPopup.classList.remove('show');
  }

  if (noSurat) {
    setTimeout(() => {
      lihatDetail(noSurat, true);
    }, 150);
  }
}

function markNotifAsRead(notifId, noSurat = '') {
  if (!currentUser) return;

  let notifs = getSystemNotifications();
  const accessibleNotifs = getAccessibleNotifications();

  let targetNotif = notifs.find(n => n.id === notifId || (noSurat && n.noSurat === noSurat && String(n.message || '').includes(noSurat)));
  if (!targetNotif && Array.isArray(accessibleNotifs)) {
    const accItem = accessibleNotifs.find(n => n.id === notifId || (noSurat && n.noSurat === noSurat));
    if (accItem) {
      targetNotif = { ...accItem, readBy: [] };
      notifs.unshift(targetNotif);
    }
  }

  if (targetNotif) {
    if (!Array.isArray(targetNotif.readBy)) targetNotif.readBy = [];
    if (!targetNotif.readBy.includes(currentUser.id)) targetNotif.readBy.push(currentUser.id);
    if (!targetNotif.readBy.includes(currentUser.username)) targetNotif.readBy.push(currentUser.username);

    if (noSurat) {
      notifs.forEach(n => {
        if (n && n.noSurat === noSurat) {
          if (!Array.isArray(n.readBy)) n.readBy = [];
          if (!n.readBy.includes(currentUser.id)) n.readBy.push(currentUser.id);
          if (!n.readBy.includes(currentUser.username)) n.readBy.push(currentUser.username);
        }
      });
    }

    if (notifs.length > 100) notifs = notifs.slice(0, 100);

    const clearedAt = getSystemNotifsClearedTimestamp();
    const payload = clearedAt ? { clearedAt, items: notifs } : notifs;

    appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload));
    try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload)); } catch(e) {}

    if (typeof supabase !== 'undefined' && supabase) {
      try {
        const systemNotifRow = {
          id: '__SYSTEM_NOTIFICATIONS__',
          no_surat: '__SYSTEM_NOTIFICATIONS__',
          tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
          toko: 'SYSTEM',
          area: 'ALL',
          jenis: 'SYSTEM',
          catatan: JSON.stringify(payload),
          items: [],
          photos: [],
          status: 'DONE',
          service_approve: true,
          created_by: 'SYSTEM',
          created_at: new Date().toISOString()
        };
        supabase.from('permintaan_toko').upsert(systemNotifRow).then(({ error }) => {
          if (error) console.warn('[SUPABASE NOTIF SAVE NOTICE]:', error.message);
        });
      } catch(e) {}
    }
  }

  updateNotifBellCounter();
}

function markAllNotifAsRead(silent = false) {
  if (!currentUser) return;
  
  let notifs = getSystemNotifications();
  const accessibleNotifs = getAccessibleNotifications();

  // MERGE ACCESSIBLE NOTIFICATIONS INTO MAIN STORAGE SO READ STATUS IS PERSISTED
  if (Array.isArray(accessibleNotifs)) {
    accessibleNotifs.forEach(acc => {
      if (acc && acc.id) {
        const idx = notifs.findIndex(n => n.id === acc.id || (n.noSurat && acc.noSurat && n.noSurat === acc.noSurat && n.message === acc.message));
        if (idx !== -1) {
          if (!Array.isArray(notifs[idx].readBy)) notifs[idx].readBy = [];
          if (!notifs[idx].readBy.includes(currentUser.id)) notifs[idx].readBy.push(currentUser.id);
          if (!notifs[idx].readBy.includes(currentUser.username)) notifs[idx].readBy.push(currentUser.username);
        } else {
          const newObj = { ...acc, readBy: [currentUser.id, currentUser.username] };
          notifs.unshift(newObj);
        }
      }
    });
  }

  // MARK ALL STORED NOTIFICATIONS ACCESSIBLE TO THIS USER AS READ
  notifs.forEach(n => {
    if (!Array.isArray(n.readBy)) n.readBy = [];
    if (!n.readBy.includes(currentUser.id)) n.readBy.push(currentUser.id);
    if (!n.readBy.includes(currentUser.username)) n.readBy.push(currentUser.username);
  });

  if (notifs.length > 100) notifs = notifs.slice(0, 100);

  const clearedAt = getSystemNotifsClearedTimestamp();
  const payload = clearedAt ? { clearedAt, items: notifs } : notifs;

  appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload));
  try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(payload)); } catch(e) {}

  if (typeof supabase !== 'undefined' && supabase) {
    try {
      const systemNotifRow = {
        id: '__SYSTEM_NOTIFICATIONS__',
        no_surat: '__SYSTEM_NOTIFICATIONS__',
        tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
        toko: 'SYSTEM',
        area: 'ALL',
        jenis: 'SYSTEM',
        catatan: JSON.stringify(payload),
        items: [],
        photos: [],
        status: 'DONE',
        service_approve: true,
        created_by: 'SYSTEM',
        created_at: new Date().toISOString()
      };
      supabase.from('permintaan_toko').upsert(systemNotifRow).then(({ error }) => {
        if (error) console.warn('[SUPABASE NOTIF SAVE NOTICE]:', error.message);
      });
    } catch(e) {}
  }

  updateNotifBellCounter();
  loadNotificationList();

  if (!silent && typeof showNotif === 'function') {
    showNotif('SEMUA NOTIFIKASI DITANDAI DIBACA!', 'info');
  }
}
window.markAllNotifAsRead = markAllNotifAsRead;

function hapusSemuaNotifikasiSystem() {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );
  if (!isSysAdmin) {
    showNotif('FUNGSI MENGHAPUS SEMUA NOTIFIKASI HANYA DAPAT DILAKUKAN OLEH AKUN ADMIN!', 'warning');
    return;
  }

  showConfirm('YAKIN INGIN MENGHAPUS SEMUA NOTIFIKASI DARI SISTEM?', async () => {
    showLoading('MENGHAPUS SEMUA NOTIFIKASI...');
    try {
      const emptyNotifsPayload = {
        clearedAt: Date.now(),
        items: []
      };

      // 1. KOSONGKAN PENYIMPANAN LOKAL METADATA & ITEMS
      appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(emptyNotifsPayload));
      try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(emptyNotifsPayload)); } catch(e) {}

      // 2. SINKRONKAN PERSISTEN LANGSUNG KE SUPABASE CLOUD DATABASE
      if (typeof supabase !== 'undefined' && supabase) {
        try {
          const systemNotifRow = {
            id: '__SYSTEM_NOTIFICATIONS__',
            no_surat: '__SYSTEM_NOTIFICATIONS__',
            tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
            toko: 'SYSTEM',
            area: 'ALL',
            jenis: 'SYSTEM',
            catatan: JSON.stringify(emptyNotifsPayload),
            items: [],
            photos: [],
            status: 'DONE',
            service_approve: true,
            created_by: 'SYSTEM',
            created_at: new Date().toISOString()
          };
          await supabase.from('permintaan_toko').upsert(systemNotifRow);
        } catch(sbErr) {
          console.warn('[SUPABASE NOTIF DELETE ERROR]:', sbErr);
        }
      }

      // 3. PUSH KE DATABASE UTAMA LAIN
      if (typeof pushCentralCloudDB === 'function') {
        await pushCentralCloudDB();
      }

      hideLoading();
      updateNotifBellCounter();
      if (typeof loadNotificationList === 'function') loadNotificationList();
      showNotif('SELURUH NOTIFIKASI BERHASIL DIHAPUS DARI SISTEM & SINKRON KE SEMUA USER!', 'success');
    } catch (err) {
      hideLoading();
      console.error('[HAPUS NOTIFIKASI ERROR]:', err);
      showNotif('GAGAL MENGHAPUS NOTIFIKASI: ' + (err.message || err), 'error');
    }
  });
}
window.hapusSemuaNotifikasiSystem = hapusSemuaNotifikasiSystem;

function hapusSemuaNotifFirebaseDanLokal() {
  hapusSemuaNotifikasiSystem();
}
window.hapusSemuaNotifFirebaseDanLokal = hapusSemuaNotifFirebaseDanLokal;

function generateStoreCode(namaToko) {
  if (!namaToko) return 'TK';
  const words = namaToko.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/).filter(w => w !== 'TOKO' && w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    const clean = namaToko.toUpperCase().replace(/[^A-Z]/g, '');
    return (clean.length >= 2 ? clean.substring(0, 2) : 'TK');
  }
}

function getStoresFromDB() {
  const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
  const deletedStoreKeys = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
  const safeDeletedKeys = Array.isArray(deletedStoreKeys) ? deletedStoreKeys : [];
  const users = getUsersFromDB();
  const userStores = users.filter(u => u && u.category === 'TOKO').map(u => ({
    id: u.id,
    fullName: u.fullName || 'TOKO',
    area: u.area || '',
    storeCode: u.storeCode || generateStoreCode(u.fullName || '')
  }));

  const map = new Map();
  userStores.forEach(s => {
    if (s && s.fullName) {
      const key = `${String(s.fullName).toUpperCase()}_${String(s.area || '').toUpperCase()}`;
      map.set(key, s);
    }
  });

  if (Array.isArray(localStores)) {
    localStores.forEach(s => {
      if (s && s.fullName) {
        const key = `${String(s.fullName).toUpperCase()}_${String(s.area || '').toUpperCase()}`;
        map.set(key, s);
      }
    });
  }

  const allStores = Array.from(map.values());
  return allStores.filter(s => {
    if (!s || !s.fullName) return false;
    const key = `${String(s.fullName).toUpperCase()}_${String(s.area || '').toUpperCase()}`;
    return !safeDeletedKeys.includes(key);
  });
}

// 10 THEME MODES
const THEME_MODES = [
  { id: 'dark-mode', icon: 'light_mode', name: 'DARK' },
  { id: 'light-mode', icon: 'dark_mode', name: 'LIGHT' },
  { id: 'classic-mode', icon: 'menu_book', name: 'CLASSIC' },
  { id: 'neon-mode', icon: 'bolt', name: 'NEON' },
  { id: 'forest-mode', icon: 'eco', name: 'FOREST' },
  { id: 'sunset-mode', icon: 'wb_sunny', name: 'SUNSET' },
  { id: 'ocean-mode', icon: 'water', name: 'OCEAN' },
  { id: 'coffee-mode', icon: 'coffee', name: 'COFFEE' },
  { id: 'purple-mode', icon: 'nights_stay', name: 'PURPLE DREAM' },
  { id: 'crimson-mode', icon: 'local_fire_department', name: 'CRIMSON' }
];

// AREA MAP
const AREA_MAP = {
  BDG: 'BANDUNG (BDG)',
  BDU: 'BANDUNG UTARA (BDU)',
  CRB: 'CIREBON (CRB)',
  SKB: 'SUKABUMI (SKB)',
  SBN: 'SUBANG (SBN)',
  TSM: 'TASIKMALAYA (TSM)'
};

function getUserAreaList(areaInput) {
  if (!areaInput) return [];
  if (Array.isArray(areaInput)) return areaInput.map(a => String(a).trim().toUpperCase()).filter(Boolean);
  
  const str = String(areaInput).trim().toUpperCase();
  if (str === 'ALL' || str === 'SEMUA') return ['ALL'];

  const parts = str.split(/[,&/+\s]+/).map(p => p.trim()).filter(Boolean);
  return parts;
}
window.getUserAreaList = getUserAreaList;

function isAreaMatch(userArea, targetArea) {
  if (!userArea || !targetArea) return false;
  const userAreas = getUserAreaList(userArea);
  const targetAreas = getUserAreaList(targetArea);

  if (userAreas.includes('ALL') || targetAreas.includes('ALL')) return true;

  return userAreas.some(uArea => targetAreas.includes(uArea));
}
window.isAreaMatch = isAreaMatch;

function formatUserAreaDisplay(areaInput) {
  if (!areaInput) return '-';
  const areas = getUserAreaList(areaInput);
  if (areas.includes('ALL')) return 'ALL';
  return areas.join(' / ');
}
window.formatUserAreaDisplay = formatUserAreaDisplay;

const KODE_UNIT_MAP = {};

const SEED_USERS = [
  {
    id: 'USR-ADMIN',
    username: 'ADMIN',
    password: '0',
    fullName: 'SUPER ADMIN',
    phone: '',
    category: 'ADMIN',
    area: 'TSM',
    createdAt: '31/07/2026'
  }
];

const SEED_REQUESTS = [];

let currentUser = null;
let currentPhotos = [];
let currentThemeIndex = 0;
let filterStatusRiwayat = '';
let dashboardFilterStatus = 'PENDING';
let modeEdit = false;
let editNoSurat = '';
let confirmCallback = null;
let isAdminChat = false;
let currentRoom = '';
let currentChatUser = '';
let canvasTTD = null;
let ctxTTD = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let activeScanInput = null;
let html5QrCodeScanner = null;
let viewerPhotos = [];
let viewerCurrentIndex = 0;

function getFormattedDateDDMMYYYY(dObj = new Date()) {
  const d = (dObj instanceof Date && !isNaN(dObj.getTime())) ? dObj : new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateDDMMYYYYString(input) {
  if (!input) return '-';
  const str = String(input).trim();
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
    return str.split(' ')[0];
  }
  const match = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
}

function getRequestsFromDB() {
  return JSON.parse(appStorage.getItem(REQUESTS_DB_KEY) || '[]');
}

function saveRequestsToDB(requests) {
  appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(requests));
  if (typeof pushCentralCloudDB === 'function') {
    pushCentralCloudDB();
  }
}

function getUsersFromDB() {
  return JSON.parse(appStorage.getItem(USERS_DB_KEY) || '[]');
}

function saveUsersToDB(users) {
  appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  if (typeof pushCentralCloudDB === 'function') {
    pushCentralCloudDB();
  }
}

// APP INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
  try {
    closeAllPopups();

    if (typeof loadSupabaseConfigFromJson === 'function') {
      await loadSupabaseConfigFromJson();
    }
    
    if (typeof initSupabaseDB === 'function') {
      await initSupabaseDB();
    }
    
    if (typeof initDatabase === 'function') {
      initDatabase();
    } 
    if (typeof startCentralCloudSyncEngine === 'function') startCentralCloudSyncEngine();
    if (typeof startSupabaseKeepalive === 'function') startSupabaseKeepalive();
    loadSavedTheme();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof window.prosesLogin === 'function') window.prosesLogin();
      });
    }

    const loginButton = document.getElementById('btnLogin');
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        if (typeof window.prosesLogin === 'function') window.prosesLogin();
      });
    }

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (typeof window.prosesLogin === 'function') window.prosesLogin();
        }
      });
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (typeof window.prosesLogin === 'function') window.prosesLogin();
        }
      });
    }

    loadSavedDesignMode();
    autoLogin();

    if (typeof currentUser !== 'undefined' && currentUser) {
      if (typeof loadDashboard === 'function') loadDashboard();
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (document.getElementById('masterDbTableBody') && typeof loadMasterDbTable === 'function') loadMasterDbTable();
      if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
      if (typeof startGlobalRealtimeLoop === 'function') startGlobalRealtimeLoop();
    }

    initMobileBackButtonEngine();
    initPullToRefresh();
    updateAdminReminderUI();
  } catch (err) {
    console.error("Boot error:", err);
  } finally {
    hideLoading();
    closeAllPopups();
    if (!document.querySelector('.page.active')) {
      const dash = document.getElementById('dashboardPage');
      if (dash) dash.classList.add('active');
    }
  }

  setTimeout(() => {
    if (typeof aturTampilanLonceng === 'function' && typeof getCurrentActivePageId === 'function') {
      aturTampilanLonceng(getCurrentActivePageId());
    }
  }, 500);
});

function initPullToRefresh() {
  // PULL DOWN REFRESH DISABLED PER USER DIRECTIVE
}

function getAdminReminderEnabled() {
  const val = appStorage.getItem(ADMIN_REMINDER_KEY);
  return val !== 'false';
}

function toggleAdminReminderFeature() {
  const current = getAdminReminderEnabled();
  const next = !current;
  appStorage.setItem(ADMIN_REMINDER_KEY, next ? 'true' : 'false');
  updateAdminReminderUI();
  pushCentralCloudDB();
  showNotif(next ? 'REMINDER PENDING SERVICE & DM SEKARANG AKTIF (ON)!' : 'REMINDER PENDING SERVICE & DM NONAKTIF (OFF)!', 'info');
  if (next) {
    checkAndTriggerPendingReminders();
  }
}
window.toggleAdminReminderFeature = toggleAdminReminderFeature;

const ADMIN_REMINDER_TIME_KEY = 'STORE_ADMIN_REMINDER_TIME_KEY_V7';

function getAdminReminderTime() {
  return appStorage.getItem(ADMIN_REMINDER_TIME_KEY) || '09:00';
}

function simpanAdminReminderTime() {
  const input = document.getElementById('adminReminderTimeInput');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    appStorage.setItem(ADMIN_REMINDER_TIME_KEY, val);
    pushCentralCloudDB();
    showNotif(`JADWAL JAM WA REMINDER DISIMPAN: ${val}!`, 'info');
  }
}
window.simpanAdminReminderTime = simpanAdminReminderTime;

function loadAdminReminderTimeInput() {
  const input = document.getElementById('adminReminderTimeInput');
  if (input) {
    input.value = getAdminReminderTime();
  }
}
window.loadAdminReminderTimeInput = loadAdminReminderTimeInput;

function updateAdminReminderUI() {
  const statusText = document.getElementById('reminderFeatureStatusText');
  const isEnabled = getAdminReminderEnabled();
  if (statusText) {
    statusText.textContent = isEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)';
    statusText.style.color = isEnabled ? '#10b981' : '#ef4444';
  }
  loadAdminReminderTimeInput();
  const container = document.getElementById('adminReminderControlContainer');
  if (container) {
    container.style.display = (currentUser && currentUser.category === 'ADMIN') ? 'flex' : 'none';
  }
}

const LAST_REMINDER_SENT_KEY = 'STORE_LAST_REMINDER_SENT_KEY_V1';

function checkAndTriggerPendingReminders(forceNow = false) {
  if (!getAdminReminderEnabled()) return;

  const scheduledTimeStr = getAdminReminderTime(); // e.g. "09:00" or "09:00, 14:00"
  const scheduledTimes = scheduledTimeStr.split(',').map(t => t.trim()).filter(Boolean);
  if (scheduledTimes.length === 0) scheduledTimes.push('09:00');

  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayDateStr = typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : now.toISOString().split('T')[0];

  let matchedTime = scheduledTimes[0] || '09:00';

  // UNLESS forceNow IS TRUE (e.g. clicking "TES REMINDER"), ONLY TRIGGER AT THE CONFIGURED ADMIN TIMES
  if (!forceNow) {
    const isTimeToTrigger = scheduledTimes.includes(currentHHMM);
    if (!isTimeToTrigger) return;

    matchedTime = currentHHMM;

    // PREVENT MULTIPLE DISPATCHES IN THE SAME MINUTE / TIME SLOT
    const lastSentTag = appStorage.getItem(LAST_REMINDER_SENT_KEY);
    const currentSentTag = `${todayDateStr}_${matchedTime}`;
    if (lastSentTag === currentSentTag) return;

    appStorage.setItem(LAST_REMINDER_SENT_KEY, currentSentTag);
  }

  const requests = getRequestsFromDB();
  if (!requests.length) return;

  const notifs = getSystemNotifications();
  const allUsers = getUsersFromDB();

  const pendingServiceReqs = requests.filter(r => r && r.status === 'PENDING' && !r.serviceApprove);
  const pendingDMReqs = requests.filter(r => r && r.status === 'PENDING' && r.serviceApprove);

  let hasNewReminder = false;

  // 1. COMBINED REMINDER FOR SERVICE USERS (1 CHAT PER USER FOR MULTIPLE REQUESTS WITH REGISTERED FULL NAME)
  if (pendingServiceReqs.length > 0) {
    pendingServiceReqs.forEach(r => {
      const message = `REMINDER PENDING SERVICE [JAM ${scheduledTime}]: PERMINTAAN #${r.noSurat} DARI TOKO ${r.toko} BELUM DI-APPROVE SERVICE!`;
      const duplicate = notifs.some(n => n.noSurat === r.noSurat && String(n.message).includes('REMINDER PENDING') && String(n.message).includes('SERVICE'));
      if (!duplicate || forceNow) {
        tambahNotifikasiSistem(['SERVICE'], r.area, message, r.noSurat);
        hasNewReminder = true;
      }
    });

    const serviceUsers = allUsers.filter(u => u && (u.category === 'SERVICE' || u.category === 'HODS') && u.phone && u.phone !== '-');
    serviceUsers.forEach(srv => {
      const userPendingReqs = pendingServiceReqs.filter(r => r.area === srv.area || srv.area === 'ALL');
      if (userPendingReqs.length > 0) {
        const srvName = srv.fullName || srv.username || 'Bapak/Ibu Tim Service';
        const itemsListStr = userPendingReqs.map((r, idx) => {
          const directLink = typeof getAppDirectLink === 'function' ? getAppDirectLink(r.noSurat) : '';
          return `📌 #${r.noSurat} - TOKO ${r.toko} (${r.area})\n🔗 Link Detail: ${directLink}`;
        }).join('\n\n');
        
        const combinedMessage = 
          `Yth. Bapak/Ibu ${srvName},\n\n` +
          `PEMBERITAHUAN REMINDER PENDING SERVICE (${userPendingReqs.length} PERMINTAAN):\n\n` +
          `${itemsListStr}\n\n` +
          `Silakan klik link di atas untuk langsung membuka detail data. Terima kasih.`;

        kirimNotifikasiWA(srv.phone, combinedMessage);
      }
    });
  }

  // 2. COMBINED REMINDER FOR DM USERS (1 CHAT PER USER FOR MULTIPLE REQUESTS WITH REGISTERED FULL NAME)
  if (pendingDMReqs.length > 0) {
    pendingDMReqs.forEach(r => {
      const message = `REMINDER PENDING DM [JAM ${scheduledTime}]: PERMINTAAN #${r.noSurat} DARI TOKO ${r.toko} BELUM DI-APPROVE DM!`;
      const duplicate = notifs.some(n => n.noSurat === r.noSurat && String(n.message).includes('REMINDER PENDING') && String(n.message).includes('DM'));
      if (!duplicate || forceNow) {
        tambahNotifikasiSistem(['DM'], 'ALL', message, r.noSurat);
        hasNewReminder = true;
      }
    });

    const dmUsers = allUsers.filter(u => u && u.category === 'DM' && u.phone && u.phone !== '-');
    dmUsers.forEach(dm => {
      const userPendingReqs = pendingDMReqs.filter(r => r.area === dm.area || dm.area === 'ALL');
      if (userPendingReqs.length > 0) {
        const dmName = dm.fullName || dm.username || 'Bapak/Ibu DM';
        const itemsListStr = userPendingReqs.map((r, idx) => {
          const directLink = typeof getAppDirectLink === 'function' ? getAppDirectLink(r.noSurat) : '';
          return `📌 #${r.noSurat} - TOKO ${r.toko} (${r.area})\n🔗 Link Detail: ${directLink}`;
        }).join('\n\n');
        
        const combinedMessage = 
          `Yth. Bapak/Ibu ${dmName},\n\n` +
          `PEMBERITAHUAN REMINDER PENDING DM (${userPendingReqs.length} PERMINTAAN):\n\n` +
          `${itemsListStr}\n\n` +
          `Silakan klik link di atas untuk langsung membuka detail data. Terima kasih.`;

        kirimNotifikasiWA(dm.phone, combinedMessage);
      }
    });
  }

  if (hasNewReminder && typeof updateNotifBellCounter === 'function') {
    updateNotifBellCounter();
  }

  if (forceNow) {
    showNotif(`REMINDER WHATSAPP PENDING SERVICE & DM BERHASIL DIKIRIM SEKARANG! (JADWAL JAM: ${scheduledTime})`, 'info');
  }
}

function tesKirimAdminReminder() {
  checkAndTriggerPendingReminders(true);
}
window.tesKirimAdminReminder = tesKirimAdminReminder;

let adminReminderIntervalId = null;

function startAdminReminderTimeChecker() {
  if (adminReminderIntervalId) {
    clearInterval(adminReminderIntervalId);
    adminReminderIntervalId = null;
  }
  adminReminderIntervalId = setInterval(() => {
    if (typeof checkAndTriggerPendingReminders === 'function') {
      checkAndTriggerPendingReminders(false);
    }
  }, 60000);
}
window.startAdminReminderTimeChecker = startAdminReminderTimeChecker;

let cloudSyncInterval = null;

function onSupabaseDataChange(keyChanged) {
  if (!currentUser) return;

  const activePage = document.querySelector('.page.active');
  const pageId = activePage ? activePage.id : '';

  if (pageId === 'dashboardPage' && typeof loadDashboard === 'function') {
    loadDashboard();
  } else if (pageId === 'riwayatPage' && typeof loadRiwayat === 'function') {
    loadRiwayat();
  } else if (pageId === 'masterDbPage' && typeof loadMasterDbTable === 'function') {
    loadMasterDbTable();
  } else if (pageId === 'userManagementPage' && typeof loadUsersManagement === 'function') {
    loadUsersManagement();
  }

  if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  if (typeof cekUnreadNotif === 'function') cekUnreadNotif();

  const popupBantuan = document.getElementById('popupBantuan');
  if (popupBantuan && (popupBantuan.classList.contains('show') || popupBantuan.style.display === 'block')) {
    if (typeof isAdminChat !== 'undefined' && isAdminChat) {
      if (typeof currentRoom !== 'undefined' && currentRoom && typeof loadChatAdmin === 'function') {
        loadChatAdmin(currentRoom);
      } else if (typeof loadDaftarChatAdmin === 'function') {
        loadDaftarChatAdmin();
      }
    } else {
      if (typeof loadChatUser === 'function') {
        loadChatUser();
      }
    }
  }

  const notifListPopup = document.getElementById('popupNotifList');
  if (notifListPopup && notifListPopup.classList.contains('show')) {
    if (typeof loadNotificationList === 'function') loadNotificationList();
  }
}

function bersihkanCacheAplikasiWeb() {
  if (typeof caches !== 'undefined' && caches.keys) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    }).catch(() => {});
  }
}

// DEFAULT FIREBASE ONLINE CONFIGURATION (PERMINTAAN TOKO - CHAT & NOTIF REALTIME)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDTQdgmBi39SqLZ1j_aa8tj-mimCIXJTa0",
  authDomain: "permintaan-toko-e3b5d.firebaseapp.com",
  projectId: "permintaan-toko-e3b5d",
  storageBucket: "permintaan-toko-e3b5d.firebasestorage.app",
  messagingSenderId: "1072410401023",
  appId: "1:1072410401023:web:465e23030d2259b56454ca",
  measurementId: "G-KFHDYEP3VD"
};



let firebaseApp = null;
let dbFirestore = null;
let dbRealtime = null;

function getActiveFirebaseConfig() {
  return DEFAULT_FIREBASE_CONFIG;
}

function initFirebaseDB() {
  try {
    if (typeof firebase !== 'undefined') {
      const activeConfig = getActiveFirebaseConfig();
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(activeConfig);
      } else {
        firebaseApp = firebase.app();
      }

      // FIRESTORE ENGINE (CHAT & NOTIFIKASI SAJA)
      if (typeof firebase.firestore === 'function') {
        try {
          dbFirestore = firebase.firestore();

          const dot = document.getElementById('firebaseOnlineDot');
          if (dot) {
            dot.style.background = '#10b981';
            dot.style.boxShadow = '0 0 10px #10b981';
            dot.title = `ONLINE: TERHUBUNG (${activeConfig.projectId})`;
          }

          // REAL-TIME SNAPSHOT LISTENER UNTUK CHAT & SETTINGS PUSAT
          dbFirestore.collection('app_settings').doc('config').onSnapshot(doc => {
            if (doc.exists) {
              const cfg = doc.data() || {};
              if (cfg.notifications) appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(cfg.notifications));
              if (cfg.chatMessages) appStorage.setItem(CHAT_DB_KEY, JSON.stringify(cfg.chatMessages));
              if (cfg.chatRooms) appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(cfg.chatRooms));
              if (cfg.theme) {
                appStorage.setItem(THEME_KEY, cfg.theme);
                if (typeof loadSavedTheme === 'function') loadSavedTheme();
              }
              if (cfg.designMode) {
                appStorage.setItem(DESIGN_MODE_KEY, cfg.designMode);
                if (typeof loadSavedDesignMode === 'function') loadSavedDesignMode();
              }
              if (cfg.fonteToken) appStorage.setItem(FONTE_TOKEN_KEY, cfg.fonteToken);
              if (cfg.featurePhotos !== undefined) {
                const curVal = appStorage.getItem(FEATURE_PHOTOS_KEY);
                const newVal = String(cfg.featurePhotos);
                if (curVal !== newVal) {
                  appStorage.setItem(FEATURE_PHOTOS_KEY, newVal);
                  if (typeof updatePhotoSectionVisibility === 'function') updatePhotoSectionVisibility();
                }
              }
              if (cfg.kodeUnitMap) {
                const existingMap = JSON.parse(appStorage.getItem(KODE_UNIT_MAP_KEY) || '{}');
                const mergedMap = { ...existingMap, ...cfg.kodeUnitMap };
                appStorage.setItem(KODE_UNIT_MAP_KEY, JSON.stringify(mergedMap));
              }
              if (cfg.firebaseConfig) {
                const curLocal = appStorage.getItem(FIREBASE_USER_CONFIG_KEY);
                const newStr = typeof cfg.firebaseConfig === 'string' ? cfg.firebaseConfig : JSON.stringify(cfg.firebaseConfig);
                if (curLocal !== newStr && newStr !== 'null') {
                  appStorage.setItem(FIREBASE_USER_CONFIG_KEY, newStr);
                  if (typeof loadFirebaseConfigInput === 'function') loadFirebaseConfigInput();
                  initFirebaseDB();
                }
              }

              if (typeof refreshActiveChatUI === 'function') {
                refreshActiveChatUI();
              }
            }
          }, err => {
            console.warn("[FIRESTORE CONFIG SNAPSHOT NOTICE]:", err.message);
          });

          // JIKA FIRESTORE BERHASIL DIINISIALISASI, SET BULAT HIJAU
          if (typeof updateGlobalConnectionDotStatus === 'function') {
            updateGlobalConnectionDotStatus();
          }
        } catch (e) {
          console.warn("[FIRESTORE INIT NOTICE]:", e.message);
        }
      }

      // REALTIME DATABASE (JIKA ADANYA CONFIG DATABASEURL)
      if (activeConfig.databaseURL && typeof firebase.database === 'function') {
        try {
          dbRealtime = firebase.database();
        } catch (e) {
          dbRealtime = null;
        }
      }

      const statusBadge = document.getElementById('firebaseStatusBadge');
      if (statusBadge) {
        statusBadge.textContent = `STATUS: TERHUBUNG KE FIREBASE ONLINE (${activeConfig.projectId})`;
        statusBadge.style.color = '#10b981';
      }

      console.log(`[FIREBASE ONLINE ENGINE]: Connected to ${activeConfig.projectId}`);
    }
  } catch (err) {
    const dot = document.getElementById('firebaseOnlineDot');
    if (dot) {
      dot.style.background = '#ef4444';
      dot.style.boxShadow = 'none';
      dot.title = 'ONLINE: TERPUTUS / DISKONEK';
    }
    console.warn("[FIREBASE ENGINE NOTICE]:", err.message);
  }
}

function loadFirebaseConfigInput() {
  const input = document.getElementById('firebaseConfigJsonInput');
  if (!input) return;
  const saved = appStorage.getItem(FIREBASE_USER_CONFIG_KEY);
  if (saved) {
    input.value = saved;
  } else {
    input.value = JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
  }
}

function simpanFirebaseConfigUser() {
  const input = document.getElementById('firebaseConfigJsonInput');
  const val = input ? input.value.trim() : '';

  if (!val) {
    appStorage.removeItem(FIREBASE_USER_CONFIG_KEY);
    showNotif('KONFIGURASI FIREBASE DI-RESET KE DEFAULT!', 'info');
    if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB();
    initFirebaseDB();
    return;
  }

  try {
    const parsed = JSON.parse(val);
    if (!parsed.projectId) {
      showNotif('INVALID CONFIG! PROJECT ID TIDAK DITEMUKAN.', 'warning');
      return;
    }
    appStorage.setItem(FIREBASE_USER_CONFIG_KEY, JSON.stringify(parsed));
    showNotif('BERHASIL MENYIMPAN & MENSINKRONKAN KE SEMUA PERANGKAT!', 'success');
    if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB();
    initFirebaseDB();
  } catch (e) {
    showNotif('FORMAT JSON KONFIGURASI FIREBASE TIDAK VALID!', 'error');
  }
}

const SUPABASE_LAST_SYNC_KEY = 'STORE_SUPABASE_LAST_SYNC_V7';
let supabaseRealtimeChannel = null;

// ==========================================
// 1. SUPABASE REALTIME ENGINE (EVENT-DRIVEN)
// ==========================================
function initSupabaseRealtimeEngine() {
  if (typeof supabase === 'undefined' || !supabase) return;

  if (supabaseRealtimeChannel) {
    try {
      supabase.removeChannel(supabaseRealtimeChannel);
    } catch (e) {}
    supabaseRealtimeChannel = null;
  }

  try {
    supabaseRealtimeChannel = supabase
      .channel('public_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'permintaan_toko' },
        (payload) => {
          handleRealtimePermintaanToko(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          handleRealtimeNotification(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          handleRealtimeChatMessage(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          handleRealtimeUserChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'toko_list' },
        (payload) => {
          handleRealtimeStoreChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          window.isSupabaseOnline = true;
          updateGlobalConnectionDotStatus();
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          window.isSupabaseOnline = false;
          updateGlobalConnectionDotStatus();
        }
      });
  } catch (err) {
    console.warn('[SUPABASE REALTIME INIT NOTICE]:', err);
  }
}
window.initSupabaseRealtimeEngine = initSupabaseRealtimeEngine;

// Helper: Format raw row from Supabase permintaan_toko
function formatSupabaseRequestRow(row) {
  if (!row) return null;
  const noSurat = row.no_surat || row.noSurat || '';
  if (!noSurat) return null;

  return {
    noSurat: noSurat,
    tanggal: row.tanggal || '',
    toko: row.toko || '',
    area: row.area || 'BDG',
    jenis: row.jenis || '',
    catatan: row.catatan || '',
    items: Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items || '[]') : []),
    photos: parsePhotosArray(row.photos || row.foto),
    artemisPhotos: parsePhotosArray(row.artemis_photos || row.artemisPhotos),
    status: row.status || 'PENDING',
    serviceApprove: row.service_approve !== undefined ? !!row.service_approve : !!row.serviceApprove,
    serviceUserName: row.service_user_name || row.serviceUserName || '',
    serviceTTD: row.service_ttd || row.serviceTTD || '',
    dmUserName: row.dm_user_name || row.dmUserName || '',
    dmTTD: row.dm_ttd || row.dmTTD || '',
    createdBy: row.created_by || row.createdBy || '',
    createdAt: row.created_at || row.createdAt || '',
    userId: row.user_id || row.userId || '',
    log: Array.isArray(row.log) ? row.log : (typeof row.log === 'string' ? JSON.parse(row.log || '[]') : [])
  };
}

// Check if user has permission to see request
function isRequestVisibleToCurrentUser(r) {
  if (!currentUser || !r) return true;
  const cat = String(currentUser.category || '').toUpperCase();
  const userArea = String(currentUser.area || '').toUpperCase();

  if (cat === 'ADMIN') return true;
  if (cat === 'SERVICE') {
    if (userArea === 'ALL' || userArea === 'TSM') return true;
    return String(r.area || '').toUpperCase() === userArea;
  }
  if (cat === 'DM') {
    if (userArea === 'ALL') return true;
    return String(r.area || '').toUpperCase() === userArea;
  }
  if (cat === 'TOKO') {
    if (r.userId && currentUser.id && String(r.userId) === String(currentUser.id)) return true;
    if (r.toko && currentUser.fullName && String(r.toko).trim().toUpperCase() === String(currentUser.fullName).trim().toUpperCase()) return true;
    return false;
  }
  return true;
}

// REALTIME: Handle permintaan_toko changes (INSERT, UPDATE, DELETE)
function handleRealtimePermintaanToko(payload) {
  try {
    const eventType = payload.eventType;
    const requests = getRequestsFromDB();

    if (eventType === 'INSERT') {
      const newRow = formatSupabaseRequestRow(payload.new);
      if (newRow && !newRow.noSurat.startsWith('__SYSTEM_') && isRequestVisibleToCurrentUser(newRow)) {
        const existsIdx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(newRow.noSurat).trim().toUpperCase());
        if (existsIdx === -1) {
          requests.unshift(newRow);
        } else {
          requests[existsIdx] = { ...requests[existsIdx], ...newRow };
        }
        appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(requests));
        refreshRealtimeUI();
      }
    } else if (eventType === 'UPDATE') {
      const updatedRow = formatSupabaseRequestRow(payload.new);
      if (updatedRow && !updatedRow.noSurat.startsWith('__SYSTEM_')) {
        const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(updatedRow.noSurat).trim().toUpperCase());
        if (idx !== -1) {
          requests[idx] = { ...requests[idx], ...updatedRow };
          appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(requests));
          refreshRealtimeUI();
        } else if (isRequestVisibleToCurrentUser(updatedRow)) {
          requests.unshift(updatedRow);
          appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(requests));
          refreshRealtimeUI();
        }
      }
    } else if (eventType === 'DELETE') {
      const delNoSurat = payload.old ? (payload.old.no_surat || payload.old.noSurat || payload.old.id) : null;
      if (delNoSurat) {
        const filtered = requests.filter(r => r && String(r.noSurat).trim().toUpperCase() !== String(delNoSurat).trim().toUpperCase());
        appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(filtered));
        refreshRealtimeUI();
      }
    }
  } catch (err) {
    console.warn('[REALTIME PERMINTAAN ERROR]:', err);
  }
}

// REALTIME: Handle notifications changes
function handleRealtimeNotification(payload) {
  try {
    const eventType = payload.eventType;
    let notifs = getSystemNotifications();

    if (eventType === 'INSERT' && payload.new) {
      const n = payload.new;
      const parsed = {
        id: n.id,
        targetRoles: n.target_roles || n.targetRoles || [],
        targetArea: n.target_area || n.targetArea || 'ALL',
        message: n.message,
        noSurat: n.no_surat || n.noSurat || '',
        time: n.time || `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`,
        readBy: n.read_by || n.readBy || []
      };

      if (!notifs.some(x => x.id === parsed.id)) {
        notifs.unshift(parsed);
        appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(notifs));
        try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(notifs)); } catch(e) {}
        if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
        const popupNotifList = document.getElementById('popupNotifList');
        if (popupNotifList && (popupNotifList.classList.contains('show') || popupNotifList.style.display === 'flex')) {
          if (typeof loadNotificationList === 'function') loadNotificationList();
        }
      }
    } else if (eventType === 'UPDATE' && payload.new) {
      const n = payload.new;
      const idx = notifs.findIndex(x => x.id === n.id);
      if (idx !== -1) {
        notifs[idx] = { ...notifs[idx], ...n };
        appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(notifs));
        if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
      }
    } else if (eventType === 'DELETE' && payload.old) {
      notifs = notifs.filter(x => x.id !== payload.old.id);
      appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(notifs));
      if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
    }
  } catch (err) {
    console.warn('[REALTIME NOTIF ERROR]:', err);
  }
}

// REALTIME: Handle chat message changes
function handleRealtimeChatMessage(payload) {
  try {
    const eventType = payload.eventType;
    let chats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');

    if (eventType === 'INSERT' && payload.new) {
      const c = payload.new;
      if (!chats.some(x => x.id === c.id)) {
        chats.push(c);
        appStorage.setItem(CHAT_DB_KEY, JSON.stringify(chats));
        try { localStorage.setItem(CHAT_DB_KEY, JSON.stringify(chats)); } catch(e) {}
        if (typeof refreshActiveChatUI === 'function') refreshActiveChatUI();
        if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
      }
    }
  } catch(e) {}
}

// REALTIME: Handle user changes
function handleRealtimeUserChange(payload) {
  try {
    const eventType = payload.eventType;
    let users = getUsersFromDB();

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && payload.new) {
      const u = payload.new;
      const formatted = {
        id: u.id,
        username: String(u.username || '').trim(),
        password: String(u.password || '').trim(),
        fullName: String(u.full_name || u.fullName || '').trim(),
        storeCode: String(u.store_code || u.storeCode || '').trim(),
        phone: String(u.phone || '').trim(),
        category: String(u.category || 'TOKO').trim().toUpperCase(),
        area: String(u.area || 'BDG').trim().toUpperCase(),
        createdAt: u.created_at || (typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '')
      };

      const idx = users.findIndex(x => x && (x.id === formatted.id || String(x.username).toUpperCase() === formatted.username.toUpperCase()));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...formatted };
      } else {
        users.push(formatted);
      }
      appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      try { localStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); } catch(e) {}
      if (typeof loadUsersManagement === 'function' && document.getElementById('userTableBody')) loadUsersManagement();
    } else if (eventType === 'DELETE' && payload.old) {
      users = users.filter(x => x.id !== payload.old.id && String(x.username).toUpperCase() !== String(payload.old.username).toUpperCase());
      appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      try { localStorage.setItem(USERS_DB_KEY, JSON.stringify(users)); } catch(e) {}
      if (typeof loadUsersManagement === 'function' && document.getElementById('userTableBody')) loadUsersManagement();
    }
  } catch(e) {}
}

// REALTIME: Handle store changes
function handleRealtimeStoreChange(payload) {
  try {
    const eventType = payload.eventType;
    let stores = typeof getStoresFromDB === 'function' ? getStoresFromDB() : [];

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && payload.new) {
      const s = payload.new;
      const formatted = {
        id: s.id || `STK-${s.store_code || Date.now()}`,
        fullName: String(s.full_name || s.fullName || '').trim(),
        area: String(s.area || 'BDG').trim().toUpperCase(),
        storeCode: String(s.store_code || s.storeCode || '').trim(),
        createdBy: String(s.created_by || s.createdBy || 'ADMIN').trim()
      };

      const idx = stores.findIndex(x => x.id === formatted.id || (x.fullName && x.fullName.toUpperCase() === formatted.fullName.toUpperCase()));
      if (idx !== -1) {
        stores[idx] = { ...stores[idx], ...formatted };
      } else {
        stores.push(formatted);
      }
      appStorage.setItem(STORES_DB_KEY, JSON.stringify(stores));
      try { localStorage.setItem(STORES_DB_KEY, JSON.stringify(stores)); } catch(e) {}
      if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
      if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
    } else if (eventType === 'DELETE' && payload.old) {
      stores = stores.filter(x => x.id !== payload.old.id && String(x.fullName).toUpperCase() !== String(payload.old.full_name).toUpperCase());
      appStorage.setItem(STORES_DB_KEY, JSON.stringify(stores));
      try { localStorage.setItem(STORES_DB_KEY, JSON.stringify(stores)); } catch(e) {}
      if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
      if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
    }
  } catch(e) {}
}

function refreshRealtimeUI() {
  if (currentUser) {
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof loadRiwayat === 'function') loadRiwayat();
    const hasCheckedMaster = document.querySelectorAll('.masterDbCheckbox:checked').length > 0;
    if (!hasCheckedMaster && typeof loadMasterDbTable === 'function' && document.getElementById('masterDbTableBody')) {
      loadMasterDbTable();
    }
    if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  }
}

// =======================================================================
// 2. INCREMENTAL DELTA SYNC USING updated_at (0 KB INITIAL BANDWIDTH)
// =======================================================================
async function syncSupabaseIncremental() {
  if (typeof supabase === 'undefined' || !supabase) return;

  try {
    const lastSync = appStorage.getItem(SUPABASE_LAST_SYNC_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_LAST_SYNC_KEY) : null);
    
    // If no previous sync timestamp exists, perform full initial sync
    if (!lastSync) {
      await syncAllDataToCache();
      const nowIso = new Date().toISOString();
      appStorage.setItem(SUPABASE_LAST_SYNC_KEY, nowIso);
      try { localStorage.setItem(SUPABASE_LAST_SYNC_KEY, nowIso); } catch(e) {}
      return;
    }

    // Light Delta Query to Supabase for modified/new rows
    const { data: deltaReqs, error } = await supabase
      .from('permintaan_toko')
      .select('*')
      .gt('updated_at', lastSync);

    if (!error && Array.isArray(deltaReqs) && deltaReqs.length > 0) {
      const currentReqs = getRequestsFromDB();
      let hasChanges = false;

      deltaReqs.forEach(row => {
        const formatted = formatSupabaseRequestRow(row);
        if (formatted && !formatted.noSurat.startsWith('__SYSTEM_') && isRequestVisibleToCurrentUser(formatted)) {
          const idx = currentReqs.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(formatted.noSurat).trim().toUpperCase());
          if (idx !== -1) {
            currentReqs[idx] = { ...currentReqs[idx], ...formatted };
          } else {
            currentReqs.unshift(formatted);
          }
          hasChanges = true;
        }
      });

      if (hasChanges) {
        currentReqs.sort((a,b) => (b.noSurat || '').localeCompare(a.noSurat || ''));
        appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(currentReqs));
        refreshRealtimeUI();
      }
    }

    // Delta Query for Notifications
    try {
      const { data: deltaNotifs } = await supabase
        .from('notifications')
        .select('*')
        .gt('updated_at', lastSync);

      if (Array.isArray(deltaNotifs) && deltaNotifs.length > 0) {
        const currentNotifs = getSystemNotifications();
        let notifUpdated = false;

        deltaNotifs.forEach(n => {
          const parsed = {
            id: n.id,
            targetRoles: n.target_roles || n.targetRoles || [],
            targetArea: n.target_area || n.targetArea || 'ALL',
            message: n.message,
            noSurat: n.no_surat || n.noSurat || '',
            time: n.time || `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`,
            readBy: n.read_by || n.readBy || []
          };
          const idx = currentNotifs.findIndex(x => x.id === parsed.id);
          if (idx !== -1) {
            currentNotifs[idx] = { ...currentNotifs[idx], ...parsed };
          } else {
            currentNotifs.unshift(parsed);
          }
          notifUpdated = true;
        });

        if (notifUpdated) {
          appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(currentNotifs));
          try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(currentNotifs)); } catch(e) {}
          if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
        }
      }
    } catch (e) {}

    // Update last sync timestamp
    const newSyncTime = new Date().toISOString();
    appStorage.setItem(SUPABASE_LAST_SYNC_KEY, newSyncTime);
    try { localStorage.setItem(SUPABASE_LAST_SYNC_KEY, newSyncTime); } catch(e) {}
  } catch (err) {
    console.warn('[INCREMENTAL DELTA SYNC NOTICE]:', err);
  }
}
window.syncSupabaseIncremental = syncSupabaseIncremental;

// Full Initial Sync (Used when local cache is empty)
async function syncAllDataToCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    await syncSupabaseRequestsToLocalCache();
    await syncSupabaseUsersToLocalCache();
    await syncSupabaseNotifsAndChatToLocalCache();
    await syncSupabaseStoresToLocalCache();
    await syncSupabaseLookupToLocalCache();
    await syncSupabaseThemeToLocalCache();

    const nowIso = new Date().toISOString();
    appStorage.setItem(SUPABASE_LAST_SYNC_KEY, nowIso);
    try { localStorage.setItem(SUPABASE_LAST_SYNC_KEY, nowIso); } catch(e) {}
  } catch (err) {
    console.warn('[FULL SYNC NOTICE]:', err);
  }
}
window.syncAllDataToCache = syncAllDataToCache;

async function syncSupabaseRequestsToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    let query = supabase.from('permintaan_toko').select('*');

    // Role-based server filter if currentUser is set
    if (currentUser) {
      const cat = String(currentUser.category || '').toUpperCase();
      const userArea = String(currentUser.area || '').toUpperCase();

      if (cat === 'TOKO') {
        query = query.or(`user_id.eq.${currentUser.id},toko.ilike.%${currentUser.fullName}%`);
      } else if (cat === 'SERVICE') {
        if (userArea !== 'ALL' && userArea !== 'TSM') {
          query = query.eq('area', userArea);
        }
      } else if (cat === 'DM') {
        if (userArea !== 'ALL') {
          query = query.eq('area', userArea);
        }
      }
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const delReqs = new Set(
        (JSON.parse(appStorage.getItem(DELETED_REQUESTS_KEY) || '[]') || [])
          .filter(Boolean)
          .map(v => String(v).trim().toUpperCase())
      );

      const freshReqs = data
        .filter(row => {
          const ns = String(row.no_surat || row.noSurat || '').trim();
          return ns && !ns.startsWith('__SYSTEM_') && !delReqs.has(ns.toUpperCase());
        })
        .map(row => formatSupabaseRequestRow(row))
        .filter(Boolean);

      freshReqs.sort((a,b) => (b.noSurat || '').localeCompare(a.noSurat || ''));
      appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(freshReqs));
      refreshRealtimeUI();
    }
  } catch (e) {
    console.warn('[SUPABASE REQUESTS SYNC NOTICE]:', e);
  }
}

async function syncSupabaseUsersToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const { data: supaUsers, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(supaUsers)) {
      const delUsers = new Set(
        (JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]') || [])
          .filter(Boolean)
          .map(v => String(v).trim().toUpperCase())
      );

      const formatted = supaUsers
        .map(u => ({
          id: u.id,
          username: String(u.username || '').trim(),
          password: String(u.password || '').trim(),
          fullName: String(u.full_name || u.fullName || '').trim(),
          storeCode: String(u.store_code || u.storeCode || '').trim(),
          phone: String(u.phone || '').trim(),
          category: String(u.category || 'TOKO').trim().toUpperCase(),
          area: String(u.area || 'BDG').trim().toUpperCase(),
          createdAt: u.created_at || (typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '')
        }))
        .filter(u => u.username && !delUsers.has(String(u.id).toUpperCase()) && !delUsers.has(String(u.username).toUpperCase()));

      if (formatted.length > 0) {
        if (typeof SEED_USERS !== 'undefined' && Array.isArray(SEED_USERS)) {
          SEED_USERS.forEach(su => {
            if (su && su.username && !formatted.some(x => x.username.toUpperCase() === su.username.toUpperCase()) && !delUsers.has(su.username.toUpperCase())) {
              formatted.unshift(su);
            }
          });
        }

        appStorage.setItem(USERS_DB_KEY, JSON.stringify(formatted));
        try { localStorage.setItem(USERS_DB_KEY, JSON.stringify(formatted)); } catch(e) {}
      }
    }
  } catch (err) {
    console.warn('[SUPABASE USERS SYNC NOTICE]:', err);
  }
}
window.syncSupabaseUsersToLocalCache = syncSupabaseUsersToLocalCache;

async function syncSupabaseNotifsAndChatToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;

  try {
    try {
      const { data: ntfData } = await supabase.from('notifications').select('*');
      if (ntfData && Array.isArray(ntfData) && ntfData.length > 0) {
        const parsedNotifs = ntfData.map(n => ({
          id: n.id,
          targetRoles: n.target_roles || n.targetRoles || [],
          targetArea: n.target_area || n.targetArea || 'ALL',
          message: n.message,
          noSurat: n.no_surat || n.noSurat || '',
          time: n.time || '',
          readBy: n.read_by || n.readBy || []
        }));
        if (parsedNotifs.length > 0) {
          appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(parsedNotifs));
          try { localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(parsedNotifs)); } catch(e) {}
        }
      }
    } catch(e) {}

    const { data: chatData } = await supabase.from('chat_messages').select('*');
    if (Array.isArray(chatData) && chatData.length > 0) {
      appStorage.setItem(CHAT_DB_KEY, JSON.stringify(chatData));
      try { localStorage.setItem(CHAT_DB_KEY, JSON.stringify(chatData)); } catch(e) {}
    }
  } catch (err) {
    console.warn('[SUPABASE NOTIF & CHAT SYNC NOTICE]:', err);
  }
}

async function syncSupabaseStoresToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const { data: supaStores, error } = await supabase.from('toko_list').select('*');
    if (!error && Array.isArray(supaStores)) {
      const delStores = new Set(
        (JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]') || [])
          .filter(Boolean)
          .map(v => String(v).trim().toUpperCase())
      );
      const delUsers = new Set(
        (JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]') || [])
          .filter(Boolean)
          .map(v => String(v).trim().toUpperCase())
      );

      const formattedStores = supaStores
        .map(s => ({
          id: s.id || `STK-${s.store_code || Date.now()}`,
          fullName: String(s.full_name || s.fullName || '').trim(),
          area: String(s.area || 'BDG').trim().toUpperCase(),
          storeCode: String(s.store_code || s.storeCode || '').trim(),
          createdBy: String(s.created_by || s.createdBy || 'ADMIN').trim()
        }))
        .filter(s => {
          if (!s.fullName) return false;
          const sId = String(s.id || '').toUpperCase();
          const sName = s.fullName.toUpperCase();
          const sKey = `${sName}_${s.area}`;
          if (delStores.has(sId) || delStores.has(sName) || delStores.has(sKey)) return false;
          if (delUsers.has(sId) || delUsers.has(sName)) return false;
          return true;
        });

      appStorage.setItem(STORES_DB_KEY, JSON.stringify(formattedStores));
      try { localStorage.setItem(STORES_DB_KEY, JSON.stringify(formattedStores)); } catch(e) {}

      if (typeof updateStoreDropdownOptions === 'function') {
        updateStoreDropdownOptions();
      }
    }
  } catch (err) {
    console.warn('[SUPABASE STORES SYNC NOTICE]:', err);
  }
}
window.syncSupabaseStoresToLocalCache = syncSupabaseStoresToLocalCache;

async function syncSupabaseLookupToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const { data: lookupData } = await supabase.from('lookup').select('*');
    if (Array.isArray(lookupData)) {
      lookupData.forEach(item => {
        if (item.key === 'kodeUnitMap' && item.value) {
          appStorage.setItem(KODE_UNIT_MAP_KEY, JSON.stringify(item.value));
          try { localStorage.setItem(KODE_UNIT_MAP_KEY, JSON.stringify(item.value)); } catch(e) {}
        }
      });
    }
  } catch (err) {
    console.warn('[SUPABASE LOOKUP SYNC NOTICE]:', err);
  }
}
window.syncSupabaseLookupToLocalCache = syncSupabaseLookupToLocalCache;

async function syncSupabaseThemeToLocalCache() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const { data: sysData } = await supabase.from('lookup').select('*').eq('key', 'global_theme').maybeSingle();
    if (sysData && sysData.value && sysData.value.theme) {
      const cloudTheme = sysData.value.theme;
      appStorage.setItem(GLOBAL_THEME_KEY, cloudTheme);
      appStorage.setItem(THEME_KEY, cloudTheme);
      try { localStorage.setItem('APP_SELECTED_THEME', cloudTheme); } catch(e) {}
      if (typeof updateBodyClasses === 'function') {
        updateBodyClasses(cloudTheme);
      }
    }
  } catch (err) {
    console.warn('[SUPABASE THEME SYNC NOTICE]:', err);
  }
}
window.syncSupabaseThemeToLocalCache = syncSupabaseThemeToLocalCache;

async function pushCentralCloudDB() {
  try {
    const requests = getRequestsFromDB();
    if (typeof supabase !== 'undefined' && supabase) {
      try {
        const supaPayloads = requests.map(r => ({
          no_surat: r.noSurat,
          tanggal: r.tanggal,
          toko: r.toko,
          area: r.area,
          jenis: r.jenis,
          catatan: r.catatan || '',
          items: r.items || [],
          photos: r.photos || [],
          status: r.status,
          service_approve: !!r.serviceApprove,
          created_by: r.createdBy || '',
          created_at: r.createdAt || '',
          user_id: r.userId || ''
        }));
        if (supaPayloads.length > 0) {
          const supaPayloadsWithId = supaPayloads.map(p => ({
            id: String(p.no_surat || '').replace(/[\/\.]/g, '_'),
            ...p
          }));
          try {
            const { error } = await supabase.from('permintaan_toko').upsert(supaPayloadsWithId);
            if (error) console.warn('[SUPABASE PUSH REQUESTS NOTICE]:', error.message);
            else console.log('⚡ [SUPABASE PUSH SUCCESS]: All requests synced to Supabase!');
          } catch(sbErr) {
            console.warn('[SUPABASE PUSH EXCEPTION]:', sbErr);
          }
        }

        // PUSH STORE LIST TO SUPABASE TABLE 'toko_list'
        if (typeof getStoresFromDB === 'function') {
          const allStores = getStoresFromDB();
          if (allStores && allStores.length > 0) {
            const supaStores = allStores.map(s => ({
              id: s.id,
              full_name: s.fullName,
              area: s.area,
              store_code: s.storeCode,
              created_by: s.createdBy || 'ADMIN'
            }));
            try {
              await supabase.from('toko_list').upsert(supaStores);
            } catch(e) {}
          }
        }

        // PUSH TYPE LOOKUP KODE UNIT MAP TO SUPABASE SYSTEM ROW
        if (typeof getKodeUnitMap === 'function') {
          const unitMap = getKodeUnitMap();
          if (unitMap && Object.keys(unitMap).length > 0) {

            const systemUnitRow = {
              id: '__SYSTEM_KODE_UNIT_MAP__',
              no_surat: '__SYSTEM_KODE_UNIT_MAP__',
              tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
              toko: 'SYSTEM',
              area: 'ALL',
              jenis: 'SYSTEM',
              catatan: JSON.stringify(unitMap),
              items: [],
              photos: [],
              status: 'DONE',
              service_approve: true,
              created_by: 'SYSTEM',
              created_at: new Date().toISOString()
            };
            try {
              await supabase.from('permintaan_toko').upsert(systemUnitRow);
            } catch(e) {}
          }
        }

        const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
        const systemTtdRow = {
          id: '__SYSTEM_TTD_MAP__',
          no_surat: '__SYSTEM_TTD_MAP__',
          tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
          toko: 'SYSTEM',
          area: 'ALL',
          jenis: 'SYSTEM',
          catatan: JSON.stringify(ttdMap),
          items: [],
          photos: [],
          status: 'DONE',
          service_approve: true,
          created_by: 'SYSTEM',
          created_at: new Date().toISOString()
        };
        await supabase.from('permintaan_toko').upsert(systemTtdRow);
      } catch (sbErr) {
        console.warn('[SUPABASE PUSH NOTICE]:', sbErr);
      }
    }

    if (dbFirestore) {
      try {
        // 1. PUSH REQUESTS
        const reqBatch = dbFirestore.batch();
        requests.forEach(r => {
          if (r && r.noSurat) {
            const docId = r.noSurat.replace(/[\/\.]/g, '_');
            const docRef = dbFirestore.collection('requests').doc(docId);
            reqBatch.set(docRef, r, { merge: true });
          }
        });
        await reqBatch.commit();

        // 2. PUSH USERS MASTER DATA
        const users = getUsersFromDB();
        const userBatch = dbFirestore.batch();
        users.forEach(u => {
          if (u && u.username) {
            const docId = String(u.username).toUpperCase();
            const docRef = dbFirestore.collection('users').doc(docId);
            userBatch.set(docRef, u, { merge: true });
          }
        });
        await userBatch.commit();

        // 3. PUSH APP CONFIG, NOTIFICATIONS, CHAT MESSAGES, CHAT ROOMS, THEME, FONTE TOKEN, KODE UNIT MAP
        const notifs = getSystemNotifications();
        const chatMsgs = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
        const chatRooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');
        const theme = appStorage.getItem(THEME_KEY) || 'dark-mode';
        const designMode = getSavedDesignMode();
        const fonteToken = getFonteToken();
        const adminReminder = getAdminReminderEnabled();
        const adminReminderTime = getAdminReminderTime();
        const featurePhotos = getFeaturePhotosEnabled();
        const kodeUnitMap = getKodeUnitMap();

        const firebaseCfgStr = appStorage.getItem(FIREBASE_USER_CONFIG_KEY);
        let parsedFbCfg = null;
        try { if (firebaseCfgStr) parsedFbCfg = JSON.parse(firebaseCfgStr); } catch(e) {}

        await dbFirestore.collection('app_settings').doc('config').set({
          notifications: notifs,
          chatMessages: chatMsgs,
          chatRooms: chatRooms,
          theme: theme,
          designMode: designMode,
          fonteToken: fonteToken,
          adminReminder: adminReminder,
          adminReminderTime: adminReminderTime,
          featurePhotos: featurePhotos,
          kodeUnitMap: kodeUnitMap,
          firebaseConfig: parsedFbCfg,
          updatedAt: new Date().toISOString()
        }, { merge: true });

      } catch (err) {
        console.warn("[FIREBASE PUSH NOTICE]:", err.message);
      }
    }

    if (dbRealtime) {
      try {
        const requests = getRequestsFromDB();
        const users = getUsersFromDB();
        const notifs = getSystemNotifications();
        const chatMsgs = JSON.parse(appStorage.getItem(CHAT_MESSAGES_KEY) || '[]');

        dbRealtime.ref('requests').set(requests);
        dbRealtime.ref('users').set(users);
        dbRealtime.ref('notifications').set(notifs);
        dbRealtime.ref('chat_messages').set(chatMsgs);
        dbRealtime.ref('settings').set({
          theme: appStorage.getItem(THEME_KEY) || 'dark-mode',
          fonteToken: getFonteToken(),
          adminReminder: getAdminReminderEnabled(),
          adminReminderTime: getAdminReminderTime(),
          featurePhotos: getFeaturePhotosEnabled()
        });
      } catch (err) {
        console.warn("[FIREBASE REALTIME PUSH NOTICE]:", err.message);
      }
    }
  } catch (err) {
    console.warn('[PUSH CENTRAL CLOUD NOTICE]:', err);
  }
}

function updateCloudStatusUI(isOnline) {
  if (typeof updateSupabaseStatusUI === 'function') {
    updateSupabaseStatusUI(isOnline);
  }
}

function getFeaturePhotosEnabled() {
  const val = appStorage.getItem(FEATURE_PHOTOS_KEY);
  return val !== 'false';
}

function setFeaturePhotosEnabled(enabled) {
  const valStr = enabled ? 'true' : 'false';
  appStorage.setItem(FEATURE_PHOTOS_KEY, valStr);
  updatePhotoSectionVisibility();

  if (typeof dbFirestore !== 'undefined' && dbFirestore) {
    try {
      dbFirestore.collection('app_settings').doc('config').set({
        featurePhotos: valStr,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch(e) {}
  }

  if (typeof dbRealtime !== 'undefined' && dbRealtime) {
    try {
      dbRealtime.ref('settings/featurePhotos').set(valStr);
    } catch(e) {}
  }

  if (typeof supabase !== 'undefined' && supabase) {
    try {
      supabase.from('lookup').upsert({ code: 'FEATURE_PHOTOS', type: valStr }).then(({ error }) => {
        if (error) console.warn('[SUPABASE FEATURE PHOTOS ERROR]:', error.message);
      });
    } catch(e) {}
  }

  pushCentralCloudDB();
}

function toggleFeaturePhotoAdmin() {
  const current = getFeaturePhotosEnabled();
  const next = !current;
  setFeaturePhotosEnabled(next);
  showNotif(next ? 'FITUR UPLOAD FOTO SEKARANG AKTIF (ON)!' : 'FITUR UPLOAD FOTO NONAKTIF (OFF)!', 'info');
}

function updatePhotoSectionVisibility() {
  const section = document.getElementById('sectionUploadFoto');
  const isEnabled = getFeaturePhotosEnabled();

  if (section) {
    section.style.display = isEnabled ? 'block' : 'none';
  }

  const statusText = document.getElementById('photoFeatureStatusText');
  if (statusText) {
    statusText.textContent = isEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)';
    statusText.style.color = isEnabled ? '#10b981' : '#ef4444';
  }

  const adminCard = document.getElementById('adminPhotoControlContainer');
  if (adminCard) {
    adminCard.style.display = (currentUser && (currentUser.category === 'ADMIN' || currentUser.username === 'ADMIN')) ? 'flex' : 'none';
  }

  if (typeof loadRiwayat === 'function' && document.getElementById('riwayatPage')?.classList.contains('active')) {
    loadRiwayat();
  }
}

function normalizeUserList(users) {
  if (!Array.isArray(users)) return [];

  const seen = new Set();
  const cleaned = [];

  users.forEach(user => {
    if (!user || !user.username) return;
    const username = String(user.username).trim();
    if (!username) return;
    const key = username.toUpperCase();
    if (seen.has(key)) return;
    seen.add(key);

    cleaned.push({
      ...user,
      username,
      fullName: String(user.fullName || '').trim(),
      password: String(user.password || '').trim(),
      storeCode: String(user.storeCode || '').trim().toUpperCase(),
      phone: String(user.phone || '').trim(),
      category: String(user.category || 'TOKO').trim().toUpperCase(),
      area: String(user.area || 'BDG').trim().toUpperCase()
    });
  });

  return cleaned;
}

function clearAllAppCacheAndData(force = false) {
  if (!force) {
    console.warn('clearAllAppCacheAndData blocked: destructive reset disabled to protect active app data.');
    return false;
  }

  try {
    if (window.appStorage) {
      window.appStorage.clear();
    }
  } catch (err) {}

  try {
    const keysToRemove = Object.keys(localStorage || {});
    keysToRemove.forEach(key => {
      if (String(key).startsWith('STORE_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {}

  try {
    if (typeof caches !== 'undefined' && caches.keys) {
      caches.keys().then(names => names.forEach(n => caches.delete(n))).catch(() => {});
    }
  } catch (err) {}

  const sessionKeys = [
    SESSION_KEY, THEME_KEY, USERS_DB_KEY, REQUESTS_DB_KEY, CHAT_DB_KEY, CHAT_ROOM_DB_KEY,
    TTD_DB_KEY, STORES_DB_KEY, DELETED_STORES_KEY, NOTIFICATIONS_DB_KEY, KODE_UNIT_MAP_KEY,
    FEATURE_PHOTOS_KEY, DELETED_REQUESTS_KEY, DELETED_USERS_KEY, FONTE_TOKEN_KEY,
    ADMIN_REMINDER_KEY, ADMIN_SECRET_KEY_STORAGE_KEY, ADMIN_SCRIPT_URL_KEY
  ];

  sessionKeys.forEach(key => {
    try { localStorage.removeItem(key); } catch (err) {}
    try { window.appStorage?.removeItem?.(key); } catch (err) {}
  });

  if (window.appStorage) {
    window.appStorage.setItem(USERS_DB_KEY, JSON.stringify([...SEED_USERS]));
    window.appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify([]));
    window.appStorage.setItem(CHAT_DB_KEY, JSON.stringify([]));
    window.appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify([]));
    window.appStorage.setItem(TTD_DB_KEY, JSON.stringify({}));
    window.appStorage.setItem(KODE_UNIT_MAP_KEY, JSON.stringify({}));
    window.appStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify([]));
    window.appStorage.setItem(DELETED_USERS_KEY, JSON.stringify([]));
  }

  return true;
}

function getAdminScriptUrl() {
  return (appStorage.getItem(ADMIN_SCRIPT_URL_KEY) || '').trim();
}

function saveAdminScriptUrl(url) {
  const clean = (url || '').trim();
  if (clean) appStorage.setItem(ADMIN_SCRIPT_URL_KEY, clean);
  else appStorage.removeItem(ADMIN_SCRIPT_URL_KEY);
}

function togglePasswordVisibility() {
  const pswInput = document.getElementById('password');
  const icon = document.getElementById('togglePasswordIcon');
  if (!pswInput || !icon) return;

  if (pswInput.type === 'password') {
    pswInput.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    pswInput.type = 'password';
    icon.textContent = 'visibility';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function loadAdminScriptUrlInput() {
  const input = document.getElementById('adminScriptUrlInput');
  if (input) input.value = getAdminScriptUrl();
}

function simpanAdminScriptUrl() {
  const input = document.getElementById('adminScriptUrlInput');
  const value = input ? input.value.trim() : '';
  saveAdminScriptUrl(value);
  showNotif(value ? 'URL GOOGLE APPS SCRIPT BERHASIL DISIMPAN!' : 'URL GOOGLE APPS SCRIPT DIHAPUS!', 'info');
}

function generateStoreCode(storeName, targetArea = '') {
  const cleanName = String(storeName || '').trim().toUpperCase();
  if (!cleanName) return 'TK';

  let stores = [];
  try {
    const raw = appStorage.getItem(STORES_DB_KEY);
    if (raw) stores = JSON.parse(raw);
  } catch (e) {}
  if (!Array.isArray(stores)) stores = [];

  const existingMatch = stores.find(s => s && s.fullName && s.fullName.trim().toUpperCase() === cleanName && (!targetArea || s.area === targetArea));
  if (existingMatch && existingMatch.storeCode) {
    return existingMatch.storeCode;
  }

  const takenCodes = new Set();
  stores.forEach(s => {
    if (s && s.storeCode && s.fullName && s.fullName.trim().toUpperCase() !== cleanName) {
      takenCodes.add(String(s.storeCode).trim().toUpperCase());
    }
  });

  try {
    const rawUsers = appStorage.getItem(USERS_DB_KEY);
    if (rawUsers) {
      const uList = JSON.parse(rawUsers);
      if (Array.isArray(uList)) {
        uList.forEach(u => {
          if (u && u.storeCode && u.fullName && u.fullName.trim().toUpperCase() !== cleanName) {
            takenCodes.add(String(u.storeCode).trim().toUpperCase());
          }
        });
      }
    }
  } catch(e) {}

  const words = cleanName.replace(/[^A-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'TK';

  const candidates = [];

  if (words.length >= 2) {
    candidates.push(words.map(w => w[0]).join(''));
  }

  if (words[0].length >= 2) {
    candidates.push(words[0].substring(0, 2));
  }

  if (words.length >= 2 && words[1].length >= 2) {
    candidates.push(words[0][0] + words[1][1]);
  }

  if (words[0].length >= 3) {
    candidates.push(words[0][0] + words[0][2]);
  }

  if (words[0].length >= 4) {
    candidates.push(words[0][0] + words[0][3]);
  }

  if (words.length >= 2 && words[0].length >= 2) {
    candidates.push(words[0].substring(0, 2) + words[1][0]);
  }

  if (words[0].length >= 3) {
    candidates.push(words[0].substring(0, 3));
  }

  if (words.length >= 2 && words[0].length >= 2 && words[1].length >= 2) {
    candidates.push(words[0].substring(0, 2) + words[1].substring(0, 2));
  }

  for (let cand of candidates) {
    cand = cand.trim().toUpperCase();
    if (cand && !takenCodes.has(cand)) {
      return cand;
    }
  }

  const baseCode = (words.length >= 2 ? (words[0][0] + words[1][0]) : words[0].substring(0, 2)).toUpperCase();
  let counter = 2;
  while (takenCodes.has(`${baseCode}${counter}`)) {
    counter++;
  }
  return `${baseCode}${counter}`;
}
window.generateStoreCode = generateStoreCode;

function getStoresFromDB() {
  let stores = [];
  try {
    const raw = appStorage.getItem(STORES_DB_KEY);
    if (raw) stores = JSON.parse(raw);
  } catch (e) {
    stores = [];
  }

  if (!Array.isArray(stores)) stores = [];

  const delStores = new Set(
    (JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]') || [])
      .filter(Boolean)
      .map(v => String(v).trim().toUpperCase())
  );
  const delUsers = new Set(
    (JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]') || [])
      .filter(Boolean)
      .map(v => String(v).trim().toUpperCase())
  );

  // Filter out any stores that were deleted
  stores = stores.filter(s => {
    if (!s || !s.fullName) return false;
    const sId = String(s.id || '').toUpperCase();
    const sName = String(s.fullName).trim().toUpperCase();
    const sArea = String(s.area || '').trim().toUpperCase();
    const sKey = `${sName}_${sArea}`;
    if (delStores.has(sId) || delStores.has(sName) || delStores.has(sKey)) return false;
    if (delUsers.has(sId) || delUsers.has(sName)) return false;
    return true;
  });

  const users = (typeof getUsersFromDB === 'function' ? getUsersFromDB() : []);
  users.forEach(u => {
    if (u && u.category === 'TOKO' && u.fullName) {
      const uName = String(u.fullName).trim().toUpperCase();
      const uArea = String(u.area || 'BDG').trim().toUpperCase();
      const uKey = `${uName}_${uArea}`;
      if (delStores.has(uName) || delStores.has(uKey) || delUsers.has(String(u.id || '').toUpperCase()) || delUsers.has(String(u.username || '').toUpperCase())) {
        return;
      }
      const exists = stores.some(s => s && s.fullName && s.fullName.trim().toUpperCase() === uName && (!s.area || s.area === uArea));
      if (!exists) {
        stores.push({
          id: u.id || `STK-${u.username}`,
          fullName: u.fullName,
          area: u.area || 'BDG',
          storeCode: u.storeCode || generateStoreCode(u.fullName, u.area),
          createdBy: 'SYSTEM'
        });
      }
    }
  });

  const assignedCodes = new Set();
  stores.forEach(s => {
    if (!s) return;
    const name = String(s.fullName || '').trim().toUpperCase();
    if (!s.storeCode || assignedCodes.has(s.storeCode.toUpperCase())) {
      s.storeCode = generateStoreCode(name, s.area);
    }
    assignedCodes.add(s.storeCode.toUpperCase());
  });

  return stores;
}
window.getStoresFromDB = getStoresFromDB;

function getUsersFromDB() {
  let users = [];
  try {
    users = JSON.parse(appStorage.getItem(USERS_DB_KEY) || '[]');
  } catch (e) {
    users = [];
  }

  users = normalizeUserList(users);

  try {
    const deletedUserIds = JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]');
    if (Array.isArray(deletedUserIds) && deletedUserIds.length > 0) {
      users = users.filter(u => u && !deletedUserIds.includes(u.id) && !deletedUserIds.includes(u.username));
    }
  } catch (e) {}

  const defaultUsernamesToRemove = ['SERVICE_TSM', 'DM_TSM', 'TOKO_1', 'SALES_1'];
  let updated = false;

  users = users.filter(u => {
    if (u && u.username && defaultUsernamesToRemove.includes(String(u.username).toUpperCase())) {
      updated = true;
      return false;
    }
    return true;
  });

  const adminIndex = users.findIndex(u => u && u.username && String(u.username).toUpperCase() === 'ADMIN');
  if (adminIndex !== -1) {
    if (users[adminIndex].password !== '0') {
      users[adminIndex].password = '0';
      updated = true;
    }
  } else {
    users.push({ ...SEED_USERS[0] });
    updated = true;
  }

  if (updated || !users.length) {
    users = normalizeUserList(users.length ? users : [...SEED_USERS]);
    appStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  return users;
}

function saveUsersToDB(users) {
  const normalizedUsers = normalizeUserList(Array.isArray(users) ? users : []);
  appStorage.setItem(USERS_DB_KEY, JSON.stringify(normalizedUsers));
  pushCentralCloudDB();
  if (currentUser) {
    loadDashboard();
    loadRiwayat();
    if (document.getElementById('userTableBody')) loadUsersManagement();
  }
}

function getRequestsFromDB() {
  const reqs = JSON.parse(appStorage.getItem(REQUESTS_DB_KEY) || '[]');
  return reqs.filter(r => r && r.noSurat && !String(r.noSurat).startsWith('__SYSTEM_'));
}

function saveRequestsToDB(requests) {
  appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(requests));
  pushCentralCloudDB();
  if (currentUser) {
    loadDashboard();
    loadRiwayat();
  }
}

function getFonteToken() {
  return appStorage.getItem(FONTE_TOKEN_KEY) || '';
}

function simpanFonteToken() {
  const input = document.getElementById('fonteTokenInput');
  const token = input ? input.value.trim() : '';
  appStorage.setItem(FONTE_TOKEN_KEY, token);
  pushCentralCloudDB();
  showNotif(token ? 'TOKEN WA FONTE BERHASIL DISIMPAN!' : 'TOKEN WA DIKOSONGKAN!', 'info');
}

function loadFonteToken() {
  const input = document.getElementById('fonteTokenInput');
  if (input) {
    input.value = getFonteToken();
  }
}

function getAppDirectLink(noSurat) {
  if (!noSurat) return '';
  try {
    const rawNoSurat = String(noSurat).trim();
    
    const customBaseUrl = typeof appStorage !== 'undefined' ? appStorage.getItem('CUSTOM_APP_BASE_URL') : null;
    if (customBaseUrl && String(customBaseUrl).startsWith('http')) {
      const cleanCustom = customBaseUrl.endsWith('/') ? customBaseUrl : (customBaseUrl + '/');
      return `${cleanCustom}index.html?noSurat=${encodeURIComponent(rawNoSurat)}`;
    }

    if (window.location && window.location.href && (window.location.href.startsWith('http://') || window.location.href.startsWith('https://'))) {
      const originPath = window.location.origin + window.location.pathname;
      return `${originPath}?noSurat=${encodeURIComponent(rawNoSurat)}`;
    }
    
    return `https://jabargroup.github.io/PermintaanToko/index.html?noSurat=${encodeURIComponent(rawNoSurat)}`;
  } catch (e) {
    return `https://jabargroup.github.io/PermintaanToko/index.html?noSurat=${encodeURIComponent(noSurat)}`;
  }
}
window.getAppDirectLink = getAppDirectLink;

async function checkUrlDirectNoSuratOpen() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let targetNoSurat = urlParams.get('noSurat');
    if (!targetNoSurat) return;

    const decodedNoSurat = decodeURIComponent(targetNoSurat).trim();
    if (!decodedNoSurat) return;

    window.PENDING_URL_NO_SURAT = decodedNoSurat;

    const executeOpenDetail = async () => {
      const currentTarget = window.PENDING_URL_NO_SURAT;
      if (!currentTarget) return;

      if (typeof lihatDetail === 'function') {
        const opened = await lihatDetail(currentTarget, true);
        if (opened) {
          window.PENDING_URL_NO_SURAT = null;
        }
      }
    };

    setTimeout(executeOpenDetail, 200);
    setTimeout(executeOpenDetail, 800);
    setTimeout(executeOpenDetail, 2000);
    setTimeout(executeOpenDetail, 4000);
  } catch(e) {}
}
window.checkUrlDirectNoSuratOpen = checkUrlDirectNoSuratOpen;

const sentWaCache = {};

function formatCleanPhoneList(targetPhone) {
  if (!targetPhone || targetPhone === '-' || String(targetPhone).trim() === '') return [];
  
  const rawStr = String(targetPhone).trim();
  const parts = rawStr.split(/[\s;,/|&\n]+/);
  
  const cleanedList = [];
  parts.forEach(rawPart => {
    let part = rawPart.trim();
    if (!part || part.length < 5) return;
    
    // Check if target is a WhatsApp Group ID (contains '@g.us', '-', or starts with '120')
    const isGroup = part.includes('@g.us') || part.includes('-') || part.startsWith('120');

    if (isGroup) {
      let groupTarget = part;
      if (!groupTarget.includes('@g.us') && (groupTarget.includes('-') || groupTarget.startsWith('120'))) {
        groupTarget = groupTarget + '@g.us';
      }
      if (!cleanedList.includes(groupTarget)) {
        cleanedList.push(groupTarget);
      }
    } else {
      let clean = part.replace(/[^0-9]/g, '');
      if (!clean || clean.length < 5) return;
      
      if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
      } else if (!clean.startsWith('62') && clean.length <= 13) {
        clean = '62' + clean;
      }
      
      if (!cleanedList.includes(clean)) {
        cleanedList.push(clean);
      }
    }
  });
  
  return cleanedList;
}
window.formatCleanPhoneList = formatCleanPhoneList;

function kirimNotifikasiWA(targetPhone, message) {
  if (!targetPhone || targetPhone === '-' || String(targetPhone).trim() === '') return false;

  const token = getFonteToken();
  if (!token) return false;

  const phoneList = formatCleanPhoneList(targetPhone);
  if (!phoneList || phoneList.length === 0) return false;

  let anySent = false;

  phoneList.forEach(cleanPhone => {
    const msgHash = `${cleanPhone}_${String(message).trim()}`;
    const now = Date.now();
    if (sentWaCache[msgHash] && (now - sentWaCache[msgHash]) < 60000) {
      console.log('[WA SKIPPED - DUPLICATE PREVENTED]:', cleanPhone);
      return;
    }
    sentWaCache[msgHash] = now;

    const formData = new FormData();
    formData.append('target', cleanPhone);
    formData.append('message', message);
    formData.append('countryCode', '62');

    fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: formData
    }).then(res => res.json()).then(data => {
      console.log('[FONTE WA API RESPONSE]:', cleanPhone, data);
    }).catch(err => {
      console.error('[FONTE WA API ERROR]:', cleanPhone, err);
    });

    anySent = true;
  });

  return anySent;
}
window.kirimNotifikasiWA = kirimNotifikasiWA;

async function setGlobalAdminTheme(themeId) {
  if (!themeId) return;
  const nowTime = Date.now();
  const themeObj = { theme: themeId, time: nowTime, admin: currentUser ? currentUser.username : 'ADMIN' };
  const themeStr = JSON.stringify(themeObj);

  appStorage.setItem(GLOBAL_THEME_KEY, themeId);
  appStorage.setItem(THEME_KEY, themeId);
  appStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, String(nowTime));

  try { localStorage.setItem(GLOBAL_THEME_KEY, themeId); } catch(e) {}
  try { localStorage.setItem(THEME_KEY, themeId); } catch(e) {}
  try { localStorage.setItem('APP_SELECTED_THEME', themeId); } catch(e) {}
  try { localStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, String(nowTime)); } catch(e) {}

  const idx = THEME_MODES.findIndex(m => m.id === themeId);
  if (idx !== -1) currentThemeIndex = idx;
  updateBodyClasses(themeId);

  const sb = (typeof supabase !== 'undefined' && supabase) ? supabase : null;
  if (sb) {
    try {
      const themeRow = {
        id: '__SYSTEM_GLOBAL_THEME__',
        no_surat: '__SYSTEM_GLOBAL_THEME__',
        tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
        toko: 'SYSTEM',
        area: 'ALL',
        jenis: 'SYSTEM',
        catatan: themeStr,
        items: [],
        photos: [],
        status: 'DONE',
        service_approve: true,
        created_by: 'SYSTEM',
        created_at: new Date().toISOString()
      };
      await sb.from('permintaan_toko').upsert(themeRow);
      console.log('⚡ [SUPABASE GLOBAL THEME BROADCAST SUCCESS]:', themeId);
    } catch(err) {
      console.warn('[SUPABASE GLOBAL THEME BROADCAST NOTICE]:', err);
    }
  }

  if (typeof dbFirestore !== 'undefined' && dbFirestore) {
    try {
      await dbFirestore.collection('app_settings').doc('global_theme').set(themeObj, { merge: true });
    } catch(e) {}
  }
  if (typeof dbRealtime !== 'undefined' && dbRealtime) {
    try {
      await dbRealtime.ref('settings/global_theme').set(themeObj);
    } catch(e) {}
  }
}
window.setGlobalAdminTheme = setGlobalAdminTheme;

async function bersihkanFotoSupabase(mode = 'SELESAI') {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  if (!isSysAdmin) {
    showNotif('HANYA ADMIN UTAMA YANG MEMILIKI HAK AKSES BERSIHKAN FOTO SUPABASE!', 'warning');
    return;
  }

  const modeText = mode === 'SEMUA' ? 'SEMUA FOTO DOKUMEN' : 'FOTO DOKUMEN STATUS SELESAI & REJECT';
  showConfirm(`APAKAH ANDA YAKIN INGIN MENGHAPUS ${modeText} DARI SUPABASE CLOUD?\n\n(Tindakan ini akan mengosongkan data foto untuk menghemat kuota penyimpanan database. Rincian data permintaan tidak akan terhapus).`, async () => {
    showLoading('MEMPROSES PEMBERSIHAN FOTO DI SUPABASE CLOUD...');
    try {
      const sb = (typeof supabase !== 'undefined' && supabase) ? supabase : null;
      let countUpdated = 0;
      let allPhotoUrlsToDelete = [];

      // 1. Fetch target records from Supabase
      if (sb) {
        let query = sb.from('permintaan_toko').select('no_surat, photos, status');
        if (mode !== 'SEMUA') {
          query = query.in('status', ['DONE', 'REJECT', 'SELESAI', 'DONE_SERVICE']);
        }
        const { data: rows, error: fetchErr } = await query;
        if (!fetchErr && Array.isArray(rows)) {
          for (const row of rows) {
            if (row.no_surat && row.no_surat.startsWith('PRMT/')) {
              let pArr = [];
              if (Array.isArray(row.photos)) {
                pArr = row.photos;
              } else if (typeof row.photos === 'string' && row.photos.trim()) {
                try { pArr = JSON.parse(row.photos); } catch(e) {}
              }

              if (Array.isArray(pArr) && pArr.length > 0) {
                allPhotoUrlsToDelete.push(...pArr);
                countUpdated++;
              }
              // Update row in Supabase table
              await sb.from('permintaan_toko').update({ photos: [] }).eq('no_surat', row.no_surat);
            }
          }
        }
      }

      // 2. Delete collected files from Supabase Storage buckets if any exist
      if (allPhotoUrlsToDelete.length > 0 && typeof deletePhotosFromSupabaseStorage === 'function') {
        await deletePhotosFromSupabaseStorage(allPhotoUrlsToDelete);
      }

      // 3. Update local requests cache
      const requests = getRequestsFromDB();
      requests.forEach(r => {
        if (mode === 'SEMUA' || r.status === 'DONE' || r.status === 'REJECT' || r.status === 'SELESAI' || r.status === 'DONE_SERVICE') {
          r.photos = [];
        }
      });
      saveRequestsToDB(requests);

      if (typeof syncSupabaseRequestsToLocalCache === 'function') {
        await syncSupabaseRequestsToLocalCache();
      }

      hideLoading();
      showNotif(`BERHASIL MENGHAPUS FOTO DARI SUPABASE CLOUD & STORAGE! (${countUpdated} DOKUMEN DIBERSIHKAN)`, 'info');
      loadRiwayat();
      loadDashboard();
    } catch(err) {
      hideLoading();
      console.error('[SUPABASE DELETE PHOTOS ERROR]:', err);
      showNotif(`GAGAL MENGHAPUS FOTO DI SUPABASE: ${err.message || err}`, 'warning');
    }
  });
}
window.bersihkanFotoSupabase = bersihkanFotoSupabase;

async function hapusSemuaFotoBiasa() {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  if (!isSysAdmin) {
    showNotif('HANYA ADMIN YANG DAPAT MENGHAPUS FOTO!', 'warning');
    return;
  }

  showConfirm('APAKAH ANDA YAKIN INGIN MENGHAPUS SEMUA FOTO DARI APLIKASI DAN BUCKET STORAGE SUPABASE?', async () => {
    showLoading('MENGHAPUS SEMUA FOTO DARI SUPABASE CLOUD & BUCKET...');
    try {
      let totalStorageFilesDeleted = 0;
      const candidateBuckets = ['photos', 'permintaan_photos', 'foto-permintaan', 'request-photos', 'documents'];

      if (typeof supabase !== 'undefined' && supabase) {
        // 1. Direct empty files in Storage buckets (photos, etc.)
        for (const bucketName of candidateBuckets) {
          try {
            const { data: fileList, error: listErr } = await supabase.storage.from(bucketName).list('', { limit: 1000, offset: 0 });
            if (!listErr && Array.isArray(fileList) && fileList.length > 0) {
              const names = fileList.map(f => f.name).filter(n => n && n !== '.emptyFolderPlaceholder');
              if (names.length > 0) {
                const { data: delData, error: delErr } = await supabase.storage.from(bucketName).remove(names);
                if (!delErr) {
                  totalStorageFilesDeleted += names.length;
                  console.log(`⚡ [SUPABASE STORAGE BUCKET ${bucketName} CLEANED]:`, names.length, 'file(s) deleted.');
                }
              }
            }
          } catch(eStorage) {
            console.warn(`[SUPABASE BUCKET ${bucketName} NOTICE]:`, eStorage);
          }
        }

        // 2. Clear photos column in Supabase table
        try {
          await supabase.from('permintaan_toko').update({ photos: [] }).neq('no_surat', '');
        } catch(eTbl) {
          console.warn('[SUPABASE TABLE PHOTOS NOTICE]:', eTbl);
        }
      }

      // 3. Clear local cache requests
      const requests = getRequestsFromDB();
      requests.forEach(r => { r.photos = []; });
      saveRequestsToDB(requests);

      if (typeof syncSupabaseRequestsToLocalCache === 'function') {
        await syncSupabaseRequestsToLocalCache();
      }

      hideLoading();
      showNotif(`SEMUA FOTO BERHASIL DIHAPUS DARI BUCKET STORAGE SUPABASE & DATABASE! (${totalStorageFilesDeleted} BERKAS FOTO DIBERSIHKAN)`, 'info');
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (typeof loadDashboard === 'function') loadDashboard();
    } catch (err) {
      hideLoading();
      console.error('[HAPUS FOTO ERROR]:', err);
      showNotif('GAGAL MENGHAPUS FOTO: ' + (err.message || err), 'warning');
    }
  });
}
window.hapusSemuaFotoBiasa = hapusSemuaFotoBiasa;

async function hapusFotoDokumenBiasa(noSurat) {
  if (!noSurat) return;
  showConfirm(`HAPUS FOTO PADA DOKUMEN #${noSurat}?`, async () => {
    showLoading('MENGHAPUS FOTO DOKUMEN...');
    try {
      const requests = getRequestsFromDB();
      const idx = requests.findIndex(r => r.noSurat === noSurat);
      let photoUrls = [];
      if (idx !== -1) {
        photoUrls = [...(requests[idx].photos || [])];
        requests[idx].photos = [];
        saveRequestsToDB(requests);
      }

      if (typeof supabase !== 'undefined' && supabase) {
        // Delete from Storage buckets
        if (photoUrls.length > 0 && typeof deletePhotosFromSupabaseStorage === 'function') {
          await deletePhotosFromSupabaseStorage(photoUrls);
        }
        // Update table row
        await supabase.from('permintaan_toko').update({ photos: [] }).eq('no_surat', noSurat);
      }

      hideLoading();
      showNotif(`FOTO DOKUMEN #${noSurat} BERHASIL DIHAPUS!`, 'info');
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (typeof loadDashboard === 'function') loadDashboard();

      const modal = document.getElementById('popupDetailBarangV2') || document.getElementById('popupDetail');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('show'); }
    } catch(err) {
      hideLoading();
      showNotif('GAGAL MENGHAPUS FOTO: ' + (err.message || err), 'warning');
    }
  });
}
window.hapusFotoDokumenBiasa = hapusFotoDokumenBiasa;

function loadSavedTheme() {
  updateBodyClasses();
}

function toggleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % THEME_MODES.length;
  const t = THEME_MODES[currentThemeIndex];
  const now = Date.now();

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('APP_SELECTED_THEME', t.id);
    }
  } catch(e) {}
  appStorage.setItem(THEME_KEY, t.id);
  appStorage.setItem(LOCAL_USER_THEME_KEY, t.id);
  appStorage.setItem('STORE_USER_THEME_TIME', String(now));
  updateBodyClasses();

  if (currentUser) {
    currentUser.theme = t.id;
  }

  // JIKA AKUN YANG LOGIN ADALAH ADMIN, DISINKRONKAN TEMA KE SELURUH PERANGKAT REALTIME VIA CLOUD
  const isAdminUser = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  if (isAdminUser) {
    appStorage.setItem(GLOBAL_THEME_KEY, t.id);
    appStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, String(now));

    if (typeof supabase !== 'undefined' && supabase) {
      const themePayload = {
        id: '__SYSTEM_GLOBAL_THEME__',
        no_surat: '__SYSTEM_GLOBAL_THEME__',
        tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
        toko: 'SYSTEM',
        area: 'ALL',
        jenis: 'SYSTEM',
        catatan: JSON.stringify({ theme: t.id, time: now, by: currentUser.username }),
        items: [],
        photos: [],
        status: 'DONE',
        service_approve: true,
        created_by: currentUser.fullName || 'ADMIN',
        created_at: new Date().toISOString()
      };

      supabase.from('permintaan_toko').upsert(themePayload).then(({ error }) => {
        if (!error) {
          console.log('⚡ [SUPABASE GLOBAL THEME SYNC SUCCESS]: Tema disebar ke semua perangkat!', t.id);
          showNotif(`TEMA '${t.name.toUpperCase()}' BERHASIL DISINKRONKAN KE SEMUA PERANGKAT!`, 'info');
        }
      }).catch(e => console.warn('[SUPABASE GLOBAL THEME EXCEPTION]:', e));
    }
  }

  if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB();
}

function updateThemeIcon() {
  const iconSpans = document.querySelectorAll('.theme-toggle-btn span, .popupThemeToggleBtn span, .theme-icon-btn span, .theme-toggle-inline span');
  const currentIcon = THEME_MODES[currentThemeIndex] ? THEME_MODES[currentThemeIndex].icon : 'palette';
  iconSpans.forEach(el => {
    if (el) el.textContent = currentIcon;
  });
}

const STORE_REMEMBER_LOGIN_CREDS_KEY = 'STORE_REMEMBER_LOGIN_CREDS_V1';

async function clearLocalStorageKeepThemeAndTTD() {
  try {
    // 1. BACK UP THEME SETTINGS
    const globalTheme = appStorage.getItem(GLOBAL_THEME_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(GLOBAL_THEME_KEY) : null);
    const localUserTheme = appStorage.getItem(LOCAL_USER_THEME_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_USER_THEME_KEY) : null);
    const lastAdminThemeTime = appStorage.getItem(LAST_ADMIN_THEME_TIME_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_ADMIN_THEME_TIME_KEY) : null);
    const appTheme = appStorage.getItem(THEME_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null);
    const appSelectedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem('APP_SELECTED_THEME') : null);

    // 2. BACK UP DIGITAL SIGNATURES (TTD)
    const ttdDbMap = appStorage.getItem(TTD_DB_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(TTD_DB_KEY) : null);
    const appUserTtdMap = (typeof localStorage !== 'undefined' ? localStorage.getItem('APP_USER_TTD_MAP') : null);

    const localTtdEntries = [];
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('LOCAL_TTD_') || key.startsWith('TTD_') || key.includes('TTD'))) {
          localTtdEntries.push({ key, value: localStorage.getItem(key) });
        }
      }
    }

    // 3. BACK UP ESSENTIAL CREDENTIALS & CONFIG
    const rememberCreds = appStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY) : null);
    const fonteToken = typeof getFonteToken === 'function' ? getFonteToken() : '';
    const secretKey = typeof getSavedAdminSecretKey === 'function' ? getSavedAdminSecretKey() : '';
    const fbConfig = appStorage.getItem(FIREBASE_USER_CONFIG_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem(FIREBASE_USER_CONFIG_KEY) : null);

    // 4. CLEAR STORAGE & BROWSER CACHES
    if (typeof appStorage !== 'undefined' && appStorage.clear) {
      appStorage.clear();
    }
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}

    if ('caches' in window && caches.keys) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch(e) {}
    }

    // 5. RESTORE THEME SETTINGS
    if (globalTheme) {
      appStorage.setItem(GLOBAL_THEME_KEY, globalTheme);
      try { localStorage.setItem(GLOBAL_THEME_KEY, globalTheme); } catch(e) {}
    }
    if (localUserTheme) {
      appStorage.setItem(LOCAL_USER_THEME_KEY, localUserTheme);
      try { localStorage.setItem(LOCAL_USER_THEME_KEY, localUserTheme); } catch(e) {}
    }
    if (lastAdminThemeTime) {
      appStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, lastAdminThemeTime);
      try { localStorage.setItem(LAST_ADMIN_THEME_TIME_KEY, lastAdminThemeTime); } catch(e) {}
    }
    if (appTheme) {
      appStorage.setItem(THEME_KEY, appTheme);
      try { localStorage.setItem(THEME_KEY, appTheme); } catch(e) {}
    }
    if (appSelectedTheme) {
      try { localStorage.setItem('APP_SELECTED_THEME', appSelectedTheme); } catch(e) {}
    }

    // 6. RESTORE DIGITAL SIGNATURES (TTD)
    if (ttdDbMap) {
      appStorage.setItem(TTD_DB_KEY, ttdDbMap);
      try { localStorage.setItem(TTD_DB_KEY, ttdDbMap); } catch(e) {}
    }
    if (appUserTtdMap) {
      try { localStorage.setItem('APP_USER_TTD_MAP', appUserTtdMap); } catch(e) {}
    }
    localTtdEntries.forEach(item => {
      if (item && item.key && item.value) {
        try { localStorage.setItem(item.key, item.value); } catch(e) {}
        try { appStorage.setItem(item.key, item.value); } catch(e) {}
      }
    });

    // 7. RESTORE ESSENTIAL CREDENTIALS & CONFIG
    if (rememberCreds) {
      appStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, rememberCreds);
      try { localStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, rememberCreds); } catch(e) {}
    }
    if (fonteToken) {
      appStorage.setItem(FONTE_TOKEN_KEY, fonteToken);
      try { localStorage.setItem(FONTE_TOKEN_KEY, fonteToken); } catch(e) {}
    }
    if (secretKey) {
      appStorage.setItem(ADMIN_SECRET_KEY_STORAGE_KEY, secretKey);
      try { localStorage.setItem(ADMIN_SECRET_KEY_STORAGE_KEY, secretKey); } catch(e) {}
    }
    if (fbConfig) {
      appStorage.setItem(FIREBASE_USER_CONFIG_KEY, fbConfig);
      try { localStorage.setItem(FIREBASE_USER_CONFIG_KEY, fbConfig); } catch(e) {}
    }

    // 8. RE-APPLY THEME IMMEDIATELY
    if (typeof applyThemeToDocument === 'function') {
      applyThemeToDocument();
    }
  } catch (err) {
    console.warn('[CLEAR LOCALSTORAGE KEEP THEME & TTD NOTICE]:', err);
  }
}
window.clearLocalStorageKeepThemeAndTTD = clearLocalStorageKeepThemeAndTTD;

function loadRememberedCredentials() {
  let savedCredsStr = null;
  try {
    savedCredsStr = appStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY);
    if (!savedCredsStr && typeof localStorage !== 'undefined') {
      savedCredsStr = localStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY);
    }
  } catch(e) {}

  const uEl = document.getElementById('username');
  const pEl = document.getElementById('password');
  const remEl = document.getElementById('rememberMe');

  if (savedCredsStr) {
    try {
      const creds = JSON.parse(savedCredsStr);
      if (creds && creds.username) {
        if (uEl) uEl.value = creds.username;
        if (pEl) pEl.value = creds.password || '';
        if (remEl) remEl.checked = true;
        return true;
      }
    } catch(e) {}
  }

  if (remEl) remEl.checked = true;
  return false;
}
window.loadRememberedCredentials = loadRememberedCredentials;

function autoLogin() {
  if (!currentUser) {
    try {
      const savedSession = appStorage.getItem(SESSION_KEY);
      if (savedSession) {
        currentUser = JSON.parse(savedSession);
      }
    } catch (e) {
      currentUser = null;
    }
  }

  if (typeof currentUser !== 'undefined' && currentUser !== null) {
    bukaMainApp();
  } else {
    pindahHalaman('loginPage');
    loadRememberedCredentials();
  }
}

async function prosesLogin() {
  const uEl = document.getElementById('username');
  const pEl = document.getElementById('password');
  if (!uEl || !pEl) return;

  const u = uEl.value.trim().toUpperCase();
  const p = pEl.value.trim();
  const remember = document.getElementById('rememberMe')?.checked === true;

  if (!u || !p) {
    showNotif('USERNAME DAN PASSWORD WAJIB DIISI!', 'warning');
    return;
  }

  try {
    // 1. CEK DULU DI PENYIMPANAN LOKAL (0 ms INSTANT)
    let users = getUsersFromDB();
    let user = users.find(x => x && x.username && String(x.username).trim().toUpperCase() === u && String(x.password).trim() === p);

    // 2. JIKA BELUM ADA DI LOKAL, CEK KE SUPABASE
    if (!user && typeof supabase !== 'undefined' && supabase) {
      try {
        const { data: supaUsers, error } = await supabase
          .from('users')
          .select('*')
          .ilike('username', u)
          .limit(1);

        if (!error && Array.isArray(supaUsers) && supaUsers.length > 0) {
          const su = supaUsers[0];
          if (String(su.password).trim() === p) {
            user = {
              id: su.id,
              username: String(su.username || '').trim(),
              password: String(su.password || '').trim(),
              fullName: String(su.full_name || su.fullName || '').trim(),
              storeCode: String(su.store_code || su.storeCode || '').trim(),
              phone: String(su.phone || '').trim(),
              category: String(su.category || 'TOKO').trim().toUpperCase(),
              area: String(su.area || 'BDG').trim().toUpperCase(),
              theme: su.theme || '',
              createdAt: su.created_at || (typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '')
            };

            // Simpan ke cache lokal
            const localUsers = getUsersFromDB();
            const uIdx = localUsers.findIndex(x => x && (x.id === user.id || String(x.username).toUpperCase() === user.username.toUpperCase()));
            if (uIdx !== -1) localUsers[uIdx] = user;
            else localUsers.push(user);
            saveUsersToDB(localUsers);
          }
        }
      } catch (sbErr) {
        console.warn('[SUPABASE LOGIN QUERY NOTICE]:', sbErr);
      }
    }

    if (user) {
      currentUser = user;

      if (user.theme) {
        appStorage.setItem(THEME_KEY, user.theme);
        try { localStorage.setItem('APP_SELECTED_THEME', user.theme); } catch(e) {}
        updateBodyClasses();
      }

      appStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (remember) {
        const credsStr = JSON.stringify({ username: u, password: p });
        appStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, credsStr);
        try { localStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, credsStr); } catch(e) {}
      } else {
        appStorage.removeItem(STORE_REMEMBER_LOGIN_CREDS_KEY);
        try { localStorage.removeItem(STORE_REMEMBER_LOGIN_CREDS_KEY); } catch(e) {}
      }

      catatLogLogin(user.username, user.fullName, user.area, 'BERHASIL');
      await bukaMainApp();
    } else {
      currentUser = null;
      appStorage.removeItem(SESSION_KEY);
      catatLogLogin(u, '-', '-', 'GAGAL - PASSWORD SALAH');
      showNotif('USERNAME ATAU PASSWORD SALAH!', 'error');
    }
  } catch (error) {
    currentUser = null;
    appStorage.removeItem(SESSION_KEY);
    console.error("Login error:", error);
    showNotif('GAGAL MEMPROSES LOGIN!', 'error');
  } finally {
    hideLoading();
  }
}
window.prosesLogin = prosesLogin;

async function catatLogLogin(username, nama, area, status) {
  if (typeof supabase !== 'undefined' && supabase) {
    try {
      await supabase.from('lookup').upsert({
        key: `login_log_${Date.now()}`,
        value: { username, nama, area, status, time: new Date().toISOString() }
      });
    } catch (e) {}
  }
}

function fillLogin(u, p) {
  const uEl = document.getElementById('username');
  const pEl = document.getElementById('password');
  if (uEl) uEl.value = u;
  if (pEl) pEl.value = p;
  prosesLogin();
}

function logout() {
  const confirmMsg = isFormDirtyOrFilled() 
    ? 'ADA DATA PERMINTAAN YANG BELUM DISIMPAN. YAKIN INGIN LOGOUT & KELUAR DARI APLIKASI?' 
    : 'YAKIN INGIN KELUAR DARI APLIKASI?';
  showConfirm(confirmMsg, async () => {
    let rememberedCreds = null;
    try {
      rememberedCreds = appStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY);
      if (!rememberedCreds && typeof localStorage !== 'undefined') {
        rememberedCreds = localStorage.getItem(STORE_REMEMBER_LOGIN_CREDS_KEY);
      }
    } catch (e) {}

    currentUser = null;
    appStorage.removeItem(SESSION_KEY);

    if (rememberedCreds) {
      try {
        appStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, rememberedCreds);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORE_REMEMBER_LOGIN_CREDS_KEY, rememberedCreds);
        }
      } catch (e) {}
    }

    tutupAkun();
    tutupNotificationModal();
    const popupBantuan = document.getElementById('popupBantuan');
    if (popupBantuan) popupBantuan.classList.remove('show');
    const bottomMenu = document.getElementById('bottomMenu');
    if (bottomMenu) bottomMenu.style.display = 'none';
    const helpBtn = document.getElementById('helpButton');
    if (helpBtn) helpBtn.style.display = 'none';

    pindahHalaman('loginPage');
    if (typeof loadRememberedCredentials === 'function') {
      loadRememberedCredentials();
    }
    if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  });
}

// =======================================================================
// BUKA MAIN APP: LOCAL-FIRST (0ms INSTANT LOAD) + REALTIME + DELTA SYNC
// =======================================================================
async function bukaMainApp() {
  updateBodyClasses();

  if (currentUser) {
    try {
      const users = typeof getUsersFromDB === 'function' ? getUsersFromDB() : [];
      const updatedUser = users.find(u => u && u.id === currentUser.id);
      if (updatedUser) {
        currentUser = updatedUser;
        appStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      }
    } catch(e) {}
  }

  const loginPage = document.getElementById('loginPage');
  if (loginPage) loginPage.classList.remove('active');
  
  const bottomMenu = document.getElementById('bottomMenu');
  if (bottomMenu) bottomMenu.style.display = 'flex';
  
  if (typeof initAllDraggableButtons === 'function') initAllDraggableButtons();

  updateAdminNavVisibility();
  const isAdmin = checkIsAdminUser();
  isAdminChat = typeof isServiceTSMUser === 'function' ? isServiceTSMUser() : (isAdmin || (currentUser && currentUser.category === 'SERVICE'));

  // 1. CEK PENYIMPANAN LOKAL DULU
  const localRequests = getRequestsFromDB();
  const hasLocalData = Array.isArray(localRequests) && localRequests.length > 0;

  if (hasLocalData) {
    // ----------------------------------------------------
    // KONDISI A: DATA LOKAL ADA (0ms INSTANT LOAD, 0 KB BANDWIDTH)
    // ----------------------------------------------------
    pindahHalaman('dashboardPage');
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof loadRiwayat === 'function') loadRiwayat();

    // Jalankan Realtime Listener & Sinkronisasi Delta (updated_at) di latar belakang
    initSupabaseRealtimeEngine();
    syncSupabaseIncremental().catch(e => console.warn(e));
  } else {
    // ----------------------------------------------------
    // KONDISI B: DATA LOKAL KOSONG (MISAL PERANGKAT BARU)
    // ----------------------------------------------------
    showLoading('MEMUAT DATA PERTAMA KALI DARI SUPABASE CLOUD...');
    try {
      await syncAllDataToCache();
    } catch (e) {}
    hideLoading();

    pindahHalaman('dashboardPage');
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof loadRiwayat === 'function') loadRiwayat();

    initSupabaseRealtimeEngine();
  }

  if (typeof setupBottomMenuAutoHide === 'function') {
    setupBottomMenuAutoHide();
  }

  setTimeout(() => {
    if (typeof aturTampilanLonceng === 'function') {
      aturTampilanLonceng('dashboardPage');
    }
  }, 400);

  if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
  if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  if (typeof updateAdminReminderUI === 'function') updateAdminReminderUI();
  if (typeof startAdminReminderTimeChecker === 'function') startAdminReminderTimeChecker();
  if (typeof checkAndTriggerPendingReminders === 'function') checkAndTriggerPendingReminders(false);
  if (typeof checkUrlDirectNoSuratOpen === 'function') checkUrlDirectNoSuratOpen();
}
window.bukaMainApp = bukaMainApp;

async function eksekusiHapusPenyimpananLokal() {
  showConfirm('BERSIHKAN PENYIMPANAN LOKAL BROWSER & AMBIL DATA TERBARU DARI SUPABASE?', async () => {
    showLoading('BERSIHKAN PENYIMPANAN LOKAL & MEMUAT DATA SUPABASE...');
    try {
      await clearLocalStorageKeepThemeAndTTD();

      if (typeof syncAllDataToCache === 'function') {
        await syncAllDataToCache();
      }

      hideLoading();
      showNotif('PENYIMPANAN LOKAL BERHASIL DIBERSIHKAN & DATA SUPABASE DITERAPKAN!', 'success');

      if (currentUser) {
        if (typeof loadRiwayat === 'function') loadRiwayat();
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof loadMasterDbTable === 'function') loadMasterDbTable();
        if (typeof loadUsersManagement === 'function') loadUsersManagement();
      }
    } catch(err) {
      hideLoading();
      showNotif('GAGAL BERSIHKAN PENYIMPANAN: ' + (err.message || err), 'warning');
    }
  });
}
window.eksekusiHapusPenyimpananLokal = eksekusiHapusPenyimpananLokal;

function isFormDirtyOrFilled() {
  if (typeof modeEdit !== 'undefined' && modeEdit) return true;

  const activePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : '';
  if (activePage !== 'inputPage') return false;

  // 1. Detail Barang / Inputs inside detailContainer (Nama barang, tipe, SN, Dus, Alasan)
  const detailRows = document.querySelectorAll('#detailContainer .detailRow');
  for (let i = 0; i < detailRows.length; i++) {
    const row = detailRows[i];
    const typeVal = (row.querySelector('.typeBarang')?.value || '').trim();
    const seriVal = (row.querySelector('.seriBarang')?.value || '').trim();
    const namaVal = (row.querySelector('.namaBarang')?.value || '').trim();
    const dusVal = (row.querySelector('.seriDusBarang')?.value || '').trim();
    const alasanVal = (row.querySelector('.alasan')?.value || '').trim();
    const qtyVal = (row.querySelector('.qty')?.value || '').trim();

    // Check if user has actually typed text or changed qty from default 1
    if (typeVal !== '' || seriVal !== '' || namaVal !== '' || dusVal !== '' || alasanVal !== '') {
      return true;
    }
    if (qtyVal !== '' && qtyVal !== '1') {
      return true;
    }
  }

  // 2. Foto Upload Pendukung
  if (typeof fotoDataList !== 'undefined' && Array.isArray(fotoDataList) && fotoDataList.length > 0) {
    return true;
  }

  // 3. Catatan Textarea
  const catatanEl = document.getElementById('catatan');
  if (catatanEl && catatanEl.value.trim() !== '') return true;

  return false;
}
window.isFormDirtyOrFilled = isFormDirtyOrFilled;

function showPage(pageId) {
  const currentActivePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : '';

  if (currentActivePage === 'inputPage' && pageId !== 'inputPage' && isFormDirtyOrFilled()) {
    const confirmMsg = modeEdit ? 'KELUAR DARI MENU EDIT?' : 'KELUAR DARI FORM PERMINTAAN? (DATA YANG DIISI AKAN HILANG)';
    showConfirm(confirmMsg, () => {
      bersihkanForm();
      closeAllPopups();
      pindahHalaman(pageId);
      aturTampilanLonceng(pageId);
    });
    return;
  }
  
  closeAllPopups();
  pindahHalaman(pageId);
  aturTampilanLonceng(pageId);
}

function aturTampilanLonceng(pageId) {
  const notifBtn = document.getElementById('notifBellBtn');
  const helpBtn = document.getElementById('helpButton');
  const dotEl = document.getElementById('firebaseOnlineDot');
  const topHeader = document.getElementById('topHeaderActions');

  const activePage = pageId || (typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : 'dashboardPage');
  const isLoggedIn = (typeof currentUser !== 'undefined' && currentUser !== null && !document.getElementById('loginPage')?.classList.contains('active'));
  const isDashboard = isLoggedIn && (activePage === 'dashboardPage');

  if (topHeader) {
    topHeader.style.display = isLoggedIn ? 'flex' : 'none';
  }

  if (notifBtn) {
    if (isDashboard) {
      notifBtn.style.setProperty('display', 'flex', 'important');
    } else {
      notifBtn.style.setProperty('display', 'none', 'important');
    }
  }
  
  if (helpBtn) {
    helpBtn.style.display = isLoggedIn ? 'flex' : 'none';
  }

  if (dotEl) {
    dotEl.style.display = isLoggedIn ? 'block' : 'none';
  }

  if (isLoggedIn) {
    updateNotifBellCounter();
    if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
  }
}

let mobileBackspaceCount = 0;
let mobileBackspaceTimer = null;

function pushPopupHistoryState() {
  try {
    history.pushState({ modalOpen: true, page: getCurrentActivePageId() }, '', location.href);
  } catch (e) {}
}

function initMobileBackButtonEngine() {
  try {
    history.pushState({ page: 'dashboardPage' }, '', location.href);
  } catch(e) {}

  window.addEventListener('popstate', (e) => {
    const popTTD = document.getElementById('popupTTD');
    const isTtdOpen = popTTD && (popTTD.classList.contains('show') || popTTD.style.display === 'flex' || popTTD.style.display === 'block');

    // JIKA POPUP TTD TERBUKA & DI-BACK DARI HP -> KEMBALI KE POPUP AKUN
    if (isTtdOpen) {
      if (typeof tutupTTD === 'function') tutupTTD();
      if (typeof bukaAkun === 'function') bukaAkun();
      try { history.pushState({ page: getCurrentActivePageId() }, '', location.href); } catch(err) {}
      if (typeof aturTampilanLonceng === 'function') aturTampilanLonceng(getCurrentActivePageId());
      return;
    }

    const openModals = [
      document.getElementById('popupDetail'),
      document.getElementById('popupNotifList'),
      document.getElementById('popupBantuan'),
      document.getElementById('popupAkun'),
      document.getElementById('popupUserForm'),
      document.getElementById('pdfModal'),
      document.getElementById('rejectOverlay'),
      document.getElementById('popupTambahToko'),
      document.getElementById('popupPdfModelsModal'),
      document.getElementById('confirmOverlay'),
      document.getElementById('imageViewer'),
      document.getElementById('scannerModal')
    ];

    let closedAnyModal = false;
    openModals.forEach(m => {
      if (m && (m.classList.contains('show') || m.style.display === 'flex' || m.style.display === 'block')) {
        m.classList.remove('show');
        m.style.display = 'none';
        closedAnyModal = true;
      }
    });

    if (closedAnyModal) {
      if (typeof tutupScanner === 'function') tutupScanner();
      if (typeof tutupImageViewer === 'function') tutupImageViewer();
      
      // JAGA AGAR TOMBOL ICON HEADER (LONCENG & BANTUAN) TETAP TERSEDIA DI DASHBOARD
      const activePage = getCurrentActivePageId();
      if (typeof aturTampilanLonceng === 'function') {
        aturTampilanLonceng(activePage);
      }

      try { history.pushState({ page: activePage }, '', location.href); } catch(err) {}
      return;
    }

    const currentActivePage = getCurrentActivePageId();

    if (currentActivePage === 'inputPage' && isFormDirtyOrFilled()) {
      try { history.pushState({ page: 'inputPage' }, '', location.href); } catch(err) {}
      
      const confirmMsg = modeEdit ? 'KELUAR DARI MENU EDIT?' : 'KELUAR DARI FORM PERMINTAAN? (DATA YANG DIISI AKAN HILANG)';
      showConfirm(confirmMsg, () => {
        if (typeof bersihkanForm === 'function') bersihkanForm();
        closeAllPopups();
        pindahHalaman('dashboardPage');
      });
      return;
    }

    if (currentActivePage !== 'dashboardPage' && currentActivePage !== 'loginPage') {
      pindahHalaman('dashboardPage', false);
      try { history.pushState({ page: 'dashboardPage' }, '', location.href); } catch(err) {}
      if (typeof mobileBackspaceCount !== 'undefined') mobileBackspaceCount = 0;
      return;
    }

    if (currentActivePage === 'dashboardPage') {
      if (typeof mobileBackspaceCount === 'undefined') window.mobileBackspaceCount = 0;
      mobileBackspaceCount++;

      if (typeof mobileBackspaceTimer !== 'undefined' && mobileBackspaceTimer) clearTimeout(mobileBackspaceTimer);
      window.mobileBackspaceTimer = setTimeout(() => {
        mobileBackspaceCount = 0;
      }, 3500);

      if (mobileBackspaceCount < 5) {
        try { history.pushState({ page: 'dashboardPage' }, '', location.href); } catch(err) {}
      }
    }
  });
}

function getCurrentActivePageId() {
  const activeEl = document.querySelector('.page.active');
  return activeEl ? activeEl.id : 'dashboardPage';
}

function checkIsAdminUser() {
  if (!currentUser) return false;
  const category = (currentUser.category || currentUser.kategori || currentUser.role || '').toString().trim().toUpperCase();
  const username = (currentUser.username || '').toString().trim().toUpperCase();
  return category === 'ADMIN' || username === 'ADMIN';
}

function updateAdminNavVisibility() {
  const isAdmin = checkIsAdminUser();

  const btnUserNav = document.getElementById('btnUserNav');
  const btnMasterDbNav = document.getElementById('btnMasterDbNav');

  if (btnUserNav) {
    if (isAdmin) {
      btnUserNav.style.setProperty('display', 'flex', 'important');
      btnUserNav.classList.remove('hidden-admin-btn');
    } else {
      btnUserNav.style.setProperty('display', 'none', 'important');
      btnUserNav.classList.add('hidden-admin-btn');
    }
  }

  if (btnMasterDbNav) {
    if (isAdmin) {
      btnMasterDbNav.style.setProperty('display', 'flex', 'important');
      btnMasterDbNav.classList.remove('hidden-admin-btn');
    } else {
      btnMasterDbNav.style.setProperty('display', 'none', 'important');
      btnMasterDbNav.classList.add('hidden-admin-btn');
    }
  }
}

function updateBottomMenuHighlight(pageId) {
  updateAdminNavVisibility();
  const bottomNav = document.getElementById('bottomMenu');
  if (!bottomNav) return;

  const btnMap = {
    'dashboardPage': "showPage('dashboardPage')",
    'inputPage': "showPage('inputPage')",
    'riwayatPage': "bukaMenuRiwayat()",
    'masterDbPage': "showPage('masterDbPage')",
    'userManagementPage': "showPage('userManagementPage')"
  };

  const buttons = bottomNav.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    const onclickAttr = btn.getAttribute('onclick') || '';
    const targetOnClick = btnMap[pageId];

    if (targetOnClick && onclickAttr.includes(targetOnClick)) {
      btn.classList.add('active');
    }
  });
}

let lastScrollTopPosition = 0;

function setupBottomMenuAutoHide() {
  const bottomMenu = document.getElementById('bottomMenu');
  if (!bottomMenu) return;
  const isLoginPage = (document.getElementById('loginPage') && document.getElementById('loginPage').classList.contains('active')) || (typeof currentUser === 'undefined' || !currentUser);
  if (isLoginPage) {
    bottomMenu.classList.add('login-hidden');
    bottomMenu.classList.add('hide-bottom-menu');
    bottomMenu.style.setProperty('display', 'none', 'important');
    return;
  }
  bottomMenu.classList.remove('login-hidden');
  bottomMenu.classList.remove('hide-bottom-menu');
  bottomMenu.style.display = 'flex';
}

function pindahHalaman(pageId, pushHistory = true) {
  updateAdminNavVisibility();

  if ((pageId === 'masterDbPage' || pageId === 'userManagementPage') && !checkIsAdminUser()) {
    pindahHalaman('dashboardPage', false);
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  updateBottomMenuHighlight(pageId);
  setupBottomMenuAutoHide();

  if (pushHistory && pageId !== 'loginPage') {
    try {
      history.pushState({ page: pageId }, '', location.href);
    } catch(e) {}
  }

  if (pageId === 'loginPage' || (typeof currentUser === 'undefined' || !currentUser)) {
    if (typeof closeAllPopups === 'function') closeAllPopups();
    const bottomMenu = document.getElementById('bottomMenu');
    if (bottomMenu) {
      bottomMenu.classList.add('login-hidden');
      bottomMenu.style.setProperty('display', 'none', 'important');
    }
    const notifBtn = document.getElementById('notifBellBtn');
    if (notifBtn) notifBtn.style.setProperty('display', 'none', 'important');
    const helpBtn = document.getElementById('helpButton');
    if (helpBtn) helpBtn.style.setProperty('display', 'none', 'important');
    const dotEl = document.getElementById('firebaseOnlineDot');
    if (dotEl) dotEl.style.setProperty('display', 'none', 'important');
    const topHeader = document.getElementById('topHeaderActions');
    if (topHeader) topHeader.style.setProperty('display', 'none', 'important');
    if (typeof loadRememberedCredentials === 'function') {
      loadRememberedCredentials();
    }
  } else {
    const bottomMenu = document.getElementById('bottomMenu');
    if (bottomMenu) {
      bottomMenu.classList.remove('login-hidden');
      bottomMenu.style.display = 'flex';
    }
    const topHeader = document.getElementById('topHeaderActions');
    if (topHeader) topHeader.style.display = 'flex';
    aturTampilanLonceng(pageId);
  }

  if (pageId === 'dashboardPage') {
    loadDashboard();
  } else if (pageId === 'inputPage') {
    loadForm();
  } else if (pageId === 'riwayatPage') {
    loadRiwayat();
  } else if (pageId === 'masterDbPage') {
    loadMasterDbTable();
  } else if (pageId === 'userManagementPage') {
    loadFonteToken();
    loadFirebaseConfigInput();
    loadUsersManagement();
    updateActivePdfModelBadge();
  }
}

function getAccessibleRequests() {
  const requests = getRequestsFromDB();
  if (!currentUser) return [];

  if (
    currentUser.category === 'ADMIN' ||
    currentUser.category === 'DM' ||
    (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN')
  ) {
    return requests;
  }

  if (currentUser.category === 'TOKO') {
    return requests.filter(r => 
      r.userId === currentUser.id || 
      r.toko.toUpperCase() === currentUser.fullName.toUpperCase()
    );
  }

  return requests.filter(r => isAreaMatch(currentUser.area, r.area));
}

function filterDashboardRecent(status) {
  dashboardFilterStatus = status;
  loadDashboard();
}

function loadDashboard() {
  if (!currentUser) return;

  const nameEl = document.getElementById('namaUser');
  const areaEl = document.getElementById('areaUser');
  if (nameEl) nameEl.textContent = currentUser.fullName;
  if (areaEl) areaEl.textContent = `${currentUser.category} - ${formatUserAreaDisplay(currentUser.area)}`;

  const data = getAccessibleRequests();

  const pending = data.filter(r => r.status === 'PENDING').length;
  const approve = data.filter(r => r.status === 'APPROVE').length;
  const reject = data.filter(r => r.status === 'REJECT').length;
  const done = data.filter(r => r.status === 'DONE').length;
  const total = data.length || 1;

  const elPending = document.getElementById('pending');
  const elApprove = document.getElementById('approve');
  const elReject = document.getElementById('reject');
  const elDone = document.getElementById('done');

  if (elPending) elPending.textContent = pending;
  if (elApprove) elApprove.textContent = approve;
  if (elReject) elReject.textContent = reject;
  if (elDone) elDone.textContent = done;

  const barPending = document.getElementById('barPending');
  const barApprove = document.getElementById('barApprove');
  const barReject = document.getElementById('barReject');
  const barDone = document.getElementById('barDone');

  if (barPending) barPending.style.width = `${data.length ? Math.max(12, Math.round((pending / total) * 100)) : 15}%`;
  if (barApprove) barApprove.style.width = `${data.length ? Math.max(12, Math.round((approve / total) * 100)) : 15}%`;
  if (barReject) barReject.style.width = `${data.length ? Math.max(12, Math.round((reject / total) * 100)) : 15}%`;
  if (barDone) barDone.style.width = `${data.length ? Math.max(12, Math.round((done / total) * 100)) : 15}%`;

  const titleEl = document.getElementById('dashboardRecentTitle');
  if (titleEl) {
    const iconName = dashboardFilterStatus === 'PENDING' ? 'hourglass_top' : (dashboardFilterStatus === 'APPROVE' ? 'verified' : (dashboardFilterStatus === 'REJECT' ? 'cancel' : 'task_alt'));
    titleEl.innerHTML = `<span class="material-symbols-rounded" style="color: var(--primary); font-size: 22px;">${iconName}</span> PERMINTAAN ${dashboardFilterStatus}`;
  }

  const lastDataContainer = document.getElementById('lastData');
  if (!lastDataContainer) return;
  lastDataContainer.innerHTML = '';

  const filteredData = data.filter(r => r.status === dashboardFilterStatus);

  if (filteredData.length === 0) {
    lastDataContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">TIDAK ADA DATA PERMINTAAN DENGAN STATUS ${dashboardFilterStatus}.</td></tr>`;
    return;
  }

  filteredData.forEach(r => {
    const isWaitingDM = (r.status === 'PENDING' && r.serviceApprove);
    const isWaitingService = (r.status === 'PENDING' && !r.serviceApprove);

    let isOrangeRow = false;
    let isBoldRow = false;
    if (currentUser) {
      const cat = (currentUser.category || '').toUpperCase();
      const isAdm = cat === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN');
      if ((cat === 'DM' || isAdm) && isWaitingDM) {
        isOrangeRow = true;
        isBoldRow = true;
      } else if ((cat === 'SERVICE' || isAdm) && isWaitingService) {
        isOrangeRow = true;
        isBoldRow = true;
      }
    }

    const tr = document.createElement('tr');
    if (shouldRowBlinkRed(r)) {
      tr.className = 'blink-row-red';
    }
    tr.style.cursor = 'pointer';
    tr.title = `KLIK BARIS INI UNTUK MEMBUKA PERMINTAAN #${r.noSurat}`;
    tr.onclick = () => bukaDetailDariDashboard(r.noSurat);
    tr.innerHTML = `
      <td style="width: 18%; text-align: left; white-space: nowrap;">${formatDateDDMMYYYYString(r.tanggal)}</td>
      <td style="width: 32%; text-align: left;">${r.noSurat}</td>
      <td style="width: 30%; text-align: left;">${r.toko} <small>(${r.area})</small></td>
      <td style="width: 20%; text-align: left !important;">${getBadgeStatus(r)}</td>
    `;
    lastDataContainer.appendChild(tr);
  });
}

function bukaDetailDariDashboard(noSurat) {
  lihatDetail(noSurat, true);
}

function shouldRowBlinkRed(r) {
  if (!r || !currentUser) return false;
  const cat = String(currentUser.category || currentUser.kategori || currentUser.role || '').trim().toUpperCase();
  const username = String(currentUser.username || '').trim().toUpperCase();
  const isAdm = cat === 'ADMIN' || username === 'ADMIN';

  const isWaitingService = (r.status === 'PENDING' && !r.serviceApprove);
  const isWaitingDM = (r.status === 'PENDING' && r.serviceApprove);

  if ((cat === 'SERVICE' || isAdm) && isWaitingService) return true;
  if ((cat === 'DM' || isAdm) && isWaitingDM) return true;

  return false;
}

function getBadgeStatus(r) {
  if (typeof r === 'string') {
    if (r === 'DONE') return 'SUDAH DIPENUHI';
    if (r === 'APPROVE') return 'DISETUJUI';
    if (r === 'REJECT') return 'DITOLAK';
    if (r === 'PENDING') return 'PENDING';
    return r;
  }

  if (!r) return '-';

  const st = r.status;
  const serviceAppv = r.serviceApprove;

  if (st === 'DONE') return 'SUDAH DIPENUHI';
  if (st === 'REJECT') return 'DITOLAK';
  if (st === 'APPROVE') return 'DISETUJUI';

  if (st === 'PENDING') {
    if (!serviceAppv) {
      return 'TUNGGU SERVICE';
    } else {
      return 'TUNGGU DM';
    }
  }

  return st || '-';
}

function updateStoreDropdownOptions(selectedStoreName = '') {
  const tokoSelect = document.getElementById('toko');
  if (!tokoSelect || !currentUser) return;

  const currentVal = selectedStoreName || tokoSelect.value;
  tokoSelect.innerHTML = '';

  if (currentUser.category === 'TOKO') {
    tokoSelect.innerHTML = `<option value="${currentUser.fullName}">${currentUser.fullName} (${currentUser.area})</option>`;
  } else {
    const allStores = getStoresFromDB();
    const areaStores = (currentUser.category === 'DM' || currentUser.area === 'ALL') 
      ? allStores 
      : allStores.filter(s => s && isAreaMatch(currentUser.area, s.area));

    if (areaStores.length > 0) {
      areaStores.forEach(s => {
        const isSelected = (currentVal && String(s.fullName).toUpperCase() === String(currentVal).toUpperCase()) ? 'selected' : '';
        tokoSelect.innerHTML += `<option value="${s.fullName}" ${isSelected}>${s.fullName} (${s.area || currentUser.area})</option>`;
      });
    } else {
      tokoSelect.innerHTML = `<option value="INPUT TOKO.....">INPUT TOKO..... (${currentUser.area})</option>`;
    }
  }

  if (currentVal && Array.from(tokoSelect.options).some(o => o.value.toUpperCase() === currentVal.toUpperCase())) {
    tokoSelect.value = currentVal;
  }
}
window.updateStoreDropdownOptions = updateStoreDropdownOptions;

function loadForm() {
  const tglEl = document.getElementById('tanggal');
  if (tglEl && !tglEl.value) {
    tglEl.value = getFormattedDateDDMMYYYY();
  }

  updateStoreDropdownOptions();

  const containerTambahToko = document.getElementById('containerTambahToko');
  if (containerTambahToko) {
    containerTambahToko.style.display = (currentUser.category === 'TOKO') ? 'none' : 'block';
  }

  if (typeof updatePhotoSectionVisibility === 'function') {
    updatePhotoSectionVisibility();
  }

  const detailContainer = document.getElementById('detailContainer');
  if (detailContainer && detailContainer.children.length === 0 && !modeEdit) {
    tambahRow();
  }
}

function gantiJenis() {
  const container = document.getElementById('detailContainer');
  if (container && container.children.length > 0 && !modeEdit) {
    container.innerHTML = '';
    tambahRow();
  }
}

function tambahRow() {
  const jenisEl = document.getElementById('jenisPermintaan');
  const jenis = jenisEl ? jenisEl.value : 'DEFAULT';
  const container = document.getElementById('detailContainer');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `detailRow ${jenis === 'DUS' ? 'dus' : 'seri'}`;

  const scanButtonHtml = `
    <button type="button" class="btnScanSeri" onclick="bukaScanner(this)" title="SCAN BARCODE / QR NO SERI">
      <span class="material-symbols-rounded">qr_code_scanner</span>
    </button>
  `;

  if (jenis === 'DUS') {
    div.innerHTML = `
      <input type="text" inputmode="text" class="typeBarang" placeholder="TYPE BARANG" autocomplete="off">
      <div style="display:flex; gap:4px; align-items:center;">
        <input type="text" inputmode="text" class="seriBarang" placeholder="NO SERI" autocomplete="off" oninput="lookupTypeRow(this)" onkeyup="lookupTypeRow(this)" onblur="lookupTypeRow(this)">
        ${scanButtonHtml}
      </div>
      <input type="text" inputmode="text" class="namaBarang" placeholder="PERMINTAAN" autocomplete="off">
      <input type="text" inputmode="text" class="seriDusBarang" placeholder="NO SERI DUS" autocomplete="off">
      <input type="text" inputmode="text" class="alasan" placeholder="ALASAN" autocomplete="off">
      <input type="number" class="qty" value="1" min="1" style="text-align: left;" autocomplete="off">
      <button type="button" class="btnHapusRow" onclick="hapusRow(this)"><span class="material-symbols-rounded">remove</span></button>
    `;
  } else {
    div.innerHTML = `
      <input type="text" inputmode="text" class="typeBarang" placeholder="TYPE BARANG" autocomplete="off">
      <div style="display:flex; gap:4px; align-items:center;">
        <input type="text" inputmode="text" class="seriBarang" placeholder="NO SERI" autocomplete="off" oninput="lookupTypeRow(this)" onkeyup="lookupTypeRow(this)" onblur="lookupTypeRow(this)">
        ${scanButtonHtml}
      </div>
      <input type="text" inputmode="text" class="namaBarang" placeholder="PERMINTAAN" autocomplete="off">
      <input type="text" inputmode="text" class="alasan" placeholder="ALASAN" autocomplete="off">
      <input type="number" class="qty" value="1" min="1" style="text-align: left;" autocomplete="off">
      <button type="button" class="btnHapusRow" onclick="hapusRow(this)"><span class="material-symbols-rounded">remove</span></button>
    `;
  }

  container.appendChild(div);
}

function getKodeUnitMap() {
  const customMap = JSON.parse(appStorage.getItem(KODE_UNIT_MAP_KEY) || '{}');
  const merged = { ...KODE_UNIT_MAP, ...customMap };
  const cleanMap = {};
  Object.keys(merged).forEach(k => {
    if (k !== undefined && k !== null && merged[k]) {
      const cleanKey = String(k).trim().toUpperCase();
      const cleanVal = String(merged[k]).trim().toUpperCase();
      if (cleanKey && cleanVal) {
        cleanMap[cleanKey] = cleanVal;
      }
    }
  });
  return cleanMap;
}

function bukaScanner(btn) {
  const row = btn.closest('.detailRow');
  if (row) {
    activeScanInput = row.querySelector('.seriBarang');
  } else {
    activeScanInput = btn.parentElement.querySelector('.seriBarang');
  }

  const modal = document.getElementById('scannerModal');
  if (modal) modal.style.display = 'flex';

  if (typeof Html5Qrcode !== 'undefined') {
    setTimeout(() => {
      try {
        if (html5QrCodeScanner) {
          try { html5QrCodeScanner.stop(); } catch(e) {}
          html5QrCodeScanner = null;
        }
        html5QrCodeScanner = new Html5Qrcode("readerScanner");
        const config = { fps: 15, qrbox: { width: 260, height: 160 } };

        html5QrCodeScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (activeScanInput) {
              const cleanCode = String(decodedText || '').trim().toUpperCase();
              
              activeScanInput.value = cleanCode;
              activeScanInput.setAttribute('value', cleanCode);
              activeScanInput.dispatchEvent(new Event('input', { bubbles: true }));
              
              const targetRow = activeScanInput.closest('.detailRow');
              if (targetRow) {
                const namaInput = targetRow.querySelector('.namaBarang');
                if (namaInput) {
                  setTimeout(() => {
                    namaInput.focus();
                  }, 300);
                }
              }
            }
            tutupScanner();
          },
          (errorMessage) => {}
        ).catch(err => {
          showNotif('KAMERA TIDAK TERSEDIA ATAU DIBLOKIR BROWSER!', 'warning');
          tutupScanner();
        });
      } catch(err) {
        console.warn("Kesalahan inisialisasi kamera:", err);
      }
    }, 200);
  } else {
    showNotif('MODUL SCANNER BELUM SIAP!', 'warning');
  }
}

function tutupScanner() {
  const modal = document.getElementById('scannerModal');
  if (modal) modal.style.display = 'none';

  if (html5QrCodeScanner) {
    try {
      const scannerRef = html5QrCodeScanner;
      html5QrCodeScanner = null;
      scannerRef.stop().then(() => {
        try { scannerRef.clear(); } catch(e) {}
      }).catch(err => {
        try { scannerRef.clear(); } catch(e) {}
      });
    } catch(e) {
      html5QrCodeScanner = null;
    }
  }
  setTimeout(() => {
    activeScanInput = null;
  }, 500);
}

function lookupTypeRow(el, isFromScanner = false) {
  if (!el) return;
  const rawValue = String(el.value || '').trim().toUpperCase();
  el.value = rawValue;

  if (!rawValue || rawValue.length < 4) return;

  const first4Chars = rawValue.substring(0, 4);
  const fullMap = getKodeUnitMap();
  const keys = Object.keys(fullMap);

  let matchedType = null;

  for (const key of keys) {
    const cleanKey = String(key).trim().toUpperCase();
    if (cleanKey.substring(0, 4) === first4Chars) {
      matchedType = fullMap[key];
      break;
    }
  }

  if (!matchedType) {
    for (const key of keys) {
      const cleanKey = String(key).trim().toUpperCase();
      if (cleanKey.length >= 4 && rawValue.startsWith(cleanKey)) {
        matchedType = fullMap[key];
        break;
      }
    }
  }

  if (matchedType) {
    const row = el.closest('.detailRow');
    if (row) {
      const typeInput = row.querySelector('.typeBarang');
      if (typeInput) {
        typeInput.value = matchedType;
      }

      if (isFromScanner) {
        const namaInput = row.querySelector('.namaBarang');
        if (namaInput) {
          setTimeout(() => namaInput.focus(), 150);
        }
      }
    }
  }
}

function hapusRow(btn) {
  const row = btn.closest('.detailRow');
  if (!row) return;

  const container = document.getElementById('detailContainer');
  if (!container) return;

  const allRows = container.querySelectorAll('.detailRow');
  if (allRows.length > 1) {
    row.remove();
  } else {
    row.remove();
    tambahRow();
  }
}

function kompresiFoto(file, maxDimension = 720, quality = 0.65) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(e.target.result || '');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function pilihFoto() {
  const fileInput = document.getElementById('foto');
  if (fileInput) fileInput.click();
}

async function uploadPhotoToSupabaseStorage(file) {
  const sb = (typeof supabase !== 'undefined' && supabase) ? supabase : ((typeof window.supabaseClient !== 'undefined' && window.supabaseClient) ? window.supabaseClient : null);
  if (sb) {
    try {
      const fileName = `FOTO_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
      const { data, error } = await sb.storage.from('photos').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (!error && data) {
        const { data: pubData } = sb.storage.from('photos').getPublicUrl(fileName);
        if (pubData && pubData.publicUrl) return pubData.publicUrl;
      } else if (error) {
        console.warn('[SUPABASE STORAGE NOTICE]: RLS Policy / Storage block, menggunakan fallback kompresi:', error.message);
      }
    } catch (e) {
      console.warn('[SUPABASE STORAGE EXCEPTION]:', e);
    }
  }
  return await kompresiFoto(file, 400, 0.4);
}

async function deletePhotosFromSupabaseStorage(photoUrls) {
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) return;

  const sb = (typeof supabase !== 'undefined' && supabase) ? supabase : ((typeof window.supabaseClient !== 'undefined' && window.supabaseClient) ? window.supabaseClient : null);
  if (!sb || !sb.storage) return;

  const fileNames = photoUrls.map(url => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('data:')) return null;
    try {
      const cleanUrl = url.split('?')[0];
      const name = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
      return name && name.includes('.') ? name : null;
    } catch(e) {
      return null;
    }
  }).filter(Boolean);

  if (fileNames.length > 0) {
    try {
      const { data, error } = await sb.storage.from('photos').remove(fileNames);
      if (!error && data) {
        console.log('⚡ [SUPABASE STORAGE DELETE SUCCESS]: Berhasil menghapus foto dari bucket Supabase photos:', fileNames);
      } else {
        await sb.storage.from('permintaan_photos').remove(fileNames).catch(() => {});
        await sb.storage.from('foto-permintaan').remove(fileNames).catch(() => {});
      }
    } catch (err) {
      console.warn('[SUPABASE STORAGE DELETE EXCEPTION]:', err);
    }
  }
}
window.deletePhotosFromSupabaseStorage = deletePhotosFromSupabaseStorage;

async function previewFoto(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  if (currentPhotos.length + files.length > 5) {
    showNotif('MAKSIMAL FOTO DIBATASI HINGGA 5 FOTO SAJA!', 'warning');
    event.target.value = ''; 
    return;
  }

  const previewText = document.getElementById('previewText');
  const originalText = previewText ? previewText.innerHTML : 'TAP / DRAG FOTO DI SINI';
  if (previewText) {
    previewText.innerHTML = `<span class="material-symbols-rounded" style="font-size:22px; vertical-align:middle; display:inline-block; animation:spin 0.8s linear infinite; color:var(--primary);">sync</span> MENGUNGGAH FOTO...`;
  }

  for (let i = 0; i < files.length; i++) {
    if (currentPhotos.length < 5) {
      try {
        const url = await uploadPhotoToSupabaseStorage(files[i]);
        if (url) {
          currentPhotos.push(url);
        }
      } catch (err) {
        console.warn('Foto Upload Error:', err);
      }
    }
  }

  if (previewText) {
    previewText.innerHTML = originalText;
  }

  renderPhotoGrid();
  event.target.value = '';
}

function hapusFotoItem(idx) {
  const removedUrl = currentPhotos[idx];
  if (removedUrl) {
    deletePhotosFromSupabaseStorage([removedUrl]);
  }
  currentPhotos.splice(idx, 1);
  renderPhotoGrid();
}

function renderPhotoGrid() {
  const grid = document.getElementById('photoPreviewsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  currentPhotos.forEach((src, idx) => {
    const div = document.createElement('div');
    div.className = 'photo-preview-card';
    div.title = "KLIK UNTUK BUKA FOTO & GESER (ZOOM & PAN)";
    div.onclick = () => zoomFoto(currentPhotos, idx);
    div.innerHTML = `
      <img src="${src}" alt="Foto ${idx + 1}">
      <button class="photo-del-btn" onclick="event.stopPropagation(); hapusFotoItem(${idx})">✕</button>
    `;
    grid.appendChild(div);
  });
}

function bersihkanForm() {
  currentPhotos = [];
  modeEdit = false;
  editNoSurat = '';
  
  const fileInput = document.getElementById('foto');
  if (fileInput) fileInput.value = '';

  const photoGrid = document.getElementById('photoPreviewsGrid');
  if (photoGrid) photoGrid.innerHTML = '';

  const previewText = document.getElementById('previewText');
  if (previewText) previewText.style.display = 'block';

  const catatanEl = document.getElementById('catatan');
  if (catatanEl) {
    catatanEl.value = '';
    catatanEl.textContent = '';
  }

  const jenisEl = document.getElementById('jenisPermintaan');
  if (jenisEl) jenisEl.value = 'DEFAULT';

  const btnSimpan = document.getElementById('btnSimpan');
  if (btnSimpan) btnSimpan.textContent = 'SIMPAN PERMINTAAN';

  const tokoSelect = document.getElementById('toko');
  if (tokoSelect && tokoSelect.options.length > 0) {
    tokoSelect.selectedIndex = 0;
  }

  const container = document.getElementById('detailContainer');
  if (container) {
    container.innerHTML = '';
  }

  tambahRow();

  const allInputs = document.querySelectorAll('#inputPage input, #inputPage textarea');
  allInputs.forEach(ipt => {
    if (ipt.id === 'tanggal') return;
    if (ipt.type === 'file') {
      ipt.value = '';
    } else if (ipt.classList.contains('qty')) {
      ipt.value = '1';
    } else {
      ipt.value = '';
      ipt.setAttribute('value', '');
    }
  });
}

function simpanData() {
  const tokoSelect = document.getElementById('toko');
  const toko = tokoSelect ? tokoSelect.value : '';
  const jenisEl = document.getElementById('jenisPermintaan');
  const jenis = jenisEl ? jenisEl.value : 'DEFAULT';
  const catatanEl = document.getElementById('catatan');
  const catatan = catatanEl ? catatanEl.value.trim().toUpperCase() : '';

  const rows = document.querySelectorAll('.detailRow');
  let items = [];
  let valid = true;

  rows.forEach(r => {
    const type = r.querySelector('.typeBarang') ? r.querySelector('.typeBarang').value.trim().toUpperCase() : '';
    const seri = r.querySelector('.seriBarang') ? r.querySelector('.seriBarang').value.trim().toUpperCase() : '';
    const barang = r.querySelector('.namaBarang') ? r.querySelector('.namaBarang').value.trim().toUpperCase() : '';
    const alasan = r.querySelector('.alasan') ? r.querySelector('.alasan').value.trim().toUpperCase() : '';
    const qty = parseInt(r.querySelector('.qty') ? r.querySelector('.qty').value : '1') || 1;
    const dus = r.querySelector('.seriDusBarang') ? r.querySelector('.seriDusBarang').value.trim().toUpperCase() : '';

    if (!type || !seri || !barang || !alasan) valid = false;
    if (jenis === 'DUS' && !dus) valid = false;

    const unfulfilled = r.classList.contains('unfulfilled') || r.hasAttribute('data-unfulfilled');
    items.push({ type, seri, dus, barang, alasan, qty, unfulfilled });
  });

  if (!valid) {
    showNotif('DETAIL BARANG & ALASAN WAJIB DIISI DENGAN LENGKAP!', 'warning');
    return;
  }

  const allReq = getRequestsFromDB();
  let duplicateSerial = null;
  let duplicateNoSurat = null;

  items.forEach(it => {
    if (it.seri) {
      const match = allReq.find(r => r.noSurat !== editNoSurat && r.items.some(x => x.seri === it.seri));
      if (match) {
        duplicateSerial = it.seri;
        duplicateNoSurat = match.noSurat;
      }
    }
  });

  if (duplicateSerial && !modeEdit) {
    showConfirm(
      `NO SERI ${duplicateSerial} SUDAH TERDAFTAR PADA ${duplicateNoSurat}. LANJUTKAN TRANSAKSI?`,
      () => {
        prosesSimpanKeDB(toko, jenis, catatan, items);
      }
    );
  } else {
    prosesSimpanKeDB(toko, jenis, catatan, items);
  }
}

async function prosesSimpanKeDB(toko, jenis, catatan, items) {
  const requests = getRequestsFromDB();

  if (modeEdit && editNoSurat) {
    const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(editNoSurat).trim().toUpperCase());
    if (idx !== -1) {
      requests[idx].toko = toko;
      requests[idx].jenis = jenis;
      requests[idx].catatan = catatan;
      requests[idx].items = items;
      requests[idx].photos = [...currentPhotos];
      
      // 1. SIMPAN LOKAL SECARA INSTAN (0 ms)
      saveRequestsToDB(requests);

      // 2. MUNCULKAN NOTIFIKASI LANGSUNG DI AWAL & PINDAH HALAMAN
      showNotif(`PERMINTAAN #${editNoSurat} DATA BERHASIL DIPERBARUHI!`, 'success');
      bersihkanForm();
      pindahHalaman('riwayatPage');
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (typeof loadDashboard === 'function') loadDashboard();

      // 3. PROSES PENGIRIMAN KE SUPABASE DI LATAR BELAKANG
      const docId = String(editNoSurat).replace(/[\/\.]/g, '_');
      const supaEditRow = {
        id: docId,
        no_surat: requests[idx].noSurat,
        tanggal: requests[idx].tanggal,
        toko: requests[idx].toko,
        area: requests[idx].area,
        jenis: requests[idx].jenis,
        catatan: requests[idx].catatan || '',
        items: requests[idx].items || [],
        photos: requests[idx].photos || [],
        artemis_photos: requests[idx].artemisPhotos || [],
        status: requests[idx].status,
        service_approve: !!requests[idx].serviceApprove,
        service_user_name: requests[idx].serviceUserName || '',
        service_ttd: requests[idx].serviceTTD || '',
        dm_user_name: requests[idx].dmUserName || '',
        dm_ttd: requests[idx].dmTTD || '',
        created_by: requests[idx].createdBy || '',
        created_at: requests[idx].createdAt || '',
        user_id: requests[idx].userId || '',
        log: requests[idx].log || [],
        updated_at: new Date().toISOString()
      };

      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').upsert(supaEditRow).then(({ error }) => {
          if (error) console.warn('[SUPABASE UPDATE NOTICE]:', error.message);
        }).catch(e => console.warn(e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }
    }
  } else {
    const now = new Date();
    const codeYear = String(now.getFullYear()).slice(-2);
    const codeMonth = String(now.getMonth() + 1).padStart(2, '0');
    const codeDay = String(now.getDate()).padStart(2, '0');
    const timeCode = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');

    const allStores = getStoresFromDB();
    const safeToko = String(toko || '').trim().toUpperCase();
    const matchedStore = allStores.find(s => s && s.fullName && String(s.fullName).trim().toUpperCase() === safeToko);
    let storeCode = matchedStore ? (matchedStore.storeCode || generateStoreCode(matchedStore.fullName)) : generateStoreCode(safeToko);
    const targetArea = (matchedStore && matchedStore.area) ? matchedStore.area : (getUserAreaList(currentUser.area)[0] || 'BDG');

    // Pastikan nomor surat unik dengan stempel waktu
    let seq = requests.length + 1;
    let noSurat = `PRMT/${targetArea}-${storeCode}/${codeYear}${codeMonth}${codeDay}-${String(seq).padStart(2, '0')}${timeCode.slice(-3)}`;
    while (requests.some(r => r && String(r.noSurat).trim().toUpperCase() === noSurat.toUpperCase())) {
      seq++;
      noSurat = `PRMT/${targetArea}-${storeCode}/${codeYear}${codeMonth}${codeDay}-${String(seq).padStart(2, '0')}${timeCode.slice(-3)}`;
    }
    
    const isDMUser = currentUser && currentUser.category === 'DM';
    const autoServiceApprove = isDMUser ? true : false;
    const serviceUserNameVal = isDMUser ? (currentUser.fullName || currentUser.username) : '';

    let autoServiceTTD = '';
    if (isDMUser) {
      const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
      autoServiceTTD = ttdMap[currentUser.id] || ttdMap[currentUser.username] || ttdMap['SERVICE_' + targetArea] || ttdMap['SERVICE'] || ttdMap['DM'] || '';
    }

    const initialLog = [];
    if (isDMUser) {
      initialLog.push({
        action: 'AUTO_APPROVE_SERVICE',
        user: currentUser.fullName || currentUser.username,
        notes: 'AUTO APPROVE SERVICE (DIBUAT OLEH DM)',
        time: `${getFormattedDateDDMMYYYY(now)} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      });
    }

    const newRecord = {
      noSurat,
      tanggal: getFormattedDateDDMMYYYY(now),
      area: targetArea,
      userId: currentUser.id,
      toko,
      jenis,
      catatan,
      items,
      photos: [...currentPhotos],
      artemisPhotos: [],
      status: 'PENDING',
      serviceApprove: autoServiceApprove,
      serviceUserName: serviceUserNameVal,
      serviceTTD: autoServiceTTD,
      dmUserName: '',
      dmTTD: '',
      createdBy: currentUser.fullName,
      createdAt: `${getFormattedDateDDMMYYYY(now)} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      log: initialLog
    };

    // 1. SIMPAN LOKAL SECARA INSTAN (0 ms)
    requests.unshift(newRecord);
    saveRequestsToDB(requests);

    // 2. MUNCULKAN NOTIFIKASI LANGSUNG DI AWAL & PINDAH HALAMAN
    showNotif(`PERMINTAAN #${noSurat} DATA BERHASIL DISIMPAN!`, 'success');
    bersihkanForm();
    pindahHalaman('riwayatPage');
    if (typeof loadRiwayat === 'function') loadRiwayat();
    if (typeof loadDashboard === 'function') loadDashboard();

    // 3. PROSES PENGIRIMAN KE SUPABASE DI LATAR BELAKANG
    const docId = String(noSurat).replace(/[\/\.]/g, '_');
    const supaNewRow = {
      id: docId,
      no_surat: newRecord.noSurat,
      tanggal: newRecord.tanggal,
      toko: newRecord.toko,
      area: newRecord.area,
      jenis: newRecord.jenis,
      catatan: newRecord.catatan || '',
      items: newRecord.items || [],
      photos: newRecord.photos || [],
      artemis_photos: [],
      status: newRecord.status || 'PENDING',
      service_approve: !!newRecord.serviceApprove,
      service_user_name: newRecord.serviceUserName || '',
      service_ttd: newRecord.serviceTTD || '',
      dm_user_name: '',
      dm_ttd: '',
      created_by: newRecord.createdBy || '',
      created_at: newRecord.createdAt || '',
      user_id: newRecord.userId || '',
      log: newRecord.log || [],
      updated_at: new Date().toISOString()
    };

    if (typeof supabase !== 'undefined' && supabase) {
      supabase.from('permintaan_toko').upsert(supaNewRow).then(({ error }) => {
        if (error) console.warn('[SUPABASE SAVE NOTICE]:', error.message);
      }).catch(e => console.warn(e));
    }
    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
      dbFirestore.collection('requests').doc(docId).set(newRecord).catch(e => console.warn('[FIRESTORE SAVE NOTICE]:', e));
    }
    if (typeof dbRealtime !== 'undefined' && dbRealtime) {
      dbRealtime.ref(`requests/${docId}`).set(newRecord).catch(e => console.warn('[REALTIME SAVE NOTICE]:', e));
    }

    if (isDMUser) {
      tambahNotifikasiSistem(['DM'], currentUser.area, `PERMINTAAN BARU #${noSurat} DARI DM (${currentUser.fullName}). SILAKAN MEMPROSES APPROVAL DM.`, noSurat);
    } else {
      tambahNotifikasiSistem(['SERVICE'], currentUser.area, `PERMINTAAN BARU #${noSurat} DARI TOKO ${toko}. MOHON APPROVAL SERVICE.`, noSurat);
    }

    const allUsers = getUsersFromDB();
    const serviceUsers = allUsers.filter(u => u.category === 'SERVICE' && (u.area === currentUser.area || u.area === 'ALL'));
    serviceUsers.forEach(srv => {
      if (srv.phone && srv.phone !== '-') {
        const srvName = srv.fullName || srv.username || 'Bapak/Ibu Tim Service';
        kirimNotifikasiWA(srv.phone,
          `Yth. Bapak/Ibu ${srvName},\n\n` +
          `Pemberitahuan Sistem Permintaan Barang:\n` +
          `Telah dibuat pengajuan permintaan barang baru dengan rincian berikut:\n` +
          `• Nomor Dokumen : #${noSurat}\n` +
          `• Toko / Pemohon : ${toko} (${currentUser.area})\n` +
          `• Waktu Pengajuan : ${newRecord.createdAt}\n` +
          `• Link Detail : ${getAppDirectLink(noSurat)}\n\n` +
          `Mohon dapat segera diperiksa pada aplikasi. Terima kasih.`
        );
      }
    });
  }
}

function bukaMenuRiwayat() {
  filterStatusRiwayat = '';
  const searchInput = document.getElementById('searchRiwayat');
  if (searchInput) searchInput.value = '';
  showPage('riwayatPage');
}

function bukaRiwayat(status) {
  filterStatusRiwayat = status;
  const searchInput = document.getElementById('searchRiwayat');
  if (searchInput) searchInput.value = '';
  showPage('riwayatPage');
}

function isPdfButtonAllowed(req) {
  if (!req || !currentUser) return false;
  const role = String(currentUser.category || '').toUpperCase();
  
  // TOMBOL PDF TIDAK DIBERIKAN UNTUK ROLE TOKO DAN SALES
  if (role === 'TOKO' || role === 'SALES') {
    return false;
  }

  // TOMBOL PDF HANYA KELUAR JIKA DM JUGA SUDAH APPROVE (STATUS APPROVE ATAU DONE)
  const isDmApproved = (req.status === 'APPROVE' || req.status === 'DONE');
  return isDmApproved;
}
window.isPdfButtonAllowed = isPdfButtonAllowed;

function loadRiwayat() {
  const dropdown = document.getElementById('filterStatusDropdown');
  if (dropdown && filterStatusRiwayat) {
    dropdown.value = filterStatusRiwayat;
  }
  filterRiwayat();
}

function filterRiwayatDropdown() {
  const dropdown = document.getElementById('filterStatusDropdown');
  if (dropdown) {
    filterStatusRiwayat = dropdown.value;
    if (filterStatusRiwayat === 'ALL') filterStatusRiwayat = '';
  }
  filterRiwayat();
}

function filterRiwayat() {
  let data = getAccessibleRequests();
  const searchInput = document.getElementById('searchRiwayat');
  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (filterStatusRiwayat && filterStatusRiwayat !== 'ALL') {
    data = data.filter(r => r.status === filterStatusRiwayat);
  }

  if (search) {
    data = data.filter(r =>
      r.noSurat.toLowerCase().includes(search) ||
      r.toko.toLowerCase().includes(search) ||
      r.items.some(i => i.type.toLowerCase().includes(search) || i.seri.toLowerCase().includes(search) || i.barang.toLowerCase().includes(search))
    );
  }

  const thead = document.querySelector('.historyTable thead');
  const tbody = document.getElementById('riwayatData');
  if (!thead || !tbody) return;

  const role = currentUser ? currentUser.category : '';

  thead.innerHTML = `
    <tr>
      <th>AKSI</th>
      <th>TGL</th>
      <th>NO SURAT</th>
      <th>TOKO</th>
      <th>JENIS</th>
      <th>STATUS</th>
      <th>CATATAN</th>
    </tr>
  `;

  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">BELUM ADA DATA PERMINTAAN.</td></tr>`;
    return;
  }

  data.forEach(r => {
    let aksi = '';

    const isDeletedRow = (r.status === 'BATAL' || r.unfulfilled === true);

    if (isDeletedRow) {
      // UNTUK BARIS YG SUDAH DI HAPUS: HILANGKAN SEMUA TOMBOL LAINNYA, SISAKAN HANYA ICON MATA (LIHAT DETAIL)
      aksi = `
        <button class="btnIcon btnInfo" onclick="lihatDetail('${r.noSurat}')" title="LIHAT DETAIL"><span class="material-symbols-rounded">visibility</span></button>
      `;
    } else {
      const isAdminUser = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));

      if (isAdminUser) {
        if (r.status === 'PENDING' && !r.serviceApprove) {
          aksi += `
            <button class="btnIcon btnApprove" onclick="approveService('${r.noSurat}')" title="APPROVE SERVICE"><span class="material-symbols-rounded">check_circle</span></button>
            <button class="btnIcon btnReject" onclick="tolakServiceModal('${r.noSurat}', 'SERVICE')" title="REJECT SERVICE"><span class="material-symbols-rounded">cancel</span></button>
          `;
        } else if (r.status === 'PENDING' && r.serviceApprove) {
          aksi += `
            <button class="btnIcon btnApprove" onclick="approveDM('${r.noSurat}')" title="APPROVE DM"><span class="material-symbols-rounded">check_circle</span></button>
            <button class="btnIcon btnReject" onclick="tolakServiceModal('${r.noSurat}', 'DM')" title="REJECT DM"><span class="material-symbols-rounded">cancel</span></button>
          `;
        } else if (r.status === 'APPROVE') {
          aksi += `
            <button class="btnIcon btnDone" onclick="doneService('${r.noSurat}')" title="DONE"><span class="material-symbols-rounded">task_alt</span></button>
          `;
        }
      } else if (role === 'SERVICE') {
        if (r.status === 'PENDING' && !r.serviceApprove) {
          aksi += `
            <button class="btnIcon btnApprove" onclick="approveService('${r.noSurat}')" title="APPROVE SERVICE"><span class="material-symbols-rounded">check_circle</span></button>
            <button class="btnIcon btnReject" onclick="tolakServiceModal('${r.noSurat}', 'SERVICE')" title="REJECT SERVICE"><span class="material-symbols-rounded">cancel</span></button>
          `;
        } else if (r.status === 'APPROVE') {
          aksi += `
            <button class="btnIcon btnDone" onclick="doneService('${r.noSurat}')" title="DONE"><span class="material-symbols-rounded">task_alt</span></button>
          `;
        }
      } else if (role === 'DM') {
        if (r.status === 'PENDING' && r.serviceApprove) {
          aksi += `
            <button class="btnIcon btnApprove" onclick="approveDM('${r.noSurat}')" title="APPROVE DM"><span class="material-symbols-rounded">check_circle</span></button>
            <button class="btnIcon btnReject" onclick="tolakServiceModal('${r.noSurat}', 'DM')" title="REJECT DM"><span class="material-symbols-rounded">cancel</span></button>
          `;
        }
      }

      const isOwner = currentUser && (r.userId === currentUser.id || r.createdBy === currentUser.fullName || r.createdBy === currentUser.username);
      const canEdit = (r.status === 'PENDING' && !r.serviceApprove && isOwner) || (isAdminUser && r.status === 'PENDING');
      const canDelete = (r.status === 'PENDING' && !r.serviceApprove && isOwner) || isAdminUser;

      if (canEdit) {
        aksi += `
          <button class="btnIcon btnEdit" onclick="editPermintaan('${r.noSurat}')" title="EDIT PERMINTAAN"><span class="material-symbols-rounded">edit</span></button>
        `;
      }

      if (canDelete) {
        aksi += `
          <button class="btnIcon btnDelete" onclick="hapusData('${r.noSurat}')" title="HAPUS PERMINTAAN"><span class="material-symbols-rounded">delete</span></button>
        `;
      }

      // TOMBOL KHUSUS LOGIN ADMIN TERLETAK DI SEBELAH TOMBOL HAPUS DATA
      if (isAdminUser) {
        if (r.serviceApprove) {
          aksi += `
            <button class="btnIcon" onclick="batalApproveService('${r.noSurat}')" title="BATAL APPROVE SERVICE (KHUSUS ADMIN)" style="background: #eab308 !important; color: #ffffff !important;"><span class="material-symbols-rounded">undo</span></button>
          `;
        }
        if (r.status === 'APPROVE' || r.dmUserName || r.dmTTD) {
          aksi += `
            <button class="btnIcon" onclick="batalApproveDM('${r.noSurat}')" title="BATAL APPROVE DM (KHUSUS ADMIN)" style="background: #f97316 !important; color: #ffffff !important;"><span class="material-symbols-rounded">undo</span></button>
          `;
        }
      }

      aksi += `
        <button class="btnIcon btnInfo" onclick="lihatDetail('${r.noSurat}')" title="LIHAT DETAIL"><span class="material-symbols-rounded">visibility</span></button>
      `;

      const hasPhotos = (r.photos && Array.isArray(r.photos) && r.photos.length > 0) || (r.artemisPhotos && Array.isArray(r.artemisPhotos) && r.artemisPhotos.length > 0);

      if (r.status === 'DONE') {
        if (hasPhotos) {
          aksi += `
            <button class="btnIcon btnView" onclick="lihatFotoByNoSurat('${r.noSurat}')" title="BUKTI PROSES ARTEMIS (${(r.artemisPhotos || r.photos).length})" style="background: var(--primary) !important; color: #ffffff !important; box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;"><span class="material-symbols-rounded" style="font-size: 16px !important;">photo_library</span></button>
          `;
        }
      } else {
        const isPhotoHidden = (r.status === 'APPROVE' || r.status === 'REJECT') || !getFeaturePhotosEnabled();
        if (hasPhotos && !isPhotoHidden) {
          aksi += `
            <button class="btnIcon btnView" onclick="lihatFotoByNoSurat('${r.noSurat}')" title="LIHAT FOTO PERMINTAAN"><span class="material-symbols-rounded">image</span></button>
          `;
        }
      }

      const isPdfVisible = isPdfButtonAllowed(r);
      if (isPdfVisible) {
        aksi += `
          <button class="btnIcon btnPdf" onclick="bukaPdfModal('${r.noSurat}')" title="CETAK PDF"><span class="material-symbols-rounded">picture_as_pdf</span></button>
        `;
      }
    }

    const isWaitingDM = (r.status === 'PENDING' && r.serviceApprove);
    const isWaitingService = (r.status === 'PENDING' && !r.serviceApprove);

    let isOrangeRow = false;
    if (currentUser) {
      const cat = (currentUser.category || '').toUpperCase();
      const isAdm = cat === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN');
      if ((cat === 'DM' || isAdm) && isWaitingDM) {
        isOrangeRow = true;
      } else if ((cat === 'SERVICE' || isAdm) && isWaitingService) {
        isOrangeRow = true;
      }
    }

    const tr = document.createElement('tr');
    if (shouldRowBlinkRed(r)) {
      tr.className = 'blink-row-red';
    }
    tr.innerHTML = `
      <td><div style="display:flex; gap:4px; align-items:center;">${aksi}</div></td>
      <td style="white-space:nowrap;">${formatDateDDMMYYYYString(r.tanggal)}</td>
      <td>${r.noSurat}</td>
      <td>${r.toko} <div style="font-size:11px; opacity:0.8;">${r.area}</div></td>
      <td style="white-space:nowrap;">${r.jenis || 'DEFAULT'}</td>
      <td>${getBadgeStatus(r)}</td>
      <td style="word-break:break-word; white-space:normal;">${r.catatan || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function lihatFotoByNoSurat(noSurat) {
  if (!getFeaturePhotosEnabled()) {
    showNotif('FITUR UPLOAD & LIHAT FOTO SEDANG DINOAKTIFKAN OLEH ADMIN!', 'warning');
    return;
  }
  const requests = getRequestsFromDB();
  const req = requests.find(r => r && (r.noSurat === noSurat || String(r.noSurat) === String(noSurat) || r.id === noSurat));
  
  let photos = [];
  if (req) {
    const regP = parsePhotosArray(req.photos);
    const artP = parsePhotosArray(req.artemisPhotos);
    photos = [...regP, ...artP];
    photos = Array.from(new Set(photos.filter(Boolean)));
  }

  if (photos && photos.length > 0) {
    bukaViewGambar(photos, 0);
  } else {
    showNotif('TIDAK ADA FOTO BUKTI UNTUK PERMINTAAN INI!', 'warning');
  }
}
window.lihatFotoByNoSurat = lihatFotoByNoSurat;

let viewerCurrentZoom = 1;
let viewerPanX = 0;
let viewerPanY = 0;
let isDraggingViewerImage = false;
let startDragX = 0;
let startDragY = 0;
let initialPinchDistance = 0;
let initialPinchZoom = 1;

function applyViewerTransform() {
  const img = document.getElementById('viewerImage');
  if (!img) return;
  if (viewerCurrentZoom <= 1) {
    viewerCurrentZoom = 1;
    viewerPanX = 0;
    viewerPanY = 0;
  }
  img.style.transform = `translate(${viewerPanX}px, ${viewerPanY}px) scale(${viewerCurrentZoom})`;
  img.style.cursor = viewerCurrentZoom > 1 ? (isDraggingViewerImage ? 'grabbing' : 'grab') : 'pointer';
}

function zoomImage(delta) {
  viewerCurrentZoom += delta;
  if (viewerCurrentZoom < 1) viewerCurrentZoom = 1;
  if (viewerCurrentZoom > 5) viewerCurrentZoom = 5;
  applyViewerTransform();
}

function resetZoom() {
  viewerCurrentZoom = 1;
  viewerPanX = 0;
  viewerPanY = 0;
  applyViewerTransform();
}

function initPhotoViewerGestureListeners() {
  const modal = document.getElementById('imageViewer');
  const img = document.getElementById('viewerImage');
  if (!modal || !img || modal.dataset.gesturesInited) return;
  modal.dataset.gesturesInited = 'true';

  // Touch Start (Pinch or Pan)
  modal.addEventListener('touchstart', (e) => {
    if (e.target.closest('#navViewerLeft') || e.target.closest('#navViewerRight') || e.target.closest('.closeViewer') || e.target.closest('.viewerBottomBar')) {
      return;
    }

    if (e.touches.length === 2) {
      isDraggingViewerImage = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance = Math.hypot(dx, dy);
      initialPinchZoom = viewerCurrentZoom;
    } else if (e.touches.length === 1 && viewerCurrentZoom > 1) {
      isDraggingViewerImage = true;
      startDragX = e.touches[0].clientX - viewerPanX;
      startDragY = e.touches[0].clientY - viewerPanY;
    }
  }, { passive: false });

  // Touch Move
  modal.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance > 0) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        viewerCurrentZoom = initialPinchZoom * (dist / initialPinchDistance);
        if (viewerCurrentZoom < 1) viewerCurrentZoom = 1;
        if (viewerCurrentZoom > 5) viewerCurrentZoom = 5;
        applyViewerTransform();
      }
    } else if (e.touches.length === 1 && isDraggingViewerImage && viewerCurrentZoom > 1) {
      if (e.cancelable) e.preventDefault();
      viewerPanX = e.touches[0].clientX - startDragX;
      viewerPanY = e.touches[0].clientY - startDragY;
      applyViewerTransform();
    }
  }, { passive: false });

  // Touch End
  modal.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = 0;
    }
    if (e.touches.length === 0) {
      isDraggingViewerImage = false;
    }
  });

  // Mouse Drag (PC/Laptop)
  img.addEventListener('mousedown', (e) => {
    if (viewerCurrentZoom > 1) {
      isDraggingViewerImage = true;
      startDragX = e.clientX - viewerPanX;
      startDragY = e.clientY - viewerPanY;
      applyViewerTransform();
      e.preventDefault();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingViewerImage && viewerCurrentZoom > 1) {
      viewerPanX = e.clientX - startDragX;
      viewerPanY = e.clientY - startDragY;
      applyViewerTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingViewerImage) {
      isDraggingViewerImage = false;
      applyViewerTransform();
    }
  });

  // Mouse Wheel Zoom
  modal.addEventListener('wheel', (e) => {
    if (e.target.closest('.viewerBottomBar')) return;
    if (e.cancelable) e.preventDefault();
    if (e.deltaY < 0) {
      zoomImage(0.25);
    } else {
      zoomImage(-0.25);
    }
  }, { passive: false });
}

function tampilkanFotoViewerAktif() {
  viewerCurrentZoom = 1;
  viewerPanX = 0;
  viewerPanY = 0;
  applyViewerTransform();

  const img = document.getElementById('viewerImage');
  if (img && viewerPhotos.length > 0) {
    img.src = viewerPhotos[viewerCurrentIndex];
  }
  const modal = document.getElementById('imageViewer');
  if (modal) {
    modal.style.display = 'flex';
    initPhotoViewerGestureListeners();
  }
  
  const btnLeft = document.getElementById('navViewerLeft');
  const btnRight = document.getElementById('navViewerRight');
  const textCounter = document.getElementById('viewerCounter');
  
  if (btnLeft) btnLeft.style.display = viewerPhotos.length > 1 ? 'flex' : 'none';
  if (btnRight) btnRight.style.display = viewerPhotos.length > 1 ? 'flex' : 'none';
  if (textCounter) textCounter.textContent = `${viewerCurrentIndex + 1} / ${viewerPhotos.length}`;
}

function gantiFotoViewer(arah) {
  viewerCurrentIndex += arah;
  if (viewerCurrentIndex < 0) {
    viewerCurrentIndex = viewerPhotos.length - 1;
  } else if (viewerCurrentIndex >= viewerPhotos.length) {
    viewerCurrentIndex = 0;
  }
  tampilkanFotoViewerAktif();
}

function approveService(noSurat) {
  showConfirm(`APPROVE PERMINTAAN #${noSurat}?`, () => {
    const requests = getRequestsFromDB();
    const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
    if (idx !== -1) {
      requests[idx].serviceApprove = true;
      requests[idx].serviceUserName = currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE';

      const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
      const sig = ttdMap[currentUser.id] || ttdMap[currentUser.username] || ttdMap['SERVICE_' + currentUser.area] || ttdMap['SERVICE'] || '';
      if (sig) {
        requests[idx].serviceTTD = sig;
      }

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'APPROVE_SERVICE',
        user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
        notes: 'DISETUJUI SERVICE',
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      // 1. SIMPAN LOKAL & UPDATE UI INSTAN (0 ms)
      saveRequestsToDB(requests);
      showNotif(`APPROVE BERHASIL`, 'info');
      loadRiwayat();
      loadDashboard();
      if (currentUser && currentUser.category === 'SERVICE' && currentUser.area === 'TSM') loadMasterDbTable();

      // 2. PROSES SYNC SUPABASE DI LATAR BELAKANG
      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').update({
          service_approve: true,
          service_user_name: requests[idx].serviceUserName,
          service_ttd: requests[idx].serviceTTD || '',
          status: requests[idx].status || 'PENDING',
          log: requests[idx].log,
          updated_at: new Date().toISOString()
        }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }

      tambahNotifikasiSistem(['DM'], 'ALL', `PERMINTAAN #${noSurat} DISETUJUI SERVICE (${currentUser.fullName || currentUser.username}). MOHON APPROVAL DM.`, noSurat);

      const users = getUsersFromDB();
      const dmUsers = users.filter(u => u.category === 'DM');
      dmUsers.forEach(dm => {
        if (dm.phone && dm.phone !== '-') {
          const dmName = dm.fullName || dm.username || 'Bapak/Ibu DM';
          kirimNotifikasiWA(dm.phone,
            `Yth. Bapak/Ibu ${dmName},\n\n` +
            `Pemberitahuan Sistem Permintaan Barang:\n` +
            `Pengajuan permintaan barang berikut telah DISETUJUI oleh Service (${currentUser.fullName || currentUser.username}):\n` +
            `• Nomor Dokumen : #${noSurat}\n` +
            `• Toko / Pemohon : ${requests[idx].toko} (${requests[idx].area})\n` +
            `• Link Detail : ${getAppDirectLink(noSurat)}\n\n` +
            `Mohon berkenan untuk melakukan peninjauan dan persetujuan (approval) tingkat DM melalui sistem aplikasi. Terima kasih.`
          );
        }
      });
    }
  });
}

function approveDM(noSurat) {
  const requests = getRequestsFromDB();
  const req = requests.find(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
  if (req && !req.serviceApprove) {
    showNotif('PERMINTAAN WAJIB DI-APPROVE OLEH SERVICE TERLEBIH DAHULU SEBELUM DM DAPAT MEMPROSES APPROVAL!', 'warning');
    return;
  }

  showConfirm(`APPROVE PERMINTAAN #${noSurat}?`, () => {
    const requests = getRequestsFromDB();
    const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
    if (idx !== -1) {
      if (!requests[idx].serviceApprove) {
        showNotif('PERMINTAAN WAJIB DI-APPROVE OLEH SERVICE TERLEBIH DAHULU!', 'warning');
        return;
      }
      requests[idx].status = 'APPROVE';
      requests[idx].dmUserName = currentUser ? (currentUser.fullName || currentUser.username) : 'DM';

      const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
      const sig = ttdMap[currentUser.id] || ttdMap[currentUser.username] || ttdMap['DM'] || '';
      if (sig) {
        requests[idx].dmTTD = sig;
      }

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'APPROVE_DM',
        user: currentUser ? (currentUser.fullName || currentUser.username) : 'DM',
        notes: 'DISETUJUI DM',
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      // 1. SIMPAN LOKAL & UPDATE UI INSTAN (0 ms)
      saveRequestsToDB(requests);
      showNotif(`APPROVE BERHASIL`, 'info');
      loadRiwayat();
      loadDashboard();
      if (currentUser && currentUser.category === 'SERVICE' && currentUser.area === 'TSM') loadMasterDbTable();
      if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
      if (typeof cekUnreadNotif === 'function') cekUnreadNotif();

      // 2. PROSES SYNC SUPABASE DI LATAR BELAKANG
      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').update({
          status: 'APPROVE',
          dm_user_name: requests[idx].dmUserName,
          dm_ttd: requests[idx].dmTTD || '',
          log: requests[idx].log,
          updated_at: new Date().toISOString()
        }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }

      tambahNotifikasiSistem(['SERVICE', 'TOKO', 'SALES'], requests[idx].area, `PERMINTAAN #${noSurat} DARI ${requests[idx].toko} TELAH DISETUJUI DM. SILAKAN DIPROSES.`, noSurat);
      const users = getUsersFromDB();
      const serviceUsers = users.filter(u => u.category === 'SERVICE' && (u.area === requests[idx].area || u.area === 'ALL'));
      serviceUsers.forEach(srv => {
        if (srv.phone && srv.phone !== '-') {
          const srvName = srv.fullName || srv.username || 'Bapak/Ibu Tim Service';
          kirimNotifikasiWA(srv.phone,
            `Yth. Bapak/Ibu ${srvName},\n\n` +
            `Pemberitahuan Sistem Permintaan Barang:\n` +
            `Pengajuan permintaan barang berikut telah DISETUJUI OLEH DM:\n` +
            `• Nomor Dokumen : #${noSurat}\n` +
            `• Toko / Pemohon : ${requests[idx].toko} (${requests[idx].area})\n` +
            `• Status : DISETUJUI (APPROVE)\n` +
            `• Link Detail : ${getAppDirectLink(noSurat)}\n\n` +
            `Dokumen saat ini siap diproses oleh Tim Service. Terima kasih atas kerja samanya.`
          );
        }
      });
    }
  });
}

let tempArtemisPhotos = [];

function doneService(noSurat) {
  if (!noSurat) return;
  const requests = getRequestsFromDB();
  const req = requests.find(r => r && (r.noSurat === noSurat || String(r.noSurat) === String(noSurat) || r.id === noSurat));
  if (!req) {
    showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
    return;
  }

  const artemisNoSurat = document.getElementById('artemisNoSurat');
  if (artemisNoSurat) artemisNoSurat.value = noSurat;

  const artemisSubTitle = document.getElementById('artemisSubTitle');
  if (artemisSubTitle) artemisSubTitle.textContent = `UPLOAD FOTO BUKTI PROSES ARTEMIS UNTUK MENYELESAIKAN PERMINTAAN #${noSurat}:`;

  tempArtemisPhotos = [];
  renderArtemisPhotoPreviews();

  const overlay = document.getElementById('artemisOverlay');
  if (overlay) {
    overlay.classList.add('show');
    overlay.style.setProperty('display', 'flex', 'important');
    overlay.style.setProperty('visibility', 'visible', 'important');
    overlay.style.setProperty('opacity', '1', 'important');
    overlay.style.setProperty('pointer-events', 'auto', 'important');
  }
}
window.doneService = doneService;

function closeArtemisModal() {
  const overlay = document.getElementById('artemisOverlay');
  if (overlay) {
    overlay.style.setProperty('display', 'none', 'important');
    overlay.classList.remove('show');
  }
}
window.closeArtemisModal = closeArtemisModal;

function convertImageToJpeg(fileOrBlob) {
  return new Promise((resolve, reject) => {
    if (!fileOrBlob) return reject('File tidak valid');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(jpegDataUrl);
      };
      img.onerror = () => reject('Gagal memuat format gambar');
      img.src = e.target.result;
    };
    reader.onerror = () => reject('Gagal membaca berkas gambar');
    reader.readAsDataURL(fileOrBlob);
  });
}
window.convertImageToJpeg = convertImageToJpeg;

async function handleArtemisGlobalPaste(e) {
  const overlay = document.getElementById('artemisOverlay');
  if (!overlay || overlay.style.display === 'none' || !overlay.classList.contains('show')) return;

  const clipboardData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
  if (!clipboardData || !clipboardData.items) return;

  const items = clipboardData.items;
  let addedCount = 0;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type && items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        try {
          if (typeof showLoading === 'function') showLoading('MEMROSES PASTE SCREENSHOT...');
          const jpegDataUrl = await convertImageToJpeg(blob);
          tempArtemisPhotos.push(jpegDataUrl);
          addedCount++;
        } catch (err) {
          console.error('[PASTE ARTEMIS ERROR]:', err);
        } finally {
          if (typeof hideLoading === 'function') hideLoading();
        }
      }
    }
  }

  if (addedCount > 0) {
    if (e.preventDefault) e.preventDefault();
    renderArtemisPhotoPreviews();
  }
}
window.handleArtemisGlobalPaste = handleArtemisGlobalPaste;

// Attach global paste listener once initialized
if (typeof window !== 'undefined') {
  window.removeEventListener('paste', handleArtemisGlobalPaste);
  window.addEventListener('paste', handleArtemisGlobalPaste);
}

async function handleArtemisPhotoSelect(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  if (typeof showLoading === 'function') showLoading('MEMROSES FOTO BUKTI...');

  try {
    for (const file of Array.from(files)) {
      const jpegDataUrl = await convertImageToJpeg(file);
      tempArtemisPhotos.push(jpegDataUrl);
    }
    renderArtemisPhotoPreviews();
  } catch (err) {
    console.error('[UPLOAD ARTEMIS ERROR]:', err);
    showNotif('GAGAL MEMROSES FOTO BUKTI!', 'warning');
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
    e.target.value = '';
  }
}
window.handleArtemisPhotoSelect = handleArtemisPhotoSelect;

function renderArtemisPhotoPreviews() {
  const grid = document.getElementById('artemisPhotoPreviewGrid');
  if (!grid) return;

  if (tempArtemisPhotos.length === 0) {
    grid.innerHTML = '<div style="width: 100%; text-align: center; font-size: 11.5px; color: var(--text-muted); padding: 12px;">BELUM ADA FOTO ARTEMIS DIPILIH</div>';
    return;
  }

  grid.innerHTML = tempArtemisPhotos.map((imgSrc, idx) => `
    <div style="position: relative; width: 65px; height: 65px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
      <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;">
      <button type="button" onclick="hapusPhotoArtemisTemp(${idx})" style="position: absolute; top: 2px; right: 2px; background: rgba(239,68,68,0.9); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
    </div>
  `).join('');
}
window.renderArtemisPhotoPreviews = renderArtemisPhotoPreviews;

function hapusPhotoArtemisTemp(idx) {
  if (idx >= 0 && idx < tempArtemisPhotos.length) {
    tempArtemisPhotos.splice(idx, 1);
    renderArtemisPhotoPreviews();
  }
}
window.hapusPhotoArtemisTemp = hapusPhotoArtemisTemp;

function prosesSimpanDoneDenganBuktiArtemis() {
  const elNo = document.getElementById('artemisNoSurat');
  const noSurat = elNo ? elNo.value.trim() : '';

  if (!noSurat) {
    showNotif('NOMOR SURAT PERMINTAAN TIDAK VALID!', 'warning');
    return;
  }

  showConfirm(`SELESAIKAN PERMINTAAN #${noSurat} DAN SIMPAN BUKTI PROSES ARTEMIS?`, () => {
    try {
      const requests = getRequestsFromDB();
      const targetNo = String(noSurat).trim().toUpperCase();
      const idx = requests.findIndex(r => r && (
        String(r.noSurat || '').trim().toUpperCase() === targetNo ||
        String(r.id || '').trim().toUpperCase() === targetNo
      ));

      if (idx !== -1) {
        requests[idx].status = 'DONE';
        requests[idx].artemisPhotos = Array.isArray(tempArtemisPhotos) ? [...tempArtemisPhotos] : [];

        if (!Array.isArray(requests[idx].photos)) requests[idx].photos = [];
        if (Array.isArray(tempArtemisPhotos) && tempArtemisPhotos.length > 0) {
          requests[idx].photos = [...requests[idx].photos, ...tempArtemisPhotos];
        }

        // OTOMATIS: JIKA STATUS DONE, SEMUA ITEM YANG TERPENUHI MAKA KETPART JADI "DIPENUHI"
        if (Array.isArray(requests[idx].items)) {
          requests[idx].items.forEach(item => {
            if (!item.unfulfilled) {
              if (!item.statusPart && !item.keteranganPart) {
                item.statusPart = 'DIPENUHI';
                item.keteranganPart = 'DIPENUHI';
              }
            } else {
              item.statusPart = 'TIDAK DIPENUHI';
              item.keteranganPart = 'TIDAK DIPENUHI';
            }
          });
        }

        if (!requests[idx].log) requests[idx].log = [];
        requests[idx].log.push({
          action: 'DONE_WITH_ARTEMIS_PHOTOS',
          user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
          notes: `SELESAI DENGAN ${(tempArtemisPhotos || []).length} BUKTI FOTO ARTEMIS`,
          time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
        });

        // 1. SIMPAN LOKAL & UPDATE UI INSTAN (0 ms)
        saveRequestsToDB(requests);
        closeArtemisModal();
        showNotif(`PERMINTAAN #${noSurat} TELAH SELESAI (DONE) & BUKTI FOTO ARTEMIS DISIMPAN!`, 'success');
        
        tambahNotifikasiSistem(['TOKO', 'SALES', 'DM'], requests[idx].area, `PERMINTAAN #${noSurat} DARI ${requests[idx].toko} TELAH SELESAI (DONE) DENGAN BUKTI PROSES ARTEMIS.`, noSurat);
        loadRiwayat();
        loadDashboard();
        if (currentUser && currentUser.category === 'SERVICE' && currentUser.area === 'TSM') {
          if (typeof loadMasterDbTable === 'function') loadMasterDbTable();
        }

        // 2. PROSES SYNC SUPABASE DI LATAR BELAKANG (ISOLATED NON-BLOCKING)
        try {
          const docId = String(noSurat).replace(/[\/\.]/g, '_');
          if (typeof supabase !== 'undefined' && supabase) {
            supabase.from('permintaan_toko').update({
              status: 'DONE',
              items: requests[idx].items,
              photos: requests[idx].photos,
              artemis_photos: requests[idx].artemisPhotos,
              log: requests[idx].log,
              updated_at: new Date().toISOString()
            }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn('[SUPABASE DONE UPDATE NOTICE]:', e));
          }
          if (typeof dbFirestore !== 'undefined' && dbFirestore) {
            dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
          }
          if (typeof dbRealtime !== 'undefined' && dbRealtime) {
            dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
          }
        } catch(sbErr) {
          console.warn('[BACKGROUND SYNC NOTICE]:', sbErr);
        }
      } else {
        showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
      }
    } catch (err) {
      console.error('[PROSES DONE ERROR]:', err);
      showNotif('GAGAL MENYIMPAN STATUS DONE: ' + (err.message || err), 'danger');
    }
  });
}
window.prosesSimpanDoneDenganBuktiArtemis = prosesSimpanDoneDenganBuktiArtemis;

function batalApproveService(noSurat) {
  if (!noSurat) return;
  const isAdminUser = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  if (!isAdminUser) {
    showNotif('FUNGSI BATAL APPROVAL SERVICE HANYA DAPAT DILAKUKAN OLEH AKUN ADMIN!', 'warning');
    return;
  }

  showConfirm(`BATALKAN APPROVAL SERVICE UNTUK PERMINTAAN #${noSurat}?`, () => {
    const requests = getRequestsFromDB();
    const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
    if (idx !== -1) {
      requests[idx].serviceApprove = false;
      requests[idx].serviceUserName = '';
      requests[idx].serviceTTD = '';
      requests[idx].status = 'PENDING';

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'BATAL_APPROVE_SERVICE',
        user: currentUser ? currentUser.fullName : 'ADMIN',
        notes: 'BATAL APPROVAL SERVICE',
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      saveRequestsToDB(requests);
      showNotif(`BERHASIL MEMBATALKAN APPROVAL SERVICE #${noSurat}!`, 'info');
      loadRiwayat();
      loadDashboard();
      if (typeof loadMasterDbTable === 'function') loadMasterDbTable();

      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').update({
          service_approve: false,
          service_user_name: '',
          service_ttd: '',
          status: 'PENDING',
          log: requests[idx].log,
          updated_at: new Date().toISOString()
        }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }
    }
  });
}
window.batalApproveService = batalApproveService;

function batalApproveDM(noSurat) {
  if (!noSurat) return;
  const isAdminUser = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  if (!isAdminUser) {
    showNotif('FUNGSI BATAL APPROVAL DM HANYA DAPAT DILAKUKAN OLEH AKUN ADMIN!', 'warning');
    return;
  }

  showConfirm(`BATALKAN APPROVAL DM UNTUK PERMINTAAN #${noSurat}?`, () => {
    const requests = getRequestsFromDB();
    const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
    if (idx !== -1) {
      requests[idx].dmApprove = false;
      requests[idx].dmUserName = '';
      requests[idx].dmTTD = '';
      requests[idx].status = 'PENDING';

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'BATAL_APPROVE_DM',
        user: currentUser ? currentUser.fullName : 'ADMIN',
        notes: 'BATAL APPROVAL DM',
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      saveRequestsToDB(requests);
      showNotif(`BERHASIL MEMBATALKAN APPROVAL DM #${noSurat}!`, 'info');
      loadRiwayat();
      loadDashboard();
      if (typeof loadMasterDbTable === 'function') loadMasterDbTable();

      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').update({
          status: 'PENDING',
          dm_user_name: '',
          dm_ttd: '',
          log: requests[idx].log,
          updated_at: new Date().toISOString()
        }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }
    }
  });
}
window.batalApproveDM = batalApproveDM;

function tolakServiceModal(noSurat, roleType) {
  const elNo = document.getElementById('rejectNoSurat');
  const elRole = document.getElementById('rejectRoleType');
  const elReason = document.getElementById('rejectReason');
  const elTitle = document.getElementById('rejectTitle');

  if (elNo) elNo.value = noSurat;
  if (elRole) elRole.value = roleType;
  if (elReason) elReason.value = '';
  if (elTitle) elTitle.textContent = `TOLAK PERMINTAAN`;
  
  const modal = document.getElementById('rejectOverlay');
  if (modal) modal.style.display = 'flex';
  pushPopupHistoryState();
}

function closeReject() {
  const modal = document.getElementById('rejectOverlay');
  if (modal) modal.style.display = 'none';
}

function kirimReject() {
  const noSurat = document.getElementById('rejectNoSurat').value;
  const roleType = document.getElementById('rejectRoleType').value;
  const alasan = document.getElementById('rejectReason').value.trim().toUpperCase();

  if (!alasan) {
    showNotif('MASUKKAN ALASAN PENOLAKAN!', 'warning');
    return;
  }

  closeReject();
  const requests = getRequestsFromDB();
  const idx = requests.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
  if (idx !== -1) {
    requests[idx].status = 'REJECT';
    requests[idx].catatan = `DITOLAK ${roleType}: ${alasan}`;
    if (!requests[idx].log) requests[idx].log = [];
    requests[idx].log.push({
      action: `REJECT_${roleType}`,
      user: currentUser ? (currentUser.fullName || currentUser.username) : 'ADMIN',
      notes: alasan,
      time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
    });

    // 1. SIMPAN LOKAL & UPDATE UI INSTAN (0 ms)
    saveRequestsToDB(requests);
    showNotif(`PERMINTAAN BERHASIL DITOLAK`, 'info');
    loadRiwayat();
    loadDashboard();
    if (typeof loadMasterDbTable === 'function') loadMasterDbTable();

    // 2. PROSES SYNC SUPABASE DI LATAR BELAKANG
    const docId = String(noSurat).replace(/[\/\.]/g, '_');
    if (typeof supabase !== 'undefined' && supabase) {
      supabase.from('permintaan_toko').update({
        status: 'REJECT',
        catatan: requests[idx].catatan,
        log: requests[idx].log,
        updated_at: new Date().toISOString()
      }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
    }
    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
      dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
    }
    if (typeof dbRealtime !== 'undefined' && dbRealtime) {
      dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
    }

    const users = getUsersFromDB();
    const creator = users.find(u => u && (u.id === requests[idx].userId || u.fullName === requests[idx].createdBy));

    if (roleType === 'SERVICE') {
      tambahNotifikasiSistem(['TOKO', 'SALES'], requests[idx].area, `PERMINTAAN #${noSurat} DITOLAK SERVICE. CATATAN: ${alasan}`, noSurat);
      if (creator && creator.phone) {
        kirimNotifikasiWA(creator.phone,
          `Yth. Bapak/Ibu,\n\n` +
          `Pemberitahuan Sistem Permintaan Barang:\n` +
          `Pengajuan permintaan barang berikut DITOLAK oleh Tim Service:\n` +
          `• Nomor Dokumen : #${noSurat}\n` +
          `• Toko / Pemohon : ${requests[idx].toko} (${requests[idx].area})\n` +
          `• Catatan / Alasan : ${alasan}\n` +
          `• Link Detail : ${getAppDirectLink(noSurat)}\n\n` +
          `Silakan periksa kembali rincian dokumen pada sistem aplikasi. Terima kasih.`
        );
      }
    } else if (roleType === 'DM') {
      tambahNotifikasiSistem(['SERVICE', 'TOKO', 'SALES'], requests[idx].area, `PERMINTAAN #${noSurat} DARI ${requests[idx].toko} DITOLAK DM. CATATAN: ${alasan}`, noSurat);
      if (creator && creator.phone) {
        kirimNotifikasiWA(creator.phone,
          `Yth. Bapak/Ibu,\n\n` +
          `Pemberitahuan Sistem Permintaan Barang:\n` +
          `Pengajuan permintaan barang berikut DITOLAK oleh DM Pusat:\n` +
          `• Nomor Dokumen : #${noSurat}\n` +
          `• Toko / Pemohon : ${requests[idx].toko} (${requests[idx].area})\n` +
          `• Catatan / Alasan : ${alasan}\n` +
          `• Link Detail : ${getAppDirectLink(noSurat)}\n\n` +
          `Silakan periksa kembali rincian dokumen pada sistem aplikasi. Terima kasih.`
        );
      }
    }
  }
}

function editPermintaan(noSurat) {
  const requests = getRequestsFromDB();
  const req = requests.find(r => r.noSurat === noSurat);
  if (!req) return;

  const isAdminUser = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  if (req.serviceApprove && !isAdminUser) {
    showNotif('PERMINTAAN TERKUNCI! TIDAK DAPAT DIUBAH KARENA SUDAH DI-APPROVE SERVICE.', 'warning');
    return;
  }

  modeEdit = true;
  editNoSurat = req.noSurat;

  pindahHalaman('inputPage');

  const tokoEl = document.getElementById('toko');
  const jenisEl = document.getElementById('jenisPermintaan');
  const catatanEl = document.getElementById('catatan');

  if (tokoEl) tokoEl.value = req.toko;
  if (jenisEl) jenisEl.value = req.jenis;
  if (catatanEl) catatanEl.value = req.catatan || '';

  gantiJenis();

  const container = document.getElementById('detailContainer');
  if (container) {
    container.innerHTML = '';

    req.items.forEach(item => {
      tambahRow();
      const row = container.lastElementChild;
      if (row.querySelector('.typeBarang')) row.querySelector('.typeBarang').value = item.type || '';
      if (row.querySelector('.seriBarang')) row.querySelector('.seriBarang').value = item.seri || '';
      if (row.querySelector('.seriDusBarang')) row.querySelector('.seriDusBarang').value = item.dus || '';
      if (row.querySelector('.namaBarang')) row.querySelector('.namaBarang').value = item.barang || '';
      if (row.querySelector('.qty')) row.querySelector('.qty').value = item.qty || 1;
      if (row.querySelector('.alasan')) row.querySelector('.alasan').value = item.alasan || '';

      if (item.unfulfilled || item.batal || req.status === 'BATAL') {
        row.classList.add('unfulfilled');
        row.setAttribute('data-unfulfilled', 'true');
        row.style.background = 'rgba(239, 68, 68, 0.12)';
        row.style.border = '1.5px solid #ef4444';
        const inputs = row.querySelectorAll('input');
        inputs.forEach(inp => {
          inp.style.textDecoration = 'line-through';
          inp.style.textDecorationThickness = '3px';
          inp.style.fontWeight = 'bold';
          inp.style.color = '#ef4444';
        });
        const btnHapus = row.querySelector('.btnHapusRow');
        if (btnHapus) {
          btnHapus.innerHTML = `<span class="material-symbols-rounded">undo</span>`;
          btnHapus.style.background = '#eab308';
          btnHapus.title = 'BATALKAN TANDA TIDAK DIPENUHI';
        }
      }
    });
  }

  currentPhotos = [...(req.photos || [])];
  renderPhotoGrid();

  const btnSimpan = document.getElementById('btnSimpan');
  if (btnSimpan) btnSimpan.textContent = 'SIMPAN PERUBAHAN';
}

function editData(noSurat) {
  editPermintaan(noSurat);
}
window.editData = editData;
window.editPermintaan = editPermintaan;

function hapusData(noSurat) {
  if (!noSurat) return;
  showConfirm(`APAKAH ANDA YAKIN INGIN MENGHAPUS PERMINTAAN #${noSurat} INI?`, () => {
    try {
      const currentReqs = getRequestsFromDB();
      const idx = currentReqs.findIndex(r => r && String(r.noSurat).trim().toUpperCase() === String(noSurat).trim().toUpperCase());
      if (idx !== -1) {
        currentReqs[idx].status = 'BATAL';
        currentReqs[idx].unfulfilled = true;
        if (Array.isArray(currentReqs[idx].items)) {
          currentReqs[idx].items.forEach(i => i.unfulfilled = true);
        }
        if (!currentReqs[idx].log) currentReqs[idx].log = [];
        currentReqs[idx].log.push({
          action: 'TIDAK_DIPENUHI',
          user: currentUser ? (currentUser.fullName || currentUser.username) : 'USER',
          notes: 'HAPUS PERMINTAAN',
          time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
        });

        // 1. SIMPAN LOKAL SECARA INSTAN (0 ms)
        saveRequestsToDB(currentReqs);
        showNotif(`PERMINTAAN #${noSurat} BERHASIL DIHAPUS!`, 'warning');
        if (typeof loadRiwayat === 'function') loadRiwayat();
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof loadMasterDbTable === 'function') loadMasterDbTable();

        // 2. PROSES SYNC SUPABASE DI LATAR BELAKANG
        const docId = String(noSurat).replace(/[\/\.]/g, '_');
        if (typeof supabase !== 'undefined' && supabase) {
          supabase.from('permintaan_toko').update({
            status: 'BATAL',
            items: currentReqs[idx].items,
            log: currentReqs[idx].log,
            updated_at: new Date().toISOString()
          }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn(e));
        }
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          dbFirestore.collection('requests').doc(docId).set(currentReqs[idx], { merge: true }).catch(e => console.warn(e));
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          dbRealtime.ref(`requests/${docId}`).set(currentReqs[idx]).catch(e => console.warn(e));
        }
      }
    } catch (err) {
      console.error('[HAPUS DATA ERROR]:', err);
      showNotif('GAGAL MENGHAPUS PERMINTAAN: ' + (err.message || err), 'error');
    }
  });
}
window.hapusData = hapusData;

function tutupDetailBarangV2() {
  const detailModal = document.getElementById('popupDetailBarangV2');
  if (detailModal) {
    detailModal.style.display = 'none';
    detailModal.classList.remove('show');
  }

  setTimeout(() => {
    const activePageId = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : 'dashboardPage';
    if (typeof aturTampilanLonceng === 'function') {
      aturTampilanLonceng(activePageId);
    }
  }, 100);
}
window.tutupDetailBarangV2 = tutupDetailBarangV2;
window.closeDetail = tutupDetailBarangV2;

let isItemModifiedMap = {};

function hapusBarisItemDetailAdmin(noSurat, itemIndex) {
  if (!noSurat) return;

  const requests = getRequestsFromDB();
  const idx = requests.findIndex(r => r && (r.noSurat === noSurat || String(r.noSurat) === String(noSurat) || r.id === noSurat));
  if (idx === -1) return;

  let rawItems = requests[idx].items;
  let itemsList = [];
  if (Array.isArray(rawItems)) {
    itemsList = [...rawItems];
  } else if (typeof rawItems === 'string') {
    try { itemsList = JSON.parse(rawItems || '[]'); } catch (e) { itemsList = []; }
  }

  if (itemIndex >= 0 && itemIndex < itemsList.length) {
    const targetItemName = itemsList[itemIndex].barang || itemsList[itemIndex].permintaan || itemsList[itemIndex].type || `Baris ${itemIndex + 1}`;
    
    showConfirm(`TANDAI ITEM '${targetItemName}' SEBAGAI TIDAK DIPENUHI?`, () => {
      itemsList[itemIndex].unfulfilled = true;
      requests[idx].items = itemsList;

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'TIDAK_DIPENUHI_ITEM',
        user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
        notes: `Tandai tidak dipenuhi item '${targetItemName}'`,
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      saveRequestsToDB(requests);
      isItemModifiedMap[noSurat] = true;

      showNotif(`ITEM DITANDAI TIDAK DIPENUHI. KLIK 'SIMPAN PERUBAHAN KE CLOUD' UNTUK MENYIMPAN KE DATABASE.`, 'warning');
      lihatDetail(noSurat);
    });
  }
}
window.hapusBarisItemDetailAdmin = hapusBarisItemDetailAdmin;

function undoBarisItemDetailAdmin(noSurat, itemIndex) {
  if (!noSurat) return;

  const requests = getRequestsFromDB();
  const idx = requests.findIndex(r => r && (r.noSurat === noSurat || String(r.noSurat) === String(noSurat) || r.id === noSurat));
  if (idx === -1) return;

  let rawItems = requests[idx].items;
  let itemsList = [];
  if (Array.isArray(rawItems)) {
    itemsList = [...rawItems];
  } else if (typeof rawItems === 'string') {
    try { itemsList = JSON.parse(rawItems || '[]'); } catch (e) { itemsList = []; }
  }

  if (itemIndex >= 0 && itemIndex < itemsList.length) {
    const targetItemName = itemsList[itemIndex].barang || itemsList[itemIndex].permintaan || itemsList[itemIndex].type || `Baris ${itemIndex + 1}`;
    
    delete itemsList[itemIndex].unfulfilled;
    requests[idx].items = itemsList;

    if (!requests[idx].log) requests[idx].log = [];
    requests[idx].log.push({
      action: 'UNDO_TIDAK_DIPENUHI_ITEM',
      user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
      notes: `Undo status tidak dipenuhi item '${targetItemName}'`,
      time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
    });

    saveRequestsToDB(requests);
    isItemModifiedMap[noSurat] = true;

    showNotif(`BATALKAN STATUS TIDAK DIPENUHI PADA ITEM '${targetItemName}'. KLIK 'SIMPAN PERUBAHAN KE CLOUD'.`, 'info');
    lihatDetail(noSurat);
  }
}
window.undoBarisItemDetailAdmin = undoBarisItemDetailAdmin;

function simpanPerubahanDetailAdmin(noSurat) {
  if (!noSurat) return;

  const isModified = isItemModifiedMap[noSurat];

  if (!isModified) {
    showNotif('TIDAK ADA PERUBAHAN PADA ITEM BARANG!', 'warning');
    return;
  }

  showConfirm(`APAKAH ANDA YAKIN INGIN MENYIMPAN PERUBAHAN ITEM PERMINTAAN #${noSurat} KE CLOUD?`, () => {
    showLoading('MENYIMPAN PERUBAHAN ITEM KE CLOUD...');
    setTimeout(async () => {
      try {
        const requests = getRequestsFromDB();
        const req = requests.find(r => r && (r.noSurat === noSurat || String(r.noSurat) === String(noSurat) || r.id === noSurat));
        if (!req) {
          hideLoading();
          showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
          return;
        }

        if (typeof supabase !== 'undefined' && supabase) {
          try {
            const { error: err1 } = await supabase.from('permintaan_toko').update({
              items: req.items
            }).eq('no_surat', noSurat);
            if (err1) {
              await supabase.from('permintaan_toko').update({
                items: req.items
              }).eq('id', req.id || noSurat);
            }
          } catch (e) {
            console.error("Supabase update error:", e);
          }
        }

        isItemModifiedMap[noSurat] = false;

        if (typeof syncSupabaseRequestsToLocalCache === 'function') {
          await syncSupabaseRequestsToLocalCache();
        }

        if (typeof notifySupabaseDataChanged === 'function') {
          notifySupabaseDataChanged('permintaan_toko');
        }

        hideLoading();
        showNotif(`PERUBAHAN ITEM PERMINTAAN #${noSurat} BERHASIL DISIMPAN KE CLOUD!`, 'success');

        if (typeof loadRiwayat === 'function') loadRiwayat();
        if (typeof loadDashboard === 'function') loadDashboard();
        if (currentUser && currentUser.category === 'SERVICE' && currentUser.area === 'TSM') {
          if (typeof loadMasterDbTable === 'function') loadMasterDbTable();
        }

        lihatDetail(noSurat);
      } catch (err) {
        hideLoading();
        console.error(err);
        showNotif('GAGAL MENYIMPAN PERUBAHAN KE CLOUD', 'danger');
      }
    }, 300);
  });
}
window.simpanPerubahanDetailAdmin = simpanPerubahanDetailAdmin;

async function lihatDetail(noSuratOrObj, fromDashboard = false) {
  let req = null;
  if (typeof noSuratOrObj === 'object' && noSuratOrObj !== null) {
    req = noSuratOrObj;
  } else {
    const targetStr = String(noSuratOrObj || '').trim();
    if (!targetStr) return false;
    const requests = typeof getRequestsFromDB === 'function' ? getRequestsFromDB() : [];
    req = requests.find(r => r && (r.noSurat === targetStr || decodeURIComponent(r.noSurat || '') === targetStr || r.noSurat === decodeURIComponent(targetStr)));

    if (!req && typeof supabase !== 'undefined' && supabase) {
      try {
        const { data, error } = await supabase.from('permintaan_toko').select('*').eq('no_surat', targetStr);
        if (data && data.length > 0) {
          const raw = data[0];
          req = {
            id: raw.id,
            noSurat: raw.no_surat,
            tanggal: raw.tanggal,
            toko: raw.toko,
            area: raw.area,
            jenis: raw.jenis,
            catatan: raw.catatan,
            items: raw.items,
            photos: raw.photos,
            status: raw.status,
            serviceApprove: raw.service_approve,
            createdBy: raw.created_by,
            createdAt: raw.created_at,
            userId: raw.user_id
          };
        }
      } catch(e) {}
    }
  }

  if (!req) return false;

  const isDus = String(req.jenis || '').toUpperCase() === 'DUS';
  const popupTitleV2 = document.getElementById('popupTitleV2');
  if (popupTitleV2) popupTitleV2.textContent = isDus ? 'DETAIL PERMINTAAN DUS' : 'DETAIL PERMINTAAN';
  const bodyBox = document.getElementById('popupBodyV2');
  if (!bodyBox) return;

  let headerInfoHtml = `
    <div class="detailHeaderInfoV2" style="display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; justify-content: flex-start !important; align-items: center !important; width: 100% !important; padding: 6px 12px !important; box-sizing: border-box !important; background: transparent !important;">
      <div class="noSuratWrapV2" style="display: inline-flex !important; align-items: center !important; text-align: left !important; white-space: nowrap !important; flex: 0 0 auto !important; background: transparent !important;">
        <span style="opacity: 0.85; font-weight: 500; color: var(--text-main);">NO SURAT : </span>
        <span class="noSuratValV2" style="color: var(--primary) !important; font-weight: 700 !important; margin-left: 4px; background: transparent !important;">${req.noSurat || '-'}</span>
      </div>
    </div>
  `;

  let rawItems = req.items;
  let itemsList = [];
  if (Array.isArray(rawItems)) {
    itemsList = rawItems;
  } else if (typeof rawItems === 'string') {
    try { itemsList = JSON.parse(rawItems || '[]'); } catch (e) { itemsList = []; }
  }

  const thBase = "background: var(--primary) !important; color: #ffffff !important; padding: 8px 10px !important; border: 1px solid var(--border-color) !important; position: sticky !important; top: 0 !important; z-index: 100 !important; font-size: 11.5px !important; font-weight: 700 !important; letter-spacing: 0.3px !important; box-shadow: none !important; text-shadow: none !important;";
  const thStyleAutofit = `${thBase} width: 1% !important; white-space: nowrap !important; text-align: center !important;`;
  const thStyleLeft = `${thBase} text-align: left !important;`;

  const tdBase = "padding: 8px 10px !important; border: 1px solid var(--border-color) !important; background: var(--bg-box) !important; color: var(--text-main) !important; font-size: 12px !important; vertical-align: middle !important;";
  const tdStyleAutofit = `${tdBase} width: 1% !important; white-space: nowrap !important; text-align: center !important;`;
  const tdStyleLeft = `${tdBase} text-align: left !important;`;

  const role = currentUser ? (currentUser.category || '').toUpperCase() : '';
  const isAdminUser = currentUser && (role === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  const isServiceUser = (role === 'SERVICE' || isAdminUser);
  
  // HANYA MUNCUL TOMBOL AKSI BARIS (TIDAK DIPENUHI & EDIT KETERANGAN PART) APABILA STATUSNYA SUDAH APPROVE
  const canServiceRowActions = isServiceUser && (req.status === 'APPROVE');
  
  // KOLOM KETERANGAN PART HANYA DITAMPILKAN JIKA STATUS APPROVE ATAU DONE (PENDING & REJECT TIDAK DITAMPILKAN)
  const showKetPartCol = (req.status === 'APPROVE' || req.status === 'DONE');

  let itemsHtml = itemsList.map((i, idx) => {
    const isUnfulfilled = i.unfulfilled === true;
    const strikeStyle = isUnfulfilled ? "text-decoration: line-through !important; text-decoration-thickness: 1.5px !important; color: #ef4444 !important; font-weight: 600 !important; opacity: 0.85;" : "";

    const typeVal = i.type || i.tipe || i.jenis || '-';
    const seriVal = i.seri || i.sn || i.serial || '-';
    const barangVal = i.barang || i.permintaan || i.namaBarang || '-';
    const dusVal = i.dus || i.snDus || i.seriDus || i.seri || '-';
    const alasanVal = i.alasan || i.keterangan || '-';
    const qtyVal = i.qty || i.jumlah || 1;

    // RENDER BADGE NO / STATUS PART (OTOMATIS 'DIPENUHI' JIKA STATUS DONE DAN TERPENUHI)
    let statusPartVal = (i.statusPart || i.keteranganPart || i.noPart || '').trim();
    if (req.status === 'DONE' && !isUnfulfilled && !statusPartVal) {
      statusPartVal = 'DIPENUHI';
    }

    let statusPartBadgeHtml = '<span style="color: var(--text-muted); font-size: 11px;">-</span>';
    if (isUnfulfilled) {
      statusPartBadgeHtml = `<span style="display: inline-block; padding: 2px 7px; border-radius: 6px; font-weight: 700; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444;">TIDAK DIPENUHI</span>`;
    } else if (statusPartVal) {
      const up = statusPartVal.toUpperCase();
      let badgeBg = 'rgba(2, 132, 199, 0.12)';
      let badgeColor = '#0284c7';
      let badgeBorder = '#0284c7';
      if (up.includes('DIPENUHI') || up.includes('READY') || up.includes('TERSEDIA') || up.includes('TERPASANG')) {
        badgeBg = 'rgba(16, 185, 129, 0.15)';
        badgeColor = '#10b981';
        badgeBorder = '#10b981';
      } else if (up.includes('INDENT') || up.includes('ORDER') || up.includes('PROSES') || up.includes('PESAN')) {
        badgeBg = 'rgba(245, 158, 11, 0.15)';
        badgeColor = '#f59e0b';
        badgeBorder = '#f59e0b';
      } else if (up.includes('BATAL') || up.includes('KOSONG') || up.includes('TIDAK DIPENUHI')) {
        badgeBg = 'rgba(239, 68, 68, 0.15)';
        badgeColor = '#ef4444';
        badgeBorder = '#ef4444';
      }
      statusPartBadgeHtml = `<span style="display: inline-block; padding: 2px 7px; border-radius: 6px; font-weight: 700; font-size: 11px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">${statusPartVal}</span>`;
    }

    let ketPartTdHtml = showKetPartCol ? `<td style="${tdStyleLeft} ${strikeStyle}">${statusPartBadgeHtml}</td>` : '';

    let actionTdHtml = '';
    if (canServiceRowActions) {
      let unfulfilledBtn = '';
      if (isUnfulfilled) {
        unfulfilledBtn = `
          <button type="button" class="btnIcon btnUndo" onclick="undoBarisItemDetailAdmin('${req.noSurat}', ${idx})" title="BATALKAN (UNDO)" style="padding: 3px 6px !important; border-radius: 6px !important; line-height: 1 !important; height: auto !important; background: #f59e0b !important; color: #ffffff !important; border: none !important; cursor: pointer !important;">
            <span class="material-symbols-rounded" style="font-size: 15px !important;">undo</span>
          </button>
        `;
      } else {
        unfulfilledBtn = `
          <button type="button" class="btnIcon btnDelete" onclick="hapusBarisItemDetailAdmin('${req.noSurat}', ${idx})" title="TANDAI TIDAK DIPENUHI" style="padding: 3px 6px !important; border-radius: 6px !important; line-height: 1 !important; height: auto !important; background: #ef4444 !important; color: #ffffff !important; border: none !important; cursor: pointer !important;">
            <span class="material-symbols-rounded" style="font-size: 15px !important;">cancel</span>
          </button>
        `;
      }

      // TOMBOL EDIT KETERANGAN PART (MANUAL FREE TEXT) PERSIS DI SEBELAH TOMBOL TIDAK DIPENUHI
      const editPartBtn = `
        <button type="button" class="btnIcon btnEditPartRow" onclick="bukaModalEditKetPartSingle('${req.noSurat}', ${idx})" title="EDIT KETERANGAN / NO PART (FREE TEXT)" style="padding: 3px 6px !important; border-radius: 6px !important; line-height: 1 !important; height: auto !important; background: #0284c7 !important; color: #ffffff !important; border: none !important; cursor: pointer !important; margin-left: 4px !important;">
          <span class="material-symbols-rounded" style="font-size: 15px !important;">edit_note</span>
        </button>
      `;

      actionTdHtml = `
        <td style="${tdStyleAutofit}">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            ${unfulfilledBtn}
            ${editPartBtn}
          </div>
        </td>
      `;
    }

    if (isDus) {
      return `
        <tr style="${isUnfulfilled ? 'background: rgba(239, 68, 68, 0.08) !important;' : ''}">
          <td style="${tdStyleAutofit} ${strikeStyle}">${idx + 1}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${typeVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${seriVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${barangVal}</td>
          <td style="${tdStyleLeft} color: #d97706 !important; font-weight: 600 !important; ${strikeStyle}">${dusVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${alasanVal}</td>
          <td style="${tdStyleAutofit} font-weight: 700 !important; ${strikeStyle}">${qtyVal}</td>
          ${ketPartTdHtml}
          ${actionTdHtml}
        </tr>
      `;
    } else {
      return `
        <tr style="${isUnfulfilled ? 'background: rgba(239, 68, 68, 0.08) !important;' : ''}">
          <td style="${tdStyleAutofit} ${strikeStyle}">${idx + 1}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${typeVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${seriVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${barangVal}</td>
          <td style="${tdStyleLeft} ${strikeStyle}">${alasanVal}</td>
          <td style="${tdStyleAutofit} font-weight: 700 !important; ${strikeStyle}">${qtyVal}</td>
          ${ketPartTdHtml}
          ${actionTdHtml}
        </tr>
      `;
    }
  }).join('');

  let bottomActionsHtml = '';
  let actionButtons = [];

  const isDeletedReq = (req.status === 'BATAL' || req.unfulfilled === true);

  if (!isDeletedReq) {
    if (req.status === 'PENDING') {
      if (role === 'SERVICE' || isAdminUser) {
        if (!req.serviceApprove) {
          actionButtons.push(`
            <button type="button" class="btnIcon btnApprove btnIconOnly" title="APPROVE" onclick="tutupDetailBarangV2(); approveService('${req.noSurat}');">
              <span class="material-symbols-rounded">check_circle</span>
            </button>
          `);
          actionButtons.push(`
            <button type="button" class="btnIcon btnReject btnIconOnly" title="TOLAK" onclick="tutupDetailBarangV2(); tolakServiceModal('${req.noSurat}', 'SERVICE');">
              <span class="material-symbols-rounded">cancel</span>
            </button>
          `);
        } else if (isAdminUser) {
          actionButtons.push(`
            <button type="button" class="btnIcon btnApprove btnIconOnly" title="APPROVE" onclick="tutupDetailBarangV2(); approveDM('${req.noSurat}');">
              <span class="material-symbols-rounded">check_circle</span>
            </button>
          `);
          actionButtons.push(`
            <button type="button" class="btnIcon btnReject btnIconOnly" title="TOLAK" onclick="tutupDetailBarangV2(); tolakServiceModal('${req.noSurat}', 'DM');">
              <span class="material-symbols-rounded">cancel</span>
            </button>
          `);
        }
      }
      
      if (role === 'DM' && req.serviceApprove) {
        actionButtons.push(`
          <button type="button" class="btnIcon btnApprove btnIconOnly" title="APPROVE" onclick="tutupDetailBarangV2(); approveDM('${req.noSurat}');">
            <span class="material-symbols-rounded">check_circle</span>
          </button>
        `);
        actionButtons.push(`
          <button type="button" class="btnIcon btnReject btnIconOnly" title="TOLAK" onclick="tutupDetailBarangV2(); tolakServiceModal('${req.noSurat}', 'DM');">
            <span class="material-symbols-rounded">cancel</span>
          </button>
        `);
      }
    }

    const isPdfVisible = isPdfButtonAllowed(req);
    if (isPdfVisible) {
      actionButtons.push(`
        <button type="button" class="btnIcon btnPdf btnIconOnly" title="CETAK PDF" onclick="tutupDetailBarangV2(); bukaPdfModal('${req.noSurat}');">
          <span class="material-symbols-rounded">picture_as_pdf</span>
        </button>
      `);
    }

    if (req.status === 'APPROVE' && (role === 'SERVICE' || isAdminUser)) {
      actionButtons.push(`
        <button type="button" class="btnIcon btnDone btnIconOnly" title="SET DONE" onclick="tutupDetailBarangV2(); doneService('${req.noSurat}');">
          <span class="material-symbols-rounded">task_alt</span>
        </button>
      `);
    }

    if (canServiceRowActions) {
      actionButtons.push(`
        <button type="button" class="btnIcon btnSave btnIconOnly" title="SIMPAN PERUBAHAN KE CLOUD" onclick="simpanPerubahanDetailAdmin('${req.noSurat}');" style="background: #059669 !important; color: #ffffff !important;">
          <span class="material-symbols-rounded">save</span>
        </button>
      `);
    }

    // BATAL APPROVE SERVICE / DM BUTTONS EXCLUSIVELY VISIBLE FOR ADMIN LOGIN ACCOUNT ONLY (HILANGKAN DARI SERVICE, DM, TOKO, SALES)
    if (isAdminUser) {
      if (req.serviceApprove) {
        actionButtons.push(`
          <button type="button" class="btnIcon btnIconOnly" title="BATAL APPROVE SERVICE" onclick="tutupDetailBarangV2(); batalApproveService('${req.noSurat}');" style="background: #eab308 !important; color: #ffffff !important;">
            <span class="material-symbols-rounded">undo</span>
          </button>
        `);
      }
      if (req.status === 'APPROVE' || req.dmUserName || req.dmTTD) {
        actionButtons.push(`
          <button type="button" class="btnIcon btnIconOnly" title="BATAL APPROVE DM" onclick="tutupDetailBarangV2(); batalApproveDM('${req.noSurat}');" style="background: #f97316 !important; color: #ffffff !important;">
            <span class="material-symbols-rounded">undo</span>
          </button>
        `);
      }
    }

    const isCreator = currentUser && (req.userId === currentUser.id || req.createdBy === currentUser.fullName || (currentUser.category === 'TOKO' && req.toko.toUpperCase() === currentUser.fullName.toUpperCase()));
    const canCreatorEditDelete = isCreator && !req.serviceApprove && req.status === 'PENDING';
    const canServiceEditDelete = (role === 'SERVICE' && !req.serviceApprove && req.status === 'PENDING');
    const canAdminEditDelete = isAdminUser;

    if (canCreatorEditDelete || canServiceEditDelete || canAdminEditDelete) {
      actionButtons.push(`
        <button type="button" class="btnIcon btnEdit btnIconOnly" title="EDIT" onclick="tutupDetailBarangV2(); editPermintaan('${req.noSurat}');">
          <span class="material-symbols-rounded">edit</span>
        </button>
      `);
      actionButtons.push(`
        <button type="button" class="btnIcon btnDelete btnIconOnly" title="HAPUS PERMINTAAN" onclick="tutupDetailBarangV2(); hapusData('${req.noSurat}');">
          <span class="material-symbols-rounded">delete</span>
        </button>
      `);
    }
  }

  const allReqPhotos = [
    ...(Array.isArray(req.photos) ? req.photos : []),
    ...(Array.isArray(req.artemisPhotos) ? req.artemisPhotos : [])
  ].filter(Boolean);

  if (allReqPhotos.length > 0) {
    const isDoneState = req.status === 'DONE';
    actionButtons.push(`
      <button type="button" class="btnIcon btnPhotoView btnIconOnly" title="${isDoneState ? 'LIHAT BUKTI PROSES ARTEMIS / DONE' : 'LIHAT FOTO BUKTI BARANG'} (${allReqPhotos.length})" onclick="tutupDetailBarangV2(); lihatFotoByNoSurat('${req.noSurat || req.id}');" style="${isDoneState ? 'background: linear-gradient(135deg, #059669, #10b981) !important; color: #ffffff !important;' : ''}">
        <span class="material-symbols-rounded">image</span>
      </button>
    `);
  }

  if (actionButtons.length > 0) {
    bottomActionsHtml = `
      <div class="popupDetailActionsV2" style="margin: 0 !important; padding: 2px 14px !important;">
        ${actionButtons.join('')}
      </div>
    `;
  }

  const thKetPartHtml = showKetPartCol ? `<th style="${thStyleLeft}">KETERANGAN PART</th>` : '';
  const thActionHtml = canServiceRowActions ? `<th style="${thStyleAutofit}">AKSI</th>` : '';

  const tableHeaderHtml = isDus ? `
    <thead>
      <tr style="background: var(--primary) !important; color: #ffffff !important;">
        <th style="${thStyleAutofit}">NO</th>
        <th style="${thStyleLeft}">TYPE</th>
        <th style="${thStyleLeft}">SERI BARANG</th>
        <th style="${thStyleLeft}">PERMINTAAN</th>
        <th style="${thStyleLeft}">SERI DUS</th>
        <th style="${thStyleLeft}">ALASAN</th>
        <th style="${thStyleAutofit}">QTY</th>
        ${thKetPartHtml}
        ${thActionHtml}
      </tr>
    </thead>
  ` : `
    <thead>
      <tr style="background: var(--primary) !important; color: #ffffff !important;">
        <th style="${thStyleAutofit}">NO</th>
        <th style="${thStyleLeft}">TYPE</th>
        <th style="${thStyleLeft}">SERI BARANG</th>
        <th style="${thStyleLeft}">PERMINTAAN</th>
        <th style="${thStyleLeft}">ALASAN</th>
        <th style="${thStyleAutofit}">QTY</th>
        ${thKetPartHtml}
        ${thActionHtml}
      </tr>
    </thead>
  `;

  bodyBox.innerHTML = `
    <div class="popupCardBodyContainerV2" style="width: 100% !important; min-width: 0 !important; max-width: 100% !important; padding: 8px 0px 12px 0px !important; display: flex !important; flex-direction: column !important; gap: 6px !important; box-sizing: border-box !important; background: var(--bg-box) !important; border-radius: 0 0 18px 18px !important; overflow: hidden !important;">
      ${headerInfoHtml}
      
      <div class="tableCardV2 tableWrap" style="display: block !important; border-top: 1px solid var(--border-color) !important; border-bottom: 1px solid var(--border-color) !important; border-left: none !important; border-right: none !important; border-radius: 0 !important; overflow-x: auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: auto !important; overscroll-behavior: contain !important; max-height: 55vh !important; background: var(--bg-box) !important; width: 100% !important; min-width: 0 !important; max-width: 100% !important; margin: 0 !important; position: relative !important;">
        <table class="detailTableV2" style="width: 100% !important; min-width: 100% !important; table-layout: auto !important; border-collapse: separate !important; border-spacing: 0 !important; margin: 0 !important; padding: 0 !important;">
          ${tableHeaderHtml}
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      ${bottomActionsHtml}
    </div>
  `;

  const popupDetailV2 = document.getElementById('popupDetailBarangV2');
  if (popupDetailV2) popupDetailV2.style.display = 'flex';

  try {
    history.pushState({ popupDetailOpen: true }, '');
  } catch(e) {}

  const activePageId = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : 'dashboardPage';
  if (typeof aturTampilanLonceng === 'function') {
    aturTampilanLonceng(activePageId);
  }
  return true;
}

// ----------------------------------------------------
// FITUR UPDATE NO & STATUS PART (KHUSUS LOGIN SERVICE / ADMIN)
// ----------------------------------------------------
function bukaModalEditStatusPart(noSurat) {
  if (!noSurat) return;
  const role = currentUser ? (currentUser.category || '').toUpperCase() : '';
  const isAdm = currentUser && (role === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  if (role !== 'SERVICE' && !isAdm) {
    showNotif('FITUR EDIT NO / STATUS PART HANYA DAPAT DIAKSES OLEH KATEGORI SERVICE!', 'warning');
    return;
  }

  const requests = getRequestsFromDB();
  const targetNo = String(noSurat).trim().toUpperCase();
  const req = requests.find(r => r && (
    String(r.noSurat || '').trim().toUpperCase() === targetNo ||
    String(r.id || '').trim().toUpperCase() === targetNo
  ));

  if (!req) {
    showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
    return;
  }

  const titleEl = document.getElementById('editStatusPartTitle');
  if (titleEl) titleEl.textContent = `UPDATE NO & STATUS PART (#${req.noSurat})`;

  const noSuratInput = document.getElementById('editStatusPartNoSurat');
  if (noSuratInput) noSuratInput.value = req.noSurat;

  const container = document.getElementById('editStatusPartItemsContainer');
  if (!container) return;

  const items = Array.isArray(req.items) ? req.items : [];
  if (items.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted);">TIDAK ADA ITEM DALAM PERMINTAAN INI.</div>';
  } else {
    container.innerHTML = items.map((i, idx) => {
      const typeVal = i.type || i.tipe || '-';
      const seriVal = i.seri || i.sn || '-';
      const barangVal = i.barang || i.permintaan || '-';
      const currentNoPart = i.noPart || '';
      const currentStatusPart = i.statusPart || '';

      return `
        <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
            <strong style="font-size: 13px; color: var(--primary);">${idx + 1}. ${typeVal} (SN: ${seriVal})</strong>
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${barangVal} (Qty: ${i.qty || 1})</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">NO PART / KODE PART</label>
              <input type="text" id="input_nopart_${idx}" value="${currentNoPart}" placeholder="Contoh: PRT-99210 / BAUT..." style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-box); color: var(--text-main); font-size: 12px; font-weight: 600; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">STATUS PART</label>
              <input type="text" id="input_statuspart_${idx}" list="list_statuspart_presets" value="${currentStatusPart}" placeholder="Pilih / Ketik Status..." style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-box); color: var(--text-main); font-size: 12px; font-weight: 600; box-sizing: border-box;">
              <datalist id="list_statuspart_presets">
                <option value="READY / TERSEDIA">
                <option value="PROSES">
                <option value="INDENT / PESAN">
                <option value="TERPASANG">
                <option value="KOSONG / BATAL">
              </datalist>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const modal = document.getElementById('popupEditStatusPart');
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
    modal.classList.add('show');
  }
}
window.bukaModalEditStatusPart = bukaModalEditStatusPart;

function tutupModalEditStatusPart() {
  const modal = document.getElementById('popupEditStatusPart');
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
    modal.classList.remove('show');
  }
}
window.tutupModalEditStatusPart = tutupModalEditStatusPart;

function simpanStatusPart() {
  const noSuratInput = document.getElementById('editStatusPartNoSurat');
  const noSurat = noSuratInput ? noSuratInput.value.trim() : '';
  if (!noSurat) {
    showNotif('NOMOR SURAT TIDAK VALID!', 'warning');
    return;
  }

  showConfirm(`SIMPAN PERUBAHAN NO & STATUS PART UNTUK #${noSurat}?`, () => {
    try {
      const requests = getRequestsFromDB();
      const targetNo = String(noSurat).trim().toUpperCase();
      const idx = requests.findIndex(r => r && (
        String(r.noSurat || '').trim().toUpperCase() === targetNo ||
        String(r.id || '').trim().toUpperCase() === targetNo
      ));

      if (idx === -1) {
        showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
        return;
      }

      const items = Array.isArray(requests[idx].items) ? requests[idx].items : [];
      items.forEach((item, itemIdx) => {
        const noPartEl = document.getElementById(`input_nopart_${itemIdx}`);
        const statusPartEl = document.getElementById(`input_statuspart_${itemIdx}`);
        if (noPartEl) {
          item.noPart = noPartEl.value.trim().toUpperCase();
        }
        if (statusPartEl) {
          item.statusPart = statusPartEl.value.trim().toUpperCase();
        }
      });

      if (!requests[idx].log) requests[idx].log = [];
      requests[idx].log.push({
        action: 'UPDATE_STATUS_PART',
        user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
        notes: `UPDATE NO & STATUS PART OLEH SERVICE`,
        time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
      });

      // 1. SIMPAN LOKAL SECARA INSTAN (0 ms)
      saveRequestsToDB(requests);
      tutupModalEditStatusPart();
      showNotif(`NO & STATUS PART #${noSurat} BERHASIL DIPERBARUI!`, 'success');
      
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (typeof loadDashboard === 'function') loadDashboard();
      if (typeof lihatDetail === 'function') lihatDetail(noSurat);

      // 2. SINKRONISASI SUPABASE CLOUD DI LATAR BELAKANG
      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').update({
          items: requests[idx].items,
          log: requests[idx].log,
          updated_at: new Date().toISOString()
        }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn('[SUPABASE STATUS PART UPDATE NOTICE]:', e));
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
      }
    } catch (err) {
      console.error('[SIMPAN STATUS PART ERROR]:', err);
      showNotif('GAGAL MENYIMPAN STATUS PART: ' + (err.message || err), 'error');
    }
  });
}
window.simpanStatusPart = simpanStatusPart;

// ----------------------------------------------------
// FITUR EDIT KETERANGAN PART PER BARIS (FREE TEXT MANUAL KHUSUS SERVICE / ADMIN)
// ----------------------------------------------------
function bukaModalEditKetPartSingle(noSurat, itemIndex) {
  if (!noSurat) return;
  const role = currentUser ? (currentUser.category || '').toUpperCase() : '';
  const isAdm = currentUser && (role === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  if (role !== 'SERVICE' && !isAdm) {
    showNotif('FITUR EDIT KETERANGAN PART HANYA DAPAT DIAKSES OLEH KATEGORI SERVICE!', 'warning');
    return;
  }

  const requests = getRequestsFromDB();
  const targetNo = String(noSurat).trim().toUpperCase();
  const req = requests.find(r => r && (
    String(r.noSurat || '').trim().toUpperCase() === targetNo ||
    String(r.id || '').trim().toUpperCase() === targetNo
  ));

  if (!req) {
    showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
    return;
  }

  const items = Array.isArray(req.items) ? req.items : [];
  if (itemIndex < 0 || itemIndex >= items.length) {
    showNotif('ITEM TIDAK DITEMUKAN!', 'warning');
    return;
  }

  const item = items[itemIndex];
  const typeVal = item.type || item.tipe || '-';
  const seriVal = item.seri || item.sn || '-';
  const barangVal = item.barang || item.permintaan || '-';
  const currentKet = item.statusPart || item.keteranganPart || item.noPart || '';

  const titleEl = document.getElementById('editKetPartSingleTitle');
  if (titleEl) titleEl.textContent = `EDIT KETERANGAN PART (BARIS ${itemIndex + 1})`;

  const noSuratHidden = document.getElementById('editKetPartSingleNoSurat');
  if (noSuratHidden) noSuratHidden.value = req.noSurat;

  const idxHidden = document.getElementById('editKetPartSingleItemIndex');
  if (idxHidden) idxHidden.value = itemIndex;

  const infoEl = document.getElementById('editKetPartSingleItemInfo');
  if (infoEl) {
    infoEl.innerHTML = `
      <div style="color: var(--primary); font-size: 13px; font-weight: 800; margin-bottom: 2px;">#${req.noSurat} - Baris ${itemIndex + 1}</div>
      <div style="color: var(--text-main); font-size: 12px; font-weight: 600;">Item: <strong>${barangVal}</strong> | Type: <strong>${typeVal}</strong> (SN: ${seriVal})</div>
    `;
  }

  const inputEl = document.getElementById('editKetPartSingleInput');
  if (inputEl) {
    inputEl.value = currentKet;
    setTimeout(() => inputEl.focus(), 150);
  }

  const modal = document.getElementById('popupEditKeteranganPartSingle');
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
    modal.classList.add('show');
  }
}
window.bukaModalEditKetPartSingle = bukaModalEditKetPartSingle;

function tutupModalEditKetPartSingle() {
  const modal = document.getElementById('popupEditKeteranganPartSingle');
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
    modal.classList.remove('show');
  }
}
window.tutupModalEditKetPartSingle = tutupModalEditKetPartSingle;

function simpanKeteranganPartSingle() {
  const noSuratHidden = document.getElementById('editKetPartSingleNoSurat');
  const idxHidden = document.getElementById('editKetPartSingleItemIndex');
  const inputEl = document.getElementById('editKetPartSingleInput');

  const noSurat = noSuratHidden ? noSuratHidden.value.trim() : '';
  const itemIndex = idxHidden ? parseInt(idxHidden.value, 10) : -1;
  const newKet = inputEl ? inputEl.value.trim().toUpperCase() : '';

  if (!noSurat || itemIndex < 0) {
    showNotif('DATA TIDAK VALID!', 'warning');
    return;
  }

  try {
    const requests = getRequestsFromDB();
    const targetNo = String(noSurat).trim().toUpperCase();
    const idx = requests.findIndex(r => r && (
      String(r.noSurat || '').trim().toUpperCase() === targetNo ||
      String(r.id || '').trim().toUpperCase() === targetNo
    ));

    if (idx === -1) {
      showNotif('DATA PERMINTAAN TIDAK DITEMUKAN!', 'warning');
      return;
    }

    const items = Array.isArray(requests[idx].items) ? requests[idx].items : [];
    if (itemIndex >= items.length) {
      showNotif('ITEM TIDAK DITEMUKAN!', 'warning');
      return;
    }

    // SIMPAN KE STATUS PART & KETERANGAN PART
    items[itemIndex].statusPart = newKet;
    items[itemIndex].keteranganPart = newKet;
    requests[idx].items = items;

    const targetItemName = items[itemIndex].barang || items[itemIndex].permintaan || `Baris ${itemIndex + 1}`;

    if (!requests[idx].log) requests[idx].log = [];
    requests[idx].log.push({
      action: 'UPDATE_KETERANGAN_PART_BARIS',
      user: currentUser ? (currentUser.fullName || currentUser.username) : 'SERVICE',
      notes: `Update keterangan part item '${targetItemName}': ${newKet || '(dikosongkan)'}`,
      time: `${getFormattedDateDDMMYYYY()} ${new Date().toLocaleTimeString('id-ID')}`
    });

    // 1. SIMPAN LOKAL SECARA INSTAN (0 ms)
    saveRequestsToDB(requests);
    tutupModalEditKetPartSingle();
    showNotif(`KETERANGAN PART '${targetItemName}' BERHASIL DISIMPAN!`, 'success');

    if (typeof loadRiwayat === 'function') loadRiwayat();
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof lihatDetail === 'function') lihatDetail(noSurat);

    // 2. SINKRONISASI SUPABASE CLOUD DI LATAR BELAKANG
    const docId = String(noSurat).replace(/[\/\.]/g, '_');
    if (typeof supabase !== 'undefined' && supabase) {
      supabase.from('permintaan_toko').update({
        items: requests[idx].items,
        log: requests[idx].log,
        updated_at: new Date().toISOString()
      }).eq('no_surat', noSurat).then(() => {}, (e) => console.warn('[SUPABASE STATUS PART UPDATE NOTICE]:', e));
    }
    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
      dbFirestore.collection('requests').doc(docId).set(requests[idx], { merge: true }).catch(e => console.warn(e));
    }
    if (typeof dbRealtime !== 'undefined' && dbRealtime) {
      dbRealtime.ref(`requests/${docId}`).set(requests[idx]).catch(e => console.warn(e));
    }
  } catch (err) {
    console.error('[SIMPAN KETERANGAN PART SINGLE ERROR]:', err);
    showNotif('GAGAL MENYIMPAN KETERANGAN PART: ' + (err.message || err), 'error');
  }
}
window.simpanKeteranganPartSingle = simpanKeteranganPartSingle;

// LISTEN FOR MOBILE DEVICE / BROWSER BACK BUTTON TO CLOSE POPUP DETAIL
window.addEventListener('popstate', (e) => {
  const popupDetailV2 = document.getElementById('popupDetailBarangV2');
  if (popupDetailV2 && popupDetailV2.style.display !== 'none' && popupDetailV2.style.display !== '') {
    tutupDetailBarangV2();
  }
});

function closeDetail() {
  const detailModal = document.getElementById('popupDetail');
  if (detailModal) {
    detailModal.style.display = 'none';
    detailModal.classList.remove('show');
  }

  setTimeout(() => {
    const notifBtn = document.getElementById('notifBellBtn');
    const helpBtn = document.getElementById('helpButton');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (dashboardPage && dashboardPage.classList.contains('active')) {
      if (notifBtn) notifBtn.style.setProperty('display', 'flex', 'important');
      if (helpBtn) helpBtn.style.setProperty('display', 'flex', 'important');
    }
  }, 100);
}

const PDF_MODEL_KEY = 'SELECTED_PDF_MODEL';
let currentlyPreviewedModel = 'MODEL_1';

const PDF_MODELS_DATA = [
  { id: 'MODEL_1', title: 'MODE 1: STANDAR KLASIK', desc: 'Resmi, formal dengan underline header hitam & header tabel biru klasik.', color: '#0284c7' },
  { id: 'MODEL_2', title: 'MODE 2: MODERN MINIMALIS', desc: 'Header banner biru melengkung modern, tabel slate soft & badge terpadu.', color: '#0284c7' },
  { id: 'MODEL_3', title: 'MODE 3: ELEGANT CORPORATE', desc: 'Header navy gelap berbingkai aksen emas gold & font korporat elegan.', color: '#0f172a' },
  { id: 'MODEL_4', title: 'MODE 4: COMPACT GRID BOX', desc: 'Struktur grid hijau emerald bersih dengan border terstruktur presisi.', color: '#059669' },
  { id: 'MODEL_5', title: 'MODE 5: LUXURY GRADIENT BRAND', desc: 'Banner violet/purple gradient mewah dengan aksen badge rounded.', color: '#7c3aed' }
];

function getActivePdfModel() {
  return appStorage.getItem(PDF_MODEL_KEY) || 'MODEL_1';
}

function updateActivePdfModelBadge() {
  const badge = document.getElementById('activePdfModelBadge');
  if (!badge) return;
  const activeId = getActivePdfModel();
  const modelObj = PDF_MODELS_DATA.find(m => m.id === activeId) || PDF_MODELS_DATA[0];
  badge.textContent = `${modelObj.title.toUpperCase()}`;
}

function bukaModalPdfModels() {
  currentlyPreviewedModel = getActivePdfModel();
  renderFullPdfPreviewDocument(currentlyPreviewedModel);
  updatePdfModelSelectorButtons();
  const modal = document.getElementById('popupPdfModelsModal');
  if (modal) modal.style.display = 'flex';
  pushPopupHistoryState();
}

function tutupModalPdfModels() {
  const modal = document.getElementById('popupPdfModelsModal');
  if (modal) modal.style.display = 'none';
}

function switchPdfPreviewModel(modelId) {
  currentlyPreviewedModel = modelId;
  renderFullPdfPreviewDocument(currentlyPreviewedModel);
  updatePdfModelSelectorButtons();
}

function konfirmasiGunakanModelPdf() {
  appStorage.setItem(PDF_MODEL_KEY, currentlyPreviewedModel);
  updateActivePdfModelBadge();
  showNotif(`BERHASIL MENYIMPAN & MENGAKTIFKAN TEMPLATE PDF ${currentlyPreviewedModel.replace('_', ' ')}!`, 'success');
  tutupModalPdfModels();
}

function updatePdfModelSelectorButtons() {
  const containerNav = document.getElementById('pdfModelSelectorNav');
  const descBanner = document.getElementById('pdfModelDescBanner');

  const activeModelObj = PDF_MODELS_DATA.find(m => m.id === currentlyPreviewedModel) || PDF_MODELS_DATA[0];

  if (descBanner) {
    descBanner.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div style="font-weight:900; font-size:12.5px; color:var(--text-main); text-transform:uppercase; display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="color:${activeModelObj.color}; font-size:18px;">style</span>
          ${activeModelObj.title}
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); font-weight:600;">${activeModelObj.desc}</div>
      </div>
    `;
  }

  if (!containerNav) return;
  containerNav.innerHTML = '';

  PDF_MODELS_DATA.forEach(m => {
    const isActive = (m.id === currentlyPreviewedModel);
    const num = m.id.replace('MODEL_', '');
    
    let btnBg = 'var(--bg-box)';
    if (isActive) {
      btnBg = (m.color === '#0f172a' ? '#0f172a' : (m.color || '#7c3aed'));
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btnPdfNumSimple ${isActive ? 'active' : ''}`;
    btn.style.background = btnBg;
    if (isActive) {
      btn.style.color = '#ffffff';
    }

    btn.onclick = () => switchPdfPreviewModel(m.id);
    btn.innerHTML = `${num}`;
    btn.title = m.title;
    containerNav.appendChild(btn);
  });
}

function renderFullPdfPreviewDocument(modelId) {
  const container = document.getElementById('pdfModelFullPreviewArea');
  if (!container) return;

  const m = PDF_MODELS_DATA.find(x => x.id === modelId) || PDF_MODELS_DATA[0];

  let tableHeaderBg = '#0284c7';
  let headerTitleHtml = `
    <div style="text-align: center; font-size: 20px; font-weight: 800; border-bottom: 2.5px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase;">
      PERMINTAAN TOKO
    </div>
  `;

  if (modelId === 'MODEL_2') {
    tableHeaderBg = '#334155';
    headerTitleHtml = `
      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 12px 18px; border-radius: 10px; text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(2,132,199,0.25);">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (modelId === 'MODEL_3') {
    tableHeaderBg = '#0f172a';
    headerTitleHtml = `
      <div style="background: #0f172a; color: #fbbf24; padding: 14px 18px; border-radius: 8px; border-bottom: 4px solid #fbbf24; text-align: center; font-size: 21px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1.5px; text-transform: uppercase;">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (modelId === 'MODEL_4') {
    tableHeaderBg = '#059669';
    headerTitleHtml = `
      <div style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 6px; text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1px; border-left: 6px solid #047857;">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (modelId === 'MODEL_5') {
    tableHeaderBg = '#7c3aed';
    headerTitleHtml = `
      <div style="background: linear-gradient(135deg, #7c3aed, #4c1d95); color: #ffffff; padding: 14px 18px; border-radius: 12px; text-align: center; font-size: 21px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1.5px; box-shadow: 0 6px 18px rgba(124,58,237,0.3);">
        PERMINTAAN TOKO
      </div>
    `;
  }

  container.innerHTML = `
    <div style="background: #ffffff; color: #0f172a; width: 100%; max-width: 720px; margin: 0 auto; padding: 20px 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); font-family: Arial, sans-serif; box-sizing: border-box; border: 1px solid #cbd5e1;">
      ${headerTitleHtml}

      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px; padding: 2px 0; flex-wrap: wrap; gap: 6px; background: transparent; border: none;">
        <div><b>NO SURAT:</b> <span style="color:${m.color}; font-weight:800;">PRM/2026/001</span></div>
        <div><b>TOKO:</b> TOKO UTAMA BANDUNG</div>
        <div><b>TANGGAL:</b> 01/08/2026</div>
        <div><b>JENIS:</b> UNIT</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 10px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background: ${tableHeaderBg}; color: #ffffff;">
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">NO</th>
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">TIPE BARANG</th>
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">NO. SERI</th>
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">NAMA BARANG</th>
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">ALASAN</th>
            <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">QTY</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center; padding:6px 8px; border: 1px solid #cbd5e1;">1</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">AC DAIKIN 2 PK</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">SN-889920112</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">UNIT INDOOR AC 2PK</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">KOMPRESOR BOCOR FREON</td>
            <td style="text-align:center; padding:6px 8px; border: 1px solid #cbd5e1; font-weight:bold;">1</td>
          </tr>
          <tr>
            <td style="text-align:center; padding:6px 8px; border: 1px solid #cbd5e1;">2</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">KULKAS 2 PINTU</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">SN-776655100</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">UNIT KULKAS INVERTER</td>
            <td style="padding:6px 8px; border: 1px solid #cbd5e1;">KARET PINTU LONGGAR</td>
            <td style="text-align:center; padding:6px 8px; border: 1px solid #cbd5e1; font-weight:bold;">1</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 8px; margin-bottom: 12px; font-size: 11px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #0284c7; border-left: 5px solid ${tableHeaderBg}; padding: 8px 12px; border-radius: 6px; color: #0f172a;">
        <div style="font-weight: 800; font-size: 11px; color: ${tableHeaderBg === '#0f172a' ? '#0369a1' : tableHeaderBg}; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
          <span>📌</span> CATATAN / KETERANGAN PERMINTAAN:
        </div>
        <div style="font-weight: 600; color: #0f172a; font-size: 11px;">MOHON DIPROSES SECEPATNYA UNTUK KEPERLUAN DISPLAY TOKO UTAMA.</div>
      </div>

      <div style="display: flex; justify-content: space-around; font-size: 10.5px; text-align: center; margin-top: 14px;">
        <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
          <div style="font-weight: 800; color: #0f172a; text-transform: uppercase;">PEMOHON</div>
          <div style="height: 35px;"></div>
          <div>
            <div style="font-weight: 800; color: #0f172a; font-size: 11px;">TOKO UTAMA</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 1px; text-transform: uppercase;">PEMOHON (TOKO)</div>
          </div>
        </div>

        <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
          <div style="font-weight: 800; color: #0f172a; text-transform: uppercase;">DIPERIKSA</div>
          <div style="height: 35px;"></div>
          <div>
            <div style="font-weight: 800; color: #0f172a; font-size: 11px;">SERVICE BANDUNG</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 1px; text-transform: uppercase;">HODS BANDUNG</div>
          </div>
        </div>

        <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
          <div style="font-weight: 800; color: #0f172a; text-transform: uppercase;">DISETUJUI</div>
          <div style="height: 35px;"></div>
          <div>
            <div style="font-weight: 800; color: #0f172a; font-size: 11px;">FERRY EDIYANTO</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 1px; text-transform: uppercase;">DISTRICT MANAGER</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bukaPdfModal(noSurat) {
  const requests = getRequestsFromDB();
  const req = requests.find(r => r.noSurat === noSurat);
  if (!req) return;

  if (typeof isPdfButtonAllowed === 'function' && !isPdfButtonAllowed(req)) {
    showNotif('TOMBOL CETAK PDF HANYA TERSEDIA JIKA DOKUMEN SUDAH DI-APPROVE OLEH DM & TIDAK TERSEDIA UNTUK TOKO/SALES!', 'warning');
    return;
  }

  const pdfContainer = document.getElementById('pdfDocumentContent');
  if (!pdfContainer) return;

  const activeModel = getActivePdfModel();

  const hasUnfulfilledItem = (Array.isArray(req.items) && req.items.some(i => i && (i.unfulfilled || i.batal || i.status === 'TIDAK BISA DIPENUHI'))) || (req.status === 'BATAL' || req.unfulfilled);

  let itemRowsHtml = req.items.map((i, idx) => {
    const isUnfulfilled = !!(i.unfulfilled || i.batal || i.status === 'TIDAK BISA DIPENUHI' || req.status === 'BATAL' || req.unfulfilled);
    const rowTdStyle = isUnfulfilled 
      ? 'padding:6px 6px; border:1px solid #cbd5e1; font-size:11px; text-decoration: line-through; text-decoration-thickness: 3px; font-weight: bold; color: #b91c1c; background-color: #fef2f2;' 
      : 'padding:6px 6px; border:1px solid #cbd5e1; font-size:11px;';
    const numTdStyle = isUnfulfilled 
      ? 'text-align:center; padding:6px 4px; border:1px solid #cbd5e1; font-size:11px; text-decoration: line-through; text-decoration-thickness: 3px; font-weight: bold; color: #b91c1c; background-color: #fef2f2;' 
      : 'text-align:center; padding:6px 4px; border:1px solid #cbd5e1; font-size:11px;';

    return `
      <tr style="border-bottom:1px solid #cbd5e1; ${isUnfulfilled ? 'background-color:#fef2f2;' : ''}">
        <td style="${numTdStyle}">${idx + 1}</td>
        <td style="${rowTdStyle} word-break:break-word;">${i.type}</td>
        <td style="${rowTdStyle} word-break:break-all;">${i.seri}</td>
        ${req.jenis === 'DUS' ? `<td style="${rowTdStyle} color:${isUnfulfilled ? '#b91c1c' : '#d97706'}; word-break:break-all;">${i.dus || '-'}</td>` : ''}
        <td style="${rowTdStyle} word-break:break-word;">${i.barang}</td>
        <td style="${rowTdStyle} word-break:break-word;">${i.alasan}</td>
        <td style="${numTdStyle}">${i.qty}</td>
      </tr>
    `;
  }).join('');

  const users = getUsersFromDB();
  const serviceUser = users.find(u => u.category === 'SERVICE' && u.area === req.area) || users.find(u => u.category === 'SERVICE');
  const dmUser = users.find(u => u.category === 'DM') || users.find(u => u.username === 'ADMIN');
  const serviceName = req.serviceUserName || (serviceUser ? serviceUser.fullName : 'SERVICE SUPERVISOR');

  const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
  let serviceTTD = req.serviceTTD || '';
  if (!serviceTTD && serviceUser) {
    serviceTTD = ttdMap[serviceUser.id] || ttdMap[serviceUser.username] || ttdMap[serviceUser.fullName] || '';
  }
  if (!serviceTTD) {
    serviceTTD = ttdMap['SERVICE_' + req.area] || ttdMap['SERVICE'] || ttdMap['HODS'] || '';
  }

  let dmTTD = req.dmTTD || '';
  if (!dmTTD && dmUser) {
    dmTTD = ttdMap[dmUser.id] || ttdMap[dmUser.username] || ttdMap[dmUser.fullName] || '';
  }
  if (!dmTTD) {
    dmTTD = ttdMap['DM'] || ttdMap['DM'] || '';
  }

  const creatorUser = users.find(u => 
    (u.fullName && String(u.fullName).toUpperCase() === String(req.createdBy || '').toUpperCase()) || 
    (u.username && String(u.username).toUpperCase() === String(req.createdBy || '').toUpperCase()) || 
    (u.id && u.id === req.userId)
  );

  const creatorCategory = creatorUser ? creatorUser.category : '';
  const isCreatedByServiceOrAdmin = (
    creatorCategory === 'SERVICE' || 
    creatorCategory === 'HODS' || 
    creatorCategory === 'ADMIN' || 
    creatorCategory === 'DM' || 
    String(req.createdBy || '').toUpperCase().includes('SERVICE') || 
    String(req.createdBy || '').toUpperCase().includes('HODS') || 
    String(req.createdBy || '').toUpperCase().includes('ADMIN')
  );

  let tokoTTD = '';
  if (!isCreatedByServiceOrAdmin) {
    if (req.createdBy) {
      tokoTTD = ttdMap[req.createdBy] || ttdMap[req.toko] || '';
    }
  }

  const nowPrint = new Date();
  const pDay = String(nowPrint.getDate()).padStart(2, '0');
  const pMonth = String(nowPrint.getMonth() + 1).padStart(2, '0');
  const pYear = nowPrint.getFullYear();
  const pHour = String(nowPrint.getHours()).padStart(2, '0');
  const pMin = String(nowPrint.getMinutes()).padStart(2, '0');
  const pSec = String(nowPrint.getSeconds()).padStart(2, '0');
  const timestampStr = `DICETAK PADA ${pDay}/${pMonth}/${pYear} Pukul ${pHour}:${pMin}:${pSec}`;

  let photoSection = '';
  if (req.photos && req.photos.length > 0) {
    const isAdminUser = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
    const deleteBtnHtml = isAdminUser ? `
      <button type="button" onclick="hapusFotoDokumenBiasa('${req.noSurat}')" style="background:#dc2626; color:#ffffff; border:none; border-radius:4px; padding:3px 8px; font-size:11px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
        <span class="material-symbols-rounded" style="font-size:13px;">delete</span> HAPUS FOTO DOKUMEN INI
      </button>
    ` : '';

    photoSection = `
      <div style="margin-top: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: bold; color: #1e293b;">FOTO BARANG PENDUKUNG:</span>
          ${deleteBtnHtml}
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${req.photos.map(p => `
            <div style="width: 95px; height: 95px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #000;">
              <img src="${p}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const areaNameMap = {
    TSM: 'TASIKMALAYA',
    BDG: 'BANDUNG',
    BDU: 'BANDUNG UTARA',
    CRB: 'CIREBON',
    SKB: 'SUKABUMI',
    SBN: 'SUBANG'
  };
  const hodsAreaTitle = `HODS ${areaNameMap[req.area] || req.area}`;

  let tableHeaderBg = '#0284c7';
  let headerTitleHtml = `
    <div style="text-align: center; font-size: 20px; font-weight: 800; border-bottom: 2.5px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase;">
      PERMINTAAN TOKO
    </div>
  `;

  if (activeModel === 'MODEL_2') {
    tableHeaderBg = '#334155';
    headerTitleHtml = `
      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 12px 18px; border-radius: 10px; text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(2,132,199,0.25);">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (activeModel === 'MODEL_3') {
    tableHeaderBg = '#0f172a';
    headerTitleHtml = `
      <div style="background: #0f172a; color: #fbbf24; padding: 14px 18px; border-radius: 8px; border-bottom: 4px solid #fbbf24; text-align: center; font-size: 21px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1.5px; text-transform: uppercase;">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (activeModel === 'MODEL_4') {
    tableHeaderBg = '#059669';
    headerTitleHtml = `
      <div style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 6px; text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1px; border-left: 6px solid #047857;">
        PERMINTAAN TOKO
      </div>
    `;
  } else if (activeModel === 'MODEL_5') {
    tableHeaderBg = '#7c3aed';
    headerTitleHtml = `
      <div style="background: linear-gradient(135deg, #7c3aed, #4c1d95); color: #ffffff; padding: 14px 18px; border-radius: 12px; text-align: center; font-size: 21px; font-weight: 900; margin-bottom: 20px; letter-spacing: 1.5px; box-shadow: 0 6px 18px rgba(124,58,237,0.3);">
        PERMINTAAN TOKO
      </div>
    `;
  }

  pdfContainer.innerHTML = `
    <div class="pdf-paper" style="min-height: 680px; display: flex; flex-direction: column; justify-content: space-between; padding: 22px; color: #0f172a; background: #ffffff; font-family: 'Poppins', sans-serif; box-sizing: border-box;">
      <div>
        ${headerTitleHtml}

        <table class="pdf-info-grid" style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; background: transparent; border: none; table-layout: fixed;">
          <tr>
            <td style="padding: 4px 2px 4px 0; width: 78px; font-weight: bold; border: none; white-space: nowrap;">NO SURAT</td>
            <td style="padding: 4px 2px; width: 8px; border: none;">:</td>
            <td style="padding: 4px 6px 4px 0; font-weight: 700; color: #0284c7; border: none; word-break: break-all;">${req.noSurat}</td>
            <td style="padding: 4px 2px; width: 68px; font-weight: bold; border: none; white-space: nowrap;">TANGGAL</td>
            <td style="padding: 4px 2px; width: 8px; border: none;">:</td>
            <td style="padding: 4px 0; width: 95px; font-weight: 600; border: none; white-space: nowrap;">${formatDateDDMMYYYYString(req.tanggal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 2px 4px 0; font-weight: bold; border: none; white-space: nowrap;">TOKO</td>
            <td style="padding: 4px 2px; border: none;">:</td>
            <td style="padding: 4px 6px 4px 0; font-weight: 700; border: none; word-break: break-word;">${req.toko}</td>
            <td style="padding: 4px 2px; font-weight: bold; border: none; white-space: nowrap;">JENIS</td>
            <td style="padding: 4px 2px; border: none;">:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #16a34a; border: none; white-space: nowrap;">${req.jenis || 'DEFAULT'}</td>
          </tr>
        </table>

        <div style="font-size: 11px; font-weight: bold; margin-bottom: 6px; color: #0f172a;">DETAIL PERMINTAAN:</div>
        <div class="pdf-table-responsive" style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 12px; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #cbd5e1; min-width: 100%;">
            <thead>
              <tr style="background: ${tableHeaderBg}; color: #ffffff;">
                <th style="width: 28px; text-align:center; padding:6px 4px; border:1px solid #cbd5e1;">NO</th>
                <th style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">TIPE BARANG</th>
                <th style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">NO. SERI</th>
                ${req.jenis === 'DUS' ? `<th style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">NO. SERI DUS</th>` : ''}
                <th style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">PERMINTAAN BARANG</th>
                <th style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">ALASAN PERMINTAAN</th>
                <th style="width: 38px; text-align:center; padding:6px 4px; border:1px solid #cbd5e1;">QTY</th>
              </tr>
            </thead>
            <tbody>${itemRowsHtml}</tbody>
          </table>
        </div>

        ${photoSection}

        ${(() => {
          const cTxt = (req.catatan || '').trim();
          if (cTxt && cTxt !== '-') {
            return `
              <div style="margin-top: 12px; margin-bottom: 16px; font-size: 11.5px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #0284c7; border-left: 6px solid ${tableHeaderBg}; padding: 12px 16px; border-radius: 8px; box-shadow: 0 3px 10px rgba(2,132,199,0.12); color: #0f172a; opacity: 1 !important;">
                <div style="font-weight: 800; font-size: 11.5px; color: ${tableHeaderBg === '#0f172a' ? '#0369a1' : tableHeaderBg}; margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 14px;">📌</span> CATATAN / KETERANGAN PERMINTAAN:
                </div>
                <div style="font-weight: 600; color: #0f172a; line-height: 1.5; font-size: 11.5px; word-break: break-word;">${cTxt}</div>
              </div>
            `;
          }
          return '';
        })()}
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: stretch; margin-top: 28px; text-align: center !important; font-size: 11px;">
          <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; align-items: center !important; min-height: 130px; text-align: center !important;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; width: 100%; text-align: center !important;">PEMOHON</div>
            <div style="flex: 1; display: flex; align-items: center !important; justify-content: center !important; width: 100%; min-height: 55px; margin: 4px 0; text-align: center !important;">
              ${tokoTTD ? `<img src="${tokoTTD}" style="max-height: 52px; max-width: 90%; object-fit: contain; display: block !important; margin: 0 auto !important;">` : ''}
            </div>
            <div style="width: 100%; text-align: center !important;">
              <div style="font-weight: 800; color: #0f172a; font-size: 11.5px; text-align: center !important;">${req.toko}</div>
              <div style="font-size: 10px; color: #475569; margin-top: 2px; text-transform: uppercase; text-align: center !important;">PEMOHON (TOKO)</div>
            </div>
          </div>

          <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; align-items: center !important; min-height: 130px; text-align: center !important;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; width: 100%; text-align: center !important;">DIPERIKSA</div>
            <div style="flex: 1; display: flex; align-items: center !important; justify-content: center !important; width: 100%; min-height: 55px; margin: 4px 0; text-align: center !important;">
              ${serviceTTD ? `<img src="${serviceTTD}" style="max-height: 52px; max-width: 90%; object-fit: contain; display: block !important; margin: 0 auto !important;">` : ''}
            </div>
            <div style="width: 100%; text-align: center !important;">
              <div style="font-weight: 800; color: #0f172a; font-size: 11.5px; text-align: center !important;">${serviceName}</div>
              <div style="font-size: 10px; color: #475569; margin-top: 2px; text-transform: uppercase; text-align: center !important;">${hodsAreaTitle}</div>
            </div>
          </div>

          <div style="width: 30%; display: flex; flex-direction: column; justify-content: space-between; align-items: center !important; min-height: 130px; text-align: center !important;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; width: 100%; text-align: center !important;">DISETUJUI</div>
            <div style="flex: 1; display: flex; align-items: center !important; justify-content: center !important; width: 100%; min-height: 55px; margin: 4px 0; text-align: center !important;">
              ${dmTTD ? `<img src="${dmTTD}" style="max-height: 52px; max-width: 90%; object-fit: contain; display: block !important; margin: 0 auto !important;">` : ''}
            </div>
            <div style="width: 100%; text-align: center !important;">
              <div style="font-weight: 800; color: #0f172a; font-size: 11.5px; text-align: center !important;">FERRY EDIYANTO</div>
              <div style="font-size: 10px; color: #475569; margin-top: 2px; text-transform: uppercase; text-align: center !important;">DISTRICT MANAGER</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #475569; letter-spacing: 0.2px;">
          ${hasUnfulfilledItem ? `
            <div style="font-weight: 800; color: #b91c1c; font-style: normal; display: flex; align-items: center; gap: 4px;">
              <span style="text-decoration: line-through; text-decoration-thickness: 3px; font-weight: 900; color: #b91c1c; font-size: 11px;">---</span> = Tidak dipenuhi
            </div>
          ` : '<div></div>'}
          <div style="font-style: italic; opacity: 0.85;">
            ${timestampStr}
          </div>
        </div>
      </div>
    </div>
  `;

  const pdfModal = document.getElementById('pdfModal');
  if (pdfModal) {
    pdfModal.classList.add('show');
    pdfModal.style.setProperty('display', 'flex', 'important');
    pdfModal.style.setProperty('visibility', 'visible', 'important');
    pdfModal.style.setProperty('opacity', '1', 'important');
    pdfModal.style.setProperty('pointer-events', 'auto', 'important');

    const pdfContent = document.getElementById('pdfDocumentContent');
    if (pdfContent) pdfContent.scrollTop = 0;
  }
}

function tutupPdfModal() {
  const pdfModal = document.getElementById('pdfModal');
  if (pdfModal) {
    pdfModal.style.setProperty('display', 'none', 'important');
    pdfModal.classList.remove('show');
  }
}

function cetakDokumenPdf() {
  const content = document.getElementById('pdfDocumentContent');
  if (!content) {
    window.print();
    return;
  }

  try {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>DOKUMEN PERMINTAAN TOKO</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                margin: 0;
                padding: 20px;
                background: #ffffff;
                color: #0f172a;
                font-family: 'Poppins', sans-serif;
              }
              .pdf-paper {
                width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
      return;
    }
  } catch (e) {
    console.warn('[PRINT WINDOW NOTICE]: Fallback ke window.print()', e);
  }

  window.print();
}

function bukaTTD() {
  if (!currentUser || (currentUser.category !== 'SERVICE' && currentUser.category !== 'DM')) {
    showNotif('TANDA TANGAN DIGITAL KHUSUS UNTUK SERVICE & DM!', 'warning');
    return;
  }
  const modal = document.getElementById('popupTTD');
  if (modal) {
    modal.classList.add('show');
    modal.style.display = 'flex';
  }
  pushPopupHistoryState();
  setTimeout(() => {
    initCanvasTTD();
    loadTTD();
  }, 100);
}

function tutupTTD() {
  const modalTTD = document.getElementById('popupTTD');
  if (modalTTD) {
    modalTTD.classList.remove('show');
    modalTTD.style.display = 'none';
  }
}

function initCanvasTTD() {
  canvasTTD = document.getElementById('canvasTTD');
  if (!canvasTTD) return;

  const rect = canvasTTD.getBoundingClientRect();
  const targetW = Math.round(rect.width) || canvasTTD.offsetWidth || 500;
  const targetH = Math.round(rect.height) || canvasTTD.offsetHeight || 220;

  canvasTTD.width = targetW;
  canvasTTD.height = targetH;

  ctxTTD = canvasTTD.getContext('2d');
  ctxTTD.lineWidth = 2.8;
  ctxTTD.lineCap = 'round';
  ctxTTD.lineJoin = 'round';
  ctxTTD.strokeStyle = '#000000';

  ctxTTD.clearRect(0, 0, canvasTTD.width, canvasTTD.height);

  canvasTTD.onmousedown = null;
  canvasTTD.onmousemove = null;
  canvasTTD.onmouseup = null;
  canvasTTD.onmouseleave = null;

  canvasTTD.onmousedown = startDraw;
  canvasTTD.onmousemove = draw;
  canvasTTD.onmouseup = stopDraw;
  canvasTTD.onmouseleave = stopDraw;

  canvasTTD.addEventListener('touchstart', startDrawTouch, { passive: false });
  canvasTTD.addEventListener('touchmove', drawTouch, { passive: false });
  canvasTTD.addEventListener('touchend', stopDraw);
}

function getCanvasPointFromEvent(e) {
  if (!canvasTTD) return { x: 0, y: 0 };

  const rect = canvasTTD.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawTouch(e) {
  if (e.cancelable) e.preventDefault();
  isDrawing = true;
  const point = getCanvasPointFromEvent(e);
  lastX = point.x;
  lastY = point.y;
  ctxTTD.beginPath();
  ctxTTD.moveTo(lastX, lastY);
}

function drawTouch(e) {
  if (e.cancelable) e.preventDefault();
  if (!isDrawing) return;
  const point = getCanvasPointFromEvent(e);
  const x = point.x;
  const y = point.y;
  const mx = (lastX + x) / 2;
  const my = (lastY + y) / 2;
  ctxTTD.quadraticCurveTo(lastX, lastY, mx, my);
  ctxTTD.stroke();
  lastX = x;
  lastY = y;
}

function startDraw(e) {
  isDrawing = true;
  const point = getCanvasPointFromEvent(e);
  lastX = point.x;
  lastY = point.y;
  ctxTTD.beginPath();
  ctxTTD.moveTo(lastX, lastY);
}

function draw(e) {
  if (!isDrawing) return;
  const point = getCanvasPointFromEvent(e);
  const x = point.x;
  const y = point.y;
  const mx = (lastX + x) / 2;
  const my = (lastY + y) / 2;
  ctxTTD.quadraticCurveTo(lastX, lastY, mx, my);
  ctxTTD.stroke();
  lastX = x;
  lastY = y;
}

function stopDraw() { isDrawing = false; }

function pilihFotoTTD() {
  const input = document.getElementById('fotoTTDInput');
  if (input) input.click();
}
window.pilihFotoTTD = pilihFotoTTD;

async function prosesFotoKeTTD(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  if (typeof showLoading === 'function') showLoading('MEMPROSES FOTO MENJADI TTD DIGITAL TRANSPARAN...');

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasTTD || !ctxTTD) {
          if (typeof hideLoading === 'function') hideLoading();
          return;
        }

        const cWidth = canvasTTD.width || 600;
        const cHeight = canvasTTD.height || 300;

        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        tempCanvas.width = cWidth;
        tempCanvas.height = cHeight;

        let drawWidth = img.width;
        let drawHeight = img.height;
        const scale = Math.min(cWidth / drawWidth, cHeight / drawHeight) * 0.82;

        drawWidth = Math.round(drawWidth * scale);
        drawHeight = Math.round(drawHeight * scale);

        const offsetX = Math.round((cWidth - drawWidth) / 2);
        const offsetY = Math.round((cHeight - drawHeight) / 2);

        tCtx.fillStyle = '#ffffff';
        tCtx.fillRect(0, 0, cWidth, cHeight);
        tCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const imgData = tCtx.getImageData(0, 0, cWidth, cHeight);
        const data = imgData.data;

        let totalBrightness = 0;
        const totalPixels = cWidth * cHeight;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += lum;
        }

        const avgBrightness = totalBrightness / totalPixels;
        const threshold = Math.min(195, Math.max(110, avgBrightness - 15));

        const outputImgData = ctxTTD.createImageData(cWidth, cHeight);
        const outData = outputImgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (lum < threshold) {
            outData[i] = 15;      // R (dark navy ink)
            outData[i + 1] = 23;  // G
            outData[i + 2] = 42;  // B
            const alpha = Math.min(255, Math.max(170, Math.round(((threshold - lum) / threshold) * 255 * 1.6)));
            outData[i + 3] = alpha;
          } else {
            outData[i] = 0;
            outData[i + 1] = 0;
            outData[i + 2] = 0;
            outData[i + 3] = 0; // Transparent paper background
          }
        }

        ctxTTD.clearRect(0, 0, cWidth, cHeight);
        ctxTTD.putImageData(outputImgData, 0, 0);

        if (typeof hideLoading === 'function') hideLoading();
        showNotif('BERHASIL MENGONVERSI FOTO MENJADI TTD DIGITAL TRANSPARAN!', 'success');
      };

      img.onerror = () => {
        if (typeof hideLoading === 'function') hideLoading();
        showNotif('GAGAL MEMBACA BERKAS FOTO TTD!', 'error');
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  } catch (err) {
    if (typeof hideLoading === 'function') hideLoading();
    console.error('Proses foto TTD error:', err);
    showNotif('TERJADI KESALAHAN SAAT MEMPROSES FOTO TTD!', 'error');
  }

  event.target.value = '';
}
window.prosesFotoKeTTD = prosesFotoKeTTD;

function hapusTTD() {
  if (ctxTTD && canvasTTD) ctxTTD.clearRect(0, 0, canvasTTD.width, canvasTTD.height);
}

function cropAndCenterCanvasSignature(srcCanvas) {
  if (!srcCanvas) return '';
  try {
    const ctx = srcCanvas.getContext('2d');
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = -1, maxY = -1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return srcCanvas.toDataURL('image/png');
    }

    const strokeW = maxX - minX + 1;
    const strokeH = maxY - minY + 1;
    const pad = 12;

    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, strokeW + (pad * 2));
    const cropH = Math.min(h - cropY, strokeH + (pad * 2));

    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = cropW;
    targetCanvas.height = cropH;
    const targetCtx = targetCanvas.getContext('2d');

    targetCtx.drawImage(
      srcCanvas,
      cropX, cropY, cropW, cropH,
      0, 0, cropW, cropH
    );

    return targetCanvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Error cropping signature:', e);
    return srcCanvas.toDataURL('image/png');
  }
}
window.cropAndCenterCanvasSignature = cropAndCenterCanvasSignature;

function simpanTTD() {
  showConfirm('SIMPAN TANDA TANGAN DIGITAL INI?', () => {
    if (!canvasTTD) return;
    const png = cropAndCenterCanvasSignature(canvasTTD);
    const ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
    const key = currentUser.category === 'DM' ? 'DM' : `SERVICE_${currentUser.area}`;
    ttdMap[key] = png;
    ttdMap[currentUser.fullName] = png;
    ttdMap[currentUser.username] = png;
    ttdMap[currentUser.id] = png;
    if (currentUser.category === 'SERVICE') {
      ttdMap['SERVICE'] = png;
      ttdMap[`SERVICE_${currentUser.area}`] = png;
      ttdMap['HODS'] = png;
    }
    appStorage.setItem(TTD_DB_KEY, JSON.stringify(ttdMap));
    
    // SIMPAN PERSISTEN PADA PENYIMPANAN LOKAL (LOCALSTORAGE) PERANGKAT
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('APP_USER_TTD_MAP', JSON.stringify(ttdMap));
        if (currentUser) {
          if (currentUser.id) localStorage.setItem(`LOCAL_TTD_${currentUser.id}`, png);
          if (currentUser.username) localStorage.setItem(`LOCAL_TTD_${currentUser.username}`, png);
        }
      }
    } catch(e) {}

    if (currentUser) {
      if (currentUser.id) appStorage.setItem(`LOCAL_TTD_${currentUser.id}`, png);
      if (currentUser.username) appStorage.setItem(`LOCAL_TTD_${currentUser.username}`, png);
    }

    if (typeof supabase !== 'undefined' && supabase) {
      try {
        const systemTtdRow = {
          id: '__SYSTEM_TTD_MAP__',
          no_surat: '__SYSTEM_TTD_MAP__',
          tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
          toko: 'SYSTEM',
          area: 'ALL',
          jenis: 'SYSTEM',
          catatan: JSON.stringify(ttdMap),
          items: [],
          photos: [],
          status: 'DONE',
          service_approve: true,
          created_by: 'SYSTEM',
          created_at: new Date().toISOString()
        };
        supabase.from('permintaan_toko').upsert(systemTtdRow).then(({ error }) => {
          if (error) console.warn('[SUPABASE TTD SAVE NOTICE]:', error.message);
          else console.log('⚡ [SUPABASE TTD SUCCESS]: TTD berhasil disimpan ke Supabase Database!');
        });
      } catch(sbErr) {
        console.warn('[SUPABASE TTD SAVE NOTICE]:', sbErr);
      }
    }
    
    pushCentralCloudDB();
    showNotif('TANDA TANGAN DIGITAL BERHASIL DISIMPAN!', 'success');
    tutupTTD();
  });
}

function loadTTD() {
  let localTTD = null;
  try {
    if (typeof localStorage !== 'undefined' && currentUser) {
      localTTD = localStorage.getItem(`LOCAL_TTD_${currentUser.id}`) || localStorage.getItem(`LOCAL_TTD_${currentUser.username}`);
    }
  } catch(e) {}

  let ttdMap = {};
  try {
    if (typeof localStorage !== 'undefined') {
      const rawMap = localStorage.getItem('APP_USER_TTD_MAP');
      if (rawMap) ttdMap = JSON.parse(rawMap);
    }
  } catch(e) {}

  if (!Object.keys(ttdMap).length) {
    ttdMap = JSON.parse(appStorage.getItem(TTD_DB_KEY) || '{}');
  }

  const data = localTTD || (currentUser ? (appStorage.getItem(`LOCAL_TTD_${currentUser.id}`) || appStorage.getItem(`LOCAL_TTD_${currentUser.username}`) || ttdMap[currentUser.id] || ttdMap[currentUser.username] || ttdMap[currentUser.fullName]) : null);
  if (data && ctxTTD && canvasTTD) {
    const img = new Image();
    img.onload = () => {
      ctxTTD.clearRect(0, 0, canvasTTD.width, canvasTTD.height);
      ctxTTD.drawImage(img, 0, 0, canvasTTD.width, canvasTTD.height);
    };
    img.src = data;
  }
}

let activeChatRefreshInterval = null;

function refreshActiveChatUI() {
  if (!currentUser) return;
  const popupBantuan = document.getElementById('popupBantuan');
  if (popupBantuan && (popupBantuan.classList.contains('show') || popupBantuan.style.display === 'block')) {
    const chatBody = document.getElementById('chatBody');
    if (typeof isAdminChat !== 'undefined' && isAdminChat) {
      if (typeof currentRoom !== 'undefined' && currentRoom && chatBody && chatBody.style.display !== 'none') {
        loadChatAdmin(currentRoom);
      } else {
        loadDaftarChatAdmin();
      }
    } else {
      loadChatUser();
    }
  }
  if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
}

function startActiveChatRefresh() {
  if (activeChatRefreshInterval) {
    clearInterval(activeChatRefreshInterval);
    activeChatRefreshInterval = null;
  }
  refreshActiveChatUI();
}

function stopActiveChatRefresh() {
  if (activeChatRefreshInterval) {
    clearInterval(activeChatRefreshInterval);
    activeChatRefreshInterval = null;
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === CHAT_DB_KEY || e.key === CHAT_ROOM_DB_KEY) {
    refreshActiveChatUI();
  }
});

function isServiceTSMUser() {
  if (!currentUser) return false;
  const cat = String(currentUser.category || '').trim().toUpperCase();
  const area = String(currentUser.area || '').trim().toUpperCase();
  const uname = String(currentUser.username || '').trim().toUpperCase();

  return (cat === 'SERVICE' && (area === 'TSM' || area === 'ALL')) || cat === 'ADMIN' || uname === 'ADMIN';
}

async function bukaBantuan() {
  if (!currentUser) return;
  
  // SERVICE TSM or ADMIN acts as Customer Service Support Receiver
  isAdminChat = isServiceTSMUser();

  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );
  const btnHapusChatHeader = document.getElementById('btnHapusSemuaChatHeader');
  if (btnHapusChatHeader) {
    btnHapusChatHeader.style.display = isSysAdmin ? 'inline-flex' : 'none';
  }

  const popup = document.getElementById('popupBantuan');
  const btnHelp = document.getElementById('helpButton');
  if (btnHelp) btnHelp.style.display = 'none';
  if (popup) {
    popup.style.display = 'block';
    popup.classList.add('show');
    try { history.pushState({ popup: 'bantuan' }, '', location.href); } catch(e) {}
  }

  // SINKRONKAN CHAT & ROOM TERBARU DARI CLOUD DB PADA SAAT MENU CHAT DIBUKA
  if (typeof syncAllDataToCache === 'function') {
    await syncAllDataToCache().catch(() => {});
  }

  const chatList = document.getElementById('chatList');
  const chatBody = document.getElementById('chatBody');
  const chatFooter = document.getElementById('chatFooter');
  const btnBack = document.getElementById('btnBackAdmin');
  const headerTitle = document.getElementById('chatHeaderTitle');

  if (isAdminChat) {
    if (chatList) chatList.style.display = 'block';
    if (chatBody) chatBody.style.display = 'none';
    if (chatFooter) chatFooter.style.display = 'none';
    if (btnBack) btnBack.style.display = 'none';
    if (headerTitle) headerTitle.innerText = 'CHAT MASUK - SERVICE TSM';
    loadDaftarChatAdmin();
  } else {
    if (chatList) chatList.style.display = 'none';
    if (chatBody) chatBody.style.display = 'block';
    if (chatFooter) chatFooter.style.display = 'flex';
    if (btnBack) btnBack.style.display = 'none';
    if (headerTitle) headerTitle.innerText = 'SERVICE TSM SUPPORT';
    loadChatUser();
  }

  // AKTIFKAN REFRESH CHAT REALTIME JIKA KOLOM CHAT SEDANG DIBUKA
  startActiveChatRefresh();
}

function tutupBantuan() {
  stopActiveChatRefresh();

  const popup = document.getElementById('popupBantuan');
  if (popup) {
    popup.classList.remove('show'); 
    setTimeout(() => popup.style.display = 'none', 250); 
  }
  
  const activePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : 'dashboardPage';
  if (typeof aturTampilanLonceng === 'function') {
    aturTampilanLonceng(activePage);
  }

  if (typeof cekUnreadNotif === 'function') {
    cekUnreadNotif();
  }
}

function loadDaftarChatAdmin() {
  const chatList = document.getElementById('chatList');
  if (!chatList) return;
  const rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');
  chatList.innerHTML = '';

  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );

  if (!rooms || rooms.length === 0) {
    chatList.innerHTML = `
      <div style="padding:30px 16px; text-align:center; color:var(--text-muted); font-size:12.5px;">
        <span class="material-symbols-rounded" style="font-size:36px; color:var(--primary); margin-bottom:6px; display:block;">chat_bubble_outline</span>
        BELUM ADA CHAT MASUK DARI TOKO / SALES.
      </div>
    `;
    return;
  }

  rooms.forEach(r => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:12px 14px; border-bottom:1px solid var(--border-color); cursor:pointer; transition:background 0.2s; display:flex; justify-content:space-between; align-items:center;';
    const unreadBadgeHtml = r.unreadAdmin > 0 ? `<span style="background:#ef4444; color:#fff; border-radius:10px; padding:2px 8px; font-size:10px; font-weight:bold;">${r.unreadAdmin} UNREAD</span>` : '';
    
    const deleteRoomBtnHtml = isSysAdmin ? `
      <button type="button" class="btnIcon btnDelete" onclick="event.stopPropagation(); hapusChatRoom('${r.room}', '${r.user}')" title="HAPUS CHAT USER INI" style="padding:6px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:6px; border:none; cursor:pointer;">
        <span class="material-symbols-rounded" style="font-size:18px;">delete</span>
      </button>
    ` : '';

    item.innerHTML = `
      <div style="flex:1; min-width:0; margin-right:8px;" onclick="bukaRoomAdmin('${r.room}', '${r.user}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="font-size:13px; font-weight:700; color:var(--text-main);">
            ${r.user} <span style="font-size:11px; font-weight:bold; color:var(--primary); background:rgba(59,130,246,0.15); padding:2px 6px; border-radius:4px;">(${r.userArea || 'TSM'})</span>
          </div>
          ${unreadBadgeHtml}
        </div>
        <div style="color:var(--text-muted); font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.last || '-'}</div>
      </div>
      ${deleteRoomBtnHtml}
    `;
    chatList.appendChild(item);
  });
}

function hapusChatRoom(roomTarget, userTarget) {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );
  if (!isSysAdmin) {
    showNotif('HANYA AKUN ADMIN YANG DAPAT MENGHAPUS ROOM CHAT!', 'warning');
    return;
  }
  const roomUpper = String(roomTarget || '').toUpperCase();
  const userUpper = String(userTarget || '').toUpperCase();

  showConfirm(`HAPUS RIWAYAT CHAT ROOM DENGAN USER '${userTarget || roomTarget}'?`, () => {
    showLoading('MENGHAPUS CHAT ROOM...');
    setTimeout(async () => {
      try {
        let allChats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
        let rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');

        allChats = allChats.filter(c => 
          String(c.room || '').toUpperCase() !== roomUpper && 
          String(c.user || '').toUpperCase() !== userUpper &&
          String(c.senderUsername || '').toUpperCase() !== userUpper
        );
        rooms = rooms.filter(r => 
          String(r.room || '').toUpperCase() !== roomUpper && 
          String(r.user || '').toUpperCase() !== userUpper
        );

        appStorage.setItem(CHAT_DB_KEY, JSON.stringify(allChats));
        appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(rooms));

        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          try {
            await dbFirestore.collection('app_settings').doc('config').set({
              chatMessages: allChats,
              chatRooms: rooms
            }, { merge: true });
          } catch(e) {}
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          try {
            await dbRealtime.ref('chat_messages').set(allChats);
            await dbRealtime.ref('chat_rooms').set(rooms);
          } catch(e) {}
        }
        if (typeof supabase !== 'undefined' && supabase) {
          try { await supabase.from('chat').delete().eq('room', roomTarget); } catch(e) {}
          try { await supabase.from('chat_messages').delete().eq('room', roomTarget); } catch(e) {}
        }

        if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB();

        hideLoading();
        showNotif(`CHAT ROOM DENGAN '${userTarget || roomTarget}' BERHASIL DIHAPUS!`, 'success');

        if (isAdminChat) {
          kembaliKeDaftarAdmin();
        } else {
          loadChatUser();
        }
      } catch(err) {
        hideLoading();
        console.error('[HAPUS CHAT ROOM ERROR]:', err);
        showNotif('GAGAL MENGHAPUS CHAT ROOM: ' + (err.message || err), 'error');
      }
    }, 300);
  });
}
window.hapusChatRoom = hapusChatRoom;

function bukaRoomAdmin(room, user) {
  currentRoom = room;
  currentChatUser = user;

  const rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');
  const roomUpper = String(room || '').toUpperCase();
  const userUpper = String(user || '').toUpperCase();

  const rIdx = rooms.findIndex(x => String(x.room || '').toUpperCase() === roomUpper || String(x.user || '').toUpperCase() === userUpper);
  if (rIdx !== -1) {
    rooms[rIdx].unreadAdmin = 0;
    appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(rooms));
    if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB();
  }

  const chatList = document.getElementById('chatList');
  const chatBody = document.getElementById('chatBody');
  const chatFooter = document.getElementById('chatFooter');
  const btnBack = document.getElementById('btnBackAdmin');
  const headerTitle = document.getElementById('chatHeaderTitle');

  if (chatList) chatList.style.display = 'none';
  if (chatBody) chatBody.style.display = 'block';
  if (chatFooter) chatFooter.style.display = 'flex';
  if (btnBack) btnBack.style.display = 'inline-block';
  if (headerTitle) headerTitle.innerText = 'CHAT WITH ' + user;
  loadChatAdmin(room);
}

function loadChatAdmin(room) {
  const allChats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
  const roomUpper = String(room || '').toUpperCase();
  const userUpper = String(currentChatUser || '').toUpperCase();

  const roomChats = allChats.filter(c => 
    String(c.room || '').toUpperCase() === roomUpper || 
    String(c.user || '').toUpperCase() === userUpper
  );

  const body = document.getElementById('chatBody');
  if (!body) return;

  const isAtBottom = (body.scrollHeight - body.scrollTop - body.clientHeight) < 80;
  body.innerHTML = '';

  if (roomChats.length === 0) {
    body.innerHTML = `<div class="chatAdmin"><div class="chatText">PESAN DARI ${currentChatUser || 'USER'} AKAN TAMPIL DI SINI.</div></div>`;
  } else {
    roomChats.forEach(c => {
      const isSelf = (c.pengirim === 'SERVICE' || c.pengirim === 'ADMIN' || (currentUser && String(c.senderUsername).toUpperCase() === String(currentUser.username).toUpperCase()));
      const div = document.createElement('div');
      div.className = isSelf ? 'chatUser' : 'chatAdmin';
      div.innerHTML = `
        <div class="chatText">${c.pesan}</div>
        <div class="chatTime">${c.tanggal}</div>
      `;
      body.appendChild(div);
    });
  }

  if (isAtBottom || roomChats.length <= 5) {
    body.scrollTop = body.scrollHeight;
  }
}

function loadChatUser() {
  const allChats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
  const myUsernameUpper = String(currentUser ? currentUser.username : '').toUpperCase();
  const roomName = 'ROOM_' + myUsernameUpper;

  const userChats = allChats.filter(c => 
    String(c.room || '').toUpperCase() === roomName || 
    String(c.user || '').toUpperCase() === myUsernameUpper ||
    String(c.senderUsername || '').toUpperCase() === myUsernameUpper
  );

  const body = document.getElementById('chatBody');
  if (!body) return;

  const rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');
  const rIdx = rooms.findIndex(x => String(x.room || '').toUpperCase() === roomName || String(x.user || '').toUpperCase() === myUsernameUpper);
  if (rIdx !== -1 && rooms[rIdx].unreadUser > 0) {
    rooms[rIdx].unreadUser = 0;
    appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(rooms));
    if (typeof pushCentralCloudDB === 'function') pushCentralCloudDB(); 
    if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
  }

  const isAtBottom = (body.scrollHeight - body.scrollTop - body.clientHeight) < 80;
  body.innerHTML = '';

  if (userChats.length === 0) {
    body.innerHTML = `
      <div class="chatAdmin">
        <div class="chatText">HALO 👋<br>ADA YANG BISA KAMI BANTU UNTUK PERMINTAAN TOKO ANDA? SILAKAN KIRIM PESAN DI SINI.</div>
      </div>
    `;
  } else {
    userChats.forEach(c => {
      const isSelf = (c.pengirim === 'USER' || (currentUser && String(c.senderUsername).toUpperCase() === myUsernameUpper));
      const div = document.createElement('div');
      div.className = isSelf ? 'chatUser' : 'chatAdmin';
      div.innerHTML = `
        <div class="chatText">${c.pesan}</div>
        <div class="chatTime">${c.tanggal}</div>
      `;
      body.appendChild(div);
    });
  }

  if (isAtBottom || userChats.length <= 5) {
    body.scrollTop = body.scrollHeight;
  }
}

function kirimPesanChat() {
  const txt = document.getElementById('chatPesan');
  if (!txt || !currentUser) return;
  const pesan = txt.value.trim().toUpperCase();
  if (!pesan) return;

  const senderId = currentUser.id;
  const senderUsername = currentUser.username;
  const now = new Date();
  const timeStr = getFormattedDateDDMMYYYY(now) + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  let targetUser = 'USER';
  let roomTarget = '';
  let pengirimType = 'USER';

  if (isAdminChat) {
    targetUser = currentChatUser || 'USER';
    roomTarget = currentRoom || ('ROOM_' + String(targetUser).toUpperCase());
    pengirimType = 'SERVICE';
  } else {
    targetUser = currentUser.username;
    roomTarget = 'ROOM_' + String(currentUser.username).toUpperCase();
    pengirimType = 'USER';
  }

  const newChatId = `CHAT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const newChatRow = {
    id: newChatId,
    room: roomTarget,
    user: targetUser,
    user_area: currentUser.area || 'BDG',
    pengirim: pengirimType,
    sender_id: senderId,
    sender_username: senderUsername,
    sender_name: `${currentUser.fullName || currentUser.username} (${currentUser.toko || currentUser.area})`,
    pesan: pesan,
    tanggal: timeStr,
    created_at: new Date().toISOString()
  };

  // 1. LOCAL STORAGE UPDATE & REFRESH UI
  const allChats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
  const rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');

  allChats.push({
    id: newChatId,
    room: roomTarget,
    user: targetUser,
    userArea: currentUser.area || 'BDG',
    pengirim: pengirimType,
    senderId,
    senderUsername,
    senderName: `${currentUser.fullName || currentUser.username} (${currentUser.toko || currentUser.area})`,
    pesan,
    tanggal: timeStr
  });

  // 2. SUPABASE DIRECT PUSH VIA MAIN TABLE SAFELY (ZERO 404 CONSOLE ERRORS)
  if (typeof supabase !== 'undefined' && supabase) {
    try {
      const systemChatRow = {
        id: '__SYSTEM_CHAT_MESSAGES__',
        no_surat: '__SYSTEM_CHAT_MESSAGES__',
        tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
        toko: 'SYSTEM',
        area: 'ALL',
        jenis: 'SYSTEM',
        catatan: JSON.stringify(allChats),
        items: [],
        photos: [],
        status: 'DONE',
        service_approve: true,
        created_by: 'SYSTEM',
        created_at: new Date().toISOString()
      };
      supabase.from('permintaan_toko').upsert(systemChatRow).then(({ error }) => {
        if (error) console.warn('[SUPABASE CHAT SAVE ERROR]:', error.message);
      });
    } catch(sbErr) {
      console.warn('[SUPABASE CHAT SAVE ERROR]:', sbErr);
    }
  }

  const roomUpper = String(roomTarget).toUpperCase();
  const rIdx = rooms.findIndex(x => String(x.room).toUpperCase() === roomUpper || String(x.user).toUpperCase() === String(targetUser).toUpperCase());
  if (rIdx !== -1) {
    rooms[rIdx].last = (pengirimType === 'SERVICE' ? `SERVICE TSM: ${pesan}` : pesan);
    if (pengirimType === 'SERVICE') rooms[rIdx].unreadUser = (rooms[rIdx].unreadUser || 0) + 1;
    else rooms[rIdx].unreadAdmin = (rooms[rIdx].unreadAdmin || 0) + 1;
    rooms[rIdx].lastTime = timeStr;
  } else {
    rooms.push({
      room: roomTarget,
      user: targetUser,
      userArea: currentUser.area || 'BDG',
      last: (pengirimType === 'SERVICE' ? `SERVICE TSM: ${pesan}` : pesan),
      unreadAdmin: pengirimType === 'USER' ? 1 : 0,
      unreadUser: pengirimType === 'SERVICE' ? 1 : 0,
      lastTime: timeStr
    });
  }

  appStorage.setItem(CHAT_DB_KEY, JSON.stringify(allChats));
  appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(rooms));

  txt.value = '';

  if (isAdminChat) {
    loadChatAdmin(roomTarget);
  } else {
    loadChatUser();
  }

  if (typeof updateNotifBellCounter === 'function') updateNotifBellCounter();
  if (typeof cekUnreadNotif === 'function') cekUnreadNotif();
}

function hapusChatRoom(roomTarget, userTarget) {
  const roomUpper = String(roomTarget || '').toUpperCase();
  const userUpper = String(userTarget || '').toUpperCase();

  showConfirm(`HAPUS RIWAYAT CHAT ROOM DENGAN USER '${userTarget || roomTarget}'?`, () => {
    showLoading('MENGHAPUS CHAT ROOM...');
    setTimeout(async () => {
      try {
        // 1. DELETE FROM LOCAL STORAGE
        let allChats = JSON.parse(appStorage.getItem(CHAT_DB_KEY) || '[]');
        let rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');

        allChats = allChats.filter(c => 
          String(c.room || '').toUpperCase() !== roomUpper && 
          String(c.user || '').toUpperCase() !== userUpper &&
          String(c.senderUsername || '').toUpperCase() !== userUpper
        );
        rooms = rooms.filter(r => 
          String(r.room || '').toUpperCase() !== roomUpper && 
          String(r.user || '').toUpperCase() !== userUpper
        );

        appStorage.setItem(CHAT_DB_KEY, JSON.stringify(allChats));
        appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify(rooms));

        // 2. SYNC UPDATED CHATS TO SUPABASE VIA MAIN TABLE SAFELY
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            const systemChatRow = {
              id: '__SYSTEM_CHAT_MESSAGES__',
              no_surat: '__SYSTEM_CHAT_MESSAGES__',
              tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
              toko: 'SYSTEM',
              area: 'ALL',
              jenis: 'SYSTEM',
              catatan: JSON.stringify(allChats),
              items: [],
              photos: [],
              status: 'DONE',
              service_approve: true,
              created_by: 'SYSTEM',
              created_at: new Date().toISOString()
            };
            await supabase.from('permintaan_toko').upsert(systemChatRow);
          } catch(sbErr) {
            console.warn('[SUPABASE CHAT DELETE NOTICE]:', sbErr);
          }
        }

        hideLoading();
        showNotif(`CHAT ROOM DENGAN '${userTarget || roomTarget}' BERHASIL DIHAPUS!`, 'success');

        if (isAdminChat) {
          kembaliKeDaftarAdmin();
        } else {
          loadChatUser();
        }
      } catch(err) {
        hideLoading();
        console.error('[HAPUS CHAT ROOM ERROR]:', err);
        showNotif('GAGAL MENGHAPUS CHAT ROOM: ' + (err.message || err), 'error');
      }
    }, 300);
  });
}
window.hapusChatRoom = hapusChatRoom;

function kembaliKeDaftarAdmin() {
  const chatList = document.getElementById('chatList');
  const chatBody = document.getElementById('chatBody');
  const chatFooter = document.getElementById('chatFooter');
  const btnBack = document.getElementById('btnBackAdmin');
  const headerTitle = document.getElementById('chatHeaderTitle');

  if (chatBody) chatBody.style.display = 'none';
  if (chatFooter) chatFooter.style.display = 'none';
  if (chatList) chatList.style.display = 'block';
  if (btnBack) btnBack.style.display = 'none';
  if (headerTitle) headerTitle.innerText = 'DAFTAR PESAN MASUK';
  loadDaftarChatAdmin();
}

function cekUnreadNotif() {
  if (!currentUser) return;
  const badge = document.getElementById('unreadBadge');
  if (!badge) return;

  const rooms = JSON.parse(appStorage.getItem(CHAT_ROOM_DB_KEY) || '[]');

  if (isAdminChat) {
    const total = rooms.reduce((acc, curr) => acc + (curr.unreadAdmin || 0), 0);
    if (total > 0) {
      badge.textContent = total > 99 ? '99+' : total;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } else {
    const myRoom = rooms.find(r => r.room === 'ROOM_' + currentUser.username);
    if (myRoom && myRoom.unreadUser > 0) {
      badge.textContent = myRoom.unreadUser > 99 ? '99+' : myRoom.unreadUser;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function hapusSemuaChatAdmin() {
  const isSysAdmin = currentUser && (
    String(currentUser.category || '').toUpperCase() === 'ADMIN' ||
    String(currentUser.username || '').toUpperCase() === 'ADMIN'
  );
  if (!isSysAdmin) {
    showNotif('HANYA AKUN ADMIN YANG DAPAT MENGHAPUS SELURUH CHAT!', 'warning');
    return;
  }

  showConfirm('YAKIN INGIN MENGHAPUS SELURUH RIWAYAT CHAT & ROOM DARI SISTEM?', () => {
    showLoading('MENGHAPUS SEMUA CHAT...');
    setTimeout(async () => {
      try {
        // 1. KOSONGKAN PENYIMPANAN LOKAL
        appStorage.setItem(CHAT_DB_KEY, JSON.stringify([]));
        appStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify([]));
        try { localStorage.setItem(CHAT_DB_KEY, JSON.stringify([])); } catch(e) {}
        try { localStorage.setItem(CHAT_ROOM_DB_KEY, JSON.stringify([])); } catch(e) {}

        // 2. KOSONGKAN LANGSUNG DI SUPABASE CLOUD DATABASE
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            const systemChatRow = {
              id: '__SYSTEM_CHAT_MESSAGES__',
              no_surat: '__SYSTEM_CHAT_MESSAGES__',
              tanggal: typeof getFormattedDateDDMMYYYY === 'function' ? getFormattedDateDDMMYYYY() : '',
              toko: 'SYSTEM',
              area: 'ALL',
              jenis: 'SYSTEM',
              catatan: JSON.stringify([]),
              items: [],
              photos: [],
              status: 'DONE',
              service_approve: true,
              created_by: 'SYSTEM',
              created_at: new Date().toISOString()
            };
            await supabase.from('permintaan_toko').upsert(systemChatRow);
          } catch(sbErr) {
            console.warn('[SUPABASE CHAT DELETE NOTICE]:', sbErr);
          }
        }

        // 3. KOSONGKAN DI FIRESTORE & REALTIME DB
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          try {
            await dbFirestore.collection('app_settings').doc('config').set({
              chatMessages: [],
              chatRooms: []
            }, { merge: true });
          } catch(e) {}
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          try {
            await dbRealtime.ref('chat_messages').remove();
            await dbRealtime.ref('chat_rooms').remove();
          } catch(e) {}
        }

        // 4. SYNC CENTRAL CLOUD
        if (typeof pushCentralCloudDB === 'function') {
          await pushCentralCloudDB();
        }

        hideLoading();
        showNotif('SELURUH PESAN CHAT & ROOM BERHASIL DIHAPUS DARI SISTEM & SINKRON KE SEMUA USER!', 'success');

        if (typeof refreshActiveChatUI === 'function') {
          refreshActiveChatUI();
        }
        if (typeof cekUnreadNotif === 'function') {
          cekUnreadNotif();
        }
      } catch (err) {
        hideLoading();
        console.error('[HAPUS CHAT ERROR]:', err);
        showNotif('TERJADI KESALAHAN SAAT MENGHAPUS CHAT!', 'error');
      }
    }, 400);
  });
}
window.hapusSemuaChatAdmin = hapusSemuaChatAdmin;

window.bukaBantuan = bukaBantuan;
window.tutupBantuan = tutupBantuan;
window.kirimPesanChat = kirimPesanChat;
window.kembaliKeDaftarAdmin = kembaliKeDaftarAdmin;
window.cekUnreadNotif = cekUnreadNotif;
window.loadDaftarChatAdmin = loadDaftarChatAdmin;
window.bukaRoomAdmin = bukaRoomAdmin;
window.loadChatAdmin = loadChatAdmin;
window.loadChatUser = loadChatUser;
window.startGlobalRealtimeLoop = startGlobalRealtimeLoop;

// GLOBAL EVENT LISTENER: CLICK OUTSIDE BACKDROP TO CLOSE POPUPS (PC / LAPTOP / MOBILE)
window.addEventListener('click', function (e) {
  // 1. Detail Barang Popup (#popupDetail)
  const popupDetail = document.getElementById('popupDetail');
  if (popupDetail && e.target === popupDetail && typeof closeDetail === 'function') {
    closeDetail();
  }

  // 2. Akun Profile Popup (#popupAkun)
  const popupAkun = document.getElementById('popupAkun');
  if (popupAkun && e.target === popupAkun && typeof tutupAkun === 'function') {
    tutupAkun();
  }

  // 3. PDF Models Selector Modal (#popupPdfModelsModal)
  const popupPdfModelsModal = document.getElementById('popupPdfModelsModal');
  if (popupPdfModelsModal && e.target === popupPdfModelsModal && typeof tutupModalPdfModels === 'function') {
    tutupModalPdfModels();
  }

  // 4. PDF Document Modal (#pdfModal)
  const pdfModal = document.getElementById('pdfModal');
  if (pdfModal && e.target === pdfModal && typeof tutupPdfModal === 'function') {
    tutupPdfModal();
  }

  // 5. User Form Modal (#popupUserForm)
  const popupUserForm = document.getElementById('popupUserForm');
  if (popupUserForm && e.target === popupUserForm && typeof tutupUserModal === 'function') {
    tutupUserModal();
  }

  // 6. Tambah Toko Modal (#popupTambahToko)
  const popupTambahToko = document.getElementById('popupTambahToko');
  if (popupTambahToko && e.target === popupTambahToko && typeof tutupModalTambahToko === 'function') {
    tutupModalTambahToko();
  }

  // 7. Reject Reason Modal (#rejectOverlay)
  const rejectOverlay = document.getElementById('rejectOverlay');
  if (rejectOverlay && e.target === rejectOverlay && typeof closeReject === 'function') {
    closeReject();
  }

  // 8. TTD Modal (#popupTTD)
  const popupTTD = document.getElementById('popupTTD');
  if (popupTTD && e.target === popupTTD && typeof tutupTTD === 'function') {
    tutupTTD();
  }

  // 9. Image Viewer Modal (#imageViewer)
  const imageViewer = document.getElementById('imageViewer');
  if (imageViewer && e.target === imageViewer && typeof tutupImageViewer === 'function') {
    tutupImageViewer();
  }
});


function loadUsersManagement() {
  loadAdminScriptUrlInput();
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  let users = getUsersFromDB();

  if (!Array.isArray(users) || users.length === 0) {
    users = [...SEED_USERS];
    saveUsersToDB(users);
  }

  tbody.innerHTML = '';

  users.forEach(u => {
    const isSuperAdmin = (String(u.username).trim().toUpperCase() === 'ADMIN');
    const chkHtml = !isSuperAdmin ? `<input type="checkbox" class="userCheckbox" value="${u.id}" onchange="updateMultiUserBtnState()" style="cursor:pointer; width:16px; height:16px;">` : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center;">${chkHtml}</td>
      <td style="font-weight:600; color:var(--text-main);">${u.username}</td>
      <td style="font-family:monospace; color:var(--text-muted);">${u.password}</td>
      <td>${u.fullName}</td>
      <td><strong style="color:var(--primary);">${u.storeCode || '-'}</strong></td>
      <td>${u.phone || '-'}</td>
      <td><span class="badgeStatus badge-pending" style="font-weight:600;">${u.category}</span></td>
      <td><span style="color:var(--primary); font-weight:600;">${u.area}</span></td>
      <td style="text-align: right; white-space:nowrap;">
        <button class="btnIcon btnEdit" onclick="bukaUserModal('${u.id}')" title="EDIT USER"><span class="material-symbols-rounded">edit</span></button>
        ${!isSuperAdmin ? `<button class="btnIcon btnDelete" onclick="hapusUser('${u.id}')" title="HAPUS USER"><span class="material-symbols-rounded">delete</span></button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
  updateMultiUserBtnState();
}

function toggleSelectAllUsers(masterCheckbox) {
  const isChecked = masterCheckbox ? masterCheckbox.checked : false;
  const checkboxes = document.querySelectorAll('.userCheckbox');
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
  });
  updateMultiUserBtnState();
}

function updateMultiUserBtnState() {
  const checkboxes = document.querySelectorAll('.userCheckbox:checked');
  const btn = document.getElementById('btnHapusMultiUser');
  const selectAll = document.getElementById('selectAllUsers');
  const totalCheckboxes = document.querySelectorAll('.userCheckbox');

  if (selectAll && totalCheckboxes.length > 0) {
    selectAll.checked = (checkboxes.length === totalCheckboxes.length);
  }

  if (btn) {
    if (checkboxes.length > 0) {
      btn.style.display = 'inline-flex';
      btn.innerHTML = `<span class="material-symbols-rounded" style="vertical-align:middle; margin-right:4px;">delete_sweep</span> HAPUS (${checkboxes.length}) USER`;
    } else {
      btn.style.display = 'none';
    }
  }
}

function hapusMultiUser() {
  const selectedCheckboxes = document.querySelectorAll('.userCheckbox:checked');
  const userIds = Array.from(selectedCheckboxes).map(cb => cb.value).filter(Boolean);

  if (userIds.length === 0) {
    showNotif('PILIH MINIMAL 1 USER UNTUK DIHAPUS!', 'warning');
    return;
  }

  const users = getUsersFromDB();
  const selectedUsers = users.filter(u => 
    userIds.includes(u.id) && 
    String(u.username || '').trim().toUpperCase() !== 'ADMIN' &&
    (!currentUser || String(u.username || '').toUpperCase() !== String(currentUser.username || '').toUpperCase())
  );

  if (selectedUsers.length === 0) {
    showNotif('TIDAK ADA USER VALID YANG DAPAT DIHAPUS! (AKUN ADMIN UTAMA / AKUN AKTIF TIDAK BOLEH DIHAPUS)', 'warning');
    return;
  }

  const usernamesStr = selectedUsers.map(u => u.username).join(', ');

  showConfirm(`YAKIN INGIN MENGHAPUS ${selectedUsers.length} USER TERPILIH? (${usernamesStr})`, () => {
    showLoading('MENGHAPUS USER & TOKO TERPILIH...');
    setTimeout(async () => {
      try {
        const delUsers = JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]');
        const delStores = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
        let localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');

        // 1. SUPABASE BATCH DELETE FOR ALL SELECTED USERS & STORES
        if (typeof supabase !== 'undefined' && supabase) {
          const idsToDelete = selectedUsers.map(u => u.id).filter(Boolean);
          const usernamesToDelete = selectedUsers.map(u => u.username).filter(Boolean);
          const fullNamesToDelete = selectedUsers.map(u => u.fullName).filter(Boolean);

          try {
            if (idsToDelete.length) await supabase.from('users').delete().in('id', idsToDelete);
          } catch(e) {}
          try {
            if (usernamesToDelete.length) await supabase.from('users').delete().in('username', usernamesToDelete);
          } catch(e) {}
          try {
            if (idsToDelete.length) await supabase.from('toko_list').delete().in('id', idsToDelete);
          } catch(e) {}
          try {
            if (fullNamesToDelete.length) await supabase.from('toko_list').delete().in('full_name', fullNamesToDelete);
          } catch(e) {}
        }

        for (const u of selectedUsers) {
          try {
            if (u.id && !delUsers.includes(u.id)) delUsers.push(u.id);
            if (u.username && !delUsers.includes(u.username)) delUsers.push(u.username);

            const docId = String(u.username || '').toUpperCase();
            if (docId) {
              if (typeof dbFirestore !== 'undefined' && dbFirestore) {
                await dbFirestore.collection('users').doc(docId).delete().catch(e => console.warn(e));
              }
              if (typeof dbRealtime !== 'undefined' && dbRealtime) {
                await dbRealtime.ref(`users/${docId}`).remove().catch(e => console.warn(e));
              }
            }

            const safeFullName = String(u.fullName || '').toUpperCase();
            const safeArea = String(u.area || '').toUpperCase();
            if (u.category === 'TOKO' || safeFullName) {
              const storeKey = `${safeFullName}_${safeArea}`;
              if (storeKey && !delStores.includes(storeKey)) delStores.push(storeKey);
              localStores = localStores.filter(s => s.id !== u.id && (safeFullName && s.fullName ? s.fullName.toUpperCase() !== safeFullName : true));

              if (u.id) {
                if (typeof dbFirestore !== 'undefined' && dbFirestore) {
                  await dbFirestore.collection('stores').doc(u.id).delete().catch(e => console.warn(e));
                }
                if (typeof dbRealtime !== 'undefined' && dbRealtime) {
                  await dbRealtime.ref(`stores/${u.id}`).remove().catch(e => console.warn(e));
                }
              }
            }
          } catch (loopErr) {
            console.warn('[HAPUS MULTI USER ITEM NOTICE]:', loopErr);
          }
        }

        appStorage.setItem(DELETED_USERS_KEY, JSON.stringify(delUsers));
        appStorage.setItem(DELETED_STORES_KEY, JSON.stringify(delStores));
        appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));
        try { localStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores)); } catch(e) {}
        try { localStorage.setItem(DELETED_STORES_KEY, JSON.stringify(delStores)); } catch(e) {}
        try { localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(delUsers)); } catch(e) {}

        const remainingUsers = users.filter(u => 
          !userIds.includes(u.id) || 
          String(u.username || '').trim().toUpperCase() === 'ADMIN' ||
          (currentUser && String(u.username || '').toUpperCase() === String(currentUser.username || '').toUpperCase())
        );
        saveUsersToDB(remainingUsers);

        if (typeof pushCentralCloudDB === 'function') {
          try { await pushCentralCloudDB(); } catch(e) {}
        }

        if (typeof syncAllDataToCache === 'function') {
          try { await syncAllDataToCache().catch(() => {}); } catch(e) {}
        }

        hideLoading();
        showNotif(`BERHASIL MENGHAPUS ${selectedUsers.length} USER & TOKO TERPILIH!`, 'success');
        if (typeof loadUsersManagement === 'function') loadUsersManagement();
        if (typeof loadForm === 'function') loadForm();
        if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
        if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
        if (typeof loadDashboard === 'function') loadDashboard();
      } catch (err) {
        hideLoading();
        console.error('[HAPUS MULTI USER ERROR]:', err);
        showNotif('TERJADI KESALAHAN SAAT MENGHAPUS MULTI USER: ' + (err.message || err), 'error');
      }
    }, 400);
  });
}
window.toggleSelectAllUsers = toggleSelectAllUsers;
window.updateMultiUserBtnState = updateMultiUserBtnState;
window.hapusMultiUser = hapusMultiUser;

function bukaUserModal(userId = null) {
  if (typeof userId !== 'string' || userId.startsWith('[object')) {
    userId = null;
  }

  const editIdInput = document.getElementById('editUserId');
  if (editIdInput) editIdInput.value = userId || '';

  const title = document.getElementById('userFormTitle');

  let targetAreas = ['BDG'];

  if (userId) {
    const u = getUsersFromDB().find(x => x && x.id === userId);
    if (u) {
      document.getElementById('uFormUsername').value = u.username || '';
      document.getElementById('uFormPassword').value = u.password || '';
      document.getElementById('uFormFullName').value = u.fullName || '';
      document.getElementById('uFormStoreCode').value = u.storeCode || '';
      document.getElementById('uFormPhone').value = u.phone || '';
      document.getElementById('uFormCategory').value = u.category || 'TOKO';
      targetAreas = typeof getUserAreaList === 'function' ? getUserAreaList(u.area) : [u.area || 'BDG'];
      if (title) title.textContent = `EDIT USER: ${u.username}`;
    }
  } else {
    document.getElementById('uFormUsername').value = '';
    document.getElementById('uFormPassword').value = '';
    document.getElementById('uFormFullName').value = '';
    document.getElementById('uFormStoreCode').value = '';
    document.getElementById('uFormPhone').value = '';
    document.getElementById('uFormCategory').value = 'TOKO';
    targetAreas = ['BDG'];
    if (title) title.textContent = 'TAMBAH USER BARU';
  }

  const areaCheckboxes = document.querySelectorAll('input[name="uFormAreaCheck"]');
  areaCheckboxes.forEach(cb => {
    cb.checked = targetAreas.includes(cb.value);
  });

  const hiddenAreaInput = document.getElementById('uFormArea');
  if (hiddenAreaInput) hiddenAreaInput.value = targetAreas.join(', ');

  const modal = document.getElementById('popupUserForm');
  if (modal) modal.style.display = 'flex';
}

function tutupUserModal() {
  const modal = document.getElementById('popupUserForm');
  if (modal) modal.style.display = 'none';
}

async function simpanUserData() {
  let editId = document.getElementById('editUserId') ? document.getElementById('editUserId').value : '';
  if (typeof editId !== 'string' || editId.startsWith('[object')) {
    editId = '';
  }

  const username = document.getElementById('uFormUsername').value.trim().toUpperCase();
  const password = document.getElementById('uFormPassword').value.trim();
  const fullName = document.getElementById('uFormFullName').value.trim().toUpperCase();
  const storeCode = document.getElementById('uFormStoreCode').value.trim().toUpperCase();
  const phone = document.getElementById('uFormPhone').value.trim();
  const category = document.getElementById('uFormCategory').value;
  
  const checkedAreas = Array.from(document.querySelectorAll('input[name="uFormAreaCheck"]:checked')).map(cb => cb.value);
  const area = checkedAreas.length > 0 ? checkedAreas.join(', ') : 'BDG';
  const hiddenAreaInput = document.getElementById('uFormArea');
  if (hiddenAreaInput) hiddenAreaInput.value = area;

  if (!username || !password || !fullName) {
    showNotif('USERNAME, PASSWORD, DAN NAMA LENGKAP WAJIB DIISI!', 'warning');
    return;
  }

  const users = getUsersFromDB();

  if (editId) {
    const idx = users.findIndex(u => u && u.id === editId);
    if (idx !== -1) {
      const duplicateWithOtherUser = users.some(u => {
        if (!u || !u.username || u.id === editId) return false;
        return String(u.username).trim().toUpperCase() === username;
      });

      if (duplicateWithOtherUser) {
        showNotif(`USERNAME '${username}' SUDAH TERDAFTAR! GUNAKAN USERNAME LAIN.`, 'error');
        return;
      }

      users[idx].username = username;
      users[idx].password = password;
      users[idx].fullName = fullName;
      users[idx].storeCode = storeCode;
      users[idx].phone = phone;
      users[idx].category = category;
      users[idx].area = area;
      saveUsersToDB(users);

      const docId = String(username).toUpperCase();
      if (typeof supabase !== 'undefined' && supabase) {
        await supabase.from('users').upsert({
          id: users[idx].id || docId,
          username: users[idx].username,
          password: users[idx].password,
          full_name: users[idx].fullName,
          store_code: users[idx].storeCode,
          phone: users[idx].phone,
          category: users[idx].category,
          area: users[idx].area,
          created_at: users[idx].createdAt
        });
      }
      if (typeof syncSupabaseUsersToLocalCache === 'function') {
        await syncSupabaseUsersToLocalCache();
      }

      if (category === 'TOKO') {
        try {
          const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
          const sIdx = localStores.findIndex(s => s.id === users[idx].id || (s.fullName && s.fullName.toUpperCase() === fullName.toUpperCase()));
          if (sIdx !== -1) {
            localStores[sIdx].fullName = fullName;
            localStores[sIdx].area = area;
            localStores[sIdx].storeCode = storeCode || generateStoreCode(fullName);
          } else {
            localStores.push({
              id: users[idx].id,
              fullName: fullName,
              area: area,
              storeCode: storeCode || generateStoreCode(fullName),
              createdBy: currentUser ? currentUser.fullName : 'ADMIN'
            });
          }
          appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));

          if (typeof supabase !== 'undefined' && supabase) {
            await supabase.from('toko_list').upsert({
              id: users[idx].id,
              full_name: fullName,
              area: area,
              store_code: storeCode || generateStoreCode(fullName),
              created_by: currentUser ? currentUser.fullName : 'ADMIN'
            }).catch(e => console.warn(e));
          }
          if (typeof syncSupabaseStoresToLocalCache === 'function') {
            await syncSupabaseStoresToLocalCache().catch(() => {});
          }
        } catch(e) {}
      }

      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('users').doc(docId).set(users[idx], { merge: true }).catch(e => console.warn(e));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`users/${docId}`).set(users[idx]).catch(e => console.warn(e));
      }
      if (typeof pushCentralCloudDB === 'function') {
        pushCentralCloudDB();
      }

      showNotif(`DATA USER ${username} BERHASIL DIPERBARUI!`, 'info');
      tutupUserModal();
      loadUsersManagement();
      if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
      if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
      return;
    }
  }

  const deletedUserKeys = new Set(
    (JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]') || [])
      .filter(Boolean)
      .map(v => String(v).trim())
  );

  const isDuplicate = users.some(u => {
    if (!u || !u.username) return false;

    const existingUsername = String(u.username).trim().toUpperCase();
    if (existingUsername !== username) return false;
    if (deletedUserKeys.has(String(u.id || '').trim()) || deletedUserKeys.has(existingUsername)) {
      return false;
    }
    return true;
  });

  if (isDuplicate) {
    showNotif(`USERNAME '${username}' SUDAH TERDAFTAR! GUNAKAN USERNAME LAIN.`, 'error');
    return;
  }

  const delUsers = JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]');
  const cleanDelUsers = delUsers.filter(x => {
    const value = String(x || '').trim();
    return value && value !== username && value.toUpperCase() !== username && value.toLowerCase() !== username.toLowerCase();
  });
  appStorage.setItem(DELETED_USERS_KEY, JSON.stringify(cleanDelUsers));

  const newUser = {
    id: `USR-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    username,
    password,
    fullName,
    storeCode: storeCode || generateStoreCode(fullName),
    phone,
    category,
    area,
    createdAt: getFormattedDateDDMMYYYY()
  };

  users.push(newUser);
  saveUsersToDB(users);

  const docId = String(username).toUpperCase();
  if (typeof supabase !== 'undefined' && supabase) {
    await supabase.from('users').upsert({
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
      full_name: newUser.fullName,
      store_code: newUser.storeCode,
      phone: newUser.phone,
      category: newUser.category,
      area: newUser.area,
      created_at: newUser.createdAt
    });

    if (category === 'TOKO') {
      try {
        await supabase.from('toko_list').upsert({
          id: newUser.id,
          full_name: newUser.fullName,
          area: newUser.area,
          store_code: newUser.storeCode,
          created_by: currentUser ? currentUser.fullName : 'ADMIN'
        });
      } catch (e) {}
    }
  }

  if (category === 'TOKO') {
    try {
      const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
      if (!localStores.some(s => s.id === newUser.id || (s.fullName && s.fullName.toUpperCase() === fullName.toUpperCase()))) {
        localStores.push({
          id: newUser.id,
          fullName: newUser.fullName,
          area: newUser.area,
          storeCode: newUser.storeCode,
          createdBy: currentUser ? currentUser.fullName : 'ADMIN'
        });
        appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));
      }
    } catch (e) {}
  }

  if (typeof syncSupabaseUsersToLocalCache === 'function') {
    await syncSupabaseUsersToLocalCache();
  }
  if (typeof syncSupabaseStoresToLocalCache === 'function') {
    await syncSupabaseStoresToLocalCache();
  }
  if (typeof dbFirestore !== 'undefined' && dbFirestore) {
    dbFirestore.collection('users').doc(docId).set(newUser).catch(e => console.warn(e));
  }
  if (typeof dbRealtime !== 'undefined' && dbRealtime) {
    dbRealtime.ref(`users/${docId}`).set(newUser).catch(e => console.warn(e));
  }
  if (typeof pushCentralCloudDB === 'function') {
    pushCentralCloudDB();
  }

  showNotif(`USER ${fullName} (${username}) BERHASIL DISIMPAN!`, 'success');

  tutupUserModal();
  loadUsersManagement();
  if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
  if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
}

function hapusUser(userId) {
  if (!userId) return;
  const users = getUsersFromDB();
  const u = users.find(x => x.id === userId || x.username === userId || (x.username && String(x.username).toUpperCase() === String(userId).toUpperCase()));
  if (!u) {
    showNotif('USER TIDAK DITEMUKAN ATAU SUDAH DIHAPUS!', 'warning');
    return;
  }

  if (currentUser && u.username && u.username.toUpperCase() === currentUser.username.toUpperCase()) {
    showNotif('TIDAK DAPAT MENGHAPUS AKUN AKTIF ANDA!', 'error');
    return;
  }

  if (u.username && u.username.toUpperCase() === 'ADMIN') {
    showNotif('AKUN MASTER ADMIN UTAMA TIDAK BOLEH DIHAPUS!', 'error');
    return;
  }

  showConfirm(`HAPUS USER '${u.fullName || u.username}' (${u.username})?`, () => {
    showLoading('MENGHAPUS USER...');
    setTimeout(async () => {
      try {
        // 1. UPDATE DELETED KEYS & LOKAL STORAGE FOR USERS & STORES
        try {
          const delUsers = JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]');
          if (!delUsers.includes(u.id)) delUsers.push(u.id);
          appStorage.setItem(DELETED_USERS_KEY, JSON.stringify(delUsers));

          const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
          const updatedStores = localStores.filter(s => s.id !== u.id && !(s.fullName && u.fullName && s.fullName.toUpperCase() === u.fullName.toUpperCase()));
          appStorage.setItem(STORES_DB_KEY, JSON.stringify(updatedStores));

          if (u.fullName && u.area) {
            const storeKey = `${u.fullName.toUpperCase()}_${u.area}`;
            const deletedStoreKeys = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
            if (!deletedStoreKeys.includes(storeKey)) {
              deletedStoreKeys.push(storeKey);
              appStorage.setItem(DELETED_STORES_KEY, JSON.stringify(deletedStoreKeys));
            }
          }
        } catch(e) {}

        const updatedUsers = users.filter(x => x.id !== u.id && x.username !== u.username);
        try {
          saveUsersToDB(updatedUsers);
        } catch(e) {
          cacheUsers = updatedUsers;
        }

        // 2. HAPUS DARI SUPABASE (TABEL users & toko_list JIKA KATEGORI TOKO)
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            await supabase.from('users').delete().eq('id', u.id);
            await supabase.from('users').delete().eq('username', u.username);
            await supabase.from('toko_list').delete().eq('id', u.id);
            if (u.fullName) {
              await supabase.from('toko_list').delete().eq('full_name', u.fullName);
            }
          } catch (sbErr) {
            console.warn('[SUPABASE DELETE USER NOTICE]:', sbErr);
          }
        }
        if (typeof syncSupabaseUsersToLocalCache === 'function') {
          await syncSupabaseUsersToLocalCache();
        }
        if (typeof syncSupabaseStoresToLocalCache === 'function') {
          await syncSupabaseStoresToLocalCache();
        }

        // 3. HAPUS DARI FIREBASE ONLINE (FIRESTORE & REALTIME DB)
        const docId = String(u.username).toUpperCase();
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          await dbFirestore.collection('users').doc(docId).delete().catch(e => console.warn(e));
          if (u.id) await dbFirestore.collection('stores').doc(u.id).delete().catch(e => console.warn(e));
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          await dbRealtime.ref(`users/${docId}`).remove().catch(e => console.warn(e));
          if (u.id) await dbRealtime.ref(`stores/${u.id}`).remove().catch(e => console.warn(e));
        }

        if (typeof pushCentralCloudDB === 'function') {
          try { await pushCentralCloudDB(); } catch(e) {}
        }
        if (typeof pullCentralCloudDB === 'function') {
          try { await pullCentralCloudDB(); } catch(e) {}
        }

        hideLoading();
        showNotif(`USER ${u.username} BERHASIL DIHAPUS!`, 'info');
        if (typeof loadUsersManagement === 'function') loadUsersManagement();
        if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
        if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
      } catch (err) {
        hideLoading();
        console.error('[HAPUS USER ERROR]:', err);
        showNotif('TERJADI KESALAHAN SAAT MENGHAPUS USER: ' + (err.message || err), 'error');
      }
    }, 300);
  });
}
window.hapusUser = hapusUser;

function loadMasterDbTable() {
  const tbody = document.getElementById('masterDbTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('searchMasterDb');
  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // Preserve checked checkbox selections across re-renders
  const checkedBoxes = tbody.querySelectorAll('.masterDbCheckbox:checked');
  const checkedSet = new Set(Array.from(checkedBoxes).map(cb => cb.value));

  let requests = getRequestsFromDB();

  if (search) {
    requests = requests.filter(r =>
      r.noSurat.toLowerCase().includes(search) ||
      r.toko.toLowerCase().includes(search) ||
      r.createdBy.toLowerCase().includes(search) ||
      r.catatan.toLowerCase().includes(search) ||
      r.items.some(i => i.type.toLowerCase().includes(search) || i.seri.toLowerCase().includes(search) || i.barang.toLowerCase().includes(search))
    );
  }

  tbody.innerHTML = '';

  if (requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">BELUM ADA DATA PERMINTAAN TERDAFTAR.</td></tr>`;
    updateMultiMasterDbBtnState();
    return;
  }

  requests.forEach(r => {
    let itemsDetailText = (r.items || []).map((i, idx) => {
      let dusText = i.dus ? ` | Dus:${i.dus}` : '';
      return `<div style="padding:3px 0; border-bottom:1px dashed var(--border-color); font-size:12px; line-height:1.4;">
        <strong>${idx + 1}. ${i.type || '-'}</strong> (SN: <span style="font-family:monospace; color:var(--primary);">${i.seri || '-'}${dusText}</span>)<br>
        <span style="color:var(--text-main);">${i.barang || '-'}</span> <small style="color:var(--text-muted);">[Alasan: ${i.alasan || '-'}]</small> 
        <strong style="color:var(--primary);">(Qty: ${i.qty || 1})</strong>
      </div>`;
    }).join('');

    const tr = document.createElement('tr');
    if (shouldRowBlinkRed(r)) {
      tr.className = 'blink-row-red';
    }
    const isChecked = checkedSet.has(r.noSurat) ? 'checked' : '';
    tr.innerHTML = `
      <td style="text-align:center;"><input type="checkbox" class="masterDbCheckbox" value="${r.noSurat}" ${isChecked} onchange="updateMultiMasterDbBtnState()" style="cursor:pointer; width:16px; height:16px;"></td>
      <td style="font-weight:600; color:var(--primary);">${r.noSurat}</td>
      <td style="white-space:nowrap;">${formatDateDDMMYYYYString(r.tanggal)}</td>
      <td>${r.toko} <div style="font-size:11px; color:var(--text-muted);">By: ${r.createdBy}</div></td>
      <td><span style="color:var(--primary); font-weight:600;">${r.area}</span></td>
      <td><span class="badgeStatus badge-pending" style="font-weight:600;">${r.jenis || 'DEFAULT'}</span></td>
      <td style="max-width:320px; word-break:break-word;">${itemsDetailText}</td>
      <td>${getBadgeStatus(r.status)}</td>
      <td style="word-break:break-word; max-width:200px;">${r.catatan || '-'}</td>
      <td style="text-align:center;">
        <button class="btnIcon btnDelete" onclick="hapusDataMaster('${r.noSurat}')" title="HAPUS DATA"><span class="material-symbols-rounded">delete</span></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  updateMultiMasterDbBtnState();
}

function toggleSelectAllMasterDb(masterCheckbox) {
  const isChecked = masterCheckbox ? masterCheckbox.checked : false;
  const checkboxes = document.querySelectorAll('.masterDbCheckbox');
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
  });
  updateMultiMasterDbBtnState();
}

function updateMultiMasterDbBtnState() {
  const checkboxes = document.querySelectorAll('.masterDbCheckbox:checked');
  const btn = document.getElementById('btnHapusMultiMasterDb');
  const selectAll = document.getElementById('selectAllMasterDb');
  const totalCheckboxes = document.querySelectorAll('.masterDbCheckbox');

  if (selectAll && totalCheckboxes.length > 0) {
    selectAll.checked = (checkboxes.length === totalCheckboxes.length);
  }

  if (btn) {
    if (checkboxes.length > 0) {
      btn.style.display = 'inline-flex';
      btn.innerHTML = `<span class="material-symbols-rounded" style="vertical-align:middle; margin-right:4px;">delete_sweep</span> HAPUS (${checkboxes.length}) DATA`;
    } else {
      btn.style.display = 'none';
    }
  }
}

function hapusMultiMasterDb() {
  const selectedCheckboxes = document.querySelectorAll('.masterDbCheckbox:checked');
  const noSuratList = Array.from(selectedCheckboxes).map(cb => cb.value).filter(Boolean);

  if (noSuratList.length === 0) {
    showNotif('PILIH MINIMAL 1 DATA PERMINTAAN UNTUK DIHAPUS!', 'warning');
    return;
  }

  showConfirm(`ADMIN: YAKIN INGIN MENGHAPUS ${noSuratList.length} DATA PERMINTAAN TERPILIH?`, () => {
    showLoading('MENGHAPUS DATA TERPILIH...');
    setTimeout(async () => {
      try {
        // 1. DOKUMENTASIKAN KODE SURAT PADA DELETED_REQUESTS_KEY
        try {
          const delReqs = JSON.parse(appStorage.getItem(DELETED_REQUESTS_KEY) || '[]');
          noSuratList.forEach(ns => {
            if (ns && !delReqs.includes(ns)) delReqs.push(ns);
          });
          appStorage.setItem(DELETED_REQUESTS_KEY, JSON.stringify(delReqs));
        } catch(e) {}

        // 2. FILTER DARI CACHE LOKAL & SIMPAN
        const currentReqs = getRequestsFromDB();
        const updatedReqs = currentReqs.filter(r => r && r.noSurat && !noSuratList.includes(r.noSurat));
        try {
          saveRequestsToDB(updatedReqs);
        } catch(e) {
          appStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(updatedReqs));
        }

        // 3. HAPUS BATCH DARI SUPABASE (TABEL: permintaan_toko)
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            await supabase.from('permintaan_toko').delete().in('no_surat', noSuratList);
          } catch(sbErr1) {}
        }

        if (typeof syncSupabaseRequestsToLocalCache === 'function') {
          await syncSupabaseRequestsToLocalCache();
        }

        // 4. HAPUS INDIVIDUAL FIRESTORE & REALTIME DB
        noSuratList.forEach(noSurat => {
          try {
            const docId = String(noSurat || '').replace(/[\/\.]/g, '_');
            if (docId) {
              if (typeof dbFirestore !== 'undefined' && dbFirestore) {
                dbFirestore.collection('requests').doc(docId).delete().catch(err => console.warn('[FIRESTORE DELETE NOTICE]:', err));
              }
              if (typeof dbRealtime !== 'undefined' && dbRealtime) {
                dbRealtime.ref(`requests/${docId}`).remove().catch(err => console.warn('[REALTIME DELETE NOTICE]:', err));
              }
            }
          } catch(e) {}
        });

        if (typeof pushCentralCloudDB === 'function') {
          try { await pushCentralCloudDB(); } catch(e) {}
        }

        hideLoading();
        showNotif(`BERHASIL MENGHAPUS ${noSuratList.length} DATA PERMINTAAN TERPILIH!`, 'info');

        if (typeof loadMasterDbTable === 'function') loadMasterDbTable();
        if (typeof loadRiwayat === 'function') loadRiwayat();
        if (typeof loadDashboard === 'function') loadDashboard();
      } catch (err) {
        hideLoading();
        console.error('[HAPUS MULTI MASTER ERROR]:', err);
        showNotif('TERJADI KESALAHAN SAAT MENGHAPUS DATA MULTI TERPILIH: ' + (err.message || err), 'error');
      }
    }, 400);
  });
}
window.toggleSelectAllMasterDb = toggleSelectAllMasterDb;
window.updateMultiMasterDbBtnState = updateMultiMasterDbBtnState;
window.hapusMultiMasterDb = hapusMultiMasterDb;

function hapusDataMaster(noSurat) {
  if (!noSurat) return;
  showConfirm(`ADMIN: HAPUS DATA PERMINTAAN #${noSurat}?`, () => {
    try {
      const currentReqs = getRequestsFromDB();
      const updatedReqs = currentReqs.filter(r => r.noSurat !== noSurat);
      saveRequestsToDB(updatedReqs);

      const docId = String(noSurat).replace(/[\/\.]/g, '_');
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.from('permintaan_toko').delete().eq('no_surat', noSurat).then(({ error }) => {
          if (error) console.warn('[SUPABASE DELETE NOTICE]:', error.message);
          else console.log('⚡ [SUPABASE DELETE SUCCESS]:', noSurat);
        });
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        dbFirestore.collection('requests').doc(docId).delete().catch(err => console.warn('[FIRESTORE DELETE NOTICE]:', err));
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        dbRealtime.ref(`requests/${docId}`).remove().catch(err => console.warn('[REALTIME DELETE NOTICE]:', err));
      }

      if (typeof pushCentralCloudDB === 'function') {
        pushCentralCloudDB();
      }

      hideLoading();
      showNotif(`PERMINTAAN #${noSurat} BERHASIL DIHAPUS!`, 'info');
      
      if (typeof loadMasterDbTable === 'function') loadMasterDbTable();
      if (typeof loadRiwayat === 'function') loadRiwayat();
      if (typeof loadDashboard === 'function') loadDashboard();
    } catch (err) {
      hideLoading();
      console.error('[HAPUS MASTER ERROR]:', err);
      showNotif('GAGAL MENGHAPUS DATA MASTER!', 'error');
    }
  });
}

function downloadMasterExcel() {
  const data = getRequestsFromDB();
  if (data.length === 0) {
    showNotif('TIDAK ADA DATA MASTER UNTUK DIEKSPOR!', 'warning');
    return;
  }

  showLoading('MEMBUAT FILE EXCEL (.XLSX) MASTER LENGKAP...');
  setTimeout(() => {
    hideLoading();
    const rows = [];
    rows.push([
      'NO SURAT', 'TANGGAL', 'TOKO / PEMOHON', 'AREA', 'JENIS',
      'TIPE BARANG', 'NO SERI', 'NO SERI DUS', 'PERMINTAAN',
      'ALASAN', 'QTY', 'STATUS', 'CATATAN', 'LOG APPROVAL'
    ]);

    data.forEach(r => {
      const logStr = (r.log || []).map(l => `${l.action} by ${l.user} (${l.time})`).join(' | ');
      r.items.forEach(it => {
        const isUnfulfilled = !!(it.unfulfilled || it.batal || it.status === 'TIDAK BISA DIPENUHI' || r.status === 'BATAL' || r.unfulfilled);
        rows.push([
          r.noSurat,
          r.tanggal,
          `${r.toko} (${r.createdBy})`,
          r.area,
          r.jenis,
          it.type,
          it.seri,
          it.dus || '',
          isUnfulfilled ? `${it.barang} [TIDAK DIPENUHI]` : it.barang,
          it.alasan,
          it.qty,
          isUnfulfilled ? `${r.status} (TIDAK DIPENUHI)` : r.status,
          r.catatan || '',
          logStr
        ]);
      });
    });

    if (typeof XLSX !== 'undefined') {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Master Data");
      XLSX.writeFile(wb, `MASTER_DATA_PERMINTAAN_LENGKAP_${new Date().toISOString().split('T')[0]}.xlsx`);
      showNotif('FILE EXCEL (.XLSX) BERHASIL DI-DOWNLOAD!', 'info');
    } else {
      showNotif('MODUL EXCEL (.XLSX) BELUM SIAP, PERIKSA KONEKSI INTERNET!', 'warning');
    }
  }, 400);
}

function prosesUploadExcelLookup(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    showNotif('MODUL SHEETJS UNTUK EXCEL BELUM TERMUAT!', 'error');
    return;
  }

  showLoading('MEMBACA FILE EXCEL LOOKUP KODE UNIT...');
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const newLookup = {};
      let count = 0;

      jsonRows.forEach((row, idx) => {
        if (row && row.length >= 2) {
          const colA = String(row[0] !== undefined && row[0] !== null ? row[0] : '').trim().toUpperCase();
          const colB = String(row[1] !== undefined && row[1] !== null ? row[1] : '').trim().toUpperCase();

          if (idx === 0 && (colA.includes('KODE') || colB.includes('TYPE') || colA.includes('SERI') || colB.includes('BARANG') || colB.includes('NAMA'))) return;

          if (colA && colB) {
            newLookup[colA] = colB;
            count++;
          }
        }
      });

      if (count > 0) {
        const existingMap = JSON.parse(appStorage.getItem(KODE_UNIT_MAP_KEY) || '{}');
        const updatedMap = { ...existingMap, ...newLookup };
        appStorage.setItem(KODE_UNIT_MAP_KEY, JSON.stringify(updatedMap));

        // SYNC LANGSUNG KE FIRESTORE CLOUD & REALTIME DB (EFFICIENT SINGLE DOC SAVE)
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          dbFirestore.collection('app_settings').doc('config').set({
            kodeUnitMap: updatedMap
          }, { merge: true }).catch(e => console.warn('[FIRESTORE LOOKUP SYNC]:', e));
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          dbRealtime.ref('app_settings/kodeUnitMap').set(updatedMap).catch(e => console.warn('[RTDB LOOKUP SYNC]:', e));
        }

        if (typeof pushCentralCloudDB === 'function') {
          pushCentralCloudDB();
        }

        hideLoading();
        showNotif(`BERHASIL MEMPERBARUI ${count} KODE SERI BARANG!`, 'info');
        const statusEl = document.getElementById('lookupUploadStatus');
        if (statusEl) statusEl.textContent = `✅ ${count} KODE SERI BERHASIL DITAMBAHKAN!`;
      } else {
        hideLoading();
        showNotif('TIDAK ADA DATA VALID DENGAN 2 KOLOM (KOLOM A & KOLOM B)!', 'warning');
      }
    } catch (err) {
      hideLoading();
      showNotif('GAGAL MEMBACA FILE EXCEL LOOKUP: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function bukaAkun() {
  if (!currentUser) return;

  if (typeof tutupPdfModal === 'function') tutupPdfModal();
  if (typeof tutupDetailBarangV2 === 'function') tutupDetailBarangV2();

  const currentActivePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : '';
  if (currentActivePage === 'inputPage' && isFormDirtyOrFilled()) {
    const confirmMsg = modeEdit ? 'KELUAR DARI MENU EDIT?' : 'KELUAR DARI FORM PERMINTAAN? (DATA YANG DIISI AKAN HILANG)';
    showConfirm(confirmMsg, () => {
      if (typeof bersihkanForm === 'function') bersihkanForm();
      closeAllPopups();
      prosesBukaAkun();
    });
    return;
  }

  if (typeof modeEdit !== 'undefined' && modeEdit) {
    showConfirm('KELUAR DARI MENU EDIT?', () => {
      if (typeof bersihkanForm === 'function') bersihkanForm();
      closeAllPopups();
      prosesBukaAkun();
    });
    return;
  }

  prosesBukaAkun();
}

function prosesBukaAkun() {
  if (typeof tutupPdfModal === 'function') tutupPdfModal();
  if (typeof tutupDetailBarangV2 === 'function') tutupDetailBarangV2();

  const elNama = document.getElementById('akunNama');
  const elHP = document.getElementById('akunHP');
  const elArea = document.getElementById('akunArea');
  const elKat = document.getElementById('akunKategori');
  const elPass = document.getElementById('akunPassword');

  if (elNama) elNama.value = currentUser.fullName || '';
  if (elHP) elHP.value = currentUser.phone || '-';
  if (elArea) elArea.value = `${currentUser.area} - ${AREA_MAP[currentUser.area] || currentUser.area}`;

  if (typeof updateDesignModeButtonUI === 'function' && typeof getSavedDesignMode === 'function') {
    updateDesignModeButtonUI(getSavedDesignMode());
  }
  if (elKat) elKat.value = currentUser.category || '';
  if (elPass) elPass.value = '';

  const menuTTD = document.getElementById('menuTTD');
  if (menuTTD) {
    menuTTD.style.display = (currentUser.category === 'SERVICE' || currentUser.category === 'DM') ? 'block' : 'none';
  }

  const isToko = (currentUser.category === 'TOKO');
  const isAdmin = currentUser && (currentUser.category === 'ADMIN' || (currentUser.username && currentUser.username.toUpperCase() === 'ADMIN'));
  
  const menuKelolaTokoAkun = document.getElementById('menuKelolaTokoAkun');
  if (menuKelolaTokoAkun) {
    menuKelolaTokoAkun.style.display = isToko ? 'none' : 'block';
  }

  const adminWrap = document.getElementById('adminHapusNotifWrap');
  if (adminWrap) {
    adminWrap.style.display = 'none';
  }

  if (typeof tutupModalTambahToko === 'function') {
    tutupModalTambahToko();
  }

  const modal = document.getElementById('popupAkun');
  if (modal) modal.classList.add('show');
  if (typeof pushPopupHistoryState === 'function') pushPopupHistoryState();
}

window.bukaAkun = bukaAkun;
window.prosesBukaAkun = prosesBukaAkun;

function tutupAkun() {
  const modal = document.getElementById('popupAkun');
  if (modal) modal.classList.remove('show');
}

function simpanAkun() {
  showConfirm('SIMPAN PERUBAHAN DATA AKUN?', () => {
    const nama = document.getElementById('akunNama').value.trim().toUpperCase();
    const hp = document.getElementById('akunHP').value.trim();
    const pass = document.getElementById('akunPassword').value.trim();

    if (!nama) {
      showNotif('NAMA LENGKAP TIDAK BOLEH KOSONG!', 'warning');
      return;
    }

    showLoading('MENYIMPAN PERUBAHAN AKUN...');

    setTimeout(async () => {
      try {
        const users = getUsersFromDB();
        const idx = users.findIndex(u => u.id === currentUser.id);

        if (idx !== -1) {
          users[idx].fullName = nama;
          users[idx].phone = hp;
          if (pass) users[idx].password = pass;

          saveUsersToDB(users);
          currentUser = users[idx];
          appStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));

          if (typeof supabase !== 'undefined' && supabase) {
            try {
              const userPayload = {
                id: currentUser.id,
                username: currentUser.username,
                password: currentUser.password,
                full_name: currentUser.fullName,
                store_code: currentUser.storeCode || generateStoreCode(currentUser.fullName),
                phone: currentUser.phone || '-',
                category: currentUser.category,
                area: currentUser.area,
                created_at: currentUser.createdAt || getFormattedDateDDMMYYYY()
              };

              const { error: upErr } = await supabase.from('users').upsert(userPayload);
              if (upErr) {
                console.warn('[SUPABASE AKUN UPSERT NOTICE]:', upErr);
              }
            } catch (e) {
              console.error("Supabase user update error:", e);
            }
          }

          if (typeof syncSupabaseUsersToLocalCache === 'function') {
            await syncSupabaseUsersToLocalCache();
          }

          if (typeof notifySupabaseDataChanged === 'function') {
            notifySupabaseDataChanged('users');
          }

          hideLoading();
          showNotif('PROFIL AKUN BERHASIL DIPERBARUI & DISINKRONKAN KE ALL DEVICES!', 'success');

          const akunArea = document.getElementById('akunArea');
          if (akunArea) akunArea.value = `${currentUser.area} - ${formatUserAreaDisplay(currentUser.area)}`;

          const akunKategori = document.getElementById('akunKategori');
          if (akunKategori) akunKategori.value = currentUser.category;

          const akunNama = document.getElementById('akunNama');
          if (akunNama) akunNama.value = currentUser.fullName;

          const akunHP = document.getElementById('akunHP');
          if (akunHP) akunHP.value = currentUser.phone || '-';

          const akunPassword = document.getElementById('akunPassword');
          if (akunPassword) akunPassword.value = '';

          if (typeof loadDashboard === 'function') loadDashboard();
          if (document.getElementById('userTableBody') && typeof loadUsersManagement === 'function') {
            loadUsersManagement();
          }
        } else {
          hideLoading();
          showNotif('DATA AKUN TIDAK DITEMUKAN!', 'warning');
        }
      } catch (err) {
        hideLoading();
        console.error(err);
        showNotif('GAGAL MENYIMPAN PERUBAHAN AKUN KE CLOUD', 'danger');
      }
    }, 200);
  });
}
window.simpanAkun = simpanAkun;

function bukaModalTambahToko() {
  if (!currentUser) return;
  
  if (typeof tutupAkun === 'function') {
    tutupAkun();
  }

  const selectAreaEl = document.getElementById('selectAreaTokoBaru');
  if (selectAreaEl) {
    selectAreaEl.innerHTML = '';
    const userAreas = typeof getUserAreaList === 'function' ? getUserAreaList(currentUser.area) : [currentUser.area || 'BDG'];
    
    if (userAreas.includes('ALL')) {
      const allCodes = ['BDG', 'BDU', 'CRB', 'SKB', 'SBN', 'TSM'];
      allCodes.forEach(code => {
        selectAreaEl.innerHTML += `<option value="${code}">${code}</option>`;
      });
    } else {
      userAreas.forEach(code => {
        selectAreaEl.innerHTML += `<option value="${code}">${code}</option>`;
      });
    }
  }

  const inputEl = document.getElementById('inputNamaTokoBaru');
  if (inputEl) inputEl.value = '';
  loadDaftarTokoModal();
  const popup = document.getElementById('popupTambahToko');
  if (popup) {
    popup.style.setProperty('display', 'flex', 'important');
    popup.classList.add('show');
    pushPopupHistoryState();
  }
}

let editStoreId = null;

function editTokoCustom(id) {
  const allStores = getStoresFromDB();
  const store = allStores.find(s => s.id === id);
  if (!store) return;

  const selectAreaEl = document.getElementById('selectAreaTokoBaru');
  if (selectAreaEl && store.area) {
    selectAreaEl.value = store.area;
  }

  const inputEl = document.getElementById('inputNamaTokoBaru');
  const btnSimpan = document.getElementById('btnSimpanTokoBaru');

  if (inputEl) {
    inputEl.value = store.fullName;
    inputEl.focus();
  }
  editStoreId = store.id;

  if (btnSimpan) {
    btnSimpan.innerHTML = `<span class="material-symbols-rounded" style="vertical-align: middle;">save</span> SIMPAN EDIT`;
    btnSimpan.style.background = '#eab308';
  }
}
window.editTokoCustom = editTokoCustom;

function tutupModalTambahToko() {
  editStoreId = null;
  const inputEl = document.getElementById('inputNamaTokoBaru');
  const btnSimpan = document.getElementById('btnSimpanTokoBaru');
  if (inputEl) inputEl.value = '';
  if (btnSimpan) {
    btnSimpan.innerHTML = `<span class="material-symbols-rounded" style="vertical-align: middle;">save</span> SIMPAN`;
    btnSimpan.style.background = '#16a34a';
  }

  const popup = document.getElementById('popupTambahToko');
  if (popup) {
    popup.classList.remove('show');
    popup.style.setProperty('display', 'none', 'important');
  }
  try {
    if (typeof loadForm === 'function') loadForm();
  } catch (err) {
    console.warn('[tutupModalTambahToko notice]:', err);
  }
}
window.bukaModalTambahToko = bukaModalTambahToko;
window.tutupModalTambahToko = tutupModalTambahToko;

function loadDaftarTokoModal() {
  const tbody = document.getElementById('daftarTokoTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const allStores = getStoresFromDB();
  const areaStores = (currentUser.category === 'DM' || currentUser.area === 'ALL') 
    ? allStores 
    : allStores.filter(s => isAreaMatch(currentUser.area, s.area));

  if (areaStores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:var(--text-muted);">BELUM ADA TOKO TERDAFTAR DI AREA ANDA.</td></tr>`;
    return;
  }

  areaStores.forEach(s => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    const code = s.storeCode || generateStoreCode(s.fullName);
    const areaBadge = s.area || 'BDG';
    tr.innerHTML = `
      <td style="padding: 8px; font-weight: 600;">${s.fullName}</td>
      <td style="padding: 8px; text-align: center; font-weight: 700; color: #0284c7;">${areaBadge}</td>
      <td style="padding: 8px; text-align: center; color: var(--primary); font-weight: 700;">${code}</td>
      <td style="padding: 8px; text-align: center; white-space: nowrap;">
        <button type="button" class="btnIcon btnEdit" onclick="editTokoCustom('${s.id}')" title="EDIT TOKO" style="margin-right: 4px;"><span class="material-symbols-rounded">edit</span></button>
        <button type="button" class="btnIcon btnDelete" onclick="hapusTokoCustom('${s.id}')" title="HAPUS TOKO"><span class="material-symbols-rounded">delete</span></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function simpanTokoBaru() {
  const inputEl = document.getElementById('inputNamaTokoBaru');
  const btnSimpan = document.getElementById('btnSimpanTokoBaru');
  const selectAreaEl = document.getElementById('selectAreaTokoBaru');
  const targetArea = selectAreaEl ? selectAreaEl.value : (getUserAreaList(currentUser.area)[0] || 'BDG');
  const namaToko = inputEl ? inputEl.value.trim().toUpperCase() : '';

  if (!namaToko) {
    showNotif('NAMA TOKO TIDAK BOLEH KOSONG!', 'warning');
    return;
  }

  const existingStores = getStoresFromDB();
  const isDuplicate = existingStores.some(s => s.fullName.toUpperCase() === namaToko && s.area === targetArea && s.id !== editStoreId);
  if (isDuplicate) {
    showNotif(`TOKO '${namaToko}' SUDAH TERDAFTAR DI AREA ${targetArea}!`, 'warning');
    return;
  }

  if (editStoreId) {
    // MODES EDIT TOKO
    showLoading('MEMPERBARUI DATA TOKO...');
    setTimeout(async () => {
      try {
        const targetStore = existingStores.find(s => s.id === editStoreId);
        const oldName = targetStore ? targetStore.fullName : '';
        const newCode = generateStoreCode(namaToko);

        // 1. UPDATE CACHE STORES & LOCAL STORAGE
        try {
          const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
          const idx = localStores.findIndex(s => s.id === editStoreId || (s.fullName && oldName && s.fullName.toUpperCase() === oldName.toUpperCase()));
          if (idx !== -1) {
            localStores[idx].fullName = namaToko;
            localStores[idx].storeCode = newCode;
            localStores[idx].area = targetArea;
            appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));
          }
        } catch (e) {}

        if (typeof cacheStores !== 'undefined' && Array.isArray(cacheStores)) {
          const idx = cacheStores.findIndex(s => s.id === editStoreId || (s.fullName && oldName && s.fullName.toUpperCase() === oldName.toUpperCase()));
          if (idx !== -1) {
            cacheStores[idx].fullName = namaToko;
            cacheStores[idx].storeCode = newCode;
            cacheStores[idx].area = targetArea;
          }
        }

        // 2. UPDATE AKUN USER JIKA TERKAIT
        const users = getUsersFromDB();
        const userObj = users.find(u => u.id === editStoreId || (u.fullName && oldName && u.fullName.toUpperCase() === oldName.toUpperCase()));
        if (userObj) {
          userObj.fullName = namaToko;
          userObj.storeCode = newCode;
          userObj.area = targetArea;
          try { saveUsersToDB(users); } catch (e) {}

          if (typeof supabase !== 'undefined' && supabase) {
            try {
              await supabase.from('users').upsert({
                id: userObj.id,
                username: userObj.username,
                password: userObj.password,
                full_name: userObj.fullName,
                store_code: userObj.storeCode,
                phone: userObj.phone || '-',
                category: userObj.category || 'TOKO',
                area: targetArea,
                created_at: userObj.createdAt || getFormattedDateDDMMYYYY()
              });
            } catch (e) {}
          }
        }

        // 3. UPDATE SUPABASE TOKO_LIST TABEL
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            await supabase.from('toko_list').upsert({
              id: editStoreId,
              full_name: namaToko,
              area: targetArea,
              store_code: newCode,
              created_by: currentUser.fullName
            });
          } catch (e) {
            console.warn('[SUPABASE TOKO_LIST UPDATE WARNING]:', e);
          }
        }

        if (typeof syncSupabaseStoresToLocalCache === 'function') {
          await syncSupabaseStoresToLocalCache();
        }

        // 4. SINKRONKAN CLOUD DATABASE
        if (typeof pushCentralCloudDB === 'function') {
          try { await pushCentralCloudDB(); } catch (e) {}
        }

        hideLoading();
        showNotif(`TOKO BERHASIL DIPERBARUHI MENJADI '${namaToko}' (AREA ${targetArea})!`, 'success');

        editStoreId = null;
        if (inputEl) inputEl.value = '';
        if (btnSimpan) {
          btnSimpan.innerHTML = `<span class="material-symbols-rounded" style="vertical-align: middle;">save</span> SIMPAN`;
          btnSimpan.style.background = '#16a34a';
        }
        if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
        if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions(namaToko);
        if (typeof loadUsersManagement === 'function') loadUsersManagement();
      } catch (err) {
        hideLoading();
        console.error('[EDIT TOKO ERROR]:', err);
        showNotif('GAGAL MEMPERBARUI TOKO: ' + (err.message || err), 'error');
      }
    }, 300);
    return;
  }

  showLoading('MENYIMPAN TOKO BARU...');
  setTimeout(async () => {
    try {
      const storeKey = `${namaToko}_${targetArea}`;
      let deletedStoreKeys = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
      if (deletedStoreKeys.includes(storeKey)) {
        deletedStoreKeys = deletedStoreKeys.filter(k => k !== storeKey);
        appStorage.setItem(DELETED_STORES_KEY, JSON.stringify(deletedStoreKeys));
      }

      const generatedCode = generateStoreCode(namaToko);
      const newId = `STK-${Date.now()}`;

      const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
      const newStore = {
        id: newId,
        fullName: namaToko,
        area: targetArea,
        storeCode: generatedCode,
        createdBy: currentUser.fullName
      };
      localStores.push(newStore);
      appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));

      const users = getUsersFromDB();
      const safeUsername = namaToko.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
      let newUserAcc = null;
      if (!users.some(u => u.username.toUpperCase() === safeUsername)) {
        newUserAcc = {
          id: newId,
          username: safeUsername,
          password: '123',
          fullName: namaToko,
          storeCode: generatedCode,
          phone: '-',
          category: 'TOKO',
          area: targetArea,
          createdAt: getFormattedDateDDMMYYYY()
        };
        users.push(newUserAcc);
        saveUsersToDB(users);
      }

      // SINKRONKAN LANGSUNG KE SUPABASE DATABASE (TABEL: toko_list & users)
      if (typeof supabase !== 'undefined' && supabase) {
        try {
          await supabase.from('toko_list').upsert({
            id: newId,
            full_name: newStore.fullName,
            area: newStore.area,
            store_code: newStore.storeCode,
            created_by: newStore.createdBy
          });
          if (newUserAcc) {
            await supabase.from('users').upsert({
              id: newUserAcc.id,
              username: newUserAcc.username,
              password: newUserAcc.password,
              full_name: newUserAcc.fullName,
              store_code: newUserAcc.storeCode,
              phone: newUserAcc.phone,
              category: newUserAcc.category,
              area: newUserAcc.area,
              created_at: newUserAcc.createdAt
            });
          }
          console.log('⚡ [SUPABASE STORE SUCCESS]: Data toko berhasil disimpan ke Supabase!');
        } catch (sbErr) {
          console.warn('[SUPABASE STORE SAVE WARNING]:', sbErr);
        }
      }
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        await dbFirestore.collection('stores').doc(newId).set(newStore).catch(e => console.warn(e));
        if (newUserAcc) {
          await dbFirestore.collection('users').doc(safeUsername).set(newUserAcc).catch(e => console.warn(e));
        }
      }
      if (typeof dbRealtime !== 'undefined' && dbRealtime) {
        await dbRealtime.ref(`stores/${newId}`).set(newStore).catch(e => console.warn(e));
        if (newUserAcc) {
          await dbRealtime.ref(`users/${safeUsername}`).set(newUserAcc).catch(e => console.warn(e));
        }
      }

      if (typeof pushCentralCloudDB === 'function') {
        await pushCentralCloudDB();
      }

      // AMBIL DATA TERBARU DARI CLOUD SEHINGGA DATA LANGSUNG MASUK KE DATABASE & MENU USER ADMIN
      if (typeof syncAllDataToCache === 'function') {
        await syncAllDataToCache().catch(() => {});
      }

      hideLoading();
      showNotif(`TOKO '${namaToko}' BERHASIL DITAMBAHKAN!`, 'success');
      if (inputEl) inputEl.value = '';
      if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
      if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions(namaToko);
      if (typeof loadUsersManagement === 'function') loadUsersManagement();
    } catch (err) {
      hideLoading();
      console.error('[SIMPAN TOKO ERROR]:', err);
      showNotif('GAGAL MENYIMPAN TOKO!', 'error');
    }
  }, 300);
}
window.simpanTokoBaru = simpanTokoBaru;

function hapusTokoCustom(id) {
  const allStores = getStoresFromDB();
  const store = allStores.find(s => s.id === id);
  const name = store ? store.fullName : 'TOKO';
  const storeArea = store ? store.area : (currentUser ? currentUser.area : '');

  showConfirm(`HAPUS TOKO '${name}' DARI DAFTAR?`, () => {
    showLoading('MENGHAPUS TOKO...');
    setTimeout(async () => {
      try {
        // 1. UPDATE CACHE LOKAL & DELETED KEYS
        try {
          const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
          const updatedLocal = localStores.filter(s => s.id !== id && s.fullName.toUpperCase() !== name.toUpperCase());
          appStorage.setItem(STORES_DB_KEY, JSON.stringify(updatedLocal));
        } catch(e) {}

        const storeKey = `${name.toUpperCase()}_${storeArea}`;
        try {
          const deletedStoreKeys = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
          if (!deletedStoreKeys.includes(storeKey)) {
            deletedStoreKeys.push(storeKey);
            appStorage.setItem(DELETED_STORES_KEY, JSON.stringify(deletedStoreKeys));
          }
        } catch(e) {}

        const users = getUsersFromDB();
        const updatedUsers = users.filter(u => u.id !== id && !(u.category === 'TOKO' && u.fullName && u.fullName.toUpperCase() === name.toUpperCase()));
        try { saveUsersToDB(updatedUsers); } catch(e) {}

        // 2. HAPUS LANGSUNG DARI SUPABASE DATABASE (TABEL: toko_list & users)
        if (typeof supabase !== 'undefined' && supabase) {
          try {
            await supabase.from('toko_list').delete().eq('id', id);
            await supabase.from('toko_list').delete().eq('full_name', name);
            await supabase.from('users').delete().eq('id', id);
            await supabase.from('users').delete().eq('full_name', name);
          } catch (sbErr) {
            console.warn('[SUPABASE DELETE STORE NOTICE]:', sbErr);
          }
        }

        // 3. HAPUS LANGSUNG DARI FIREBASE ONLINE
        const safeUsername = name.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
          await dbFirestore.collection('stores').doc(id).delete().catch(e => console.warn(e));
          await dbFirestore.collection('users').doc(safeUsername).delete().catch(e => console.warn(e));
        }
        if (typeof dbRealtime !== 'undefined' && dbRealtime) {
          await dbRealtime.ref(`stores/${id}`).remove().catch(e => console.warn(e));
          await dbRealtime.ref(`users/${safeUsername}`).remove().catch(e => console.warn(e));
        }

        if (typeof pushCentralCloudDB === 'function') {
          await pushCentralCloudDB();
        }

        if (typeof syncAllDataToCache === 'function') {
          await syncAllDataToCache().catch(() => {});
        }

        hideLoading();
        showNotif(`TOKO '${name}' BERHASIL DIHAPUS!`, 'info');

        // Buka kembali modal tambah toko jika tertutup oleh konfirmasi
        const popupToko = document.getElementById('popupTambahToko');
        if (popupToko) {
          popupToko.style.display = 'flex';
          popupToko.classList.add('show');
        }

        if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
        if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
        if (typeof loadUsersManagement === 'function') loadUsersManagement();
      } catch (err) {
        hideLoading();
        console.error('[HAPUS TOKO ERROR]:', err);
        showNotif('GAGAL MENGHAPUS TOKO!', 'error');
      }
    }, 300);
  });
}
window.hapusTokoCustom = hapusTokoCustom;

async function prosesUploadExcelToko(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    showNotif('MODUL BACA EXCEL (XLSX) BELUM SIAP!', 'error');
    return;
  }

  showLoading('MEMBACA FILE EXCEL DAFTAR TOKO (KOLOM A = NAMA, KOLOM B = AREA)...');

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!Array.isArray(rawJson) || rawJson.length === 0) {
        hideLoading();
        showNotif('FILE EXCEL KOSONG ATAU FORMAT TIDAK SESUAI!', 'warning');
        return;
      }

      const existingStores = getStoresFromDB();
      const defaultUserArea = (currentUser && currentUser.area && currentUser.area !== 'ALL') ? currentUser.area : 'BDG';
      const users = getUsersFromDB();

      let addedCount = 0;
      let skippedCount = 0;
      const newStoresList = [];
      const newUsersList = [];

      for (let i = 0; i < rawJson.length; i++) {
        const row = rawJson[i];
        if (!row || !row.length) continue;
        
        let storeNameVal = String(row[0] || '').trim().toUpperCase();
        let storeAreaVal = String(row[1] || '').trim().toUpperCase();

        if (!storeNameVal) continue;

        if (storeNameVal === 'NAMA TOKO' || storeNameVal === 'TOKO' || storeNameVal === 'STORE' || storeNameVal === 'NAME' || storeAreaVal === 'AREA' || storeAreaVal === 'KODE AREA') {
          continue;
        }

        if (!storeAreaVal || storeAreaVal === 'UNDEFINED' || storeAreaVal === 'NULL') {
          storeAreaVal = defaultUserArea;
        }

        const isDuplicate = existingStores.some(s => s && s.fullName && s.fullName.trim().toUpperCase() === storeNameVal && s.area === storeAreaVal);
        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        const generatedCode = generateStoreCode(storeNameVal, storeAreaVal);
        const newId = `STK-UPL-${Date.now()}-${Math.floor(Math.random()*1000)}`;

        const storeObj = {
          id: newId,
          fullName: storeNameVal,
          area: storeAreaVal,
          storeCode: generatedCode,
          createdBy: currentUser ? currentUser.fullName : 'ADMIN'
        };

        existingStores.push(storeObj);
        newStoresList.push(storeObj);

        const safeUsername = storeNameVal.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
        if (!users.some(u => u && u.username && u.username.toUpperCase() === safeUsername)) {
          const userAcc = {
            id: newId,
            username: safeUsername,
            password: '123',
            fullName: storeNameVal,
            storeCode: generatedCode,
            phone: '-',
            category: 'TOKO',
            area: storeAreaVal,
            createdAt: getFormattedDateDDMMYYYY()
          };
          users.push(userAcc);
          newUsersList.push(userAcc);
        }

        addedCount++;
      }

      if (addedCount === 0) {
        hideLoading();
        showNotif(`TIDAK ADA TOKO BARU DITAMBAHKAN (${skippedCount} TOKO SUDAH TERDAFTAR SEBELUMNYA).`, 'info');
        event.target.value = '';
        return;
      }

      // 1. BERSIHKAN DAFTAR DELETED KEYS DARI TOKO / USER YANG DIUNGGAH ULANG
      const uploadedStoreNames = new Set(newStoresList.map(s => s.fullName.toUpperCase()));
      const uploadedUsernames = new Set(newUsersList.map(u => u.username.toUpperCase()));

      let delStores = JSON.parse(appStorage.getItem(DELETED_STORES_KEY) || '[]');
      delStores = delStores.filter(k => {
        const val = String(k || '').trim().toUpperCase();
        if (uploadedStoreNames.has(val)) return false;
        for (let s of newStoresList) {
          if (val === `${s.fullName.toUpperCase()}_${s.area.toUpperCase()}`) return false;
        }
        return true;
      });
      appStorage.setItem(DELETED_STORES_KEY, JSON.stringify(delStores));
      try { localStorage.setItem(DELETED_STORES_KEY, JSON.stringify(delStores)); } catch(e) {}

      let delUsers = JSON.parse(appStorage.getItem(DELETED_USERS_KEY) || '[]');
      delUsers = delUsers.filter(k => {
        const val = String(k || '').trim().toUpperCase();
        return !uploadedUsernames.has(val) && !uploadedStoreNames.has(val);
      });
      appStorage.setItem(DELETED_USERS_KEY, JSON.stringify(delUsers));
      try { localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(delUsers)); } catch(e) {}

      // 2. SIMPAN KE STORES_DB_KEY SECARA LOKAL & PERSISTEN
      const localStores = JSON.parse(appStorage.getItem(STORES_DB_KEY) || '[]');
      newStoresList.forEach(ns => {
        if (!localStores.some(s => s && s.fullName && s.fullName.toUpperCase() === ns.fullName.toUpperCase() && s.area === ns.area)) {
          localStores.push(ns);
        }
      });
      appStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores));
      try { localStorage.setItem(STORES_DB_KEY, JSON.stringify(localStores)); } catch(e) {}

      if (newUsersList.length > 0) {
        saveUsersToDB(users);
      }

      // 3. SIMPAN KE SUPABASE (TABEL toko_list & users)
      if (typeof supabase !== 'undefined' && supabase) {
        try {
          const supaStoresPayload = newStoresList.map(s => ({
            id: s.id,
            full_name: s.fullName,
            area: s.area,
            store_code: s.storeCode,
            created_by: s.createdBy
          }));
          await supabase.from('toko_list').upsert(supaStoresPayload);

          if (newUsersList.length > 0) {
            const supaUsersPayload = newUsersList.map(u => ({
              id: u.id,
              username: u.username,
              password: u.password,
              full_name: u.fullName,
              store_code: u.storeCode,
              phone: u.phone,
              category: u.category,
              area: u.area,
              created_at: u.createdAt
            }));
            await supabase.from('users').upsert(supaUsersPayload);
          }
        } catch(sbErr) {
          console.warn('[SUPABASE BATCH UPLOAD STORES WARNING]:', sbErr);
        }
      }

      pushCentralCloudDB();
      hideLoading();

      showNotif(`BERHASIL MENGUNGGAH ${addedCount} TOKO BARU (KOLOM A = NAMA, KOLOM B = AREA)! (${skippedCount} DUPLIKAT DILEWATI)`, 'success');
      event.target.value = '';

      if (typeof loadDaftarTokoModal === 'function') loadDaftarTokoModal();
      if (typeof updateStoreDropdownOptions === 'function') updateStoreDropdownOptions();
      if (typeof loadUsersManagement === 'function') loadUsersManagement();
      if (typeof loadForm === 'function') loadForm();

    } catch(err) {
      hideLoading();
      console.error('[EXCEL UPLOAD TOKO ERROR]:', err);
      showNotif('GAGAL MEMBACA FILE EXCEL: ' + (err.message || err), 'error');
      event.target.value = '';
    }
  };

  reader.readAsArrayBuffer(file);
}
window.prosesUploadExcelToko = prosesUploadExcelToko;

function downloadExcel() {
  const data = getAccessibleRequests();
  if (data.length === 0) {
    showNotif('TIDAK ADA DATA UNTUK DIEKSPOR!', 'warning');
    return;
  }

  showLoading('MEMBUAT FILE EXCEL (.XLSX)...');
  setTimeout(() => {
    hideLoading();
    const rows = [];
    rows.push([
      'NO SURAT', 'TANGGAL', 'TOKO', 'AREA', 'JENIS PERMINTAAN', 'STATUS',
      'NO', 'TYPE BARANG', 'NO SERI', 'DUS BARANG', 'PERMINTAAN DETAIL', 'ALASAN', 'QTY',
      'PEMOHON', 'CATATAN'
    ]);

    data.forEach(r => {
      if (r.items && r.items.length > 0) {
        r.items.forEach((item, itemIdx) => {
          rows.push([
            r.noSurat,
            r.tanggal,
            r.toko,
            r.area,
            r.jenis,
            r.status,
            itemIdx + 1,
            item.type || '-',
            item.seri || '-',
            item.dus || '-',
            item.barang || '-',
            item.alasan || '-',
            item.qty || 1,
            r.createdBy,
            r.catatan || ''
          ]);
        });
      } else {
        rows.push([
          r.noSurat,
          r.tanggal,
          r.toko,
          r.area,
          r.jenis,
          r.status,
          1,
          '-',
          '-',
          '-',
          '-',
          '-',
          1,
          r.createdBy,
          r.catatan || ''
        ]);
      }
    });

    if (typeof XLSX !== 'undefined') {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Permintaan Detail");
      XLSX.writeFile(wb, `DATA_PERMINTAAN_DETAIL_${new Date().toISOString().split('T')[0]}.xlsx`);
      showNotif('BERHASIL DI-DOWNLOAD!', 'info');
    } else {
      showNotif('MODUL EXCEL (.XLSX) BELUM SIAP, PERIKSA KONEKSI INTERNET!', 'warning');
    }
  }, 400);
}

function closeAllPopups() {
  const allOverlays = document.querySelectorAll('.popupOverlay, #imageViewer, #rejectOverlay, #confirmOverlay, #pdfModal, #popupDetail, #popupDetailBarangV2, #popupAkun, #popupUserForm, #popupTTD, #popupNotifList, #popupBantuan, #scannerModal, #popupTambahToko, #popupPdfModelsModal');
  allOverlays.forEach(el => {
    if (el) {
      el.style.display = 'none';
      el.classList.remove('show');
    }
  });
}
window.closeAllPopups = closeAllPopups;

function showConfirm(msg, callback) {
  const msgEl = document.getElementById('confirmMessage');
  if (msgEl) msgEl.innerHTML = msg;
  confirmCallback = callback;
  const modal = document.getElementById('confirmOverlay');
  if (modal) {
    modal.style.setProperty('z-index', '999999999', 'important');
    modal.style.setProperty('display', 'flex', 'important');
  }
  pushPopupHistoryState();
}

function closeConfirm() {
  const modal = document.getElementById('confirmOverlay');
  if (modal) modal.style.display = 'none';
  confirmCallback = null;
}

function confirmYes() {
  const cb = confirmCallback;
  confirmCallback = null;
  closeConfirm();
  closeAllPopups();
  if (typeof cb === 'function') {
    cb();
  }
}

// LISTEN FOR KEYBOARD ENTER KEY TO TRIGGER CONFIRMATION "YA, LANJUT" OR OK NOTIFICATION & ARROW KEYS FOR IMAGE VIEWER
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const confirmOverlay = document.getElementById('confirmOverlay');
    if (confirmOverlay && confirmOverlay.style.display !== 'none' && confirmOverlay.style.display !== '') {
      e.preventDefault();
      e.stopPropagation();
      confirmYes();
      return;
    }
    const popupNotif = document.getElementById('popupNotif');
    if (popupNotif && popupNotif.style.display !== 'none' && popupNotif.style.display !== '') {
      e.preventDefault();
      e.stopPropagation();
      closePopup();
      return;
    }
  } else if (e.key === 'ArrowLeft') {
    const viewer = document.getElementById('imageViewer');
    if (viewer && viewer.style.display !== 'none' && viewer.style.display !== '') {
      gantiFotoViewer(-1);
    }
  } else if (e.key === 'ArrowRight') {
    const viewer = document.getElementById('imageViewer');
    if (viewer && viewer.style.display !== 'none' && viewer.style.display !== '') {
      gantiFotoViewer(1);
    }
  }
});

function showNotif(msg, type = 'info') {
  const notifOverlay = document.getElementById('popupNotif');
  const notifMessage = document.getElementById('popupNotifMessage');
  const notifCard = document.getElementById('popupNotifCard');
  
  const notifIcon = document.getElementById('popupNotifIcon');
  const notifTitle = document.getElementById('popupNotifTitle');

  if (!notifOverlay) return;
  if (notifMessage) notifMessage.textContent = msg || 'INFORMASI SISTEM';

  const lowerType = (type || 'info').toLowerCase();
  if (notifCard) {
    if (lowerType.includes('error') || lowerType.includes('salah') || lowerType.includes('gagal') || lowerType.includes('danger')) {
      notifCard.className = 'popupNotifCard notif-error';
      if(notifIcon) notifIcon.textContent = 'cancel';
      if(notifTitle) notifTitle.textContent = 'GAGAL';
    } else if (lowerType.includes('warning') || lowerType.includes('peringatan')) {
      notifCard.className = 'popupNotifCard notif-warning';
      if(notifIcon) notifIcon.textContent = 'warning';
      if(notifTitle) notifTitle.textContent = 'PERINGATAN';
    } else if (lowerType.includes('success') || lowerType.includes('berhasil')) {
      notifCard.className = 'popupNotifCard notif-success';
      if(notifIcon) notifIcon.textContent = 'check_circle';
      if(notifTitle) notifTitle.textContent = 'BERHASIL';
    } else {
      notifCard.className = 'popupNotifCard notif-info';
      if(notifIcon) notifIcon.textContent = 'info';
      if(notifTitle) notifTitle.textContent = 'INFORMASI';
    }
  }

  if (notifOverlay) {
    notifOverlay.style.setProperty('z-index', '9999999999', 'important');
    notifOverlay.style.setProperty('display', 'flex', 'important');
  }
}

function closePopup() {
  const notifOverlay = document.getElementById('popupNotif');
  if (notifOverlay) notifOverlay.style.display = 'none';

  const activePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : 'dashboardPage';
  if (typeof aturTampilanLonceng === 'function') {
    aturTampilanLonceng(activePage);
  }
}

function showLoading() {
  const modal = document.getElementById('loadingOverlay');
  if (modal) modal.style.display = 'flex';
}

function hideLoading() {
  const modal = document.getElementById('loadingOverlay');
  if (modal) modal.style.display = 'none';
}

let currentZoom = 1;
let panX = 0;
let panY = 0;
let isPanningImage = false;
let startPointerX = 0;
let startPointerY = 0;
let initialPanX = 0;
let initialPanY = 0;

let currentRotation = 0;

function applyImageTransform(isSmooth = false) {
  const img = document.getElementById('viewerImage');
  if (!img) return;

  if (currentZoom <= 1) {
    panX = 0;
    panY = 0;
  }

  img.style.transition = isSmooth ? 'transform 0.22s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none';
  img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom}) rotate(${currentRotation}deg)`;
  img.style.cursor = isPanningImage ? 'grabbing' : (currentZoom > 1 ? 'grab' : 'pointer');
}

function toggleRotation() {
  currentRotation = (currentRotation + 90) % 360;
  applyImageTransform(true);
}
window.toggleRotation = toggleRotation;
window.rotateImage = toggleRotation;

function initImagePanListeners() {
  const canvas = document.getElementById('imageViewerCanvas');
  const img = document.getElementById('viewerImage');
  if (!canvas || !img || canvas.dataset.panInitialized) return;
  canvas.dataset.panInitialized = 'true';

  img.addEventListener('dragstart', (e) => e.preventDefault());

  canvas.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target.closest('.closeViewer') || e.target.closest('.viewerBottomBar')) return;

    isPanningImage = true;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    initialPanX = panX;
    initialPanY = panY;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch(err) {}

    applyImageTransform(false);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isPanningImage) return;
    e.preventDefault();

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;

    panX = initialPanX + dx;
    panY = initialPanY + dy;

    applyImageTransform(false);
  });

  const stopPan = (e) => {
    if (isPanningImage) {
      isPanningImage = false;
      try {
        if (e && e.pointerId && canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch(err) {}
      applyImageTransform(false);
    }
  };

  canvas.addEventListener('pointerup', stopPan);
  canvas.addEventListener('pointercancel', stopPan);

  canvas.addEventListener('dblclick', (e) => {
    if (e.target.closest('button') || e.target.closest('.closeViewer') || e.target.closest('.viewerBottomBar')) return;
    if (currentZoom > 1.2) {
      resetZoom();
    } else {
      currentZoom = 2.5;
      applyImageTransform(true);
    }
  });
}

let currentViewerPhotos = [];
let currentViewerIndex = 0;

function updateViewerCounter() {
  const counter = document.getElementById('viewerCounter');
  const navLeft = document.getElementById('navViewerLeft');
  const navRight = document.getElementById('navViewerRight');

  const photos = parsePhotosArray(currentViewerPhotos.length > 0 ? currentViewerPhotos : viewerPhotos);
  const total = photos.length || 1;
  const current = (currentViewerIndex || 0) + 1;

  if (counter) counter.textContent = `${current} / ${total}`;

  if (navLeft) navLeft.style.display = total > 1 ? 'flex' : 'none';
  if (navRight) navRight.style.display = total > 1 ? 'flex' : 'none';
}

function gantiFotoViewer(direction) {
  const photos = parsePhotosArray(currentViewerPhotos.length > 0 ? currentViewerPhotos : viewerPhotos);
  if (!photos || photos.length <= 1) return;
  
  currentViewerIndex = (currentViewerIndex + direction + photos.length) % photos.length;
  viewerCurrentIndex = currentViewerIndex;
  currentViewerPhotos = photos;
  viewerPhotos = photos;
  
  resetZoom();
  
  const img = document.getElementById('viewerImage');
  if (img) {
    img.src = photos[currentViewerIndex];
    applyImageTransform(false);
  }
  updateViewerCounter();
}

function bukaViewGambar(src, startIdx = 0) {
  const photoList = parsePhotosArray(src);
  if (!photoList || photoList.length === 0) {
    showNotif('TIDAK ADA FOTO BUKTI PENDUKUNG!', 'warning');
    return;
  }

  currentViewerPhotos = photoList;
  viewerPhotos = photoList;
  currentViewerIndex = Math.max(0, Math.min(startIdx, photoList.length - 1));
  viewerCurrentIndex = currentViewerIndex;

  currentZoom = 1;
  panX = 0;
  panY = 0;
  isPanningImage = false;

  const modal = document.getElementById('imageViewer');
  const img = document.getElementById('viewerImage');

  if (img) {
    img.src = photoList[currentViewerIndex];
  }

  if (modal) {
    modal.style.display = 'flex';
  }

  applyImageTransform(false);
  updateViewerCounter();
  initImagePanListeners();

  setTimeout(() => {
    applyImageTransform(false);
  }, 50);

  if (typeof pushPopupHistoryState === 'function') {
    pushPopupHistoryState();
  }
}
window.bukaViewGambar = bukaViewGambar;
window.zoomFoto = bukaViewGambar;

function tutupImageViewer() {
  const modal = document.getElementById('imageViewer');
  if (modal) modal.style.display = 'none';
  resetZoom();
}

function zoomImage(step) {
  currentZoom += step;
  if (currentZoom < 0.2) currentZoom = 0.2;
  if (currentZoom > 8) currentZoom = 8;
  if (currentZoom <= 1.05 && step < 0) {
    currentZoom = 1;
    panX = 0;
    panY = 0;
  }
  applyImageTransform(true);
}

function resetZoom() {
  currentZoom = 1;
  currentRotation = 0;
  panX = 0;
  panY = 0;
  isPanningImage = false;
  applyImageTransform(true);
}

// MOUSE WHEEL SCROLL ZOOM IN / ZOOM OUT FOR IMAGE VIEWER
document.addEventListener('wheel', function(e) {
  const imageViewer = document.getElementById('imageViewer');
  if (imageViewer && (imageViewer.style.display === 'flex' || imageViewer.style.display === 'block')) {
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.25 : -0.25;
    zoomImage(step);
  }
}, { passive: false });

function initDraggableElement(element, storageKey) {
  const el = typeof element === 'string' ? document.getElementById(element) : element;
  if (!el) return;

  el.classList.add('draggable-btn');

  const savedPos = appStorage.getItem(storageKey);
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') {
        const maxX = window.innerWidth - (el.offsetWidth || 48);
        const maxY = window.innerHeight - (el.offsetHeight || 48);
        const clampedX = Math.max(0, Math.min(pos.left, maxX));
        const clampedY = Math.max(0, Math.min(pos.top, maxY));

        el.style.position = 'fixed';
        el.style.left = clampedX + 'px';
        el.style.top = clampedY + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      }
    } catch (e) {}
  }

  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let isDragging = false;
  const dragThreshold = 6;

  function onPointerDown(e) {
    const pointer = e.touches ? e.touches[0] : e;
    startX = pointer.clientX;
    startY = pointer.clientY;

    const rect = el.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    isDragging = false;

    if (e.type === 'touchstart') {
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    } else {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
    }
  }

  function onPointerMove(e) {
    const pointer = e.touches ? e.touches[0] : e;
    const deltaX = pointer.clientX - startX;
    const deltaY = pointer.clientY - startY;

    if (!isDragging && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
      isDragging = true;
      el.classList.add('is-dragging');
    }

    if (isDragging) {
      if (e.cancelable) e.preventDefault();

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop; 

      const maxX = window.innerWidth - (el.offsetWidth || 48);
      newLeft = Math.max(0, Math.min(newLeft, maxX));

      el.style.position = 'fixed';
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
  }

  function onPointerUp(e) {
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);

    el.classList.remove('is-dragging');

    if (isDragging) {
      const rect = el.getBoundingClientRect();
      appStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));

      const preventClick = function(evt) {
        evt.stopImmediatePropagation();
        evt.preventDefault();
        el.removeEventListener('click', preventClick, true);
      };
      el.addEventListener('click', preventClick, true);
    }
  }

  el.addEventListener('mousedown', onPointerDown);
  el.addEventListener('touchstart', onPointerDown, { passive: true });
}

function initAllDraggableButtons() {
  // Fixed top-header layout per user instruction (non-draggable)
}

(function() {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    body:has(#loginPage.active) #notifBellBtn,
    body:has(#loginPage.active) .notif-bell-btn,
    body:has(#loginPage.active) #helpButton,
    body:has(#loginPage.active) .helpButton,
    body:has(#loginPage.active) #firebaseOnlineDot,
    body:has(.page.active:not(#dashboardPage)) #notifBellBtn,
    body:has(.page.active:not(#dashboardPage)) #helpButton,
    body:has(.page.active:not(#dashboardPage)) #firebaseOnlineDot {
      display: none !important;
    }
  `;
  document.head.appendChild(styleTag);
})();

function hapusSemuaDataLokal() {
  showConfirm('YAKIN INGIN MENGHAPUS SEMUA DATA PERANGKAT? (Aplikasi akan keluar dan dimuat ulang)', () => {
    showLoading('');
    
    setTimeout(async () => {
      try {
        if (window.localStorage) {
          localStorage.clear();
        }
        if (window.sessionStorage) {
          sessionStorage.clear();
        }
        if (window.appStorage && typeof window.appStorage.clear === 'function') {
          window.appStorage.clear();
        }
        if (typeof caches !== 'undefined' && caches.keys) {
          const cacheNames = await caches.keys();
          for (let name of cacheNames) {
            await caches.delete(name);
          }
        }
        currentUser = null;
        window.location.reload(true);
      } catch (error) {
        hideLoading();
        console.error('Gagal menghapus data lokal:', error);
        showNotif('TERJADI KESALAHAN SAAT MENGHAPUS DATA!', 'error');
      }
    }, 800);
  });
}

// =============================================================================
// GLOBAL KEYBOARD NAVIGATION:
// 1. DASHBOARD & RIWAYAT / DETAIL DATA -> ARROW UP/DOWN & PAGE UP/DOWN SCROLLS TABLE
// 2. INPUT DATA FORM -> ARROW KEYS NAVIGATE ALL COLUMNS & ROWS, ENTER MOVES TO NEXT FIELD
// =============================================================================
function setupGlobalKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'SELECT' ||
      activeEl.tagName === 'TEXTAREA'
    );

    // -------------------------------------------------------------------------
    // CASE A: INSIDE INPUT FORM -> ARROW KEYS NAVIGATE COLUMNS/ROWS & ENTER MOVES TO NEXT FIELD
    // -------------------------------------------------------------------------
    if (isInput) {
      // 1. ENTER KEY: MOVE TO NEXT INPUT FIELD (OR AUTOMATICALLY ADD NEW ROW IF AT END OF FORM)
      if (e.key === 'Enter') {
        // Skip textareas if user wants new line
        if (activeEl.tagName === 'TEXTAREA' && !e.ctrlKey && !e.shiftKey) {
          return;
        }

        e.preventDefault();

        // Login form submit handling
        if (activeEl.id === 'username' || activeEl.id === 'password') {
          if (typeof window.prosesLogin === 'function') window.prosesLogin();
          return;
        }

        const formContainer = activeEl.closest('#detailContainer') || activeEl.closest('form') || activeEl.closest('.formWrap') || activeEl.closest('#popupDetail') || document;
        const allInputs = Array.from(formContainer.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        const currIndex = allInputs.indexOf(activeEl);

        if (currIndex !== -1 && currIndex < allInputs.length - 1) {
          const nextEl = allInputs[currIndex + 1];
          nextEl.focus();
          if (typeof nextEl.select === 'function' && nextEl.tagName === 'INPUT') nextEl.select();
        } else if (activeEl.closest('.detailRow')) {
          // If at the last input of the last row in Input Data, automatically add new row!
          if (typeof tambahRow === 'function') {
            tambahRow();
            setTimeout(() => {
              const rows = document.querySelectorAll('#detailContainer .detailRow');
              if (rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const firstInput = lastRow.querySelector('input');
                if (firstInput) {
                  firstInput.focus();
                  if (typeof firstInput.select === 'function') firstInput.select();
                }
              }
            }, 60);
          }
        }
        return;
      }

      // 2. ARROW KEYS NAVIGATION IN INPUT ROWS & COLUMNS
      const row = activeEl.closest('.detailRow');
      if (row) {
        const container = row.parentElement;
        const allRows = Array.from(container.querySelectorAll('.detailRow'));
        const rowIndex = allRows.indexOf(row);
        const rowInputs = Array.from(row.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        const colIndex = rowInputs.indexOf(activeEl);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (rowIndex < allRows.length - 1) {
            const nextRow = allRows[rowIndex + 1];
            const nextRowInputs = Array.from(nextRow.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'));
            const targetInput = nextRowInputs[colIndex] !== undefined ? nextRowInputs[colIndex] : nextRowInputs[nextRowInputs.length - 1];
            if (targetInput) {
              targetInput.focus();
              if (typeof targetInput.select === 'function' && targetInput.tagName === 'INPUT') targetInput.select();
            }
          }
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (rowIndex > 0) {
            const prevRow = allRows[rowIndex - 1];
            const prevRowInputs = Array.from(prevRow.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'));
            const targetInput = prevRowInputs[colIndex] !== undefined ? prevRowInputs[colIndex] : prevRowInputs[prevRowInputs.length - 1];
            if (targetInput) {
              targetInput.focus();
              if (typeof targetInput.select === 'function' && targetInput.tagName === 'INPUT') targetInput.select();
            }
          }
          return;
        }

        if (e.key === 'ArrowRight') {
          const isText = activeEl.type === 'text' || activeEl.type === 'search';
          const isAtEnd = !isText || activeEl.selectionEnd === activeEl.value.length;
          if (isAtEnd) {
            if (colIndex < rowInputs.length - 1) {
              e.preventDefault();
              const nextInput = rowInputs[colIndex + 1];
              nextInput.focus();
              if (typeof nextInput.select === 'function' && nextInput.tagName === 'INPUT') nextInput.select();
            } else if (rowIndex < allRows.length - 1) {
              e.preventDefault();
              const nextRow = allRows[rowIndex + 1];
              const firstInput = nextRow.querySelector('input');
              if (firstInput) {
                firstInput.focus();
                if (typeof firstInput.select === 'function') firstInput.select();
              }
            }
          }
          return;
        }

        if (e.key === 'ArrowLeft') {
          const isText = activeEl.type === 'text' || activeEl.type === 'search';
          const isAtStart = !isText || activeEl.selectionStart === 0;
          if (isAtStart) {
            if (colIndex > 0) {
              e.preventDefault();
              const prevInput = rowInputs[colIndex - 1];
              prevInput.focus();
              if (typeof prevInput.select === 'function' && prevInput.tagName === 'INPUT') prevInput.select();
            } else if (rowIndex > 0) {
              e.preventDefault();
              const prevRow = allRows[rowIndex - 1];
              const prevRowInputs = Array.from(prevRow.querySelectorAll('input'));
              const lastInput = prevRowInputs[prevRowInputs.length - 1];
              if (lastInput) {
                lastInput.focus();
                if (typeof lastInput.select === 'function') lastInput.select();
              }
            }
          }
          return;
        }
      }

      return;
    }

    // -------------------------------------------------------------------------
    // CASE B: OUTSIDE INPUT FORM (DASHBOARD, RIWAYAT/DETAIL DATA, MASTER DB)
    // ARROW UP / ARROW DOWN & PAGE UP / PAGE DOWN SCROLL THE ACTIVE TABLE!
    // -------------------------------------------------------------------------
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp') {
      let scrollTarget = null;
      
      const popupDetail = document.getElementById('popupDetail');
      if (popupDetail && popupDetail.style.display !== 'none' && popupDetail.offsetWidth > 0) {
        scrollTarget = popupDetail.querySelector('.popupTableScroll') || popupDetail.querySelector('.popupContent') || popupDetail.querySelector('#popupMessage');
      }

      if (!scrollTarget) {
        const activePage = document.querySelector('.pageSection.active') || document.querySelector('.page.active');
        if (activePage) {
          scrollTarget = activePage.querySelector('.tableWrap') || activePage.querySelector('.popupTableScroll');
        }
      }

      if (!scrollTarget) {
        scrollTarget = document.querySelector('.tableWrap');
      }

      if (scrollTarget) {
        e.preventDefault();
        const step = (e.key === 'PageDown' || e.key === 'PageUp') ? 260 : 60;
        const direction = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : -1;
        scrollTarget.scrollTop += (step * direction);
      }
    }
  });
}

// INITIALIZE APP STARTUP (AUTO LOGIN & PRE-FILL REMEMBERED CREDENTIALS ON REFRESH)
function initAppStartup() {
  if (typeof setupGlobalKeyboardNavigation === 'function') {
    setupGlobalKeyboardNavigation();
  }
  if (typeof autoLogin === 'function') {
    autoLogin();
  } else if (typeof loadRememberedCredentials === 'function') {
    loadRememberedCredentials();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppStartup);
} else {
  initAppStartup();
}

function hapusSemuaNotifFirebaseDanLokal() {
  if (typeof hapusSemuaNotifikasiSystem === 'function') {
    hapusSemuaNotifikasiSystem();
  }
}
window.hapusSemuaNotifFirebaseDanLokal = hapusSemuaNotifFirebaseDanLokal;

document.addEventListener('keydown', function(e) {
  if (e.target && e.target.id === 'chatPesan') {
    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
      e.preventDefault();
      if (typeof kirimPesanChat === 'function') {
        kirimPesanChat();
      }
    }
  }
});

// PREVENT FULL PAGE SCROLLING ON RIWAYAT PAGE & MASTER DB PAGE WHEN TOUCHING NON-TABLE ELEMENTS (EXEMPT ALL POPUP MODALS LIKE PDF PREVIEW)
document.addEventListener('touchmove', function (e) {
  const isInsideModal = e.target.closest('.popupOverlay') || e.target.closest('#pdfModal') || e.target.closest('#pdfDocumentContent') || e.target.closest('#imageViewer');
  if (isInsideModal) {
    return; // Allow touch scrolling inside modal!
  }

  const activePage = typeof getCurrentActivePageId === 'function' ? getCurrentActivePageId() : '';
  if (activePage === 'riwayatPage' || activePage === 'masterDbPage') {
    const isInsideTable = e.target.closest('.tableWrap');
    if (!isInsideTable) {
      if (e.cancelable) e.preventDefault();
    }
  }
}, { passive: false });