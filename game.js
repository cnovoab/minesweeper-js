const BASE_URL = 'https://minesweeper-rails-api.herokuapp.com';
let GAME_URL;
// const BASE_URL = 'http://localhost:3000';
const grid = document.getElementById('game');

const newGame = (difficulty = 'beginner') => {
  axios.post(`${BASE_URL}/games`, { difficulty })
    .then(function(response) {
      const game = response.data;
      GAME_URL = `${BASE_URL}/games/${game.id}`;

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

const updateCell = (row, col, data) => {
  const cell = grid.rows[row].cells[col];
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.revealed = data.revealed;
  cell.dataset.flagged = data.flagged;
  cell.dataset.mine = data.mine;
  cell.dataset.value = data.value || '';
  cell.innerHTML = data.value;
  if (data.revealed && !cell.classList.contains('revealed')) {
    cell.classList.add('revealed');
  }
};

const updateGrid = (game) => {
  for (let i = 0; i < game.rows; i++) {
    for (let j = 0; j < game.cols; j++) {
      updateCell(i, j, game.board[i][j]);
    }
  }
};

const revealCell = (row, col) => {
  const cell = grid.rows[row].cells[col];
  axios.patch(`${GAME_URL}/board/${row}/${col}`, { revealed: true })
  .then((response) => {
    const game = response.data;
    if (game.state === 'won') {
      return alert('You win!');
    } else if (game.state === 'lost') {
      return alert('You lose :(');
    } else {
      updateGrid(response.data);
    };
  });
};

const flagCell = (row, col) => {
  const cell = grid.rows[row].cells[col];
  const flagged = grid.rows[row].cells[col].dataset.flagged === 'false';
  axios.patch(`${GAME_URL}/board/${row}/${col}`, { flagged })
  .then((response) => {
    updateGrid(response.data);
    if (flagged) {
      cell.classList.add('flagged');
    } else {
      cell.classList.remove('flagged');
    }
  });
};

grid.addEventListener('contextmenu', event => {
  event.preventDefault();
  if (event.target.className !== 'game-cell') return;
  const { row, col } = event.target.dataset;
  flagCell(row, col);
});

grid.addEventListener('click', event => {
  if (event.target.className !== 'game-cell') return;
  const { row, col } = event.target.dataset;
  revealCell(row, col);
  console.log('row', row, 'col', col);
});

newGame();
