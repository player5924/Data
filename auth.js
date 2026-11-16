window.MG = window.MG || {};

MG.Auth = (() => {
  const USERS_KEY = 'mahjong_gold_users_v1';
  const SESSION_KEY = 'mahjong_gold_session_v1';
  const DEFAULT_SALDO = 100000;
  const DB_ROOT = 'mahjong_gold/users';

  const firebaseConfig = {
    apiKey: "AIzaSyBKB4EGvwwjc_TFxQyMvd2LWpsLTV3QvqU",
    authDomain: "database-e824e.firebaseapp.com",
    databaseURL: "https://database-e824e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "database-e824e",
    storageBucket: "database-e824e.firebasestorage.app",
    messagingSenderId: "828104799650",
    appId: "1:828104799650:web:5cc909c5d6207bc9306efb",
    measurementId: "G-RZRJT3TWMY"
  };

  let db = null;
  let firebaseOnline = false;
  let currentUserCache = null;
  let userRefListener = null;
  let allUsersListener = null;
  let connectionListeners = [];

  function initFirebase() {
    try {
      if (typeof window.firebase !== 'undefined' && window.firebase.database) {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        db = window.firebase.database();
        db.ref('.info/connected').on('value', (snap) => {
          firebaseOnline = Boolean(snap.val());
          connectionListeners.forEach((cb) => cb(firebaseOnline));
        });
      }
    } catch {
      db = null;
      firebaseOnline = false;
    }
  }

  initFirebase();

  function defaultSettings() {
    return {
      playMode: 'normal',       // 'normal' | 'win' | 'loss'
      multMode: 'normal',       // 'normal' | 'boost'
      scatterDelaySpins: 0,     // 0 = nonaktif, >0 = scatter muncul setelah N spin
      scatterTierCount: 3,      // 3, 4, 5, atau 6 scatter
      scatterTargetPayout: 0,   // Rp target total hasil selama sesi free spin (0 = acak)
      suspended: false
    };
  }

  function hashPassword(password, salt) {
    const input = `${salt}::${password}::mahjong-gold`;
    let h1 = 0xdeadbeef ^ input.length;
    let h2 = 0x41c6ce57 ^ input.length;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  function ensureAdminSeed(users) {
    if (!users.admin) {
      users.admin = {
        username: 'admin',
        role: 'admin',
        passwordHash: hashPassword('admin123', 'admin'),
        totalScore: 0,
        bestScore: 0,
        settings: defaultSettings(),
        createdAt: Date.now()
      };
      saveUsersLocal(users);
    }
    return users;
  }

  function loadUsersLocal() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return ensureAdminSeed(parsed);
    } catch {
      return ensureAdminSeed({});
    }
  }

  function saveUsersLocal(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }

  function getSessionKey() {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  }

  function setSessionKey(usernameLower) {
    try {
      if (usernameLower) localStorage.setItem(SESSION_KEY, usernameLower);
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function formatUserObj(u) {
    if (!u) return null;
    const rawSettings = u.settings || {};
    let playMode = rawSettings.playMode;
    if (!playMode && rawSettings.winBias) {
      if (rawSettings.winBias === 'gacor') playMode = 'win';
      else if (rawSettings.winBias === 'ketat') playMode = 'loss';
      else playMode = 'normal';
    }
    return {
      username: u.username,
      role: u.role === 'admin' ? 'admin' : 'player',
      totalScore: typeof u.totalScore === 'number' ? u.totalScore : DEFAULT_SALDO,
      bestScore: typeof u.bestScore === 'number' ? u.bestScore : DEFAULT_SALDO,
      settings: {
        ...defaultSettings(),
        ...rawSettings,
        playMode: playMode || 'normal'
      }
    };
  }

  function getCurrentUser() {
    if (currentUserCache) return currentUserCache;
    const key = getSessionKey();
    if (!key) return null;
    const users = loadUsersLocal();
    const u = users[key];
    if (!u) return null;
    currentUserCache = formatUserObj(u);
    return currentUserCache;
  }

  function isAdmin() {
    const u = getCurrentUser();
    return !!(u && u.role === 'admin');
  }

  function isFirebaseConnected() {
    return Boolean(db && firebaseOnline);
  }

  function subscribeConnection(cb) {
    connectionListeners.push(cb);
    cb(isFirebaseConnected());
  }

  async function init() {
    const localUsers = loadUsersLocal();
    if (db) {
      try {
        const adminSnap = await db.ref(`${DB_ROOT}/admin`).once('value');
        if (!adminSnap.exists()) {
          await db.ref(`${DB_ROOT}/admin`).set(localUsers.admin);
        }
        const key = getSessionKey();
        if (key) {
          const snap = await db.ref(`${DB_ROOT}/${key}`).once('value');
          if (snap.exists()) {
            const u = snap.val();
            localUsers[key] = u;
            saveUsersLocal(localUsers);
            currentUserCache = formatUserObj(u);
          }
        }
      } catch {}
    }
    return getCurrentUser();
  }

  async function register(usernameRaw, password, confirmPassword) {
    const username = (usernameRaw || '').trim();
    if (username.length < 3 || username.length > 20) {
      return { ok: false, error: 'Username harus 3–20 karakter.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { ok: false, error: 'Username hanya boleh huruf, angka, dan underscore (_).' };
    }
    const key = username.toLowerCase();
    if (key === 'admin') {
      return { ok: false, error: 'Username "admin" khusus untuk akun pengelola.' };
    }
    if (!password || password.length < 4) {
      return { ok: false, error: 'Password minimal 4 karakter.' };
    }
    if (password !== confirmPassword) {
      return { ok: false, error: 'Konfirmasi password tidak cocok.' };
    }

    const users = loadUsersLocal();
    if (db) {
      try {
        const snap = await db.ref(`${DB_ROOT}/${key}`).once('value');
        if (snap.exists()) {
          return { ok: false, error: 'Username sudah terdaftar di Firebase. Silakan masuk.' };
        }
      } catch {}
    } else if (users[key]) {
      return { ok: false, error: 'Username sudah terdaftar. Silakan masuk.' };
    }

    const newUser = {
      username,
      role: 'player',
      passwordHash: hashPassword(password, key),
      totalScore: DEFAULT_SALDO,
      bestScore: DEFAULT_SALDO,
      settings: defaultSettings(),
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };

    users[key] = newUser;
    saveUsersLocal(users);
    if (db) {
      try {
        await db.ref(`${DB_ROOT}/${key}`).set(newUser);
      } catch {}
    }
    setSessionKey(key);
    currentUserCache = formatUserObj(newUser);
    return { ok: true, user: currentUserCache };
  }

  async function login(usernameRaw, password) {
    const username = (usernameRaw || '').trim();
    if (!username || !password) {
      return { ok: false, error: 'Masukkan username dan password.' };
    }
    const key = username.toLowerCase();
    const users = loadUsersLocal();
    let user = users[key];

    if (db) {
      try {
        const snap = await db.ref(`${DB_ROOT}/${key}`).once('value');
        if (snap.exists()) {
          user = snap.val();
          users[key] = user;
          saveUsersLocal(users);
        }
      } catch {}
    }

    if (!user || user.passwordHash !== hashPassword(password, key)) {
      return { ok: false, error: 'Username atau password salah.' };
    }
    if (user.role !== 'admin' && user.settings && user.settings.suspended) {
      return { ok: false, error: 'Akun ini sedang dinonaktifkan oleh Admin.' };
    }
    setSessionKey(key);
    currentUserCache = formatUserObj(user);
    return { ok: true, user: currentUserCache };
  }

  function unsubscribeAll() {
    if (userRefListener && db) {
      userRefListener.ref.off('value', userRefListener.fn);
      userRefListener = null;
    }
    if (allUsersListener && db) {
      allUsersListener.ref.off('value', allUsersListener.fn);
      allUsersListener = null;
    }
  }

  function logout() {
    unsubscribeAll();
    currentUserCache = null;
    setSessionKey(null);
  }

  function saveProgress(totalScore, bestScore) {
    const key = getSessionKey();
    if (!key || key === 'admin') return;
    const users = loadUsersLocal();
    if (!users[key]) return;
    users[key].totalScore = totalScore;
    users[key].bestScore = bestScore;
    users[key].lastActiveAt = Date.now();
    saveUsersLocal(users);
    if (currentUserCache) {
      currentUserCache.totalScore = totalScore;
      currentUserCache.bestScore = bestScore;
    }
    if (db) {
      db.ref(`${DB_ROOT}/${key}`).update({
        totalScore,
        bestScore,
        lastActiveAt: Date.now()
      }).catch(() => {});
    }
  }

  function subscribeCurrentUser(callback) {
    if (!db) return;
    const key = getSessionKey();
    if (!key || key === 'admin') return;
    if (userRefListener) {
      userRefListener.ref.off('value', userRefListener.fn);
    }
    const ref = db.ref(`${DB_ROOT}/${key}`);
    const fn = (snap) => {
      if (!snap.exists()) return;
      const raw = snap.val();
      const users = loadUsersLocal();
      users[key] = raw;
      saveUsersLocal(users);
      currentUserCache = formatUserObj(raw);
      callback(currentUserCache);
    };
    ref.on('value', fn);
    userRefListener = { ref, fn };
  }

  function listPlayers() {
    const users = loadUsersLocal();
    return Object.values(users)
      .filter((u) => u && u.role !== 'admin')
      .map(formatUserObj)
      .sort((a, b) => a.username.localeCompare(b.username));
  }

  function subscribeAllPlayers(callback) {
    callback(listPlayers());
    if (!db) return;
    if (allUsersListener) {
      allUsersListener.ref.off('value', allUsersListener.fn);
    }
    const ref = db.ref(DB_ROOT);
    const fn = (snap) => {
      const val = snap.val() || {};
      const localUsers = loadUsersLocal();
      const merged = ensureAdminSeed({ ...localUsers, ...val });
      saveUsersLocal(merged);
      const list = Object.values(merged)
        .filter((u) => u && u.role !== 'admin')
        .map(formatUserObj)
        .sort((a, b) => a.username.localeCompare(b.username));
      callback(list);
    };
    ref.on('value', fn);
    allUsersListener = { ref, fn };
  }

  async function updatePlayerConfig(username, patch) {
    if (!isAdmin()) return { ok: false, error: 'Akses ditolak.' };
    const key = (username || '').toLowerCase();
    const users = loadUsersLocal();
    if (!users[key] || users[key].role === 'admin') {
      return { ok: false, error: 'User tidak ditemukan.' };
    }
    if (typeof patch.totalScore === 'number' && !Number.isNaN(patch.totalScore)) {
      users[key].totalScore = Math.max(0, Math.round(patch.totalScore));
    }
    if (patch.settings) {
      users[key].settings = {
        ...defaultSettings(),
        ...(users[key].settings || {}),
        ...patch.settings
      };
    }
    users[key].updatedAt = Date.now();
    saveUsersLocal(users);

    if (db) {
      try {
        await db.ref(`${DB_ROOT}/${key}`).update({
          totalScore: users[key].totalScore,
          settings: users[key].settings,
          updatedAt: users[key].updatedAt
        });
      } catch {}
    }
    return { ok: true, player: formatUserObj(users[key]) };
  }

  function consumePlayerTrigger(username, fields) {
    const key = (username || '').toLowerCase();
    const users = loadUsersLocal();
    if (!users[key]) return;
    users[key].settings = {
      ...defaultSettings(),
      ...(users[key].settings || {}),
      ...fields
    };
    saveUsersLocal(users);
    if (currentUserCache && currentUserCache.username.toLowerCase() === key) {
      currentUserCache.settings = { ...users[key].settings };
    }
    if (db) {
      db.ref(`${DB_ROOT}/${key}/settings`).update(fields).catch(() => {});
    }
  }

  async function deletePlayer(username) {
    if (!isAdmin()) return { ok: false, error: 'Akses ditolak.' };
    const key = (username || '').toLowerCase();
    const users = loadUsersLocal();
    if (!users[key] || users[key].role === 'admin') {
      return { ok: false, error: 'User tidak ditemukan.' };
    }
    delete users[key];
    saveUsersLocal(users);
    if (db) {
      try {
        await db.ref(`${DB_ROOT}/${key}`).remove();
      } catch {}
    }
    return { ok: true };
  }

  return {
    init,
    getCurrentUser,
    isAdmin,
    isFirebaseConnected,
    subscribeConnection,
    register,
    login,
    logout,
    saveProgress,
    subscribeCurrentUser,
    listPlayers,
    subscribeAllPlayers,
    updatePlayerConfig,
    consumePlayerTrigger,
    deletePlayer
  };
})();
