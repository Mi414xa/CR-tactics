// ==================== ОСНОВНАЯ МЕХАНИКА ====================
let currentScenario = 1;

const RAW_DEFENSE_SCENARIOS = {
    1: [
        { type: 'princess', emoji: '🏰', name: 'Левая башня', row: 4, col: 7, hp: 3052, side: 'left' },
        { type: 'princess', emoji: '🏰', name: 'Правая башня', row: 4, col: 25, hp: 3052, side: 'right' },
        { type: 'king', emoji: '👑', name: 'Король', row: 2, col: 16, hp: 4000 },
        { type: 'musk', emoji: '🏹', name: 'Мушкетер', row: 7, col: 12, hp: 600, side: 'left' },
        { type: 'tesla', emoji: '⚡', name: 'Тесла', row: 6, col: 20, hp: 1000, side: 'right' }
    ],
    2: [
        { type: 'princess', emoji: '🏰', name: 'Левая башня', row: 4, col: 7, hp: 3052, side: 'left' },
        { type: 'princess', emoji: '🏰', name: 'Правая башня', row: 4, col: 25, hp: 3052, side: 'right' },
        { type: 'king', emoji: '👑', name: 'Король', row: 2, col: 16, hp: 4000 },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 10, hp: 300, side: 'left' },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 12, hp: 300, side: 'left' },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 14, hp: 300, side: 'left' },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 18, hp: 300, side: 'right' },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 20, hp: 300, side: 'right' },
        { type: 'goblin', emoji: '👺', name: 'Гоблин', row: 7, col: 22, hp: 300, side: 'right' },
        { type: 'lumber', emoji: '🪓', name: 'Дровосек', row: 5, col: 16, hp: 900 }
    ]
};

function getDefenseScenario(scenarioId) {
    const raw = RAW_DEFENSE_SCENARIOS[scenarioId];
    return raw.map(def => {
        const newDef = { ...def };
        if (def.type !== 'princess' && def.type !== 'king') {
            newDef.row = def.row + 3;
        }
        return newDef;
    });
}

function loadScenario(scenarioId) {
    enemyDefenses = getDefenseScenario(scenarioId).map(def => ({ ...def, currentHp: def.hp }));
    placeDefenseUnits();
    updateEnemyZone();
    updateTowerHpBars();
}

function resetGame() {
    selectedAttacker = null;
    playerTroops = [];
    selectedBattleCards = [];
    document.querySelectorAll('.player-troop').forEach(t => t.remove());
    document.getElementById('selectCardsPanel').style.display = 'block';
    document.getElementById('playerDeckPanel').style.display = 'none';
    document.getElementById('playerDeck').innerHTML = '';
    loadScenario(currentScenario);
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    document.getElementById('totalElixirValue').innerText = '0';
    document.getElementById('attackBtn').disabled = true;
    document.getElementById('popup').classList.remove('show');
    document.getElementById('messageBox').innerText = '⚔️ Выберите 2 карты для атаки';
}

