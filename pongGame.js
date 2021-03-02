/**
 * Audio Clips used:
 * 1: Energy Bounce (Used for wall bouncing): https://freesound.org/s/523088/
 * 2: Ruler Smack (Used for player collision): https://freesound.org/s/203075/
 */


// These will hold the canvas, and it's context
let canvas, ctx;

// This object will hold the keys that the user is pressing. We can check these
// Values in the gameLoop, and update our pieces accordingly
let keysPressed = {};

// Flags to end the game
// let player1Win = false;
// let player2Win = false;
let won = false;

/**
 * This variable will be set when each player scores
 * Essentially, If player 1 scores, then the puck will head towards player 2
 * next, and vice versa
 */
let player1Start = false;

// This tells us if we are playing single player or not
let singlePlayerMode = true;

// These three variables will keep track of each objects postion
var player1 = {
    x: 10,
    y: 10,
    width: 5,
    height: 60,
    score: 0,
};

var player2 = {
    x: 580,
    y: 10,
    width: 5,
    height: 60,
    score: 0,
}

var puck = {
    x: 300,
    y: 175,
    r: 10,
    start: 0,
    end: 360,

    // For velocity of the puck
    xVelocity: -2,
    yVelocity: .2,
}

function init() {
    // Grab the context
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");

    // Start by drawing all of the players & the ball
    // ctx.save();
    // initialize();
    // ctx.restore();

    return;
}

/**
 * This function will start the appropriate game loop from the Game Mode Selection Menu
 * @param {string} mode game mode we are playing in
 */
function chooseGameMode(mode) {

    // Choose our game mode now, and update singlePlayerMode flag
    switch(mode) {
        case 'singlePlayer':
            singlePlayerMode = true;
            break;
        case 'twoPlayer':
            singlePlayerMode = false;
            break;
        default:
            // Just Return. it will not add any listners or change visibility
            return;
    }

    // Hide Our Game Mode Menu; Show Canvas
    document.getElementById("gameModeMenu").style = "display: none;";
    canvas.style = "display: block;";

    // Add event listners

    // I borrowed this idea for implementing concurrent key watching from here: https://www.gavsblog.com/blog/detect-single-and-multiple-keypress-events-javascript
    // If you implement the controls in a simple switch like I did originally, it appears laggy and slow with movement

    // Player Controls
    document.addEventListener('keydown',(e) => {
        // When the key is pressed, set it to true
        keysPressed[e.key] = true;
    })

    // Add an event listner for when the key is released
    document.addEventListener('keyup', (e) => {
        // When the key is released, set it to false
        keysPressed[e.key] = false;
    })

    // Move Players to start
    movePlayersToStart();

    // Initialize the board, and start the game
    initialize();

    return;
}

/**
 * This Shows the Game Mode Selection Menu, and hides the canvas
 * We can reset the scoreboard here, since we will be returning to our
 * main game menu
 */
function showGameModeMenu() {
    // Show Our Game Mode Menu; Hide Canvas
    document.getElementById("gameModeMenu").style = "display: block;";
    canvas.style = "display: none;";

    // Reset the score to zero
    player1.score = 0;
    player2.score = 0;

    // Update the scoreboard
    updateScoreboard();
}

/*
 * This will intialize the game board for Game & round Start
 */
function initialize() {
    // Since this will initialize the board for game & round start, we
    // need to clear the canvas
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // Start by drawing player one
    // This will draw the player either in its default position, or whatever its current position is
    // drawPlayer1(10, 10, 5, 60);
    // drawPlayer1(player1.x, player1.y, player1.width, player1.height);
    drawPlayer1();

    // Now Draw player two
    // drawPlayer2(580, 10, 5, 60);
    // drawPlayer2(player2.x, player2.y, player2.width, player2.height);
    drawPlayer2();

    // Draw the Center Dividing Line
    drawCenterLine();

    // Draw the Puck
    // drawPuck(300, 175, 10, 0, 360);

    // Move the puck to its starting position before drawing
    movePuckToStart();
    // drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end);
    drawPuck();

    /**
     * Basically, when reseting the board, wait 1 second before giving the puck velocity
     * This will allow the players to continue moving once the puck scores
     * 
     * Give the puck a starting yVelocity of 0. It will change accordingly
     * when it hits a paddle
     */
    setTimeout(() => {
        // If player 1 should start, then give the puck the appropriate velocity
        if (player1Start) {
            puck.xVelocity = -2;
            puck.yVelocity = 0;
        }
        else {
            puck.xVelocity = 2;
            puck.yVelocity = 0;
        }
    }, 1000)

    // Reset our flag
    won = false;

    // Call our gameLoop to start the game
    // gameLoop();

    // If in single player mode, use this game loop function
    if (singlePlayerMode) {
        onePlayerGameLoop();
    }
    else {
        twoPlayerGameLoop();
    }

    return;
}

