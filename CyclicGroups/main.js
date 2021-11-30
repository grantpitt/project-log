
const feild = document.getElementById('n');
const htmlInfoBox = document.getElementById('infoBox');
const info = document.getElementById('info');

let n = 18;
let recalculate = true;
let redraw = true;
let dataSet = [];

// Calculate the dimensions of container
const cc = document.getElementById('cc');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;
let fontSize = 8 + (WIDTH / 40);

// More info box
let infoBox = {
    show: false,
    point: 0
}

// The colors for the levels of the trace
const colors = ['#4363d8','#e6194B','#3cb44b','#f58231','#911eb4',
                '#42d4f4','#dcbeff','#ff529d','#469990','#000075'];

cc.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, false);


// The points and calculation are done in a (-1, 1) grid but the pixel dimensions change
let mapX;
let mapY;
function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('cc');

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);

    textFont('Verdana');
    textSize(fontSize);
    // textAlign(LEFT, TOP);
    textAlign(CENTER, CENTER);
    strokeWeight(2.5);
}


// The draw function that will continuously be called
function draw() {

    cursor(ARROW);
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(fontSize / 2)) {
            cursor('pointer');
            infoBox.show = true;
            infoBox.point = p;
            redraw = true;
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = map(mouseY, HEIGHT, 0, -1, 1);
            redraw = true;
        }
    }

    // Check if we need to redraw the lines then handle which line mode
    if (recalculate) {
        background(255);
        if (isNumeric(n)) {
            const val = Number(n);
            const subgroups = getSubgroups(val);
            dataSet = [];
            const len = subgroups.length;
            for (let b = 0; b < len; b++) {
                const sg = subgroups[b];
                const x = random(-0.9, 0.9);
                const y = (1.8 * ((len - b) / len)) - 0.9;
                dataSet.push({
                    x: x,
                    y: y,
                    rep: sg.representative,
                    gens: sg.genorators,
                    set: sg.set,
                    links: sg.links,
                    lps: [],
                    moving: false
                });
                redraw = true;
            }

            for (let i = 0; i < dataSet.length; i++) {
                p = dataSet[i]
                const total = p.links.length;
                if (total == 0) {
                    p.x = 0;
                    p.y = 0.95;
                }
                else {
                    let counter = 0;
                    let linkedPoints = [];
                    for (let j = (i - 1); j >= 0; j--) {
                        d = dataSet[j];
                        if (p.links.includes(d.rep)) {
                            let val = p.rep;
                            if (p.rep == 0) {
                                val = n;
                            }
                            linkedPoints.push({
                                x: d.x,
                                y: d.y,
                                distance: (val / d.rep) * 0.06
                            })
                            counter++;
                        }
                        if (counter == total) {
                            break;
                        }
                    }
                    p.lps = linkedPoints;
                    const linkPoint = linkedPoints[0];
                    // const theta = random((4*PI)/3, (5*PI)/3); // (3 * PI) / 2; 
                    let start = abs(linkPoint.x + 0.9);
                    if (start > 0.3) {
                        start = 0.3;
                    }
                    let end = abs(linkPoint.x - 0.9);
                    if (end > 0.3) {
                        end = 0.3;
                    }
                    p.x = linkPoint.x + random(-start, end);
                    // p.x = linkPoint.x + (linkPoint.distance * cos(theta));
                    // p.y = linkPoint.y + (linkPoint.distance * sin(theta));
                }
            }


        }
    }
    if (redraw) {
        background(255);
        for (let i = 0; i < dataSet.length; i++) {
            const p = dataSet[i];
            const total = p.links.length;
            let counter = 0;
            let linkedPoints = [];
            for (let j = (i - 1); j >= 0; j--) {
                d = dataSet[j];
                if (p.links.includes(d.rep)) {
                    let val = p.rep;
                    if (p.rep == 0) {
                        val = n;
                    }
                    linkedPoints.push({
                        x: d.x,
                        y: d.y,
                        distance: (val / d.rep) * 0.06
                    })
                    counter++;
                }
                if (counter == total) {
                    break;
                }
            }
            p.lps = linkedPoints;
        }
        stroke('rgba(86, 161, 232, 0.45)');
        for (let p1 of dataSet) {
            for (let k of p1.lps) {
                line(mapX(p1.x), mapY(p1.y), mapX(k.x), mapY(k.y));
            }
        }
        stroke(250);
        fill(0)
        for (let np of dataSet) {
            text(`<${np.rep}>`, mapX(np.x), mapY(np.y));
        }

        if (infoBox.show) {
            let p = infoBox.point;
            let s = `Generators: ${p.gens.join(", ")}\nOrder: ${p.set.length}\nSet: {${p.set.join(", ")}}`;
            info.innerText = s;
        }
    }

    // Set recalculate to false so we don't recompute unnessesarily
    redraw = false;
    recalculate = false;
    if (infoBox.show) {
        infoBox.show = false;
    }
    else {
        info.innerText = ''
    }

}

// Handle window resizing
function windowResized() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    fontSize = 8 + (WIDTH / 40);
    textSize(fontSize);
    resizeCanvas(WIDTH, HEIGHT);
    redraw = true;
}

// Handle moving points
function mousePressed() {
    for (let p of dataSet) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(fontSize / 2)) {
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


function gcd(a, b) {
    if (b == 0) { 
        return a;
    }
    return gcd(b, a % b);
}

// calculate the cyclic subgroups
function getSubgroups(n) {
    let groupsContainer = [];
    let checked = [];
    for (let i = 1; i <= n; i++) {
        // Check if the cyclic subgoup was already found
        if (checked.includes(i)) {
            continue;
        }
        // Find your parents
        let parents = [];
        for (let j = (groupsContainer.length - 1); j >= 0; j--) {
            // Step 1: Make sure the nodes generator divides you evenly
            const rep = groupsContainer[j].representative;
            if (i % rep == 0) {
                // Step 2: Make sure you have not linked to their ancestor
                let linked = false;
                for (let k = 0; k < parents.length; k++) {
                    if (parents[k] % rep == 0) {
                        linked = true;
                        break;
                    }
                }
                if (!linked) {
                    parents.push(rep);
                }
            }
        }
        // For some reason i %= n doesn't work so we create a new variable id
        const id = i % n;
        // Find other equivalent generators
        let gens = [id];
        for (let m = (id + 1); m < n; m++) {
            if (gcd(id, n) == gcd(m, n)) {
                gens.push(m);
                checked.push(m);
            }
        }
        // Create the group object
        let group = {
            representative: id,
            genorators: gens,
            set: [id],
            links: parents
        };
        // Generate the set generated
        let next = (id + id) % n;
        while (!group.set.includes(next)) {
            group.set.push(next);
            next = (next + id) % n;
        }
        // Add the group
        groupsContainer.push(group);
    }
    return groupsContainer;
}

// console.log(getSubgroups(18));


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

function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

feild.addEventListener('input', () => {
    n = feild.value;
    recalculate = true;
})
