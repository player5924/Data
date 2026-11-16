window.MG = window.MG || {};

MG.Game = (() => {
  const BET_OPTIONS = [500, 1000, 2000, 5000, 10000, 20000];
  let betIdx = 1; // default Rp 1.000

  const state = {
    totalScore: 100000,
    lastWin: 0,
    pecahanTotal: 0,
    lossSpinCount: 0,
    lossCeiling: null,
    adminScatterTarget: 0,
    comboCounter: 0,
    cascadeCounter: 0,
    multiplier: 1,
    isBusy: false,
    isTurbo: false,
    isBonusMode: false,
    bonusSpinsLeft: 0,
    bonusScoreAccum: 0,
    bonusTarget: 25000,
    autoSpinsLeft: 0,
    isAutoSpinning: false
  };

  const els = {};

  function cacheElements() {
    els.grid = document.getElementById('mahjongGrid');
    els.gridWrapper = document.getElementById('gridWrapper');
    els.fxCanvas = document.getElementById('fxCanvas');
    els.winBanner = document.getElementById('winBanner');
    els.winBannerText = document.getElementById('winBannerText');
    els.totalScore = document.getElementById('totalScore');
    els.lastWin = document.getElementById('lastWin');
    els.bestScore = document.getElementById('bestScore');
    els.pecahanLabel = document.getElementById('pecahanLabel');
    els.comboCounter = document.getElementById('comboCounter');
    els.cascadeCounter = document.getElementById('cascadeCounter');
    els.activeMultiplier = document.getElementById('activeMultiplier');
    els.multiplierBar = document.getElementById('multiplierBar');
    els.spinCost = document.getElementById('spinCost');
    els.btnSpin = document.getElementById('btnSpin');
    els.btnBetUp = document.getElementById('btnBetUp');
    els.btnBetDown = document.getElementById('btnBetDown');
    els.btnAutoSpin = document.getElementById('btnAutoSpin');
    els.autoSpinLabel = document.getElementById('autoSpinLabel');
    els.autoSpinMenu = document.getElementById('autoSpinMenu');
    els.btnSound = document.getElementById('btnSound');
    els.btnSpeed = document.getElementById('btnSpeed');
    els.authScreen = document.getElementById('authScreen');
    els.lobbyScreen = document.getElementById('lobbyScreen');
    els.gameScreen = document.getElementById('gameScreen');
    els.screenTabLogin = document.getElementById('screenTabLogin');
    els.screenTabRegister = document.getElementById('screenTabRegister');
    els.screenLoginForm = document.getElementById('screenLoginForm');
    els.screenRegisterForm = document.getElementById('screenRegisterForm');
    els.authScreenFeedback = document.getElementById('authScreenFeedback');
    els.screenLoginUsername = document.getElementById('screenLoginUsername');
    els.screenLoginPassword = document.getElementById('screenLoginPassword');
    els.screenRegUsername = document.getElementById('screenRegUsername');
    els.screenRegPassword = document.getElementById('screenRegPassword');
    els.screenRegConfirm = document.getElementById('screenRegConfirm');
    els.lobbyUsername = document.getElementById('lobbyUsername');
    els.lobbySaldo = document.getElementById('lobbySaldo');
    els.btnLobbyLogout = document.getElementById('btnLobbyLogout');
    els.gameCatalogGrid = document.getElementById('gameCatalogGrid');
    els.adminScreen = document.getElementById('adminScreen');
    els.adminFbStatus = document.getElementById('adminFbStatus');
    els.btnAdminLogout = document.getElementById('btnAdminLogout');
    els.adminTotalPlayers = document.getElementById('adminTotalPlayers');
    els.adminTotalSaldo = document.getElementById('adminTotalSaldo');
    els.adminSelectedName = document.getElementById('adminSelectedName');
    els.adminUserSelect = document.getElementById('adminUserSelect');
    els.adminEmptyState = document.getElementById('adminEmptyState');
    els.adminControlCard = document.getElementById('adminControlCard');
    els.adminFeedback = document.getElementById('adminFeedback');
    els.adminSaldoInput = document.getElementById('adminSaldoInput');
    els.adminPlayMode = document.getElementById('adminPlayMode');
    els.adminMultMode = document.getElementById('adminMultMode');
    els.adminScatterDelay = document.getElementById('adminScatterDelay');
    els.adminScatterCount = document.getElementById('adminScatterCount');
    els.adminScatterTarget = document.getElementById('adminScatterTarget');
    els.btnAdminAdd50k = document.getElementById('btnAdminAdd50k');
    els.btnAdminAdd100k = document.getElementById('btnAdminAdd100k');
    els.btnAdminReset100k = document.getElementById('btnAdminReset100k');
    els.adminSuspended = document.getElementById('adminSuspended');
    els.btnAdminSave = document.getElementById('btnAdminSave');
    els.btnAdminDeleteUser = document.getElementById('btnAdminDeleteUser');
    els.btnBackToMenu = document.getElementById('btnBackToMenu');
    els.btnAccount = document.getElementById('btnAccount');
    els.accountBtnLabel = document.getElementById('accountBtnLabel');
    els.authModal = document.getElementById('authModal');
    els.btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
    els.authGuestView = document.getElementById('authGuestView');
    els.authProfileView = document.getElementById('authProfileView');
    els.tabLogin = document.getElementById('tabLogin');
    els.tabRegister = document.getElementById('tabRegister');
    els.loginForm = document.getElementById('loginForm');
    els.registerForm = document.getElementById('registerForm');
    els.authFeedback = document.getElementById('authFeedback');
    els.loginUsername = document.getElementById('loginUsername');
    els.loginPassword = document.getElementById('loginPassword');
    els.regUsername = document.getElementById('regUsername');
    els.regPassword = document.getElementById('regPassword');
    els.regConfirm = document.getElementById('regConfirm');
    els.profileUsername = document.getElementById('profileUsername');
    els.profileSaldo = document.getElementById('profileSaldo');
    els.profileBest = document.getElementById('profileBest');
    els.btnLogout = document.getElementById('btnLogout');
    els.btnPaytable = document.getElementById('btnPaytable');
    els.paytableModal = document.getElementById('paytableModal');
    els.btnCloseModal = document.getElementById('btnCloseModal');
    els.paytableGrid = document.getElementById('paytableGrid');
    els.bonusBanner = document.getElementById('bonusBanner');
    els.bonusSpinsLeft = document.getElementById('bonusSpinsLeft');
    els.bonusProgress = document.getElementById('bonusProgress');
    els.bonusTarget = document.getElementById('bonusTarget');
    els.bonusOverlay = document.getElementById('bonusOverlay');
    els.bonusOverlayTitle = document.getElementById('bonusOverlayTitle');
    els.bonusOverlayDesc = document.getElementById('bonusOverlayDesc');
    els.btnStartBonus = document.getElementById('btnStartBonus');
  }

  function loadBestScore() {}
  function saveBestScore() {}

  function getUserSettings() {
    const u = MG.Auth ? MG.Auth.getCurrentUser() : null;
    return (u && u.settings) ? u.settings : { playMode: 'normal', multMode: 'normal', scatterDelaySpins: 0, scatterTierCount: 3, scatterTargetPayout: 0, suspended: false };
  }

  function updateMultiplierBar(stepIdx = 0) {
    const baseSteps = state.isBonusMode ? MG.Cascade.BONUS_MULT_STEPS : MG.Cascade.NORMAL_MULT_STEPS;
    const isBoost = getUserSettings().multMode === 'boost';
    const steps = isBoost ? baseSteps.map((v) => v * 2) : baseSteps;
    const pills = els.multiplierBar.querySelectorAll('.mult-pill');
    pills.forEach((pill, i) => {
      pill.textContent = `X${steps[i]}`;
      pill.dataset.val = String(steps[i]);
      pill.classList.toggle('active', i === stepIdx);
    });
    state.multiplier = steps[stepIdx] || steps[0];
    els.activeMultiplier.textContent = `X${state.multiplier}`;
  }

  // Daftar game di Menu Lobby (tambahkan objek game baru di sini nanti)
  const GAME_CATALOG = [
    {
      id: 'mahjong-gold',
      title: 'Mahjong Gold',
      desc: '1024 Ways • Cascade & Gold Wild • Free Spin Scatter',
      icon: '發',
      available: true
    },
    {
      id: 'slot-lain-1',
      title: 'Slot Game #2',
      desc: 'Slot kosong siap diisi game baru Anda berikutnya.',
      icon: '🎲',
      available: false
    },
    {
      id: 'slot-lain-2',
      title: 'Slot Game #3',
      desc: 'Slot kosong siap diisi game baru Anda berikutnya.',
      icon: '🃏',
      available: false
    }
  ];

  function renderLobbyCatalog() {
    if (!els.gameCatalogGrid) return;
    els.gameCatalogGrid.innerHTML = '';
    for (const game of GAME_CATALOG) {
      const card = document.createElement('div');
      card.className = `game-card ${game.available ? 'is-available' : 'is-soon'}`;
      card.innerHTML = `
        <div>
          <div class="game-card-top">
            <div class="game-card-icon" aria-hidden="true">${game.icon}</div>
            <span class="game-badge">${game.available ? 'TERSEDIA' : 'SEGERA HADIR'}</span>
          </div>
          <h3>${game.title}</h3>
          <p>${game.desc}</p>
        </div>
        <button class="game-play-btn" type="button" ${game.available ? '' : 'disabled'}>${game.available ? 'MAINKAN' : 'SEGERA HADIR'}</button>
      `;
      if (game.available) {
        const launch = () => {
          if (game.id === 'mahjong-gold') {
            showScreen('game');
          }
        };
        card.addEventListener('click', launch);
      }
      els.gameCatalogGrid.appendChild(card);
    }
  }

  let adminSelectedUsername = null;
  let adminDeleteArmed = false;

  function loadSelectedPlayerIntoAdminForm(players) {
    const target = players.find((p) => p.username === adminSelectedUsername) || players[0] || null;
    adminSelectedUsername = target ? target.username : null;
    adminDeleteArmed = false;
    if (els.btnAdminDeleteUser) {
      els.btnAdminDeleteUser.classList.remove('is-confirm');
      els.btnAdminDeleteUser.textContent = 'Hapus Akun';
    }
    if (!target) {
      if (els.adminSelectedName) els.adminSelectedName.textContent = '-';
      if (els.adminControlCard) els.adminControlCard.classList.add('hidden');
      if (els.adminEmptyState) els.adminEmptyState.classList.remove('hidden');
      return;
    }
    if (els.adminEmptyState) els.adminEmptyState.classList.add('hidden');
    if (els.adminControlCard) els.adminControlCard.classList.remove('hidden');
    if (els.adminSelectedName) els.adminSelectedName.textContent = target.username;
    if (els.adminUserSelect) els.adminUserSelect.value = target.username;
    els.adminSaldoInput.value = String(target.totalScore);
    els.adminPlayMode.value = target.settings.playMode || 'normal';
    els.adminMultMode.value = target.settings.multMode || 'normal';
    els.adminScatterDelay.value = String(target.settings.scatterDelaySpins || 0);
    els.adminScatterCount.value = String(target.settings.scatterTierCount || 3);
    els.adminScatterTarget.value = String(target.settings.scatterTargetPayout || 0);
    els.adminSuspended.checked = Boolean(target.settings.suspended);
  }

  function attachPlayerRealtimeSync() {
    if (!MG.Auth || !MG.Auth.subscribeCurrentUser) return;
    MG.Auth.subscribeCurrentUser((updatedUser) => {
      if (!updatedUser) return;
      if (updatedUser.settings && updatedUser.settings.suspended) {
        MG.Auth.logout();
        switchScreenAuthTab('login');
        showScreen('auth');
        if (els.authScreenFeedback) {
          els.authScreenFeedback.textContent = 'Akun Anda dinonaktifkan oleh Admin.';
          els.authScreenFeedback.classList.remove('is-success');
          els.authScreenFeedback.classList.remove('hidden');
        }
        return;
      }
      if (!state.isBusy && !state.isBonusMode && typeof updatedUser.totalScore === 'number') {
        state.totalScore = updatedUser.totalScore;
        state.bestScore = Math.max(state.bestScore, updatedUser.bestScore || updatedUser.totalScore);
        if (els.lobbySaldo) els.lobbySaldo.textContent = formatRp(state.totalScore);
        renderHUD();
      }
      updateMultiplierBar(0);
    });
  }

  function renderAdminPlayersList(players) {
    const totalSaldo = players.reduce((sum, p) => sum + (p.totalScore || 0), 0);
    if (els.adminTotalPlayers) els.adminTotalPlayers.textContent = String(players.length);
    if (els.adminTotalSaldo) els.adminTotalSaldo.textContent = formatRp(totalSaldo);

    if (els.adminUserSelect) {
      els.adminUserSelect.innerHTML = '';
      for (const p of players) {
        const opt = document.createElement('option');
        opt.value = p.username;
        opt.textContent = `${p.username} (${formatRp(p.totalScore)} • ${(p.settings.playMode || 'normal').toUpperCase()})`;
        els.adminUserSelect.appendChild(opt);
      }
    }
    loadSelectedPlayerIntoAdminForm(players);
  }

  function renderAdminDashboard() {
    if (!MG.Auth) return;
    if (MG.Auth.subscribeAllPlayers) {
      MG.Auth.subscribeAllPlayers((players) => {
        renderAdminPlayersList(players);
      });
      return;
    }
    const players = MG.Auth.listPlayers();
    renderAdminPlayersList(players);
  }

  function showScreen(screenName) {
    if (els.authScreen) els.authScreen.classList.toggle('hidden', screenName !== 'auth');
    if (els.lobbyScreen) els.lobbyScreen.classList.toggle('hidden', screenName !== 'lobby');
    if (els.adminScreen) els.adminScreen.classList.toggle('hidden', screenName !== 'admin');
    if (els.gameScreen) els.gameScreen.classList.toggle('hidden', screenName !== 'game');

    if (screenName === 'lobby') {
      const user = MG.Auth ? MG.Auth.getCurrentUser() : null;
      if (els.lobbyUsername) els.lobbyUsername.textContent = user ? user.username : '-';
      if (els.lobbySaldo) els.lobbySaldo.textContent = formatRp(state.totalScore);
      renderLobbyCatalog();
    } else if (screenName === 'admin') {
      if (els.adminFeedback) els.adminFeedback.classList.add('hidden');
      renderAdminDashboard();
    }
  }

  function formatRp(amount) {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  }

  function renderHUD() {
    els.totalScore.textContent = formatRp(state.totalScore);
    els.lastWin.textContent = formatRp(state.lastWin);
    if (els.pecahanLabel) {
      els.pecahanLabel.textContent = state.isBonusMode ? 'HASIL SCATTER' : 'PECAHAN';
    }
    els.bestScore.textContent = formatRp(state.isBonusMode ? state.bonusScoreAccum : state.pecahanTotal);
    els.comboCounter.textContent = String(state.comboCounter);
    els.cascadeCounter.textContent = String(state.cascadeCounter);
    els.spinCost.textContent = formatRp(BET_OPTIONS[betIdx]);

    els.btnSpin.disabled = state.isBusy || state.isBonusMode || state.isAutoSpinning;
    const spinTextEl = els.btnSpin.querySelector('.spin-text');
    if (spinTextEl) {
      if (state.isBonusMode) {
        spinTextEl.textContent = `FREE (${state.bonusSpinsLeft})`;
      } else if (state.isAutoSpinning) {
        spinTextEl.textContent = `AUTO (${state.autoSpinsLeft})`;
      } else {
        spinTextEl.textContent = 'SPIN';
      }
    }
    els.btnBetUp.disabled = state.isBusy || state.isBonusMode || state.isAutoSpinning;
    els.btnBetDown.disabled = state.isBusy || state.isBonusMode || state.isAutoSpinning;

    if (els.btnAutoSpin) {
      els.btnAutoSpin.disabled = state.isBonusMode;
      els.btnAutoSpin.classList.toggle('is-active', state.isAutoSpinning);
      els.autoSpinLabel.textContent = state.isAutoSpinning
        ? `STOP (${state.autoSpinsLeft})`
        : 'AUTO SPIN';
    }

    if (state.isBonusMode) {
      els.bonusBanner.classList.remove('hidden');
      els.bonusSpinsLeft.textContent = String(state.bonusSpinsLeft);
      els.bonusProgress.textContent = formatRp(state.bonusScoreAccum);
      els.bonusTarget.textContent = formatRp(state.bonusTarget);
    } else {
      els.bonusBanner.classList.add('hidden');
    }

    const user = MG.Auth ? MG.Auth.getCurrentUser() : null;
    if (els.btnAccount && els.accountBtnLabel) {
      els.btnAccount.classList.toggle('is-logged-in', !!user);
      els.accountBtnLabel.textContent = user ? user.username : 'Masuk';
    }
    if (user && MG.Auth) {
      MG.Auth.saveProgress(state.totalScore, state.bestScore);
    }
  }

  function populatePaytable() {
    if (!els.paytableGrid) return;
    els.paytableGrid.innerHTML = '';
    for (const sym of MG.Symbols.getPaytableList()) {
      const card = document.createElement('div');
      card.className = 'pay-item';
      const img = document.createElement('img');
      img.src = sym.src;
      img.alt = sym.name;

      const meta = document.createElement('div');
      meta.className = 'pay-meta';
      if (sym.type === 'wild') {
        meta.innerHTML = `<strong>${sym.name}</strong>Menggantikan semua simbol reguler.`;
      } else if (sym.type === 'scatter') {
        meta.innerHTML = `<strong>${sym.name}</strong>3=12, 4=14, 5=16, 6=18 Free Spin Otomatis.`;
      } else {
        const factor = BET_OPTIONS[betIdx] / 1000;
        const p3 = formatRp(sym.pay[3] * factor);
        const p4 = formatRp(sym.pay[4] * factor);
        const p5 = formatRp(sym.pay[5] * factor);
        meta.innerHTML = `<strong>${sym.name}</strong>3 Kol: ${p3}<br>4 Kol: ${p4} • 5 Kol: ${p5}`;
      }
      card.appendChild(img);
      card.appendChild(meta);
      els.paytableGrid.appendChild(card);
    }
  }

  async function handleSpin(isAutoBonus = false) {
    if (state.isBusy) return;
    if (state.isBonusMode && !isAutoBonus) return;
    const spinCost = BET_OPTIONS[betIdx];

    if (!state.isBonusMode) {
      if (state.totalScore < spinCost) {
        els.winBannerText.textContent = 'Saldo tidak cukup!';
        els.winBanner.classList.remove('hidden');
        setTimeout(() => els.winBanner.classList.add('hidden'), 1500);
        return;
      }
      state.totalScore -= spinCost;
    } else {
      state.bonusSpinsLeft = Math.max(0, state.bonusSpinsLeft - 1);
    }

    state.isBusy = true;
    state.lastWin = 0;
    state.comboCounter = 0;
    state.cascadeCounter = 0;
    if (!state.isBonusMode) {
      state.pecahanTotal = 0;
    }
    updateMultiplierBar(0);
    renderHUD();

    MG.Audio.playSpinStart();
    const userCfg = getUserSettings();
    const curUser = MG.Auth ? MG.Auth.getCurrentUser() : null;
    const playMode = userCfg.playMode || 'normal';

    // Inisialisasi batas atas saldo pada mode Loss (Tarik Ulur)
    if (playMode === 'loss') {
      if (state.lossCeiling === null) state.lossCeiling = state.totalScore + spinCost;
    } else {
      state.lossCeiling = null;
      state.lossSpinCount = 0;
    }

    // Hitung mundur Scatter Pending (muncul setelah N spin normal)
    let forceScatterCount = 0;
    if (!state.isBonusMode && userCfg.scatterDelaySpins > 0 && curUser) {
      const nextDelay = userCfg.scatterDelaySpins - 1;
      MG.Auth.consumePlayerTrigger(curUser.username, { scatterDelaySpins: nextDelay });
      if (nextDelay === 0) {
        forceScatterCount = userCfg.scatterTierCount || 3;
        state.adminScatterTarget = userCfg.scatterTargetPayout || 0;
        MG.Auth.consumePlayerTrigger(curUser.username, { scatterTargetPayout: 0 });
      }
    }

    // Tarik Ulur pada mode Loss: tiap 4 spin beri 1 kemenangan kecil, sisanya turun bertahap
    let lossAllowSmallWin = false;
    if (!state.isBonusMode && playMode === 'loss' && forceScatterCount === 0) {
      state.lossSpinCount += 1;
      lossAllowSmallWin = (state.lossSpinCount % 4 === 0);
    }

    const effectivePlayMode = state.isBonusMode && state.adminScatterTarget > 0
      ? 'win'
      : playMode;

    await MG.Grid.spinWithReelAnimation(state.isTurbo, {
      playMode: effectivePlayMode,
      lossAllowSmallWin,
      forceScatterCount
    });
    MG.Audio.playTileDrop();

    const saldoBeforeCascade = state.totalScore;
    const bonusBeforeSpin = state.bonusScoreAccum;

    // Jalankan Cascade & Gold-to-WILD
    const cascadeResult = await MG.Cascade.runCascadeSequence({
      spinCost,
      isBonusMode: state.isBonusMode,
      onMultiplierChange: (multInfo) => {
        if (multInfo.stepIdx > 0) MG.Audio.playMultiplierUp();
        updateMultiplierBar(multInfo.stepIdx);
        renderHUD();
      },
      onStepWin: (info) => {
        state.comboCounter += info.wins.length;
        state.cascadeCounter = info.cascadeNum;
        state.lastWin = info.stepWin;
        if (state.isBonusMode) {
          state.bonusScoreAccum += info.stepWin;
          state.pecahanTotal = state.bonusScoreAccum;
        } else {
          state.pecahanTotal += info.stepWin;
          state.totalScore += info.stepWin;
        }
        renderHUD();
      }
    });

    // Penyesuaian Mode Loss (Tarik Ulur): saldo tidak boleh naik melebihi batas atas
    if (!state.isBonusMode && playMode === 'loss' && forceScatterCount === 0 && state.lossCeiling !== null) {
      const maxAllowedTotal = Math.max(0, state.lossCeiling - spinCost);
      const rawSpinWin = state.totalScore - saldoBeforeCascade;
      if (state.totalScore > maxAllowedTotal || rawSpinWin > Math.floor(spinCost * 0.85)) {
        const cappedWin = lossAllowSmallWin
          ? Math.min(Math.floor(spinCost * (0.35 + Math.random() * 0.45)), Math.max(0, maxAllowedTotal - saldoBeforeCascade))
          : 0;
        state.totalScore = saldoBeforeCascade + cappedWin;
        state.pecahanTotal = cappedWin;
        state.lastWin = cappedWin;
      }
      state.lossCeiling = Math.min(state.lossCeiling, state.totalScore + spinCost);
    }

    // Penyesuaian Target Hasil Scatter Admin: dibagi bertahap sampai spin Scatter habis
    if (state.isBonusMode && state.adminScatterTarget > 0) {
      const remainingTarget = Math.max(0, state.adminScatterTarget - bonusBeforeSpin);
      const spinsLeftIncl = state.bonusSpinsLeft + 1;
      let targetThisSpin;
      if (spinsLeftIncl <= 1) {
        targetThisSpin = remainingTarget;
      } else {
        const avgSlice = remainingTarget / spinsLeftIncl;
        targetThisSpin = Math.random() < 0.22
          ? Math.round(avgSlice * 0.15)
          : Math.round(avgSlice * (0.6 + Math.random() * 0.65));
        targetThisSpin = Math.max(0, Math.min(remainingTarget, targetThisSpin));
      }
      state.bonusScoreAccum = bonusBeforeSpin + targetThisSpin;
      state.pecahanTotal = state.bonusScoreAccum;
      state.lastWin = targetThisSpin;
    }

    // Cek SCATTER setelah seluruh cascade selesai
    const scatterCheck = MG.WinSystem.countScatters(MG.Grid.getMatrix());
    let triggeredNewBonus = false;
    if (scatterCheck.count >= 3) {
      if (!state.isBonusMode) {
        triggeredNewBonus = true;
        triggerScatterBonus(scatterCheck.count);
      } else {
        // Retrigger selama mode bonus: tambah 12 free spin otomatis
        state.bonusSpinsLeft += getScatterFreeSpins(scatterCheck.count);
        MG.Audio.playScatterBonus();
      }
    }

    state.isBusy = false;
    renderHUD();

    if (triggeredNewBonus) {
      startBonusAutoLoop();
    } else if (state.isBonusMode && state.bonusSpinsLeft === 0) {
      finishBonusMode();
    }
    return {
      hadWin: !!(cascadeResult && cascadeResult.totalSpinWin > 0),
      triggeredNewBonus
    };
  }

  function getScatterFreeSpins(scatterCount) {
    return 12 + Math.max(0, scatterCount - 3) * 2;
  }

  function triggerScatterBonus(scatterCount) {
    MG.Audio.playScatterBonus();
    state.isBonusMode = true;
    MG.Symbols.setBonusMode(true);
    state.bonusSpinsLeft = getScatterFreeSpins(scatterCount);
    state.bonusScoreAccum = 0;
    state.bonusTarget = BET_OPTIONS[betIdx] * 25;

    els.bonusOverlayTitle.textContent = 'FESTIVAL BONUS AKTIF!';
    els.bonusOverlayDesc.textContent = `${scatterCount} SCATTER terkumpul! ${state.bonusSpinsLeft} Free Spin berjalan OTOMATIS dengan pengali ganda (X2–X10). Capai target ${formatRp(state.bonusTarget)} untuk hadiah tantangan +Rp 30.000!`;
    els.btnStartBonus.classList.add('hidden');
    els.bonusOverlay.classList.remove('hidden');
    updateMultiplierBar(0);
    renderHUD();
  }

  async function startBonusAutoLoop() {
    await MG.Animation.wait(MG.Animation.duration(1800));
    els.bonusOverlay.classList.add('hidden');
    els.btnStartBonus.classList.remove('hidden');

    while (state.isBonusMode && state.bonusSpinsLeft > 0) {
      const spinRes = await handleSpin(true);
      if (state.isBonusMode && state.bonusSpinsLeft > 0 && spinRes && spinRes.hadWin) {
        await MG.Animation.wait(MG.Animation.duration(400));
      }
    }
  }

  function finishBonusMode() {
    const hasAdminTarget = state.adminScatterTarget > 0;
    const cleared = !hasAdminTarget && state.bonusScoreAccum >= state.bonusTarget;
    const reward = cleared ? 30000 : 0;
    const totalScatterPayout = hasAdminTarget ? state.adminScatterTarget : (state.bonusScoreAccum + reward);
    state.adminScatterTarget = 0;

    // Saldo dari Scatter baru masuk ke Saldo utama setelah Scatter selesai
    state.totalScore += totalScatterPayout;
    state.pecahanTotal = totalScatterPayout;
    if (cleared) {
      MG.Audio.playScatterBonus();
    }

    els.bonusOverlayTitle.textContent = cleared ? 'TANTANGAN BONUS TERCAPAI!' : 'BONUS FESTIVAL SELESAI';
    els.bonusOverlayDesc.textContent = cleared
      ? `Luar biasa! Total hasil Scatter ${formatRp(state.bonusScoreAccum)} + hadiah tantangan Rp 30.000 = ${formatRp(totalScatterPayout)} telah masuk ke Saldo!`
      : `Total hasil Scatter ${formatRp(totalScatterPayout)} telah masuk ke Saldo! Kumpulkan 3+ SCATTER lagi untuk tantangan berikutnya.`;
    els.btnStartBonus.textContent = 'LANJUTKAN';
    els.btnStartBonus.classList.remove('hidden');
    els.bonusOverlay.classList.remove('hidden');

    state.isBonusMode = false;
    MG.Symbols.setBonusMode(false);
    updateMultiplierBar(0);
    renderHUD();
  }

  function bindEvents() {
    els.btnSpin.addEventListener('click', () => handleSpin(false));
    els.btnBetUp.addEventListener('click', () => {
      if (state.isBusy || state.isBonusMode) return;
      betIdx = Math.min(BET_OPTIONS.length - 1, betIdx + 1);
      populatePaytable();
      renderHUD();
    });
    els.btnBetDown.addEventListener('click', () => {
      if (state.isBusy || state.isBonusMode) return;
      betIdx = Math.max(0, betIdx - 1);
      populatePaytable();
      renderHUD();
    });
    async function startAutoSpin(count) {
      if (state.isBonusMode || state.isAutoSpinning) return;
      els.autoSpinMenu.classList.add('hidden');
      const spinCost = BET_OPTIONS[betIdx];
      if (state.totalScore < spinCost) {
        els.winBannerText.textContent = 'Saldo tidak cukup!';
        els.winBanner.classList.remove('hidden');
        setTimeout(() => els.winBanner.classList.add('hidden'), 1400);
        return;
      }
      state.autoSpinsLeft = count;
      state.isAutoSpinning = true;
      renderHUD();

      while (state.isAutoSpinning && state.autoSpinsLeft > 0) {
        if (state.isBonusMode) {
          await MG.Animation.wait(300);
          continue;
        }
        const costNow = BET_OPTIONS[betIdx];
        if (state.totalScore < costNow) {
          state.isAutoSpinning = false;
          state.autoSpinsLeft = 0;
          els.winBannerText.textContent = 'Saldo habis — Auto Spin berhenti';
          els.winBanner.classList.remove('hidden');
          setTimeout(() => els.winBanner.classList.add('hidden'), 1500);
          break;
        }
        state.autoSpinsLeft -= 1;
        renderHUD();
        const spinRes = await handleSpin(false);
        if (state.isAutoSpinning && state.autoSpinsLeft > 0 && !state.isBonusMode && spinRes && spinRes.hadWin) {
          await MG.Animation.wait(MG.Animation.duration(350));
        }
      }

      state.isAutoSpinning = false;
      state.autoSpinsLeft = 0;
      renderHUD();
    }

    els.btnAutoSpin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.isBonusMode) return;
      if (state.isAutoSpinning) {
        state.isAutoSpinning = false;
        state.autoSpinsLeft = 0;
        renderHUD();
        return;
      }
      els.autoSpinMenu.classList.toggle('hidden');
    });

    els.autoSpinMenu.querySelectorAll('.auto-opt').forEach((optBtn) => {
      optBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const count = parseInt(optBtn.dataset.count, 10);
        if (count > 0) startAutoSpin(count);
      });
    });

    document.addEventListener('click', (e) => {
      if (!els.autoSpinMenu.classList.contains('hidden') && !e.target.closest('.auto-spin-wrap')) {
        els.autoSpinMenu.classList.add('hidden');
      }
    });
    els.btnSound.addEventListener('click', () => {
      const next = !MG.Audio.isMuted();
      MG.Audio.setMuted(next);
      els.btnSound.textContent = next ? '🔇' : '🔊';
    });
    els.btnSpeed.addEventListener('click', () => {
      state.isTurbo = !state.isTurbo;
      MG.Animation.setTurbo(state.isTurbo);
      els.btnSpeed.classList.toggle('turbo-on', state.isTurbo);
      els.btnSpeed.setAttribute('aria-pressed', state.isTurbo ? 'true' : 'false');
    });
    function showScreenAuthFeedback(msg) {
      els.authScreenFeedback.textContent = msg;
      els.authScreenFeedback.classList.remove('hidden');
    }

    function switchScreenAuthTab(mode) {
      els.authScreenFeedback.classList.add('hidden');
      const isLogin = mode === 'login';
      els.screenTabLogin.classList.toggle('active', isLogin);
      els.screenTabLogin.setAttribute('aria-selected', String(isLogin));
      els.screenTabRegister.classList.toggle('active', !isLogin);
      els.screenTabRegister.setAttribute('aria-selected', String(!isLogin));
      els.screenLoginForm.classList.toggle('hidden', !isLogin);
      els.screenRegisterForm.classList.toggle('hidden', isLogin);
    }

    els.screenTabLogin.addEventListener('click', () => switchScreenAuthTab('login'));
    els.screenTabRegister.addEventListener('click', () => switchScreenAuthTab('register'));

    els.screenLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await MG.Auth.login(els.screenLoginUsername.value, els.screenLoginPassword.value);
      if (!res.ok) {
        showScreenAuthFeedback(res.error);
        return;
      }
      els.screenLoginForm.reset();
      els.authScreenFeedback.classList.add('hidden');
      if (res.user.role === 'admin') {
        showScreen('admin');
        return;
      }
      state.totalScore = res.user.totalScore;
      state.bestScore = Math.max(res.user.bestScore, res.user.totalScore);
      attachPlayerRealtimeSync();
      renderHUD();
      showScreen('lobby');
    });

    els.screenRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await MG.Auth.register(
        els.screenRegUsername.value,
        els.screenRegPassword.value,
        els.screenRegConfirm.value
      );
      if (!res.ok) {
        showScreenAuthFeedback(res.error);
        return;
      }
      state.totalScore = res.user.totalScore;
      state.bestScore = res.user.bestScore;
      els.screenRegisterForm.reset();
      els.authScreenFeedback.classList.add('hidden');
      attachPlayerRealtimeSync();
      renderHUD();
      showScreen('lobby');
    });

    els.btnAdminLogout.addEventListener('click', () => {
      MG.Auth.logout();
      switchScreenAuthTab('login');
      showScreen('auth');
    });

    els.adminUserSelect.addEventListener('change', () => {
      adminSelectedUsername = els.adminUserSelect.value;
      if (els.adminFeedback) els.adminFeedback.classList.add('hidden');
      loadSelectedPlayerIntoAdminForm(MG.Auth.listPlayers());
    });

    els.btnAdminAdd50k.addEventListener('click', () => {
      els.adminSaldoInput.value = String((Number(els.adminSaldoInput.value) || 0) + 50000);
    });
    els.btnAdminAdd100k.addEventListener('click', () => {
      els.adminSaldoInput.value = String((Number(els.adminSaldoInput.value) || 0) + 100000);
    });
    els.btnAdminReset100k.addEventListener('click', () => {
      els.adminSaldoInput.value = '100000';
    });

    els.btnAdminSave.addEventListener('click', async () => {
      if (!adminSelectedUsername) return;
      const res = await MG.Auth.updatePlayerConfig(adminSelectedUsername, {
        totalScore: Number(els.adminSaldoInput.value),
        settings: {
          playMode: els.adminPlayMode.value,
          multMode: els.adminMultMode.value,
          scatterDelaySpins: Math.max(0, Math.min(50, Number(els.adminScatterDelay.value) || 0)),
          scatterTierCount: Math.max(3, Math.min(6, Number(els.adminScatterCount.value) || 3)),
          scatterTargetPayout: Math.max(0, Math.round(Number(els.adminScatterTarget.value) || 0)),
          suspended: els.adminSuspended.checked
        }
      });
      if (res.ok) {
        renderAdminDashboard();
        els.adminFeedback.textContent = `Pengaturan untuk "${adminSelectedUsername}" berhasil disimpan.`;
        els.adminFeedback.classList.add('is-success');
        els.adminFeedback.classList.remove('hidden');
      }
    });

    els.btnAdminDeleteUser.addEventListener('click', async () => {
      if (!adminSelectedUsername) return;
      if (!adminDeleteArmed) {
        adminDeleteArmed = true;
        els.btnAdminDeleteUser.classList.add('is-confirm');
        els.btnAdminDeleteUser.textContent = 'Klik lagi untuk Hapus';
        return;
      }
      const deletedName = adminSelectedUsername;
      const res = await MG.Auth.deletePlayer(deletedName);
      if (res.ok) {
        adminSelectedUsername = null;
        renderAdminDashboard();
        els.adminFeedback.textContent = `Akun "${deletedName}" telah dihapus.`;
        els.adminFeedback.classList.add('is-success');
        els.adminFeedback.classList.remove('hidden');
      }
    });

    els.btnLobbyLogout.addEventListener('click', () => {
      MG.Auth.logout();
      state.totalScore = 100000;
      loadBestScore();
      switchScreenAuthTab('login');
      showScreen('auth');
    });

    els.btnBackToMenu.addEventListener('click', () => {
      if (state.isBusy || state.isBonusMode) return;
      if (state.isAutoSpinning) stopAutoSpin();
      renderHUD();
      showScreen('lobby');
    });

    function showAuthFeedback(msg, isSuccess = false) {
      els.authFeedback.textContent = msg;
      els.authFeedback.classList.toggle('is-success', isSuccess);
      els.authFeedback.classList.remove('hidden');
    }

    function clearAuthFeedback() {
      els.authFeedback.classList.add('hidden');
      els.authFeedback.textContent = '';
    }

    function switchAuthTab(mode) {
      clearAuthFeedback();
      const isLogin = mode === 'login';
      els.tabLogin.classList.toggle('active', isLogin);
      els.tabLogin.setAttribute('aria-selected', String(isLogin));
      els.tabRegister.classList.toggle('active', !isLogin);
      els.tabRegister.setAttribute('aria-selected', String(!isLogin));
      els.loginForm.classList.toggle('hidden', !isLogin);
      els.registerForm.classList.toggle('hidden', isLogin);
    }

    function openAuthModal(defaultTab = 'login') {
      const user = MG.Auth ? MG.Auth.getCurrentUser() : null;
      if (user) {
        els.authGuestView.classList.add('hidden');
        els.authProfileView.classList.remove('hidden');
        els.profileUsername.textContent = user.username;
        els.profileSaldo.textContent = formatRp(state.totalScore);
        els.profileBest.textContent = formatRp(state.bestScore);
      } else {
        els.authProfileView.classList.add('hidden');
        els.authGuestView.classList.remove('hidden');
        switchAuthTab(defaultTab);
      }
      els.authModal.classList.remove('hidden');
    }

    els.btnAccount.addEventListener('click', () => openAuthModal('login'));
    els.btnCloseAuthModal.addEventListener('click', () => els.authModal.classList.add('hidden'));
    els.authModal.addEventListener('click', (e) => {
      if (e.target === els.authModal) els.authModal.classList.add('hidden');
    });
    els.tabLogin.addEventListener('click', () => switchAuthTab('login'));
    els.tabRegister.addEventListener('click', () => switchAuthTab('register'));

    els.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await MG.Auth.login(els.loginUsername.value, els.loginPassword.value);
      if (!res.ok) {
        showAuthFeedback(res.error);
        return;
      }
      state.totalScore = res.user.totalScore;
      state.bestScore = Math.max(res.user.bestScore, res.user.totalScore);
      els.loginForm.reset();
      els.authModal.classList.add('hidden');
      renderHUD();
    });

    els.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await MG.Auth.register(
        els.regUsername.value,
        els.regPassword.value,
        els.regConfirm.value
      );
      if (!res.ok) {
        showAuthFeedback(res.error);
        return;
      }
      state.totalScore = res.user.totalScore;
      state.bestScore = res.user.bestScore;
      els.registerForm.reset();
      els.authModal.classList.add('hidden');
      renderHUD();
    });

    els.btnLogout.addEventListener('click', () => {
      MG.Auth.logout();
      state.totalScore = 100000;
      loadBestScore();
      els.authModal.classList.add('hidden');
      renderHUD();
      showScreen('auth');
    });

    els.btnPaytable.addEventListener('click', () => {
      populatePaytable();
      els.paytableModal.classList.remove('hidden');
    });
    els.btnCloseModal.addEventListener('click', () => els.paytableModal.classList.add('hidden'));
    els.paytableModal.addEventListener('click', (e) => {
      if (e.target === els.paytableModal) els.paytableModal.classList.add('hidden');
    });
    els.btnStartBonus.addEventListener('click', () => {
      els.bonusOverlay.classList.add('hidden');
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !els.gameScreen.classList.contains('hidden') && !state.isBusy && !state.isBonusMode && els.paytableModal.classList.contains('hidden') && els.authModal.classList.contains('hidden')) {
        e.preventDefault();
        handleSpin(false);
      }
    });
  }

  async function init() {
    cacheElements();
    loadBestScore();
    if (MG.Auth && MG.Auth.subscribeConnection && els.adminFbStatus) {
      MG.Auth.subscribeConnection((online) => {
        els.adminFbStatus.textContent = online ? '🟢 Firebase Live' : '🟡 Mode Lokal';
        els.adminFbStatus.classList.toggle('is-live', online);
      });
    }
    const activeUser = MG.Auth && MG.Auth.init ? await MG.Auth.init() : (MG.Auth ? MG.Auth.getCurrentUser() : null);
    if (activeUser) {
      state.totalScore = activeUser.totalScore;
      state.bestScore = Math.max(activeUser.bestScore, activeUser.totalScore);
    }
    MG.Animation.init({
      fxCanvas: els.fxCanvas,
      gridWrapper: els.gridWrapper,
      winBanner: els.winBanner,
      winBannerText: els.winBannerText
    });
    MG.Grid.init(els.grid);
    populatePaytable();
    bindEvents();
    updateMultiplierBar(0);
    renderHUD();
  }

  window.addEventListener('DOMContentLoaded', init);
  return { init, handleSpin, getState: () => ({ ...state }) };
})();
