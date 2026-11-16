window.MG = window.MG || {};

MG.Grid = (() => {
  const COLS = 5;
  const ROWS = 4;
  let matrix = []; // matrix[col][row] = { uid, id, isGold }
  let uidCounter = 1;
  let containerEl = null;

  function init(el) {
    containerEl = el;
    matrix = createRandomMatrix();
    render(true);
  }

  function makeTile(id, isGold = false) {
    return { uid: uidCounter++, id, isGold: Boolean(isGold) };
  }

  function createRandomMatrix() {
    const grid = [];
    for (let c = 0; c < COLS; c++) {
      const colArr = [];
      let scatterCountInCol = 0;
      for (let r = 0; r < ROWS; r++) {
        const picked = MG.Symbols.pickRandomForCell(c, scatterCountInCol < 1);
        if (picked.id === 'scatter') scatterCountInCol++;
        colArr.push(makeTile(picked.id, picked.isGold));
      }
      grid.push(colArr);
    }
    return grid;
  }

  function spinNewMatrix(opts = {}) {
    const playMode = opts.playMode || 'normal';
    const lossAllowSmallWin = Boolean(opts.lossAllowSmallWin);
    const forceScatterCount = Number(opts.forceScatterCount) || 0;

    matrix = createRandomMatrix();

    if (playMode === 'win') {
      const hotPool = ['fa', 'zhong', 'bai', 'bamboo8', 'wan8', 'circle8'];
      const hotId = hotPool[Math.floor(Math.random() * hotPool.length)];
      for (let c = 0; c < 3; c++) {
        const targetRow = Math.floor(Math.random() * ROWS);
        if (matrix[c][targetRow].id !== 'scatter') {
          matrix[c][targetRow] = makeTile(hotId, c >= 1 && c <= 3 && Math.random() < 0.55);
        }
        if (c === 1 || c === 2) {
          for (let r = 0; r < ROWS; r++) {
            if (matrix[c][r].id !== 'scatter' && Math.random() < 0.25) {
              matrix[c][r] = makeTile(matrix[c][r].id, true);
            }
          }
        }
      }
    } else if (playMode === 'loss') {
      // Buat kolom 0 dan 1 tidak cocok agar tidak menang terus
      const col0Ids = new Set(matrix[0].map((t) => t.id));
      const fallbackPool = ['bamboo2', 'wan2', 'circle2', 'bamboo5', 'wan5', 'circle5', 'bai'];
      for (let r = 0; r < ROWS; r++) {
        if (matrix[1][r].id !== 'scatter' && col0Ids.has(matrix[1][r].id)) {
          const alt = fallbackPool.find((id) => !col0Ids.has(id)) || 'circle2';
          matrix[1][r] = makeTile(alt, false);
        }
        matrix[1][r].isGold = false;
        matrix[2][r].isGold = false;
      }
      // Tarik ulur: sesekali beri kemenangan kecil (simbol rendah di kolom 0-2)
      if (lossAllowSmallWin) {
        const smallPool = ['bamboo2', 'wan2', 'circle2'];
        const smallId = smallPool[Math.floor(Math.random() * smallPool.length)];
        for (let c = 0; c < 3; c++) {
          const r = Math.floor(Math.random() * ROWS);
          matrix[c][r] = makeTile(smallId, false);
        }
      }
    }

    if (forceScatterCount >= 3) {
      const targetCount = Math.min(6, forceScatterCount);
      const colOrder = [0, 2, 4, 1, 3];
      for (let i = 0; i < Math.min(targetCount, colOrder.length); i++) {
        const c = colOrder[i];
        const r = Math.floor(Math.random() * ROWS);
        matrix[c][r] = makeTile('scatter', false);
      }
      if (targetCount === 6) {
        // Tambah 1 scatter ekstra di baris berbeda pada kolom 2
        const existingRow = matrix[2].findIndex((t) => t.id === 'scatter');
        const altRow = (existingRow + 1) % ROWS;
        matrix[2][altRow] = makeTile('scatter', false);
      }
    }

    return matrix;
  }

  function getMatrix() {
    return matrix;
  }

  function getTile(col, row) {
    return matrix[col] ? matrix[col][row] : null;
  }

  function setTile(col, row, tileObj) {
    if (matrix[col]) matrix[col][row] = tileObj;
  }

  // Terapkan gravitasi: tile di atas jatuh mengisi ruang kosong (null)
  function applyGravity() {
    const moved = [];
    for (let c = 0; c < COLS; c++) {
      const surviving = [];
      for (let r = ROWS - 1; r >= 0; r--) {
        if (matrix[c][r] !== null) {
          surviving.push(matrix[c][r]);
        }
      }
      // Susun kembali dari bawah ke atas
      for (let r = ROWS - 1; r >= 0; r--) {
        const idxFromBottom = ROWS - 1 - r;
        matrix[c][r] = surviving[idxFromBottom] || null;
        if (matrix[c][r]) {
          moved.push({ col: c, row: r, uid: matrix[c][r].uid });
        }
      }
    }
    return moved;
  }

  // Isi ruang kosong teratas dengan simbol baru
  function fillEmptySlots() {
    const spawned = [];
    for (let c = 0; c < COLS; c++) {
      let colScatterCount = matrix[c].filter((t) => t && t.id === 'scatter').length;
      for (let r = 0; r < ROWS; r++) {
        if (matrix[c][r] === null) {
          const picked = MG.Symbols.pickRandomForCell(c, colScatterCount < 1);
          if (picked.id === 'scatter') colScatterCount++;
          const tile = makeTile(picked.id, picked.isGold);
          matrix[c][r] = tile;
          spawned.push({ col: c, row: r, tile });
        }
      }
    }
    return spawned;
  }

  function render(animateDrop = false, dropFilterSet = null) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    for (let c = 0; c < COLS; c++) {
      const colDiv = document.createElement('div');
      colDiv.className = 'grid-col';
      colDiv.dataset.col = String(c);

      for (let r = 0; r < ROWS; r++) {
        const tile = matrix[c][r];
        const slot = document.createElement('div');
        slot.className = 'tile-slot';
        slot.dataset.col = String(c);
        slot.dataset.row = String(r);

        if (tile) {
          slot.dataset.uid = String(tile.uid);
          const shouldDrop = animateDrop && (!dropFilterSet || dropFilterSet.has(tile.uid));
          if (shouldDrop) {
            slot.classList.add('anim-drop');
            slot.style.animationDelay = `${c * 0.055 + r * 0.025}s`;
          }

          const card = document.createElement('div');
          card.className = 'tile-card';
          if (tile.isGold) card.classList.add('is-gold');
          if (tile.id === 'wild') card.classList.add('is-wild');
          if (tile.id === 'scatter') card.classList.add('is-scatter');

          const sym = MG.Symbols.get(tile.id);
          const img = document.createElement('img');
          img.src = sym ? sym.src : '';
          img.alt = sym ? sym.name : tile.id;
          img.draggable = false;

          card.appendChild(img);
          slot.appendChild(card);
        }
        colDiv.appendChild(slot);
      }
      containerEl.appendChild(colDiv);
    }
  }


  function buildTileSlotElement(tile, col, row) {
    const slot = document.createElement('div');
    slot.className = 'tile-slot';
    slot.dataset.col = String(col);
    slot.dataset.row = String(row);
    if (tile) {
      slot.dataset.uid = String(tile.uid);
      const card = document.createElement('div');
      card.className = 'tile-card';
      if (tile.isGold) card.classList.add('is-gold');
      if (tile.id === 'wild') card.classList.add('is-wild');
      if (tile.id === 'scatter') card.classList.add('is-scatter');

      const sym = MG.Symbols.get(tile.id);
      const img = document.createElement('img');
      img.src = sym ? sym.src : '';
      img.alt = sym ? sym.name : tile.id;
      img.draggable = false;

      card.appendChild(img);
      slot.appendChild(card);
    }
    return slot;
  }

  async function spinWithReelAnimation(isTurbo = false, spinOpts = {}) {
    const prevMatrix = matrix.map((colArr) => colArr.slice());
    const newMatrix = spinNewMatrix(spinOpts);
    if (!containerEl) return newMatrix;

    const colEls = Array.from(containerEl.querySelectorAll('.grid-col'));
    if (colEls.length !== COLS) {
      render(false);
      return newMatrix;
    }

    const exactColH = colEls[0].getBoundingClientRect().height;
    const firstSlot = colEls[0].querySelector('.tile-slot');
    const slotH = firstSlot ? firstSlot.getBoundingClientRect().height : (exactColH / ROWS);
    const gap = ROWS > 1 ? Math.max(0, (exactColH - ROWS * slotH) / (ROWS - 1)) : 0;
    const stepH = slotH + gap;

    // Kunci tinggi grid & kolom persis sama dengan ukuran sebelum spin agar layar tidak berubah ukuran
    const gridRect = containerEl.getBoundingClientRect();
    containerEl.style.height = `${gridRect.height}px`;
    const animPromises = [];

    for (let c = 0; c < COLS; c++) {
      const colDiv = colEls[c];
      colDiv.style.height = `${exactColH}px`;
      colDiv.innerHTML = '';

      const strip = document.createElement('div');
      strip.className = 'reel-strip is-spinning';
      strip.style.gap = `${gap}px`;

      // Jumlah ubin penggulir per kolom (staggered dari kiri ke kanan)
      const fillerCount = isTurbo ? (6 + c * 2) : (10 + c * 3);
      const stripTiles = [];

      // 1. Target ubin baru di posisi paling atas (indeks 0..3 -> mendarat di translateY(0))
      for (let r = 0; r < ROWS; r++) {
        stripTiles.push(newMatrix[c][r]);
      }
      // 2. Ubin penggulir acak di tengah
      for (let k = 0; k < fillerCount; k++) {
        const picked = MG.Symbols.pickRandomForCell(c, true);
        stripTiles.push({ uid: -1, id: picked.id, isGold: picked.isGold });
      }
      // 3. Ubin lama di paling bawah (terlihat di awal sebelum bergulir ke bawah)
      for (let r = 0; r < ROWS; r++) {
        stripTiles.push(prevMatrix[c][r]);
      }

      stripTiles.forEach((tile, idx) => {
        const slot = buildTileSlotElement(tile, c, idx);
        slot.style.height = `${slotH}px`;
        slot.style.flexShrink = '0';
        strip.appendChild(slot);
      });

      const startOffset = -((ROWS + fillerCount) * stepH);
      strip.style.transform = `translate3d(0, ${startOffset}px, 0)`;
      colDiv.appendChild(strip);

      const duration = isTurbo ? (340 + c * 55) : (1150 + c * 220);
      animPromises.push({ strip, startOffset, duration });
    }

    // Sinkronkan start semua kolom pada frame vsync berikutnya agar 60 FPS mulus tanpa frame drop
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const running = animPromises.map(({ strip, startOffset, duration }) => {
      const anim = strip.animate(
        [
          { transform: `translate3d(0, ${startOffset}px, 0)` },
          { transform: 'translate3d(0, 3px, 0)', offset: 0.94 },
          { transform: 'translate3d(0, 0px, 0)' }
        ],
        {
          duration,
          easing: 'cubic-bezier(0.12, 0.92, 0.22, 1)',
          fill: 'forwards'
        }
      );
      return Promise.race([
        anim.finished.catch(() => {}),
        new Promise((res) => setTimeout(res, duration + 60))
      ]);
    });

    await Promise.all(running);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    containerEl.style.height = '';
    colEls.forEach((colDiv) => { colDiv.style.height = ''; });
    render(false);
    return newMatrix;
  }

  function getSlotElement(col, row) {
    if (!containerEl) return null;
    return containerEl.querySelector(`.tile-slot[data-col="${col}"][data-row="${row}"]`);
  }

  return {
    COLS,
    ROWS,
    init,
    makeTile,
    spinNewMatrix,
    spinWithReelAnimation,
    getMatrix,
    getTile,
    setTile,
    applyGravity,
    fillEmptySlots,
    render,
    getSlotElement
  };
})();
