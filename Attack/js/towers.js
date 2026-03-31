// ==================== БАШНИ ====================
let leftPrincessFill, rightPrincessFill, kingHpFill;

function updateTowerHpBars() {
    let leftTower = enemyDefenses.find(d => d.type === 'princess' && d.side === 'left');
    let rightTower = enemyDefenses.find(d => d.type === 'princess' && d.side === 'right');
    let kingTower = enemyDefenses.find(d => d.type === 'king');
    if (leftTower && leftPrincessFill) leftPrincessFill.style.width = (leftTower.currentHp / leftTower.hp) * 100 + '%';
    if (rightTower && rightPrincessFill) rightPrincessFill.style.width = (rightTower.currentHp / rightTower.hp) * 100 + '%';
    if (kingTower && kingHpFill) kingHpFill.style.width = (kingTower.currentHp / kingTower.hp) * 100 + '%';
}

function initTowerReferences() {
    leftPrincessFill = document.getElementById('leftPrincessFill');
    rightPrincessFill = document.getElementById('rightPrincessFill');
    kingHpFill = document.getElementById('kingHpFill');
}