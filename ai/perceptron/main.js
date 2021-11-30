const numPoints = 4; 
let dataSet = [];
let w = [];
let mapX;
let mapY;
let guess = [1, -1];

const m = -0.6;
const b = .1;
f = (x) => m * x + b;
const FI = (1 > Math.abs((1 - b) / m)) ? ((1 - b) / m) : Math.sign((1 - b) / m);
const SI = (1 > Math.abs((-1 - b) / m)) ? ((-1 - b) / m) : Math.sign((-1 - b) / m);
const LI = (FI < SI) ? FI : SI;
const RI = (FI > SI) ? FI : SI;

const cc = document.getElementById('canvasContainer');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;

function addPoints(num) {
    for (let i = 0; i < num; i++) {
        const fx = random(-1, RI);
        const sx = random(LI, 1);
        dataSet.push({
            x: fx,
            y: random(f(fx), 1),
            label: 1,
            moving: false
        }, {
            x: sx,
            y: random(-1, f(sx)),
            label: -1,
            moving: false
        });
    }
}

function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    addPoints(numPoints);

    for (let j = 0; j < (numPoints + 1); j++) {
        w.push(0);
    }

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);

    setInterval(percept, 100);
}

function draw() {
    background(240);
    cursor(ARROW);
    stroke(47)
    strokeWeight(3);
    line(0, mapY(guess[0]), WIDTH, mapY(guess[1]));

    for (let p of dataSet) {
        if (sqrt(sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < 7.5) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = map(mouseY, HEIGHT, 0, -1, 1);
        }
        fill(((p.label == 1) ? 'rgb(126, 217, 47)' : 'rgb(174, 128, 255)'))
        circle(mapX(p.x), mapY(p.y), 15);
    }
}

function windowResized() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    resizeCanvas(WIDTH, HEIGHT);
}
 
function mousePressed() {
    for (let p of dataSet) {
        if (sqrt(sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < 10) {
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

function percept() {
    for (let p of dataSet) {
        let x = (w[0] * 1) + (w[1] * p.x) + (w[2] * p.y);
        if ((p.label * x) <= 0) {
            w[0] += p.label * 1;
            w[1] += p.label * p.x;
            w[2] += p.label * p.y;
        }
    }
    guess = [(w[1]-w[0]) / w[2], (-w[1]-w[0]) / w[2]];
}

document.getElementById('add').addEventListener('click', () => {
    addPoints(2);
});

document.getElementById('take').addEventListener('click', () => {
    if (dataSet.length > 4) {
        for (let i = 0; i < 4; i++) {
            dataSet.pop();
        }
    }
});
