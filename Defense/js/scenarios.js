// ==================== СЦЕНАРИИ ЗАЩИТЫ ====================

// СЦЕНАРИЙ ХОГА
const HOG_SCENARIO = {
  name: '🐷 ХОГ',
  enemies: [{ 
    name: 'ХОГ РАЙДЕР', emoji: '🐷', hp: HOG_HP, damage: 320, type: 'hog',
    ignoreTroops: true,
    targetOnly: ['building', 'tesla']
  }],
  spawn: '7,2',
  path: [
    {col:7, row:2}, {col:7, row:3}, {col:7, row:4}, {col:7, row:5},
    {col:7, row:6}, {col:7, row:7}, {col:7, row:8}, {col:7, row:9},
    {col:7, row:10}, {col:7, row:11}, {col:7, row:12}, {col:7, row:13},
    {col:7, row:14}, {col:7, row:15}, {col:7, row:16}
  ],
  side: 'left',
  desc: 'Хог бежит к башням',
  tip: 'подумай какие воины убивают Хога'
};

// НОВЫЙ СЦЕНАРИЙ: Гоблины
const GOBLIN_SCENARIO = {
  name: '👺 ГОБЛИНЫ',
  enemies: [
    { name: 'ЛЕВЫЕ ГОБЛИНЫ', emoji: '👺', hp: 100, damage: 30, type: 'goblin', count: 8 },
    { name: 'ПРАВЫЕ ГОБЛИНЫ', emoji: '👺', hp: 100, damage: 30, type: 'goblin', count: 8 }
  ],
  spawnLeft: '7,2',
  spawnRight: '26,2',
  desc: 'Гоблины атакуют с двух сторон!',
  tip: 'Найди правильную позицию для защиты'
};

// НОВЫЙ СЦЕНАРИЙ: Голем
const GOLEM_SCENARIO = {
  name: '🗿 ГОЛЕМ',
  enemies: [
    { name: 'ГОЛЕМ', emoji: '🗿', hp: 3000, damage: 288, type: 'golem' }
  ],
  spawn: '26,2',
  desc: 'Огромный голем приближается!',
  tip: 'Поставь свою защиту в правильном месте'
};

// Карты, которые могут победить гоблинов
const GOBLIN_COUNTERS = {
  fullVictory: ['barbs', 'lumber', 'witch', 'musk', 'knight', 'pekka', 'tesla'],
  partialVictory: ['miniPekka', 'log', 'fireball']
};

// Карты, которые могут победить Голема
const GOLEM_COUNTERS = ['miniPekka', 'pekka', 'tesla', 'barbs', 'lumber', 'musk', 'witch'];

// ==================== ФУНКЦИИ РАСЧЁТА БИТВЫ ====================

// Расчёт боя для Хога
function calculateHogBattle(placedCards) {
  if (placedCards.length === 0) return false;
  
  const hog = HOG_SCENARIO.enemies[0];
  const hogPath = HOG_SCENARIO.path;
  
  for (let stepIndex = 1; stepIndex < hogPath.length; stepIndex++) {
    const step = hogPath[stepIndex];
    
    for (let unit of placedCards) {
      const dist = getDistance(unit.row, unit.col, step.row, step.col);
      const targetTower = getTargetTower(step.row, step.col);
      
      if (unit.type === 'tesla') {
        if (!isBehindTower(unit.row, unit.col, targetTower)) {
          if (dist <= 10) {
            const horizontalDiff = Math.abs(unit.col - step.col);
            if (horizontalDiff < 15) {
              return true;
            }
          }
        }
      }
      
      if (unit.type === 'musk' && dist <= 5) {
        const muskCard = CARDS.find(c => c.type === 'musk');
        if (muskCard) {
          let hogHp = hog.hp;
          const shotsCount = Math.min(5, Math.floor(dist) + 2);
          const totalDamage = muskCard.damage * shotsCount;
          hogHp -= totalDamage;
          if (hogHp <= 0) return true;
        }
      }
      
      if (unit.type === 'barbs' && dist <= 1.5) {
        const barbsCard = CARDS.find(c => c.type === 'barbs');
        if (barbsCard) {
          let hogHp = hog.hp;
          const barbsDamage = barbsCard.damage * 4 * 3;
          hogHp -= barbsDamage;
          if (hogHp <= 0) return true;
        }
      }
      
      if (unit.type === 'miniPekka' && dist <= 1.5) {
        const miniPekkaCard = CARDS.find(c => c.type === 'miniPekka');
        if (miniPekkaCard) {
          let hogHp = hog.hp;
          const miniPekkaDamage = miniPekkaCard.damage * 4;
          hogHp -= miniPekkaDamage;
          if (hogHp <= 0) return true;
        }
      }
      
      if (unit.type === 'pekka' && dist <= 1.5) {
        const pekkaCard = CARDS.find(c => c.type === 'pekka');
        if (pekkaCard) {
          let hogHp = hog.hp;
          const pekkaDamage = pekkaCard.damage * 2;
          hogHp -= pekkaDamage;
          if (hogHp <= 0) return true;
        }
      }
      
      if (unit.type === 'lumber' && dist <= 1.5) {
        const lumberCard = CARDS.find(c => c.type === 'lumber');
        if (lumberCard) {
          let hogHp = hog.hp;
          const lumberDamage = lumberCard.damage * 5;
          hogHp -= lumberDamage;
          if (hogHp <= 0) return true;
        }
      }
    }
  }
  
  return false;
}

