'use strict'

$(document).ready(function() {
    const GAME_WIDTH = 50;
    const GAME_HEIGHT = 35;
    const PIXEL_SIZE = 20;
    const PIXEL_BORDER = 1;
    const SNAKE_INITIAL_SEGMENTS = 3;
    const APPLE_COLOUR = "#bd0000";
    const BASE_COLOUR = "#bfbfbf";
    const SNAKE_COLOUR = "#008223";

    const Direction = {
        LEFT: "LEFT",
        RIGHT: "RIGHT",
        UP: "UP",
        DOWN: "DOWN",
    }
    
    let snakeSegments = [];
    let apples = [];

    let nextDir = '';
    let curDir = '';
    let curDelay = 300; // Millis
    let lastMoveTime = 0;

    const gameCanvas = $('#game-canvas')[0];
    const canvasContext = gameCanvas.getContext('2d');
    document.onkeydown = keyPressed;

    resetGame();
    runGameLoop();
    
    function gameLoop() {
        if (lastMoveTime + curDelay <= performance.now()) {
            lastMoveTime = performance.now();
            curDir = nextDir;
            moveSnake();
        }

        window.requestAnimationFrame(gameLoop);
    }

    function moveSnake() {
        // Move tail
        setPixel(snakeSegments[snakeSegments.length - 1], BASE_COLOUR);
        for (let i = snakeSegments.length - 1; i > 0; i--) {
            snakeSegments[i].x = snakeSegments[i - 1].x;
            snakeSegments[i].y = snakeSegments[i - 1].y;
            setPixel(snakeSegments[i], SNAKE_COLOUR);
        }

        // Move Head
        switch (curDir) {
            case Direction.RIGHT:
                snakeSegments[0].x++;
                break;
            case Direction.LEFT:
                snakeSegments[0].x--;
                break;
            case Direction.DOWN:
                snakeSegments[0].y++;
                break;
            case Direction.UP:
                snakeSegments[0].y--;
                break;
        }
        setPixel(snakeSegments[0], SNAKE_COLOUR);
    }

    // I'll be honest I don't know how efficient this is and I cbf to work out if all this is worth it
    function spawnApple() {
        let spawnableSpaces = Array.from({length: GAME_WIDTH * GAME_HEIGHT}, (v, i) => { return { x: Math.floor(i / GAME_HEIGHT), y: i % GAME_HEIGHT, canSpawn: true } });

        // Make pixels containing a snake not spawnable
        for (let i = 0; i < snakeSegments.length; i++) {
            // Fancy index manipulation to access a 1d array like a 2d array
            spawnableSpaces[snakeSegments[i].x * GAME_HEIGHT + snakeSegments[i].y].canSpawn = false;
        }

        // Make pixels containing an apple not spawnable
        for (let i = 0; i < apples.length; i++) {
            // Fancy index manipulation to access a 1d array like a 2d array
            spawnableSpaces[apples[i].x * GAME_HEIGHT + apples[i].y].canSpawn = false;
        }

        spawnableSpaces = spawnableSpaces.filter(({canSpawn}) => canSpawn)

        if (spawnableSpaces.length === 0) return false;

        const randIndex = Math.floor(Math.random() * spawnableSpaces.length);
        // Convert 1d array index to a 2d coord
        const appleLocation = {
            x: spawnableSpaces[randIndex].x,
            y: spawnableSpaces[randIndex].y
        }

        apples.push(appleLocation)
        setPixel(appleLocation, APPLE_COLOUR);

        return true;
    }

    function keyPressed(e) {
        let pressedDir = ''
        switch (e.key) {
            case "ArrowRight":
            case "d":
                pressedDir = Direction.RIGHT;
                break;
            case "ArrowLeft":
            case "a":
                pressedDir = Direction.LEFT;
                break;
            case "ArrowDown":
            case "s":
                pressedDir = Direction.DOWN;
                break;
            case "ArrowUp":
            case "w":
                pressedDir = Direction.UP;
                break;
        }

        if (pressedDir === '') return;

        // Ensure the direction change is valid
        switch (curDir) {
            case Direction.RIGHT:
                if (pressedDir === Direction.LEFT) return;
                break;
            case Direction.LEFT:
                if (pressedDir === Direction.RIGHT) return;
                break;
            case Direction.DOWN:
                if (pressedDir === Direction.UP) return;
                break;
            case Direction.UP:
                if (pressedDir === Direction.DOWN) return;
                break;
        }

        nextDir = pressedDir;
    }

    function setPixel({x, y}, color) {
        canvasContext.fillStyle = color;
        canvasContext.fillRect(
            x * PIXEL_SIZE + PIXEL_BORDER,
            y * PIXEL_SIZE + PIXEL_BORDER,
            PIXEL_SIZE - PIXEL_BORDER * 2, 
            PIXEL_SIZE - PIXEL_BORDER * 2
        );
    }

    function resetGame() {
        // Setup canvas
        gameCanvas.width = GAME_WIDTH * PIXEL_SIZE;
        gameCanvas.height = GAME_HEIGHT * PIXEL_SIZE;        
        canvasContext.fillStyle = BASE_COLOUR;
        canvasContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Setup snake
        const snakeStartPos = { x: Math.floor(GAME_WIDTH / 2), y: Math.floor(GAME_HEIGHT / 2) };
        setPixel(snakeStartPos, SNAKE_COLOUR);
        snakeSegments = []
        for (let i = 0; i < SNAKE_INITIAL_SEGMENTS; i++) {
            snakeSegments.push({ x: snakeStartPos.x, y: snakeStartPos.y });
        }

        // Setup apples
        apples = [];
        spawnApple();

        // Setup game values
        curDir = Direction.RIGHT;
        nextDir = Direction.RIGHT;

        lastMoveTime = performance.now();
        
    }

    function runGameLoop() {
        window.requestAnimationFrame(gameLoop);
    }
});



