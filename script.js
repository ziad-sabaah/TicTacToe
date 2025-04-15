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
    const printBoard = () => {
        console.log(` ${board[0] || ' '} | ${board[1] || ' '} | ${board[2] || ' '}`);
        console.log("---+---+---");
        console.log(` ${board[3] || ' '} | ${board[4] || ' '} | ${board[5] || ' '}`);
        console.log("---+---+---");
        console.log(` ${board[6] || ' '} | ${board[7] || ' '} | ${board[8] || ' '}`);
    };
    
    return { getBoard, getCell, setCell, resetBoard, printBoard };
})();

const Player = function(sign) {
    const getSign = () => sign;
    return { getSign };
  };

const gameController = (function () {
    const players = [Player("X"), Player("O")];
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
        //   console.log("Invalid move! Try again.");
        //   return false;
            return { valid: false, message: "Invalid move!" };
        }
        const valid = gameBoard.setCell(move, players[currentPlayer].getSign());
        if (valid) {
        //   gameBoard.printBoard();
          if (checkWin()) {
            gameOver = true;
            scores[players[currentPlayer].getSign()]++;
            // console.log(`Player ${players[currentPlayer].getSign()} wins!`);
            // return;
            return { valid: true, message: `Player ${players[currentPlayer].getSign()} wins!` };

          } else if (checkDraw()) {
            gameOver = true;
            // console.log("It's a draw!");
            // return;

            return { valid: true, message: "It's a draw!" };
          } else {
            switchPlayer();
            return { valid: true, message: "" };
          }
        }

        // console.log("Cell taken! Try again.");
        // return false;
        return { valid: false, message: "Cell taken!" };
    };

    const resetGame = () => {
        gameBoard.resetBoard();
        gameOver = false;
        currentPlayer = 0;
    }

    return { getScores, resetScores, checkMove, getCurrentPlayerSign, isGameOver, resetGame };
})();

// Uncomment the following lines to play the game in the console   
// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
//     });

//     function printScores() {
//         const scores = gameController.getScores();
//         console.log("|----------------|");
//         console.log("|  Scores        |");
//         console.log(`|Player X: ${scores.X.toString().padEnd(6)}|`);
//         console.log(`|Player O: ${scores.O.toString().padEnd(6)}|`);
//         console.log("|________________|");
//     }
    
//     function playGameInteractive() {
//         gameController.resetGame();
//         console.log("Tic-Tac-Toe!");
//         gameBoard.printBoard();
        
//         function askMove() {
//             const player = gameController.getCurrentPlayerSign();
//             readline.question(`Player ${player}, enter move (0-8): `, input => {
//             const move = parseInt(input, 10);
//             gameController.checkMove(move);
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

const board = document.querySelector('.board');
const tiles = document.querySelectorAll('.tile');
const currentPlayerSpan = document.getElementById('current-player');
const scoreXSpan = document.getElementById('score-x');
const scoreOSpan = document.getElementById('score-o');
const messageDiv = document.getElementById('message');
const playAgainButton = document.getElementById('play-again');

function updateUI() {
  const scores = gameController.getScores();
  scoreXSpan.textContent = scores.X;
  scoreOSpan.textContent = scores.O;
  currentPlayerSpan.textContent = gameController.getCurrentPlayerSign();
  playAgainButton.style.display = gameController.isGameOver() ? 'block' : 'none';
}

tiles.forEach(tile => {
  tile.addEventListener('click', () => {
    if (gameController.isGameOver()) return;
    const index = parseInt(tile.dataset.index);
    const result = gameController.checkMove(index);
    if (result.valid) {
      const back = tile.querySelector('.back');
      back.textContent = currentPlayerSpan.textContent;
      tile.classList.add('flipped');
      messageDiv.textContent = result.message;
      updateUI();
    } else {
      messageDiv.textContent = result.message;
    }
  });
});

playAgainButton.addEventListener('click', () => {
  gameController.resetGame();
  tiles.forEach(tile => {
    tile.classList.remove('flipped');
    tile.querySelector('.back').textContent = '';
  });
  messageDiv.textContent = '';
  updateUI();
});

updateUI(); // Initial setup