// Расчёт боя для гоблинов
function calculateGoblinBattle(placedCards) {
  if (placedCards.length === 0) return 'defeat';
  
  let hasFullCounterInZone = false;
  let hasFullCounterOutsideZone = false;
  let hasPartialCounter = false;
  let allUnitsBelowRow16 = true;
  let miniPekkaInFullZone = false;
  
  for (let unit of placedCards) {
    if (unit.row <= 16) {
      allUnitsBelowRow16 = false;
    }
    
    const inFullVictoryZone = unit.col >= 13 && unit.col <= 20 && unit.row >= 3 && unit.row <= 10;
    const isLogInLeftZone = unit.type === 'log' && unit.col >= 5 && unit.col <= 9;
    const isLogInRightZone = unit.type === 'log' && unit.col >= 24 && unit.col <= 28;
    const isLogInCorrectZone = isLogInLeftZone || isLogInRightZone;
    
    if (unit.type === 'miniPekka' && inFullVictoryZone) {
      miniPekkaInFullZone = true;
    }
    
    if (GOBLIN_COUNTERS.fullVictory.includes(unit.type)) {
      if (inFullVictoryZone && unit.type !== 'miniPekka') {
        hasFullCounterInZone = true;
      } else if (unit.type !== 'miniPekka') {
        hasFullCounterOutsideZone = true;
      }
    }
    
    if (GOBLIN_COUNTERS.partialVictory.includes(unit.type)) {
      if (unit.type === 'log') {
        if (isLogInCorrectZone) {
          hasPartialCounter = true;
        }
      } else {
        hasPartialCounter = true;
      }
    }
  }
  
  if (allUnitsBelowRow16 && placedCards.length > 0) {
    return 'defeat';
  }
  
  if (miniPekkaInFullZone) {
    return 'defeat';
  }
  
  if (hasFullCounterInZone) {
    return 'fullVictory';
  } else if (hasFullCounterOutsideZone || hasPartialCounter) {
    return 'partialVictory';
  } else {
    return 'defeat';
  }
}

// Расчёт боя для Голема
function calculateGolemBattle(placedCards) {
  if (placedCards.length === 0) return 'defeat';
  
  let hasCounterInWinZone = false;
  let allUnitsBelowRow15 = true;
  let teslaInCorrectZone = false;
  
  for (let unit of placedCards) {
    if (unit.row <= 15) {
      allUnitsBelowRow15 = false;
    }
    
    const inWinZone = unit.col >= 22 && unit.col <= 31;
    
    if (GOLEM_COUNTERS.includes(unit.type) && inWinZone) {
      hasCounterInWinZone = true;
    }
    
    if (unit.type === 'tesla') {
      const teslaInZone = unit.col >= 15 && unit.col <= 31 && unit.row >= 2 && unit.row <= 12;
      if (teslaInZone) {
        teslaInCorrectZone = true;
      }
    }
  }
  
  if (allUnitsBelowRow15 && placedCards.length > 0) {
    return 'defeat';
  }
  
  if (hasCounterInWinZone || teslaInCorrectZone) {
    return 'victory';
  } else {
    return 'defeat';
  }
}