const content = document.getElementById('content');
const postSection = document.getElementById('postSection');

// centerPosts();
// function centerPosts() {
//     const size = Math.floor((content.offsetWidth - 10) / 302) * 302;
//     postSection.style.width = `${size}px`
// }

// let lastWidth =  window.innerWidth;
window.addEventListener('resize', () => {
    postSection.style.width = (header.offsetWidth - block.offsetWidth - 8) + 'px';
});


let block = document.getElementById('block1');
let block2 = document.getElementById('block2');
slider = document.getElementById('slider');

// on mouse down (drag start)
slider.onmousedown = function dragMouseDown(e) {
    // get position of mouse
    let dragX = e.clientX;
    // register a mouse move listener if mouse is down
    document.onmousemove = function onMouseMove(e) {
        // e.clientY will be the position of the mouse as it has moved a bit now
        // offsetHeight is the height of the block-1
        block.style.width = block.offsetWidth + e.clientX - dragX + "px";
        postSection.style.width = (header.offsetWidth - block.offsetWidth - 8) + 'px';
        // content.style.maxWidth = header.offsetWidth - block.offsetWidth - 8;
        // update variable - till this pos, mouse movement has been handled
        setDimensions();
        dragX = e.clientX;
    }
    // remove mouse-move listener on mouse-up (drag is finished now)
    document.onmouseup = () => document.onmousemove = document.onmouseup = null;
}

window.addEventListener('resize', () => {
    postSection.style.width = (header.offsetWidth - block.offsetWidth - 8) + 'px';
});






// dragover and dragenter events need to have 'preventDefault' called
// in order for the 'drop' event to register. 
// See: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations#droptargets
const dropContainer = document.getElementById('drop-zone');

function post(files) {
    for(let i = 0; i < files.length; i++) {
        let img = document.createElement('img');
        img.src = URL.createObjectURL(files[i]);

        let post = document.createElement('div');
        post.className = 'post';
        let discription = document.createElement('p');
        discription.innerText = 'Hello World';

        post.appendChild(img);
        post.appendChild(discription);
        postSection.appendChild(post);
        // postSection.appendChild(img);
        setDimensions();
    }
}

dropContainer.ondragover = dropContainer.ondragenter = function(evt) {
    evt.preventDefault();
};

// let fileInput = {

// }

dropContainer.ondrop = function(evt) {
    // fileInput.files = evt.dataTransfer.files;

    post(evt.dataTransfer.files);

    // console.log(evt);
    // console.log(evt.dataTransfer);
    // console.log(evt.dataTransfer.files);
    // console.log(evt.dataTransfer.files.length);

    // If you want to use some of the dropped files
    // const dT = new DataTransfer();
    // dT.items.add(evt.dataTransfer.files[0]);
    // dT.items.add(evt.dataTransfer.files[3]);
    // fileInput.files = dT.files;
  
    evt.preventDefault();
};

var loadFile = function(event) {
	post(event.target.files);
};




// calculate the dimensions of container and then cells
const cc = document.getElementById('cc');
let WIDTH;
let HEIGHT;


function setup() {
    let cnv = createCanvas(5, 5);
    cnv.parent('cc');
    startUp();
}

let originalPoint = null;
let cQ = null;
function draw() {



    var posts = document.getElementsByClassName('post');

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        if (inPost(post)) {
            // console.log('its in');
            post.style.background = 'rgb(209, 209, 209)';
        }
        else {
            post.style.background = '';
            //console.log('its out');
        }
    }




    // circle(mouseX, mouseY, 30);
    // background('rgba(0, 0, 0, 0)');
    // background(230);

    // cursor(ARROW);
    // cursor('pointer');

    stroke('rgba(0, 0, 0, 0.3)');
    fill('rgba(0, 0, 0, 0.1)');
    if (mouseIsPressed && originalPoint != null) {
        if (cQ != null) {
            erase();
            quad(cQ[0], cQ[1], cQ[2], cQ[3], cQ[4], cQ[5], cQ[6], cQ[7]);
            noErase();
        }
        const x1 = originalPoint.x;
        const y1 = originalPoint.y;
        const x2 = mouseX;
        const y2 = mouseY;
        cQ = [x1, y1, x1+(x2-x1), y1, x2, y2, x1, y1+(y2-y1)];
        quad(cQ[0], cQ[1], cQ[2], cQ[3], cQ[4], cQ[5], cQ[6], cQ[7]);
    }


}

function mousePressed() {
    if (inCanvas()) {
        originalPoint = {
            x: mouseX,
            y: mouseY
        };
    }
    // prevent default
    return false;
}

function mouseReleased() {
    originalPoint = null;
    if (cQ != null) {
        erase();
        quad(cQ[0], cQ[1], cQ[2], cQ[3], cQ[4], cQ[5], cQ[6], cQ[7]);
        noErase();
        cQ = null;
    }
    background('rgba(0, 0, 0, 0)');
}

function inCanvas() {
    return (mouseX > 0 && mouseX < WIDTH && mouseY > 0 && mouseY < HEIGHT);
}

function inPost(post) {
    let px = post.offsetLeft - document.getElementById('block1').offsetWidth - 8;
    let py = post.offsetTop - document.getElementById('header').offsetHeight;
    // circle(px, py, 20);
    let w = post.offsetWidth;
    let h = post.offsetHeight;
    // circle(px+w, py+h, 20);
    return (mouseX > px && mouseX < (px + w) && mouseY > py && mouseY < (py + h));
}


function startUp() {
    setDimensions();
    background('rgba(0, 0, 0, 0)');
}


function setDimensions() {
    resizeCanvas(1, 1);
    WIDTH = cc.offsetWidth;
    HEIGHT = content.offsetHeight - 4;
    resizeCanvas(WIDTH, HEIGHT);
}

// Handle window resizing
function windowResized() {
    startUp();
}
