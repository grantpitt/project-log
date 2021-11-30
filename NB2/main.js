
// DOM Elements
// --------------------
const canvasContainer = document.getElementById('canvasContainer');
// Moving the data points shouldn't scroll
canvasContainer.addEventListener('touchmove', (event) => {
    event.preventDefault();
}, false);
const currentBandwidth = document.getElementById('curBW');


// Objects to hold current parameters and other attributes of the demo
// ---------------------------------------------------------------------
let canvas = {};
canvas.width = canvasContainer.offsetWidth,
canvas.height = canvas.width  * 0.75;
canvas.rows = 60;
canvas.cols = 80;
canvas.cellWidth = canvas.width / canvas.cols;
canvas.cellHeight = canvas.height / canvas.rows;
// The points and calculation are done in a (-1, 1) grid but the canvas dimensions change
canvas.mapX = (x) => map(x, -1, 1, 0, canvas.width);
canvas.mapY = (y) => map(y, -1, 1, canvas.height, 0);

let demo = {};
demo.classes = 3;
demo.pointsPerClass = 10;
demo.dataSet = [];
demo.kde = true;
demo.bw = 0.10;
demo.gaussian = true;
demo.recalculate = true;
demo.pointColors = ['rgb(43, 177, 235)',
                    'rgb(255, 84, 175)',
                    'rgb(126, 217, 47)',
                    'rgb(245, 174, 43)'];
demo.cellColors = ['rgba(43, 177, 235, 0.45)',
                   'rgba(255, 84, 175, 0.45)',
                   'rgba(126, 217, 47, 0.45)',
                   'rgba(245, 174, 43, 0.45)'];


// Squre root of Tau
const SRT = 2.50662827463;

// Classes to hold the paramters of each distribution
let gaussianParameters = [];




