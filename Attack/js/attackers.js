// ==================== АТАКУЮЩИЕ ВОЙСКА ====================
const ATTACKERS = [
    { name: 'ХОГ РАЙДЕР', emoji: '🐷', type: 'hog', elixir: 4, baseDamage: 200 },
    { name: 'ГОЛЕМ', emoji: '🗿', type: 'golem', elixir: 8, baseDamage: 250 },
    { name: 'ПЕККА', emoji: '🤖', type: 'pekka', elixir: 7, baseDamage: 600 },
    { name: 'МИНИ ПЕККА', emoji: '⚔️', type: 'miniPekka', elixir: 4, baseDamage: 400 },
    { name: 'ВАРВАРЫ', emoji: '🪓', type: 'barbs', elixir: 5, baseDamage: 100, count: 5 },
    { name: 'МУШКЕТЕР', emoji: '🏹', type: 'musk', elixir: 4, baseDamage: 150 },
    { name: 'ДРОВОСЕК', emoji: '🪓', type: 'lumber', elixir: 4, baseDamage: 180 },
    { name: 'ВЕДЬМА', emoji: '🧙', type: 'witch', elixir: 5, baseDamage: 100 }
];
const FULL_DECK = ATTACKERS;

let selectedAttacker = null;
let playerTroops = [];
let selectedBattleCards = [];

function showAvailableCards() {
    const container = document.getElementById('availableCards');
    container.innerHTML = '';
    FULL_DECK.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.innerHTML = `<span class="elixir">${card.elixir}</span> ${card.emoji} ${card.name}`;
        cardElement.addEventListener('click', () => toggleCardSelection(index, cardElement));
        container.appendChild(cardElement);
    });
}

function toggleCardSelection(index, element) {
    const card = FULL_DECK[index];
    const existingIndex = selectedBattleCards.findIndex(c => c.type === card.type);
    if (existingIndex !== -1) {
        selectedBattleCards.splice(existingIndex, 1);
        element.classList.remove('selected');
    } else {
        if (selectedBattleCards.length < 2) {
            selectedBattleCards.push(card);
            element.classList.add('selected');
        } else {
            document.getElementById('messageBox').innerText = '⚠️ Можно выбрать только 2 карты!';
            return;
        }
    }
    const total = selectedBattleCards.reduce((sum, c) => sum + c.elixir, 0);
    document.getElementById('totalElixirValue').innerText = total;
    const attackBtn = document.getElementById('attackBtn');
    attackBtn.disabled = selectedBattleCards.length !== 2;
    const msg = selectedBattleCards.length === 2 
        ? `✅ Выбрано 2 карты (${total} эликсира). Разместите их на своей территории (ряды 16-18)`
        : `⚔️ Выберите 2 карты для атаки`;
    document.getElementById('messageBox').innerText = msg;
}

function startAttack() {
    if (selectedBattleCards.length !== 2) {
        document.getElementById('messageBox').innerText = '⚠️ Выберите 2 карты!';
        return;
    }
    document.getElementById('selectCardsPanel').style.display = 'none';
    document.getElementById('playerDeckPanel').style.display = 'block';
    renderPlayerDeck();
    document.getElementById('messageBox').innerText = '⚔️ Разместите войска на своей территории (ряды 16-18)';
}

function renderPlayerDeck() {
    const container = document.getElementById('playerDeck');
    container.innerHTML = selectedBattleCards.map((card, i) => `
        <div class="card ${selectedAttacker === i ? 'selected' : ''}" data-index="${i}">
            <span class="elixir">${card.elixir}</span> ${card.emoji} ${card.name}
        </div>
    `).join('');
    document.querySelectorAll('#playerDeck .card').forEach(card => {
        card.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            selectedAttacker = selectedAttacker === index ? null : index;
            renderPlayerDeck();
        });
    });
}

function getSide(col) {
    return col <= 16 ? 'left' : 'right';
}

function onCellClick(row, col, cell) {
    if (selectedAttacker === null) {
        document.getElementById('messageBox').innerText = '⚠️ Выберите войско для атаки!';
        return;
    }
    if (row < 16) {
        document.getElementById('messageBox').innerText = '⚠️ Можно ставить войска только в рядах 16-18!';
        return;
    }
    if (cell.querySelector('.player-troop')) {
        document.getElementById('messageBox').innerText = '⚠️ Эта клетка уже занята!';
        return;
    }
    const attacker = selectedBattleCards[selectedAttacker];
    const side = getSide(col);
    const troopElement = document.createElement('div');
    troopElement.className = 'player-troop';
    troopElement.innerHTML = attacker.emoji;
    troopElement.dataset.type = attacker.type;
    troopElement.dataset.side = side;
    cell.appendChild(troopElement);
    playerTroops.push({ ...attacker, row, col, side, element: troopElement });
    selectedBattleCards.splice(selectedAttacker, 1);
    selectedAttacker = null;
    if (selectedBattleCards.length === 0) {
        document.getElementById('messageBox').innerText = '⚔️ Войска размещены! Расчет результата...';
        document.getElementById('playerDeckPanel').style.display = 'none';
        calculateBattleResult(); // из game.js
    } else {
        renderPlayerDeck();
    }
}