class Player {
    constructor() {
        this.width = 50;
        this.boardWidth = document.querySelector("#board").clientWidth;
        this.positionX = this.boardWidth / 2 - this.width / 2;
        this.positionY = 0;
        this.height = 120;
        this.domElement = null;
        this.speed = 0;
        this.baseSpeed = 10;
        this.createDomElement();
        this.stackedBalls = [];
        this.antigravity = false;
        this.movementDirection = null;
        this.effect = null;
    }
    // Creates the main player dom element and adds it to the board
    createDomElement() {
        this.domElement = document.createElement('div');
        this.domElement.id = 'player';
        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.left = this.positionX + "px";
        this.domElement.style.bottom = this.positionY + "px";
        const parentElm = document.getElementById('board');
        parentElm.appendChild(this.domElement);
    }
    // Moves the player to the left side and decreases player speed (negative speed)
    moveLeft() {
        if (this.positionX > 0) {
            this.movementDirection = 'left';
            this.positionX = this.positionX - this.baseSpeed;
            this.domElement.style.left = this.positionX + 'px';
            this.speed--;
        }
    }
    // Moves the player to the right side and increases player speed
    moveRight() {
        if (this.positionX < this.boardWidth - this.width) {
            this.movementDirection = 'right';
            this.positionX = this.positionX + this.baseSpeed;
            this.domElement.style.left = this.positionX + 'px';
            this.speed++;
        }
    }
    //stores collided obstacle (ice cream ball) in an array
    stackItem(obstacleInstance) {
        this.stackedBalls.push(obstacleInstance);
        obstacleInstance.domElement.classList.add('stacked');
        //defines the new X and Y of the obstacle
        obstacleInstance.positionX = (this.width / 2) - (obstacleInstance.width / 2);
        obstacleInstance.domElement.style.left = obstacleInstance.positionX + 'px';
        obstacleInstance.positionY = (this.height - obstacleInstance.height);
        obstacleInstance.domElement.style.bottom = obstacleInstance.positionY + 'px';
        //adds obstacle to the DOM 
        this.domElement.appendChild(obstacleInstance.domElement);
        //adjusts the player's height
        this.height += obstacleInstance.height - 20;
        this.domElement.style.height = this.height + 'px';
        //decreases / slows the player's speed due to weight gained by stacking the object (floor speed = 2)
        if (this.baseSpeed > 2) {
            this.baseSpeed -= 0.5;
        };
        //stops obstacle down movement
        clearInterval(obstacleInstance.movement);
        //deletes the first stocked item, so the icecream does not get bigger and stays in screen
        //defines desired max number of stock item based on screen height %
        let screenMaxItems = Math.floor((document.querySelector("#board").clientHeight / obstacleInstance.height) * 0.8)
        if (this.stackedBalls.length > screenMaxItems) {
            //adjusts players height
            this.height -= 30;
            this.domElement.style.height = this.height + "px"
            //removes first obstacle
            this.stackedBalls[0].domElement.remove();
            this.stackedBalls.shift();
            //reassign Y for every stacked item to move one place down
            this.stackedBalls.forEach((element) => {
                element.positionY -= 30;
                element.domElement.style.bottom = element.positionY + "px";
            })
            //adds a visual effect on the player to indicate that the player can stack infinitely
            //Note: I added some sparkles because I have no time, but ideally it should be replaced with a blackhole icecream or something that fits the story of the game better
            this.addPlayerSpecialEffect();
        }
    }
    //adds some visual effect on the player to indicate that the max number of stacked items has been reached and it can stack forever
    addPlayerSpecialEffect() {
        if (this.effect === null) {
            //Creates layer to display special effects on player 
            this.effect = document.createElement('div');
            this.effect.id = "effect";
            this.domElement.appendChild(this.effect);
        }
        //Note: if you want to add more styles later, you can add effect as parameter and switch different background based on effect 
        this.effect.style.backgroundImage = `url(../img/sparkle.gif)`;
    }
}
class Obstacle {
    constructor(gravity) {
        this.height = 50;
        this.width = 50;
        //SAN301
        this.positionX = Math.random() * ((500 - this.width) - 0) + 0;
        this.positionY = document.querySelector("#board").clientHeight;
        this.domElement = null;
        this.speed = 1;
        this.choicesArray = ["vanilla", "chocolate", "strawberry", "cherry", "antigravity", "slowTime"];
        this.flavor = "";
        this.hit = false;
        this.gravity = gravity;
        this.status = "normal";
        this.createDomElement();
    }
    //moves the object down by decreasing Y based on its own gravity
    moveDown() {
        this.positionY -= this.gravity;
        this.domElement.style.bottom = this.positionY + "px";
    }
    //creates an obstacle 
    createDomElement() {
        this.domElement = document.createElement('div');
        this.domElement.className = 'obstacle';
        //randomly defined element to create and stores flavor information
        let randBetween = Math.floor(Math.random() * (this.choicesArray.length - 0) + 0);
        this.flavor = this.choicesArray[randBetween];
        this.domElement.classList.add(this.flavor);
        //adds the dom element based on obstacle properties
        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.left = this.positionX + "px";
        this.domElement.style.bottom = this.positionY + "px";
        const parentElm = document.getElementById('board');
        parentElm.appendChild(this.domElement);
        //moves the object down based on game gravity
        this.movement = setInterval(() => {
            this.moveDown();
        }, 1000 / 60); //here it moves at 60FPS but can change it
    }
}
class Game {
    constructor() {
        this.player = null;
        this.obstaclesArr = [];
        this.expectedCombo = { chocolate: 0, vanilla: 0, strawberry: 0 };
        this.level = 1;
        this.pickedArray = [];
        this.choiceDomElement = null;
        this.levelDomElement = null;
        this.gravity = 2;
        this.attachEventListeners();
        this.score = 0;
        this.scoreDomElement = null;
        this.createObjInterval = null;
        this.slowedTime = false;
    }
    start() {
        this.player = new Player;
        //defines a random combo of ice cream to achieve 
        this.defineRandomCombo();
        this.updateComboDisplay();

        //creates and updates current level DOM element
        this.displayLevel();

        //creates obstacles every second
        this.createObjInterval = setInterval(() => {
            let newObstacle = new Obstacle(this.gravity);
            this.obstaclesArr.push(newObstacle);
        }, 1000);

        //invokes a function that will adapt in real time the placement of each stacked icecream ball based on player's movement direction and speed
        this.calculatesPlayerPhysics();

        // starts interval of actions to be performed continuously for each obstacle
        setInterval(() => {
            this.obstaclesArr.forEach((obstacleInstance) => {
                //remove if outside
                this.removeObstacleIfOutside(obstacleInstance);

                //checks for collision
                this.detectCollision(obstacleInstance);

                //checks for side collision
                this.detectSideCollision(obstacleInstance);
            })
        }
            , 100);
    }
    //calculate dynamically positionX for all stacked obstacles on the player based on speed and direction
    calculatesPlayerPhysics() {
        setInterval(() => {
            //automatically decreases speed in case the player is idle
            if (this.player.movementDirection === null && this.player.speed !== 0) {
                if (this.player.speed < 0) {
                    this.player.speed += 2;
                }
                if (this.player.speed > 0) {
                    this.player.speed -= 2;
                }
            }
            //redefines positionX for all stacked objects
            //the lag makes every stacked obstacle have its own movement and placement
            let lag = 0;
            this.player.stackedBalls.forEach((element) => {
                //deviates the object the obstacle on the opposite way of the player's direction, based on a sine wave
                //you can change the mathematical function here to change the direction of the curve i.e. *lag is linear, ^lag is exponential, etc...
                element.positionX = (-this.player.speed) * Math.sin(lag);
                element.domElement.style.left = element.positionX + 'px';
                //you can adapt the lag increment here to increase or decrease how much the ice creams are going to wiggle
                lag += 0.2;
            }
            )
        }, 20)
    }
    //makes arrow left/right move the player and resets the movement direction to null on keyup
    attachEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowLeft") {
                this.player.moveLeft();
            }
            else if (event.key === "ArrowRight") {
                this.player.moveRight();
            }
        })
        document.addEventListener('keyup', (event) => {
            if (event.key === "ArrowLeft" || "ArrowRight") {
                this.player.movementDirection = null;
            }
        })
    }
    //deletes an obstacle permanently from DOM & Array if located outside the gaming board
    removeObstacleIfOutside(obstacleInstance) {
        if (obstacleInstance.positionY < 0 - obstacleInstance.height) {
            obstacleInstance.domElement.remove();
            let index = this.obstaclesArr.indexOf(obstacleInstance);
            this.obstaclesArr.splice(index, 1);
        }
    }
    //calculates in real-time all obstacles position vs the player OR highest ice cream ball
    detectCollision(obstacleInstance) {
        let collider;
        //defines the ice cream cone for collision if stackedObstacles is empty
        if (this.player.stackedBalls.length === 0) {
            collider = this.player
        }
        //defines the last ice cream ball for collision
        else {
            let lastStackedObstacle = this.player.stackedBalls[this.player.stackedBalls.length - 1]
            //here I am creating a deep copy of the last stacked obstacle
            collider = JSON.parse(JSON.stringify((lastStackedObstacle)));
            //adding the player's location value because ball X is relative to the player 
            //i.e. if stackedObstacle  X = 5px and player X = 100 px --> stackedObstacle is in reality in X = 105 px in the game board
            collider.positionX = this.player.positionX + lastStackedObstacle.positionX;
            collider.height = this.player.height;
            collider.positionY = this.player.positionY;
        }

        //standard collision detection formula
        if (
            collider.positionX < obstacleInstance.positionX + obstacleInstance.width &&
            collider.positionX + collider.width > obstacleInstance.positionX &&
            (this.player.height + collider.positionY - 20) < obstacleInstance.positionY + obstacleInstance.height &&
            collider.positionY + collider.height > obstacleInstance.positionY
        ) {
            //marks obstacle as hitted and does corresponding action
            if (obstacleInstance.hit === false) {
                obstacleInstance.hit = true;
                switch (obstacleInstance.flavor) {
                    case 'chocolate': if (this.expectedCombo.chocolate > 0) { this.expectedCombo.chocolate-- }
                        break;
                    case 'vanilla': if (this.expectedCombo.vanilla > 0) { this.expectedCombo.vanilla-- }
                        break;
                    case 'strawberry': if (this.expectedCombo.strawberry > 0) { this.expectedCombo.strawberry-- }
                        break;
                    case 'cherry': this.endGame();
                        break;
                    case 'antigravity': this.antiGravityItem()
                        break;
                    case 'slowTime': this.slowTime();
                }
                //updates DOM element
                this.updateComboDisplay();

                //stacks the item (Choco,Vanilla,Strawberry)
                if (obstacleInstance.flavor === "chocolate"
                    || obstacleInstance.flavor === "vanilla"
                    || obstacleInstance.flavor === "strawberry") {
                    this.player.stackItem(obstacleInstance);
                    //makes a pop sound
                    pop.play();

                    //removes obstacle from the obstacle array
                    let index = this.obstaclesArr.indexOf(obstacleInstance);
                    this.obstaclesArr.splice(index, 1);

                    //updates score
                    this.score++;
                    this.updateScore();
                }
                // if no icecream, no need to stack 
                else {
                    obstacleInstance.domElement.remove()
                }
            }
        }
    }
    //detects collision from the SIDE of the player, which results in making the obstacle spin, but does NOT count as a hit
    detectSideCollision(obstacleInstance) {
        this.player.stackedBalls.forEach((element, index) => {
            //excludes the last ball because the last balls causes the ACTUAL hit collision
            if (index !== this.player.stackedBalls.length - 1) {
                //standard collision calculation, balls positioning values adapted to player's value
                //I already explained it in the detectCollision() function above for ref
                if (
                    this.player.positionX + element.positionX < obstacleInstance.positionX + obstacleInstance.width &&
                    this.player.positionX + element.positionX + element.width > obstacleInstance.positionX &&
                    element.positionY < obstacleInstance.positionY + obstacleInstance.height &&
                    element.positionY + element.height > obstacleInstance.positionY
                ) {
                    //changes status to spin
                    if (obstacleInstance.hit === false && obstacleInstance.status !== "spin") {
                        obstacleInstance.status = "spin";
                        obstacleInstance.domElement.classList.add('spin');
                    }
                }
            }
        })
    }
    //randomly generates the required combo to go to the next level
    defineRandomCombo() {
        //assigns random values 
        this.expectedCombo.chocolate = Math.floor(Math.random() * (3 - 0) + 0);
        this.expectedCombo.vanilla = Math.floor(Math.random() * (3 - 0) + 0);
        this.expectedCombo.strawberry = Math.floor(Math.random() * (3 - 0) + 0);

        //creates DOM element if not already there
        this.choiceDomElement = document.createElement("div");
        this.choiceDomElement.id = "expectedCombo";
        //updates values in DOM
        this.updateComboDisplay();
        document.querySelector('body').appendChild(this.choiceDomElement);
    }
    //updates the DOM element with refreshed combo requirements
    updateComboDisplay() {
        document.querySelector('body').appendChild(this.choiceDomElement);
        this.choiceDomElement.innerHTML =
            `<img src="./img/cherry.png" alt="" style="width:30px; left:10px;"><br>
        <img src="./img/chocolate.png" alt=""> x${this.expectedCombo.chocolate} <br>
        <img src="./img/vanilla.png" alt=""> x${this.expectedCombo.vanilla} <br>
        <img src="./img/strawberry.png" alt=""> x${this.expectedCombo.strawberry}<br>
        <img src="./img/cone.png" alt="">`;
    }
    //creates if necessary and updates the level DOM element
    displayLevel() {
        this.levelDomElement = document.createElement('div');
        this.levelDomElement.id = "lvl";
        document.querySelector("body").appendChild(this.levelDomElement);
        this.levelDomElement.innerText = "LEVEL: " + this.level;
    }
    //applies special item to cancel player's weight for 10 seconds
    antiGravityItem() {
        if (this.player.antigravity === false) {
            this.player.antigravity = true;
            //stores speed to reassign it after 10 seconds
            let orrSpeed = this.player.baseSpeed;
            this.player.baseSpeed = 10;
            setTimeout(() => {
                this.player.baseSpeed = orrSpeed;
                this.player.antigravity = false;
            }, 10000)
        }
    }
    //applies special item to decrease gravity for 10 seconds, causing the objects to fall slower
    slowTime() {
        if (this.slowedTime === false) {
            this.slowedTime = true;
            let orrGravity = this.gravity;
            this.gravity = 0.5;
            setTimeout(() => {
                this.gravity = orrGravity;
            }, 10000)
        }
    }
    //ends the game
    endGame() {
        //removes everything from the board
        this.levelDomElement.remove();
        this.choiceDomElement.style.display = "none";
        this.player.domElement.remove();
        clearInterval(this.createObjInterval)
        this.obstaclesArr.forEach(element => { element.domElement.remove() });
        this.obstaclesArr = [];

        //if WINS
        if (this.expectedCombo.chocolate === 0 &&
            this.expectedCombo.vanilla === 0 &&
            this.expectedCombo.strawberry === 0) {

            document.querySelector("#btn-next").innerText = "Next"
            document.querySelector("#congrats").style.display = "inline"
            document.querySelector("#failed").style.display = "none"
            navigate(scrNext);
            this.level++;
        }
        //if FAILS
        else {
            document.querySelector("#btn-next").innerText = "Retry";
            document.querySelector("#congrats").style.display = "none"
            document.querySelector("#failed").style.display = "inline"
            navigate(scrNext);
        }
    }
    //creates the score DOM element
    createScore() {
        if (this.scoreDomElement === null) {
            this.scoreDomElement = document.createElement("div");
            this.scoreDomElement.id = "score";
            document.querySelector('body').appendChild(this.scoreDomElement);
        }
        this.updateScore();
    }
    // updates the score DOM element
    updateScore() {
        if (this.scoreDomElement !== null) {
            this.scoreDomElement.innerText = `SCORE : ${this.score}`
        }
    }
}
class InfinityGame extends Game {
    constructor() {
        super();
        this.level = "BONUS STAGE";
        this.scoreDomElement = null;
        this.expectedCombo = { chocolate: '∞', vanilla: '∞', strawberry: '∞' };
    }
    start() {
        super.start();
        super.createScore();
    }
    //overwrites the game random function for assigning infinity to each flavor
    defineRandomCombo() {
        if (this.choiceDomElement === null) {
            this.choiceDomElement = document.createElement("div");
            this.choiceDomElement.id = "expectedCombo";
            document.querySelector('body').appendChild(this.choiceDomElement);
        }
        this.updateComboDisplay();
    }
    //overwrites the standard end game with W/L logic to direct to the end screen
    endGame() {
        //removes everything
        this.player.domElement.remove();
        this.scoreDomElement.remove();
        this.choiceDomElement.style.display = "none";
        clearInterval(this.createObjInterval);
        this.obstaclesArr.forEach(element => { element.domElement.remove() });
        this.obstaclesArr = [];
        this.levelDomElement.remove();
        this.choiceDomElement.remove();

        //Updates End screen
        document.querySelector("#final-score").innerText = `YOUR SCORE IS ${this.score}`;
        navigate(scrEnd);
    }
}

