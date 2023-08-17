let pop = new Audio("./sound/pop.mp3");
let backgroundMusic = new Audio("./sound/background2.mp3");


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
            this.movementDirection = 'left';
            //if(this.speed>0) {this.speed = 0};
            //if(this.speed >= 0) {this.speed -=5}
            this.positionX = this.positionX - this.baseSpeed;
            this.domElement.style.left = this.positionX + 'px';
            this.speed--
        }

    }
    moveRight() {
        if (this.positionX < this.boardWidth - this.width) {
            this.movementDirection = 'right';
            //if(this.speed<0) {this.speed = 0};
            //if(this.speed <= 0) {this.speed +=5}
            this.positionX = this.positionX + this.baseSpeed;
            this.domElement.style.left = this.positionX + 'px';
            this.speed++
        }
    }
    stackItem(obstacleInstance) {
        this.stackedBalls.push(obstacleInstance);
        obstacleInstance.domElement.classList.add('stacked');
        this.domElement.style.height = this.height + 'px';

        obstacleInstance.positionX = (this.width / 2) - (obstacleInstance.width / 2);
        obstacleInstance.domElement.style.left = obstacleInstance.positionX + 'px';

        obstacleInstance.positionY = (this.height - obstacleInstance.height);
        obstacleInstance.domElement.style.bottom = obstacleInstance.positionY + 'px';

        this.domElement.appendChild(obstacleInstance.domElement);
        this.height += obstacleInstance.height - 20;
        if (this.baseSpeed > 2) {
            this.baseSpeed -= 0.5;
        };
        clearInterval(obstacleInstance.movement);


        if(this.stackedBalls.length>Math.floor((document.querySelector("#board").clientHeight/obstacleInstance.height)*0.8))
        {
            this.height-=30;
            this.domElement.style.height = this.height + "px"
            this.stackedBalls[0].domElement.remove();
            this.magicCone();
            this.stackedBalls.shift();
            this.stackedBalls.forEach((element) => {
                element.positionY-=30;
                element.domElement.style.bottom = element.positionY+"px";
            }) 
        }
        


    }

    magicCone() {
        if(this.effect === null) {
            this.effect = document.createElement('div'); 
            this.effect.style.backgroundImage = `url(../img/sparkle.gif)`;
            this.effect.style.backgroundSize = "contain";
            this.effect.style.backgroundPosition = "center";
            this.effect.style.position = "fixed";
            this.effect.style.bottom = "0px";
            this.effect.style.height = "80px";
            this.effect.style.width = "50px";
            this.effect.style.borderRadius = "30px";
            this.domElement.appendChild(this.effect);
            console.log("created blackhole" + this.effect)
        }
        
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
        this.choicesArray = ["vanilla", "chocolate", "strawberry","cherry", "antigravity", "slowTime"];
        this.level = 1;
        this.pickedArray = [];
        this.choiceDomElement = null;
        this.levelDomElement = null;
        this.gravity = 2;
        this.attachEventListeners();
        this.score = 0;
        this.scoreDomElement = null;
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

        


        setInterval(() => {
            if (this.player.movementDirection === null && this.player.speed !== 0) {
                if (this.player.speed < 0) {
                    this.player.speed += 2
                }
                if (this.player.speed > 0) {
                    this.player.speed -= 2
                }
            }
            // if(this.player.movementDirection==="left"&& this.player.speed>0) {
            //     this.player.speed-=5
            // }
            // if(this.player.movementDirection==="right"&& this.player.speed<0) {
            //     this.player.speed+=5
            // }


            //console.log(this.player.movementDirection+this.player.speed);
            let lag = 0;
            this.player.stackedBalls.forEach((element) => {
                element.positionX = (-this.player.speed) * Math.sin(lag)
                element.domElement.style.left = element.positionX + 'px';
                lag += 0.2;
            })


        }, 20)

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
        document.addEventListener('keyup', (event) => {
            if (event.key === "ArrowLeft" || "ArrowRight") {
                this.player.movementDirection = null;
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
        let collider

        if (this.player.stackedBalls.length === 0) {
            collider = this.player
        }
        else {
            collider = JSON.parse(JSON.stringify((this.player.stackedBalls[this.player.stackedBalls.length - 1])));

            collider.positionX = this.player.positionX + this.player.stackedBalls[this.player.stackedBalls.length - 1].positionX;
            collider.height = this.player.height;
            collider.positionY = this.player.positionY;
        }



        if (
            collider.positionX < obstacleInstance.positionX + obstacleInstance.width &&
            collider.positionX + collider.width > obstacleInstance.positionX &&
            (this.player.height + collider.positionY - 20) < obstacleInstance.positionY + obstacleInstance.height &&
            collider.positionY + collider.height > obstacleInstance.positionY
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
                    pop.play();
                    let index = this.obstaclesArr.indexOf(obstacleInstance);
                    this.obstaclesArr.splice(index, 1);
                    this.score++;
                    this.updateScore();                }
                else { obstacleInstance.domElement.remove() }



            }

        }
    }

    detectSideCollision(obstacleInstance) {

        this.player.stackedBalls.forEach((element, index) => {
            if (index !== this.player.stackedBalls.length - 1) {

                if (
                    this.player.positionX + element.positionX < obstacleInstance.positionX + obstacleInstance.width &&
                    this.player.positionX + element.positionX + element.width > obstacleInstance.positionX &&
                    element.positionY < obstacleInstance.positionY + obstacleInstance.height &&
                    element.positionY + element.height > obstacleInstance.positionY
                ) {
                    if (obstacleInstance.hit === false && obstacleInstance.status !== "spin") {
                        obstacleInstance.status = "spin";
                        obstacleInstance.domElement.classList.add('spin');
                    }

                }


            }



        })





    }

    defineRandomCombo() {
        this.expectedCombo.chocolate = Math.floor(Math.random() * (1 - 0) + 0);
        this.expectedCombo.vanilla = Math.floor(Math.random() * (1 - 0) + 0);
        this.expectedCombo.strawberry = Math.floor(Math.random() * (1 - 0) + 0);

        if (this.choiceDomElement === null) {
            this.choiceDomElement = document.createElement("div");
            this.choiceDomElement.id = "expectedCombo";
            document.querySelector('body').appendChild(this.choiceDomElement);
        }
        this.updateComboDisplay();

    }
    updateComboDisplay() {
        document.querySelector('body').appendChild(this.choiceDomElement);
        this.choiceDomElement.innerHTML = `<img src="./img/cherry.png" alt="" style="width:30px; left:10px;"><br>
        <img src="./img/chocolate.png" alt=""> x${this.expectedCombo.chocolate} <br>
        <img src="./img/vanilla.png" alt=""> x${this.expectedCombo.vanilla} <br>
        <img src="./img/strawberry.png" alt=""> x${this.expectedCombo.strawberry}<br>
        <img src="./img/cone.png" alt="">`;

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
            let orrSpeed = this.player.baseSpeed;
            this.player.baseSpeed = 10;
            setTimeout(() => {
                this.player.baseSpeed = orrSpeed;
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
        this.levelDomElement.remove();
        this.choiceDomElement.style.display = "none";
        console.log("im removing it...")
        console.log(this.levelDomElement)
        console.log(this.choiceDomElement)
        console.log(this.choiceDomElement.remove())
        
        
        
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
            document.querySelector("#congrats").style.display = "inline"
            document.querySelector("#failed").style.display = "none"
            showScreen(scrNext);
            this.level++;
            this.displayLevel();
        }
        else {
            console.log("LOOSER");
            document.querySelector("#btn-next").innerText = "Retry";
            document.querySelector("#congrats").style.display = "none"
            document.querySelector("#failed").style.display = "inline"
            showScreen(scrNext);
            
        }
    }
    createScore() {
        if (this.scoreDomElement === null) {
            this.scoreDomElement = document.createElement("div");
            this.scoreDomElement.id = "score";
            document.querySelector('body').appendChild(this.scoreDomElement);
        }

        this.scoreDomElement.innerText = "SCORE: "+this.score

    }

    updateScore() {
        if (this.scoreDomElement !== null) {
            this.scoreDomElement.innerText = `SCORE : ${this.score}`
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
    backgroundMusic.play();
});

document.getElementById('btn-next').addEventListener('click', () => {
    console.log(game.level);
    if(game.level === 2 || game.level === "BONUS STAGE"){
        showScreen(scrGame);
        bonusStage = new InfinityGame(); 
        bonusStage.start();
    }
    else {
        showScreen(scrGame);
        game.start();
    }

});

function showScreen(screen) {
    arrScreens.forEach((element) => {
        element.dom.style.display = 'none';
    });
    screen.dom.style.display = screen.displayMode;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    defineRandomCombo() {
        if (this.choiceDomElement === null) {
            this.choiceDomElement = document.createElement("div");
            this.choiceDomElement.id = "expectedCombo";
            document.querySelector('body').appendChild(this.choiceDomElement);
        }
        this.updateComboDisplay();

    }

    endGame() {
        this.player.domElement.remove();
        this.scoreDomElement.remove();
        this.choiceDomElement.style.display = "none";
        clearInterval(this.createObjInteral)
        this.obstaclesArr.forEach(element => {
            element.domElement.remove();
        }
        )
        this.obstaclesArr = [];
        this.levelDomElement.remove();
        this.choiceDomElement.remove(); 
        document.querySelector("#final-score").innerText = `YOUR SCORE IS ${this.score}`
        showScreen(scrEnd);
        }





}
