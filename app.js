(() => {
  'use strict';

  const STORAGE_KEY = 'card-pot-clicker-save-v1';
  const TAB_STORAGE_KEY = 'card-pot-clicker-tab-v1';
  const MAX_LOGS = 70;
  const PRICE_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Contraband'];
  const RARITY_META = {
    Common: { color: '#a7b5c4', volatility: 0.65 },
    Uncommon: { color: '#4fbf8c', volatility: 0.78 },
    Rare: { color: '#3a9bf3', volatility: 0.9 },
    Epic: { color: '#ce7b2f', volatility: 1.08 },
    Legendary: { color: '#e4b52f', volatility: 1.3 },
    Mythic: { color: '#d5532e', volatility: 1.48 },
    Contraband: { color: '#f26443', volatility: 1.72 }
  };

  const RARITY_BALANCE_PROFILE = {
    Common: { chanceShare: 0.89, minWorth: 6, maxWorth: 18 },
    Uncommon: { chanceShare: 0.1035, minWorth: 22, maxWorth: 90 },
    Rare: { chanceShare: 0.0053, minWorth: 120, maxWorth: 2200 },
    Epic: { chanceShare: 0.001, minWorth: 3500, maxWorth: 120000 },
    Legendary: { chanceShare: 0.00017, minWorth: 350000, maxWorth: 12000000 },
    Mythic: { chanceShare: 0.000026, minWorth: 8000000, maxWorth: 550000000 },
    Contraband: { chanceShare: 0.000004, minWorth: 1200000000, maxWorth: 9000000000 }
  };

  const PACK_TYPES = [
    {
      id: 'street-crate',
      name: 'Street Crate',
      cost: 120,
      unlockCost: 0,
      cardsPerPack: 3,
      luckScale: 0.08,
      rarityBoost: {
        Common: 1.22,
        Uncommon: 0.88,
        Rare: 0.16,
        Epic: 0.025,
        Legendary: 0.004,
        Mythic: 0.001,
        Contraband: 0.00015
      }
    },
    {
      id: 'tactical-case',
      name: 'Tactical Case',
      cost: 420,
      unlockCost: 5000,
      cardsPerPack: 4,
      luckScale: 0.16,
      rarityBoost: {
        Common: 1.1,
        Uncommon: 0.96,
        Rare: 0.34,
        Epic: 0.12,
        Legendary: 0.03,
        Mythic: 0.008,
        Contraband: 0.0015
      }
    },
    {
      id: 'black-vault',
      name: 'Black Vault',
      cost: 1700,
      unlockCost: 32000,
      cardsPerPack: 5,
      luckScale: 0.28,
      rarityBoost: {
        Common: 0.98,
        Uncommon: 1.03,
        Rare: 0.62,
        Epic: 0.3,
        Legendary: 0.09,
        Mythic: 0.02,
        Contraband: 0.004
      }
    },
    {
      id: 'omega-safe',
      name: 'Omega Safe',
      cost: 6500,
      unlockCost: 170000,
      cardsPerPack: 6,
      luckScale: 0.45,
      rarityBoost: {
        Common: 0.86,
        Uncommon: 0.96,
        Rare: 0.95,
        Epic: 0.62,
        Legendary: 0.2,
        Mythic: 0.05,
        Contraband: 0.01
      }
    },
    {
      id: 'diamond-treasury',
      name: 'Diamond Treasury',
      cost: 24000,
      unlockCost: 980000,
      cardsPerPack: 7,
      luckScale: 0.72,
      rarityBoost: {
        Common: 0.58,
        Uncommon: 0.82,
        Rare: 1.65,
        Epic: 1.95,
        Legendary: 1.15,
        Mythic: 0.44,
        Contraband: 0.09
      }
    },
    {
      id: 'void-arsenal',
      name: 'Void Arsenal',
      cost: 90000,
      unlockCost: 6200000,
      cardsPerPack: 8,
      luckScale: 0.86,
      rarityBoost: {
        Common: 0.42,
        Uncommon: 0.72,
        Rare: 2.05,
        Epic: 3.1,
        Legendary: 2.05,
        Mythic: 0.92,
        Contraband: 0.22
      }
    },
    {
      id: 'singularity-core',
      name: 'Singularity Core',
      cost: 620000,
      unlockCost: 42000000,
      cardsPerPack: 9,
      luckScale: 1,
      rarityBoost: {
        Common: 0.2,
        Uncommon: 0.44,
        Rare: 2.8,
        Epic: 5.2,
        Legendary: 5.2,
        Mythic: 3,
        Contraband: 1
      }
    },
    {
      id: 'godmode-reliquary',
      name: 'Godmode Reliquary',
      cost: 2800000,
      unlockCost: 300000000,
      cardsPerPack: 10,
      luckScale: 1.12,
      rarityBoost: {
        Common: 0.1,
        Uncommon: 0.28,
        Rare: 3.2,
        Epic: 7.2,
        Legendary: 8.5,
        Mythic: 6.2,
        Contraband: 2.6
      }
    }
  ];

  const PACK_BY_ID = PACK_TYPES.reduce((map, pack) => {
    map[pack.id] = pack;
    return map;
  }, {});

  const BOT_NAMES = [
    'RustByte',
    'CaseGoblin',
    'PacketRat',
    'VaultPirate',
    'DiceFang',
    'CoinWraith',
    'ScrapOracle',
    'ChromeViper',
    'TiltedTitan',
    'PotRaccoon',
    'RiskMonkey',
    'CaseBrawler',
    'StackSniper',
    'NeonBandit',
    'OddsReaper',
    'LoopNinja',
    'StakeGhost',
    'TurboLurker',
    'CratePhantom',
    'HexMarauder',
    'ShoveShark',
    'CoinDrifter',
    'TraceRaptor'
  ];

  const SHOP_UPGRADES = [
    {
      id: 'crateLuck',
      title: 'Crate Calibration',
      description: 'Boost Rare+ pull weight (stronger effect on higher-tier crates).',
      baseCost: 2500,
      growth: 2.05,
      maxLevel: 8
    },
    {
      id: 'potLuck',
      title: 'Pot Analytics',
      description: 'Increase your weighted chance in pot rounds.',
      baseCost: 3200,
      growth: 2.2,
      maxLevel: 8
    },
    {
      id: 'sellBoost',
      title: 'Broker License',
      description: 'Increase sell prices for all cards.',
      baseCost: 2200,
      growth: 2.0,
      maxLevel: 8
    }
  ];

  const REBIRTH_BASE_REQUIREMENT = 3000000;
  const AUTO_CLICKER_WINDOW_MS = 6500;
  const AUTO_CLICKER_MIN_CLICKS = 18;
  const AUTO_CLICKER_ANALYSIS_CLICKS = 20;
  const AUTO_CLICKER_MAX_HISTORY = 120;
  const CHEATER_PENALTY_RATE = 0.8;

  const CARD_RARITY_SYSTEM = {
    'freaky henry': {
      cardname: 'Freaky Henry',
      cardimg: './henry/freaky.png',
      cardrareity: 'Common',
      cardworth: 6,
      cardchance: 0.9
    },
    'mogger henry': {
      cardname: 'Mogger Henry',
      cardimg: './henry/mog.png',
      cardrareity: 'Rare',
      cardworth: 70,
      cardchance: 0.5
    },
    'unphased henry': {
      cardname: 'Unphased Henry',
      cardimg: './henry/unphased.png',
      cardrareity: 'Common',
      cardworth: 8,
      cardchance: 0.95
    },
    'thinking henry': {
      cardname: 'Thinking Henry',
      cardimg: './henry/thinking.png',
      cardrareity: 'Common',
      cardworth: 9,
      cardchance: 0.95
    },
    'pizza henry': {
      cardname: 'Pizza Henry',
      cardimg: './henry/pizza.png',
      cardrareity: 'Epic',
      cardworth: 460,
      cardchance: 0.02
    },
    'steaming henry': {
      cardname: 'Steaming Henry',
      cardimg: './henry/steaming.png',
      cardrareity: 'Epic',
      cardworth: 560,
      cardchance: 0.02
    },
    'wizard henry': {
      cardname: 'Wizard Henry',
      cardimg: './henry/wizard.png',
      cardrareity: 'Mythic',
      cardworth: 9400,
      cardchance: 0.003
    },
    'pufferfish henry': {
      cardname: 'Pufferfish Henry',
      cardimg: './henry/pufferfish.png',
      cardrareity: 'Legendary',
      cardworth: 34000,
      cardchance: 0.04
    },
    'drooling henry': {
      cardname: 'Drooling Henry',
      cardimg: './henry/drool.png',
      cardrareity: 'Epic',
      cardworth: 3400,
      cardchance: 0.04
    },
    'wifebeater henry': {
      cardname: 'Wifebeater Henry',
      cardimg: './henry/wifebeater.png',
      cardrareity: 'Rare',
      cardworth: 920,
      cardchance: 0.04
    },
    'mad henry': {
      cardname: 'Mad Henry',
      cardimg: './henry/rhenry.png',
      cardrareity: 'Legendary',
      cardworth: 34000,
      cardchance: 0.0002
    },
    'Hengry': {
      cardname: 'Hengry',
      cardimg: './henry/hengry.png',
      cardrareity: 'Mythic',
      cardworth: 960000,
      cardchance: 0.0003
    },
    'minecraft henry': {
      cardname: 'Minecraft Henry',
      cardimg: './henry/mchen.jpg',
      cardrareity: 'Contraband',
      cardworth: 9000400,
      cardchance: 0.00012
    },
    'youngry': {
      cardname: 'Youngry',
      cardimg: './henry/bhen.jpg',
      cardrareity: 'Legendary',
      cardworth: 3787000,
      cardchance: 0.0003
    },
    'evil henry': {
      cardname: 'Evil Henry',
      cardimg: './henry/evil.jpg',
      cardrareity: 'Epic',
      cardworth: 698400,
      cardchance: 0.0034
    },
    '9th grade henry': {
      cardname: '9th Grade Henry',
      cardimg: './henry/9thgradehenry.jpg',
      cardrareity: 'Mythic',
      cardworth: 976333400,
      cardchance: 0.0013
    },
    'bird henry': {
      cardname: 'Bird Henry',
      cardimg: './henry/bird.png',
      cardrareity: 'Mythic',
      cardworth: 30000400,
      cardchance: 0.0003
    },
    'papi henry': {
      cardname: 'PAPI henry',
      cardimg: './henry/papi.png',
      cardrareity: 'Contraband',
      cardworth: 92000000000,
      cardchance: 0.0000041
    }
  };

  const ACHIEVEMENTS = [
    {
      id: 'first-open',
      title: 'First Crack',
      description: 'Open your first pack.',
      reward: 90,
      condition: (s) => s.packsOpened >= 1
    },
    {
      id: 'pack-grinder',
      title: 'Pack Grinder',
      description: 'Open 20 packs total.',
      reward: 260,
      condition: (s) => s.packsOpened >= 20
    },
    {
      id: 'pack-veteran',
      title: 'Case Veteran',
      description: 'Open 100 packs total.',
      reward: 1200,
      condition: (s) => s.packsOpened >= 100
    },
    {
      id: 'collection-50',
      title: 'Stacked Vault',
      description: 'Own 50 cards at once.',
      reward: 520,
      condition: (s) => getOwnedCardCount(s.inventory) >= 50
    },
    {
      id: 'collection-150',
      title: 'Card Hoarder',
      description: 'Own 150 cards at once.',
      reward: 2200,
      condition: (s) => getOwnedCardCount(s.inventory) >= 150
    },
    {
      id: 'seller',
      title: 'Market Flipper',
      description: 'Sell over $2,000 in cards.',
      reward: 400,
      condition: (s) => s.soldValue >= 2000
    },
    {
      id: 'seller-pro',
      title: 'Market Whale',
      description: 'Sell over $60,000 in cards.',
      reward: 5000,
      condition: (s) => s.soldValue >= 60000
    },
    {
      id: 'pot-winner',
      title: 'Pot Hunter',
      description: 'Win 3 pot rounds.',
      reward: 600,
      condition: (s) => s.potWins >= 3
    },
    {
      id: 'pot-regular',
      title: 'Pot Regular',
      description: 'Play 10 total pot rounds.',
      reward: 1600,
      condition: (s) => (s.potWins + s.potLosses) >= 10
    },
    {
      id: 'pot-profit',
      title: 'Pot Printer',
      description: 'Win over $25,000 from pot rounds.',
      reward: 4200,
      condition: (s) => s.totalPotWinnings >= 25000
    },
    {
      id: 'legendary-pull',
      title: 'Legend Pull',
      description: 'Pull a Legendary or better.',
      reward: 2400,
      condition: (s) => hasPulledAtLeastRarity(s.highestPullId, 'Legendary')
    },
    {
      id: 'god-pull',
      title: 'Sky Drop',
      description: 'Pull a Mythic or Contraband card.',
      reward: 1500,
      condition: (s) => hasPulledAtLeastRarity(s.highestPullId, 'Mythic')
    },
    {
      id: 'contraband-pull',
      title: 'Red Tier',
      description: 'Pull a Contraband card.',
      reward: 12000,
      condition: (s) => hasPulledAtLeastRarity(s.highestPullId, 'Contraband')
    },
    {
      id: 'net-worth',
      title: 'Vault Tycoon',
      description: 'Reach $100,000 net worth.',
      reward: 7000,
      condition: (s) => getNetWorthFromState(s) >= 100000
    },
    {
      id: 'cheater-flagged',
      title: 'Cheater',
      description: 'Auto-clicker detected. Severe balance penalty applied.',
      reward: 0,
      rewardLabel: '-80% balance',
      tone: 'negative',
      condition: (s) => Boolean(s.cheaterDetected)
    }
  ];

  const CATALOG = normalizeCardCatalog(CARD_RARITY_SYSTEM);
  const CARD_IDS = Object.keys(CATALOG);
  if (!CARD_IDS.length) {
    throw new Error('Catalog is empty. Check CARD_RARITY_SYSTEM.');
  }

  PACK_TYPES.forEach((pack) => {
    pack.odds = computePackOdds(pack);
  });

  const dom = {
    tabNav: byId('tab-nav'),
    statBalance: byId('stat-balance'),
    statNetWorth: byId('stat-networth'),
    statPacks: byId('stat-packs'),
    statCards: byId('stat-cards'),
    statSold: byId('stat-sold'),
    statPot: byId('stat-pot'),
    statRebirths: byId('stat-rebirths'),
    marketStrip: byId('market-strip'),
    packButtons: byId('pack-buttons'),
    activePackSelect: byId('active-pack-select'),
    goShop: byId('go-shop'),
    openBest: byId('open-best'),
    openTen: byId('open-ten'),
    advanceMarket: byId('advance-market'),
    lastPull: byId('last-pull'),
    packResults: byId('pack-results'),
    rarityFilter: byId('rarity-filter'),
    sortBy: byId('sort-by'),
    sellDuplicates: byId('sell-duplicates'),
    sellCommons: byId('sell-commons'),
    sellAllTop: byId('sell-all-top'),
    stakeAllTop: byId('stake-all-top'),
    inventoryBody: byId('inventory-body'),
    stakeList: byId('stake-list'),
    stakeValue: byId('stake-value'),
    clearStake: byId('clear-stake'),
    startPotRound: byId('start-pot-round'),
    potStateLabel: byId('pot-state-label'),
    potTimer: byId('pot-timer'),
    potSummary: byId('pot-summary'),
    shopPackList: byId('shop-pack-list'),
    shopUpgradeList: byId('shop-upgrade-list'),
    rebirthInfo: byId('rebirth-info'),
    rebirthBtn: byId('rebirth-btn'),
    achievementList: byId('achievement-list'),
    eventFeed: byId('event-feed'),
    exportSave: byId('export-save'),
    importSave: byId('import-save'),
    resetGame: byId('reset-game'),
    resultModal: byId('result-modal'),
    resultCard: document.querySelector('#result-modal .result-card'),
    closeResult: byId('close-result'),
    resultTitle: byId('result-title'),
    resultText: byId('result-text'),
    resultLoot: byId('result-loot'),
    tabButtons: Array.from(document.querySelectorAll('button[data-tab-target]')),
    tabPanels: {
      crates: byId('tab-crates'),
      inventory: byId('tab-inventory'),
      pot: byId('tab-pot'),
      shop: byId('tab-shop'),
      achievements: byId('tab-achievements'),
      events: byId('tab-events'),
      save: byId('tab-save')
    }
  };

  let state = loadState();
  let activeTab = loadActiveTab();
  let potResolveTicker = null;
  let packClickHistory = [];

  init();

  function init() {
    ensureStateIntegrity();
    populateRarityFilter();
    renderPackButtons();
    wireEvents();
    initTabs();
    ensurePotTicker();
    if (!state.logs.length) {
      pushLog('Simulation loaded. Open a pack to start your run.', 'warning');
    }
    if (state.activePotRound && Date.now() >= state.activePotRound.resolveAt) {
      resolveActivePotRound();
    }
    checkAchievements();
    renderAll();

    setInterval(() => {
      advanceMarket(0.4, true);
      pushLog('Background market tick adjusted values.', 'warning');
      saveState();
      renderAll();
    }, 45000);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function ensureStateIntegrity() {
    if (!Array.isArray(state.ownedPacks)) {
      state.ownedPacks = ['street-crate'];
    }
    state.ownedPacks = Array.from(new Set(state.ownedPacks.filter((id) => Boolean(PACK_BY_ID[id]))));
    if (!state.ownedPacks.includes('street-crate')) {
      state.ownedPacks.unshift('street-crate');
    }
    state.ownedPacks.sort((a, b) => PACK_BY_ID[a].cost - PACK_BY_ID[b].cost);

    if (!PACK_BY_ID[state.activePackId] || !state.ownedPacks.includes(state.activePackId)) {
      state.activePackId = state.ownedPacks[0] || 'street-crate';
    }

    if (!state.upgrades || typeof state.upgrades !== 'object') {
      state.upgrades = {};
    }
    SHOP_UPGRADES.forEach((upgrade) => {
      const raw = Number(state.upgrades[upgrade.id]) || 0;
      state.upgrades[upgrade.id] = clamp(Math.floor(raw), 0, upgrade.maxLevel);
    });

    state.rebirths = Math.max(0, Math.floor(Number(state.rebirths) || 0));
    state.cheaterDetected = Boolean(state.cheaterDetected);
    state.cheaterPenaltyApplied = Boolean(state.cheaterPenaltyApplied);
    if ((!Array.isArray(state.recentPulls) || !state.recentPulls.length) && state.lastPullId && CATALOG[state.lastPullId]) {
      state.recentPulls = [state.lastPullId];
    }
  }

  function getPackById(packId) {
    return PACK_BY_ID[packId] || null;
  }

  function getOwnedPacks() {
    return state.ownedPacks
      .map((id) => getPackById(id))
      .filter(Boolean)
      .sort((a, b) => a.cost - b.cost);
  }

  function isPackOwned(packId) {
    return state.ownedPacks.includes(packId);
  }

  function registerPackClickInput() {
    if (state.cheaterPenaltyApplied) {
      return;
    }
    const now = Date.now();
    packClickHistory.push(now);
    packClickHistory = packClickHistory
      .filter((time) => now - time <= AUTO_CLICKER_WINDOW_MS * 2)
      .slice(-AUTO_CLICKER_MAX_HISTORY);

    if (packClickHistory.length < AUTO_CLICKER_MIN_CLICKS + 1) {
      return;
    }

    const recent = packClickHistory.slice(-AUTO_CLICKER_ANALYSIS_CLICKS);
    const windowClicks = packClickHistory.filter((time) => now - time <= AUTO_CLICKER_WINDOW_MS).length;
    if (recent.length < AUTO_CLICKER_MIN_CLICKS + 1 || windowClicks < AUTO_CLICKER_MIN_CLICKS) {
      return;
    }

    const signal = analyzeAutoClickPattern(recent, windowClicks);
    if (signal.flagged) {
      triggerCheaterPenalty(signal);
    }
  }

  function analyzeAutoClickPattern(recentClicks, windowClicks) {
    if (!Array.isArray(recentClicks) || recentClicks.length < 2) {
      return { flagged: false, score: 0, reasons: [] };
    }
    const intervals = [];
    for (let i = 1; i < recentClicks.length; i += 1) {
      intervals.push(recentClicks[i] - recentClicks[i - 1]);
    }
    const avg = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    const variance = intervals.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const minInterval = Math.min(...intervals);
    const fastClicks = intervals.filter((value) => value <= 135).length;
    const ultraFastClicks = intervals.filter((value) => value <= 90).length;
    const fastRatio = fastClicks / intervals.length;
    const ultraFastRatio = ultraFastClicks / intervals.length;
    const monotony = stdDev / Math.max(1, avg);
    const quantizedBuckets = new Set(intervals.map((value) => Math.round(value / 5) * 5)).size;

    let score = 0;
    const reasons = [];

    if (windowClicks >= 36) {
      score += 3;
      reasons.push('extreme click burst');
    } else if (windowClicks >= 30) {
      score += 2;
      reasons.push('high click burst');
    }
    if (avg <= 150) {
      score += 1;
    }
    if (avg <= 120) {
      score += 2;
      reasons.push('very fast cadence');
    }
    if (stdDev <= 20) {
      score += 2;
      reasons.push('unnaturally consistent timing');
    }
    if (stdDev <= 12) {
      score += 1;
    }
    if (fastRatio >= 0.82) {
      score += 1;
    }
    if (ultraFastRatio >= 0.45) {
      score += 2;
      reasons.push('too many sub-90ms intervals');
    }
    if (minInterval <= 45) {
      score += 3;
      reasons.push('sub-45ms interval detected');
    }
    if (monotony <= 0.18) {
      score += 1;
    }
    if (quantizedBuckets <= 4 && intervals.length >= 16) {
      score += 1;
      reasons.push('fixed timer interval pattern');
    }

    const flagged = score >= 6 || (windowClicks >= 34 && avg <= 135 && stdDev <= 18);
    return {
      flagged,
      score,
      reasons,
      avg,
      stdDev,
      minInterval,
      windowClicks
    };
  }

  function triggerCheaterPenalty(signal) {
    if (state.cheaterPenaltyApplied) {
      return;
    }
    state.cheaterDetected = true;
    state.cheaterPenaltyApplied = true;
    const penalty = Math.floor(state.balance * CHEATER_PENALTY_RATE);
    state.balance = Math.max(0, state.balance - penalty);
    const reasonSummary = signal && Array.isArray(signal.reasons) && signal.reasons.length
      ? ` (${signal.reasons.slice(0, 2).join(', ')})`
      : '';
    pushLog(`Cheater detected: auto-clicker pattern flagged${reasonSummary}. Balance penalized ${money(penalty)} (-80%).`, 'negative');
    checkAchievements();
    openResultModal({
      title: 'Achievement Unlocked: Cheater',
      text: `Auto-clicker detected. ${money(penalty)} removed from your balance (-80%).`,
      detailHtml: `
        <p><strong>Penalty:</strong> -${money(penalty)} from your balance.</p>
        <p><strong>Achievement:</strong> Cheater unlocked.</p>
      `,
      tone: 'negative'
    });
    saveState();
    renderAll();
  }

  function initTabs() {
    setActiveTab(activeTab, true);
  }

  function setActiveTab(target, skipSave) {
    if (!dom.tabPanels[target]) {
      target = 'crates';
    }

    activeTab = target;
    dom.tabButtons.forEach((button) => {
      const isActive = button.dataset.tabTarget === target;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    Object.entries(dom.tabPanels).forEach(([name, panel]) => {
      if (!panel) {
        return;
      }
      const isActive = name === target;
      panel.classList.toggle('active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    if (!skipSave) {
      saveActiveTab(target);
    }
  }

  function populateRarityFilter() {
    const fragment = document.createDocumentFragment();
    RARITY_ORDER.forEach((rarity) => {
      const option = document.createElement('option');
      option.value = rarity;
      option.textContent = rarity;
      fragment.appendChild(option);
    });
    dom.rarityFilter.appendChild(fragment);
  }

  function wireEvents() {
    if (dom.tabNav) {
      dom.tabNav.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-tab-target]');
        if (!button) {
          return;
        }
        setActiveTab(button.dataset.tabTarget);
      });
    }

    dom.packButtons.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-pack]');
      if (!button) {
        return;
      }
      registerPackClickInput();
      const packId = button.dataset.pack;
      const count = toInt(button.dataset.count, 1);
      openPack(packId, count);
    });

    if (dom.activePackSelect) {
      dom.activePackSelect.addEventListener('change', () => {
        const packId = dom.activePackSelect.value;
        if (!isPackOwned(packId)) {
          return;
        }
        state.activePackId = packId;
        saveState();
        renderAll();
      });
    }

    if (dom.goShop) {
      dom.goShop.addEventListener('click', () => setActiveTab('shop'));
    }

    dom.openBest.addEventListener('click', () => {
      registerPackClickInput();
      const affordable = getOwnedPacks().filter((pack) => state.balance >= pack.cost).sort((a, b) => b.cost - a.cost)[0];
      if (!affordable) {
        pushLog('No pack is affordable right now.', 'negative');
        renderAll();
        return;
      }
      openPack(affordable.id, 1);
    });

    dom.openTen.addEventListener('click', () => {
      registerPackClickInput();
      openPack(state.activePackId, 10);
    });
    dom.advanceMarket.addEventListener('click', () => {
      advanceMarket(0.8, false);
      saveState();
      renderAll();
    });

    dom.rarityFilter.addEventListener('change', () => renderInventory());
    dom.sortBy.addEventListener('change', () => renderInventory());

    dom.inventoryBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action][data-id]');
      if (!button) {
        return;
      }
      handleInventoryAction(button.dataset.action, button.dataset.id);
    });

    dom.sellDuplicates.addEventListener('click', sellDuplicates);
    dom.sellCommons.addEventListener('click', () => sellAllByRarity('Common'));
    dom.sellAllTop.addEventListener('click', sellAllSellableCards);
    dom.stakeAllTop.addEventListener('click', stakeAllSellableCards);

    dom.stakeList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-stake-action][data-id]');
      if (!button) {
        return;
      }
      handleStakeAction(button.dataset.stakeAction, button.dataset.id);
    });

    dom.clearStake.addEventListener('click', () => {
      state.stake = {};
      pushLog('Stake cleared.', 'warning');
      saveState();
      renderAll();
    });

    dom.startPotRound.addEventListener('click', startPotRound);

    if (dom.shopPackList) {
      dom.shopPackList.addEventListener('click', handleShopActionClick);
    }
    if (dom.shopUpgradeList) {
      dom.shopUpgradeList.addEventListener('click', handleShopActionClick);
    }
    if (dom.rebirthBtn) {
      dom.rebirthBtn.addEventListener('click', performRebirth);
    }

    dom.exportSave.addEventListener('click', exportSave);
    dom.importSave.addEventListener('click', importSave);
    dom.resetGame.addEventListener('click', resetGame);

    if (dom.closeResult) {
      dom.closeResult.addEventListener('click', closeResultModal);
    }
    if (dom.resultModal) {
      dom.resultModal.addEventListener('click', (event) => {
        if (event.target === dom.resultModal) {
          closeResultModal();
        }
      });
    }
  }

  function openPack(packId, count) {
    const pack = getPackById(packId);
    if (!pack) {
      return;
    }
    if (!isPackOwned(packId)) {
      pushLog(`${pack.name} is locked. Unlock it in the shop.`, 'negative');
      setActiveTab('shop');
      renderAll();
      return;
    }
    let opened = 0;
    const pulledIds = [];

    for (let i = 0; i < count; i += 1) {
      if (state.balance < pack.cost) {
        break;
      }
      state.balance -= pack.cost;
      state.packsOpened += 1;
      opened += 1;

      for (let slot = 0; slot < pack.cardsPerPack; slot += 1) {
        const cardId = drawCardFromPack(pack);
        addCard(state.inventory, cardId, 1);
        pulledIds.push(cardId);
        state.cardsPulled += 1;
        state.lifetimeCards += 1;
        updateHighestPull(cardId);
      }
    }

    if (!opened) {
      pushLog(`Not enough balance for ${pack.name}.`, 'negative');
      renderAll();
      return;
    }

    state.recentPulls = pulledIds.slice(-18);
    const spent = opened * pack.cost;
    const pullValue = pulledIds.reduce((sum, id) => sum + getCardUnitPrice(id), 0);
    const highTierHits = pulledIds.filter((id) => rarityRank(CATALOG[id].cardrareity) >= rarityRank('Legendary')).length;

    if (highTierHits > 0) {
      pushLog(`High-tier hit: ${highTierHits} Legendary+ card(s) from ${pack.name}.`, 'positive');
    }

    pushLog(
      `Opened ${opened} ${pack.name}${opened > 1 ? 's' : ''} for ${money(spent)} and pulled ${pulledIds.length} cards (market ${money(pullValue)}).`,
      'warning'
    );

    const lastId = pulledIds[pulledIds.length - 1];
    state.lastPullId = lastId || null;
    advanceMarket(0.25 + opened * 0.08, true);
    checkAchievements();
    saveState();
    renderAll();
  }

  function drawCardFromPack(pack, options) {
    const applyPlayerLuck = !options || options.applyPlayerLuck !== false;
    const rawLuckMultiplier = applyPlayerLuck ? getCrateLuckMultiplier() : 1;
    const crateLuckMultiplier = getPackLuckMultiplier(pack, rawLuckMultiplier);
    const weighted = CARD_IDS.map((id) => {
      const card = CATALOG[id];
      const boost = pack.rarityBoost[card.cardrareity] || 1;
      const rarityBoost = rarityRank(card.cardrareity) >= rarityRank('Rare') ? crateLuckMultiplier : 1;
      return {
        id,
        weight: Math.max(0, card.cardchance * boost * rarityBoost)
      };
    });
    const selected = pickWeighted(weighted, (entry) => entry.weight);
    return selected.id;
  }

  function handleInventoryAction(action, cardId) {
    switch (action) {
      case 'sell-one':
        sellCard(cardId, 1);
        break;
      case 'sell-all': {
        const available = getSellableQuantity(cardId);
        sellCard(cardId, available);
        break;
      }
      case 'stake-one':
        changeStake(cardId, 1);
        break;
      case 'stake-all': {
        const available = getSellableQuantity(cardId);
        changeStake(cardId, available);
        break;
      }
      default:
        break;
    }
    saveState();
    renderAll();
  }

  function handleStakeAction(action, cardId) {
    switch (action) {
      case 'minus':
        changeStake(cardId, -1);
        break;
      case 'plus':
        changeStake(cardId, 1);
        break;
      case 'remove':
        delete state.stake[cardId];
        break;
      default:
        break;
    }
    saveState();
    renderAll();
  }

  function sellCard(cardId, amount) {
    const quantity = Math.max(0, Math.floor(amount));
    if (!quantity) {
      return 0;
    }
    const sellable = getSellableQuantity(cardId);
    const finalAmount = Math.min(quantity, sellable);
    if (!finalAmount) {
      return 0;
    }
    const price = Math.max(1, Math.round(getCardUnitPrice(cardId) * getSellMultiplier()));
    const gain = price * finalAmount;
    state.balance += gain;
    state.soldValue += gain;
    addCard(state.inventory, cardId, -finalAmount);
    pushLog(`Sold ${finalAmount}x ${CATALOG[cardId].cardname} for ${money(gain)}.`, 'positive');
    checkAchievements();
    return gain;
  }

  function sellDuplicates() {
    let gained = 0;
    let soldCount = 0;
    CARD_IDS.forEach((cardId) => {
      const owned = state.inventory[cardId] || 0;
      const reserved = state.stake[cardId] || 0;
      const available = Math.max(0, owned - reserved);
      if (available > 1) {
        const sold = available - 1;
        gained += sellCard(cardId, sold);
        soldCount += sold;
      }
    });
    if (!soldCount) {
      pushLog('No duplicates available to sell.', 'warning');
    } else {
      pushLog(`Sold ${soldCount} duplicate cards for ${money(gained)}.`, 'positive');
    }
    saveState();
    renderAll();
  }

  function sellAllByRarity(rarity) {
    let gained = 0;
    let soldCount = 0;
    CARD_IDS.forEach((cardId) => {
      if (CATALOG[cardId].cardrareity !== rarity) {
        return;
      }
      const sellable = getSellableQuantity(cardId);
      if (!sellable) {
        return;
      }
      gained += sellCard(cardId, sellable);
      soldCount += sellable;
    });

    if (!soldCount) {
      pushLog(`No ${rarity} cards available to sell.`, 'warning');
    } else {
      pushLog(`Sold ${soldCount} ${rarity} cards for ${money(gained)}.`, 'positive');
    }
    saveState();
    renderAll();
  }

  function sellAllSellableCards() {
    if (!state.activePotRound && Object.keys(state.stake).length) {
      state.stake = {};
      pushLog('Queued stake released so all cards can be sold.', 'warning');
    }

    let gained = 0;
    let soldCount = 0;
    CARD_IDS.forEach((cardId) => {
      const quantity = state.inventory[cardId] || 0;
      if (!quantity) {
        return;
      }
      gained += sellCard(cardId, quantity);
      soldCount += quantity;
    });
    if (!soldCount) {
      pushLog('No sellable cards to liquidate.', 'warning');
    } else {
      pushLog(`Sold ${soldCount} cards for ${money(gained)}.`, 'positive');
    }
    saveState();
    renderAll();
  }

  function stakeAllSellableCards() {
    if (state.activePotRound) {
      pushLog('Cannot modify stake while a pot round is running.', 'warning');
      renderAll();
      return;
    }
    let total = 0;
    CARD_IDS.forEach((cardId) => {
      const sellable = getSellableQuantity(cardId);
      if (sellable <= 0) {
        return;
      }
      changeStake(cardId, sellable);
      total += sellable;
    });
    if (!total) {
      pushLog('No sellable cards available to stake.', 'warning');
    } else {
      pushLog(`Added ${total} cards to your stake.`, 'positive');
    }
    saveState();
    renderAll();
  }

  function handleShopActionClick(event) {
    const button = event.target.closest('button[data-shop-action]');
    if (!button) {
      return;
    }
    const action = button.dataset.shopAction;
    if (action === 'unlock-pack') {
      unlockPack(button.dataset.packId);
      return;
    }
    if (action === 'set-active-pack') {
      const packId = button.dataset.packId;
      if (isPackOwned(packId)) {
        state.activePackId = packId;
        pushLog(`Active crate set to ${PACK_BY_ID[packId].name}.`, 'positive');
        saveState();
        renderAll();
      }
      return;
    }
    if (action === 'buy-upgrade') {
      buyUpgrade(button.dataset.upgradeId);
    }
  }

  function unlockPack(packId) {
    const pack = getPackById(packId);
    if (!pack || pack.unlockCost <= 0) {
      return;
    }
    if (isPackOwned(packId)) {
      pushLog(`${pack.name} is already unlocked.`, 'warning');
      renderAll();
      return;
    }
    if (state.balance < pack.unlockCost) {
      pushLog(`Need ${money(pack.unlockCost)} to unlock ${pack.name}.`, 'negative');
      renderAll();
      return;
    }
    state.balance -= pack.unlockCost;
    state.ownedPacks.push(packId);
    state.ownedPacks = Array.from(new Set(state.ownedPacks)).sort((a, b) => PACK_BY_ID[a].cost - PACK_BY_ID[b].cost);
    state.activePackId = packId;
    pushLog(`Unlocked ${pack.name} for ${money(pack.unlockCost)}.`, 'positive');
    saveState();
    renderAll();
  }

  function buyUpgrade(upgradeId) {
    const upgrade = SHOP_UPGRADES.find((entry) => entry.id === upgradeId);
    if (!upgrade) {
      return;
    }
    const level = getUpgradeLevel(upgradeId);
    if (level >= upgrade.maxLevel) {
      pushLog(`${upgrade.title} is maxed out.`, 'warning');
      renderAll();
      return;
    }
    const cost = getUpgradeCost(upgrade, level);
    if (state.balance < cost) {
      pushLog(`Need ${money(cost)} to buy ${upgrade.title}.`, 'negative');
      renderAll();
      return;
    }
    state.balance -= cost;
    state.upgrades[upgradeId] = level + 1;
    pushLog(`${upgrade.title} upgraded to level ${level + 1}.`, 'positive');
    saveState();
    renderAll();
  }

  function performRebirth() {
    const requirement = getRebirthRequirement();
    const netWorth = getNetWorth();
    if (state.activePotRound) {
      pushLog('Finish the active pot round before rebirthing.', 'warning');
      renderAll();
      return;
    }
    if (netWorth < requirement) {
      pushLog(`Rebirth requires ${money(requirement)} net worth.`, 'negative');
      renderAll();
      return;
    }

    const approved = window.confirm(
      `Rebirth now? This resets your current run but keeps unlocked crates/upgrades.\nRequired: ${money(requirement)} | Current: ${money(netWorth)}`
    );
    if (!approved) {
      return;
    }

    const keptPacks = Array.from(new Set((state.ownedPacks || []).concat('street-crate'))).filter((id) => Boolean(PACK_BY_ID[id]));
    const keptUpgrades = sanitizeUpgradeMap(state.upgrades);
    const keptAchievements = Array.isArray(state.unlockedAchievements) ? [...state.unlockedAchievements] : [];
    const nextRebirths = state.rebirths + 1;

    state = buildInitialState();
    state.rebirths = nextRebirths;
    state.ownedPacks = keptPacks.sort((a, b) => PACK_BY_ID[a].cost - PACK_BY_ID[b].cost);
    state.activePackId = state.ownedPacks.includes('street-crate') ? 'street-crate' : state.ownedPacks[0];
    state.upgrades = keptUpgrades;
    state.unlockedAchievements = keptAchievements;
    state.balance = 500 + nextRebirths * 400;
    closeResultModal();
    setActiveTab('crates');
    pushLog(`Rebirth complete. Run #${nextRebirths} started with ${money(state.balance)}.`, 'positive');
    saveState();
    renderAll();
  }

  function changeStake(cardId, delta) {
    const owned = state.inventory[cardId] || 0;
    const current = state.stake[cardId] || 0;
    const next = clamp(current + delta, 0, owned);
    if (!next) {
      delete state.stake[cardId];
      return;
    }
    state.stake[cardId] = next;
  }

  function ensurePotTicker() {
    if (potResolveTicker) {
      return;
    }
    potResolveTicker = setInterval(() => {
      if (!state.activePotRound) {
        return;
      }
      if (Date.now() >= state.activePotRound.resolveAt) {
        resolveActivePotRound();
        return;
      }
      renderPotSummary();
    }, 250);
  }

  function startPotRound() {
    if (state.activePotRound) {
      pushLog('A pot round is already running. Wait for the timer to finish.', 'warning');
      setActiveTab('pot');
      renderAll();
      return;
    }

    closeResultModal();
    syncStakeAgainstInventory();
    const playerValue = getMapValue(state.stake);
    if (!playerValue) {
      pushLog('Add cards to your stake before starting a pot round.', 'negative');
      renderAll();
      return;
    }

    const playerCards = cloneMap(state.stake);
    Object.entries(playerCards).forEach(([cardId, qty]) => {
      addCard(state.inventory, cardId, -qty);
    });
    state.stake = {};

    const startedAt = Date.now();
    const botEntries = createBotEntries(playerValue, startedAt);
    const participants = [{ name: 'You', value: playerValue, cards: playerCards, isPlayer: true, joinAt: startedAt }, ...botEntries];
    const totalPotValue = participants.reduce((sum, participant) => sum + participant.value, 0);
    const playerChance = getParticipantChance(participants[0], participants);
    const resolveAt = startedAt + randomInt(7000, 10500);

    state.activePotRound = {
      at: startedAt,
      resolveAt,
      totalPotValue,
      playerValue,
      playerChance,
      participants
    };

    pushLog(
      `Pot round started. ${participants.length} players, total pot ${money(totalPotValue)}. Rolling...`,
      'warning'
    );
    setActiveTab('pot');
    checkAchievements();
    saveState();
    renderAll();
  }

  function resolveActivePotRound() {
    if (!state.activePotRound) {
      return;
    }

    const activeRound = state.activePotRound;
    const participants = activeRound.participants;
    const winner = pickWeighted(participants, getParticipantWeight);
    const totalPotValue = participants.reduce((sum, participant) => sum + participant.value, 0);
    const playerValue = activeRound.playerValue;
    const playerChance = getParticipantChance(participants.find((entry) => entry.isPlayer) || participants[0], participants);
    const potCards = mergeMaps(participants.map((participant) => participant.cards));

    state.lastPotRound = {
      at: Date.now(),
      winner: winner.name,
      totalPotValue,
      playerValue,
      playerChance,
      participants: participants.map((participant) => ({
        name: participant.name,
        value: participant.value,
        isPlayer: participant.isPlayer,
        cards: cloneMap(participant.cards)
      }))
    };

    state.activePotRound = null;
    if (winner.isPlayer) {
      Object.entries(potCards).forEach(([cardId, qty]) => {
        addCard(state.inventory, cardId, qty);
      });
      const winnings = getMapValue(potCards);
      state.potWins += 1;
      state.totalPotWinnings += winnings;
      pushLog(`Pot won! You scooped ${money(totalPotValue)} from ${participants.length - 1} opponents.`, 'positive');
      openResultModal({
        title: 'You Won the Pot!',
        text: `You beat ${participants.length - 1} players and won ${money(totalPotValue)} in total card value.`,
        cards: potCards,
        tone: 'positive'
      });
    } else {
      state.potLosses += 1;
      pushLog(`Pot lost to ${winner.name}. Your stake was ${money(playerValue)}.`, 'negative');
      openResultModal({
        title: 'You Lost This Round',
        text: `${winner.name} won the pot. Your stake of ${money(playerValue)} was lost.`,
        cards: null,
        tone: 'negative'
      });
    }

    advanceMarket(0.5, true);
    checkAchievements();
    saveState();
    renderAll();
  }

  function createBotEntries(playerValue, startedAt) {
    const count = playerValue >= 50000000
      ? randomInt(9, 13)
      : playerValue >= 500000
        ? randomInt(7, 10)
        : randomInt(5, 8);
    const names = shuffle([...BOT_NAMES]).slice(0, count);
    return names.map((name, index) => {
      const aggression = 0.55 + Math.random() * 1.25;
      const baseTarget = playerValue * aggression;
      const target = Math.max(90, Math.round(baseTarget + index * 35));
      const cards = {};
      let value = 0;
      let attempts = 0;

      while (value < target && attempts < 140) {
        attempts += 1;
        const pack = chooseBotPack(playerValue);
        const cardId = drawCardFromPack(pack, { applyPlayerLuck: false });
        addCard(cards, cardId, 1);
        value += getCardUnitPrice(cardId);
      }

      if (!value) {
        const fallbackId = CARD_IDS[Math.floor(Math.random() * CARD_IDS.length)];
        addCard(cards, fallbackId, 1);
        value = getCardUnitPrice(fallbackId);
      }

      return {
        name,
        value,
        cards,
        isPlayer: false,
        joinAt: startedAt + randomInt(900, 5200)
      };
    });
  }

  function chooseBotPack(playerValue) {
    if (playerValue >= 5000) {
      return PACK_TYPES[3];
    }
    if (playerValue >= 1700) {
      return Math.random() > 0.35 ? PACK_TYPES[2] : PACK_TYPES[3];
    }
    if (playerValue >= 700) {
      return Math.random() > 0.25 ? PACK_TYPES[2] : PACK_TYPES[1];
    }
    return Math.random() > 0.35 ? PACK_TYPES[1] : PACK_TYPES[0];
  }

  function advanceMarket(intensity, silent) {
    let largestShift = { rarity: 'Common', shift: 0 };
    RARITY_ORDER.forEach((rarity) => {
      const current = state.market[rarity] || 1;
      const volatility = RARITY_META[rarity].volatility;
      const step = (Math.random() * 0.24 - 0.12) * intensity * volatility;
      const next = clamp(current * (1 + step), 0.55, 2.8);
      state.market[rarity] = next;
      if (Math.abs(step) > Math.abs(largestShift.shift)) {
        largestShift = { rarity, shift: step };
      }
    });

    if (!silent) {
      const direction = largestShift.shift >= 0 ? 'up' : 'down';
      pushLog(
        `Market moved. ${largestShift.rarity} shifted ${direction} by ${(Math.abs(largestShift.shift) * 100).toFixed(1)}%.`,
        'warning'
      );
    }
  }

  function updateHighestPull(cardId) {
    if (!state.highestPullId) {
      state.highestPullId = cardId;
      return;
    }
    if (CATALOG[cardId].cardworth > CATALOG[state.highestPullId].cardworth) {
      state.highestPullId = cardId;
    }
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach((achievement) => {
      if (state.unlockedAchievements.includes(achievement.id)) {
        return;
      }
      if (!achievement.condition(state)) {
        return;
      }
      state.unlockedAchievements.push(achievement.id);
      const reward = Number(achievement.reward) || 0;
      if (reward !== 0) {
        state.balance += reward;
      }
      const rewardText = reward > 0 ? ` (+${money(reward)})` : reward < 0 ? ` (-${money(Math.abs(reward))})` : '';
      pushLog(`Achievement unlocked: ${achievement.title}${rewardText}.`, achievement.tone || (reward < 0 ? 'negative' : 'positive'));
    });
  }

  function renderAll() {
    ensureStateIntegrity();
    syncStakeAgainstInventory();
    renderStats();
    renderActivePackControls();
    renderMarketStrip();
    renderPackButtons();
    renderPackButtonsState();
    renderPullGrid();
    renderInventory();
    renderStake();
    renderPotSummary();
    renderShop();
    renderAchievements();
    renderEvents();
  }

  function renderStats() {
    dom.statBalance.textContent = money(state.balance);
    dom.statNetWorth.textContent = money(getNetWorth());
    dom.statPacks.textContent = String(state.packsOpened);
    dom.statCards.textContent = String(state.cardsPulled);
    dom.statSold.textContent = money(state.soldValue);
    dom.statPot.textContent = `${state.potWins} / ${state.potLosses}`;
    dom.statRebirths.textContent = String(state.rebirths);
    if (state.lastPullId) {
      const card = CATALOG[state.lastPullId];
      dom.lastPull.textContent = `Last pull: ${card.cardname} (${card.cardrareity}, ${money(getCardUnitPrice(state.lastPullId))})`;
    } else {
      dom.lastPull.textContent = 'No pulls yet.';
    }
  }

  function renderActivePackControls() {
    const owned = getOwnedPacks();
    if (!owned.length) {
      return;
    }
    dom.activePackSelect.innerHTML = owned
      .map((pack) => `<option value="${pack.id}">${pack.name} (${money(pack.cost)})</option>`)
      .join('');
    dom.activePackSelect.value = state.activePackId;

    const activePack = getPackById(state.activePackId);
    if (activePack) {
      dom.openTen.textContent = `Open 10 ${activePack.name}`;
    } else {
      dom.openTen.textContent = 'Open 10 Active Crates';
    }
  }

  function renderMarketStrip() {
    dom.marketStrip.innerHTML = RARITY_ORDER.map((rarity) => {
      const multiplier = state.market[rarity] || 1;
      const color = RARITY_META[rarity].color;
      return `
        <div class="market-chip" style="border-color:${color};">
          <p>${rarity}</p>
          <strong style="color:${color};">${multiplier.toFixed(2)}x</strong>
        </div>
      `;
    }).join('');
  }

  function renderPackButtons() {
    const pack = getPackById(state.activePackId);
    if (!pack || !isPackOwned(pack.id)) {
      dom.packButtons.innerHTML = '<p class="empty">No owned crates. Unlock one in the shop.</p>';
      return;
    }
    const odds = computePackOdds(pack, getCrateLuckMultiplier());
    dom.packButtons.innerHTML = `
      <article class="pack-card">
        <h3>${pack.name}</h3>
        <p>Cost: ${money(pack.cost)} | Cards: ${pack.cardsPerPack}</p>
        <p>Rare+: ${odds.rarePlus}% | Legendary+: ${odds.legendaryPlus}%</p>
        <p>Mythic+: ${odds.mythicPlus}% | Contraband: ${odds.contraband}%</p>
        <div class="pack-actions">
          <button data-pack="${pack.id}" data-count="1">Open 1</button>
          <button data-pack="${pack.id}" data-count="5">Open 5</button>
        </div>
      </article>
    `;
  }

  function renderPackButtonsState() {
    dom.packButtons.querySelectorAll('button[data-pack][data-count]').forEach((button) => {
      const pack = getPackById(button.dataset.pack);
      const count = toInt(button.dataset.count, 1);
      if (!pack) {
        button.disabled = true;
        return;
      }
      button.disabled = state.balance < pack.cost * count || !isPackOwned(pack.id);
    });
    const owned = getOwnedPacks();
    const activePack = getPackById(state.activePackId);
    dom.openBest.disabled = !owned.some((pack) => state.balance >= pack.cost);
    dom.openTen.disabled = !activePack || !isPackOwned(activePack.id) || state.balance < activePack.cost * 10;
  }

  function renderPullGrid() {
    if (!state.recentPulls.length) {
      dom.packResults.classList.add('empty');
      dom.packResults.innerHTML = '<p class="pull-empty">Open a crate to see your recent pulls here.</p>';
      return;
    }
    dom.packResults.classList.remove('empty');
    dom.packResults.innerHTML = state.recentPulls
      .map((cardId, index) => renderCardTile(cardId, index))
      .join('');
  }

  function renderCardTile(cardId, index) {
    const card = CATALOG[cardId];
    const color = RARITY_META[card.cardrareity].color;
    return `
      <article class="pull-card" style="--i:${index}; border-color:${color};">
        <img src="${card.cardimg}" alt="${card.cardname}">
        <div class="pull-meta">
          <strong>${card.cardname}</strong>
          <p>${card.cardrareity} | ${money(getCardUnitPrice(cardId))}</p>
        </div>
      </article>
    `;
  }

  function renderInventory() {
    const rows = buildInventoryRows();
    if (!rows.length) {
      dom.inventoryBody.innerHTML = '<tr><td colspan="7" class="empty">No cards available in inventory.</td></tr>';
      return;
    }

    dom.inventoryBody.innerHTML = rows
      .map((entry) => {
        const meta = RARITY_META[entry.rarity];
        const canSell = entry.sellable > 0;
        return `
          <tr>
            <td>
              <div class="cell-card">
                <img src="${entry.card.cardimg}" alt="${entry.card.cardname}">
                <span>${entry.card.cardname}</span>
              </div>
            </td>
            <td><span class="rarity-pill" style="color:${meta.color};">${entry.rarity}</span></td>
            <td>${entry.owned}</td>
            <td>${entry.staked}</td>
            <td>${money(entry.unitPrice)}</td>
            <td>${money(entry.totalValue)}</td>
            <td>
              <div class="row-actions">
                <button data-action="sell-one" data-id="${entry.id}" ${canSell ? '' : 'disabled'}>Sell 1</button>
                <button data-action="sell-all" data-id="${entry.id}" ${canSell ? '' : 'disabled'}>Sell All</button>
                <button data-action="stake-one" data-id="${entry.id}" ${entry.sellable ? '' : 'disabled'}>Stake 1</button>
                <button data-action="stake-all" data-id="${entry.id}" ${entry.sellable ? '' : 'disabled'}>Stake All</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function buildInventoryRows() {
    const filter = dom.rarityFilter.value || 'All';
    const sort = dom.sortBy.value || 'value-desc';
    const rows = CARD_IDS.map((cardId) => {
      const owned = state.inventory[cardId] || 0;
      if (!owned) {
        return null;
      }
      const staked = state.stake[cardId] || 0;
      const unitPrice = getCardUnitPrice(cardId);
      const card = CATALOG[cardId];
      return {
        id: cardId,
        card,
        rarity: card.cardrareity,
        owned,
        staked,
        sellable: Math.max(0, owned - staked),
        unitPrice,
        totalValue: owned * unitPrice
      };
    }).filter(Boolean);

    const filtered = rows.filter((entry) => filter === 'All' || entry.rarity === filter);
    filtered.sort((a, b) => compareInventory(a, b, sort));
    return filtered;
  }

  function compareInventory(a, b, sort) {
    switch (sort) {
      case 'value-asc':
        return a.totalValue - b.totalValue;
      case 'qty-desc':
        return b.owned - a.owned;
      case 'name-asc':
        return a.card.cardname.localeCompare(b.card.cardname);
      case 'rarity-desc':
        return rarityRank(b.rarity) - rarityRank(a.rarity) || b.totalValue - a.totalValue;
      case 'value-desc':
      default:
        return b.totalValue - a.totalValue;
    }
  }

  function renderStake() {
    const entries = Object.entries(state.stake).filter(([, qty]) => qty > 0);
    const roundRunning = Boolean(state.activePotRound);
    dom.startPotRound.textContent = roundRunning ? 'Round Running...' : 'Start Pot Round';
    if (!entries.length) {
      dom.stakeList.innerHTML = '<p class="empty">No cards staked yet.</p>';
      dom.stakeValue.textContent = money(0);
      dom.startPotRound.disabled = roundRunning;
      dom.clearStake.disabled = roundRunning;
      return;
    }

    dom.stakeList.innerHTML = entries
      .sort((a, b) => getCardUnitPrice(b[0]) - getCardUnitPrice(a[0]))
      .map(([cardId, qty]) => {
        const card = CATALOG[cardId];
        const total = getCardUnitPrice(cardId) * qty;
        return `
          <div class="stake-item">
            <div class="stake-meta">
              <strong>${card.cardname}</strong><br>
              <small>${card.cardrareity} | ${qty}x | ${money(total)}</small>
            </div>
            <div class="stake-controls">
              <button data-stake-action="minus" data-id="${cardId}">-</button>
              <button data-stake-action="plus" data-id="${cardId}">+</button>
              <button data-stake-action="remove" data-id="${cardId}">Remove</button>
            </div>
          </div>
        `;
      })
      .join('');

    dom.stakeValue.textContent = money(getMapValue(state.stake));
    dom.startPotRound.disabled = roundRunning;
    dom.clearStake.disabled = roundRunning;
  }

  function renderPotSummary() {
    if (state.activePotRound) {
      const round = state.activePotRound;
      const now = Date.now();
      const msLeft = Math.max(0, round.resolveAt - now);
      const playerParticipant = round.participants.find((entry) => entry.isPlayer) || round.participants[0];
      const livePlayerChance = getParticipantChance(playerParticipant, round.participants);
      dom.potStateLabel.textContent = `Round live: ${round.participants.length} players in the pot`;
      dom.potTimer.textContent = formatCountdown(msLeft);
      const participantsHtml = round.participants
        .map((entry) => {
          const joined = entry.joinAt <= now;
          const chance = getParticipantChance(entry, round.participants) * 100;
          if (!joined) {
            return `
              <article class="pot-player">
                <h4>${entry.name}</h4>
                <p>Joining in ${formatCountdown(entry.joinAt - now)}...</p>
              </article>
            `;
          }
          return `
            <article class="pot-player">
              <h4>${entry.name}</h4>
              <p>Stake: ${money(entry.value)} (${chance.toFixed(2)}% chance)</p>
              ${renderCardMapList(entry.cards, 5)}
            </article>
          `;
        })
        .join('');
      dom.potSummary.innerHTML = `
        <p class="round-line"><strong>Total Pot:</strong> ${money(round.totalPotValue)}</p>
        <p class="round-line"><strong>Your Stake:</strong> ${money(round.playerValue)} (${(livePlayerChance * 100).toFixed(2)}%)</p>
        ${participantsHtml}
      `;
      return;
    }

    dom.potTimer.textContent = '00:00';
    if (!state.lastPotRound) {
      dom.potStateLabel.textContent = 'Waiting for a round to start.';
      dom.potSummary.innerHTML = '<p>Start a round after adding cards to your stake.</p>';
      return;
    }

    const round = state.lastPotRound;
    dom.potStateLabel.textContent = `Last round winner: ${round.winner}`;
    const participantsHtml = round.participants
      .map((entry) => `
        <article class="pot-player">
          <h4>${entry.name}</h4>
          <p>Stake: ${money(entry.value)}</p>
          ${entry.cards ? renderCardMapList(entry.cards, 4) : ''}
        </article>
      `)
      .join('');

    dom.potSummary.innerHTML = `
      <p class="round-line"><strong>Winner:</strong> ${round.winner}</p>
      <p class="round-line"><strong>Total Pot:</strong> ${money(round.totalPotValue)}</p>
      <p class="round-line"><strong>Your Stake:</strong> ${money(round.playerValue)} (${(round.playerChance * 100).toFixed(2)}% chance)</p>
      ${participantsHtml}
    `;
  }

  function renderShop() {
    if (!dom.shopPackList || !dom.shopUpgradeList) {
      return;
    }
    renderShopPacks();
    renderShopUpgrades();
    renderRebirthPanel();
  }

  function renderShopPacks() {
    dom.shopPackList.innerHTML = PACK_TYPES.map((pack) => {
      const owned = isPackOwned(pack.id);
      if (pack.unlockCost <= 0) {
        return `
          <article class="shop-item">
            <h4>${pack.name}</h4>
            <p>Starter crate (always unlocked)</p>
            <p>Pack Cost: ${money(pack.cost)}</p>
            <div class="shop-actions">
              <button data-shop-action="set-active-pack" data-pack-id="${pack.id}" ${state.activePackId === pack.id ? 'disabled' : ''}>
                ${state.activePackId === pack.id ? 'Active' : 'Set Active'}
              </button>
            </div>
          </article>
        `;
      }

      return `
        <article class="shop-item">
          <h4>${pack.name}</h4>
          <p>Pack Cost: ${money(pack.cost)}</p>
          <p>Unlock Fee: ${money(pack.unlockCost)} (one-time)</p>
          <div class="shop-actions">
            ${owned
              ? `<button data-shop-action="set-active-pack" data-pack-id="${pack.id}" ${state.activePackId === pack.id ? 'disabled' : ''}>
                  ${state.activePackId === pack.id ? 'Active' : 'Set Active'}
                </button>`
              : `<button data-shop-action="unlock-pack" data-pack-id="${pack.id}" ${state.balance >= pack.unlockCost ? '' : 'disabled'}>
                  Unlock
                </button>`}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderShopUpgrades() {
    dom.shopUpgradeList.innerHTML = SHOP_UPGRADES.map((upgrade) => {
      const level = getUpgradeLevel(upgrade.id);
      const maxed = level >= upgrade.maxLevel;
      const cost = getUpgradeCost(upgrade, level);
      return `
        <article class="shop-item">
          <h4>${upgrade.title}</h4>
          <p>${upgrade.description}</p>
          <p>Level: ${level}/${upgrade.maxLevel}</p>
          <p>${maxed ? 'Status: Maxed' : `Next Cost: ${money(cost)}`}</p>
          <div class="shop-actions">
            <button data-shop-action="buy-upgrade" data-upgrade-id="${upgrade.id}" ${maxed || state.balance < cost ? 'disabled' : ''}>
              ${maxed ? 'Maxed' : 'Buy Upgrade'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderRebirthPanel() {
    const requirement = getRebirthRequirement();
    const netWorth = getNetWorth();
    const ready = netWorth >= requirement;
    dom.rebirthInfo.textContent = `Current net worth ${money(netWorth)} / ${money(requirement)} required. Rebirths: ${state.rebirths}.`;
    dom.rebirthBtn.disabled = !ready || Boolean(state.activePotRound);
    dom.rebirthBtn.textContent = ready ? 'Rebirth Run' : 'Rebirth Locked';
  }

  function renderAchievements() {
    dom.achievementList.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const unlocked = state.unlockedAchievements.includes(achievement.id);
      const cardClass = [
        'achievement-card',
        unlocked ? 'unlocked' : '',
        unlocked && achievement.tone === 'negative' ? 'penalty' : ''
      ].filter(Boolean).join(' ');
      return `
        <article class="${cardClass}">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          <p>Reward: ${achievement.rewardLabel || money(achievement.reward)}</p>
          <p>Status: ${unlocked ? 'Unlocked' : 'Locked'}</p>
        </article>
      `;
    }).join('');
  }

  function renderEvents() {
    if (!state.logs.length) {
      dom.eventFeed.innerHTML = '<li>No events yet.</li>';
      return;
    }
    dom.eventFeed.innerHTML = state.logs
      .map((entry) => {
        const time = new Date(entry.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        return `<li class="${entry.tone}"><time>${time}</time> ${entry.message}</li>`;
      })
      .join('');
  }

  function renderCardMapList(cardMap, limit) {
    const list = Object.entries(cardMap || {})
      .filter(([, qty]) => qty > 0)
      .map(([cardId, qty]) => ({
        cardId,
        qty,
        value: getCardUnitPrice(cardId) * qty
      }))
      .sort((a, b) => b.value - a.value);
    if (!list.length) {
      return '<p>No cards listed.</p>';
    }
    const visible = list.slice(0, limit);
    const hiddenCount = Math.max(0, list.length - visible.length);
    const lines = visible.map((entry) => `<li>${CATALOG[entry.cardId].cardname} x${entry.qty}</li>`).join('');
    return `
      <ul class="pot-card-list">
        ${lines}
        ${hiddenCount ? `<li>+${hiddenCount} more card stacks</li>` : ''}
      </ul>
    `;
  }

  function formatCountdown(ms) {
    const safe = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
    const seconds = (safe % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function openResultModal(payload) {
    if (!dom.resultModal) {
      return;
    }
    if (dom.resultCard) {
      dom.resultCard.classList.remove('result-positive', 'result-negative');
      if (payload.tone === 'positive') {
        dom.resultCard.classList.add('result-positive');
      }
      if (payload.tone === 'negative') {
        dom.resultCard.classList.add('result-negative');
      }
    }
    dom.resultTitle.textContent = payload.title;
    dom.resultText.textContent = payload.text;
    if (typeof payload.detailHtml === 'string') {
      dom.resultLoot.innerHTML = payload.detailHtml;
    } else if (payload.cards) {
      const totalValue = getMapValue(payload.cards);
      dom.resultLoot.innerHTML = `
        <p><strong>Total Won:</strong> ${money(totalValue)}</p>
        ${renderCardMapList(payload.cards, 10)}
      `;
    } else {
      dom.resultLoot.innerHTML = '<p>No cards won this round.</p>';
    }
    dom.resultModal.removeAttribute('hidden');
  }

  function closeResultModal() {
    if (dom.resultModal) {
      dom.resultModal.setAttribute('hidden', '');
    }
    if (dom.resultCard) {
      dom.resultCard.classList.remove('result-positive', 'result-negative');
    }
  }

  function exportSave() {
    const payload = JSON.stringify(state);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(payload)
        .then(() => {
          pushLog('Save copied to clipboard.', 'positive');
          renderEvents();
        })
        .catch(() => {
          window.prompt('Copy your save JSON:', payload);
        });
      return;
    }
    window.prompt('Copy your save JSON:', payload);
  }

  function importSave() {
    const raw = window.prompt('Paste your save JSON:');
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      state = hydrateState(parsed);
      pushLog('Save imported successfully.', 'positive');
      saveState();
      renderAll();
    } catch (error) {
      pushLog('Import failed. Invalid save payload.', 'negative');
      renderEvents();
    }
  }

  function resetGame() {
    const approved = window.confirm('Reset all progress? This cannot be undone.');
    if (!approved) {
      return;
    }
    state = buildInitialState();
    closeResultModal();
    pushLog('Progress reset. New run started.', 'negative');
    saveState();
    renderAll();
  }

  function getNetWorth() {
    return state.balance + getMapValue(state.inventory);
  }

  function getNetWorthFromState(snapshot) {
    const inventoryValue = Object.entries(snapshot.inventory || {}).reduce(
      (sum, [cardId, qty]) => sum + getCardUnitPriceFromSnapshot(cardId, snapshot) * qty,
      0
    );
    return (snapshot.balance || 0) + inventoryValue;
  }

  function getCardUnitPriceFromSnapshot(cardId, snapshot) {
    const card = CATALOG[cardId];
    if (!card) {
      return 0;
    }
    const multiplier = (snapshot.market && snapshot.market[card.cardrareity]) || 1;
    return Math.max(1, Math.round(card.cardworth * multiplier));
  }

  function hasPulledAtLeastRarity(highestPullId, rarityName) {
    if (!highestPullId || !CATALOG[highestPullId]) {
      return false;
    }
    return rarityRank(CATALOG[highestPullId].cardrareity) >= rarityRank(rarityName);
  }

  function getUpgradeLevel(upgradeId) {
    return Math.max(0, Math.floor(Number(state.upgrades[upgradeId]) || 0));
  }

  function getUpgradeCost(upgrade, currentLevel) {
    return Math.round(upgrade.baseCost * Math.pow(upgrade.growth, currentLevel));
  }

  function getPackLuckMultiplier(pack, rawMultiplier) {
    const base = Math.max(1, Number(rawMultiplier) || 1);
    const parsedScale = Number(pack && pack.luckScale);
    const scale = Number.isFinite(parsedScale) ? clamp(parsedScale, 0, 1.5) : 1;
    return 1 + (base - 1) * scale;
  }

  function sanitizeUpgradeMap(candidate) {
    const map = {};
    SHOP_UPGRADES.forEach((upgrade) => {
      const level = Math.floor(Number(candidate && candidate[upgrade.id]) || 0);
      map[upgrade.id] = clamp(level, 0, upgrade.maxLevel);
    });
    return map;
  }

  function getCrateLuckMultiplier() {
    return 1 + getUpgradeLevel('crateLuck') * 0.045 + state.rebirths * 0.018;
  }

  function getPotLuckMultiplier() {
    return 1 + getUpgradeLevel('potLuck') * 0.05 + state.rebirths * 0.04;
  }

  function getSellMultiplier() {
    return 1 + getUpgradeLevel('sellBoost') * 0.06 + state.rebirths * 0.08;
  }

  function getParticipantWeight(entry) {
    if (!entry) {
      return 0;
    }
    return entry.value * (entry.isPlayer ? getPotLuckMultiplier() : 1);
  }

  function getParticipantChance(entry, participants) {
    if (!entry || !Array.isArray(participants) || !participants.length) {
      return 0;
    }
    const total = participants.reduce((sum, participant) => sum + getParticipantWeight(participant), 0);
    return getParticipantWeight(entry) / Math.max(1, total);
  }

  function getRebirthRequirement() {
    return Math.round(REBIRTH_BASE_REQUIREMENT * Math.pow(2.05, state.rebirths));
  }

  function getCardUnitPrice(cardId) {
    const card = CATALOG[cardId];
    if (!card) {
      return 0;
    }
    const multiplier = state.market[card.cardrareity] || 1;
    return Math.max(1, Math.round(card.cardworth * multiplier));
  }

  function getMapValue(map) {
    return Object.entries(map).reduce((sum, [cardId, qty]) => sum + getCardUnitPrice(cardId) * qty, 0);
  }

  function getSellableQuantity(cardId) {
    const owned = state.inventory[cardId] || 0;
    const staked = state.stake[cardId] || 0;
    return Math.max(0, owned - staked);
  }

  function addCard(map, cardId, delta) {
    const current = map[cardId] || 0;
    const next = current + delta;
    if (next <= 0) {
      delete map[cardId];
      return;
    }
    map[cardId] = next;
  }

  function pushLog(message, tone) {
    state.logs.unshift({
      message,
      tone: tone || 'warning',
      time: Date.now()
    });
    if (state.logs.length > MAX_LOGS) {
      state.logs.length = MAX_LOGS;
    }
  }

  function syncStakeAgainstInventory() {
    Object.keys(state.stake).forEach((cardId) => {
      const owned = state.inventory[cardId] || 0;
      if (!owned) {
        delete state.stake[cardId];
        return;
      }
      if (state.stake[cardId] > owned) {
        state.stake[cardId] = owned;
      }
      if (state.stake[cardId] <= 0) {
        delete state.stake[cardId];
      }
    });
  }

  function money(value) {
    return PRICE_FORMATTER.format(Math.round(value));
  }

  function rarityRank(rarity) {
    return RARITY_ORDER.indexOf(rarity);
  }

  function normalizeCardCatalog(rawCatalog) {
    const draft = [];
    Object.entries(rawCatalog).forEach(([id, raw]) => {
      const rarity = normalizeRarity(raw.cardrareity || raw.cardrarity);
      if (!rarity) {
        return;
      }
      draft.push({
        id,
        cardname: String(raw.cardname || id),
        cardimg: String(raw.cardimg || ''),
        cardrareity: rarity,
        rawWorth: Math.max(1, Number(raw.cardworth) || 1),
        rawChance: Math.max(0.000001, Number(raw.cardchance) || 0.01)
      });
    });

    const groups = RARITY_ORDER.reduce((acc, rarity) => {
      acc[rarity] = draft.filter((card) => card.cardrareity === rarity);
      return acc;
    }, {});

    const availableSharesTotal = RARITY_ORDER.reduce((sum, rarity) => {
      if (!groups[rarity].length) {
        return sum;
      }
      return sum + RARITY_BALANCE_PROFILE[rarity].chanceShare;
    }, 0) || 1;

    const output = {};
    RARITY_ORDER.forEach((rarity) => {
      const group = groups[rarity];
      if (!group.length) {
        return;
      }

      const profile = RARITY_BALANCE_PROFILE[rarity];
      const normalizedShare = profile.chanceShare / availableSharesTotal;
      const chanceSum = group.reduce((sum, card) => sum + card.rawChance, 0) || 1;
      const worthValues = group.map((card) => card.rawWorth);
      const chanceValues = group.map((card) => card.rawChance);

      group.forEach((card) => {
        const worthPosition = getNormalizedPosition(card.rawWorth, worthValues);
        const rarityPosition = 1 - getNormalizedPosition(card.rawChance, chanceValues);
        const blend = clamp((worthPosition * 0.7) + (rarityPosition * 0.3), 0, 1);
        const balancedWorth = Math.round(profile.minWorth + blend * (profile.maxWorth - profile.minWorth));
        output[card.id] = {
          id: card.id,
          cardname: card.cardname,
          cardimg: card.cardimg,
          cardrareity: card.cardrareity,
          cardworth: balancedWorth,
          cardchance: normalizedShare * (card.rawChance / chanceSum)
        };
      });
    });

    return output;
  }

  function normalizeRarity(value) {
    if (!value) {
      return null;
    }
    const lower = String(value).trim().toLowerCase();
    return RARITY_ORDER.find((rarity) => rarity.toLowerCase() === lower) || null;
  }

  function computePackOdds(pack, crateLuckMultiplier) {
    const rareBoost = getPackLuckMultiplier(pack, crateLuckMultiplier);
    const weights = CARD_IDS.map((id) => {
      const card = CATALOG[id];
      const boost = pack.rarityBoost[card.cardrareity] || 1;
      const adjusted = rarityRank(card.cardrareity) >= rarityRank('Rare') ? boost * rareBoost : boost;
      return {
        rarity: card.cardrareity,
        weight: card.cardchance * adjusted
      };
    });
    const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
    if (!total) {
      return { rarePlus: 0, legendaryPlus: 0, mythicPlus: 0, contraband: 0 };
    }
    const rarePlusWeight = weights
      .filter((entry) => rarityRank(entry.rarity) >= rarityRank('Rare'))
      .reduce((sum, entry) => sum + entry.weight, 0);
    const legendaryPlusWeight = weights
      .filter((entry) => rarityRank(entry.rarity) >= rarityRank('Legendary'))
      .reduce((sum, entry) => sum + entry.weight, 0);
    const mythicPlusWeight = weights
      .filter((entry) => rarityRank(entry.rarity) >= rarityRank('Mythic'))
      .reduce((sum, entry) => sum + entry.weight, 0);
    const contrabandWeight = weights
      .filter((entry) => entry.rarity === 'Contraband')
      .reduce((sum, entry) => sum + entry.weight, 0);
    return {
      rarePlus: (100 * rarePlusWeight / total).toFixed(2),
      legendaryPlus: (100 * legendaryPlusWeight / total).toFixed(3),
      mythicPlus: (100 * mythicPlusWeight / total).toFixed(4),
      contraband: (100 * contrabandWeight / total).toFixed(5)
    };
  }

  function pickWeighted(items, getWeight) {
    const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
    if (total <= 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    let threshold = Math.random() * total;
    for (const item of items) {
      threshold -= Math.max(0, getWeight(item));
      if (threshold <= 0) {
        return item;
      }
    }
    return items[items.length - 1];
  }

  function shuffle(values) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = values[i];
      values[i] = values[j];
      values[j] = temp;
    }
    return values;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getNormalizedPosition(value, list) {
    const min = Math.min(...list);
    const max = Math.max(...list);
    if (max <= min) {
      return 0.5;
    }
    return clamp((value - min) / (max - min), 0, 1);
  }

  function cloneMap(map) {
    return Object.entries(map).reduce((next, [key, value]) => {
      if (value > 0) {
        next[key] = value;
      }
      return next;
    }, {});
  }

  function mergeMaps(maps) {
    const merged = {};
    maps.forEach((map) => {
      Object.entries(map).forEach(([cardId, qty]) => {
        addCard(merged, cardId, qty);
      });
    });
    return merged;
  }

  function getOwnedCardCount(inventory) {
    return Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
  }

  function toInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function buildInitialMarket() {
    return RARITY_ORDER.reduce((market, rarity) => {
      market[rarity] = 1;
      return market;
    }, {});
  }

  function buildInitialState() {
    return {
      balance: 4500,
      inventory: {},
      stake: {},
      packsOpened: 0,
      cardsPulled: 0,
      lifetimeCards: 0,
      soldValue: 0,
      potWins: 0,
      potLosses: 0,
      totalPotWinnings: 0,
      rebirths: 0,
      upgrades: sanitizeUpgradeMap({}),
      ownedPacks: ['street-crate'],
      activePackId: 'street-crate',
      market: buildInitialMarket(),
      unlockedAchievements: [],
      logs: [],
      highestPullId: null,
      lastPullId: null,
      recentPulls: [],
      lastPotRound: null,
      activePotRound: null,
      cheaterDetected: false,
      cheaterPenaltyApplied: false
    };
  }

  function loadActiveTab() {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY);
      if (stored === 'main') {
        return 'crates';
      }
      if (stored && ['crates', 'inventory', 'pot', 'shop', 'achievements', 'events', 'save'].includes(stored)) {
        return stored;
      }
    } catch (error) {
      return 'crates';
    }
    return 'crates';
  }

  function saveActiveTab(tab) {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch (error) {
      return;
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return buildInitialState();
      }
      const parsed = JSON.parse(raw);
      return hydrateState(parsed);
    } catch (error) {
      return buildInitialState();
    }
  }

  function hydrateState(candidate) {
    const next = buildInitialState();
    if (!candidate || typeof candidate !== 'object') {
      return next;
    }

    next.balance = Math.max(0, Number(candidate.balance) || next.balance);
    next.packsOpened = Math.max(0, Number(candidate.packsOpened) || 0);
    next.cardsPulled = Math.max(0, Number(candidate.cardsPulled) || 0);
    next.lifetimeCards = Math.max(0, Number(candidate.lifetimeCards) || 0);
    next.soldValue = Math.max(0, Number(candidate.soldValue) || 0);
    next.potWins = Math.max(0, Number(candidate.potWins) || 0);
    next.potLosses = Math.max(0, Number(candidate.potLosses) || 0);
    next.totalPotWinnings = Math.max(0, Number(candidate.totalPotWinnings) || 0);
    next.rebirths = Math.max(0, Math.floor(Number(candidate.rebirths) || 0));
    next.cheaterDetected = Boolean(candidate.cheaterDetected);
    next.cheaterPenaltyApplied = Boolean(candidate.cheaterPenaltyApplied);
    next.upgrades = sanitizeUpgradeMap(candidate.upgrades);
    next.ownedPacks = sanitizeOwnedPacks(candidate.ownedPacks);
    next.activePackId = (typeof candidate.activePackId === 'string' && PACK_BY_ID[candidate.activePackId])
      ? candidate.activePackId
      : 'street-crate';

    next.inventory = sanitizeMap(candidate.inventory);
    next.stake = sanitizeMap(candidate.stake);
    next.market = sanitizeMarket(candidate.market);

    if (Array.isArray(candidate.unlockedAchievements)) {
      const known = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
      next.unlockedAchievements = candidate.unlockedAchievements.filter((id) => known.has(id));
    }

    if (Array.isArray(candidate.logs)) {
      next.logs = candidate.logs
        .filter((entry) => entry && typeof entry.message === 'string')
        .slice(0, MAX_LOGS)
        .map((entry) => ({
          message: entry.message,
          tone: typeof entry.tone === 'string' ? entry.tone : 'warning',
          time: Number(entry.time) || Date.now()
        }));
    }

    if (candidate.highestPullId && CATALOG[candidate.highestPullId]) {
      next.highestPullId = candidate.highestPullId;
    }
    if (candidate.lastPullId && CATALOG[candidate.lastPullId]) {
      next.lastPullId = candidate.lastPullId;
    }
    if (Array.isArray(candidate.recentPulls)) {
      next.recentPulls = candidate.recentPulls.filter((id) => CATALOG[id]).slice(0, 18);
    }

    if (candidate.lastPotRound && typeof candidate.lastPotRound === 'object') {
      next.lastPotRound = sanitizeLastPotRound(candidate.lastPotRound);
    }
    if (candidate.activePotRound && typeof candidate.activePotRound === 'object') {
      next.activePotRound = sanitizeActivePotRound(candidate.activePotRound);
    }

    next.ownedPacks = sanitizeOwnedPacks(next.ownedPacks);
    if (!next.ownedPacks.includes(next.activePackId)) {
      next.activePackId = next.ownedPacks[0];
    }
    next.upgrades = sanitizeUpgradeMap(next.upgrades);
    next.rebirths = Math.max(0, Math.floor(Number(next.rebirths) || 0));

    syncStakeMap(next);
    return next;
  }

  function sanitizeMap(candidate) {
    if (!candidate || typeof candidate !== 'object') {
      return {};
    }
    return Object.entries(candidate).reduce((map, [cardId, qty]) => {
      if (!CATALOG[cardId]) {
        return map;
      }
      const amount = Math.floor(Number(qty));
      if (amount > 0) {
        map[cardId] = amount;
      }
      return map;
    }, {});
  }

  function sanitizeOwnedPacks(candidate) {
    if (!Array.isArray(candidate)) {
      return ['street-crate'];
    }
    const packs = candidate.filter((packId) => Boolean(PACK_BY_ID[packId]));
    if (!packs.includes('street-crate')) {
      packs.push('street-crate');
    }
    return Array.from(new Set(packs)).sort((a, b) => PACK_BY_ID[a].cost - PACK_BY_ID[b].cost);
  }

  function sanitizeMarket(candidate) {
    const market = buildInitialMarket();
    if (!candidate || typeof candidate !== 'object') {
      return market;
    }
    RARITY_ORDER.forEach((rarity) => {
      const raw = Number(candidate[rarity]);
      market[rarity] = Number.isFinite(raw) ? clamp(raw, 0.55, 2.8) : 1;
    });
    return market;
  }

  function sanitizeLastPotRound(candidate) {
    const safe = {
      at: Number(candidate.at) || Date.now(),
      winner: typeof candidate.winner === 'string' ? candidate.winner : 'Unknown',
      totalPotValue: Math.max(0, Number(candidate.totalPotValue) || 0),
      playerValue: Math.max(0, Number(candidate.playerValue) || 0),
      playerChance: clamp(Number(candidate.playerChance) || 0, 0, 1),
      participants: []
    };
    if (Array.isArray(candidate.participants)) {
      safe.participants = candidate.participants
        .filter((entry) => entry && typeof entry.name === 'string')
        .map((entry) => ({
          name: entry.name,
          value: Math.max(0, Number(entry.value) || 0),
          isPlayer: Boolean(entry.isPlayer),
          cards: sanitizeMap(entry.cards)
        }));
    }
    return safe;
  }

  function sanitizeActivePotRound(candidate) {
    const safe = {
      at: Number(candidate.at) || Date.now(),
      resolveAt: Math.max(Date.now(), Number(candidate.resolveAt) || Date.now()),
      totalPotValue: Math.max(0, Number(candidate.totalPotValue) || 0),
      playerValue: Math.max(0, Number(candidate.playerValue) || 0),
      playerChance: clamp(Number(candidate.playerChance) || 0, 0, 1),
      participants: []
    };

    if (Array.isArray(candidate.participants)) {
      safe.participants = candidate.participants
        .filter((entry) => entry && typeof entry.name === 'string')
        .map((entry) => ({
          name: entry.name,
          value: Math.max(0, Number(entry.value) || 0),
          isPlayer: Boolean(entry.isPlayer),
          cards: sanitizeMap(entry.cards),
          joinAt: Math.max(safe.at, Number(entry.joinAt) || safe.at)
        }));
    }
    if (!safe.participants.length) {
      return null;
    }
    safe.totalPotValue = safe.participants.reduce((sum, entry) => sum + entry.value, 0);
    const playerEntry = safe.participants.find((entry) => entry.isPlayer) || safe.participants[0];
    safe.playerValue = playerEntry ? playerEntry.value : safe.playerValue;
    safe.playerChance = safe.playerValue / Math.max(1, safe.totalPotValue);
    return safe;
  }

  function syncStakeMap(targetState) {
    Object.keys(targetState.stake).forEach((cardId) => {
      const owned = targetState.inventory[cardId] || 0;
      if (!owned) {
        delete targetState.stake[cardId];
        return;
      }
      if (targetState.stake[cardId] > owned) {
        targetState.stake[cardId] = owned;
      }
      if (targetState.stake[cardId] <= 0) {
        delete targetState.stake[cardId];
      }
    });
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      pushLog('Save failed. Storage may be full.', 'negative');
      renderEvents();
    }
  }
})();
