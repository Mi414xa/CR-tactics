// Основной игровой файл (режим защиты)

// Глобальные переменные
let deck = [...CARDS];
let selectedIdx = null;
let placed = [];
let usedOneTimeCards = [];
let currentDiff = 'easy1'; // Хог по умолчанию
let gameEnded = false;

// DOM элементы
const arena = document.getElementById('arena');
const enemyZone = document.getElementById('enemyZone');
const deckCards = document.getElementById('deckCards');
const diffGroup = document.getElementById('diffGroup');
const infoBox = document.getElementById('infoBox');
const messageBox = document.getElementById('messageBox');
const resetBtn = document.getElementById('resetBtn');
const popup = document.getElementById('popup');
const popupMsg = document.getElementById('popupMsg');
const popupSub = document.getElementById('popupSub');
const popupBtn = document.getElementById('popupBtn');

// Построение сетки арены
function buildGrid() {
  arena.innerHTML = '';
  for (let r = 1; r <= 18; r++) {
    for (let c = 1; c <= 32; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      // Отметка мостов
      if ((r === 1 || r === 1) && (c === 6 || c === 7 || c === 8)) cell.classList.add('bridge-left');
      if ((r === 2 || r === 2) && (c === 6 || c === 7 || c === 8)) cell.classList.add('bridge-left');
      if ((r === 1 || r === 1) && (c === 25 || c === 26 || c === 27)) cell.classList.add('bridge-right');
      if ((r === 2 || r === 2) && (c === 25 || c === 26 || c === 27)) cell.classList.add('bridge-right');
      arena.appendChild(cell);
    }
  }
  
  // Башни
  const king = document.createElement('div'); 
  king.className = 'king-tower'; 
  king.innerHTML = '👑<div class="tower-hp-bar"><div class="tower-hp-fill" id="king-hp" style="width:100%"></div></div>';
  arena.appendChild(king);
  
  const pLeft = document.createElement('div'); 
  pLeft.className = 'princess-left'; 
  pLeft.innerHTML = '🏰<div class="tower-hp-bar"><div class="tower-hp-fill" id="left-hp" style="width:100%"></div></div>';
  arena.appendChild(pLeft);
  
  const pRight = document.createElement('div'); 
  pRight.className = 'princess-right'; 
  pRight.innerHTML = '🏰<div class="tower-hp-bar"><div class="tower-hp-fill" id="right-hp" style="width:100%"></div></div>';
  arena.appendChild(pRight);
}

// Расчет расстояния между клетками
function getDistance(row1, col1, row2, col2) {
  return Math.sqrt(Math.pow(row1 - row2, 2) + Math.pow(col1 - col2, 2));
}

// Функция для определения к какой башне бежит Хог
function getTargetTower(hogRow, hogCol) {
  const leftTowerPos = { row: 14, col: 7 };
  const rightTowerPos = { row: 14, col: 25 };
  const kingPos = { row: 17, col: 16 };
  
  const distToLeft = getDistance(hogRow, hogCol, leftTowerPos.row, leftTowerPos.col);
  const distToRight = getDistance(hogRow, hogCol, rightTowerPos.row, rightTowerPos.col);
  const distToKing = getDistance(hogRow, hogCol, kingPos.row, kingPos.col);
  
  if (distToLeft < distToRight && distToLeft < distToKing) return 'left';
  if (distToRight < distToLeft && distToRight < distToKing) return 'right';
  return 'king';
}

// Проверка, находится ли юнит за башней
function isBehindTower(unitRow, unitCol, towerType) {
  if (towerType === 'left' || towerType === 'right') {
    return unitRow > 12;
  }
  return false;
}

// Подсветка спавна Хога
function highlightHogSpawn() {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('spawn-cell');
  });
  
  const [col, row] = HOG_SCENARIO.spawn.split(',').map(Number);
  const cell = Array.from(document.querySelectorAll('.cell')).find(c => 
    parseInt(c.dataset.col) === col && parseInt(c.dataset.row) === row
  );
  if (cell) cell.classList.add('spawn-cell');
}

