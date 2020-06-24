const BASE_URL = 'http://localhost:3000';

class Game {
  constructor(difficulty) {
  const response = await axios.post(`${BASE_URL}/games`, { difficulty });
  }
}
