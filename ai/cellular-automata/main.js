/* Brian's Brain. A Cellular AUtomata project in processing.js
 * By Robin Hu
 * (C) 2013
 * */

// DOM
const canvasContainer = document.getElementById('canvasContainer');


//Globals
const PIXEL_WIDTH = 4;	//specify how big you want each pixel.
let CANVAS_WIDTH = Math.floor(canvasContainer.offsetWidth / PIXEL_WIDTH) * PIXEL_WIDTH;	
let CANVAS_HEIGHT = Math.floor((CANVAS_WIDTH * 0.75) / PIXEL_WIDTH) * PIXEL_WIDTH;
let PWIDTH = Math.ceil(CANVAS_WIDTH/PIXEL_WIDTH);
let PHEIGHT = Math.ceil(CANVAS_HEIGHT/PIXEL_WIDTH);

let WORLD_A;
let WORLD_B;

let RULE_SURVIVE = [];
let RULE_BIRTH = [];
let RULE_GENS;
const MAX_GENS = 20;

// color STATE_COLORS[];
let STATE_COLORS = [];

//Setup the canvas.
function setup() {
    let cnv = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cnv.parent('canvasContainer');
	noStroke();
	frameRate(30);

	//Initialize memory array where we will store the grid data.
    WORLD_A = Array(PWIDTH).fill().map(() => Array(PHEIGHT).fill(0));
    WORLD_B = Array(PWIDTH).fill().map(() => Array(PHEIGHT).fill(0));
	// WORLD_A = new int[PWIDTH][PHEIGHT];
	// WORLD_B = new int[PHEIGHT][PHEIGHT];

	//Randomize the grid in the beginning.
	for (let x = 0; x < PWIDTH; x++) {
		for (let y = 0; y<PHEIGHT; y++) {
			if (random(0, 100) > 50)
			    WORLD_B[x][y] = 1;
		}
	}

    document.getElementById('rule').value = '345/24/25';

	STATE_COLORS = [color(230, 25, 75), color(247, 204, 64), color(0, 130, 200)];
	// shuffleArray(STATE_COLORS)
    for(let i = 0; i < 20; i++) {
		STATE_COLORS.push(color(random(0, 255), random(0, 255), random(0, 255)));
	}
	parseRule("345/24/25");
	noLoop();
}

//Main draw loop. Is called continuously.
function draw() {
	background(14);
	//This loop renders the pixels on the canvas.
	////Depending on the state of a cell, a different colored pixel is generated.
	for(let x = 0; x < PWIDTH; x++) {
	   for(let y = 0; y < PHEIGHT; y++) {
		let currentState = WORLD_B[x][y];
		if (currentState > 0) {
		     drawPoint(x,y, STATE_COLORS[currentState]);
		     WORLD_A[x][y] = currentState;
		}
		else if (currentState <= 0) {
		     WORLD_A[x][y] = currentState;
		}
		WORLD_B[x][y] = 0;
	   }
	}

	//This loop calculates the next generation of cells.
	//Cellular Automata rules should be specified here.
	for(let x=0; x < PWIDTH; x++) {
            for(let y=0; y < PHEIGHT; y++) {
		let currentState = WORLD_A[x][y];

		if ( currentState == 0) {
			let neighborsOn = calcNeighbors(x,y);
			if (ruleContains(neighborsOn, RULE_BIRTH))
				WORLD_B[x][y] = 1;
		}
		else if ( currentState > 0 && (currentState < (RULE_GENS - 1) || RULE_GENS == 2) ) {
			
			let neighborsOn = (RULE_SURVIVE.length == 0) ? 0 : calcNeighbors(x,y);
			let shouldSurvive = ruleContains(neighborsOn, RULE_SURVIVE);
			if (currentState == 1 && shouldSurvive) {
				WORLD_B[x][y] = currentState;
			}
			else if (!shouldSurvive) {
				    WORLD_B[x][y] = (currentState + 1) % RULE_GENS;
			}

			if ( currentState > 1)
				WORLD_B[x][y] = currentState + 1;
		}
		else if (currentState >= (RULE_GENS - 1)) {
			WORLD_B[x][y] = 0;
		}
		



	    }
	}
	
}

//Given a cell, how many neighbors are in the "on" state?
function calcNeighbors(x, y) {
	let totalSum = 0;
	const xLeft = (x + PWIDTH - 1) % PWIDTH;
	const xRight = (x + 1) % PWIDTH;
	const yTop = (y + PHEIGHT -1) % PHEIGHT;
	const yBottom = (y + 1) % PHEIGHT;
	
	if (WORLD_A[xLeft][yTop] == 1) totalSum++;
	if (WORLD_A[x][yTop] ==1 ) totalSum++;
	if (WORLD_A[xRight][yTop] ==1 ) totalSum++;
	if (WORLD_A[xLeft][y] ==1 ) totalSum++;
	if (WORLD_A[xRight][y] ==1 ) totalSum++;
	if (WORLD_A[xLeft][yBottom] ==1 ) totalSum++;
	if (WORLD_A[x][yBottom] ==1 ) totalSum++;
	if (WORLD_A[xRight][yBottom] ==1 ) totalSum++;

	return totalSum;
}