// function drawPlayer1(x, y, width, height) { // Commented out
function drawPlayer1() {
    ctx.fillStyle = "red";
    // (x, y, w, h)
    // ctx.fillRect(x,y,width,height);
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
}

// function drawPlayer2(x, y, width, height) { // Commented out
function drawPlayer2() {
    ctx.fillStyle = "blue";
    // (x, y, w, h)
    // ctx.fillRect(x,y,width,height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
}

// function drawPuck(x, y, r, start, end) { // Commented Out
function drawPuck() {
    ctx.fillStyle = "black";
    ctx.save();

    ctx.beginPath();
    // (x, y, r, start, end, anitclockwise)
    ctx.arc(puck.x, puck.y, puck.r, puck.start, puck.end, false);
    ctx.fill();

    ctx.restore();
    return;
}

function drawCenterLine() {
    // Update this value to move our rectangle
    // Each time we draw one
    let startingY = 0;

    ctx.fillStyle = "green";

    while (startingY < canvas.height) {
        ctx.fillRect(canvas.width / 2 - 5, startingY, 10, 30);
        startingY += 40;
    }
    return;
}

/**
 * This moves the players to their starting postion
 * Note: It should only be called before a game starts
 */
function movePlayersToStart() {
    // Update Player locations to be in the middle of the board
    player1.y = (canvas.height - player1.height) / 2;
    player2.y = (canvas.height - player2.height) / 2;
}

/**
 * This updates the positon of the puck back to where it started
 * It also sets its x & y velocity to 0
 * The initialize() function will give it velocity
 */
function movePuckToStart() {
    puck = {
        // x: 300,
        x: canvas.width / 2,
        // y: 175,
        y: canvas.height / 2,
        r: 10,
        start: 0,
        end: 360,
    
        // For velocity of the puck
        xVelocity: 0,
        yVelocity: 0
    }
    return
}

/**
 * This function will update the scoreboard to reflect the current score values when it is called
 */
function updateScoreboard() {
    // Update the score of both players
    document.getElementById("p2score").innerHTML = player2.score;
    document.getElementById("p1score").innerHTML = player1.score;
}

