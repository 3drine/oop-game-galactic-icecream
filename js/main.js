class Player {
    constructor() {
        this.width = 50;
        this.boardWidth = document.querySelector("#board").clientWidth;
        this.positionX = this.boardWidth / 2 - this.width / 2;
        this.positionY = 0;
        this.height = 120;
        this.domElement = null;
        this.speed = 1;
        this.createDomElement();
        this.stackedBalls = [];
        this.antigravity = false;

    }
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
    moveLeft() {
        if (this.positionX > 0) {
            this.positionX = this.positionX - this.speed;
            this.domElement.style.left = this.positionX + 'px';
        }
        let lag = 3;
        let incrCount=1;
        this.stackedBalls.forEach((element) => {
            element.positionX = lag*incrCount;
            element.domElement.style.left = element.positionX + "px";
            incrCount++;
            // setTimeout(()=> {
            //     element.positionX = 0;
            //     element.domElement.style.left = element.positionX + "px";
            // })
        });

        

    }
    moveRight() {
        if (this.positionX < this.boardWidth - this.width) {
            this.positionX = this.positionX + this.speed;
            this.domElement.style.left = this.positionX + 'px';
        }
        let lag = -3;
        let incrCount=1;
        this.stackedBalls.forEach((element) => {
            element.positionX = lag*incrCount;
            element.domElement.style.left = element.positionX + "px";
            incrCount++;
            // setTimeout(()=> {
            //     element.positionX = 0;
            //     element.domElement.style.left = element.positionX + "px";
            // })
        });

    }
    stackItem(obstacleInstance) {
        this.stackedBalls.push(obstacleInstance);
        obstacleInstance.domElement.classList.add('stacked');
        this.domElement.style.height = this.height + 'px';
        obstacleInstance.domElement.style.left = (this.width / 2) - (obstacleInstance.width / 2) + 'px';
        obstacleInstance.domElement.style.bottom = (this.height - obstacleInstance.height) + 'px';

        this.domElement.appendChild(obstacleInstance.domElement);
        this.height += 30;
        if (this.speed > 2) {
            this.speed--
        };
        clearInterval(obstacleInstance.movement);

    }

}

class Obstacle {
    constructor(obstacleChoice, gravity) {
        this.width = 50;
        this.positionX = Math.random() * ((500 - this.width) - 0) + 0;
        this.positionY = document.querySelector("#board").clientHeight;
        this.height = 50;
        this.domElement = null;
        this.speed = 1;
        this.choicesArray = obstacleChoice;
        this.flavor = "";
        this.hit = false;
        this.gravity = gravity;
        this.status = "normal";

        this.createDomElement();
    }
    moveDown() {
        this.positionY -= this.gravity;
        this.domElement.style.bottom = this.positionY + "px"
    }
    createDomElement() {
        this.domElement = document.createElement('div');
        this.domElement.className = 'obstacle';

        //randomly defined element to create 
        let randBetween = Math.floor(Math.random() * (this.choicesArray.length - 0) + 0);
        this.flavor = this.choicesArray[randBetween];
        this.domElement.classList.add(this.flavor);

        this.domElement.style.width = this.width + "px";
        this.domElement.style.height = this.height + "px";
        this.domElement.style.left = this.positionX + "px";
        this.domElement.style.bottom = this.positionY + "px";
        const parentElm = document.getElementById('board');
        parentElm.appendChild(this.domElement);

        this.movement = setInterval(() => {
            this.moveDown();
        }, 10);
    }

}

