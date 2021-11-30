
// Start of Hungarian algorithm
const SIMPLE = 0;
const STARRED = 1;
const PRIMED = 2;

function maximize(matrix, deepCopy = true) {

    if (deepCopy) {
        matrix = JSON.parse(JSON.stringify(matrix));
    }

    // 'invert' the matrix so we can use the minimize method
    let m = 0;
    for (let row of matrix) {
        let rm = Math.max(...row);
        if (rm > m) {
            m = rm;
        }
    }

    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = matrix[i].map(x => m - x);
    }

    return minimize(matrix, false);
}


function minimize(matrix, deepCopy = true) {

    if (deepCopy) {
        matrix = JSON.parse(JSON.stringify(matrix));
    }

    let n = matrix.length;

    for (let i = 0; i < n; i++) {
        let min = matrix[i][0];
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] < min) {
                min = matrix[i][j];
            }
        }
        if (min > 0) {
            for (let k = 0; k < n; k++) {
                matrix[i][k] -= min;
            }
        }
    }

    let mask_matrix = new Array(n).fill().map(_ => Array(n).fill(SIMPLE));
    let row_cover = new Array(n).fill(false);
    let col_cover = new Array(n).fill(false);

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if ((matrix[r][c] == 0) && (!row_cover[r]) && (!col_cover[c])) {
                mask_matrix[r][c] = STARRED;
                row_cover[r] = true;
                col_cover[c] = true;
            }
        }
    }
    row_cover = new Array(n).fill(false);
    col_cover = new Array(n).fill(false);

    let match_found = false;

    while (!match_found) {
    // while not match_found:
        for (let i = 0; i < n; i++) {
            col_cover[i] = false;
            for (let mrow of mask_matrix) {
                if (mrow[i] == STARRED) {
                    col_cover[i] = true;
                    break;
                }
            }
        }

        let allCovered = true;
        for (let c of col_cover) {
            if (c == false) {
                allCovered = false;
                break;
            }
        }

        if (allCovered) {
            match_found = true;
            continue;
        }
        else {
            let zero = _cover_zeroes(matrix, mask_matrix, row_cover, col_cover);
            let primes = [zero];
            let stars = [];

            while (zero) {
                zero = _find_star_in_col(mask_matrix, zero[1]);
                if (zero) {
                    stars.push(zero);
                    zero = _find_prime_in_row(mask_matrix, zero[0]);
                    stars.push(zero);
                }
            }
            // Erase existing stars
            for (let star of stars) {
                mask_matrix[star[0]][star[1]] = SIMPLE;
            }
            // Star existing primes
            for (let prime of primes) {
                mask_matrix[prime[0]][prime[1]] = STARRED;
            }
            // Erase remaining primes
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (mask_matrix[r][c] == PRIMED) {
                        mask_matrix[r][c] = SIMPLE;
                    }
                }
            }
            row_cover = new Array(n).fill(false);
            col_cover = new Array(n).fill(false);
        }
    }
    let solution = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (mask_matrix[r][c] == STARRED) {
                solution.push([r, c]);
            }
        }
    }
    return solution;
}


// Internal methods

function _cover_zeroes(matrix, mask_matrix, row_cover, col_cover) {
    let n = matrix.length;

    while (true) {
        let zero = true;

        while (zero) {
            zero = _find_noncovered_zero(matrix, row_cover, col_cover);
            if (zero == null) {
                break;
            }
            else {
                let row = mask_matrix[zero[0]];
                row[zero[1]] = PRIMED;
                
                let index = row.indexOf(STARRED);
                
                if (index == -1) {
                    return zero;
                }
                row_cover[zero[0]] = true;
                col_cover[index] = false;
            }
        }

        m = Math.min(..._uncovered_values(matrix, row_cover, col_cover));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (row_cover[r]) {
                    matrix[r][c] += m;
                }
                if (!col_cover[c]) {
                    matrix[r][c] -= m;
                }
            }
        }
    }
}


