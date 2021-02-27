
// These will hold the canvas, and it's context
let canvas, ctx;

// This object will hold the keys that the user is pressing. We can check these
// Values in the gameLoop, and update our pieces accordingly
let keysPressed = {};

// Flags to end the game
// let player1Win = false;
// let player2Win = false;
let won = false;

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
    ctx.save();
    initialize();
    ctx.restore();

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

    return;
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
    drawPlayer1(player1.x, player1.y, player1.width, player1.height);

    // Now Draw player two
    // drawPlayer2(580, 10, 5, 60);
    drawPlayer2(player2.x, player2.y, player2.width, player2.height);

    // Draw the Puck
    // drawPuck(300, 175, 10, 0, 360);

    // Move the puck to its starting position before drawing
    movePuckToStart();
    drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end);

    /**
     * Basically, when reseting the board, wait 1 second before giving the puck velocity
     * This will allow the players to continue moving once the puck scores
     */
    setTimeout(() => {
        puck.xVelocity = 2;
        puck.yVelocity = 1.5;
    }, 1000)

    // Reset our flag
    won = false;

    // Call our gameLoop to start the game
    gameLoop();

    return;
}

function drawPlayer1(x, y, width, height) {
    ctx.fillStyle = "red";
    // (x, y, w, h)
    ctx.fillRect(x,y,width,height);
}

function drawPlayer2(x, y, width, height) {
    ctx.fillStyle = "blue";
    // (x, y, w, h)
    ctx.fillRect(x,y,width,height);
}

function drawPuck(x, y, r, start, end) {
    ctx.fillStyle = "black";
    ctx.save();

    ctx.beginPath();
    // (x, y, r, start, end, anitclockwise)
    ctx.arc(x, y, r, start, end, false);
    ctx.fill();

    ctx.restore();
    return;
}

/**
 * This updates the positon of the puck back to where it started
 * It also sets its x & y velocity to 0
 * The initialize() function will give it velocity
 */
function movePuckToStart() {
    puck = {
        x: 300,
        y: 175,
        r: 10,
        start: 0,
        end: 360,
    
        // For velocity of the puck
        xVelocity: 0,
        yVelocity: 0
    }
    return
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

function checkForWinner() {
    // If it hits the left wall, player 2 wins
    if (puck.x < 0) {
        // player2Win = true;
        won = true;
        player2.score += 1;
        document.getElementById("p2score").innerHTML = player2.score;
    }
    // If it hits the right wall, player 1 wins
    if (puck.x > canvas.width) {
        // player1Win = true;
        won = true;
        player1.score += 1;
        document.getElementById("p1score").innerHTML = player1.score;
    }
}

/*
 * This will be the function we call to run our game of pong
 */
function gameLoop() {
    // Step 1: Clear Our Canvas
    ctx.clearRect(0,0,canvas.width, canvas.height);

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

    drawPlayer1(player1.x, player1.y, player1.width, player1.height)
    drawPlayer2(player2.x, player2.y, player2.width, player2.height)

    // Step 4: Draw the Puck & update its location

    // Check if we are colliding with the top or botton wall, and adjust accordingly

    // If we bounce off the top wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y - puck.r < 0) {
        puck.yVelocity *= -1;
    }
    // If we bounce off the bottom wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y > canvas.height - puck.r) {
        puck.yVelocity *= -1;
    }

    // Check for collision with players
    checkAndHandlePlayerCollison()

    // Update puck x & y based on its velocity values before drawing
    puck.x += puck.xVelocity;
    puck.y += puck.yVelocity;

    drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end)

    // Now that we have finsihed drawing, check for a winner
    checkForWinner();

    // While neither player has won
    // if (!player1Win && !player2Win) {
    if (!won) {
        //Request another animation frame
        window.requestAnimationFrame(gameLoop)
    }
    else {
        // Otherwise, we can cancel the animation frame, and display a winner
        // .cancelAnimationFrame(gameLoop)

        // If one of the players has a score equal to 10, declare a winner
        if (player1.score === 10) {
            window.alert("Player 1 Wins!!")
            window.cancelAnimationFrame(gameLoop)
        }
        else if (player2.score === 10) {
            window.alert("Player 2 Wins!!")
            window.cancelAnimationFrame(gameLoop)
        }
        // Otherwise, reset the board, and play again
        else {
            initialize();
        }
    }

}