//Sets all cells to zero state.
function clearWorld() {
	for(let x=0; x < PWIDTH; x++) {
		for(let y=0; y < PHEIGHT; y++) {
			WORLD_B[x][y] = 0;
		}
	}
}

//Randomly add pixels to the world
function randomizeWorld() {
	for(let x=0; x < PWIDTH; x++) {
		for(let y=0; y < PHEIGHT; y++) {
			WORLD_B[x][y] = (random(0,100) > 50) ? 1 : 0;
		}
	}
}

/* This places a square point somewhere on the canvas, at location X,Y.
 * */
function drawPoint(x, y, c) {
	fill(c);
	rect(x*PIXEL_WIDTH,y*PIXEL_WIDTH,PIXEL_WIDTH,PIXEL_WIDTH);
}


//Parse rule. Rule format is S/B/G, (Survival rule/Birth Rule/# of generations)
//Example rules: /2/3 Brian's Brain
//  345/2/4  Star Wars
//  23/3/2   Conway's Life
function parseRule(rule) {
    const parts = rule.split('/');
	// String[] parts = split(rule, "/");

	if (parts.length != 3) {
		console.log("Rule: " + rule + " is not in correct format.");
		return;
	}

    const surviveList = parts[0].split('');
	// int[] surviveList = split(parts[0], "");
    const birthList = parts[1].split('');
	// int[] birthList = split(parts[1], "");
    const generations = Number(parts[2]);
	// int generations = int(parts[2]);
	if (generations < 2) {
		console.log("Cannot have rule where the number of generations is less than 2.");
		return;
	}
	RULE_GENS = Math.min(MAX_GENS, int(parts[2]));

	RULE_SURVIVE = [];
	RULE_BIRTH = [];
	//Apply rules to global variables.
	for(let i=0; i < surviveList.length; i++) {
		RULE_SURVIVE.push(surviveList[i]);
	}

	for(let i=0; i < birthList.length; i++) {
		RULE_BIRTH.push(birthList[i]);
	}

	//Special case where if the # of generations is 2.
	//There will be cells left that are in state, 2,3,4, etc.
	//Remove those cells as they are not needed.
	if (RULE_GENS == 2) {
		for(let x=0; x < PWIDTH; x++) {
			for(let y=0; y < PHEIGHT; y++) {
				if (WORLD_B[x][y] > 1) {
					WORLD_B[x][y] = 0;
				}
			}
		}
	}

}

//Returns true if the array contains the value 'n'.
function ruleContains(n, rule) {
	for(let i=0; i < rule.length; i++) {
		if ( rule[i] == n )
			return true;
	}
	return false;
}

// prevent the right click menu default behavior
canvasContainer.addEventListener('contextmenu', function (e) { 
    // do something here... 
    e.preventDefault(); 
}, false);

//Called when user drags mouse over canvas. This will let you draw pixels.
function mouseDragged() {
	const xPos = Math.ceil(mouseX / PIXEL_WIDTH);
	const yPos = Math.ceil(mouseY / PIXEL_WIDTH);
	const xPosPrev = Math.ceil(pmouseX / PIXEL_WIDTH);
	const yPosPrev = Math.ceil(pmouseY / PIXEL_WIDTH);

	const pixelType = (mouseButton == LEFT) ? 1 : 0;
	WORLD_B[xPos][yPos] = pixelType;
	WORLD_B[xPos+1][yPos] = pixelType;
	WORLD_B[xPos][yPos+1] = pixelType;
	WORLD_B[xPosPrev][yPosPrev] = pixelType;
    return false;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// EVENT LISTENERS
document.getElementById('changeColors').addEventListener('click', () => {
    const nextColorBatch = []
    for(let i = 0; i < 20; i++) {
		nextColorBatch.push(color(random(0, 255), random(0, 255), random(0, 255)));
	}
    STATE_COLORS = nextColorBatch;
});

// HIS EVENT LISTENERS
document.getElementById('start').addEventListener('click', () => loop());
document.getElementById('stop').addEventListener('click', () => noLoop());
document.getElementById('clear').addEventListener('click', clearWorld);
document.getElementById('randomize').addEventListener('click', randomizeWorld);
document.getElementById('rule').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        parseRule(e.target.value);
    }
});

document.getElementById('famousRules').addEventListener('change', (e) => {
    document.getElementById('rule').value = e.target.value;
    parseRule(e.target.value);
});
