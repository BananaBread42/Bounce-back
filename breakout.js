
// BOARD
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// GAME STATE
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let lives = 3;
let level = 1;

// PLAYER
let playerWidth = 80;
let playerHeight = 10;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: 10
};

// BALL
let ballWidth = 10;
let ballHeight = 10;

let ball = {
    x: boardWidth / 2 - ballWidth / 2,
    y: boardHeight / 2 - ballHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 3,
    velocityY: 2
};

// BLOCKS
let blockArray = [];
let blockColumns = 8;
let blockRows = 3;
let blockWidth = 50;
let blockHeight = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

// BLOCK COLOURS
let blockColors = [
    "#ff1744",
    "#ff9100",
    "#ffee00",
    "#00e676",
    "#00e5ff",
    "#2979ff",
    "#d500f9"
];

// POWERUPS
let powerUps = [];

// START GAME
window.onload = function () {

    board = document.getElementById("board");

    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    document.addEventListener("keydown", keyHandler);

    document.addEventListener("mousemove", function(e) {

        let rect = board.getBoundingClientRect();

        player.x = e.clientX - rect.left - player.width / 2;

        // Stop paddle leaving the board
        player.x = Math.max(0, Math.min(boardWidth - player.width, player.x));
    });

    createBlocks();

    requestAnimationFrame(update);
};

// GAME LOOP
function update() {

    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    // GAME OVER SCREEN
    if (gameOver) {

        context.fillStyle = "#ff4dff";
        context.shadowColor = "#ff00ff";
        context.shadowBlur = 15;
        context.font = "bold 35px Arial";
        context.fillText("GAME OVER", 135, 150);

        context.shadowBlur = 0;

        context.fillStyle = "white";
        context.font = "18px Arial";

        context.fillText("Score: " + score, 200, 210);
        context.fillText("High Score: " + highScore, 175, 245);

        context.fillStyle = "#00e5ff";
        context.fillText("Press SPACE to Restart", 130, 300);

        return;
    }

    // UI
    context.fillStyle = "#ffffff";
    context.font = "16px Arial";

    context.fillText("Score: " + score, 10, 20);
    context.fillText("Lives: " + lives, 200, 20);
    context.fillText("Level: " + level, 380, 20);

    // PLAYER
    context.fillStyle = "#00e5ff";
    context.shadowColor = "#00e5ff";
    context.shadowBlur = 15;

    context.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    context.shadowBlur = 0;

    // BALL
    context.fillStyle = "#ffffff";
    context.shadowColor = "#ffffff";
    context.shadowBlur = 15;

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    context.fillRect(
        ball.x,
        ball.y,
        ball.width,
        ball.height
    );

    context.shadowBlur = 0;

    // WALLS
    if (ball.y <= 0) {

        ball.velocityY *= -1;

    }
    else if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {

        ball.velocityX *= -1;

    }
    else if (ball.y + ball.height >= boardHeight) {

        lives--;

        if (lives <= 0) {
            endGame();
        } else {
            resetBall();
        }
    }

    // PADDLE COLLISION
    if (detectCollision(ball, player) && ball.velocityY > 0) {

        let collidePoint =
            ball.x + ball.width / 2 -
            (player.x + player.width / 2);

        collidePoint = collidePoint / (player.width / 2);

        ball.velocityX = collidePoint * 5;
        ball.velocityY = -Math.abs(ball.velocityY);
    }

    // BLOCKS
    for (let i = 0; i < blockArray.length; i++) {

        let block = blockArray[i];

        if (!block.break) {

            if (detectCollision(ball, block)) {

                block.break = true;

                score += 10;
                blockCount--;

                // POWERUP CHANCE
                if (Math.random() < 0.2) {

                    powerUps.push({
                        x: block.x + block.width / 2 - 5,
                        y: block.y,
                        width: 10,
                        height: 10,
                        velocityY: 2
                    });

                }

                ball.velocityY *= -1;
            }

            // COLOURED BLOCKS
            context.fillStyle = blockColors[i % blockColors.length];

            context.shadowColor = context.fillStyle;
            context.shadowBlur = 8;

            context.fillRect(
                block.x,
                block.y,
                block.width,
                block.height
            );

            context.shadowBlur = 0;
        }
    }

    // POWERUPS
    context.fillStyle = "#00ff66";
    context.shadowColor = "#00ff66";
    context.shadowBlur = 12;

    for (let i = 0; i < powerUps.length; i++) {

        let p = powerUps[i];

        p.y += p.velocityY;

        context.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

        // COLLECT POWERUP
        if (detectCollision(p, player)) {

            player.width = Math.min(player.width + 20, 160);

            powerUps.splice(i, 1);
            i--;

        }
        else if (p.y > boardHeight) {

            powerUps.splice(i, 1);
            i--;

        }
    }

    context.shadowBlur = 0;

    // WIN AND NEXT LEVEL
    if (blockCount == 0) {

        level++;

        blockRows++;

        ball.velocityX *= 1.2;
        ball.velocityY *= 1.2;

        createBlocks();

        resetBall();
    }
}

// END GAME
function endGame() {

    gameOver = true;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem("highScore", highScore);
    }
}

// RESET GAME
function resetGame() {

    score = 0;
    lives = 3;
    level = 1;

    blockRows = 3;

    player.width = 80;
    player.x = boardWidth / 2 - player.width / 2;

    powerUps = [];

    createBlocks();

    resetBall();

    gameOver = false;
}

// RESET BALL
function resetBall() {

    ball.x = boardWidth / 2 - ballWidth / 2;
    ball.y = boardHeight / 2 - ballHeight / 2;

    ball.velocityX = 3;
    ball.velocityY = 2;
}

// CONTROLS
function keyHandler(e) {

    if (gameOver && e.code == "Space") {

        resetGame();
        return;
    }

    if (e.code == "ArrowLeft") {

        player.x -= player.velocityX;

    }
    else if (e.code == "ArrowRight") {

        player.x += player.velocityX;
    }

    // KEEP PLAYER INSIDE BOARD
    player.x = Math.max(
        0,
        Math.min(boardWidth - player.width, player.x)
    );
}

// COLLISION DETECTION
function detectCollision(a, b) {

    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// CREATE BLOCKS
function createBlocks() {

    blockArray = [];

    for (let c = 0; c < blockColumns; c++) {

        for (let r = 0; r < blockRows; r++) {

            blockArray.push({

                x: blockX + c * (blockWidth + 10),
                y: blockY + r * (blockHeight + 10),

                width: blockWidth,
                height: blockHeight,

                break: false
            });
        }
    }

    blockCount = blockArray.length;
}
