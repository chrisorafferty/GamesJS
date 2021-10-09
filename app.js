'use strict'

$(document).ready(function() {
    const GAME_WIDTH = 20;
    const GAME_HEIGHT = 15;
    const PIXEL_SIZE = 20;
    const PIXEL_BORDER = 1;
    const SNAKE_INITIAL_SEGMENTS = 3;
    const APPLE_COLOUR = "#bd0000";
    const BASE_COLOUR = "#bfbfbf";
    const SNAKE_COLOUR = "#008223";
    const SNAKE_DEATH_COLOUR = "#1c1c1c";

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
    let curDelay = 100; // Millis
    let lastMoveTime = 0;

    let gameOver = false;

    const gameCanvas = $('#game-canvas')[0];
    const canvasContext = gameCanvas.getContext('2d');
    document.onkeydown = keyPressed;

    resetGame();
    runGameLoop();
    
    function gameLoop() {
        if (!gameOver) {
            if (lastMoveTime + curDelay <= performance.now()) {
                lastMoveTime = performance.now();
                curDir = nextDir;
                
                const nextSnakePos = getNextSnakePos();
                
                if (checkForCollisions(nextSnakePos)) {
                    setGameOver();
                } else {
                    moveSnake(nextSnakePos);
                    checkForApples();
                }
            }
        }        

        window.requestAnimationFrame(gameLoop);
    }

    function getNextSnakePos() {
        let nextPos = { x: snakeSegments[0].x, y: snakeSegments[0].y };

        // Move Head
        switch (curDir) {
            case Direction.RIGHT:
                nextPos.x++;
                break;
            case Direction.LEFT:
                nextPos.x--;
                break;
            case Direction.DOWN:
                nextPos.y++;
                break;
            case Direction.UP:
                nextPos.y--;
                break;
        }

        return nextPos;
    }

    function moveSnake(nextSnakePos) {
        // Move tail
        setPixel(snakeSegments[snakeSegments.length - 1], BASE_COLOUR);
        for (let i = snakeSegments.length - 1; i > 0; i--) {
            snakeSegments[i].x = snakeSegments[i - 1].x;
            snakeSegments[i].y = snakeSegments[i - 1].y;
            setPixel(snakeSegments[i], SNAKE_COLOUR);
        }

        // Move Head
        snakeSegments[0].x = nextSnakePos.x;
        snakeSegments[0].y = nextSnakePos.y;

        setPixel(snakeSegments[0], SNAKE_COLOUR);
    }

    function checkForApples() {
        const index = apples.findIndex(({x, y}) => snakeSegments[0].x === x && snakeSegments[0].y === y)
        if (index >= 0) {
            // Note we don't have to draw a blank pixel as the snake head will already done this when moving
            apples.splice(index, 1);
            addSnakeSegment();
            spawnApple();
        }
    }

    function checkForCollisions(nextSnakePos) {
        // Check if the snake has gone off the left/right edge
        if (nextSnakePos.x < 0 || nextSnakePos.x >= GAME_WIDTH) {
            return true;
        }
        
        // Check if the snake has gone off the top/bottom edge
        if (nextSnakePos.y < 0 || nextSnakePos.y >= GAME_HEIGHT) {
            return true;
        }  

        // Check if the head has collided with the body
        let index = -1
        for(let i = 1; i < snakeSegments.length; i++) {
            if (snakeSegments[i].x === nextSnakePos.x && snakeSegments[i].y === nextSnakePos.y) {
                return true;
            }
        }

        return index >= 0;
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

    function addSnakeSegment(pos) {
        const newPos = pos ?? snakeSegments[snakeSegments.length - 1];
        snakeSegments.push({ x: newPos.x, y: newPos.y });
    }

    function setGameOver() {
        gameOver = true;
        for(let i = 0; i < snakeSegments.length; i++) {
            setPixel(snakeSegments[i], SNAKE_DEATH_COLOUR);
        }
    }

    function keyPressed(e) {
        if (e.key === ' ') {
            resetGame();
            return;
        }       
        
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
            addSnakeSegment(snakeStartPos);
        }

        // Setup apples
        apples = [];
        spawnApple();

        // Setup game values
        curDir = Direction.RIGHT;
        nextDir = Direction.RIGHT;

        lastMoveTime = performance.now();

        gameOver = false;        
    }

    function runGameLoop() {
        window.requestAnimationFrame(gameLoop);
    }
});



