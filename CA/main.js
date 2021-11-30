
window.onload = function() {
    console.log('yup');
    $('#myModal').modal('show');
};


let restart = true;
let recalculate = true;

// calculate the dimensions of container and then cells
const cc = document.getElementById('cc');
let WIDTH;
let HEIGHT;
let cellW;

cc.onmousedown = function(e) {
    e.preventDefault()
}

let graph = {
    size: 48,
    states: 4,
    ruleNum: 3806484360062277,
    styleType: 'default',
    colors: [],
    initialType: 'rand',
    running: false,
    vector: [],
    init: function() {
        let row = [];

        if (this.initialType == 'center') {
            for (let i = 0; i < this.size; i++) {
                if (i == Math.floor(this.size / 2)) {
                    row.push(1);
                } else {
                    row.push(0)
                }
            }
        } else if (this.initialType == 'pattern') {
            for (let i = 0; i < this.size; i++) {
                row.push(i % this.states);
            }
        } else if (this.initialType = 'rand') {
            for (let i = 0; i < this.size; i++) {
                row.push(Math.floor(Math.random() * this.states));
            }
        }

        this.vector.push(row);
        return row;
    },
    getRule: function() {
        let rule = this.ruleNum.toString(this.states);
        while (rule.length < Math.pow(this.states, 3)) {
            rule = "0" + rule;
        }
        return rule;
    },
    rule: '',
    iterate: function() {
        let row = [];
        const previous = this.vector[this.vector.length - 1];
        for (let i = 0; i < this.size; i++) {
            let key = "";
            for (let j = i - 1; j < i + 2; j++) {
                key += previous[(this.size + j) % this.size];
            }
            row.push(parseInt(this.rule[parseInt(key, this.states)]));
        }
        this.vector.push(row);
        return row;
    }
};

function setup() {
    let cnv = createCanvas(5, 5);
    cnv.parent('cc');
    setDimensions();
    background(47);
    noStroke();

    begin();
}

let hovered = -1;

function draw() {

    cursor(ARROW);

    if (hovered > -1) {
        const color = graph.colors[graph.vector[0][hovered]];
        fill(color);
        stroke(color);
        square(cellW * hovered, 0, cellW);
        // outline(hovered, color)
        hovered = -1;
    }

    // Handle hovering inital cells
    if ((mouseY > 0) && (mouseY < cellW) && (mouseX < WIDTH) && (mouseX > 0)) {
        cursor('pointer');
        const h = Math.floor(mouseX / cellW);
        fill('rgba(255, 255, 255, 0.25)');
        stroke('rgba(255, 255, 255, 0.1)');
        square(h * cellW, 0, cellW);

        hovered = h;
    }


    if (restart) {
        graph.vector = [];
        display(graph.init());
        recalculate = true;
    }
    restart = false;

    if (recalculate) {
        const row = graph.iterate();
        display(row);
    }
    if ((graph.vector.length * cellW) >= HEIGHT) {
        recalculate = false;
    }
    if (graph.vector.length == 2) {
        const len = graph.vector[0].length;;
        for (let i = 0; i < len; i++) {
            const cell = graph.vector[0][i];
            const color = graph.colors[cell];
            stroke(color);
            fill(color);
            square(cellW * i, 0, cellW);
        }
    }
}

function display(row) {
    const len = row.length;
    const level = graph.vector.length - 1;
    for (let i = 0; i < len; i++) {
        const cell = row[i];
        const color = graph.colors[cell];
        stroke(color);
        fill(color);
        square(cellW * i, cellW * level, cellW);
    }
}

function setDimensions() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    cellW = WIDTH / graph.size;
    // cc.style.width = `${WIDTH}px`;
    HEIGHT = WIDTH * 0.75;
    resizeCanvas(WIDTH, HEIGHT);

    begin();
}


// Handle window resizing
function windowResized() {
    setDimensions();
}

