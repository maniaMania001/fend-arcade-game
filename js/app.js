
   // ********************** Variables *********************************
   

// We make the fpsCounter variable to control the execution of the statemes 
// in Token.update() method to be just once every second
var fpsCounter = 0;



   // ********************** Functions  ********************************
   
var randomArray = function(array) {
    var arraySelection =  array[Math.floor(Math.random() * array.length)];
    
    return arraySelection;
};

// Function that returns a random number between min (inclusive) and max (exclusive)
var randomNumber = function(max, min) {
    return Math.random() * (max - min) + min;
};

// Function that listens for key presses and sends the keys to the
// Player.handleInput() method and Timer.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    // Keys used when the game ends to restart or not
    var restartKeys = {
        89: 'yes',
        78: 'no'
    };
    player.handleInput(allowedKeys[e.keyCode]);
    timer.handleInput(restartKeys[e.keyCode]);
});



   // ********************** Enemy Class *******************************
   
// Enemy class
var Enemy = function(x, y) {
    this.x = x;     // x position
    this.y = y;     // y position
    this.acceleration = randomNumber(4, 4);     // acceleration of the enemies
    this.sprite = 'images/enemy-bug.png';       // the sprite of the enemies
};

// update method that updates the enemy's position, required method for game
Enemy.prototype.update = function(dt) {
    // The x axis (movement) is itself plus 100 multiplied by dt and by acceleration 
    this.x  = this.x + 100 * dt * this.acceleration;
    // If the x axis goes outside the canvas, the position
    // and acceleration will reset
    if (this.x > 550) {
        this.x = -100;
        this.acceleration = randomNumber(5, 1);
    }
};

// render method that draws the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


//////***player class***\\\\\\

// Player class
var Player = function() {
    this.x = 200;       // x position
    this.y = 380;       // y position
    this.lives = 3;     // player's lives
    this.score = 0;     // player's score
    this.sprite = 'images/char-boy.png';        // player's sprite
    this.spriteLives = 'images/Heart.png';      // player's lives sprite
};

// changeCharacter method that will change the sprite image
Player.prototype.changeCharacter = function(character) {
    this.sprite = 'images/' + character + '.png';
};

// update method that updates player's position and checks collisions with
// enemies and tokens
Player.prototype.update = function() {
    // Collision with enemies
    for (var enemy in allEnemies) {
        // We check if the player is in the same y position as the enemy and we also check if the player collides with 
        // the enemy based on x axis plus (or minus) a fixed value of 55
        // Note: the 55 value is selected so that the collision seems real in the moment the enemy touches the player
        if ((this.y == allEnemies[enemy].y) && (allEnemies[enemy].x <= this.x + 55) && (allEnemies[enemy].x >= this.x - 55)) {
            this.x = 200;           // resets player's position on x
            this.y = 380;           // resets player's position on y
            this.lives -= 1;        // the number of lives is decremented by 1
            this.score -= 20;       // the score is decremented by 20
        }
    }
    // Colission with token
    // We use same procedure, we check y position and the x position with a fixed value of 55 (plus or minus)
    if ((this.y == token.y) && (token.x <= this.x + 55) && (token.x >= this.x - 55)) {
         // If there's a collision with token, the token will hide
        token.x = -100;
        token.y = -100;
         // If token is Key
        if (token.sprite.indexOf('Key') > -1) {
            this.score += 50;       // the score is incremented by 50
        } else if (token.sprite.indexOf('Gem') > -1) {      // If the tokens are Gems
            this.score += 25;       // the score is incremented by 25
        } else {      // If the token is Star
            this.score += 100;       // the score is incremented by 100
        }
    }
    // If lives are 0, the game will end
    if (this.lives === 0) {
        timer.gameState = false;        // game will end
    }
};

// render method that draws the player on the screen as well as its score and lives
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    for (var i = 0; i < this.lives; i++) {
        ctx.drawImage(Resources.get(this.spriteLives), 440 - i*55, 30);     // draws the number of lives
    }
    ctx.font = 'bold 20px Calibri';
    ctx.fillStyle = 'yellow';
    ctx.fillText('SCORE: ' + this.score, 10, 95); // draws the score
};

// handleInput method that makes the player move depending on the key strokes
Player.prototype.handleInput = function(key) {
    // We check is the game is still active so the player can move
    if (timer.gameState) {
        // The player moves up
        if ((key == 'up') && (this.y - 80 != -20)) {
            this.y = this.y - 80;
        } else if ((key == 'up') && (this.y - 80 == -20)) {     // If player reaches the sea, the score will increment 200 and reset position
            this.x = 200;           // reset x
            this.y = 380;           // reset y
            this.score += 200;      // score incremented by 200
        } else if ((key == 'down') && (this.y + 80 <= 380)) {       // The player moves down
            this.y = this.y + 80;
        } else if ((key == 'left') && (this.x > 0)) {       // The player moves to the left
            this.x = this.x - 100;
        } else if ((key == 'right') && (this.x + 100 <= 400)) {     // The player moves to the right
            this.x = this.x + 100;
        }
    }
};



   // ********************** Token Class *******************************
  

