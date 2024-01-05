const canvas = document.getElementById("gameCanvas"); // Fetch the canvas element from the HTML
const ctx = canvas.getContext("2d"); // Get the 2D rendering context for the canvas

// Define the gun object and its properties
let gun = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,                  // width of the gun     
    height: 80,                // height of the gun      
    dx: 20                     // Change in x-direction for movement
};
let bullets = [];    //  store the bullets

// Define the target object and its properties
let target = {
    x: 100,                   // Initial horizontal position
    y: 50,                    // Vertical position
    radius: 20,               // Radius of the target
    dx: 6                     // Change in x-direction for movement
};

let bulletSound = new Audio('bulletFire.mp3');     // Load the bullet sound effect
let gameOverSound= new Audio('gameOver.wav')       // Load the gameOver sound effect

let score = 0; // Player's current score
let highScore = parseInt(localStorage.getItem("highScore")) || 0;  // Fetch high score from local storage or set it to 0 if not available
let spacePressed = false;    // Track if the spacebar is pressed
let gameState = "notStarted"; // Current game state notStarted
let consecutiveMisses = 0;   // Track consecutive missed shots

let monsterImg = new Image();
monsterImg.src = "monsterimage.png"; // monster image path

let bulletImg = new Image();
bulletImg.src = "bulletimage.png"; // bullet image path

let gunImg = new Image();
gunImg.src = "gunimage.png"; // gun image path

// Event listener for keydown events
document.addEventListener("keydown", function (event) {
    if (gameState === "ongoing") { // Check if game is ongoing
        if (event.keyCode === 37 && gun.x > 0) { // Left arrow key and gun not at the left boundary
            gun.x -= gun.dx; // Move gun left
        } else if (event.keyCode === 39 && gun.x + gun.width < canvas.width) { // Right arrow key and gun not at the right boundary
            gun.x += gun.dx; // Move gun right
        } else if (event.keyCode === 32 && !spacePressed) { // Space key and not already pressed
            // Add a bullet at gun's center position
            bullets.push({ x: gun.x + gun.width / 2, y: gun.y, dy: -8 });
            bulletSound.currentTime = 0; // Reset the bullet sound to start
            bulletSound.play(); // Play the bullet sound
            spacePressed = true; // Mark space as pressed
        }
    }
});

// Event listener for keyup events
document.addEventListener("keyup", function (event) 
{
    if (event.keyCode === 32) 
    { 
        spacePressed = false;
    }
});

function update() {
    if (gameState !== "ongoing") return; // If game isn't ongoing, don't update

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
    ctx.drawImage(gunImg, gun.x, gun.y, gun.width, gun.height);// Draw gun

    // Filter out bullets that went off the screen and decrement score for missed bullets
    bullets = bullets.filter(bullet => {
        if (bullet.y <= 0) { // Bullet went off the top
            consecutiveMisses++; // Increment missed shots count
            if (consecutiveMisses === 3) { // 3 consecutive misses
                endGame(); // End the game
                return false; 
            }
            score = Math.max(0, score - 2); // Decrease score but keep it non-negative
            return false; // Remove bullet from array
        }
        return true; // Keep bullet in array
    });

    // Update bullet positions and detect hits on the target
    bullets.forEach(bullet => {
        bullet.y += bullet.dy; // Move bullet upwards
        ctx.drawImage(bulletImg, bullet.x, bullet.y, 6, 20); // Assuming bullet image dimensions are 5x10 // Draw bullet

        // Check bullet collision with target
        if (bullet.y <= target.y + target.radius && bullet.x >= target.x - target.radius && bullet.x <= target.x + target.radius) {
            bullets = bullets.filter(b => b !== bullet); // Remove the bullet that hit
            score += 5; // Increase score
            consecutiveMisses = 0; // Reset missed shots count
            if (score > highScore) { // New high score
                highScore = score;
                localStorage.setItem("highScore", highScore.toString()); // Save new high score
            }
            resetTarget(); // Relocate target
        }
    });
   



    if (score > 50 && target.dx === 6) {
        target.dx *= 2; // Double the target's speed
    }

    // Update target position and change direction if hit wall
    target.x += target.dx;

  
    
    
    
    if (target.x + target.radius > canvas.width || target.x - target.radius < 0) {
        target.dx *= -1;// Reverse direction
    }
 

    // Draw target
    ctx.drawImage(monsterImg, target.x - target.radius, target.y - target.radius, target.radius * 2, target.radius * 2);

    // Update score displays
    document.getElementById("currentScore").innerText = "Score: " + score;
    document.getElementById("highestScore").innerText = "High Score: " + highScore;

    requestAnimationFrame(update); // Request the next animation frame
}

// Randomly position the target within canvas boundaries
function resetTarget() {
    target.x = Math.random() * (canvas.width - 2 * target.radius) + target.radius;
}

// Function to start the game
function startGame() {
    canvas.style.backgroundColor = ""; // Reset canvas color

    if (gameState === "notStarted" || gameState === "ended") {
        gameState = "ongoing"; // Mark game as ongoing
        score = 0;
        consecutiveMisses = 0;
        update(); // Start game loop
    }
}
document.getElementById("startGameBtn").addEventListener("click", startGame); // Add event listener to start button

// Event listener to start the game with Enter key
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        startGame();
    }
});

// Function to end the game
function endGame() {
    gameState = "ended"; // Mark game as ended
    target.dx = 6; // Reset target's speed to initial value
    gameOverSound.currentTime = 0; // Reset the gameover sound to start
    gameOverSound.play(); // Play the gameover sound
    canvas.style.backgroundColor = "red"; // Indicate game over with red background
}

