
// These will hold the canvas, and it's context
let canvas, ctx;

// These three variables will keep track of each objects postion
var player1 = {
    x: 0,
    y: 0,
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
    clockwise: false,
}

function init() {
    // Grab the context
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");

    // Start by drawing all of the players & the ball
    ctx.save();
    initialize();
    ctx.restore();

    return;
}

/*
 * This will intialize the game board
 */
function initialize() {
    // Start by drawing player one
    ctx.fillStyle = "red";
    // (x, y, w, h)
    ctx.fillRect(10,10,5,60);

    // Now Draw player two
    ctx.fillStyle = "blue";
    // (x, y, w, h)
    ctx.fillRect(580,10,5,60);

    // Draw the Puck
    ctx.fillStyle = "black";

    ctx.beginPath();
    // (x, y, r, start, end, anitclockwise)
    ctx.arc(300, 175, 10, 0, 360, false);
    ctx.fill();

    return;
}
