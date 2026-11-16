window.MG = window.MG || {};

MG.WinSystem = (() => {
  /**
   * Evaluasi seluruh kombinasi Ways to Win dari kiri ke kanan (minimal 3 kolom berurutan).
   * WILD dapat menggantikan semua simbol reguler (bukan SCATTER).
   */
  function evaluate(matrix, spinCost = 1000) {
    const cols = matrix.length;
    const rows = matrix[0] ? matrix[0].length : 0;

    // Kumpulkan kandidat simbol reguler yang muncul di kolom 0 (atau jika ada wild di kolom 0)
    const candidateIds = new Set();
    let col0HasWild = false;
    for (let r = 0; r < rows; r++) {
      const t = matrix[0][r];
      if (!t) continue;
      if (t.id === 'wild') col0HasWild = true;
      else if (t.id !== 'scatter') candidateIds.add(t.id);
    }
    if (col0HasWild) {
      for (const id of MG.Symbols.ACTIVE_REGULAR_IDS) candidateIds.add(id);
    }

    const wins = [];
    const winningCoordMap = new Map(); // "c,r" -> { col, row, tile }

    for (const symId of candidateIds) {
      const colMatches = [];
      for (let c = 0; c < cols; c++) {
        const matchedInCol = [];
        for (let r = 0; r < rows; r++) {
          const t = matrix[c][r];
          if (t && (t.id === symId || t.id === 'wild')) {
            matchedInCol.push({ col: c, row: r, tile: t });
          }
        }
        if (matchedInCol.length === 0) break;
        colMatches.push(matchedInCol);
      }

      if (colMatches.length >= 3) {
        const matchedCols = colMatches.length;
        const ways = colMatches.reduce((acc, arr) => acc * arr.length, 1);
        const symDef = MG.Symbols.get(symId);
        const basePay = symDef && symDef.pay[matchedCols] ? symDef.pay[matchedCols] : 10;
        const betFactor = spinCost / 1000;
        const baseWin = Math.round(basePay * ways * betFactor);

        const coords = [];
        for (const arr of colMatches) {
          for (const item of arr) {
            coords.push(item);
            winningCoordMap.set(`${item.col},${item.row}`, item);
          }
        }

        wins.push({
          symId,
          symName: symDef ? symDef.name : symId,
          matchedCols,
          ways,
          basePay,
          baseWin,
          colMatches,
          coords
        });
      }
    }

    const totalBaseWin = wins.reduce((sum, w) => sum + w.baseWin, 0);
    const totalWays = wins.reduce((sum, w) => sum + w.ways, 0);

    return {
      hasWin: wins.length > 0,
      wins,
      totalBaseWin,
      totalWays,
      winningCoords: Array.from(winningCoordMap.values())
    };
  }

  function countScatters(matrix) {
    const coords = [];
    for (let c = 0; c < matrix.length; c++) {
      for (let r = 0; r < matrix[c].length; r++) {
        const t = matrix[c][r];
        if (t && t.id === 'scatter') {
          coords.push({ col: c, row: r, tile: t });
        }
      }
    }
    return { count: coords.length, coords };
  }

  return { evaluate, countScatters };
})();
