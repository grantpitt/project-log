
// A variable to know when we need to redraw the lines
let recalculate = true;
// The container for the points
let dataSet = [];
// The line mode
let lineDisplay = 'trace';
flip('trace', ['trace', 'minimal', 'none']);
// The prarametric point to outline
let t = 0.50;
document.getElementById('curT').innerText = '0.50';

// Calculate the dimensions of container
const cc = document.getElementById('canvasContainer');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;

// The colors for the levels of the trace
const colors = ['#4363d8','#e6194B','#3cb44b','#f58231','#911eb4',
                '#42d4f4','#dcbeff','#ff529d','#469990','#000075'];

// Function the add the points to our dataset
function addPoints(num, type) {
    if (type == 'random') {
        for (let i = 0; i < num; i++) {
            dataSet.push({
                x: random(-1, 1),
                y: random(-1, 1),
                moving: false
            });
        }
    }
    else if (type == 'test') {
        dataSet = [{
            x: -0.75,
            y: 0.25
        }, {
            x: -0.25,
            y: 0.75
        }, {
            x: 0.4,
            y: 0.4
        }, {
            x: 0.25,
            y: -0.5
        }];
    }
}

// The points and calculation are done in a (-1, 1) grid but the pixel dimensions change
let mapX;
let mapY;
function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    addPoints(0, 'test');

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);
}

// The draw function that will continuously be called
function draw() {

    const n = dataSet.length;

    // Check if we need to redraw the lines then handle which line mode
    if (recalculate) {
        background(250);

        if (lineDisplay == 'trace') {
            // Plot the curve
            plotCurve(dataSet);
            // Plot the trace at t
            plotPoint(dataSet, t, true);
            // Draw the points in the data set
            stroke(47);
            strokeWeight(2.2);
            fill(220);
            for (let p of dataSet) {
                circle(mapX(p.x), mapY(p.y), 10);
            }
        }
        if (lineDisplay == 'minimal') {
            // Draw the lines between points in the data set
            stroke(220);
            strokeWeight(2);
            for (let i = 0; i < (n - 1); i++) {
                const p1 = dataSet[i];
                const p2 = dataSet[i + 1];
                line(mapX(p1.x), mapY(p1.y), mapX(p2.x), mapY(p2.y));
            }
            // Plot the curve
            plotCurve(dataSet);
            // Plot the points in the data set
            stroke(47);
            strokeWeight(2.2);
            fill(255, 236, 61);
            for (let p of dataSet) {
                circle(mapX(p.x), mapY(p.y), 10);
            }
        }
        // Just plot the curve
        if (lineDisplay == 'none') {
            plotCurve(dataSet);
        }
    }
    // Set recalculate to false so we don't recompute unnessesarily
    recalculate = false;

    // Handle moving points
    cursor(ARROW);
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(5)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = map(mouseY, HEIGHT, 0, -1, 1);
            recalculate = true;
        }
    }
}

// Handle window resizing
function windowResized() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    resizeCanvas(WIDTH, HEIGHT);
    recalculate = true;
}

// Handle moving points
function mousePressed() {
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(10)) {
            p.moving = true;
            return;
        }
    }
}

// Handle mouse release
function mouseReleased() {
    for (let p of dataSet) {
        p.moving = false;
    }
}

// the implementaion of the Bezier Curve
function plotPoint(dataPoints, t, show, start=true) {
    const n = dataPoints.length;
    // Show the connections between the dataset
    strokeWeight(2);
    const color = colors[n - 1];
    stroke(color);
    fill(color);
    if (show && start) {
        for (let i = 0; i < n; i++) {
            const p1 = dataPoints[i];
            circle(mapX(p1.x), mapY(p1.y), 10);
            if (i < (n - 1)) {
                const p2 = dataPoints[i + 1];
                line(mapX(p1.x), mapY(p1.y), mapX(p2.x), mapY(p2.y));
            }
        }
    }
    // Function to calculate t-way between two points
    f = (v1, v2) => (v1 * (1 - t)) + (v2 * t);
    // Container to hold the points
    const newSet = [];

    // Iterate over the points and get t-way bewteen each of the points
    for (let i = 0; i < (n - 1); i++) {
        const p1 = dataPoints[i];
        const p2 = dataPoints[i + 1];
        const x = f(p1.x, p2.x);
        const y = f(p1.y, p2.y);
        newSet.push({
            x: x,
            y: y
        });
    }

    // Plot the new curve if show it true
    if (show) {
        n2 = newSet.length;
        const color = colors[n2 - 1];
        stroke(color);
        fill(color);
        for (let i = 0; i < n2; i++) {
            const p1 = newSet[i];
            circle(mapX(p1.x), mapY(p1.y), 10);
            if (i < (n2 - 1)) {
                const p2 = newSet[i + 1];
                line(mapX(p1.x), mapY(p1.y), mapX(p2.x), mapY(p2.y));
            }
        }
    }

    // Handle the recursive step and returning the correct point at t
    if (newSet.length > 1) {
        return plotPoint(newSet, t, show, false);
    }
    else {
        return newSet[0];
    }
}


// Plots the Bezier Curve for the dataset by calling plotPoint
function plotCurve(dataPoints) {
    // Containers for the coordinates
    curvePoints = [];
    const ls = linSpace(0, 1, 100);
    // Loop over a set of t values and get the given point on the curve
    for (let t of ls) {
        const p = plotPoint(dataPoints, t, false, false);
        curvePoints.push({
            x: p.x,
            y: p.y
        });
    }
    // Plot the curve
    strokeWeight(4);
    stroke(0);
    noFill();
    beginShape();
    for (let p of curvePoints) {
        vertex(mapX(p.x), mapY(p.y));
    }
    endShape();
}

// Nice little linear range of valus function
function linSpace(p1, p2, num) {
    const vals = [];
    const delta = (p2 - p1) / num;
    for (let i = p1; i <= p2; i += delta) {
        vals.push(i);
    }
    vals.push(p2);
    return vals;
}

// Handle the css of which button is selected
function flip(selection, options) {
    recalculate = true;
    for (let option of options) {
        if (option == selection) {
            document.getElementById(option).className = 'pressed';
        } else {
            document.getElementById(option).className = '';
        }
    }
}

// Handle addding, removing, and refreshing the points
document.getElementById('add').addEventListener('click', () => {
    if (dataSet.length < 10) {
        addPoints(1, 'random');
    }
    recalculate = true;
});
document.getElementById('take').addEventListener('click', () => {
    if (dataSet.length > 2) {
        dataSet.pop();
    }
    recalculate = true;
});
document.getElementById('new').addEventListener('click', () => {
    const n = dataSet.length;
    dataSet = [];
    addPoints(n, 'random');
    recalculate = true;
});

// Handle line mode changes
document.getElementById('trace').addEventListener('click', () => {
    lineDisplay = 'trace';
    flip('trace', ['trace', 'minimal', 'none']);
});
document.getElementById('minimal').addEventListener('click', () => {
    lineDisplay = 'minimal';
    flip('minimal', ['trace', 'minimal', 'none']);
});
document.getElementById('none').addEventListener('click', () => {
    lineDisplay = 'none';
    flip('none', ['trace', 'minimal', 'none']);
});

// Handle the t slider
document.getElementById('t').addEventListener('input', () => {
    let val = parseFloat(document.getElementById('t').value);
    t = val;
    document.getElementById('curT').innerText = val.toFixed(2);
    if (lineDisplay == 'trace') {
        recalculate = true;
    }
});