//Loads game sounds needed  
let pop = new Audio("./sound/pop.mp3");
let backgroundMusic = new Audio("./sound/background2.mp3");

//Loads screens and elements for navigation
let scrStart = { dom: document.getElementById('start'), displayMode: 'table-cell' };
let scrGame = { dom: document.getElementById('board'), displayMode: 'block' };
let scrNext = { dom: document.getElementById('next'), displayMode: 'table-cell' };
let scrEnd = { dom: document.getElementById('end'), displayMode: 'table-cell' };
let arrScreens = [scrStart, scrGame, scrNext, scrEnd]
let btnStart = document.getElementById('btn-start');
let btnNext = document.getElementById('btn-next');

//Function for navigating between the different screens 
function navigate(screen) {
    //hides all screens
    arrScreens.forEach((element) => { element.dom.style.display = 'none' });
    //unhide selected screen
    screen.dom.style.display = screen.displayMode;
}

let game = null
//ONSTART
btnStart.addEventListener('click', () => {
    navigate(scrGame);
    game = new Game();
    game.start();
    backgroundMusic.play();
});

//ON NEXT -> will launch an infinity BONUS STAGE if player passed two levels :) 
btnNext.addEventListener('click', () => {
    if (game.level === 3 || game.level === "BONUS STAGE") {
        navigate(scrGame);
        bonusStage = new InfinityGame();
        bonusStage.start();
    }
    else {
        navigate(scrGame);
        game.start();
    }
});


