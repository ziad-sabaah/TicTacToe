const gameBoard =(function (){
    let board = ["", "", "", "", "", "", "", "", ""];
    const getBoard = () => board;
    const getCell = (index) => board[index];
    const setCell = (index, value) => {
        if (index >= 0 && index < 9 && board[index] === "") {
          board[index] = value;
          return true;
        }
        return false;
      };
    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };
    return { getBoard, getCell, setCell, resetBoard };
})();

const Player = function(sign) {
    const getSign = () => sign;
    return { getSign };
  };

const gameController = (function () {
    let players = [Player("X"), Player("O")];
    let currentPlayer = 0;
    let gameOver = false;
    let scores = { X: 0, O: 0 };
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    const getScores = () => scores;
    const resetScores = () => {
        scores = { X: 0, O: 0 };
    }

    const setPlayers = (player1Sign) => {
      players = player1Sign === "X" ? [Player("X"), Player("O")] : [Player("O"), Player("X")];
      currentPlayer = players[0].getSign() === "X" ? 0 : 1; // Ensure X starts
    };

    const switchPlayer = () => {
        currentPlayer = (currentPlayer + 1) % 2;
    };

    const getCurrentPlayerSign = () => players[currentPlayer].getSign();
    const isGameOver = () => gameOver;

    const checkWin = () => {
        return winningCombos.some(combo => {
            return combo.every(index => {
                return gameBoard.getCell(index) === players[currentPlayer].getSign();
            });
        });
    };

    const checkDraw = () => {
        return gameBoard.getBoard().every(cell => cell !== "");
    }

    const checkMove = (move) => {
        if (gameOver || move < 0 || move > 8) {
            return { valid: false, message: "Invalid move!" };
        }
        const valid = gameBoard.setCell(move, players[currentPlayer].getSign());
        if (valid) {
          if (checkWin()) {
            gameOver = true;
            scores[players[currentPlayer].getSign()]++;
            return { valid: true, message: `Player ${players[currentPlayer].getSign()} wins!` };

          } else if (checkDraw()) {
            gameOver = true;
            return { valid: true, message: "It's a draw!" };
          } else {
            switchPlayer();
            return { valid: true, message: "" };
          }
        }
        return { valid: false, message: "Cell taken!" };
    };

    const resetGame = () => {
        gameBoard.resetBoard();
        gameOver = false;
        currentPlayer = players[0].getSign() === "X" ? 0 : 1; // X starts     
        } 

    return { getScores, resetScores, checkMove, setPlayers, getCurrentPlayerSign, isGameOver, resetGame };
})();

const pcPlayer = (function() {
  let difficulty = 'easy';

  const setDifficulty = (level) => {
    if (['easy', 'medium', 'hard'].includes(level)) {
      difficulty = level;
    }
  };

  const getValidMoves = (board) => {
    return board.reduce((moves, cell, index) => {
      if (cell === "") moves.push(index);
      return moves;
    }, []);
  };

  const evaluateBoard = (board, player, opponent) => {
    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const combo of winningCombos) {
      if (combo.every(i => board[i] === player)) return 10;
      if (combo.every(i => board[i] === opponent)) return -10;
    }
    return 0;
  };

  const minimax = (board, depth, isMaximizing, player, opponent) => {
    const score = evaluateBoard(board, player, opponent);
    if (score !== 0) return score - depth;
    if (!getValidMoves(board).length) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (const move of getValidMoves(board)) {
        board[move] = player;
        best = Math.max(best, minimax(board, depth + 1, false, player, opponent));
        board[move] = "";
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of getValidMoves(board)) {
        board[move] = opponent;
        best = Math.min(best, minimax(board, depth + 1, true, player, opponent));
        board[move] = "";
      }
      return best;
    }
  };

  const makeMove = () => {
    const board = gameBoard.getBoard();
    const validMoves = getValidMoves(board);

    if (difficulty === 'easy') {
      // Random move
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    } else if (difficulty === 'medium') {
      // Check for winning move 
      for (const move of validMoves) {
        board[move] = "O";
        if (evaluateBoard(board, "O", "X") > 0) {
          board[move] = "";
          return move;
        }
        board[move] = "";
      }
      // Check for blocking move
      for (const move of validMoves) {
        board[move] = "X";
        if (evaluateBoard(board, "X", "O") > 0) {
          board[move] = "";
          return move;
        }
        board[move] = "";
      }
      // Taking center if availbe else Random move
      if (validMoves.includes(4)) return 4;
      return validMoves[Math.floor(Math.random() * validMoves.length)];

    } else {
      let bestScore = -Infinity;
      let bestMove = -1;
      for (const move of validMoves) {
        board[move] = "O";
        const score = minimax(board, 0, false, "O", "X");
        board[move] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }
  };

  return { setDifficulty, makeMove };
})();


