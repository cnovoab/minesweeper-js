// const BASE_URL = 'https://minesweeper-rails-api.herokuapp.com';
let GAME_URL;
const BASE_URL = 'http://localhost:3000';
const grid = document.getElementById('game');
const marquee = document.getElementById('marquee');
let STATE;

const newGame = (difficulty = 'beginner') => {
  axios.post(`${BASE_URL}/games`, { difficulty })
    .then(function(response) {
      const game = response.data;
      GAME_URL = `${BASE_URL}/games/${game.id}`;
      STATE = game.state;
      updateMarquee(game);
      for (let i = 0; i < game.rows; i++) {
        const row = grid.insertRow(i);
        for (let j = 0; j < game.cols; j++) {
          const cell = row.insertCell(j);
          updateCell(i, j, game.board[i][j]);
          cell.className = 'game-cell';
        }
      }
    });
};

const updateMarquee = game => {
  const flags = document.querySelectorAll('td.flagged').length;
  marquee.rows[0].cells[0].innerHTML = game.mines - flags;
  marquee.rows[0].cells[1].innerHTML = game.state;
  marquee.rows[0].cells[2].innerHTML = 99;
};

const updateCell = (row, col, data) => {
  const cell = grid.rows[row].cells[col];
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.revealed = data.revealed;
  cell.dataset.flagged = data.flagged;
  cell.dataset.mine = data.mine;
  cell.dataset.value = data.value || '';
  if (data.revealed) {
    cell.innerHTML = data.value;
    if(!cell.classList.contains('revealed')) {
      cell.classList.add('revealed');
    }
    if (data.mine && !cell.classList.contains('mined')) {
      cell.classList.add('mined');
    }
  }
};

const updateGrid = (game) => {
  STATE = game.state;
  for (let i = 0; i < game.rows; i++) {
    for (let j = 0; j < game.cols; j++) {
      updateCell(i, j, game.board[i][j]);
    }
  }
  updateMarquee(game);
};

const revealCell = (row, col) => {
  const cell = grid.rows[row].cells[col];
  axios.patch(`${GAME_URL}/board/${row}/${col}`, { revealed: true })
  .then((response) => {
    const game = response.data;
    updateGrid(game);
  });
};

const flagCell = (row, col) => {
  const cell = grid.rows[row].cells[col];
  const flagged = grid.rows[row].cells[col].dataset.flagged === 'false';
  axios.patch(`${GAME_URL}/board/${row}/${col}`, { flagged })
  .then((response) => {
    if (flagged) {
      cell.classList.add('flagged');
    } else {
      cell.classList.remove('flagged');
    }
    updateGrid(response.data);
  });
};

grid.addEventListener('contextmenu', event => {
  event.preventDefault();
  if (event.target.className !== 'game-cell') return;
  if (['won', 'lost'].includes(STATE)) return;
  const { row, col } = event.target.dataset;
  flagCell(row, col);
});

grid.addEventListener('click', event => {
  if (!event.target.classList.contains('game-cell')) return;
  if (['won', 'lost'].includes(STATE)) return;
  const { row, col } = event.target.dataset;
  revealCell(row, col);
});

newGame();
