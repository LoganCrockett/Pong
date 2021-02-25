
// These will hold the canvas, and it's context
let canvas, ctx;

// This object will hold the keys that the user is pressing. We can check these
// Values in the gameLoop, and update our pieces accordingly
let keysPressed = {};

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
    xVelocity: 0,
    yVelocity: -2,
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
    if (puck.y - puck.r < 0) {
        puck.yVelocity = 2;
    }
    // If we bounce off the bottom wall, change the direction
    // Account for the radius of the puck in this calculation
    if (puck.y > canvas.height - puck.r) {
        puck.yVelocity = -2;
    }

    puck.x += puck.xVelocity;
    puck.y += puck.yVelocity;

    drawPuck(puck.x, puck.y, puck.r, puck.start, puck.end)

    //Request another animation frame
    window.requestAnimationFrame(gameLoop)

}