// ==================== ЗАЩИТНЫЕ ЮНИТЫ ====================
let enemyDefenses = [];

function updateEnemyZone() {
    const zone = document.getElementById('enemyZone');
    zone.innerHTML = '';
    enemyDefenses.forEach(def => {
        if (def.type === 'princess' || def.type === 'king') return;
        const card = document.createElement('div');
        card.className = 'enemy-card';
        card.innerHTML = `
            <span>${def.emoji} ${def.name}</span>
            <div class="hp-badge">❤️ ${Math.max(0, def.currentHp)}/${def.hp}</div>
        `;
        zone.appendChild(card);
    });
}

function placeDefenseUnits() {
    document.querySelectorAll('.enemy-defense').forEach(el => el.remove());
    enemyDefenses.forEach(def => {
        if (def.type === 'princess' || def.type === 'king') return;
        const cell = document.querySelector(`.cell[data-row='${def.row}'][data-col='${def.col}']`);
        if (cell) {
            const defElement = document.createElement('div');
            defElement.className = 'enemy-defense';
            defElement.innerHTML = def.emoji;
            defElement.dataset.type = def.type;
            defElement.dataset.side = def.side || '';
            const hpBar = document.createElement('div');
            hpBar.className = 'defense-hp-bar';
            const hpFill = document.createElement('div');
            hpFill.className = 'defense-hp-fill';
            hpFill.style.width = (def.currentHp / def.hp) * 100 + '%';
            hpBar.appendChild(hpFill);
            defElement.appendChild(hpBar);
            cell.appendChild(defElement);
            def.hpFill = hpFill;
        }
    });
}

function updateDefenseUnitHp(def) {
    if (def.hpFill) {
        const percent = (def.currentHp / def.hp) * 100;
        def.hpFill.style.width = percent + '%';
    }
    if (def.currentHp <= 0 && def.element) {
        def.element.remove();
        def.element = null;
    }
}

function killUnit(type, side) {
    const unit = enemyDefenses.find(d => d.type === type && d.side === side);
    if (unit) {
        unit.currentHp = 0;
        updateDefenseUnitHp(unit);
    }
    updateEnemyZone();
    updateTowerHpBars(); // из towers.js
}

function killAllOfType(type) {
    enemyDefenses.forEach(def => {
        if (def.type === type) {
            def.currentHp = 0;
            updateDefenseUnitHp(def);
        }
    });
    updateEnemyZone();
    updateTowerHpBars();
}

function isMusketeerAlive() {
    return enemyDefenses.some(d => d.type === 'musk' && d.currentHp > 0);
}
function isTeslaAlive() {
    return enemyDefenses.some(d => d.type === 'tesla' && d.currentHp > 0);
}
function areGoblinsAlive() {
    return enemyDefenses.some(d => d.type === 'goblin' && d.currentHp > 0);
}
function isLumberAlive() {
    return enemyDefenses.some(d => d.type === 'lumber' && d.currentHp > 0);
}