// Token class
var Token = function() {
    this.x = -100;                  // x position (hidden)
    this.y = -100;                  // y position (hidden)
    this.sprite = this.spawn();     // token's sprite using spawn method (to select a random token)
};

// render method that draws the token on the screen
Token.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// update method that updates the token, appearance and position depending on the time
Token.prototype.update = function() {
    fpsCounter += 1;    // incrementing the variable everytime the update method executes
    // Here we check if a second passed in order to execute the statements below
    if ((fpsCounter % 60 === 0) && (timer.timeLeft % 2 === 0)) {
        var appearArray = randomArray(['yes', 'no']);       // array to see if the token will appear or not 
        if (appearArray === 'yes') {
            // token appears at random location
            this.x = randomNumber(0, 405);
            this.y = randomArray([140, 220, 300]);
            this.sprite = this.spawn();
        } else {
            // token hides
            this.x = -100;
            this.y = -100;
        }    
    }
};

// spawn method that returns a random sprite token from the array of tokens
Token.prototype.spawn = function() {
    var tokens = [
        'images/Gem%20Blue.png',
        'images/Gem%20Orange.png',
        'images/Gem%20Green.png',
        'images/Key.png',
        'images/Star.png'
    ];

    return randomArray(tokens);
};


// Timer Class 

// Timer class
var Timer = function(timer) {
    this.time = Date.now();         // time when the game begins
    this.gameTime = timer;          // the game time
    this.timeLeft = timer;          // the time that's left
    this.gameState = true;          // if game is over or not
};

// update method that checks the time of the game
Timer.prototype.update = function () {
    var timeNow = Math.floor((Date.now() - this.time) / 1000.0); // gets the present time
    // We decrease the game time until it gets to 0
    if (this.timeLeft > 0) {
        this.timeLeft = this.gameTime - timeNow;        // the time that's left
    } else {      // If the time left is 0, the game will finish
        this.timeLeft = 0;          // time left is 0
        this.gameState = false;     // the game ends
    }
};

// handleInput method for game after it finishes to restart it if the player wants to,
Timer.prototype.handleInput = function (key) {
    // Checks if the game has ended
    if (!this.gameState) {
        // If player hits yes, the game will restart
        if (key === 'yes') {
            // reset
            ctx.clearRect(0, 0, 505, 606);   // canvas resets
            token = new Token();             // token resets
            player = new Player();           // player resets
            timer = new Timer(30);           // game timer resets
        // If player hits no, he or she will be redirected to Udacity Website
        } else if (key === 'no') {
            alert('Thanks for playing! )');
           
        }
    }
};

// render method that draws the game's time on the screen
// and also draws the game over screen when game is over
Timer.prototype.render = function() {
    ctx.font = 'bold 50px Calibri';         // font type
    ctx.fillStyle = 'white';                // font color
    ctx.fillText(this.timeLeft, 228, 95);     // sets the game's time at the specified location
    
    // If game is over, it'll let the player choose to restart it or leave it
    if (!this.gameState) {
        // White background
        ctx.fillStyle = 'orange';
        ctx.fillRect(0, 0, 505, 707);
        // Blue border
        ctx.lineWidth ='15';
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(0, 0, 505, 606);
        // Text
        ctx.font = 'bold 50px Calibri';
        ctx.fillStyle = 'black';
        ctx.fillText('GAME OVER', 120, 255);
        ctx.fillText('Try again?', 150, 315);
        ctx.fillText('Hit -> (Yes) or (No)', 60, 405);
    }
};

 // Initialization & Instantiation 
 

var allEnemies = [];        // enemies array
var enemyLimits = 3;        // amount of enemies
var y = 0;                   // control variable to set all enemies in the 3 lanes

// Here we do a for loop to add and enemy inside the allEnemies array
for (var index = 0; index < enemyLimits; index++) {
    if (y > 220) {
        y = 0;
    }
    var enemy = new Enemy(-100, 60 + y);        // here we instantiate the enemy object at the given location
    y += 80;                                    // we increment the control variable to move to the other lane
    allEnemies.push(enemy);                     // we add the enemy to allEnemies array
}

// Instantiating token, player and timer objects
var token = new Token();
var player = new Player();
var timer = new Timer(30);