function _find_noncovered_zero(matrix, row_cover, col_cover) {
    let n = matrix.length;
    for (let r = 0; r < n; r++) {
        for (c = 0; c < n; c++) {
            if ((matrix[r][c] == 0) && (!row_cover[r]) && (!col_cover[c])) {
                return [r, c];
            }
        }
    }
    return null;
}


function* _uncovered_values(matrix, row_cover, col_cover) {
    let n = matrix.length;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if ((!row_cover[r]) && (!col_cover[c])) {
                yield matrix[r][c];
            }
        }
    }
}


function _find_star_in_col(mask_matrix, c) {
    let n = mask_matrix.length;
    for (let r = 0; r < n; r++) {
        if (mask_matrix[r][c] == STARRED) {
            return [r, c];
        }
    }
    return null;
}


function _find_prime_in_row(mask_matrix, r) {
    let n = mask_matrix.length;
    for (let c = 0; c < n; c++) {
        if (mask_matrix[r][c] == PRIMED) {
            return [r, c];
        }
    }
    return null;
}

// End of Hungarian algorithm


// let solution = maximize(
//     [[  7,  53, 183, 439, 863, 497, 383, 563,  79, 973, 287,  63, 343, 169, 583],
//      [627, 343, 773, 959, 943, 767, 473, 103, 699, 303, 957, 703, 583, 639, 913],
//      [447, 283, 463,  29,  23, 487, 463, 993, 119, 883, 327, 493, 423, 159, 743],
//      [217, 623,   3, 399, 853, 407, 103, 983,  89, 463, 290, 516, 212, 462, 350],
//      [960, 376, 682, 962, 300, 780, 486, 502, 912, 800, 250, 346, 172, 812, 350],
//      [870, 456, 192, 162, 593, 473, 915,  45, 989, 873, 823, 965, 425, 329, 803],
//      [973, 965, 905, 919, 133, 673, 665, 235, 509, 613, 673, 815, 165, 992, 326],
//      [322, 148, 972, 962, 286, 255, 941, 541, 265, 323, 925, 281, 601,  95, 973],
//      [445, 721,  11, 525, 473,  65, 511, 164, 138, 672,  18, 428, 154, 448, 848],
//      [414, 456, 310, 312, 798, 104, 566, 520, 302, 248, 694, 976, 430, 392, 198],
//      [184, 829, 373, 181, 631, 101, 969, 613, 840, 740, 778, 458, 284, 760, 390],
//      [821, 461, 843, 513,  17, 901, 711, 993, 293, 157, 274,  94, 192, 156, 574],
//      [ 34, 124,   4, 878, 450, 476, 712, 914, 838, 669, 875, 299, 823, 329, 699],
//      [815, 559, 813, 459, 522, 788, 168, 586, 966, 232, 308, 833, 251, 631, 107],
//      [813, 883, 451, 509, 615,  77, 281, 613, 459, 205, 380, 274, 302,  35, 805]]);
// console.log(solution);


// Start of algorithm visulaization

// to maximize or to minimize
let variant = 'minimize';

// points per class and an array to hold them all
const numPoints = 8; 
let dataSet = {
    donors: [],
    patients: []
};

// the cost matrix of distances
let costMatrix = [];

// calculate the dimensions of container
const cc = document.getElementById('canvasContainer');
let WIDTH = cc.offsetWidth;
let HEIGHT = WIDTH * 0.75;

// the list of colors to use
const colors = ['rgb(255, 36, 91)',
                'rgb(174, 128, 255)'];

// function the add the points from each class to our dataset
function addPoints(num) {
    // randomSeed(27);
    for (let i = 0; i < num; i++) {
        dataSet.donors.push({
            x: random(-1, 1),
            y: random(-1, 1),
            moving: false
        });
        dataSet.patients.push({
            x: random(-1, 1),
            y: random(-1, 1),
            moving: false
        });
    }
}

// a start function to be called when certain perameters change
function start() {
    dataSet.donors = [],
    dataSet.patients = []
    addPoints(numPoints);
}

// function to initialize all the values in the cost matrix
function initCosts() {
    costMatrix = [];
    for (let p of dataSet.patients) {
        let row = [];
        for (let d of dataSet.donors) {
            row.push(0.75 * (sq(p.x - d.x)) + (sq(p.y - d.y)));
        }
        costMatrix.push(row);
    }
}

