
// DOM elements
// --------------------
const gridContainer = document.getElementById('gridContainer');
const size5button = document.getElementById('size5');
const size10button = document.getElementById('size10');
const size20button = document.getElementById('size20');
const newValsButton = document.getElementById('newVals')
const maxSumSpan = document.getElementById('maxSum');

// Demo object
// --------------------
const demo = {};
demo.n = 5;
demo.grid = [];
demo.maxSum = 0;
demo.maxPath = [];

// Functions for making, solving, and displaying
// ----------------------------------------------------------
function setRandomGrid() {
    const grid = [];
    for (let i = 0; i < demo.n; i++) {
        const row = [];
        for (let j = 0; j < demo.n; j++) {
            row.push(Math.floor(Math.random() * 100));
        }
        grid.push(row);
    }
    demo.grid = grid;
}

function getObjGrid() {
    // make a grid of objects (as opposed to mere numbers)
    const objGrid = [];
    for (let i = 0; i < demo.grid.length; i++) {
        row = demo.grid[i];
        let objRow = []
        for (let j = 0; j < row.length; j++) {
            const objElement = {};
            objElement.val = row[j];
            objElement.location = {r: i, c: j};
            objElement.path = [objElement.location];
            objRow.push(objElement);
        }
        objGrid.push(objRow);
    }
    return objGrid;
}

function maxPath() {
    const objGrid = getObjGrid();
    // Top row opperation
    for (let i = 1; i < objGrid[0].length; i++) {
        objGrid[0][i].val += objGrid[0][i-1].val;
        objGrid[0][i].path = objGrid[0][i].path.concat(objGrid[0][i-1].path);
    }
    for (let j = 1; j < objGrid.length; j++) {
        objGrid[j][0].val += objGrid[j-1][0].val;
        objGrid[j][0].path = objGrid[j][0].path.concat(objGrid[j-1][0].path);
        for (let k = 1; k < objGrid[j].length; k++) {
            // check if the left val is larger than the top
            if (objGrid[j][k-1].val > objGrid[j-1][k].val) {
                objGrid[j][k].val += objGrid[j][k-1].val;
                objGrid[j][k].path = objGrid[j][k].path.concat(objGrid[j][k-1].path);
            }
            else {
                objGrid[j][k].val += objGrid[j-1][k].val;
                objGrid[j][k].path = objGrid[j][k].path.concat(objGrid[j-1][k].path);
            }
        }

    }
    demo.maxSum = objGrid[demo.n-1][demo.n-1].val;
    demo.maxPath = objGrid[demo.n-1][demo.n-1].path;
}

function displaySolvedGrid() {
    gridContainer.innerHTML = '';
    const side = gridContainer.offsetWidth / demo.n;
    for (let i = 0; i < demo.n; i++) {
        for (let j = 0; j < demo.n; j++) {
            const cell = document.createElement('div');
            const value = document.createElement('input');
            value.type = 'text';
            value.className = 'value';
            value.style.width = `${side - 2}px`;
            value.style.height = `${side - 2}px`;
            value.style.fontSize = `${side / 3}px`
            value.value = demo.grid[i][j];
            value.addEventListener('change', () => {
                if (isNumeric(value.value)) {
                    value.style.zIndex = 1;
                    demo.grid[i][j] = Number(value.value);
                    start(remake=false);
                }
                else {
                    value.style.outlineColor = 'red';
                    value.style.zIndex = 2;
                }
            });
            cell.appendChild(value);
            cell.className = 'cell';
            for (const loc of demo.maxPath) {
                if (loc.r == i && loc.c == j) {
                    value.style.backgroundColor = 'rgb(120, 182, 255)';
                    break;
                }
            }
            cell.style.width = `${side}px`;
            cell.style.height = `${side}px`;
            gridContainer.appendChild(cell);
        }
    }
    console.log(demo.maxSum);
    maxSumSpan.innerText = demo.maxSum;
}

function start(remake='true') {
    maxSumSpan.innerText = '';
    flip(`size${demo.n}`, ['size5', 'size10', 'size20']);
    if (remake) {
        setRandomGrid();
    }
    maxPath();
    displaySolvedGrid();
}

start();

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

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

newValsButton.addEventListener('click', () => {
    start();
});


size5button.addEventListener('click', () => {
    if (demo.n != 5) {
        demo.n = 5;
        start();
    }
});

size10button.addEventListener('click', () => {
    if (demo.n != 10) {
        demo.n = 10;
        start();
    }
});

size20button.addEventListener('click', () => {
    if (demo.n != 20) {
        demo.n = 20;
        start();
    }
});
