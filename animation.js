window.MG = window.MG || {};

MG.Animation = (() => {
  let speedScale = 1; // 1 = Normal, 0.5 = Turbo (2x)
  let fxCanvas = null;
  let fxCtx = null;
  let gridWrapper = null;
  let winBanner = null;
  let winBannerText = null;
  let particles = [];
  let rafId = null;

  function init(els) {
    fxCanvas = els.fxCanvas;
    gridWrapper = els.gridWrapper;
    winBanner = els.winBanner;
    winBannerText = els.winBannerText;
    if (fxCanvas) fxCtx = fxCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!fxCanvas || !gridWrapper) return;
    const rect = gridWrapper.getBoundingClientRect();
    fxCanvas.width = Math.max(1, Math.floor(rect.width));
    fxCanvas.height = Math.max(1, Math.floor(rect.height));
  }

  function setTurbo(isTurbo) {
    speedScale = isTurbo ? 0.5 : 1;
    document.documentElement.style.setProperty('--drop-dur', isTurbo ? '0.18s' : '0.34s');
    document.documentElement.style.setProperty('--vanish-dur', isTurbo ? '0.15s' : '0.28s');
    document.documentElement.style.setProperty('--transform-dur', isTurbo ? '0.25s' : '0.48s');
  }

  function duration(ms) {
    return Math.round(ms * speedScale);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getSlotCenter(col, row) {
    const slot = MG.Grid.getSlotElement(col, row);
    if (!slot || !gridWrapper) return null;
    const wrapRect = gridWrapper.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    return {
      x: slotRect.left - wrapRect.left + slotRect.width / 2,
      y: slotRect.top - wrapRect.top + slotRect.height / 2
    };
  }

  function spawnParticles(x, y, color = '#ffe066', count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.6 + Math.random() * 3.4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.03 + Math.random() * 0.025,
        size: 2.5 + Math.random() * 3.5,
        color
      });
    }
    startParticleLoop();
  }

  function startParticleLoop() {
    if (rafId || !fxCtx) return;
    const tick = () => {
      if (!fxCtx || !fxCanvas) { rafId = null; return; }
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= p.decay;
        fxCtx.globalAlpha = Math.max(0, p.life);
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }
      fxCtx.globalAlpha = 1;
      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  function drawWaysLines(wins) {
    if (!fxCtx || !fxCanvas) return;
    resizeCanvas();
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

    const palette = ['#ffe46b', '#ff6b4a', '#70ffbc', '#ff9cf0'];
    wins.slice(0, 4).forEach((win, idx) => {
      fxCtx.save();
      fxCtx.strokeStyle = palette[idx % palette.length];
      fxCtx.lineWidth = 3;
      fxCtx.shadowColor = palette[idx % palette.length];
      fxCtx.shadowBlur = 12;
      fxCtx.globalAlpha = 0.85;

      for (let c = 0; c < win.colMatches.length - 1; c++) {
        const leftCol = win.colMatches[c];
        const rightCol = win.colMatches[c + 1];
        for (const a of leftCol) {
          const p1 = getSlotCenter(a.col, a.row);
          if (!p1) continue;
          for (const b of rightCol) {
            const p2 = getSlotCenter(b.col, b.row);
            if (!p2) continue;
            fxCtx.beginPath();
            fxCtx.moveTo(p1.x, p1.y);
            fxCtx.lineTo(p2.x, p2.y);
            fxCtx.stroke();
          }
        }
      }
      fxCtx.restore();
    });
  }

  function clearFxCanvas() {
    if (fxCtx && fxCanvas) {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    }
  }

  async function showWinningState(result, stepWin, multValue) {
    for (const item of result.winningCoords) {
      const slot = MG.Grid.getSlotElement(item.col, item.row);
      if (slot) slot.classList.add('anim-win');
    }

    drawWaysLines(result.wins);

    if (winBanner && winBannerText) {
      winBannerText.textContent = `+Rp ${Math.round(stepWin).toLocaleString('id-ID')} (${result.totalWays} WAYS • X${multValue})`;
      winBanner.classList.remove('hidden');
    }

    await wait(duration(780));
    if (winBanner) winBanner.classList.add('hidden');
    clearFxCanvas();
  }

  async function vanishAndTransform(normalWinners, goldWinners) {
    for (const item of normalWinners) {
      const slot = MG.Grid.getSlotElement(item.col, item.row);
      if (slot) {
        slot.classList.remove('anim-win');
        slot.classList.add('anim-vanish');
        const pt = getSlotCenter(item.col, item.row);
        if (pt) spawnParticles(pt.x, pt.y, '#ffd15c', 8);
      }
    }

    for (const item of goldWinners) {
      const slot = MG.Grid.getSlotElement(item.col, item.row);
      if (slot) {
        slot.classList.remove('anim-win');
        slot.classList.add('anim-gold-wild');
        const img = slot.querySelector('img');
        const card = slot.querySelector('.tile-card');
        if (card) {
          card.classList.remove('is-gold');
          card.classList.add('is-wild');
        }
        if (img) img.src = MG.Symbols.get('wild').src;
        const pt = getSlotCenter(item.col, item.row);
        if (pt) spawnParticles(pt.x, pt.y, '#fff5a8', 18);
      }
    }

    await wait(duration(goldWinners.length > 0 ? 480 : 300));
  }

  return {
    init,
    setTurbo,
    duration,
    wait,
    showWinningState,
    vanishAndTransform,
    spawnParticles,
    getSlotCenter
  };
})();
