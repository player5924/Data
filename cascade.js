window.MG = window.MG || {};

MG.Cascade = (() => {
  const NORMAL_MULT_STEPS = [1, 2, 3, 5];
  const BONUS_MULT_STEPS = [2, 4, 6, 10];

  function getMultiplierForCascade(cascadeIndex, isBonusMode) {
    const steps = isBonusMode ? BONUS_MULT_STEPS : NORMAL_MULT_STEPS;
    const idx = Math.min(cascadeIndex, steps.length - 1);
    return { stepIdx: idx, value: steps[idx], steps };
  }

  async function runCascadeSequence(options) {
    const { spinCost, isBonusMode, onStepWin, onMultiplierChange } = options;
    let cascadeIndex = 0;
    let totalSpinWin = 0;

    while (true) {
      const matrix = MG.Grid.getMatrix();
      const result = MG.WinSystem.evaluate(matrix, spinCost);

      if (!result.hasWin) break;

      const multInfo = getMultiplierForCascade(cascadeIndex, isBonusMode);
      if (onMultiplierChange) onMultiplierChange(multInfo);

      const stepWin = result.totalBaseWin * multInfo.value;
      totalSpinWin += stepWin;

      // 1. Tampilkan efek garis kombinasi & animasi kemenangan
      MG.Audio.playWin(cascadeIndex);
      await MG.Animation.showWinningState(result, stepWin, multInfo.value);

      if (onStepWin) {
        onStepWin({
          cascadeNum: cascadeIndex + 1,
          stepWin,
          totalWays: result.totalWays,
          multiplier: multInfo.value,
          wins: result.wins
        });
      }

      // 2. Pisahkan Gold Symbol yang menang vs tile pemenang biasa
      const { goldWinners, normalWinners } = MG.WildSystem.partitionWinners(result.winningCoords);

      // 3. Animasi menghilang untuk tile biasa & transformasi emas untuk Gold -> WILD
      if (goldWinners.length > 0) {
        MG.Audio.playGoldTransform();
      }
      await MG.Animation.vanishAndTransform(normalWinners, goldWinners);

      // Hapus tile pemenang biasa dari matrix
      for (const item of normalWinners) {
        MG.Grid.setTile(item.col, item.row, null);
      }
      // Ubah Gold pemenang menjadi WILD di matrix
      if (goldWinners.length > 0) {
        MG.WildSystem.transformGoldToWild(matrix, goldWinners);
      }

      // 4. Gravitasi: tile di atas jatuh mengisi ruang kosong
      MG.Grid.applyGravity();

      // 5. Isi ruang kosong dengan simbol baru
      const spawned = MG.Grid.fillEmptySlots();
      const dropUids = new Set(spawned.map((s) => s.tile.uid));

      // Render ulang grid dengan animasi jatuh pada tile baru
      MG.Grid.render(true, dropUids);
      MG.Audio.playTileDrop();
      await MG.Animation.wait(MG.Animation.duration(420));

      cascadeIndex++;
    }

    return { totalSpinWin, cascades: cascadeIndex };
  }

  return { NORMAL_MULT_STEPS, BONUS_MULT_STEPS, getMultiplierForCascade, runCascadeSequence };
})();
