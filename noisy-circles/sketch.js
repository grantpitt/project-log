
// Variables related to demo
let shapeType = '';
let colorType = 'discrete';
let t = 10;
let colors;
let order = [];
let points = 22;

// Get the height and width variables
const canvasContainer = document.getElementById('canvasContainer')
let WIDTH = canvasContainer.offsetWidth;
let HEIGHT = canvasContainer.offsetHeight;

// Wow vue is so awesome
let app = new Vue({
    el: '.controls',
    data: {
        variation: 0.25,
        step: 0.909,
        tstep: 0.008,
        r: 60,
    },
    methods: {
        fillShape() {
            shapeType = '';
        },
        triangleShape() {
            shapeType = 5;
        },
        setDiscrete() {
            colorType = 'discrete';
            buildOrder();
        },
        setGradient() {
            colorType = 'gradient';
            buildOrder();
        }
    }
});

function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    // colors from https://www.tandika.com/2020/07/the-artists-husband-p5.js-colors/
    colors = [
        color(0),
        color(100),
        color(200),
        color(255),
        color(128, 128, 0),
        color(200, 200, 255),
        color(128, 50, 128),
        color(255, 165, 0),
        color("#fc0"),
        color("#65c323"),
        color("#800000"),
        color("#123456"),
        "rgb(50%, 50%, 0%)",
        "rgb(78%, 78%, 100%)",
        "rgb(50%, 20%, 50%)",
        "rgb(100%, 65%, 0%)",
        "hsb(45, 70%, 70%)",
        "hsb(135, 80%, 100%)",
        "hsb(225, 90%, 0%)",
        "hsb(315, 100%, 100%)",
        "hsl(0, 50%, 50%)",
        "hsl(90, 25%, 30%)",
        "hsl(180, 20%, 50%)",
        "hsl(270, 65%, 40%)",
        "lightsalmon",
        "teal",
        "yellowgreen",
        "antiquewhite",
        "cornflowerblue",
        "dimgrey",
        "deeppink",
        "lavenderblush",
        "mediumturquoise",
        "midnightblue",
        "chocolate",
        "coral",
    ];

    buildOrder();

    noStroke();
}

function draw() {

    background(250, 249, 248);

    for (let spot of order) {
        noisyCircle(spot.x, spot.y, spot.c);
    }

    t += parseFloat(app.tstep);
}

function noisyCircle(xorigin, yorigin, c) {
    push();
    let variation = parseFloat(app.variation);
    let step = parseFloat(app.step);
    let r = parseFloat(app.r);

    fill(c);
    translate(xorigin, yorigin);
    beginShape(shapeType);
    const domain = linspace(0, TWO_PI, points);
    for (let i of domain) {
        let x = cos(i);
        let y = sin(i);
        let n = (noise(xorigin + x * step, yorigin + y * step, t) - 0.5) * r * variation;
        x *= r + n;
        y *= r + n;
        curveVertex(x, y);
    }
    endShape(CLOSE);
    pop();
}

function linspace(start, end, count) {
    const domain = [];
    const delta = end - start;
    for (let i = start; i < end; i += (delta / (count))) {  // - 1))) {
        domain.push(i);
    }
    // domain.push(end);
    return domain;
}

function buildOrder() {

    order = [];
    let xspacing = width / 6;
    let yspacing = height / 6;

    let colorIndex = 0;
    let c1 = color(10, 160, 255);
    let c2 = color(0, 20, 200);
    for (let i = xspacing/2; i < width; i += xspacing) {
        for (let j = yspacing/2; j < height; j += yspacing) {
            let c;
            if (colorType == 'gradient') {
                let inter = map(sq(i) + sq(j), 0, sq(width) + sq(height), 0, 1);
                c = lerpColor(c1, c2, inter);
            }
            else if (colorType == 'discrete') {
                c = colors[colorIndex];
            }
            order.push({
                x: i,
                y: j,
                c: c
            });
            colorIndex++;
        }
    }

    shuffle(order, true);
}
