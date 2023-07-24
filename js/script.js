
// we use the load listener to make sure the page is loaded before we try to access the canvas
// Circle hitbox but square sprite
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1'); // get canvas1 element
    const ctx = canvas.getContext('2d'); //get context -2d -inits an object that has methods and properties for drawing on canvas
    canvas.width = 1280; // set width
    canvas.height = 720; // set height
    ctx.fillStyle = 'white'; // default is black
    ctx.lineWidth = 3; // lineWidth - border width
    ctx.strokeStyle = 'white'; // strokeStyle - color of the outline

    // Class Constructors
    class Player {
        constructor(game) {
            this.game = game; // reference data type
            // player position
            this.collisionX = this.game.width * 0.5; // start in center
            this.collisionY = this.game.width * 0.5;;
            // collision radius - defines the size of the hitbox
            this.collisionRadius = 50; // size of the player circle
            this.speedX = 0; // speed in x direction initally set to 0
            this.speedY = 0; // speed in y direction
            this.dx = 0; // distance
            this.dy = 0;
            this.speedModifier = 20; // speed modifier
        }
        // draw a circle representing the player
        draw(context) {
            context.beginPath(); // start drawing
            // arc- x, y(of the center of the circle), radius, start angle in radians mesaured from the positive x axis, end angle arc measured from the positive x axis, anticlockwise(if not defined it will be clockwise(false))
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2); // draw circle
            // we want the fill at 50% transparency- but we want the outline to be normal
            context.save(); // save full transparency (snapshot of canvas state)
            context.globalAlpha = 0.5; // set transparency to 50%
            context.fill(); // will fill at 50% transparency
            context.restore(); // restore canvas settings 
            context.stroke();// stroke - circle outline | fill - filled circle
            // move
            context.beginPath(); // start drawing
            context.moveTo(this.collisionX, this.collisionY); // move to the center of the circle
            context.lineTo(this.game.mouse.x, this.game.mouse.y); // draw a line from the center of the circle to the mouse position
            context.stroke(); // stroke - draw the line
        };
        // Update Method
        update() {
            this.dx = this.game.mouse.x - this.collisionX; // distance between the mouse and the player in the x direction
            this.dy = this.game.mouse.y - this.collisionY; // distance between the mouse and the player in the y direction
            // calculate the distance between the mouse and the player
            const distance = Math.hypot(this.dy, this.dx); // hypotanuse
            // when speed modifier is less than distance need to reset the speed to 0 - this stops the jittery movement at end of movement
            if (distance > this.speedModifier) {
                this.speedX = this.dx / distance || 0; // Speed X
                this.speedY = this.dy / distance || 0; // Speed Y
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }

            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            // Collisions with Obsticles
            this.game.obstacles.forEach(obsticle => {
                // check collision
                if (this.game.checkCollision(this, obsticle)){
                console.log('collision');}
            });
        };
    };

    // Obsticles Class
    class Obsticle {
        // constructor game- when new game starts
        constructor(game) {
            this.game = game; // get the current game data
            this.collisionX = Math.random() * this.game.width; // random x position
            this.collisionY = Math.random() * this.game.height; // random y position
            this.collisionRadius = 50; // size of the obsticle
            // Obsticle Image
            this.image = document.getElementById('obstacles'); // link image to element
            this.spriteWidth = 250; // width of the sprite
            this.spriteHeight = 250; // height
            this.width = this.spriteWidth; // width of the obsticle
            this.height = this.spriteHeight; // height
            this.spriteX = this.collisionX - this.width * 0.5; // center of sprite
            this.spriteY = this.collisionY - this.height * 0.5 ;
            // get random image from sheet
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);            
        }
        draw(context) {
            // obsticle image- drawImage(image, x, s, spriteWidth, spriteHeight, center of sprite X, center of sprite y, ObsticleWidth, ObsticleHeight)
            // 0 * this.spriteWidth - 0 is the first image in the sprite sheet - second image will be 1 * this.spriteWidth
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height) 
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260; // top margin
            // create the player when game is created
            this.player = new Player(this);
            this.numberOfObsticles = 10; // number of obsticles
            // Obsticles array to hold positions of all obsticles
            this.obstacles = [];
            // mouse position
            this.mouse = {
                x: this.width * 0.5, // center
                y: this.height * 0.5,
                pressed: false,
            }

            // Event Listeners - function(name) name will be an object that contains information about the event
            // ES6 special feature - they automatically inherit the reference to "this" keyword from the parent scope
            canvas.addEventListener('mousedown', (event) => {
                this.mouse.x = event.offsetX; // set mouse x position
                this.mouse.y = event.offsetY; // Y
                this.mouse.pressed = true; // reset to false
            });
            canvas.addEventListener('mouseup', (event) => {
                this.mouse.x = event.offsetX; // set mouse x position
                this.mouse.y = event.offsetY; // Y
                this.mouse.pressed = false; // reset to false
            });
            canvas.addEventListener('mousemove', (event) => {
                if (this.mouse.pressed) {
                    this.mouse.x = event.offsetX; // set mouse x position
                    this.mouse.y = event.offsetY; // Y
                }

            });
        }
        // Render the game
        render(context) {
            // draw the obsticles
            this.obstacles.forEach(obsticle => { obsticle.draw(context) });
            // draw the player
            this.player.draw(context);
            // call the update method
            this.player.update();

        }
        // Collision Detection
        checkCollision(a,b) {
            // 1. calculate the distance between the center points of the two circles
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            // 2. Use hypotanuse to Compare the distance between the center points with hypot
            const distance = Math.hypot(dy, dx);
            // the sum of the radius's of both circles
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            // 3. If distance is less than the radius of one circle then it collides.
            return (distance < sumOfRadii); // true if collision

        };
        // generate obsticles
        // Also obsticles can't overlap and need a small gap
        init() {
            // circle packing
            let attepmts = 0; // number of attempts to try to draw the circles
            // secondary condition of < 500 in case it gets stuck in an infinite loop
            while (this.obstacles.length < this.numberOfObsticles && attepmts < 500) { // loop until we have drawn all the circles
                let testObstacle = new Obsticle(this); // create a new obsticle to compare to the others circles for overlapping
                let overlap = false;
                this.obstacles.forEach(obsticle => {
                    // circle collision detection
                    // 1. calculate the distance between the center points of the two circles
                    const dx = testObstacle.collisionX - obsticle.collisionX;
                    const dy = testObstacle.collisionY - obsticle.collisionY;
                    // distance buffer
                    const distanceBuffer = 150;
                    // 2. Use hypotanuse to Compare the distance between the center points with .
                    const distance = Math.hypot(dy, dx);
                    // the sum of the radius's of both circles plus the distance buffer
                    const sumOfRadius = testObstacle.collisionRadius + obsticle.collisionRadius + distanceBuffer;

                    // 3. If distance is less that the radius of one circle then it collides.
                    if (distance < sumOfRadius) {
                        overlap = true; // set to true if overlapping
                    }
                });
                // Margin
                const margin = testObstacle.collisionRadius * 2; // margin
                // When the new test object passes the tests it is written to the array
                //  keeps the obsticle images from rendering off screen
                if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > 260 && testObstacle.collisionY < this.height){
                    this.obstacles.push(testObstacle);
                }
                attepmts++;


            }
        }
    }


    const game = new Game(canvas);
    game.init();
    console.log(game);



    // animation loop - on each frame
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
        game.render(ctx); // render
        requestAnimationFrame(animate); // requestAnimationFrame - calls the animate function as soon as the browser is ready to repaint the screen
    };
    animate(); // call the function
});