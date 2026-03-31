// ==================== ПОСТРОЕНИЕ АРЕНЫ ====================
function buildArena() {
    const arena = document.getElementById('arena');
    // Удаляем все старые клетки
    const oldCells = arena.querySelectorAll('.cell');
    oldCells.forEach(cell => cell.remove());

    // Определяем зоны башен, которые будут неактивными
    const towerZones = [
        // Король: строки 2-3, колонки 14-19 (6 колонок)
        { rowStart: 2, rowEnd: 3, colStart: 14, colEnd: 19 },
        // Левая принцесса: строки 6-7, колонки 6-8
        { rowStart: 6, rowEnd: 7, colStart: 6, colEnd: 8 },
        // Правая принцесса: строки 6-7, колонки 23-25 (сдвинута влево на 1)
        { rowStart: 6, rowEnd: 7, colStart: 23, colEnd: 25 }
    ];

    function isTowerZone(row, col) {
        return towerZones.some(zone => 
            row >= zone.rowStart && row <= zone.rowEnd &&
            col >= zone.colStart && col <= zone.colEnd
        );
    }

    for (let r = 1; r <= 18; r++) {
        for (let c = 1; c <= 32; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (isTowerZone(r, c)) {
                // Неактивная клетка под башней
                continue
                // Не добавляем data-row/data-col и обработчик
            } else {
                // Активная клетка
                cell.dataset.row = r;
                cell.dataset.col = c;
                if (r <= 15) cell.classList.add('enemy-cell');
                if ((r === 14 || r === 15) && (c >= 6 && c <= 8)) cell.classList.add('bridge-left');
                if ((r === 14 || r === 15) && (c >= 25 && c <= 27)) cell.classList.add('bridge-right');
                if (r === 15) cell.classList.add('mid-line');
                if (r >= 16) cell.style.backgroundColor = '#2ecc71';
                cell.addEventListener('click', () => onCellClick(r, c, cell));
            }

            arena.appendChild(cell);
        }
    }
}