// Uncomment the following lines to play the game in the console   
// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
//     });
//     function printBoard () {
//         const board = gameBoard.getBoard();
//         console.log(` ${board[0] || ' '} | ${board[1] || ' '} | ${board[2] || ' '}`);
//         console.log("---+---+---");
//         console.log(` ${board[3] || ' '} | ${board[4] || ' '} | ${board[5] || ' '}`);
//         console.log("---+---+---");
//         console.log(` ${board[6] || ' '} | ${board[7] || ' '} | ${board[8] || ' '}`);
//     };

//     function printScores() {
//         const scores = gameController.getScores();
//         console.log("|----------------|");
//         console.log("|  Scores        |");
//         console.log(`|Player X: ${scores.X.toString().padEnd(6)}|`);
//         console.log(`|Player O: ${scores.O.toString().padEnd(6)}|`);
//         console.log("|________________|");
//     }
    
//     function playGameInteractive() {
//         console.log("Tic-Tac-Toe!");
//         function askMove() {
//             const player = gameController.getCurrentPlayerSign();
//             printBoard();
//             readline.question(`Player ${player}, enter move (0-8): `, input => {
//             const move = parseInt(input, 10);
//             const result = gameController.checkMove(move);
//             console.log(result.message);
//             if (!gameController.isGameOver()) {
//                 askMove();
//             } else {
//                 printScores();
//                 askPlayAgain();
//             }
//             });
//         }

//     function askPlayAgain() {
//         readline.question("Play again? (y/n): ", answer => {
//           if (answer.toLowerCase() === 'y') {
//             gameController.resetGame();
//             console.log("New game! Enter move as a number from 0-8:");
//             gameBoard.printBoard();
//             askMove();
//           } else {
//             console.log("Thanks for playing!");
//             readline.close();
//           }
//         });
//     }
//     askMove();
// }
    
// playGameInteractive();

const preGame = document.getElementById('pre-game');
const game = document.getElementById('game');
const gameModeSelect = document.getElementById('game-mode');
const pvpcOptions = document.querySelectorAll('.pvpc-options');
const playerSignSelect = document.getElementById('player-sign');
const difficultySelect = document.getElementById('difficulty');
const startGameButton = document.getElementById('start-game');
const tiles = document.querySelectorAll('.tile');
const scoreXSpan = document.getElementById('score-x');
const scoreOSpan = document.getElementById('score-o');
const turnXSpan = document.getElementById('turn-x');
const turnOSpan = document.getElementById('turn-o');
const slidingWindow = document.querySelector('.sliding-window');
const messageDiv = document.getElementById('message');
const playAgainButton = document.getElementById('play-again');
const backToMenuButton = document.getElementById('back-to-menu');

let is_pvp = true;

function updateUI() {
  const scores = gameController.getScores();
  const currentPlayer = gameController.getCurrentPlayerSign();
  const isGameOver = gameController.isGameOver();

  scoreXSpan.textContent = scores.X;
  scoreOSpan.textContent = scores.O;

  if (is_pvp) {
    turnXSpan.textContent = 'Player X';
    turnOSpan.textContent = 'Player O';
  } else {
    turnXSpan.textContent = playerSignSelect.value === 'X' ? 'You (X)' : 'Computer (X)';
    turnOSpan.textContent = playerSignSelect.value === 'O' ? 'You (O)' : 'Computer (O)';
  }

  slidingWindow.classList.remove('x-active', 'o-active');
  slidingWindow.classList.add(currentPlayer === 'X' ? 'x-active' : 'o-active');
  document.querySelector('.x-score').classList.toggle('active', currentPlayer === 'X');
  document.querySelector('.o-score').classList.toggle('active', currentPlayer === 'O');

  messageDiv.textContent = '';
  playAgainButton.style.display = isGameOver ? 'block' : 'none';
  backToMenuButton.style.display = isGameOver ? 'block' : 'none';
}

