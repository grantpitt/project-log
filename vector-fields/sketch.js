
let point = null;
let a = 1;
let b = 0;
let c = 0;
let d = 1;
// matrix = [[a, b],
//           [c, d]];
let mapX;
let mapY;
let delta = 1;
let spacing = 25;

const canvasContainer = document.getElementById('canvasContainer')
let WIDTH = canvasContainer.offsetWidth;
let HEIGHT = WIDTH * 0.75;

function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    // noLoop();

    mapX = (x) => map(x, 0, width, -10, 10);
    mapY = (y) => map(y, 0, height, -10, 10);
}


function draw() {
    // background(243, 243, 242);
    background(255);

    for (let x = spacing/2; x < width; x += spacing) {
        for (let y = spacing/2; y < height; y += spacing) {

            const v1 = createVector(x, y);
            const v2 = createVector(mapX(x), mapY(y));

            const u1 = matVecMult(v2);
            u1.normalize();
            u1.mult(spacing / 1.25);

            drawArrow(v1, u1, color(25, 26, 27));
        }
    }

    if (point != null && point.x < width*15 && point.x > -width*15 && point.y < height*15 && point.y > -height*15) {
        fill(200, 50, 50)
        circle(point.x, point.y, 14);
        // console.log(point.x, point.y);
        // console.log(mapX(point.x), mapY(point.y));
        const temp = matVecMult(createVector(mapX(point.x), mapY(point.y)));
        // console.log(nextPoint.x, nextPoint.y)
        // temp.normalize();
        temp.mult(spacing / 15);
        nextPoint = createVector(temp.x + point.x, temp.y + point.y);
        // line(point.x, point.y, nextPoint.x, nextPoint.y);
        point = nextPoint;
    }

    // a += random(-delta, delta);
    // b += random(-delta, delta);
    // c += random(-delta, delta);
    // d += random(-delta, delta);
    // noLoop();
}

function matVecMult(v) {
    return createVector((v.x * a) + (v.y * b), (v.x * c) + (v.y * d));
}

function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(2);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 2;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
}

function windowResized() {
    resizeCanvas(1, 1);
    WIDTH = canvasContainer.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    resizeCanvas(WIDTH, HEIGHT);
}

document.getElementById('spacing').value = spacing;
document.getElementById('curSpacing').innerText = spacing;
document.getElementById('spacing').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    spacing = val;
    document.getElementById('curSpacing').innerText = val;
});

document.getElementById('a').value = a;
document.getElementById('b').value = b;
document.getElementById('c').value = c;
document.getElementById('d').value = d;
document.getElementById('a').addEventListener('input', (e) => {
    const val = e.target.value;
    if (val == '') {
        a = 0;
    } else {
        a = parseFloat(val);
    }
});
document.getElementById('b').addEventListener('input', (e) => {
    const val = e.target.value;
    if (val == '') {
        b = 0;
    } else {
        b = parseFloat(val);
    }
});
document.getElementById('c').addEventListener('input', (e) => {
    const val = e.target.value;
    if (val == '') {
        c = 0;
    } else {
        c = parseFloat(val);
    }
});
document.getElementById('d').addEventListener('input', (e) => {
    const val = e.target.value;
    if (val == '') {
        d = 0;
    } else {
        d = parseFloat(val);
    }
});

function mouseClicked() {
    if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
        point = createVector(mouseX, mouseY);
        // loop();
        // prevent default
        return false;
    }
}