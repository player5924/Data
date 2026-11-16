window.MG = window.MG || {};

MG.Symbols = (() => {
  // Seluruh 29 aset hasil crop dari sprite sheet asli
  const CATALOG = {
    wild: { id: 'wild', name: 'WILD Emas', src: 'assets/wild.png', type: 'wild', weight: 0, pay: { 3: 0, 4: 0, 5: 0 } },
    scatter: { id: 'scatter', name: 'SCATTER Naga', src: 'assets/scatter.png', type: 'scatter', weight: 4, pay: { 3: 0, 4: 0, 5: 0 } },

    // High-tier tiles
    fa: { id: 'fa', name: 'Fa (Hijau)', src: 'assets/fa.png', type: 'regular', weight: 7, pay: { 3: 1000, 4: 2500, 5: 6000 } },
    zhong: { id: 'zhong', name: 'Zhong (Merah)', src: 'assets/zhong.png', type: 'regular', weight: 8, pay: { 3: 850, 4: 2100, 5: 5000 } },
    bai: { id: 'bai', name: 'Bai Ban (Putih)', src: 'assets/bai.png', type: 'regular', weight: 9, pay: { 3: 720, 4: 1800, 5: 4200 } },
    bird: { id: 'bird', name: 'Burung Bambu 1', src: 'assets/bird.png', type: 'regular', weight: 10, pay: { 3: 600, 4: 1500, 5: 3500 } },

    // Mid-tier tiles
    wan_1: { id: 'wan_1', name: '1 Wan', src: 'assets/wan_1.png', type: 'regular', weight: 11, pay: { 3: 480, 4: 1200, 5: 2800 } },
    wan_2: { id: 'wan_2', name: '2 Wan', src: 'assets/wan_2.png', type: 'regular', weight: 12, pay: { 3: 400, 4: 1000, 5: 2300 } },
    wan_3: { id: 'wan_3', name: '3 Wan', src: 'assets/wan_3.png', type: 'regular', weight: 12, pay: { 3: 340, 4: 850, 5: 1950 } },

    // Low-tier tiles (lebih sering muncul untuk memicu Ways & Cascade)
    tong_2: { id: 'tong_2', name: '2 Tong', src: 'assets/tong_2.png', type: 'regular', weight: 15, pay: { 3: 240, 4: 600, 5: 1350 } },
    tong_5: { id: 'tong_5', name: '5 Tong', src: 'assets/tong_5.png', type: 'regular', weight: 15, pay: { 3: 280, 4: 700, 5: 1600 } },
    tiao_2: { id: 'tiao_2', name: '2 Tiao', src: 'assets/tiao_2.png', type: 'regular', weight: 16, pay: { 3: 160, 4: 400, 5: 900 } },
    tiao_3: { id: 'tiao_3', name: '3 Tiao', src: 'assets/tiao_3.png', type: 'regular', weight: 16, pay: { 3: 200, 4: 500, 5: 1150 } },

    // Extra sprite sheet tiles (tersedia di katalog & paytable)
    dong: { id: 'dong', name: 'Angin Timur', src: 'assets/dong.png', type: 'regular', weight: 0, pay: { 3: 20, 4: 50, 5: 120 } },
    nan: { id: 'nan', name: 'Angin Selatan', src: 'assets/nan.png', type: 'regular', weight: 0, pay: { 3: 20, 4: 50, 5: 120 } },
    xi: { id: 'xi', name: 'Angin Barat', src: 'assets/xi.png', type: 'regular', weight: 0, pay: { 3: 20, 4: 50, 5: 120 } },
    bei: { id: 'bei', name: 'Angin Utara', src: 'assets/bei.png', type: 'regular', weight: 0, pay: { 3: 20, 4: 50, 5: 120 } },
    tong_1: { id: 'tong_1', name: '1 Tong', src: 'assets/tong_1.png', type: 'regular', weight: 0, pay: { 3: 14, 4: 36, 5: 90 } },
    tong_4: { id: 'tong_4', name: '4 Tong', src: 'assets/tong_4.png', type: 'regular', weight: 0, pay: { 3: 12, 4: 28, 5: 70 } },
    tong_6: { id: 'tong_6', name: '6 Tong', src: 'assets/tong_6.png', type: 'regular', weight: 0, pay: { 3: 12, 4: 28, 5: 70 } },
    tong_9: { id: 'tong_9', name: '9 Tong', src: 'assets/tong_9.png', type: 'regular', weight: 0, pay: { 3: 14, 4: 34, 5: 85 } },
    tiao_1: { id: 'tiao_1', name: '1 Tiao', src: 'assets/tiao_1.png', type: 'regular', weight: 0, pay: { 3: 12, 4: 28, 5: 70 } },
    tiao_6: { id: 'tiao_6', name: '6 Tiao', src: 'assets/tiao_6.png', type: 'regular', weight: 0, pay: { 3: 10, 4: 24, 5: 60 } },
    tiao_8: { id: 'tiao_8', name: '8 Tiao', src: 'assets/tiao_8.png', type: 'regular', weight: 0, pay: { 3: 10, 4: 24, 5: 60 } },
    tiao_10: { id: 'tiao_10', name: '10 Tiao', src: 'assets/tiao_10.png', type: 'regular', weight: 0, pay: { 3: 10, 4: 24, 5: 60 } },
    flower_plum: { id: 'flower_plum', name: 'Bunga Plum', src: 'assets/flower_plum.png', type: 'regular', weight: 0, pay: { 3: 18, 4: 44, 5: 105 } },
    flower_chrys: { id: 'flower_chrys', name: 'Bunga Krisan', src: 'assets/flower_chrys.png', type: 'regular', weight: 0, pay: { 3: 18, 4: 44, 5: 105 } },
    flower_bamboo: { id: 'flower_bamboo', name: 'Bunga Bambu', src: 'assets/flower_bamboo.png', type: 'regular', weight: 0, pay: { 3: 18, 4: 44, 5: 105 } },
    flower_maple: { id: 'flower_maple', name: 'Daun Maple', src: 'assets/flower_maple.png', type: 'regular', weight: 0, pay: { 3: 18, 4: 44, 5: 105 } }
  };

  const ACTIVE_REGULAR_IDS = Object.keys(CATALOG).filter(
    (k) => CATALOG[k].type === 'regular' && CATALOG[k].weight > 0
  );

  function get(id) {
    return CATALOG[id] || null;
  }

  function pickRandomRegular() {
    let total = 0;
    for (const id of ACTIVE_REGULAR_IDS) total += CATALOG[id].weight;
    let r = Math.random() * total;
    for (const id of ACTIVE_REGULAR_IDS) {
      r -= CATALOG[id].weight;
      if (r <= 0) return id;
    }
    return ACTIVE_REGULAR_IDS[0];
  }

  let bonusMode = false;

  function setBonusMode(active) {
    bonusMode = Boolean(active);
  }

  function pickRandomForCell(col, allowScatter = true) {
    // Normal: ~2.2% per slot (jarang); Di dalam Scatter/Free Spin: ~0.25% (hampir mustahil)
    const scatterChance = bonusMode ? 0.0025 : 0.022;
    if (allowScatter && Math.random() < scatterChance) {
      return { id: 'scatter', isGold: false };
    }
    const id = pickRandomRegular();
    // Gold Symbol hanya muncul di kolom 2, 3, 4 (index 1, 2, 3) dengan peluang ~22%
    const isGold = col >= 1 && col <= 3 && Math.random() < 0.22;
    return { id, isGold };
  }

  function getPaytableList() {
    return ['wild', 'scatter', ...ACTIVE_REGULAR_IDS].map((id) => CATALOG[id]);
  }

  return { CATALOG, ACTIVE_REGULAR_IDS, get, setBonusMode, pickRandomRegular, pickRandomForCell, getPaytableList };
})();