// Подсветка спавнов гоблинов
function highlightGoblinSpawns() {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('goblin-spawn');
  });
  
  const leftSpawn = Array.from(document.querySelectorAll('.cell')).find(c => 
    parseInt(c.dataset.col) === 7 && parseInt(c.dataset.row) === 2
  );
  if (leftSpawn) leftSpawn.classList.add('goblin-spawn');
  
  const rightSpawn = Array.from(document.querySelectorAll('.cell')).find(c => 
    parseInt(c.dataset.col) === 26 && parseInt(c.dataset.row) === 2
  );
  if (rightSpawn) rightSpawn.classList.add('goblin-spawn');
}

// Подсветка спавна Голема
function highlightGolemSpawn() {
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('golem-spawn');
  });
  
  const spawnCell = Array.from(document.querySelectorAll('.cell')).find(c => 
    parseInt(c.dataset.col) === 26 && parseInt(c.dataset.row) === 2
  );
  if (spawnCell) spawnCell.classList.add('golem-spawn');
}

// Отрисовка врагов
function renderEnemies() {
  if (currentDiff === 'goblin') {
    // Гоблин сценарий
    let html = '';
    html += `<div class="enemy-card">👺 Гоблины (левые) x8 ❤️ 100 ⚔️ 30</div>`;
    html += `<div class="enemy-card">👺 Гоблины (правые) x8 ❤️ 100 ⚔️ 30</div>`;
    html += `<div class="enemy-card" style="background: #ff4444;">⚡ Всего гоблинов: 16</div>`;
    enemyZone.innerHTML = html;
    infoBox.innerText = `👺 НАШЕСТВИЕ ГОБЛИНОВ: Гоблины атакуют с двух сторон! | Совет: Найди правильную позицию для защиты`;
  } else if (currentDiff === 'golem') {
    // Голем сценарий
    let html = '';
    html += `<div class="enemy-card" style="background: #8B4513;">🗿 ГОЛЕМ ❤️ 3000 ⚔️ 288</div>`;
    enemyZone.innerHTML = html;
    infoBox.innerText = `🗿 ГОЛЕМ: Огромный каменный голем приближается! | Совет: Сильные воины в правильном месте помогут`;
  } else {
    // Хог сценарий
    const s = HOG_SCENARIO;
    let html = '';
    s.enemies.forEach(e => {
      html += `<div class="enemy-card">${e.emoji} ${e.name} ❤️ ${e.hp} ⚔️ ${e.damage}</div>`;
    });
    enemyZone.innerHTML = html;
    infoBox.innerText = `${s.name}: ${s.desc} | Совет: ${s.tip}`;
  }
}

// Отрисовка колоды
function renderDeck() {
  let html = '';
  deck.forEach((c, i) => {
    let rangeClass = c.range > 1 ? 'ranged' : '';
    let rangeText = c.range > 1 ? ` [${c.range}кл]` : '';
    let usedClass = usedOneTimeCards.includes(c.type) ? 'used' : '';
    let swarmClass = c.swarmCount > 1 ? 'swarm' : '';
    let swarmText = c.swarmCount > 1 ? ` x${c.swarmCount}` : '';
    
    let killerClass = '';
    if (currentDiff === 'hog' || currentDiff.startsWith('easy')) {
      if (c.type === 'tesla' || c.type === 'barbs' || c.type === 'miniPekka' || 
          c.type === 'pekka' || c.type === 'lumber' || c.type === 'musk') {
        killerClass = 'killer';
      }
    }
    
    html += `<div class="card ${selectedIdx === i ? 'selected' : ''} ${rangeClass} ${swarmClass} ${usedClass} ${killerClass}" data-i="${i}">
      <span class="elixir">${c.elixir}</span>${c.emoji} ${c.name}${rangeText}${swarmText} ❤️${c.hp || '∞'} ⚔️${c.damage || 0} ${c.oneTime ? '✨1раз' : ''}
    </div>`;
  });
  deckCards.innerHTML = html;
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      const i = e.currentTarget.dataset.i;
      if (i !== undefined) {
        const idx = parseInt(i);
        if (!deck[idx].oneTime || !usedOneTimeCards.includes(deck[idx].type)) {
          selectedIdx = selectedIdx === idx ? null : idx;
        }
        renderDeck();
      }
    });
  });
}

