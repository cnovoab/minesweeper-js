const BASE_URL = 'https://minesweeper-rails-api.herokuapp.com';
let GAME_URL;
// const BASE_URL = 'http://localhost:3000';
const grid = document.getElementById('game');
const marquee = document.getElementById('marquee');
let STATE;
const plays = new Map();
let timer;
let elapsedTime;

const newGame = async (difficulty = 'beginner') => {
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
  const elapsedTime = game.started_at;
  const flagCell = marquee.rows[0].cells[0];
  const stateCell = marquee.rows[0].cells[1];
  const timeCell = marquee.rows[0].cells[2];
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

const flagCell = (row, col) => {
  const cell = grid.rows[row].cells[col];
  const flagged = cell.dataset.flagged === 'false';
  flagged ? cell.classList.add('flagged') : cell.classList.remove('flagged');
  const response = axios.patch(`${GAME_URL}/board/${row}/${col}`, { flagged });
  updateGrid(response.data);
};

const clickOnCell = (event) => {
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

grid.addEventListener('contextmenu', clickOnCell, false);
grid.addEventListener('click', clickOnCell, false);

const setTimer = () => {
  timer = setInterval(() => {
    if (['won', 'lost'].includes(STATE)) return;
    elapsedTime = (elapsedTime || 0) + 1;
    marquee.rows[0].cells[2].innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
};

// Start new game
newGame();