function checkAndHandlePlayerCollison() {
    // Player 1

    /**
     * In essence, check if:
     * 1: If the velocity is negative. If not, then we bounced off the paddle, and can forgo checking
     * By doing so, we fix an issue where the paddle can run into the puck in y direction and it stays
     * rather than bouncing
     * 2: The Puck x value (minus radius) is less than the player x value (plus the player width)
     * 3: The Puck y value (+- radius) is between the y & y+height values of the player
     */

    // Check for the x portion & see if it lines up
    if (puck.xVelocity < 0 && puck.x - puck.r < player1.x + player1.width
        // Check if the y portions match up
        && puck.y + puck.r > player1.y && puck.y - puck.r < player1.y + player1.height) {
            // If so, we have a collision, and need to change the velocity

            // Play an audio sound on collision
            const playerCollisionSound = new Audio("./Audio/ruler-smack.wav");
            playerCollisionSound.play();

            // Split the paddle into three sections. This is the height for those three sections
            const player1PaddleSection = player1.height / 3;
            // Check if the puck hits in the middle section. of the paddle
            if (puck.y > player1.y + player1PaddleSection && puck.y < player1.y + 2 * player1PaddleSection) {
                // If so, we can change the velocity to a smaller number
                puck.xVelocity = 2;
                // If the yVelocity is negative, we need to retain it being negative
                if (puck.yVelocity < 0) {
                    puck.yVelocity = -2;
                }
                else {
                    // Otherwise, use a positive yVeloctiy
                    puck.yVelocity = 2;
                }
            }
            // Otherwise, we can simulate it hitting closer the edge by giving it a faster velocity
            else {
                puck.xVelocity = 2.75;
                // If the yVelocity is negative, we need to retain it being negative
                if (puck.yVelocity < 0) {
                    puck.yVelocity = -3;
                }
                else {
                    // Otherwise, use a positive yVeloctiy
                    puck.yVelocity = 3;
                }
            }
    }

    // Player 2

    /**
     * In essence,check if
     * 1: If the velocity is positive. If not, then we bounced off the paddle, and can forgo checking
     * By doing so, we fix an issue where the paddle can run into the puck in y direction and it stays
     * rather than bouncing
     * 2: the puck x value ( plus the radius) is greater than player x value
     * 3: the puck y value (+- radius) is bewteen y & y+height values of the player
     */

    if (puck.xVelocity > 0 && puck.x + puck.r > player2.x
        && puck.y + puck.r > player2.y && puck.y - puck.r < player2.y + player2.height) {

            // Play an audio sound on collision
            const playerCollisionSound = new Audio("./Audio/ruler-smack.wav");
            playerCollisionSound.play();

            // Split the paddle into three sections. This is the height for those three sections
            const player2PaddleSection = player2.height / 3;
            // Check if the puck hits in the middle section. of the paddle
            if (puck.y > player2.y + player2PaddleSection && puck.y < player2.y + 2 * player2PaddleSection) {
                // If so, we can change the velocity to a smaller number
                puck.xVelocity = -2;
                // If the yVelocity is negative, we need to retain it being negative
                if (puck.yVelocity < 0) {
                    puck.yVelocity = -2;
                }
                else {
                    // Otherwise, use a positive yVeloctiy
                    puck.yVelocity = 2;
                }
            }
            // Otherwise, we can simulate it hitting closer the edge by giving it a faster velocity
            else {
                puck.xVelocity = -2.75;
                // If the yVelocity is negative, we need to retain it being negative
                if (puck.yVelocity < 0) {
                    puck.yVelocity = -3;
                }
                else {
                    // Otherwise, use a positive yVeloctiy
                    puck.yVelocity = 3;
                }
            }
        }
}

/**
 * This checks to see if one of the players have won
 * If so, it updates the score & sets the player1Start flag
 */
function checkForWinner() {
    // If it hits the left wall, player 2 wins
    if (puck.x < 0) {
        // player2Win = true;
        player1Start = true; // Set our flag to allow player 1 to start
        won = true;
        player2.score += 1;
        updateScoreboard();
       // document.getElementById("p2score").innerHTML = player2.score;
    }
    // If it hits the right wall, player 1 wins
    if (puck.x > canvas.width) {
        // player1Win = true;
        player1Start = false; // Set our flag to allow player 2 to start
        won = true;
        player1.score += 1;
        updateScoreboard();
        // document.getElementById("p1score").innerHTML = player1.score;
    }
}

function checkIfPuckHitWall() {

    // If we will bounce off either the top or bottom wall,
    // play a sound, and flip the velocity
    if (puck.y - puck.r < 0 || puck.y > canvas.height - puck.r) {
        // Create an audio handle for the wall bounce
        const wallBounce = new Audio("./Audio/energy-bounce.wav");
        wallBounce.play();
        puck.yVelocity *= -1;
    }

    /*
    // If we bounce off the top wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y - puck.r < 0) {
        wallBounce.play();
        puck.yVelocity *= -1;
    }
    // If we bounce off the bottom wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y > canvas.height - puck.r) {
        wallBounce.play();
        puck.yVelocity *= -1;
    }
    */
}

/*
 * This will be the function we call to run our one-player game of pong
 */
