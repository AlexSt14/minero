/*
The Game Project FINAL - Including sound and Enemies
Student number: 230328051 
Please NOTE, I have sometimes spelled if statement as if (condition) {action}, this is done on purpose, I do this in order to keep the if statement short
when there is only one short or 2 short actions, this is not a mistake and just wanted to say this here
*/
//floor variable
var floorPos_y;
//character variables
var gameChar_x;
var gameChar_y;
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isJumping;
var powerJump;
var playerGravity;
var cameraPosX;
var lives;
//other variables
var collectables;
var canyon;
var canyons;
var treesPos_x;
var treePos_y;
var clouds;
var mountains;
var game_score;
var flagPole;
var enemies;
var lastCalled;
var power;
var platforms;
var onPlatform;
var platformMoveBack;
//game menu variables
var menu;
var startgame_btn;
var help_btn;
var clicked_help;
var back_btn;
var helpButtonInGame;
//sound variables
var jumpSound;
var environmentSound;
var winSound;
var mouseClick;
var gameOver;
var dieSound;
var enemyAttack; //Sound file loaded
var enemyAttackSound //boolean logic for when to play it
var enemyGameOver;
var enemyKill;
var enemyKillSoundPlayed; //needed so I can play this sound only once
function preload()
{
    soundFormats('mp3','wav');    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
	environmentSound = loadSound('assets/environmentSound.mp3');
	environmentSound.setVolume(0.02);
	winSound = loadSound('assets/winSound.wav');
	winSound.setVolume(0.5);
	mouseClick = loadSound('assets/mouseClick.wav');
	mouseClick.setVolume(1);
	gameOver = loadSound('assets/gameOver.wav');
	gameOver.setVolume(0.1);
	dieSound = loadSound('assets/dieSound.wav');
	dieSound.setVolume(0.1);
	enemyAttack = loadSound('assets/enemyAttack.wav');
	enemyAttack.setVolume(0.5);
	enemyGameOver = loadSound('assets/enemyGameOver.mp3');
	enemyGameOver.setVolume(0.5);
	enemyKill = loadSound('assets/enemyKill.wav');
	enemyKill.setVolume(0.5);
}
function setup()
{	
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;	
	lives = [1, 1, 1];
	startGame();	
}
function draw()
{
	///////////DRAWING CODE//////////
	background(136, 136, 68); //fill the sky blue
	/*
	Side scrolling
	Started side scrolling right before drawing the ground because I want the ground to not move, this is because my canyons are drawn in a different way, this is done on purpose!!!
	Only starts scrolling when the player is in the middle of the screen, creating the illusion of end of map, once the game expands, I will change those settings
	*/
	if (isLeft && gameChar_x > 517 && gameChar_x < 4020) {
		cameraPosX -= 5;}
	if (isRight && gameChar_x > 512 && gameChar_x < 4020) {
		cameraPosX += 5;		
	}
	//Blocking the player to move outside of the map
	if (gameChar_x <= 0) {
		gameChar_x = 0;
		isLeft = false;
	}
	push();
	translate(-cameraPosX, 0);
	//draw the game level
	drawGameLevel();	
	//draw scenery
	drawClouds();	
	drawMountains();	
	drawTrees();
	renderFlagpole();
	//draw the canyon
	for (var i = 0; i < canyons.length; i++){
		drawCanyon(canyons[i]);	
		checkCanyon(canyons[i]);
	}
	//draw the powerJump object	
	renderPowerjump();	
	//draw the power that the player uses to kill enemies
	renderPower();
	//collectable item
	for (var i = 0; i < collectables.length; i++){
		if (!collectables[i].isFound){
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}	
	//drawing the platforms
	for(var i = 0; i < platforms.length; i++) {
		platforms[i].draw();
	}
	//checking if flagpole is reached
	if (!flagPole.isReached) {
		checkFlagpole();
	}
	//if flagpole is reached, gameWin function is called
	if (flagPole.isReached) {
		gameWin();
	}	
	//drawing enemies and checking when player dies
	for(var i = 0; i < enemies.length; i++) {
		var isContact = false;
		enemies[i].draw();
		isContact = enemies[i].checkContact(gameChar_x,gameChar_y);
		if(isContact) {
			isPlummeting = true;
			enemyAttackSound = true;
		}
		//If enemy is hit, will be removed from the canvas
		if(enemies[i].isHit) {
			enemies[i].y_pos += 8;
			//removing enemies from the array as they are killed and restoring the last position of the enemy relative to the player to false
			if(enemies[i].y_pos > 600) {
				enemies.splice(i, 1);				
			}
		}
	}	
	if (isPlummeting) {
		gameChar_y += 8;
		isLeft = false;
		isRight = false;
		checkPlayerDie(enemyAttackSound);		
	}
	//the game character
	drawGameCharacter();
	pop();	//Needed for side scrolling
	//Moving platform animation + character logic animation once it touches the platform
	if (!platformMoveBack) {
		platforms[0].x += 0.5;
		if (platforms[0].x > 2780) {
			platformMoveBack = true;
		}
		if (gameChar_x > platforms[0].x && gameChar_x < platforms[0].x+platforms[0].length) {
			gameChar_x += 0.5;
		}
	}
	if (platformMoveBack) {
		platforms[0].x -= 0.5;
		if (platforms[0].x < 2640) {
			platformMoveBack = false;
		}
		if (gameChar_x > platforms[0].x && gameChar_x < platforms[0].x+platforms[0].length) {
			gameChar_x -= 0.5;
		}
	}
	//This will draw the power effect and activate the kill of an enemy
	if (power.isActive) {
		power.count++;
		if (power.count >= 30) {
			power.isActive = false;
			power.count = 0;
			enemyKillSoundPlayed = false;
		}		
	}	
	//Draw's player's information such as lives, points and the power object to kill enemies
	drawPlayerHUD();
	//If button H is pressed, this will call the help menu
	if (helpButtonInGame) {
		gameMenu();
	}	
	///////////INTERACTION CODE//////////
	//Put conditional statements to move the game character below here
	//Moving left and right
	if (isLeft) {gameChar_x -= 5;}
	if (isRight) {gameChar_x += 5;}
	//Jumping animation
	if (isJumping){
		gameChar_y -= 7;
		isFalling = true;
		if(gameChar_y <= powerJump.limit && !onPlatform) {
			isJumping = false;
			playerGravity = true;
		}
		if(gameChar_y <= powerJump.limit-80 && onPlatform) {
			isJumping = false;
			playerGravity = true;
			onPlatform = false;
		}
	}
	var isContact = false;
	for(var i = 0; i < platforms.length; i++) {
		if(platforms[i].checkContact(gameChar_x,gameChar_y)) {
			isContact = true;
			
			gameChar_y = platforms[i].y;
			if(!isJumping) {
				isFalling = false;	
				onPlatform = true;	//needed to control the heigh of jump while on platform
			}
		}
	}
	/*In order to create an animation for jumping in the air (without subtracting 100 from gameChar_y as that 
	looks rough) I had to create another boolean that controls the gravity of the player back to the ground)*/
	if (playerGravity) {
		if(!isContact) {
			isFalling = true;
			gameChar_y += 7;
			if (gameChar_y >= floorPos_y) {
				isFalling = false;
				playerGravity = false;		
				gameChar_y = floorPos_y;	
			}
		}				
	}
	//Checking if the player found a powerJump object, this will help the player to jump higher
	if (dist(gameChar_x, gameChar_y, powerJump.x_pos, powerJump.y_pos) <= 40) {
		powerJump.isFound = true;
		powerJump.limit = 220;	//new limit of the jump, makes the player jump higher
	}	
	//Checking if the player found the power object for killing enemies
	if(dist(gameChar_x,gameChar_y,power.x_pos,power.y_pos) <= 40) {
		power.isFound = true;
	}		
}
//Activating the movement once key is pressed, initiating the jump
function keyPressed()
{
	//The browser is blocking autoplay sounds AudioContext and only resumes at user interaction
	//This is my way to get around it and make the sound play after the user starts moving 
	getAudioContext().resume()
	// if statements to control the animation of the character when
	// keys are pressed.
	//Left and right
	if (key == "a" && !isPlummeting && !helpButtonInGame) {isLeft = true;}
	if (key == "d" && !isPlummeting && !helpButtonInGame) {isRight = true; }
	//Jumping
	if ((keyCode == 32 || key == "w") && !isFalling && !flagPole.isReached 
		&& !power.isActive && !helpButtonInGame) {
		playerGravity = false; //Needed here because this remains true after contact is made with platform. During platform contact it needs to stay true so that player falls if he walks off platform
        isJumping = true;
		jumpSound.play();	
	}
	//logic for the power bar and how it works + when the power is activated once the button is pressed
	for(var i = 0; i < enemies.length; i++) {
		if (key == "f" && !isPlummeting && power.powerBar.length >= power.consumption && power.isFound && 
			!power.isActive && (abs(gameChar_x-enemies[i].currentX) <= 100)) {
			power.powerBar.length -= power.consumption;
			power.isActive = true;
		}
	}	
	if(key == "h" && !isPlummeting && !flagPole.isReached) {
		helpButtonInGame = true;
		isLeft = false;
		isRight = false;
	}
}
//Deactivating the movement once key is released
function keyReleased()
{
	// if statements to control the animation of the character when
	// keys are released.
	if (key == "a") {isLeft = false;}
	if (key == "d") {isRight = false;}
}
// Actions for clicking on buttons from game menu
function mousePressed() {	//Thos button appears if player has 1 or more lives, which will only respawn the player when its clicked
	if (isPlummeting && mouseX > menu.buttons[0].x_pos && mouseX < menu.buttons[0].x_pos+menu.buttons[0].width &&
		mouseY > menu.buttons[0].y_pos && mouseY < menu.buttons[0].y_pos+menu.buttons[0].height && lives.length > 0 && !clicked_help) {
		gameChar_x = width/2;
		gameChar_y = floorPos_y;
		isPlummeting = false;
		isFalling = false;
		cameraPosX = 0;
		powerJump.limit = 280;
		mouseClick.play();
	}	//This button appears only if the player has no more lives, refilling the lives array back to 3 and calling startgame function
	else if (isPlummeting && mouseX > menu.buttons[0].x_pos && mouseX < menu.buttons[0].x_pos+menu.buttons[0].width &&
		mouseY > menu.buttons[0].y_pos && mouseY < menu.buttons[0].y_pos+menu.buttons[0].height && lives.length < 1 && !clicked_help) {
		startGame();
		for (var i = 0; i < 3; i++) {
			lives.push(1);
		}
		mouseClick.play();
	}	//when help button is clicked, we switch boolean to true(to show the help menu) and call the menu function again
	if (isPlummeting && mouseX > menu.buttons[1].x_pos && mouseX < menu.buttons[1].x_pos+menu.buttons[1].width &&
		mouseY > menu.buttons[1].y_pos && mouseY < menu.buttons[1].y_pos+menu.buttons[1].height) {
		gameMenu();
		clicked_help = true;
		mouseClick.play();
	}	//When back button is clicked, we change the boolean to false, calling the menu function again
	if (isPlummeting && mouseX > menu.buttons[2].x_pos && mouseX < menu.buttons[2].x_pos+menu.buttons[2].width &&
		mouseY > menu.buttons[2].y_pos && mouseY < menu.buttons[2].y_pos+menu.buttons[2].height && !helpButtonInGame) {
		clicked_help = false;
		gameMenu();	
		mouseClick.play();		
	}	//When reaching the WIN condition, we clear the lives array and refill it with 3 lives, calling startGame again once button is clicked
	if (flagPole.isReached && mouseX > menu.buttons[0].x_pos && mouseX < menu.buttons[0].x_pos+menu.buttons[0].width &&
		mouseY > menu.buttons[0].y_pos && mouseY < menu.buttons[0].y_pos+menu.buttons[0].height) {
		lives = [];
		for (var i = 0; i < 3; i++) {
			lives.push(1);
		}
		startGame();
		mouseClick.play();
	}	//If Go back button is clicked while the menu opened by player pressing key H, we return back to the game, closing the menu
	if (mouseX > menu.buttons[2].x_pos && mouseX < menu.buttons[2].x_pos+menu.buttons[2].width &&
		mouseY > menu.buttons[2].y_pos && mouseY < menu.buttons[2].y_pos+menu.buttons[2].height && helpButtonInGame) {
			helpButtonInGame = false;
			clicked_help = false;
			mouseClick.play();
		}	
}
function drawGameLevel() {
	noStroke();
	fill(66, 36, 51 );
	rect(0, floorPos_y, 4700, height - floorPos_y);
}
//Drawing the clouds
function drawClouds() 
{
	for (var i = 0; i < clouds.length; i++) {
		noStroke();
		fill(173, 173, 133);
		ellipse(clouds[i].x_pos,clouds[i].y_pos, 100*clouds[i].size,70*clouds[i].size);
		ellipse(clouds[i].x_pos-40*clouds[i].size,clouds[i].y_pos-10,70*clouds[i].size,50*clouds[i].size);
		ellipse(clouds[i].x_pos+40*clouds[i].size,clouds[i].y_pos+10,70*clouds[i].size,50*clouds[i].size);
		ellipse(clouds[i].x_pos+10,clouds[i].y_pos-20*clouds[i].size,70*clouds[i].size,50*clouds[i].size);
		//implementing moving clouds
		clouds[i].x_pos += 0.4;
		if (clouds[i].x_pos >= 4600) {clouds[i].x_pos = -100;}	//This will move clouds back to start of map once they reach the end
	}
}
//Drawing the mountains
function drawMountains()
{
	for (var i = 0; i < mountains.length; i++) {
		fill(11, 31, 20);
		triangle(mountains[i].x_pos-100-mountains[i].size,mountains[i].y_pos,
			mountains[i].x_pos+100+mountains[i].size,mountains[i].y_pos,
			mountains[i].x_pos,mountains[i].y_pos-250-mountains[i].size);
		fill(40);
		triangle(mountains[i].x_pos-100-mountains[i].size,mountains[i].y_pos,
			mountains[i].x_pos-40-mountains[i].size/2,mountains[i].y_pos,
			mountains[i].x_pos,mountains[i].y_pos-250-mountains[i].size);				
	}
}
//Drawing the trees
function drawTrees()
{
	for (var i = 0; i < treesPos_x.length; i++) {
		noStroke();
		fill(128, 50, 0);
		quad(treesPos_x[i]-20,treePos_y,treesPos_x[i]+20,treePos_y,
			treesPos_x[i]+17,treePos_y-100,treesPos_x[i]-17,treePos_y-100);
		//branches
		fill(0, 75, 0);
		ellipse(treesPos_x[i]-20,treePos_y-100,80,60);
		ellipse(treesPos_x[i]+20,treePos_y-112,80,60);
		ellipse(treesPos_x[i]-16,treePos_y-132,80,60);
		ellipse(treesPos_x[i]+16,treePos_y-142,80,60);
		ellipse(treesPos_x[i],treePos_y-172,80,60);
	}
}
//Drawing the collectable
function drawCollectable(t_collectable)
{
	if (!t_collectable.isFound){
		fill(153, 179, 255, 240);
		quad(t_collectable.x_pos-15-t_collectable.size,t_collectable.y_pos,
			t_collectable.x_pos,t_collectable.y_pos-20-t_collectable.size,
			t_collectable.x_pos+15+t_collectable.size,t_collectable.y_pos,
			t_collectable.x_pos,t_collectable.y_pos+20+t_collectable.size)
		fill(77, 121, 255, 210);
		triangle(t_collectable.x_pos,t_collectable.y_pos-20-t_collectable.size,
			t_collectable.x_pos, t_collectable.y_pos+20+t_collectable.size,
			t_collectable.x_pos+15+t_collectable.size,t_collectable.y_pos)
		triangle(t_collectable.x_pos-15-t_collectable.size, t_collectable.y_pos,
			t_collectable.x_pos+15+t_collectable.size,t_collectable.y_pos,
			t_collectable.x_pos,t_collectable.y_pos+20+t_collectable.size)	
	}
}
//Drawing the canyon
function drawCanyon(t_canyon)
{
	fill(136, 136, 68);
	rect(t_canyon.x_pos, t_canyon.y_pos, t_canyon.width, 43);
	fill(204, 0, 0);
	rect(t_canyon.x_pos, t_canyon.y_pos+68, t_canyon.width, 76);
	fill(255, 0, 0)
	rect(t_canyon.x_pos, t_canyon.y_pos+43, t_canyon.width, 25);
	fill(163, 163, 117);
	triangle(t_canyon.x_pos, t_canyon.y_pos, t_canyon.x_pos, t_canyon.y_pos+144, 
		t_canyon.x_pos+15, t_canyon.y_pos+144);
	triangle(t_canyon.x_pos+t_canyon.width, t_canyon.y_pos, t_canyon.x_pos+t_canyon.width, t_canyon.y_pos+144, 
		t_canyon.x_pos+t_canyon.width-16, t_canyon.y_pos+144);
}
//Checking if player found a collectable, if yes, we increment the score
function checkCollectable(t_collectable)
{
	if (dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) <= 40){
		t_collectable.isFound = true;
		game_score += 1;
	}
}
//Checking if player falls through the canyon
function checkCanyon(canyon)
{
	if (gameChar_x >= canyon.x_pos && gameChar_x <= canyon.x_pos+canyon.width && gameChar_y == floorPos_y){
		isPlummeting = true;
		isFalling = true;	
	}
}
//Drawing the flagpole
function renderFlagpole() {
	strokeWeight(5);
	stroke(90)
	line(flagPole.x_pos, floorPos_y, flagPole.x_pos, floorPos_y-250);
	fill(51, 51, 51);
	noStroke();
	rect(flagPole.x_pos, floorPos_y-flagPole.y_flag_moving_up,flagPole.x_flag,flagPole.y_flag);
	if (flagPole.isReached) {
		if (flagPole.x_flag >= 70 && flagPole.y_flag >= 50) {return;}
		flagPole.y_flag_moving_up += 3;
		flagPole.x_flag += 0.75;
		flagPole.y_flag += 0.5;
	}	
}
//Checking if flagpole for end of map is being reached
function checkFlagpole() {
	if (dist(gameChar_x,floorPos_y-50,flagPole.x_pos,floorPos_y-50) < 60) {
		flagPole.isReached = true;	
		environmentSound.stop();
		winSound.play();	
	}
}
//Checking if player dies, removing one life from the array and calling the menu function to show options
function checkPlayerDie(enemyContact) {	
	if (gameChar_y > floorPos_y && gameChar_y < floorPos_y+9 
		&& (frameCount - lastCalled >= 30)) {	//FrameCount condition to avoid the logic being called twice one after the other (bug occurred when enemies killed the player, making it lose 2 lives instead of one, this increases the time between logic calls and cannot be called every frame)
		lives.splice(lives.length - 1, 1)
		//This sound will only play if player dies but still has lives, has logic to play the sound according to what killed you
		if (lives.length > 0) {
			dieSound.play();
			if(enemyContact) {
				enemyAttack.play();
			}
		}
		//This sound will only play if player has no more lives, has logic to play the sound according to what killed you
		if (lives.length < 1) {
			if(enemyContact) {
				environmentSound.stop();
				enemyGameOver.play();
			}
			environmentSound.stop();
			gameOver.play();
		}
		lastCalled = frameCount;
	}
	gameMenu();	
}
//Function that is called to set up everything and start the game once game lost or restart
function startGame() {	
	//Playing the environment sound and then loop it to infinite until paused
	environmentSound.play();
	environmentSound.loop();
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isJumping = false;
	playerGravity = false;
	cameraPosX = 0;
	lastCalled = 0;
	enemies = [];
	enemies.push(new Enemies(200,floorPos_y,100));
	enemies.push(new Enemies(1200,floorPos_y,200));
	enemies.push(new Enemies(2000,floorPos_y,100));
	enemies.push(new Enemies(2450,floorPos_y,100));
	enemies.push(new Enemies(3420,floorPos_y,60));
	enemies.push(new Enemies(3890,floorPos_y,200));
	enemies.push(new Enemies(4200,floorPos_y,200));
	platforms = [];
	onPlatform = false;	  //Needed to control the height of jump while on platform
	platforms.push(createPlatforms(2680,floorPos_y-100,160));
	platforms.push(createPlatforms(3180,floorPos_y-100,130));
	platforms.push(createPlatforms(3550,floorPos_y-100,60));
	platformMoveBack = false;
	powerJump = {	//Feature in game for character to be able to jump higher	
		limit: 280, 
		isFound: false,
		x_pos: 150,
		y_pos: floorPos_y - 20
	} 		
	collectables = [
		{x_pos: 300, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 890, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 1450, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 1700, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 2100, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 2550, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 3020, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 3400, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 3960, y_pos: 400, size: 0+random(-3,3), isFound: false},
		{x_pos: 4280, y_pos: 400, size: 0+random(-3,3), isFound: false}
	];
	for (var i = 0; i < collectables.length; i++){
		collectables[i].y_pos -= collectables[i].size //maintaining the height of the collectable when resizing
	}
	canyons = [
		{x_pos: 576, y_pos: 432, width:160},
		{x_pos: 980, y_pos: 432, width:135},
		{x_pos: 1500, y_pos: 432, width:180},
		{x_pos: 1800, y_pos: 432, width:160},
		{x_pos: 2600, y_pos: 432, width: 350},
		{x_pos: 3050, y_pos: 432, width: 300},
		{x_pos: 3500, y_pos: 432, width: 300}
	];
	treesPos_x = [200,500,800,1300,1450,1730,2100,2200,2400,2530,3000,3450,3900,4130,4300,4410]; //Pos X for trees
	treePos_y = floorPos_y;
	clouds = []
	//creating clouds through factory function
	var n = -350;
	for (var i = 0; i < 19; i++) {
		n += 250;
		clouds.push(createClouds(n,100));
	}	
	mountains = [
		{x_pos: 100, y_pos: 432, size: random(-20, 80)},
		{x_pos: 350, y_pos: 432, size: random(-20, 80)},
		{x_pos: 450, y_pos: 432, size: random(-20, 30)},
		{x_pos: 1350, y_pos: 432, size: random(-20, 60)},
		{x_pos: 1300, y_pos: 432, size: random(-40, 60)},
		{x_pos: 2100 , y_pos: 432, size: random(-20, 40)},
		{x_pos: 2350, y_pos: 432, size: random(-40, 80)},
		{x_pos: 2400, y_pos: 432, size: random(-40, 80)},
		{x_pos: 4000, y_pos: 432, size: random(-40, 80)},
		{x_pos: 4100, y_pos: 432, size: random(-40, 80)},
		{x_pos: 4350, y_pos: 432, size: random(-40, 80)}
	]
	game_score = 0;
	flagPole = {x_pos: 4400, isReached: false, x_flag: 10, y_flag: 10, y_flag_moving_up: 10}
	//menu object variables 
	menu = {x_pos: width/2-100, y_pos:height/2-100, x_size:300, y_size:220, buttons: [{label: "Start Game", x_pos: undefined, y_pos: undefined, width: 100, height: 50},
			{label: "Help", x_pos: undefined, y_pos: undefined, width: 100, height: 50},
			{label: "Go back", x_pos: undefined, y_pos: undefined, width: 60, height: 30}]};
	for (var i = 0; i < 2; i++) {
		menu.buttons[i].x_pos = menu.x_pos+menu.x_size/2-menu.buttons[i].width/2;
	}
	menu.buttons[2].x_pos = menu.x_pos+240;
	menu.buttons[0].y_pos = menu.y_pos+55;
	menu.buttons[1].y_pos = menu.y_pos+135;
	menu.buttons[2].y_pos = menu.y_pos+180;	
	clicked_help = false;
	helpButtonInGame = false;
	enemyAttackSound = false;
	enemyKillSoundPlayed = false;
	power = {
		x_pos: 800,
		y_pos: floorPos_y-20,
		isFound: false,
		isActive: false,
		count: 0,
		consumption: 40,
		powerBar: {
			x_pos: width-120,
			y_pos: 10,
			height: 10,
			length: 100
		},
		powerUpdate: function() {
			if(power.powerBar.length <= 99.9)
			power.powerBar.length += 0.1;
		}
	}	
}
// Function is called once isPlummeting is true, to show game menu for options
function gameMenu() {
	if (lives.length > 0 && !clicked_help && !helpButtonInGame) {	//Menu to show if lives are above 0, for respawn and help
		fill(140, 140, 140,220);
		rect(menu.x_pos+cameraPosX, menu.y_pos, menu.x_size, menu.y_size);
		for (var i = 0; i < menu.buttons.length-1; i++) {
			fill(51, 51, 51);
			rect(menu.buttons[i].x_pos+cameraPosX, menu.buttons[i].y_pos, menu.buttons[i].width, menu.buttons[i].height);				
		}
		textSize(25);
		fill(255);	
		text("You died!", menu.buttons[0].x_pos+cameraPosX, menu.y_pos+34);
		textSize(12);
		text("Respawn",menu.buttons[0].x_pos+cameraPosX+menu.buttons[0].width/2-25,menu.y_pos+84);
		text("Help", menu.buttons[1].x_pos+cameraPosX+menu.buttons[1].width/2-15,menu.buttons[1].y_pos+menu.buttons[1].height/2+5)
	}
	if (lives.length < 1 && !clicked_help && !helpButtonInGame) {	//Menu to show if lives are 0, to restart the game and help
		fill(140, 140, 140,220);
		rect(menu.x_pos+cameraPosX, menu.y_pos, menu.x_size, menu.y_size);
		for (var i = 0; i < menu.buttons.length-1; i++) {
			fill(51, 51, 51);
			rect(menu.buttons[i].x_pos+cameraPosX, menu.buttons[i].y_pos, menu.buttons[i].width, menu.buttons[i].height);
			fill(255);				
			textSize(12);
			text(menu.buttons[i].label,menu.buttons[i].x_pos+cameraPosX+15+i*20,menu.buttons[i].y_pos+30);			
		}
		textSize(25);
		fill(255);	
		text("GAME OVER!", menu.buttons[0].x_pos+cameraPosX-25, menu.y_pos+34);
		text("Total Score: " + game_score, menu.buttons[0].x_pos+cameraPosX-30,menu.y_pos+210);		
	}
	if (clicked_help) {	//Menu for HELP page, to show helpful information about the game
		fill(140, 140, 140,220);
		rect(menu.x_pos+cameraPosX,menu.y_pos,menu.x_size,menu.y_size);
		fill(51, 51, 51);
		rect(menu.buttons[2].x_pos+cameraPosX, menu.buttons[2].y_pos, menu.buttons[2].width, menu.buttons[2].height);
		textSize(12);
		text("Collect items and kill enemies to get points.", menu.x_pos+20+cameraPosX, menu.y_pos+25);
		text("Click on \"Respawn\\Start Game\" to play again.", menu.x_pos+20+cameraPosX, menu.y_pos+50);
		text("There is a special collectable that once collected,", menu.x_pos+20+cameraPosX, menu.y_pos+75);
		text("makes you jump higher.", menu.x_pos+20+cameraPosX, menu.y_pos+100);
		text("Find the red power artifact to kill enemies.", menu.x_pos+20+cameraPosX, menu.y_pos+125);
		text("To use your power to kill enemies, press F.", menu.x_pos+20+cameraPosX, menu.y_pos+150);
		text("Watch your power stamina, avoid them otherwise.", menu.x_pos+20+cameraPosX, menu.y_pos+175);
		fill(255);
		text("Go Back", menu.x_pos+menu.x_size-50+cameraPosX, menu.y_pos+menu.y_size-20);
		fill(0);
	}	
	if (helpButtonInGame) {
		fill(140, 140, 140,220);
		rect(menu.x_pos,menu.y_pos,menu.x_size,menu.y_size);
		fill(51, 51, 51);
		rect(menu.buttons[2].x_pos, menu.buttons[2].y_pos, menu.buttons[2].width, menu.buttons[2].height);
		textSize(12);
		text("Collect items and kill enemies to get points.", menu.x_pos+20, menu.y_pos+25);
		text("Click on \"Respawn\\Start Game\" to play again.", menu.x_pos+20, menu.y_pos+50);
		text("There is a special collectable that once collected,", menu.x_pos+20, menu.y_pos+75);
		text("makes you jump higher.", menu.x_pos+20, menu.y_pos+100);
		text("Find the red power artifact to kill enemies.", menu.x_pos+20, menu.y_pos+125);
		text("To use your power to kill enemies, press F.", menu.x_pos+20, menu.y_pos+150);
		text("Watch your power stamina, avoid them otherwise.", menu.x_pos+20, menu.y_pos+175);
		fill(255);
		text("Go Back", menu.x_pos+menu.x_size-50, menu.y_pos+menu.y_size-20);
		fill(0);
	}	
}
// function being called only once flagpole is reached, activating the WIN condition and menu to restart the game
function gameWin() {
	if (flagPole.isReached) {
		isLeft = false;
		isRight = false;
		fill(140, 140, 140,220);
		rect(menu.x_pos+cameraPosX, menu.y_pos, menu.x_size, menu.y_size);
		fill(51, 51, 51);
		rect(menu.buttons[0].x_pos+cameraPosX, menu.buttons[0].y_pos,menu.buttons[0].width, menu.buttons[0].height);
		fill(255);
		text("Play again", menu.buttons[0].x_pos+cameraPosX+18, menu.buttons[0].y_pos+30)
		textSize(24);
		text("Level COMPLETE!!", menu.x_pos+menu.x_size/2+cameraPosX-110, menu.y_pos+menu.y_size/2+40);
		text("Total Score: " + game_score, menu.buttons[0].x_pos+cameraPosX-30,menu.y_pos+210);
		textSize(12);
		for(var i = 0; i < enemies.length; i++) {
			enemies[i].inc = 0;
		}
	}
}
//Rendering the powerjump Object
function renderPowerjump() {
	if (!powerJump.isFound) {
		fill(0,80,255);
		ellipse(powerJump.x_pos, powerJump.y_pos, 20);
		fill(0,180,100,140);
		ellipse(powerJump.x_pos,powerJump.y_pos, 12)
		//creating the shake movement of the powerJump object, might not be the ideal approach but it works
		powerJump.x_pos += random(-1.5, 1.5);
		if (powerJump.x_pos < 148 || powerJump.x_pos > 152) {powerJump.x_pos = 150;}
		powerJump.y_pos += random(-1, 1);
		if (powerJump.y_pos < floorPos_y - 18 || powerJump.y_pos > floorPos_y - 22) {powerJump.y_pos = floorPos_y - 20;}
	}	
}
function drawGameCharacter() {
	if(isLeft && isFalling)
	{
		// add your jumping-left code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x - 6, gameChar_y - 50, 7, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x - 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 8, gameChar_y - 47, 16, 22);
		quad(gameChar_x - 3, gameChar_y - 45, gameChar_x - 3, gameChar_y - 35, gameChar_x - 22, gameChar_y - 60, gameChar_x - 18, gameChar_y - 60);
		fill(0, 51, 153);
		rect(gameChar_x - 8, gameChar_y - 25, 16, 10);
		rect(gameChar_x - 6, gameChar_y - 15, 5, 8);
		quad(gameChar_x - 2, gameChar_y - 15, gameChar_x + 6, gameChar_y - 15, gameChar_x - 2, gameChar_y - 10, gameChar_x - 12, gameChar_y - 10);
		fill(153, 102, 0);
		rect(gameChar_x - 6, gameChar_y - 7, 5, 7);
		quad(gameChar_x - 2, gameChar_y - 10, gameChar_x -12, gameChar_y -10, gameChar_x, gameChar_y - 5, gameChar_x + 10, gameChar_y -5);
		quad(gameChar_x + 8, gameChar_y - 47, gameChar_x - 8, gameChar_y - 47, gameChar_x, gameChar_y - 25, gameChar_x + 8, gameChar_y - 25);
		fill(122, 122, 82);
		quad(gameChar_x + 4, gameChar_y - 43, gameChar_x - 4, gameChar_y - 43, gameChar_x +4, gameChar_y - 20, gameChar_x + 8, gameChar_y - 20);
		fill(204, 204, 179);
		ellipse(gameChar_x + 5, gameChar_y - 22, 8, 7);
		ellipse(gameChar_x - 19, gameChar_y - 61, 7, 11);
	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x + 6, gameChar_y - 50, 7, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x + 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x + 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 8, gameChar_y - 47, 16, 22);
		quad(gameChar_x + 3, gameChar_y - 45, gameChar_x + 3, gameChar_y - 35, 
			gameChar_x + 22, gameChar_y - 60, gameChar_x + 18, gameChar_y - 60);
		fill(0, 51, 153);
		rect(gameChar_x - 8, gameChar_y - 25, 16, 10);
		rect(gameChar_x - 6, gameChar_y - 15, 5, 8);
		quad(gameChar_x + 2, gameChar_y - 15, gameChar_x - 6, gameChar_y - 15, 
			gameChar_x + 2, gameChar_y - 10, gameChar_x + 12, gameChar_y - 10);
		fill(153, 102, 0);
		rect(gameChar_x - 6, gameChar_y - 7, 5, 7);
		quad(gameChar_x + 2, gameChar_y - 10, gameChar_x +12, gameChar_y -10, 
			gameChar_x, gameChar_y - 5, gameChar_x - 10, gameChar_y -5);
		quad(gameChar_x + 8, gameChar_y - 47, gameChar_x - 8, gameChar_y - 47,
			gameChar_x - 8, gameChar_y - 25, gameChar_x, gameChar_y - 25);
		fill(122, 122, 82);
		quad(gameChar_x + 4, gameChar_y - 43, gameChar_x - 4, gameChar_y - 43, 
			gameChar_x - 8, gameChar_y - 20, gameChar_x - 4, gameChar_y - 20);
		fill(204, 204, 179);
		ellipse(gameChar_x - 5, gameChar_y - 22, 8, 7);
		ellipse(gameChar_x + 19, gameChar_y - 61, 7, 11);
	}
	else if(isLeft)
	{
		// add your walking left code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x - 6, gameChar_y - 50, 7, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x - 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 8, gameChar_y - 47, 16, 22);
		fill(0, 51, 153);
		rect(gameChar_x - 8, gameChar_y - 25, 16, 10);
		rect(gameChar_x - 7, gameChar_y - 15, 7, 10);
		rect(gameChar_x, gameChar_y - 15, 7, 10);
		fill(153, 102, 0);
		rect(gameChar_x - 7, gameChar_y - 6, 7, 6);
		rect(gameChar_x, gameChar_y - 6, 7, 6);
		quad(gameChar_x + 8, gameChar_y - 47, gameChar_x - 8, gameChar_y - 47, 
			gameChar_x, gameChar_y - 25, gameChar_x + 8, gameChar_y - 25);
		fill(122, 122, 82);
		quad(gameChar_x + 4, gameChar_y - 43, gameChar_x - 4, gameChar_y - 43, 
			gameChar_x - 18, gameChar_y - 25, gameChar_x - 14, gameChar_y - 25);
		fill(204, 204, 179);
		ellipse(gameChar_x - 15, gameChar_y - 28, 8, 7);
	}
	else if(isRight)
	{
		// add your walking right code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x + 6, gameChar_y - 50, 7, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x + 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x + 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 8, gameChar_y - 47, 16, 22);
		fill(0, 51, 153);
		rect(gameChar_x - 8, gameChar_y - 25, 16, 10);
		rect(gameChar_x - 7, gameChar_y - 15, 7, 10);
		rect(gameChar_x, gameChar_y - 15, 7, 10);
		fill(153, 102, 0);
		rect(gameChar_x - 7, gameChar_y - 6, 7, 6);
		rect(gameChar_x, gameChar_y - 6, 7, 6);
		quad(gameChar_x + 8, gameChar_y - 47, gameChar_x - 8, gameChar_y - 47, 
			gameChar_x - 8, gameChar_y - 25, gameChar_x, gameChar_y - 25);
		fill(122, 122, 82);
		quad(gameChar_x + 4, gameChar_y - 43, gameChar_x - 4, gameChar_y - 43, 
			gameChar_x + 14, gameChar_y - 25, gameChar_x + 18, gameChar_y - 25);
		fill(204, 204, 179);
		ellipse(gameChar_x + 15, gameChar_y - 28, 8, 7);
	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x, gameChar_y - 50, 10, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x - 5, gameChar_y - 59, 5);
		ellipse(gameChar_x + 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 59, 3);
		ellipse(gameChar_x + 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 10, gameChar_y - 47, 20, 30);
		quad(gameChar_x - 10, gameChar_y - 45, gameChar_x - 10, gameChar_y - 35, 
			gameChar_x - 22, gameChar_y - 65, gameChar_x - 18, gameChar_y - 65);
		quad(gameChar_x + 10, gameChar_y - 45, gameChar_x + 10, gameChar_y - 35, 
			gameChar_x + 20, gameChar_y - 25, gameChar_x + 22, gameChar_y - 30);
		fill(204, 204, 179);
		ellipse(gameChar_x - 19, gameChar_y - 63, 7, 11);
		ellipse(gameChar_x + 20, gameChar_y - 28, 7, 11);
		fill(0, 51, 153);
		rect(gameChar_x - 10, gameChar_y - 25, 20, 10);
		rect(gameChar_x - 10, gameChar_y - 15, 5, 12);
		rect(gameChar_x + 5, gameChar_y - 15, 5, 5);
		fill(153, 102, 0);
		rect(gameChar_x - 10, gameChar_y - 8, 5, 8);
		rect(gameChar_x + 5, gameChar_y - 15, 5, 8);
		quad(gameChar_x - 10, gameChar_y - 47, gameChar_x, gameChar_y - 47, 
			gameChar_x - 5, gameChar_y - 25, gameChar_x - 10, gameChar_y - 25);
		quad(gameChar_x + 10, gameChar_y - 47, gameChar_x, gameChar_y - 47, 
			gameChar_x + 5, gameChar_y - 25, gameChar_x + 10, gameChar_y - 25);
	}
	else
	{
		// add your standing front facing code
		//head
		fill(255, 255, 102);
		ellipse(gameChar_x, gameChar_y - 60, 22);
		fill(153, 102, 0);
		ellipse(gameChar_x, gameChar_y - 68, 22, 12);
		fill(255, 51, 0);
		arc(gameChar_x, gameChar_y - 55, 22, 20, 0, PI);
		fill(0);
		ellipse(gameChar_x, gameChar_y - 50, 10, 3);
		//eyes
		fill(255);
		ellipse(gameChar_x - 5, gameChar_y - 59, 5);
		ellipse(gameChar_x + 5, gameChar_y - 59, 5);
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 59, 3);
		ellipse(gameChar_x + 5, gameChar_y - 59, 3);
		//body
		fill(122, 122, 82);
		rect(gameChar_x - 10, gameChar_y - 47, 20, 30);
		quad(gameChar_x - 10, gameChar_y - 45, gameChar_x - 10, gameChar_y - 35, 
			gameChar_x - 14, gameChar_y - 21, gameChar_x - 17, gameChar_y - 28);
		quad(gameChar_x + 10, gameChar_y - 45, gameChar_x + 10, gameChar_y - 35, 
			gameChar_x + 14, gameChar_y - 21, gameChar_x + 17, gameChar_y - 28);
		fill(204, 204, 179);
		ellipse(gameChar_x - 16, gameChar_y - 25, 7, 11);
		ellipse(gameChar_x + 16, gameChar_y - 25, 7, 11);
		fill(0, 51, 153);
		rect(gameChar_x - 10, gameChar_y - 25, 20, 10);
		rect(gameChar_x - 10, gameChar_y - 15, 5, 12);
		rect(gameChar_x + 5, gameChar_y - 15, 5, 12);
		fill(153, 102, 0);
		rect(gameChar_x - 10, gameChar_y - 8, 5, 8);
		rect(gameChar_x + 5, gameChar_y - 8, 5, 8);
		quad(gameChar_x - 10, gameChar_y - 47, gameChar_x, gameChar_y - 47, 
			gameChar_x - 5, gameChar_y - 25, gameChar_x - 10, gameChar_y - 25);
		quad(gameChar_x + 10, gameChar_y - 47, gameChar_x, gameChar_y - 47, 
			gameChar_x + 5, gameChar_y - 25, gameChar_x + 10, gameChar_y - 25);
	}
}
function drawPlayerHUD() {
	textSize(12);
	fill(0);
	text("Points: "+ game_score,10,20);
	text("For \"Help\" menu press \"H\"", width/2-50,20);
	text("Lives: ",10,40);
	for (var i = 0; i < lives.length; i++) {
		fill(79, 79, 79);
		quad(60+i*25,25,
			70+i*25,35,
			60+i*25,45,
			50+i*25,35)
		fill(77, 121, 255, 210);
	}
	if(power.isFound) {
		fill(0);
		text("Your power stamina: ",power.powerBar.x_pos-120, power.powerBar.y_pos+10);
		fill(255,0,0);
		rect(power.powerBar.x_pos, power.powerBar.y_pos,power.powerBar.length,power.powerBar.height);
	}
	power.powerUpdate();
	//Displaying a message if power stamina is low and power cannot be used
	if (key == "f" && !isPlummeting && power.powerBar.length <= power.consumption && power.isFound) {
		textSize(20);
		fill(255);
		text("Your power stamina is low, wait for recharge!",width/2-180,height/2);
	}
}
function createPlatforms(x, y, length) {
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function() {
			fill(255,0,255);
			rect(this.x,this.y,this.length,20);
		},
		checkContact: function(gc_x, gc_y) {
			if(gc_x > this.x && gc_x < this.x+this.length) {
				var d = this.y-gc_y;
				if(d >= -2 && d <= 3) {
					return true;
				}
				return false;
			}
		}
	}
	return p;
}
//Factory function to create clouds
function createClouds(x,y,) {
	var cloud = {
		x_pos: undefined,
		y_pos: undefined,
		size: undefined,
		setup: function(x,y,) {
			this.x_pos = x + random(20,140);
			this.y_pos = y + random(-50,50);
			this.size = random(0.6, 1.4)
		}
	}
	cloud.setup(x,y,size);
	return cloud;
}
//Constructor function for enemies
function Enemies(x,y,range) {
	this.x_pos = x;
	this.y_pos = y;
	this.range = range;
	this.isHit = false;
	this.currentX = x;
	this.inc = 1;
	this.update = function() {
		this.currentX += this.inc;
		if(this.currentX >= this.x_pos + this.range) {
			this.inc = -1;
		}
		else if(this.currentX < this.x_pos) {
			this.inc = 1;
		}
	}
	this.draw = function() {
		this.update();
		if(this.inc == -1) {
			fill(89, 89, 89);
			ellipse(this.currentX,this.y_pos-60,25);
			fill(255);
			ellipse(this.currentX-4,this.y_pos-62,4);
			fill(0);
			beginShape();
			vertex(this.currentX-9,this.y_pos-48);
			vertex(this.currentX-12,this.y_pos);
			vertex(this.currentX+12,this.y_pos);
			vertex(this.currentX+9,this.y_pos-48);
			vertex(this.currentX+15,this.y_pos-67);
			vertex(this.currentX+12,this.y_pos-70);
			vertex(this.currentX,this.y_pos-74);
			vertex(this.currentX,this.y_pos-58);	
			endShape();
		}
		else if(this.inc == 1) {
			fill(89, 89, 89);
			ellipse(this.currentX,this.y_pos-60,25);
			fill(255);
			ellipse(this.currentX+4,this.y_pos-62,4);
			fill(0);
			beginShape();
			vertex(this.currentX+9,this.y_pos-48);
			vertex(this.currentX+12,this.y_pos);
			vertex(this.currentX-12,this.y_pos);
			vertex(this.currentX-9,this.y_pos-48);
			vertex(this.currentX-15,this.y_pos-67);
			vertex(this.currentX-12,this.y_pos-70);	
			vertex(this.currentX,this.y_pos-74);
			vertex(this.currentX,this.y_pos-58);		
			endShape();
		}
	}
	this.checkContact = function(gc_x,gc_y) {
		var d = dist(gc_x,gc_y,this.currentX,this.y_pos);
		if(d < 45) {
			return true;
		}
		return false;
	}
}
function renderPower() {
	if (!power.isFound) {
		fill(255,0,0);
		beginShape();
		vertex(power.x_pos-10,power.y_pos);
		vertex(power.x_pos+10,power.y_pos);
		vertex(power.x_pos+10,power.y_pos-10);
		vertex(power.x_pos,power.y_pos-20);
		vertex(power.x_pos-10,power.y_pos-20);
		endShape();
		fill(0);
		stroke(0);
		strokeWeight(1);
		line(power.x_pos-6,power.y_pos-17,power.x_pos+6,power.y_pos-6);
		line(power.x_pos-6,power.y_pos-12,power.x_pos+2,power.y_pos-5);
		line(power.x_pos-6,power.y_pos-6,power.x_pos-2,power.y_pos-3);
		noStroke();
	}
	//Logic of the power once player is close to an enemy, how it is drawn and what sound is played, etc
	if (power.isActive && !isPlummeting && !flagPole.isReached) {
		stroke(random(0,255));
		strokeWeight(5);
		if(!enemyKillSoundPlayed) {
			enemyKill.play();
			game_score += 5;
		}
		enemyKillSoundPlayed = true;
		for(var i = 0; i < enemies.length; i++) {	
			//randomizing the numbers, will give an illusion of the lines moving while the power is rendered		
			var d = abs(gameChar_x - enemies[i].currentX) <= 100;
			if(gameChar_x > enemies[i].currentX && d) {
				line(gameChar_x-100,gameChar_y-80,gameChar_x-20,gameChar_y-random(30,50));
				line(gameChar_x-100,gameChar_y,gameChar_x-20,gameChar_y-random(30,50));
				line(gameChar_x-50,gameChar_y-55,gameChar_x-70,gameChar_y-random(30,50));
				line(gameChar_x-70,gameChar_y-65,gameChar_x-120,gameChar_y-random(55,75));
				line(gameChar_x-50,gameChar_y-25,gameChar_x-110,gameChar_y-random(40,60));
				enemies[i].isHit = true;				
			}
			else if(gameChar_x < enemies[i].currentX && d) {
				line(gameChar_x+100,gameChar_y-80,gameChar_x+20,gameChar_y-random(30,50));
				line(gameChar_x+100,gameChar_y,gameChar_x+20,gameChar_y-random(30,50));
				line(gameChar_x+50,gameChar_y-55,gameChar_x+70,gameChar_y-random(30,50));
				line(gameChar_x+70,gameChar_y-65,gameChar_x+120,gameChar_y-random(55,75));
				line(gameChar_x+50,gameChar_y-25,gameChar_x+120,gameChar_y-random(20,40));
				enemies[i].isHit = true;
			}
		}
		noStroke();
	}
}