// Обновление клеток
function updateCells() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('placed');
    cell.innerHTML = '';
  });
  
  placed.forEach(unit => {
    const cell = Array.from(document.querySelectorAll('.cell')).find(c => 
      parseInt(c.dataset.row) === unit.row && parseInt(c.dataset.col) === unit.col
    );
    if (cell) {
      cell.classList.add('placed');
      cell.innerHTML = `<div>${unit.emoji}</div>`;
    }
  });
  
  if (currentDiff === 'goblin') {
    highlightGoblinSpawns();
  } else if (currentDiff === 'golem') {
    highlightGolemSpawn();
  } else {
    highlightHogSpawn();
  }
}

// Обновление ХП башен
function updateTowerHp() {
  document.getElementById('king-hp').style.width = `${(TOWERS.king.hp / TOWERS.king.maxHp) * 100}%`;
  document.getElementById('left-hp').style.width = `${(TOWERS.left.hp / TOWERS.left.maxHp) * 100}%`;
  document.getElementById('right-hp').style.width = `${(TOWERS.right.hp / TOWERS.right.maxHp) * 100}%`;
}

// Обработчик клика по клетке
function onCellClick(e) {
  if (gameEnded) return;
  const cell = e.currentTarget;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  if (selectedIdx === null) { 
    messageBox.innerText = '⚠️ Сначала выберите карту!'; 
    return; 
  }
  
  const card = deck[selectedIdx];
  if (!card) return;
  
  if (card.oneTime && usedOneTimeCards.includes(card.type)) {
    messageBox.innerText = '⚠️ Это заклинание уже использовано!'; 
    return;
  }
  
  // Проверка, что не ставим на башни
  const kingArea = (row >= 16 && row <= 18 && col >= 14 && col <= 19);
  const leftTowerArea = (row >= 13 && row <= 15 && col >= 6 && col <= 8);
  const rightTowerArea = (row >= 13 && row <= 15 && col >= 24 && col <= 26);
  
  if (kingArea || leftTowerArea || rightTowerArea) {
    messageBox.innerText = '⚠️ Нельзя ставить на башню!';
    return;
  }
  
  if (placed.some(unit => unit.row === row && unit.col === col)) {
    messageBox.innerText = '⚠️ Эта клетка уже занята!';
    return;
  }
  
  const [used] = deck.splice(selectedIdx, 1);
  deck.push(used);
  
  placed.push({ 
    row, col, 
    type: card.type, 
    emoji: card.emoji
  });
  
  if (card.oneTime) {
    usedOneTimeCards.push(card.type);
  }
  
  selectedIdx = null;
  renderDeck();
  updateCells();
  
  // Расчет результата в зависимости от сценария
  if (currentDiff === 'goblin') {
    const result = calculateGoblinBattle(placed);
    gameEnded = true;
    
    if (result === 'fullVictory') {
      popupMsg.innerText = '🏆 ПОЛНАЯ ПОБЕДА';
      popupSub.innerText = 'Все гоблины уничтожены! Отличная защита!';
    } else if (result === 'partialVictory') {
      popupMsg.innerText = '⚔️ ЧАСТИЧНАЯ ПОБЕДА';
      popupSub.innerText = 'Часть гоблинов прорвалась, но башни устояли.';
    } else {
      popupMsg.innerText = '💔 ПОРАЖЕНИЕ';
      popupSub.innerText = 'Гоблины разрушили башни...';
    }
  } else if (currentDiff === 'golem') {
    const result = calculateGolemBattle(placed);
    gameEnded = true;
    
    if (result === 'victory') {
      popupMsg.innerText = '🏆 ГОЛЕМ ПОВЕРЖЕН';
      popupSub.innerText = 'Ваши воины уничтожили каменного гиганта!';
    } else {
      popupMsg.innerText = '💔 ГОЛЕМ РАЗРУШИЛ БАШНЮ';
      popupSub.innerText = 'Нужно больше сильных воинов...';
    }
  } else {
    const victory = calculateHogBattle(placed);
    gameEnded = true;
    
    if (victory) {
      popupMsg.innerText = '🏆 ХОГ ПОВЕРЖЕН';
      popupSub.innerText = 'Защита сработала!';
    } else {
      popupMsg.innerText = '💔 ХОГ ПРОРВАЛСЯ';
      popupSub.innerText = 'Хог слишком быстрый...';
    }
  }
  
  popup.classList.add('show');
  messageBox.innerText = `✅ ${card.name} на [${col},${row}]`;
}

