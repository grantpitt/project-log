// resolution 
const rows = 60;
const cols = 80;

const SRT = 2.50662827463;

// points per class and an array to hold them all
const numPoints = 20; 
let dataSet = [];

// initiallize the paramteters 
let classes = 1;
document.getElementById('curBW').innerText = '0.10';

// calculate the dimensions of container and then cells
const cc = document.getElementById('canvasContainer');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;
let cellW = WIDTH / cols;
let cellH = HEIGHT / rows;

// the list of colors and background colors to use
const colors = ['rgb(23, 121, 254)'];

// function the add the points from each class to our dataset
function addPoints(num) {
    // randomSeed(20);
    for (let c = 0; c < classes; c++) {
        let cx = random(-0.7, 0.7);
        let cy = random(-0.7, 0.7);
        // for appropriate clustering explaination, see link
        // https://blogs.sas.com/content/iml/2016/03/30/generate-uniform-2d-ball.html
        for (let i = 0; i < num; i++) {
            let r = 0.3 * sqrt(random()); 
            let theata = TAU * random();
            dataSet.push({
                x: random(-0.8, 0.8),
                y: 0,
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

    // noLoop();
}

let h = 0.1;
function draw() {
    background(248);

    // calculate the distributons
    let DB0 = [];
    for (let c = 0; c < classes; c++) {
        let DB1 = [];
        for (let d of ['x', 'y']) {
            let m = getMu(d, c);
            let s = getSimga(m, d, c);
            DB1.push([m, s]);
        }
        DB0.push(DB1);
    }

    // for each point, draw a dristribution centered at it
    strokeWeight(3);
    stroke(220);
    noFill();
    for (let p of dataSet) {
        beginShape();
        for (let i = (p.x - 0.3); i <= (p.x + 0.3); i += 0.01) {
            vertex(mapX(i), mapY(f(i, p.x, 0.1) * 0.05));
        } 
        endShape();
    }

    // graph the kernal density estimation over all the points
    stroke(23, 121, 254);
    beginShape();
    for (let x = -1; x <= 1.1; x += 0.005) {
        let sum = 0;
        for (let p of dataSet) {
            sum += (f((x), p.x, h));
        }
        // console.log(x, sum);
        // vertex(mapX(x),  mapY((sum / (dataSet.length))));
        vertex(mapX(x),  mapY( sqrt(h) * (sum / dataSet.length)));
    }
    endShape();

    // draw grid
    strokeWeight(2);
    stroke(47);
    line(0, mapY(0), mapX(1), mapY(0));
    // line(mapX(0), mapY(1), mapX(0), mapY(-1));

    // display each data point and handle moving points
    cursor(ARROW);
    stroke(47)
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(8)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = 0;
        }
        fill(colors[p.label])
        circle(mapX(p.x), mapY(p.y), 16);
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

// the implementaion of GNB
// pass it a dimension (x or y) and a label (0, 1 ..n)
function getMu(alpha, c) {
    let n = 0;
    let sum = 0;
    for (let p of dataSet) {
        if (p.label == c) {
            n++;
            sum += p[alpha];
        }
    }
    return sum / n;
}

function getSimga(Mu, alpha, c) {
    let n = 0;
    let sum = 0;
    for (let p of dataSet) {
        if (p.label == c) {
            n++;
            sum += sq(p[alpha] - Mu);
        }
    }
    return (15 * sum) / n;
}

function f(feature, Mu, Sigma) {
    return ((1/(Sigma * SRT)) * Math.exp((-1/2) * sq((feature - Mu) / Sigma)));
}

function updateRule() {
    let val = parseFloat(document.getElementById('bandwidth').value);
    h = val;
    document.getElementById('curBW').innerText = val.toFixed(2);
}

document.getElementById('bandwidth').addEventListener('input', updateRule);


document.getElementById('new').addEventListener('click', () => {
    start();
}, false);
