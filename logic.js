let currentTurn = "x";
let gameIsFinished = false;
let gameMode = null;
let computerIsPlaying = false; // New flag to indicate computer's turn
const gridItems = document.getElementsByClassName("square");
let boardArray = Array.from({ length: 9 }, (_, i) => i.toString());
let xWins = 0;
let oWins = 0;

function startGame(mode) {
    gameMode = mode;
    document.getElementById("instruction").textContent = `${currentTurn.toUpperCase()} turn`;
    document.getElementById("game-mode-selection").style.display = "none";
    document.getElementById("win-counts-header").style.display = "flex";
    document.getElementById("board").style.display = "grid";
    document.getElementById("footer").style.display = "block";
}

Array.from(gridItems).forEach(item => {
    item.addEventListener("click", function() {
        if (gameIsFinished || computerIsPlaying || (gameMode === "computer" && currentTurn === "o")) return;

        const value = this.getAttribute("value");
        const index = value - 1;

        if (boardArray[index] === "x" || boardArray[index] === "o") return;

        makeMove(index, currentTurn);

        if (!gameIsFinished && gameMode === "computer") {
            currentTurn = "o";
            document.getElementById("instruction").textContent = `${currentTurn.toUpperCase()} turn`;
            computerIsPlaying = true; // Set flag to true
            setTimeout(computerMove, 500); // Delay for better UX
        }
    });
});

function makeMove(index, player) {
    const squareContent = document.querySelector(`.square[value='${index + 1}'] .square-content`);
    squareContent.innerHTML = player;
    squareContent.classList.add('animate__animated', 'animate__bounceIn');

    boardArray[index] = player;

    const result = evaluateBoard();
    if (result === player) {
        document.getElementById("instruction").textContent = `${player.toUpperCase()} wins!`;
        updateWinCount(player);
        gameIsFinished = true;
    } else if (result === "tie") {
        document.getElementById("instruction").textContent = `It's a draw!`;
        gameIsFinished = true;
    } else {
        currentTurn = player === "x" ? "o" : "x";
        document.getElementById("instruction").textContent = `${currentTurn.toUpperCase()} turn`;
    }
}

function computerMove() {
    if (gameIsFinished) return;

    let bestMove = getBestMove();
    makeMove(bestMove, "o");
    computerIsPlaying = false; // Reset flag after computer's move
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < boardArray.length; i++) {
        if (boardArray[i] !== "x" && boardArray[i] !== "o") {
            let temp = boardArray[i];
            boardArray[i] = "o";
            let score = minimax(boardArray, 0, false);
            boardArray[i] = temp;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let scores = {
        "o": 1,
        "x": -1,
        "tie": 0
    };

    let result = evaluateBoard();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] !== "x" && board[i] !== "o") {
                let temp = board[i];
                board[i] = "o";
                let score = minimax(board, depth + 1, false);
                board[i] = temp;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] !== "x" && board[i] !== "o") {
                let temp = board[i];
                board[i] = "x";
                let score = minimax(board, depth + 1, true);
                board[i] = temp;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluateBoard() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardArray[a] === boardArray[b] && boardArray[b] === boardArray[c]) {
            return boardArray[a];
        }
    }

    if (boardArray.every(cell => cell === "x" || cell === "o")) {
        return "tie";
    }

    return null;
}

function updateWinCount(player) {
    if (player === "x") {
        xWins++;
        document.getElementById("x-wins").textContent = xWins;
    } else {
        oWins++;
        document.getElementById("o-wins").textContent = oWins;
    }
}

document.getElementById("reset-btn").addEventListener("click", reset);

function reset() {
    gameIsFinished = false;
    currentTurn = "x";
    computerIsPlaying = false; // Reset flag on reset
    boardArray = Array.from({ length: 9 }, (_, i) => i.toString());

    Array.from(gridItems).forEach(item => {
        const value = item.getAttribute("value");
        const squareContent = document.querySelector(`.square[value='${value}'] .square-content`);
        squareContent.classList.remove('animate__animated', 'animate__bounceIn');
        squareContent.classList.add('animate__animated', 'animate__bounceOut');

        squareContent.addEventListener('animationend', function animationEndHandler(event) {
            if (event.animationName === "bounceOut") {
                squareContent.classList.remove('animate__animated', 'animate__bounceOut');
                squareContent.innerHTML = "";
                squareContent.removeEventListener('animationend', animationEndHandler);
            }
        });
    });

    startGame(gameMode); // Restart the game with the current mode
}