function getMatches(val) {
    if (val == 'minimize') {
        return minimize(costMatrix);
    }
    return maximize(costMatrix);
}

// function to update a row or col when a point is moved
function updateCosts(kind, index) {
    if (kind == 'patients') {
        let p = dataSet.patients[index];
        for (let row = 0; row < costMatrix.length; row++) {
            let d = dataSet.donors[row];
            costMatrix[row][index] = sqrt(sq(p.x - d.x) + sq(p.y - d.y));
        }
    } else {
        let d = dataSet.donors[index];
        for (let col = 0; col < costMatrix.length; col++) {
            let p = dataSet.patients[col];
            costMatrix[index][col] = sqrt(sq(p.x - d.x) + sq(p.y - d.y));
        }
    }
}
let matches;

// the points and calculation are done in a (-1, 1) grid but the pixel dimensions change
let mapX;
let mapY;
function setup() {
    let cnv = createCanvas(WIDTH, HEIGHT);
    cnv.parent('canvasContainer');

    start();

    mapX = (x) => map(x, -1, 1, 0, WIDTH);
    mapY = (y) => map(y, -1, 1, HEIGHT, 0);

    initCosts();
    // console.log(costMatrix);
    flip('minimize', ['minimize', 'maximize']);
    matches = getMatches(variant);
    // console.log(matches)
}



function draw() {
    background(248);
    textSize(26);
    textAlign(CENTER);
    
    cursor(ARROW);
    stroke(47)
    strokeWeight(3);
    for (let p of [...dataSet.donors, ...dataSet.patients]) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(10)) {
            cursor('pointer');
        }
        if (p.moving && (mouseX < WIDTH) && (mouseX > 0) && (mouseY < HEIGHT) && (mouseY > 0)) {
            p.x = map(mouseX, 0, WIDTH, -1, 1);
            p.y = map(mouseY, HEIGHT, 0, -1, 1);
            // console.log('start');
            initCosts();
            matches = getMatches(variant);
            // console.log('end');
        }
    }


    // initCosts();
    // const matches = minimize(costMatrix, false);
    for (let i = 0; i < dataSet.patients.length; i++) {
        let p = dataSet.patients[i];
        let m = matches[i][1];
        let d = dataSet.donors[m];
        line(mapX(p.x), mapY(p.y), mapX(d.x), mapY(d.y));
        fill(colors[0]);
        circle(mapX(p.x), mapY(p.y), 16);
        fill(0);
        // text(i, mapX(p.x), mapY(p.y));
        // let m = matches[i][1];
        // let d = dataSet.donors[matches[i][1]];
        // line(mapX(p.x), mapY(p.y), mapX(d.x), mapY(d.y));
        fill(colors[1]);
        circle(mapX(d.x), mapY(d.y), 16);
        // text(m, mapX(d.x), mapY(d.y));
    }

}

function windowResized() {
    WIDTH = cc.offsetWidth;
    HEIGHT = WIDTH * 0.75;
    resizeCanvas(WIDTH, HEIGHT);
}

// handle moving points
function mousePressed() {
    for (let p of [...dataSet.donors, ...dataSet.patients]) {
        if ((sq(mapX(p.x) - mouseX) + sq(mapY(p.y) - mouseY)) < sq(8)) {
            p.moving = true;
            return;
        }
    }
}

function mouseReleased() {
    for (let p of [...dataSet.donors, ...dataSet.patients]) {
        p.moving = false;
    }
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
document.getElementById('minimize').addEventListener('click', () => {
    variant = 'minimize';
    flip('minimize', ['minimize', 'maximize']);
    matches = getMatches(variant);
    // console.log('min');
});
document.getElementById('maximize').addEventListener('click', () => {
    variant = 'maximize';
    flip('maximize', ['minimize', 'maximize']);
    matches = getMatches(variant);
    // console.log('max');
});

document.getElementById('new').addEventListener('click', () => {
    start();
    initCosts();
    // console.log(costMatrix);
    matches = getMatches(variant);
    // console.log(matches)
})