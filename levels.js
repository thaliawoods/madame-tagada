const GRID = 6;
const LEVELS = [
  {
    name: 'Plateau 1 — Tagada rose',
    start: { col: 0, row: 0, dir: 1 },
    pot:   { col: 5, row: 5 },
    obstacles: [
      { col: 1, row: 1 }, { col: 3, row: 2 }, { col: 2, row: 4 }, { col: 4, row: 3 },
    ],
    stars: [
      { col: 5, row: 0 }, { col: 0, row: 5 }, { col: 3, row: 3 },
    ],
    color: '#ff8db3', colorDeep: '#c46285', colorName: 'rose', colorMasc: 'rose',
  },
  {
    name: 'Plateau 2 — Tagada bleue',
    start: { col: 5, row: 0, dir: 2 },
    pot:   { col: 0, row: 5 },
    obstacles: [
      { col: 4, row: 1 }, { col: 1, row: 2 }, { col: 3, row: 3 }, { col: 2, row: 4 },
    ],
    stars: [
      { col: 0, row: 0 }, { col: 5, row: 5 }, { col: 3, row: 1 },
    ],
    color: '#82c8e5', colorDeep: '#4a90a8', colorName: 'bleue', colorMasc: 'bleu',
  },
  {
    name: 'Plateau 3 — Tagada citron',
    start: { col: 0, row: 5, dir: 0 },
    pot:   { col: 5, row: 0 },
    obstacles: [
      { col: 1, row: 3 }, { col: 3, row: 2 }, { col: 2, row: 4 }, { col: 4, row: 1 },
    ],
    stars: [
      { col: 0, row: 0 }, { col: 5, row: 5 }, { col: 3, row: 4 },
    ],
    color: '#ffd866', colorDeep: '#c4a040', colorName: 'jaune', colorMasc: 'jaune',
  },
  {
    name: 'Plateau 4 — Tagada pomme',
    start: { col: 5, row: 5, dir: 3 },
    pot:   { col: 0, row: 0 },
    obstacles: [
      { col: 4, row: 4 }, { col: 3, row: 2 }, { col: 1, row: 3 }, { col: 2, row: 1 },
    ],
    stars: [
      { col: 0, row: 5 }, { col: 5, row: 0 }, { col: 3, row: 3 },
    ],
    color: '#9eda9e', colorDeep: '#5a9c5c', colorName: 'verte', colorMasc: 'vert',
  },
  {
    name: 'Plateau 5 — Tagada raisin',
    start: { col: 0, row: 3, dir: 1 },
    pot:   { col: 5, row: 2 },
    obstacles: [
      { col: 2, row: 1 }, { col: 2, row: 3 }, { col: 2, row: 4 }, { col: 3, row: 2 }, { col: 4, row: 3 },
    ],
    stars: [
      { col: 1, row: 0 }, { col: 0, row: 5 }, { col: 5, row: 5 },
    ],
    color: '#c39ee6', colorDeep: '#8a6db5', colorName: 'violette', colorMasc: 'violet',
  },
];
