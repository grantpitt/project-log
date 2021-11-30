// resolution 
const rows = 60;
const cols = 80;

// points per class and an array to hold them all
const numPoints = 10; 
let dataSet = [];

// initiallize the paramteters 
let k = '1';
setK(k);
let classes = 3;
let metric = 'L2';
setMetric(metric);

// calculate the dimensions of container and then cells
const cc = document.getElementById('canvasContainer');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;
let cellW = WIDTH / cols;
let cellH = HEIGHT / rows;

// the list of colors and background colors to use
const colors = ['rgb(25, 159, 255)',
                'rgb(255, 84, 175)',
                'rgb(126, 237, 47)',
                'rgb(255, 174, 43)'];
const backColors = ['rgba(25, 159, 255, 0.5)',
                    'rgba(255, 84, 175, 0.5)',
                    'rgba(126, 237, 47, 0.5)',
                    'rgba(255, 174, 43, 0.5)'];

// function the add the points from each class to our dataset
function addPoints(num) {
    for (let c = 0; c < classes; c++) {
        let cx = random(-0.75, 0.75);
        let cy = random(-0.75, 0.75);
        // for appropriate clustering explaination, see link
        // https://blogs.sas.com/content/iml/2016/03/30/generate-uniform-2d-ball.html
        for (let i = 0; i < num; i++) {
            let r = 0.25 * sqrt(random()); 
            let theata = TAU * random();
            dataSet.push({
                x: cx + (r * cos(theata)),
                y: cy + (r * sin(theata)),
                label: c,
                moving: false
            });
        }
    }
}

// a start function to be called when certain perameters change
function start() {
    dataSet = [];
    addPoints(numPoints);
}

// the points and calculation are done in a (-1, 1) grid but the pixel dimensions change
let mapX;
let mapY;
function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    start();

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);
}

function draw() {
    background(231, 229, 229);

    // fill each pixel section to the appropriate label
    noStroke();
    for (let i = 0.02; i < rows; i++) {
        for (let j = 0.02; j < cols; j++) {
            const label = getLabel(map(j, 0, cols, -1, 1), map(i, rows, 0, -1, 1));
            // if there is no majority, color is white
            if (label == -1) {
                fill('rgba(255, 255, 255, 0.5)');
            } else {
                fill(backColors[label]);
            }
            rect(cellW * j, cellH * i, cellW, cellH);
        }
    }

    // display each data point and handle moving points
    cursor(ARROW);
    stroke(47)
    strokeWeight(3);
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(6)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = map(mouseY, HEIGHT, 0, -1, 1);
        }
        fill(colors[p.label])
        circle(mapX(p.x), mapY(p.y), 12);
    }
}

function windowResized() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    cellW = WIDTH / cols;
    cellH = HEIGHT / rows;
    resizeCanvas(WIDTH, HEIGHT);
}

// handle moving points
function mousePressed() {
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(10)) {
            p.moving = true;
            return;
        }
    }
}

function mouseReleased() {
    for (let p of dataSet) {
        p.moving = false;
    }
}

// the implementaion of kNN algorithm
function getLabel(x, y) {
    // initialize our list of closest neighbors
    let closest = [];
    for (let i = 0; i < k; i++) {
        closest.push({
            distance: 3,
            label: 1
        })
    }
    // go through the dataset to find the kNN
    for (let p of dataSet) {
        let d;
        // distance metric will either be manhattan or euclidean
        if (metric == 'L1') {
            d = abs(p.x - x) + abs(p.y - y);
        } else if (metric == 'L2') {
            d = (sq(p.x - x) + sq(p.y - y));
        }
        // check each pos in closest list
        for (let rank = 0; rank < k; rank++) {
            if (d < closest[rank].distance) {
                // handle a new closest
                closest.splice(rank, 0, {
                    distance: d,
                    label: p.label
                });
                closest.pop();
                break;
            }
        }
    }
    // initialize a tally
    const tally = [];
    for (let j = 0; j < classes; j++) {
        tally.push(0);
    }
    // tally up
    for (let p of closest) {
        tally[p.label]++;
    }
    // find the winner
    for (let l = 0; l < classes; l++) {
        if (tally[l] > Math.floor(k / 2)) {
            return l;
        }
    }
    // if there was no winner
    return -1;
}

// handle the css of which button is selected
function flip(selection, options) {
    for (let option of options) {
        if (option == selection) {
            document.getElementById(option).className = 'pressed';
        } else {
            document.getElementById(option).className = '';
        }
    }
}

// set parameter functions
function setK(val) {
    k = val;
    flip(val, ['1', '3', '5']);
}
function setMetric(val) {
    metric = val;
    flip(val, ['L1', 'L2']);
}

document.getElementById('new').addEventListener('click', () => {
    start();
}, false);

// Neighbors (k)
document.getElementById('1').addEventListener('click', () => setK('1'));
document.getElementById('3').addEventListener('click', () => setK('3'));
document.getElementById('5').addEventListener('click', () => setK('5'));

// metric (manhattan vs euclidean)
document.getElementById('L1').addEventListener('click', () => setMetric('L1'));
document.getElementById('L2').addEventListener('click', () => setMetric('L2'));

// adding and removing classes
document.getElementById('add').addEventListener('click', () => {
    if (classes < 4) {
        classes++;
        start();
    }
});
document.getElementById('take').addEventListener('click', () => {
    if (classes > 2) {
        classes--;
        start();
    }
});