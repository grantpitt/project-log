// resolution 
const rows = 60;
const cols = 80;

const SRT = 2.50662827463;

// points per class and an array to hold them all
const numPoints = 10; 
let dataSet = [];

// initiallize the paramteters 
let classes = 3;
let KDE = true;
flip('kdeOn', ['kdeOn', 'kdeOff']);
let Gaussian = true;
flip('gaussianOn', ['gaussianOn', 'gaussianOff']);
document.getElementById('curBW').innerText = '0.10';
let recalculate = true;

// calculate the dimensions of container and then cells
const cc = document.getElementById('cc');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;
let cellW = WIDTH / cols;
let cellH = HEIGHT / rows;

// the list of colors and background colors to use
const colors = ['rgb(43, 177, 255)',
                'rgb(255, 84, 175)',
                'rgb(126, 237, 47)',
                'rgb(255, 174, 43)'];

const backColors = ['rgba(43, 177, 255, 0.45)',
                    'rgba(255, 84, 175, 0.45)',
                    'rgba(126, 237, 47, 0.45)',
                    'rgba(255, 174, 43, 0.45)'];

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
                x: cx + ( 0.75 * r * cos(theata)),
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
    recalculate = true;
}

// the points and calculation are done in a (-1, 1) grid but the pixel dimensions change
let mapX;
let mapY;
function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('cc');

    start();

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);
}

let h = 0.1;
function draw() {

    if (recalculate) {
        console.log('recalibrating');
        background(240);
        if (Gaussian) {
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
            // fill each pixel section to the appropriate label
            noStroke();
            for (let i = 0.02; i < rows; i++) {
                for (let j = 0.02; j < cols; j++) {
    
                    let winner = {
                        p: -1,
                        label: -1
                    }
                    for (let c = 0; c < classes; c++) {
                        const prob = 0.5 * f(map(j, 0, cols, -1, 1), DB0[c][0][0], DB0[c][0][1]) * f(map(i, rows, 0, -1, 1), DB0[c][1][0], DB0[c][1][1]);
                        if (prob > winner.p) {
                            winner.p = prob;
                            winner.label = c;
                        }
                    }
       
                    if (winner.p > 0.1) {
                        fill(backColors[winner.label]);
                        rect(cellW * j, cellH * i, cellW, cellH);
                    }
                }
            }
        }
    
    
        if (KDE) {
            for (let i = 0.02; i < rows; i++) {
                for (let j = 0.02; j < cols; j++) {
            
                    let x = map(j, 0, cols, -1, 1);
                    let y = map(i, rows, 0, -1, 1);
                    
                    let w = {
                        prob: -1,
                        class: -1
                    }
        
                    for (let c = 0; c < classes; c++) {
                        let p = getProb(x, y, c);
                        if (p > w.prob) {
                            w.prob = p;
                            w.class = c;
                        }
                    }
                    noStroke();
                    // console.log(w.prob);
                    if (w.prob > 0.1) {
                        fill(backColors[w.class]);
                        rect(cellW * j, cellH * i, cellW, cellH);
                    }
                }
            }
        }
    }
    recalculate = false;

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
            recalculate = true;
        }
        fill(colors[p.label])
        circle(mapX(p.x), mapY(p.y), 12);
    }

}

function getProb(x_feat, y_feat, c) {
    let xSum = 0;
    let ySum = 0;
    for (let p of dataSet) {
        if (p.label == c) {
            xSum += (f((x_feat), p.x, h));
            ySum += (f((y_feat), p.y, h));
        }
    }
    return sqrt(h) * ((xSum / numPoints) * (ySum / numPoints));
}

function windowResized() {
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    cellW = WIDTH / cols;
    cellH = HEIGHT / rows;
    resizeCanvas(WIDTH, HEIGHT);
    recalculate = true;
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

function updateRule() {
    let val = parseFloat(document.getElementById('bandwidth').value);
    h = val;
    document.getElementById('curBW').innerText = val.toFixed(2);
    recalculate = true;
}

document.getElementById('bandwidth').addEventListener('input', updateRule);


document.getElementById('new').addEventListener('click', () => {
    start();
}, false);


document.getElementById('gaussianOn').addEventListener('click', () => {
    Gaussian = true;
    flip('gaussianOn', ['gaussianOn', 'gaussianOff']);
    recalculate = true;
});
document.getElementById('gaussianOff').addEventListener('click', () => {
    Gaussian = false;
    flip('gaussianOff', ['gaussianOn', 'gaussianOff']);
    recalculate = true;
});

document.getElementById('kdeOn').addEventListener('click', () => {
    KDE = true;
    flip('kdeOn', ['kdeOn', 'kdeOff']);
    recalculate = true;
});
document.getElementById('kdeOff').addEventListener('click', () => {
    KDE = false;
    flip('kdeOff', ['kdeOn', 'kdeOff']);
    recalculate = true;
});
