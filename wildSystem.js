window.MG = window.MG || {};

MG.WildSystem = (() => {
  /**
   * Memisahkan tile pemenang menjadi:
   * - goldWinners: tile Gold yang ikut membentuk kombinasi -> berubah menjadi WILD
   * - normalWinners: tile reguler/wild pemenang -> menghilang saat cascade
   */
  function partitionWinners(winningCoords) {
    const goldWinners = [];
    const normalWinners = [];

    for (const item of winningCoords) {
      if (item.tile && item.tile.isGold) {
        goldWinners.push(item);
      } else {
        normalWinners.push(item);
      }
    }
    return { goldWinners, normalWinners };
  }

  /**
   * Mengubah tile Gold pemenang menjadi simbol WILD pada matrix grid
   */
  function transformGoldToWild(matrix, goldWinners) {
    const transformed = [];
    for (const item of goldWinners) {
      const current = matrix[item.col][item.row];
      if (!current) continue;
      matrix[item.col][item.row] = {
        uid: current.uid,
        id: 'wild',
        isGold: false
      };
      transformed.push({ col: item.col, row: item.row, tile: matrix[item.col][item.row] });
    }
    return transformed;
  }

  return { partitionWinners, transformGoldToWild };
})();