function onePlayerGameLoop() {
    // Step 1: Clear Our Canvas & re-draw center line
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawCenterLine();

    // Step 2: Check for pressed keys, and update the player's accordingly

    // Player 1 Controls
    // We will Check if the key is pressed, and that we are not about to go out-of-bounds in each case
    if (keysPressed['w'] === true && player1.y > 0) {
        // Moving Upward
        player1.y -= 2.5;
    }

    // have to account for the player height in this calculation
    if (keysPressed['s'] === true && player1.y < canvas.height - player1.height) {
        // Moving Downward
        player1.y += 2.5;
    }

    // Player Two (Computer) Movements

    /**
     * To simulate a player, determine where this paddle is on the board
     * relative to the postion of the puck, and move accordingly
     */

    // Case 1: Puck is below paddle and we won't hit the bottom wall
    if (puck.y - puck.r > player2.y + player2.height && player2.y < canvas.height - player2.height) {
        player2.y += 2;
    }

    // Case 2: Puck is above paddle and we won't hit the top wall
    else if (puck.y + puck.r < player2.y + player2.height && player2.y > 0) {
        player2.y -= 2;
    }


    // Step 3: Redraw our Player's in the new locations

    // drawPlayer1(player1.x, player1.y, player1.width, player1.height)
    // drawPlayer2(player2.x, player2.y, player2.width, player2.height)
    drawPlayer1();
    drawPlayer2();

    // Step 4: Draw the Puck & update its location

    // Check if we are colliding with the top or botton wall, and adjust accordingly

    checkIfPuckHitWall();

    // Check for collision with players
    checkAndHandlePlayerCollison()

    // Update puck x & y based on its velocity values before drawing
    puck.x += puck.xVelocity;
    puck.y += puck.yVelocity;

    // drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end)
    drawPuck();

    // Step 6: Now that we have finsihed drawing, check for a winner
    checkForWinner();

    // While neither player has won
    // if (!player1Win && !player2Win) {
    if (!won) {
        //Request another animation frame
        window.requestAnimationFrame(onePlayerGameLoop)
    }
    else {
        // Otherwise, we can cancel the animation frame, and display a winner
        // .cancelAnimationFrame(gameLoop)

        // If one of the players has a score equal to 10, declare a winner
        if (player1.score === 10) {
            window.alert("Player 1 Wins!!")
            window.cancelAnimationFrame(onePlayerGameLoop)

            // Return to our game mode menu
            showGameModeMenu();
        }
        else if (player2.score === 10) {
            window.alert("Player 2 Wins!!")
            window.cancelAnimationFrame(onePlayerGameLoop)

            // Return to our game mode menu
            showGameModeMenu();
        }
        // Otherwise, reset the board, and play again
        else {
            initialize();
        }
    }

}

/*
 * This will be the function we call to run our two-player game of pong
 */
function twoPlayerGameLoop() {
    // Step 1: Clear Our Canvas & re-draw center line
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawCenterLine();

    // Step 2: Check for pressed keys, and update the player's accordingly

    // Player 1 Controls
    // We will Check if the key is pressed, and that we are not about to go out-of-bounds in each case
    if (keysPressed['w'] === true && player1.y > 0) {
        // Moving Upward
        player1.y -= 2.5;
    }

    // have to account for the player height in this calculation
    if (keysPressed['s'] === true && player1.y < canvas.height - player1.height) {
        // Moving Downward
        player1.y += 2.5;
    }

    // Player 2 Controls
    if (keysPressed['k'] === true && player2.y > 0) {
        // Moving Upward
        player2.y -= 2.5;
    }

    if (keysPressed['m'] === true && player2.y < canvas.height - player2.height) {
        // Moving Downward
        player2.y += 2.5;
    }

    // Step 3: Redraw our Player's in the new locations

    // drawPlayer1(player1.x, player1.y, player1.width, player1.height)
    // drawPlayer2(player2.x, player2.y, player2.width, player2.height)
    drawPlayer1();
    drawPlayer2();

    // Step 4: Draw the Puck & update its location

    // Check if we are colliding with the top or botton wall, and adjust accordingly

    checkIfPuckHitWall();

    // Check for collision with players
    checkAndHandlePlayerCollison()

    // Update puck x & y based on its velocity values before drawing
    puck.x += puck.xVelocity;
    puck.y += puck.yVelocity;

    // drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end)
    drawPuck();

    // Step 6: Now that we have finsihed drawing, check for a winner
    checkForWinner();

    // While neither player has won
    // if (!player1Win && !player2Win) {
    if (!won) {
        //Request another animation frame
        window.requestAnimationFrame(twoPlayerGameLoop)
    }
    else {
        // Otherwise, we can cancel the animation frame, and display a winner
        // .cancelAnimationFrame(gameLoop)

        // If one of the players has a score equal to 10, declare a winner
        if (player1.score === 10) {
            window.alert("Player 1 Wins!!")
            window.cancelAnimationFrame(twoPlayerGameLoop)

            // Return to our game mode menu
            showGameModeMenu();
        }
        else if (player2.score === 10) {
            window.alert("Player 2 Wins!!")
            window.cancelAnimationFrame(twoPlayerGameLoop)

            // Return to our game mode menu
            showGameModeMenu();
        }
        // Otherwise, reset the board, and play again
        else {
            initialize();
        }
    }

}