// Сброс игры
function resetAll() {
  deck = [...CARDS];
  selectedIdx = null;
  placed = [];
  usedOneTimeCards = [];
  TOWERS.king.hp = TOWERS.king.maxHp;
  TOWERS.left.hp = TOWERS.left.maxHp;
  TOWERS.right.hp = TOWERS.right.maxHp;
  gameEnded = false;
  
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('tesla-range', 'spawn-cell', 'path-marker', 'placed', 'goblin-spawn', 'golem-spawn');
    c.innerHTML = '';
  });
  
  popup.classList.remove('show');
  renderDeck();
  renderEnemies();
  updateCells();
  updateTowerHp();
  
  if (currentDiff === 'goblin') {
    messageBox.innerText = '👺 Выберите карту и клетку для защиты от гоблинов';
  } else if (currentDiff === 'golem') {
    messageBox.innerText = '🗿 Выберите карту и клетку для защиты от Голема';
  } else {
    messageBox.innerText = '🐷 Выберите карту и клетку для защиты от Хога';
  }
}

// Смена сценария
function setDiff(key) {
  currentDiff = key;
  resetAll();
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-diff="${key}"]`).classList.add('active');
}

// Инициализация игры
function initGame() {
  buildGrid();
  
  document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', onCellClick));
  
  let diffHtml = '';
  diffHtml += `<button class="diff-btn active" data-diff="easy1">🐷 Хог</button>`;
  diffHtml += `<button class="diff-btn" data-diff="goblin">👺 Гоблины</button>`;
  diffHtml += `<button class="diff-btn" data-diff="golem">🗿 Голем</button>`;
  
  diffGroup.innerHTML = diffHtml;
  diffGroup.querySelectorAll('.diff-btn').forEach(b => b.addEventListener('click', () => setDiff(b.dataset.diff)));
  
  resetBtn.addEventListener('click', resetAll);
  popupBtn.addEventListener('click', () => { popup.classList.remove('show'); resetAll(); });
  
  resetAll();
}

// Добавляем стили для подсветки
const style = document.createElement('style');
style.textContent = `
  .goblin-spawn {
    background-color: rgba(255, 0, 0, 0.3) !important;
    border: 2px solid red !important;
    animation: pulse 1s infinite;
  }
  
  .golem-spawn {
    background-color: rgba(139, 69, 19, 0.3) !important;
    border: 2px solid #8B4513 !important;
    animation: pulse 1.5s infinite;
  }
  
  .spawn-cell {
    background-color: rgba(255, 255, 0, 0.3) !important;
    border: 2px solid yellow !important;
    animation: pulse 0.8s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);

window.addEventListener('load', initGame);