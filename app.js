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

  const PACK_TYPES = [
    {
      id: 'street-crate',
      name: 'Street Crate',
      cost: 40,
      cardsPerPack: 3,
      rarityBoost: {
        Common: 1,
        Uncommon: 1,
        Rare: 1,
        Epic: 1,
        Legendary: 1,
        Mythic: 1,
        Contraband: 1
      }
    },
    {
      id: 'tactical-case',
      name: 'Tactical Case',
      cost: 130,
      cardsPerPack: 4,
      rarityBoost: {
        Common: 0.84,
        Uncommon: 1.05,
        Rare: 1.35,
        Epic: 1.65,
        Legendary: 1.95,
        Mythic: 2.25,
        Contraband: 2.6
      }
    },
    {
      id: 'black-vault',
      name: 'Black Vault',
      cost: 480,
      cardsPerPack: 5,
      rarityBoost: {
        Common: 0.58,
        Uncommon: 0.9,
        Rare: 1.6,
        Epic: 2.2,
        Legendary: 3,
        Mythic: 3.8,
        Contraband: 4.6
      }
    },
    {
      id: 'omega-safe',
      name: 'Omega Safe',
      cost: 1600,
      cardsPerPack: 6,
      rarityBoost: {
        Common: 0.4,
        Uncommon: 0.72,
        Rare: 1.45,
        Epic: 2.7,
        Legendary: 4,
        Mythic: 5.4,
        Contraband: 7.2
      }
    }
  ];

  const BOT_NAMES = [
    'RustByte',
    'CaseGoblin',
    'PacketRat',
    'VaultPirate',
    'DiceFang',
    'CoinWraith',
    'ScrapOracle',
    'ChromeViper'
  ];

  const CARD_RARITY_SYSTEM = {
    'freaky henry': {
      cardname: 'Freaky Henry',
      cardimg: '/henry/freaky.png',
      cardrareity: 'Common',
      cardworth: 6,
      cardchance: 0.9
    },
    'mogger henry': {
      cardname: 'Mogger Henry',
      cardimg: '/henry/mog.png',
      cardrareity: 'Rare',
      cardworth: 70,
      cardchance: 0.5
    },
    'unphased henry': {
      cardname: 'Unphased Henry',
      cardimg: '/henry/unphased.png',
      cardrareity: 'Common',
      cardworth: 8,
      cardchance: 0.95
    },
    'thinking henry': {
      cardname: 'Thinking Henry',
      cardimg: '/henry/thinking.png',
      cardrareity: 'Common',
      cardworth: 9,
      cardchance: 0.95
    },
    'pizza henry': {
      cardname: 'Pizza Henry',
      cardimg: '/henry/pizza.png',
      cardrareity: 'Epic',
      cardworth: 460,
      cardchance: 0.02
    },
    'steaming henry': {
      cardname: 'Steaming Henry',
      cardimg: '/henry/steaming.png',
      cardrareity: 'Epic',
      cardworth: 560,
      cardchance: 0.02
    },
    'wizard henry': {
      cardname: 'Wizard Henry',
      cardimg: '/henry/wizard.png',
      cardrareity: 'Mythic',
      cardworth: 9400,
      cardchance: 0.003
    },
    'pufferfish henry': {
      cardname: 'Pufferfish Henry',
      cardimg: '/henry/pufferfish.png',
      cardrareity: 'Legendary',
      cardworth: 34000,
      cardchance: 0.04
    },
    'drooling henry': {
      cardname: 'Drooling Henry',
      cardimg: '/henry/drool.png',
      cardrareity: 'Epic',
      cardworth: 3400,
      cardchance: 0.04
    },
    'wifebeater henry': {
      cardname: 'Wifebeater Henry',
      cardimg: '/henry/wifebeater.png',
      cardrareity: 'Rare',
      cardworth: 920,
      cardchance: 0.04
    },
    'mad henry': {
      cardname: 'Mad Henry',
      cardimg: '/henry/rhenry.png',
      cardrareity: 'Legendary',
      cardworth: 34000,
      cardchance: 0.0002
    },
    'Hengry': {
      cardname: 'Hengry',
      cardimg: '/henry/hengry.png',
      cardrareity: 'Mythic',
      cardworth: 960000,
      cardchance: 0.0003
    },
    'minecraft henry': {
      cardname: 'Minecraft Henry',
      cardimg: '/henry/mchen.jpg',
      cardrareity: 'Contraband',
      cardworth: 9000400,
      cardchance: 0.00012
    },
    'youngry': {
      cardname: 'Youngry',
      cardimg: '/henry/bhen.jpg',
      cardrareity: 'Legendary',
      cardworth: 3787000,
      cardchance: 0.0003
    },
    'evil henry': {
      cardname: 'Evil Henry',
      cardimg: '/henry/evil.jpg',
      cardrareity: 'Epic',
      cardworth: 698400,
      cardchance: 0.0034
    },
    '9th grade henry': {
      cardname: '9th Grade Henry',
      cardimg: '/henry/9thgradehenry.jpg',
      cardrareity: 'Mythic',
      cardworth: 976333400,
      cardchance: 0.0013
    },
    'bird henry': {
      cardname: 'Bird Henry',
      cardimg: '/henry/bird.png',
      cardrareity: 'Mythic',
      cardworth: 30000400,
      cardchance: 0.0003
    },
    'papi henry': {
      cardname: 'PAPI henry',
      cardimg: '/henry/papi.png',
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
      id: 'collection-50',
      title: 'Stacked Vault',
      description: 'Own 50 cards at once.',
      reward: 520,
      condition: (s) => getOwnedCardCount(s.inventory) >= 50
    },
    {
      id: 'seller',
      title: 'Market Flipper',
      description: 'Sell over $2,000 in cards.',
      reward: 400,
      condition: (s) => s.soldValue >= 2000
    },
    {
      id: 'pot-winner',
      title: 'Pot Hunter',
      description: 'Win 3 pot rounds.',
      reward: 600,
      condition: (s) => s.potWins >= 3
    },
    {
      id: 'god-pull',
      title: 'Sky Drop',
      description: 'Pull a Mythic or Contraband card.',
      reward: 1500,
      condition: (s) => {
        if (!s.highestPullId) {
          return false;
        }
        const rarity = CATALOG[s.highestPullId].cardrareity;
        return rarityRank(rarity) >= rarityRank('Mythic');
      }
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
    marketStrip: byId('market-strip'),
    packButtons: byId('pack-buttons'),
    openBest: byId('open-best'),
    openTen: byId('open-ten'),
    advanceMarket: byId('advance-market'),
    lastPull: byId('last-pull'),
    packResults: byId('pack-results'),
    rarityFilter: byId('rarity-filter'),
    sortBy: byId('sort-by'),
    sellDuplicates: byId('sell-duplicates'),
    sellCommons: byId('sell-commons'),
    inventoryBody: byId('inventory-body'),
    stakeList: byId('stake-list'),
    stakeValue: byId('stake-value'),
    clearStake: byId('clear-stake'),
    startPotRound: byId('start-pot-round'),
    potSummary: byId('pot-summary'),
    achievementList: byId('achievement-list'),
    eventFeed: byId('event-feed'),
    exportSave: byId('export-save'),
    importSave: byId('import-save'),
    resetGame: byId('reset-game'),
    tabButtons: Array.from(document.querySelectorAll('button[data-tab-target]')),
    tabPanels: {
      main: byId('tab-main'),
      pot: byId('tab-pot'),
      achievements: byId('tab-achievements'),
      events: byId('tab-events')
    }
  };

  let state = loadState();
  let activeTab = loadActiveTab();

  init();

  function init() {
    populateRarityFilter();
    renderPackButtons();
    wireEvents();
    initTabs();
    if (!state.logs.length) {
      pushLog('Simulation loaded. Open a pack to start your run.', 'warning');
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

  function initTabs() {
    setActiveTab(activeTab, true);
  }

  function setActiveTab(target, skipSave) {
    if (!dom.tabPanels[target]) {
      target = 'main';
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
      const packId = button.dataset.pack;
      const count = toInt(button.dataset.count, 1);
      openPack(packId, count);
    });

    dom.openBest.addEventListener('click', () => {
      const affordable = PACK_TYPES.filter((pack) => state.balance >= pack.cost).sort((a, b) => b.cost - a.cost)[0];
      if (!affordable) {
        pushLog('No pack is affordable right now.', 'negative');
        renderAll();
        return;
      }
      openPack(affordable.id, 1);
    });

    dom.openTen.addEventListener('click', () => openPack('street-crate', 10));
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

    dom.exportSave.addEventListener('click', exportSave);
    dom.importSave.addEventListener('click', importSave);
    dom.resetGame.addEventListener('click', resetGame);
  }

  function openPack(packId, count) {
    const pack = PACK_TYPES.find((entry) => entry.id === packId);
    if (!pack) {
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

  function drawCardFromPack(pack) {
    const weighted = CARD_IDS.map((id) => {
      const card = CATALOG[id];
      const boost = pack.rarityBoost[card.cardrareity] || 1;
      return {
        id,
        weight: Math.max(0, card.cardchance * boost)
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
    const price = getCardUnitPrice(cardId);
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

  function startPotRound() {
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

    const botEntries = createBotEntries(playerValue);
    const participants = [{ name: 'You', value: playerValue, cards: playerCards, isPlayer: true }, ...botEntries];
    const totalPotValue = participants.reduce((sum, participant) => sum + participant.value, 0);
    const winner = pickWeighted(participants, (entry) => entry.value);
    const playerChance = playerValue / totalPotValue;

    state.lastPotRound = {
      at: Date.now(),
      winner: winner.name,
      totalPotValue,
      playerValue,
      playerChance,
      participants: participants.map((participant) => ({
        name: participant.name,
        value: participant.value,
        isPlayer: participant.isPlayer
      }))
    };

    if (winner.isPlayer) {
      const potCards = mergeMaps(participants.map((participant) => participant.cards));
      Object.entries(potCards).forEach(([cardId, qty]) => {
        addCard(state.inventory, cardId, qty);
      });
      state.potWins += 1;
      pushLog(`Pot won. You took ${money(totalPotValue)} in card value from ${botEntries.length} bots.`, 'positive');
    } else {
      state.potLosses += 1;
      pushLog(`Pot lost to ${winner.name}. Your stake was ${money(playerValue)}.`, 'negative');
    }

    advanceMarket(0.5, true);
    checkAchievements();
    saveState();
    renderAll();
  }

  function createBotEntries(playerValue) {
    const count = randomInt(2, 4);
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
        const cardId = drawCardFromPack(pack);
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
        isPlayer: false
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
      state.balance += achievement.reward;
      pushLog(`Achievement unlocked: ${achievement.title} (+${money(achievement.reward)}).`, 'positive');
    });
  }

  function renderAll() {
    syncStakeAgainstInventory();
    renderStats();
    renderMarketStrip();
    renderPackButtonsState();
    renderPullGrid();
    renderInventory();
    renderStake();
    renderPotSummary();
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
    if (state.lastPullId) {
      const card = CATALOG[state.lastPullId];
      dom.lastPull.textContent = `Last pull: ${card.cardname} (${card.cardrareity}, ${money(getCardUnitPrice(state.lastPullId))})`;
    } else {
      dom.lastPull.textContent = 'No pulls yet.';
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
    dom.packButtons.innerHTML = PACK_TYPES.map((pack) => {
      const odds = pack.odds;
      return `
        <article class="pack-card">
          <h3>${pack.name}</h3>
          <p>Cost: ${money(pack.cost)} | Cards: ${pack.cardsPerPack}</p>
          <p>Rare+: ${odds.rarePlus}% | Legendary+: ${odds.legendaryPlus}%</p>
          <div class="pack-actions">
            <button data-pack="${pack.id}" data-count="1">Open 1</button>
            <button data-pack="${pack.id}" data-count="5">Open 5</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderPackButtonsState() {
    dom.packButtons.querySelectorAll('button[data-pack][data-count]').forEach((button) => {
      const pack = PACK_TYPES.find((entry) => entry.id === button.dataset.pack);
      const count = toInt(button.dataset.count, 1);
      if (!pack) {
        button.disabled = true;
        return;
      }
      button.disabled = state.balance < pack.cost * count;
    });
    dom.openBest.disabled = !PACK_TYPES.some((pack) => state.balance >= pack.cost);
    dom.openTen.disabled = state.balance < PACK_TYPES[0].cost * 10;
  }

  function renderPullGrid() {
    if (!state.recentPulls.length) {
      dom.packResults.innerHTML = '';
      return;
    }
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
    if (!entries.length) {
      dom.stakeList.innerHTML = '<p class="empty">No cards staked yet.</p>';
      dom.stakeValue.textContent = money(0);
      return;
    }

    dom.stakeList.innerHTML = entries
      .sort((a, b) => getCardUnitPrice(b[0]) - getCardUnitPrice(a[0]))
      .map(([cardId, qty]) => {
        const card = CATALOG[cardId];
        const total = getCardUnitPrice(cardId) * qty;
        return `
          <div class="stake-item">
            <div>
              <strong>${card.cardname}</strong><br>
              <small>${card.cardrareity} | ${qty}x | ${money(total)}</small>
            </div>
            <div class="stake-controls">
              <button data-stake-action="minus" data-id="${cardId}">-</button>
              <button data-stake-action="plus" data-id="${cardId}">+</button>
            </div>
            <button data-stake-action="remove" data-id="${cardId}">Remove</button>
          </div>
        `;
      })
      .join('');

    dom.stakeValue.textContent = money(getMapValue(state.stake));
  }

  function renderPotSummary() {
    if (!state.lastPotRound) {
      dom.potSummary.innerHTML = '<p>Start a round after adding cards to your stake.</p>';
      return;
    }

    const round = state.lastPotRound;
    const lines = [];
    lines.push(`<p class="round-line"><strong>Winner:</strong> ${round.winner}</p>`);
    lines.push(`<p class="round-line"><strong>Total Pot:</strong> ${money(round.totalPotValue)}</p>`);
    lines.push(`<p class="round-line"><strong>Your Stake:</strong> ${money(round.playerValue)} (${(round.playerChance * 100).toFixed(1)}% chance)</p>`);
    round.participants.forEach((entry) => {
      lines.push(`<p class="round-line">${entry.name}: ${money(entry.value)}</p>`);
    });
    dom.potSummary.innerHTML = lines.join('');
  }

  function renderAchievements() {
    dom.achievementList.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const unlocked = state.unlockedAchievements.includes(achievement.id);
      return `
        <article class="achievement-card ${unlocked ? 'unlocked' : ''}">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          <p>Reward: ${money(achievement.reward)}</p>
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
    pushLog('Progress reset. New run started.', 'negative');
    saveState();
    renderAll();
  }

  function getNetWorth() {
    return state.balance + getMapValue(state.inventory);
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
    const output = {};
    Object.entries(rawCatalog).forEach(([id, raw]) => {
      const rarity = normalizeRarity(raw.cardrareity || raw.cardrarity);
      const chance = Number(raw.cardchance);
      if (!rarity || !Number.isFinite(chance) || chance <= 0) {
        return;
      }
      output[id] = {
        id,
        cardname: String(raw.cardname || id),
        cardimg: String(raw.cardimg || ''),
        cardrareity: rarity,
        cardworth: Math.max(1, Number(raw.cardworth) || 1),
        cardchance: chance
      };
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

  function computePackOdds(pack) {
    const weights = CARD_IDS.map((id) => {
      const card = CATALOG[id];
      const boost = pack.rarityBoost[card.cardrareity] || 1;
      return {
        rarity: card.cardrareity,
        weight: card.cardchance * boost
      };
    });
    const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
    if (!total) {
      return { rarePlus: 0, legendaryPlus: 0 };
    }
    const rarePlusWeight = weights
      .filter((entry) => rarityRank(entry.rarity) >= rarityRank('Rare'))
      .reduce((sum, entry) => sum + entry.weight, 0);
    const legendaryPlusWeight = weights
      .filter((entry) => rarityRank(entry.rarity) >= rarityRank('Legendary'))
      .reduce((sum, entry) => sum + entry.weight, 0);
    return {
      rarePlus: (100 * rarePlusWeight / total).toFixed(2),
      legendaryPlus: (100 * legendaryPlusWeight / total).toFixed(2)
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
      balance: 500,
      inventory: {},
      stake: {},
      packsOpened: 0,
      cardsPulled: 0,
      lifetimeCards: 0,
      soldValue: 0,
      potWins: 0,
      potLosses: 0,
      market: buildInitialMarket(),
      unlockedAchievements: [],
      logs: [],
      highestPullId: null,
      lastPullId: null,
      recentPulls: [],
      lastPotRound: null
    };
  }

  function loadActiveTab() {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY);
      if (stored && ['main', 'pot', 'achievements', 'events'].includes(stored)) {
        return stored;
      }
    } catch (error) {
      return 'main';
    }
    return 'main';
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
          isPlayer: Boolean(entry.isPlayer)
        }));
    }
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
