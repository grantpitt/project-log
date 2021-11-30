
// DOM Elements
// --------------------
const canvasContainer = document.getElementById('canvasContainer');
const controlsContainer = document.getElementById('controls');
const headerContainer = document.getElementById('header');

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
demo.pointColors = ['rgb(47, 137, 186)',
                    'rgb(186, 47, 47)',
                    'rgb(47, 186, 110)',
                    'rgb(214, 171, 43)'];
demo.cellColors = ['rgba(47, 137, 186, 0.4)',
                   'rgba(186, 47, 47, 0.4)',
                   'rgba(47, 186, 110, 0.4)',
                   'rgba(214, 171, 43, 0.4)'];


// Squre root of Tau
const SRT = 2.50662827463;

// Classes to hold the paramters of each distribution
// classes -> features -> parameters
let gaussianParameters = [];


function setup() {
    let cnv = createCanvas(canvas.width, canvas.height);
    cnv.parent('canvasContainer');
    setDimensions();

    start();

    // Display initial paramters
    flip('kdeOn', ['kdeOn', 'kdeOff']);
    flip('gaussianOn', ['gaussianOn', 'gaussianOff']);
    currentBandwidth.innerText = '0.10';

    noStroke();
}

function draw() {

    if (demo.recalculate) {
        console.log('recalibrating');
        background(248);

        if (demo.gaussian) {
            calculateGaussianParameters();
            displayGaussian();
        }
    
        if (demo.kde) {
            displayKde();
        }

        displayStaticPoints();
    }

    handleMovingPoints();

    if (!mouseIsPressed) {
        demo.recalculate = false;
    }
}


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

// A start function to call at begining and when the classes/points change
function start() {
    demo.dataSet = [];
    setPoints();
    demo.recalculate = true;
}


function displayStaticPoints() {
    stroke(47)
    strokeWeight(2.5);
    for (let p of demo.dataSet) {
        if (!p.moving) {
            fill(demo.pointColors[p.label])
            circle(canvas.mapX(p.x), canvas.mapY(p.y), 16);
        }
    }
    noStroke();
}

function handleMovingPoints() {
    cursor(ARROW);
    stroke(47)
    strokeWeight(2.5);
    for (let p of demo.dataSet) {
        if ((sq(canvas.mapX(p.x) - mouseX) + sq(canvas.mapY(p.y) - mouseY)) < sq(8)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < canvas.width) && (mouseX > 0) && (mouseY < canvas.height) && (mouseY > 0)) {
            p.x = map(mouseX, 0, canvas.width, -1, 1);
            p.y = map(mouseY, canvas.height, 0, -1, 1);
            fill(demo.pointColors[p.label])
            circle(canvas.mapX(p.x), canvas.mapY(p.y), 16);
        }
    }
    noStroke();
}


// Calculate the paraters for the distribution of each feature for each class
function calculateGaussianParameters() {
    gaussianParameters = [];
    for (let c = 0; c < demo.classes; c++) {
        let classGaussianParameters = [];
        for (let d of ['x', 'y']) {
            let m = getMu(d, c);
            let s = getSimga(m, d, c);
            classGaussianParameters.push({
                mu: m,
                sigma: s
            });
        }
        gaussianParameters.push(classGaussianParameters);
    }
}

function displayGaussian() {
    noStroke();
    // Iterate over each pixel section and classify it
    for (let i = 0.02; i < canvas.rows; i++) {
        for (let j = 0.02; j < canvas.cols; j++) {
            // The [x, y] feature vector of a give cell
            const vect = [map(j, 0, canvas.cols, -1, 1),
                          map(i, canvas.rows, 0, -1, 1)]
            const classification = classify(vect);

            fill(demo.cellColors[classification.class]);
            rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);

            if (classification.probability > log(0.2)) {
                rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
            }
        }
    }
}


// Implementation of GNB
function classify(vect) {
    let probabilities = [];

    // Calculate the probability for each class
    for (let c = 0; c < demo.classes; c++) {
        let pc = 0; // starting the probability at 1.7 
        for (let i = 0; i < vect.length; i++) {
            const mu = gaussianParameters[c][i].mu;
            const sigma = gaussianParameters[c][i].sigma;
            pc += log(f(vect[i], mu, sigma));
        }
        probabilities.push(pc);
    }

    // Perform argmax and build a nice object to return
    let classification = {};
    classification.class = indexOfMax(probabilities);
    classification.probability = probabilities[classification.class];

    return classification;
}


// Useful for when we need to choose which class probability is highest
// The index corresponds to the class
function indexOfMax(arr) {
    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function displayKde() {
    noStroke();
    for (let i = 0.02; i < canvas.rows; i++) {
        for (let j = 0.02; j < canvas.cols; j++) {
    
            // The [x, y] feature vector of a give cell
            const vect = [map(j, 0, canvas.cols, -1, 1),
                          map(i, canvas.rows, 0, -1, 1)]
            
            const classification = classifyKde(vect);

            if (classification.probability > 0.1) {
                fill(demo.cellColors[classification.class]);
                rect(canvas.cellWidth * j, canvas.cellHeight * i, canvas.cellWidth, canvas.cellHeight);
            }
        }
    }
}

function classifyKde(vect) {

    probabilities = [];
    const n = vect.length;
    for (let c = 0; c < demo.classes; c++) {
        let sums = new Array(n); for (let i=0; i<n; ++i) sums[i] = 0;
        for (let p of demo.dataSet) {
            let pVect = [p.x, p.y]; // Ideally this would already exist
            if (p.label == c) {
                for (let i = 0; i < pVect.length; i++) {
                    pFeature = pVect[i];
                    vFeature = vect[i];
                    sums[i] += f(vFeature, pFeature, demo.bw);
                }
            }
        }
        let prob = sqrt(demo.bw);
        for (let sum of sums) {
            prob *= sum;
        }
        probabilities.push(prob);
    }

    // Perform argmax and build a nice object to return
    let classification = {};
    classification.class = indexOfMax(probabilities);
    classification.probability = probabilities[classification.class];

    return classification;
}

function setDimensions() {
    resizeCanvas(1, 1);
    canvasContainer.style.height = `${window.innerHeight - controlsContainer.offsetHeight - headerContainer.offsetHeight}px`;
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;
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
    for (let p of demo.dataSet) {
        if ((sq(canvas.mapX(p.x) - mouseX) + sq(canvas.mapY(p.y) - mouseY)) < sq(8)) {
            p.moving = true;
            demo.recalculate = true;
            return;
        }
    }
}

function mouseReleased() {
    for (let p of demo.dataSet) {
        p.moving = false;
    }
}

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
    // Once the buttons have switched, recalculate the demo
    demo.recalculate = true;
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
    demo.recalculate = true;
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
});
document.getElementById('gaussianOff').addEventListener('click', () => {
    demo.gaussian = false;
    flip('gaussianOff', ['gaussianOn', 'gaussianOff']);
});

/// Handle turning kernal density estimation on and off
document.getElementById('kdeOn').addEventListener('click', () => {
    demo.kde = true;
    flip('kdeOn', ['kdeOn', 'kdeOff']);
});
document.getElementById('kdeOff').addEventListener('click', () => {
    demo.kde = false;
    flip('kdeOff', ['kdeOn', 'kdeOff']);
});