class Game {
    constructor() {
        this.player = null;
        this.obstaclesArr = [];
        this.expectedCombo = { chocolate: 0, vanilla: 0, strawberry: 0 };
        this.choicesArray = ["vanilla", "chocolate", "strawberry", "cherry", "antigravity", "slowTime"];
        this.level = 1;
        this.pickedArray = [];
        this.choiceDomElement = null;
        this.levelDomElement = null;
        this.gravity = 2;
        this.attachEventListeners();
    }
    start() {
        this.player = new Player;

        //invokes attach  event listener
        //this.attachEventListeners();

        //defines a random combo to achieve 
        this.defineRandomCombo();

        //
        this.displayLevel();

        //create obstacles
        this.createObjInteral = setInterval(() => {
            let newObstacle = new Obstacle(this.choicesArray, this.gravity);
            this.obstaclesArr.push(newObstacle);
        }, 1000);

        // move all obstacles 
        setInterval(() => {
            this.obstaclesArr.forEach((obstacleInstance) => {
                //moves
                // obstacleInstance.moveDown();

                //remove if outside
                this.removeObstacleIfOutside(obstacleInstance);

                //checks for collision
                this.detectCollision(obstacleInstance);

                //checks for missed collision
                this.detectSideCollision(obstacleInstance);
            })
        }, 100);

    }
    attachEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowLeft") {
                this.player.moveLeft();
            }
            else if (event.key === "ArrowRight") {
                this.player.moveRight();
            }
        })
    }
    removeObstacleIfOutside(obstacleInstance) {
        //remove if outside
        if (obstacleInstance.positionY < 0 - obstacleInstance.height) {
            obstacleInstance.domElement.remove();
            let index = this.obstaclesArr.indexOf(obstacleInstance);
            this.obstaclesArr.splice(index, 1);
        }
    }
    detectCollision(obstacleInstance) {
        if (
            this.player.positionX < obstacleInstance.positionX + obstacleInstance.width &&
            this.player.positionX + this.player.width > obstacleInstance.positionX &&
            (this.player.height - 20) < obstacleInstance.positionY + obstacleInstance.height &&
            this.player.positionY + this.player.height > obstacleInstance.positionY
        ) {
            // Collision detected!
            console.log("collision");

            if (obstacleInstance.hit === false) {
                obstacleInstance.hit = true
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
                this.updateComboDisplay();
                //add stacking function HERE
                if (obstacleInstance.flavor === "chocolate" || obstacleInstance.flavor === "vanilla" || obstacleInstance.flavor === "strawberry" || obstacleInstance.flavor === "cherry") {
                    this.player.stackItem(obstacleInstance);
                    let index = this.obstaclesArr.indexOf(obstacleInstance);
                    this.obstaclesArr.splice(index, 1);
                }
                else { obstacleInstance.domElement.remove() }



            }

        }
    }

    detectSideCollision(obstacleInstance) {
        if (
            this.player.positionX < obstacleInstance.positionX + obstacleInstance.width &&
            this.player.positionX + this.player.width > obstacleInstance.positionX &&
            this.player.positionY < obstacleInstance.positionY + obstacleInstance.height &&
            this.player.positionY + (this.player.height - 20) > obstacleInstance.positionY
        ) {
            if (obstacleInstance.hit === false && obstacleInstance.status !== "spin") {
                obstacleInstance.status = "spin";
                obstacleInstance.domElement.classList.add('spin');
            }

        }


    }

    defineRandomCombo() {
        this.expectedCombo.chocolate = Math.floor(Math.random() * (5 - 0) + 0);
        this.expectedCombo.vanilla = Math.floor(Math.random() * (5 - 0) + 0);
        this.expectedCombo.strawberry = Math.floor(Math.random() * (5 - 0) + 0);

        if (this.choiceDomElement === null) {
            this.choiceDomElement = document.createElement("div");
            this.choiceDomElement.id = "expectedCombo";
            document.querySelector('body').appendChild(this.choiceDomElement);
        }
        this.updateComboDisplay();

    }
    updateComboDisplay() {
        document.querySelector('body').appendChild(this.choiceDomElement);
        this.choiceDomElement.innerHTML = `<img src="./img/chocolate.png" alt=""> x${this.expectedCombo.chocolate} <br>
        <img src="./img/vanilla.png" alt=""> x${this.expectedCombo.vanilla} <br>
        <img src="./img/strawberry.png" alt=""> x${this.expectedCombo.strawberry}`;

    }
    displayLevel() {
        if (this.levelDomElement === null) {
            this.levelDomElement = document.createElement('div');
            this.levelDomElement.id = "lvl";
            document.querySelector("body").appendChild(this.levelDomElement);
        }
        this.levelDomElement.innerText = "LEVEL: " + this.level;

    }
    antiGravityItem() {
        if (this.player.antigravity === false) {
            this.player.antigravity = true;
            let orrSpeed = this.player.speed;
            this.player.speed = 10;
            setTimeout(() => {
                this.player.speed = orrSpeed;
                this.player.antigravity = false;
            }, 10000)
        }

    }
    slowTime() {

        let orrGravity = this.gravity;
        this.gravity = 0.5;
        setTimeout(() => {
            this.gravity = orrGravity;
        }, 10000)
    }
    endGame() {
        this.player.domElement.remove();
        clearInterval(this.createObjInteral)
        this.obstaclesArr.forEach(element => {
            element.domElement.remove();
        }
        )
        this.obstaclesArr = [];
        if (this.expectedCombo.chocolate === 0 &&
            this.expectedCombo.vanilla === 0 &&
            this.expectedCombo.strawberry === 0) {
            console.log("ITS A WIN");
            document.querySelector("#btn-next").innerText = "Next"
            showScreen(scrNext);
            this.level++;
            this.displayLevel();
        }
        else {
            console.log("LOOSER");
            document.querySelector("#btn-next").innerText = "Retry"
            showScreen(scrNext);
        }
    }
}


let scrStart = { dom: document.getElementById('start'), displayMode: 'table-cell' };
let scrGame = { dom: document.getElementById('board'), displayMode: 'block' };
let scrNext = { dom: document.getElementById('next'), displayMode: 'table-cell' };
let scrEnd = { dom: document.getElementById('end'), displayMode: 'table-cell' };
let arrScreens = [scrStart, scrGame, scrNext, scrEnd]
let game = null
document.getElementById('btn-start').addEventListener('click', () => {
    showScreen(scrGame);
    game = new Game();
    game.start();
});

document.getElementById('btn-next').addEventListener('click', () => {
    showScreen(scrGame);
    game.start();
});

function showScreen(screen) {
    arrScreens.forEach((element) => {
        element.dom.style.display = 'none';
    });
    screen.dom.style.display = screen.displayMode;
}



