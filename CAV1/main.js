let grid = document.getElementById('grid');

// 3 change rules go up to 7000000000000
// neat 3 change boi -> 5101001000003
// very neat 3 change boi -> 6607289952675
// another: 1425633247253
// 3 state serpinski: 6239674445247
// 3046400969441
// 6862683212482

let graph = {
    size: 100,
    states: 3,
    ruleNum: 0,
    styleType: 'default',
    colors: [],
    initialType: 'random',
    running: false,
    vector: [],
    display: function(vector) {
        // loop over each cell in the to-be added row
        let row = document.createElement('div');
        for (let i = 0; i < vector.length; i++) {
            // create a div
            let node = document.createElement('div');
            // add the 'node class to it, then set width, height, and color
            node.className = 'node';
            node.style.backgroundColor = this.colors[vector[i]];
            let nodeWidth = 100 / this.size;
            let nodeHeight = nodeWidth * .65;
            node.style.width = nodeWidth.toString() + '%';
            node.style.height = nodeHeight.toString() + 'vw';

            // add it to the grid
            row.appendChild(node);
        }
        grid.appendChild(row);
    },
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
        } else if (this.initialType = 'random') {
            for (let i = 0; i < this.size; i++) {
                row.push(Math.floor(Math.random() * this.states));
            }
        }

        this.vector.push(row);
        this.display(row);
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
        this.display(row);
    }
};

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
setRule();


// set style
function setStyle() {
    let val = graph.styleType;
    
    if (val == 'default') {
        if (document.getElementById('darkMode').checked) {
            graph.colors =  ['rgb(27, 27, 27)', 'dodgerblue', 'yellowgreen', 'coral'];
        } else {
            graph.colors =  ['aliceblue', 'dodgerblue', 'yellowgreen', 'coral'];
        }
    } else if (val == 'BW') {
        graph.colors = ['white', 'black', 'dimgray', 'silver'];
    } else if (val == 'random') {
        graph.colors = []
        for (let i = 0; i < 4; i++) {
            graph.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
        }
    }
}
setStyle();


// play and pause
let run;


// log the current rule in case it's cool and load the first line
function begin() {
    console.log(graph.ruleNum);
    displayRule();

    graph.rule = graph.getRule().split('').reverse().join('');
    console.log(graph.getRule());

    graph.init();

    // start the first few line
    let k = 1.2;
    var initialLines = Math.floor(k * ((graph.size * window.innerHeight) / window.innerWidth));
    clearInterval(run);
    run = setInterval(function () {

        graph.iterate();
     
        if (graph.vector.length > initialLines) {
            clearInterval(run);
        }
     }, 45);
}

document.onload = begin();



// play and pause
function pp() {
    if (graph.running) {
        clearInterval(run);
        graph.running = false;
    } else {
        clearInterval(run);
        graph.running = true;
        run = setInterval(function(){
            graph.iterate();
        }, 45);
    }
}

document.getElementById('pp').addEventListener('click', pp);



// rule functions
function displayRule() {
    document.getElementById('curRule').value = graph.ruleNum;
}

function updateRule() {
    graph.ruleNum = parseInt(document.getElementById('curRule').value);
    clear();
    begin();
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
    clear();
    begin();
}

document.getElementById('default').addEventListener('click', changeStyle);
document.getElementById('BW').addEventListener('click', changeStyle);
document.getElementById('random').addEventListener('click', changeStyle);


// clear the vector and display
function clear() {
    graph.vector = [];
    grid.innerHTML = '';
}


// reset/new
function reset() {
    setRule();
    clear();
    begin();
}

document.getElementById('new').addEventListener('click', reset);


// initial state change
function initChange() {
    graph.initialType = document.getElementById('initial').value;
    clear();
    begin();
}

document.getElementById('initial').addEventListener('change', initChange);


// size change
function sizeChange() {
    graph.size = parseInt(document.getElementById('size').value);
    clear();
    begin();
}

document.getElementById('size').addEventListener('change', sizeChange);


// # of states chages
function statesChange() {
    graph.states = parseInt(document.getElementById('states').value);
    setRule();
    clear();
    begin();
}

document.getElementById('states').addEventListener('change', statesChange);


// dark mode
function goDark() {

    if (graph.styleType == 'default') {
        setStyle();
        clear();
        begin();
    }

    if (document.getElementById('darkMode').checked) {
        document.body.style.backgroundColor = 'rgb(27, 27, 27)';
        document.body.style.color = 'gainsboro';

        document.getElementById('curRule').style.color = 'gainsboro';
        
        let x = document.getElementsByClassName('dim');
        for (let i = 0; i < x.length; i++) {
            x[i].style.color = 'gainsboro';
            x[i].style.borderColor = 'gainsboro';
        }
    } else {
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'rgb(27, 27, 27)';

        document.getElementById('curRule').style.color = 'rgb(27, 27, 27)';

        let x = document.getElementsByClassName('dim');
        for (let i = 0; i < x.length; i++) {
            x[i].style.color = 'rgb(27, 27, 27)';
            x[i].style.borderColor = 'rgb(27, 27, 27)';
        }
    }
}

document.getElementById('darkMode').addEventListener('change', goDark);