// Function the add the points from each class to our dataset
function setPoints() {
    // randomSeed(20);
    for (let c = 0; c < demo.classes; c++) {
        const cx = random(-0.7, 0.7);
        const cy = random(-0.7, 0.7);
        // For appropriate clustering explaination, see link
        // https://blogs.sas.com/content/iml/2016/03/30/generate-uniform-2d-ball.html
        for (let i = 0; i < demo.pointsPerClass; i++) {
            let r = 0.3 * sqrt(random()); 
            let theata = TAU * random();
            demo.dataSet.push({
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
    demo.dataSet = [];
    setPoints();
    demo.recalculate = true;
}


function setup() {
    let cnv = createCanvas(canvas.width, canvas.height);
    cnv.parent('canvasContainer');

    start();

    flip('kdeOn', ['kdeOn', 'kdeOff']);
    flip('gaussianOn', ['gaussianOn', 'gaussianOff']);
    currentBandwidth.innerText = '0.10';

    // frameRate(0.5);
}


// let h = 0.1;
function draw() {

    if (demo.recalculate) {
        demo.drawPoints = true;
        console.log('recalibrating');
        background(248);
        if (demo.gaussian) {
            // calculate the distributons
            let DB0 = [];
            gaussianParameters = [];
            for (let c = 0; c < demo.classes; c++) {
                let DB1 = [];
                let classGaussianParameters = {};
                for (let d of ['x', 'y']) {
                    let m = getMu(d, c);
                    let s = getSimga(m, d, c);
                    classGaussianParameters.mu = m;
                    classGaussianParameters.sigma = s;
                    DB1.push([m, s]);
                }
                gaussianParameters.push(classGaussianParameters);
                DB0.push(DB1);
            }

            // ****EXPIREMENTAL *****
            // for (let p of demo.dataSet) {
            //     const classification = classify(p);
            //     if (classification > 0.1) {
            //         fill(demo.cellColors[classification]);
            //         rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
            //     }
            // }














            // fill each pixel section to the appropriate label
            noStroke();
            for (let i = 0.02; i < canvas.rows; i++) {
                for (let j = 0.02; j < canvas.cols; j++) {


                    // ****EXPIREMENTAL*****
                    const point = {
                        x: map(j, 0, canvas.cols, -1, 1),
                        y: map(i, canvas.rows, 0, -1, 1)
                    }
                    const classification = classify(point);
                    fill(demo.cellColors[classification]);
                    rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
                    if (classification > 0.1) {
                        // fill(demo.cellColors[classification]);
                        // rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
                    }



                    // ****END OF EXPIREMENTAL*****
    
                    let winner = {
                        p: -1,
                        label: -1
                    }
                    for (let c = 0; c < demo.classes; c++) {
                        const prob = 0.5 * f(map(j, 0, canvas.cols, -1, 1), DB0[c][0][0], DB0[c][0][1]) * f(map(i, canvas.rows, 0, -1, 1), DB0[c][1][0], DB0[c][1][1]);
                        if (prob > winner.p) {
                            winner.p = prob;
                            winner.label = c;
                        }
                    }
                    if (winner.p > 0.1) {
                        fill(demo.cellColors[winner.label]);
                        // rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
                    }
                }
            }
        }
    
    
        if (demo.kde) {
            for (let i = 0.02; i < canvas.rows; i++) {
                for (let j = 0.02; j < canvas.cols; j++) {
            
                    let x = map(j, 0, canvas.cols, -1, 1);
                    let y = map(i, canvas.rows, 0, -1, 1);
                    
                    let w = {
                        prob: -1,
                        class: -1
                    }
        
                    for (let c = 0; c < demo.classes; c++) {
                        let p = getProb(x, y, c);
                        if (p > w.prob) {
                            w.prob = p;
                            w.class = c;
                        }
                    }
                    noStroke();
                    if (w.prob > 0.1) {
                        fill(demo.cellColors[w.class]);
                        rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
                    }
                }
            }
        }
        stroke(47)
        strokeWeight(2.5);
        for (let p of demo.dataSet) {
            if (!p.moving) {
                fill(demo.pointColors[p.label])
                circle(canvas.mapX(p.x), canvas.mapY(p.y), 12);
            }
        }
    }
    recalculate = false;

    // display each data point and handle moving points
    cursor(ARROW);
    stroke(47)
    strokeWeight(2.5);
    for (let p of demo.dataSet) {
        if ((sq(canvas.mapX(p.x) - mouseX) + sq(canvas.mapY(p.y) - mouseY)) < sq(6)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < canvas.width) && (mouseX > 0) && (mouseY < canvas.height) && (mouseY > 0)) {
            p.x = map(mouseX, 0, canvas.width, -1, 1);
            p.y = map(mouseY, canvas.height, 0, -1, 1);
            fill(demo.pointColors[p.label])
            circle(canvas.mapX(p.x), canvas.mapY(p.y), 12);
        }
    }

    if (!mouseIsPressed) {
        demo.recalculate = false;
    }
}


// New clean function for GNB
function classify(point) {
    const features = [point.x, point.y];
    let probabilities = [];
    for (let c = 0; c < demo.classes; c++) {
        let pc = 0;
        for (let feature of features) {
            pc += log(gaussianP(feature, c));
        }
        probabilities.push(pc);
    }
    return maxIndex(probabilities);
}

function gaussianP(feature, c) {
    const mu = gaussianParameters[c].mu;
    const sigma = gaussianParameters[c].sigma
    return f(feature, mu, sigma);
}






function maxIndex(vector) {
    let m = {
        v: vector[0],
        i: 0
    }
    for (let i = 0; i < vector.length; i++) {
        const value = vector[i];
        if (value > m.v) {
            m.v = value;
            m.i = i;
        }
    }
    return m.i;
}

function getProb(x_feat, y_feat, c) {
    let xSum = 0;
    let ySum = 0;
    for (let p of demo.dataSet) {
        if (p.label == c) {
            xSum += (f((x_feat), p.x, demo.bw));
            ySum += (f((y_feat), p.y, demo.bw));
        }
    }
    return sqrt(demo.bw) * ((xSum / demo.pointsPerClass) * (ySum / demo.pointsPerClass));
}

function setDimensions() {
    resizeCanvas(1, 1);
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvas.width * 0.75;
    canvas.cellWidth = canvas.width / canvas.cols;
    canvas.cellHeight = canvas.height / canvas.rows;
    resizeCanvas(canvas.width, canvas.height);
    demo.recalculate = true;
}


// Handle window resizing
function windowResized() {
    setDimensions();
}

// handle moving points
function mousePressed() {
    demo.recalculate = true;
    for (let p of demo.dataSet) {
        if ((sq(canvas.mapX(p.x) - mouseX) + sq(canvas.mapY(p.y) - mouseY)) < sq(10)) {
            p.moving = true;
            return;
        }
    }
}

function mouseReleased() {
    drawPoints = true;
    for (let p of demo.dataSet) {
        p.moving = false;
    }
}

// the implementaion of GNB
// pass it a dimension (x or y) and a label (0, 1 ..n)
function getMu(alpha, c) {
    let n = 0;
    let sum = 0;
    for (let p of demo.dataSet) {
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
    for (let p of demo.dataSet) {
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




// Event listener and respected function to handle parameter change
// -------------------------------------------------------------------
// Handle the css of which button is selected
function flip(selection, options) {
    for (let option of options) {
        if (option == selection) {
            document.getElementById(option).className = 'pressed';
        } else {
            document.getElementById(option).className = '';
        }
    }
}

// Handle adding and removing classes
document.getElementById('add').addEventListener('click', () => {
    if (demo.classes < 4) {
        demo.classes++;
        start();
    }
});
document.getElementById('take').addEventListener('click', () => {
    if (demo.classes > 2) {
        demo.classes--;
        start();
    }
});

// Handle slider changing the KDE bandwidth
function updateBw() {
    let newBw = parseFloat(document.getElementById('bandwidth').value);
    demo.bw = newBw;
    document.getElementById('curBW').innerText = newBw.toFixed(2);
    recalculate = true;
}
document.getElementById('bandwidth').addEventListener('input', updateBw);

// Handle resetting new random points
document.getElementById('new').addEventListener('click', () => {
    start();
}, false);

// Handle turing gaussin on and off
document.getElementById('gaussianOn').addEventListener('click', () => {
    demo.gaussian = true;
    flip('gaussianOn', ['gaussianOn', 'gaussianOff']);
    recalculate = true;
});
document.getElementById('gaussianOff').addEventListener('click', () => {
    demo.gaussian = false;
    flip('gaussianOff', ['gaussianOn', 'gaussianOff']);
    recalculate = true;
});

/// Handle turning kernal density estimation on and off
document.getElementById('kdeOn').addEventListener('click', () => {
    demo.kde = true;
    flip('kdeOn', ['kdeOn', 'kdeOff']);
    recalculate = true;
});
document.getElementById('kdeOff').addEventListener('click', () => {
    demo.kde = false;
    flip('kdeOff', ['kdeOn', 'kdeOff']);
    recalculate = true;
});