function calculateBattleResult() {
    let totalDamage = 0;
    let battleLog = [];

    playerTroops.forEach(troop => {
        const side = troop.side;
        let damage = 0;
        let result = '';
        let additionalHits = 0;

        if (currentScenario === 1) {
            // Сценарий 1: Мушкетер + Тесла
            switch(troop.type) {
                case 'hog':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 200 * 3; additionalHits = 1; }
                        else { damage = 400; killUnit('musk', 'left'); }
                        result = `Хог слева: ${damage} урона${additionalHits ? '' : ''}`;
                    } else {
                        if (!isTeslaAlive()) { damage = 200 * 3; additionalHits = 1; }
                        else { damage = 0; killUnit('tesla', 'right'); }
                        result = `Хог справа: ${damage} урона (тесла уничтожена)`;
                    }
                    break;
                case 'golem':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 250 * 6; additionalHits = 1; }
                        else { damage = 1500; killUnit('musk', 'left'); }
                        result = `Голем слева: ${damage} урона`;
                    } else {
                        if (!isTeslaAlive()) { damage = 250 * 3; additionalHits = 1; }
                        else { damage = 250; killUnit('tesla', 'right'); }
                        result = `Голем справа: ${damage} урона (тесла уничтожена)`;
                    }
                    break;
                case 'pekka':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 600 * 5; additionalHits = 2; }
                        else { damage = 2400; killUnit('musk', 'left'); }
                        result = `Пекка слева: ${damage} урона`;
                    } else {
                        damage = 0; killUnit('tesla', 'right');
                        result = 'Пекка справа: уничтожила теслу, но не нанесла урона башне';
                    }
                    break;
                case 'miniPekka':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 400 * 2; additionalHits = 1; }
                        else { damage = 0; killUnit('musk', 'left'); }
                        result = `Мини пекка слева: ${damage} урона (убила мушкетера)`;
                    } else {
                        if (isTeslaAlive()) result = 'Мини пекка справа: тесла выдержала и убила её';
                        else { damage = 400 * 2; result = `Мини пекка справа: ${damage} урона (тесла уже мертва)`; }
                    }
                    break;
                case 'barbs':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 500 * 2; additionalHits = 1; }
                        else { damage = 780; killUnit('musk', 'left'); }
                        result = `Варвары слева: ${damage} урона`;
                    } else {
                        if (!isTeslaAlive()) { damage = 500 * 2; additionalHits = 1; }
                        else { damage = 0; killUnit('tesla', 'right'); }
                        result = `Варвары справа: ${damage} урона (тесла уничтожена)`;
                    }
                    break;
                case 'lumber':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 180 * 4; additionalHits = 2; }
                        else { damage = 600; killUnit('musk', 'left'); }
                        result = `Дровосек слева: ${damage} урона`;
                    } else {
                        damage = 0;
                        result = 'Дровосек справа: убит теслой и мушкетером';
                    }
                    break;
                case 'witch':
                    if (side === 'left') {
                        if (!isMusketeerAlive()) { damage = 100 * 4; additionalHits = 1; }
                        else { damage = 0; killUnit('musk', 'left'); }
                        result = `Ведьма слева: ${damage} урона (убила мушкетера)`;
                    } else {
                        damage = 0; result = 'Ведьма справа: убита теслой';
                    }
                    break;
                case 'musk': damage = 0; result = 'Мушкетер не участвует в атаке в этом сценарии'; break;
            }
        } else {
            // Сценарий 2: Гоблины + Дровосек
            switch(troop.type) {
                case 'hog':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 400;
                    else { damage = 200 * 3; additionalHits = 2; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Хог: ${damage} урона${additionalHits ? '' : ''}`;
                    break;
                case 'golem':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 800;
                    else { damage = 250 * 4; additionalHits = 2; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Голем: ${damage} урона${additionalHits ? ' ' : ''}`;
                    break;
                case 'pekka':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 0;
                    else { damage = 600 * 3; additionalHits = 2; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Пекка: ${damage} урона${additionalHits ? '' : ''}`;
                    break;
                case 'miniPekka':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 0;
                    else { damage = 400 * 2; additionalHits = 1; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Мини пекка: ${damage} урона${additionalHits ? '' : ''}`;
                    break;
                case 'barbs':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 520;
                    else { damage = 500 * 2; additionalHits = 1; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Варвары: ${damage} урона${additionalHits ? '' : ''}`;
                    break;
                case 'musk':
                    if (areGoblinsAlive()) { damage = 0; killAllOfType('goblin'); result = 'Мушкетер: убил гоблинов, но не справился с дровосеком'; }
                    else if (isLumberAlive()) { damage = 0; result = 'Мушкетер: убит дровосеком'; }
                    else { damage = 150 * 4; additionalHits = 2; result = `Мушкетер: ${damage} урона`; }
                    break;
                case 'lumber':
                    if (areGoblinsAlive()) { damage = 0; killAllOfType('goblin'); result = 'Дровосек: убил гоблинов'; }
                    else if (isLumberAlive()) { damage = 0; result = 'Дровосек: погиб в бою с другим дровосеком'; }
                    else { damage = 180 * 4; additionalHits = 2; result = `Дровосек: ${damage} урона`; }
                    break;
                case 'witch':
                    if (areGoblinsAlive() || isLumberAlive()) damage = 700;
                    else { damage = 100 * 5; additionalHits = 2; }
                    killAllOfType('goblin'); killAllOfType('lumber');
                    result = `Ведьма: ${damage} урона${additionalHits ? '' : ''}`;
                    break;
            }
        }

        totalDamage += damage;
        battleLog.push(result);
    });

    // Обновляем HP башен (урон поровну на обе принцессы)
    enemyDefenses.forEach(def => {
        if (def.type === 'princess') {
            def.currentHp = Math.max(0, def.hp - (totalDamage / 2));
            updateDefenseUnitHp(def);
        }
    });
    updateTowerHpBars();
    updateEnemyZone();

    const popup = document.getElementById('popup');
    const popupMsg = document.getElementById('popupMsg');
    const popupSub = document.getElementById('popupSub');
    if (totalDamage >= 500) {
        popupMsg.innerText = '⚔️ АТАКА УСПЕШНА!';
        popupSub.innerText = `Нанесено ${totalDamage} урона по башням!\n\n${battleLog.join('\n')}`;
    } else {
        popupMsg.innerText = '💔 АТАКА ПРОВАЛЕНА';
        popupSub.innerText = `Нанесено только ${totalDamage} урона (нужно 500)\n\n${battleLog.join('\n')}`;
    }
    popup.classList.add('show');
}

function initGame() {
    buildArena();
    initTowerReferences();
    showAvailableCards();

    const scenarioBtns = document.querySelectorAll('#scenarioGroup .diff-btn');
    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScenario = parseInt(btn.dataset.scenario);
            resetGame();
        });
    });

    document.getElementById('attackBtn').addEventListener('click', startAttack);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('popupBtn').addEventListener('click', () => {
        document.getElementById('popup').classList.remove('show');
        resetGame();
    });

    loadScenario(1);
}

window.addEventListener('load', initGame);