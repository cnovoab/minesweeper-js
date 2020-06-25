const BASE_URL = 'https://minesweeper-rails-api.herokuapp.com';
let GAME_URL, STATE, timer, elapsedTime, plays;
// const BASE_URL = 'http://localhost:3000';
const grid = document.getElementById('game');
const marquee = document.getElementById('marquee');
const level = document.getElementById("difficulty");
const restartButton = document.querySelector('.state');

const newGame = async (difficulty = 'beginner') => {
  plays = new Map();
  grid.innerHTML = ""
  elapsedTime = 0;
  document.querySelector('.time').innerText = "000";
  const response = await axios.post(`${BASE_URL}/games`, { difficulty });
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
};

const updateMarquee = game => {
  const flags = document.querySelectorAll('td.flagged').length;
  const [ flagCell, stateCell ] = marquee.rows[0].cells;
  flagCell.innerHTML = game.mines - flags;
  stateCell.classList.remove(...stateCell.classList);
  stateCell.classList.add('state');
  stateCell.classList.add(game.state);
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
    visualReveal(row, col);
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

const visualReveal = (row, col) => {
  const cell = grid.rows[row].cells[col];
  cell.classList.add('revealed');
  if (cell.dataset.mine === 'true') {
    cell.classList.add('mined');
    if (plays.has(row) && plays.get(row).includes(col)) {
      cell.classList.add('clicked-mine');
    }
  } else if (cell.dataset.flagged === 'false') {
    cell.innerHTML = cell.dataset.value;
  }
};

const revealCell = async (row, col) => {
  const cell = grid.rows[row].cells[col];
  visualReveal(row, col);
  const response = await axios.patch(`${GAME_URL}/board/${row}/${col}`, { revealed: true })
  updateGrid(response.data);
};

const flagCell = async (row, col) => {
  const cell = grid.rows[row].cells[col];
  const flagged = cell.dataset.flagged === 'false';
  flagged ? cell.classList.add('flagged') : cell.classList.remove('flagged');
  const response = await axios.patch(`${GAME_URL}/board/${row}/${col}`, { flagged });
  updateGrid(response.data);
};

const clickOnCell = event => {
  event.preventDefault();
  if (event.target.className !== 'game-cell') return;
  if (['won', 'lost'].includes(STATE)) return;
  if (!timer) setTimer();
  const { row, col } = event.target.dataset;
  if (event.type === 'contextmenu') {
    return flagCell(row, col);
  }
  plays.set(row * 1, (plays.get(row * 1) || []).concat(col * 1));
  revealCell(row, col);
};

const levelChange = async (event) => {
  const difficulty = event.target.selectedOptions[0].value;
  await newGame(difficulty);
};

const setTimer = () => {
  timer = setInterval(() => {
    if (['unstarted', 'won', 'lost'].includes(STATE)) return;
    elapsedTime = (elapsedTime || 0) + 1;
    marquee.rows[0].cells[2].innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
};

grid.addEventListener('contextmenu', clickOnCell, false);
grid.addEventListener('click', clickOnCell, false);
level.addEventListener('change', levelChange, false);
restartButton.addEventListener('click', () => {
  newGame(level.selectedOptions[0].value);
}, false);

// Start new game
newGame();
