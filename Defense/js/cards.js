// Карты с ХП, уроном и дальностью (11 уровень)
const CARDS = [
  { name: 'ТЕСЛА', elixir: 4, type: 'tesla', emoji: '⚡', hp: 954, damage: 269, range: 6, target: 'building', oneTime: false, swarmCount: 1, attackSpeed: 0.8 },
  { name: 'ВАРВАРЫ', elixir: 5, type: 'barbs', emoji: '🪓', hp: 598, damage: 174, range: 1, target: 'ground', oneTime: false, swarmCount: 5, attackSpeed: 1.5 },
  { name: 'МИНИПЕККА', elixir: 4, type: 'miniPekka', emoji: '⚔️', hp: 1138, damage: 572, range: 1, target: 'ground', oneTime: false, swarmCount: 1, attackSpeed: 1.8 },
  { name: 'БРЕВНО', elixir: 2, type: 'log', emoji: '🪵', damage: 384, range: 11.1, target: 'spell', oneTime: true, swarmCount: 1 },
  { name: 'ЛЕДЯНОЙ ДУХ', elixir: 1, type: 'ice', emoji: '❄️', hp: 190, damage: 63, range: 2.5, target: 'ground', oneTime: true, swarmCount: 1 },
  { name: 'ДРОВОСЕК', elixir: 4, type: 'lumber', emoji: '🪓', hp: 990, damage: 200, range: 1, target: 'ground', oneTime: false, swarmCount: 1, attackSpeed: 0.7 },
  { name: 'ГОБЛИНЫ', elixir: 3, type: 'gobs', emoji: '🐺', hp: 202, damage: 120, range: 1, target: 'ground', oneTime: false, swarmCount: 3, attackSpeed: 1.1 },
  { name: 'ЛЕТУЧИЕ МЫШИ', elixir: 2, type: 'bats', emoji: '🦇', hp: 63, damage: 83, range: 1, target: 'air', oneTime: false, swarmCount: 5, attackSpeed: 1.0 },
  { name: 'МУШКЕТЕР', elixir: 4, type: 'musk', emoji: '🏹', hp: 694, damage: 218, range: 6, target: 'air&ground', oneTime: false, swarmCount: 1, attackSpeed: 1.1 },
  { name: 'ВЕДЬМА', elixir: 5, type: 'witch', emoji: '🧙', hp: 787, damage: 138, range: 5, target: 'ground', oneTime: false, swarmCount: 1, attackSpeed: 1.4 },
  { name: 'ОГНЕННЫЙ ШАР', elixir: 4, type: 'fireball', emoji: '🔥', damage: 913, range: 2.5, target: 'spell', oneTime: true, swarmCount: 1 },
  { name: 'РЫЦАРЬ', elixir: 3, type: 'knight', emoji: '🛡️', hp: 1766, damage: 210, range: 1, target: 'ground', oneTime: false, swarmCount: 1, attackSpeed: 1.2 },
  { name: 'ПЕККА', elixir: 7, type: 'pekka', emoji: '🤖', hp: 3458, damage: 785, range: 1, target: 'ground', oneTime: false, swarmCount: 1, attackSpeed: 1.8 }
];

// Хог с уменьшенным ХП на 30% (1768 → 1238)
const HOG_HP = 1238;