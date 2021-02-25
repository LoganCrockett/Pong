
// These will hold the canvas, and it's context
let canvas, ctx;

// This object will hold the keys that the user is pressing. We can check these
// Values in the gameLoop, and update our pieces accordingly
let keysPressed = {};

// Flags to end the game
let player1Win = false;
let player2Win = false;

// These three variables will keep track of each objects postion
var player1 = {
    x: 10,
    y: 10,
    width: 5,
    height: 60,
};

var player2 = {
    x: 580,
    y: 10,
    width: 5,
    height: 60,
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
 * This will intialize the game board
 */
function initialize() {
    // Start by drawing player one
    drawPlayer1(10, 10, 5, 60);

    // Now Draw player two
    drawPlayer2(580, 10, 5, 60);

    // Draw the Puck
    drawPuck(300, 175, 10, 0, 360);

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

function checkAndHandlePlayerCollison() {
    // Player 1

    /**
     * In essence, check if:
     * 1: The Puck x value (minus radius) is less than the player x value (plus the player width)
     * 2: The Puck y value is between the y & y+height values of the player
     */

    // Check for the x portion & see if it lines up
    if (puck.x - puck.r < player1.x + player1.width
        // Check if the y portions match up
        && puck.y > player1.y && puck.y < player1.y + player1.height) {
            // If so, we have a collision, and need to change the velocity
        puck.xVelocity *= -1; // Should Flip the sign of the velocity
        puck.yVelocity *= -1;
    }

    // Player 2

    /**
     * In essence,check if
     * 1: the puck x value ( plus the radius) is greater than player x value
     * 2: the puck y value is bewteen y & y+height values of the player
     */

    if (puck.x + puck.r > player2.x
        && puck.y > player2.y && puck.y < player2.y + player2.height) {
            puck.xVelocity *= -1; // Should flip the sign of the velocity
            puck.yVelocity *= -1;
        }
}

function checkForWinner() {
    // If it hits the left wall, player 2 wins
    if (puck.x < 0) {
        player2Win = true;
    }
    // If it hits the right wall, player 1 wins
    if (puck.x > canvas.width) {
        player1Win = true;
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
        player1.y -= 2;
    }

    // have to account for the player height in this calculation
    if (keysPressed['s'] === true && player1.y < canvas.height - player1.height) {
        // Moving Downward
        player1.y += 2;
    }

    // Player 2 Controls
    if (keysPressed['k'] === true && player2.y > 0) {
        // Moving Upward
        player2.y -= 2;
    }

    if (keysPressed['m'] === true && player2.y < canvas.height - player2.height) {
        // Moving Downward
        player2.y += 2;
    }

    // Step 3: Redraw our Player's in the new locations
    drawPlayer1(player1.x, player1.y, player1.width, player1.height)
    drawPlayer2(player2.x, player2.y, player2.width, player2.height)

    // Step 4: Draw the Puck & update its location

    // Update puck x & y based on its velocity values before drawing

    // If we bounce off the top wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y - puck.r < 0) {
        puck.yVelocity = 2;
    }
    // If we bounce off the bottom wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y > canvas.height - puck.r) {
        puck.yVelocity = -2;
    }

    // Check for collision with players
    checkAndHandlePlayerCollison()

    puck.x += puck.xVelocity;
    puck.y += puck.yVelocity;

    drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end)

    // Now that we have finsihed drawing, check for a winner
    checkForWinner();

    // While neither player has won
    if (!player1Win && !player2Win) {
        //Request another animation frame
        window.requestAnimationFrame(gameLoop)
    }
    else {
        // Otherwise, we can cancel the animation frame, and display a winner
        window.cancelAnimationFrame(gameLoop)

        if (player1Win) {
            window.alert("Player 1 Wins")
        }
        else {
            window.alert("Player 2 Wins")
        }
    }

}