function triggerPcMove() {
  if (is_pvp || gameController.isGameOver() || gameController.getCurrentPlayerSign() === playerSignSelect.value) {
    console.log('No AI move needed');
    return;
  }
  setTimeout(() => {
    const move = pcPlayer.makeMove();
    console.log('Pc Player move:', move);
    const currentPlayerSign = gameController.getCurrentPlayerSign();
    const result = gameController.checkMove(move);
    if (result.valid) {
      const tile = document.querySelector(`.tile[data-index="${move}"]`);
      const back = tile.querySelector('.back');
      back.textContent = currentPlayerSign;
      tile.classList.add('flipped');
      messageDiv.textContent = result.message;
      updateUI();
    } else {
      console.error('AI invalid move:', result);
    }
  }, 500);
}

function startGame() {
  is_pvp = gameModeSelect.value === 'pvp';
  gameController.setPlayers(is_pvp ? 'X' : playerSignSelect.value);
  if (!is_pvp) {
    pcPlayer.setDifficulty(difficultySelect.value);
  }
  gameController.resetGame();
  gameController.resetScores();
  tiles.forEach(tile => {
    tile.classList.remove('flipped');
    tile.querySelector('.back').textContent = '';
  });
  messageDiv.textContent = '';
  preGame.style.display = 'none';
  game.style.display = 'block';
  updateUI();
  if (!is_pvp && gameController.getCurrentPlayerSign() !== playerSignSelect.value) {
    triggerPcMove();
  }
}

gameModeSelect.addEventListener('change', () => {
  pvpcOptions.forEach(option => {
    option.style.display = gameModeSelect.value === 'pvpc' ? 'flex' : 'none';
  });
  console.log('Game mode:', gameModeSelect.value);
});

startGameButton.addEventListener('click', startGame);

tiles.forEach((tile, index) => {
  tile.addEventListener('click', () => {
    console.log(`Tile ${index} clicked`);
    if (gameController.isGameOver()) {
      console.log('Game over, ignoring click');
      return;
    }
    if (is_pvp || gameController.getCurrentPlayerSign() === playerSignSelect.value) {
      const currentPlayerSign = gameController.getCurrentPlayerSign();
      const result = gameController.checkMove(index);
      console.log('Move result:', result);
      if (result.valid) {
        const back = tile.querySelector('.back');
        back.textContent = currentPlayerSign;
        tile.classList.add('flipped');
        messageDiv.textContent = result.message;
        updateUI();
        if (!is_pvp) {
          triggerPcMove();
        }
      } else {
        messageDiv.textContent = result.message;
      }
    }
  });
});

playAgainButton.addEventListener('click', () => {
  console.log('Play again clicked');
  gameController.resetGame();
  tiles.forEach(tile => {
    tile.classList.remove('flipped');
    tile.querySelector('.back').textContent = '';
  });
  messageDiv.textContent = '';
  updateUI();
  if (!is_pvp && gameController.getCurrentPlayerSign() !== playerSignSelect.value) {
    triggerPcMove();
  }
});

backToMenuButton.addEventListener('click', () => {
  console.log('Back to menu clicked');
  game.style.display = 'none';
  preGame.style.display = 'block';
  pvpcOptions.forEach(option => {
    option.style.display = gameModeSelect.value === 'pvpc' ? 'flex' : 'none';
  });
  gameController.resetGame();
  gameController.resetScores();
});

pvpcOptions.forEach(option => {
  option.style.display = gameModeSelect.value === 'pvpc' ? 'flex' : 'none';
});
updateUI();