// Handle changing inital cells with a click event
function mouseClicked() {
    if ((mouseY > 0) && (mouseY < cellW) && (mouseX < WIDTH) && (mouseX > 0)) {
        let h = Math.floor(mouseX / cellW);
        let row = graph.vector[0];
        row[h] = (row[h] + 1) % graph.states;
        graph.vector = [row];
        display(row);
        recalculate = true;
    }
}

// rule setting
function setRule() {
    let num = graph.states;

    if (num == 2) {
        graph.ruleNum = Math.floor(Math.random() * 257);
    } else if (num == 3) {
        graph.ruleNum = Math.floor(Math.random() * 7625597484987);
    } else if (num == 4) {
        graph.ruleNum = Math.floor(Math.random() * 9007199254740990);
    }
}

let curIsolate = 0;
// set style
function setStyle() {
    let val = graph.styleType;
    
    if (val == 'default') {
        graph.colors = ['SteelBlue', 'rgb(8, 43, 94)', 'SandyBrown', 'HotPink'];
    } else if (val == 'BW') {
        graph.colors = [];
        const delta = Math.floor(255 / (graph.states - 1));
        for (let i = 255; i >= 0; i -= delta) {
            graph.colors.push(i);
        }
    } else if (val == 'rand') {
        graph.colors = []
        for (let i = 0; i < 4; i++) {
            graph.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
        }
    }
    else if (val == 'isolate') {
        curIsolate %= graph.states;
        graph.colors = [];
        for (let i = 0; i < 4; i++) {
            if (i == curIsolate) {
                graph.colors.push('SteelBlue');
            }
            else {
                const darkGrey = 20 + Math.floor(Math.random() * 30);
                graph.colors.push(`rgb(${darkGrey}, ${darkGrey}, ${darkGrey})`);
            }
        }
        curIsolate = (curIsolate + 1) % graph.states;
    }
}
setStyle();




// log the current rule in case it's cool and load the first line
function begin() {
    graph.vector = [];
    displayRule();
    graph.rule = graph.getRule().split('').reverse().join('');
    restart = true;
}

function refresh() {
    graph.vector = [graph.vector[0]];
    recalculate = true;
}

// play and pause
function pp() {
    // if (graph.running) {
    //     clearInterval(run);
    //     graph.running = false;
    // } else {
    //     clearInterval(run);
    //     graph.running = true;
    //     run = setInterval(function(){
    //         graph.iterate();
    //     }, 45);
    // }
}

// document.getElementById('pp').addEventListener('click', pp);



// rule functions
function displayRule() {
    document.getElementById('curRule').value = graph.ruleNum;
}

function updateRule() {
    const val = document.getElementById('curRule').value;
    if (val != '') {
        graph.ruleNum = parseInt(document.getElementById('curRule').value);
        begin();
    }
}

document.getElementById('curRule').addEventListener('input', updateRule);


// change style
function changeStyle() {
    var ele = document.getElementsByName('color');

    for (let i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            graph.styleType = ele[i].value;
            break;
        }
    }

    setStyle();
    begin();
}

document.getElementById('default').addEventListener('click', changeStyle);
document.getElementById('BW').addEventListener('click', changeStyle);
document.getElementById('rand').addEventListener('click', changeStyle);
document.getElementById('isolate').addEventListener('click', changeStyle);


// reset/new
function reset() {
    setRule();
    begin();
}

document.getElementById('new').addEventListener('click', reset);

// initial state change
function initChange() {
    graph.initialType = document.getElementById('initial').value;
    begin();
}

document.getElementById('initial').addEventListener('change', initChange);

// size change
function sizeChange() {
    const val = parseInt(document.getElementById('size').value);
    if (val != '' || parseInt(val) < 1) {
        graph.size = parseInt(val);
        setDimensions();
    }
    else {
        graph.size = 1;
        setDimensions();
    }
}

document.getElementById('size').addEventListener('change', sizeChange);


// # of states chages
function statesChange() {
    graph.states = parseInt(document.getElementById('states').value);
    if (graph.styleType == 'BW') {
        setStyle();
    }
    setRule();
    begin();
}

document.getElementById('states').addEventListener('change', statesChange);



