const leftHero = document.getElementById('left-hero');
const rightHero = document.getElementById('right-hero');

setHeroHeight()
function setHeroHeight() {
    if (window.innerWidth > 1000){
        const height = window.innerHeight;
        leftHero.style.height = `${height}px`;
        rightHero.style.height = `${height}px`;
    }
    else {
        const height = window.innerHeight;
        leftHero.style.height = `${height}px`;
        rightHero.style.height = `45%`;
    }
}

window.addEventListener('resize', () => {
    setHeroHeight()
});

document.getElementById('scrollBtn').addEventListener('click', () => {
    window.scrollTo(0, window.innerHeight);
});




document.getElementById('subject').addEventListener('focus', () => {
    document.getElementById('inputArea').style.borderColor = '#007cba';
});

document.getElementById('entry').addEventListener('focus', () => {
    document.getElementById('inputArea').style.borderColor = '#007cba';
});

document.getElementById('subject').addEventListener('focusout', () => {
    document.getElementById('inputArea').style.borderColor = '#dfdfdf';
});

document.getElementById('entry').addEventListener('focusout', () => {
    document.getElementById('inputArea').style.borderColor = '#dfdfdf';
});


// CENTERING ENTRIES
// ======================================================
// DOM Elements
const page = document.getElementById('pageContainer');

function getAppWidth() {
    // if (window.innerWidth < 560) {
    //     return 182;
    // }
    // if (window.innerWidth < 1000) {
    //     return 205;
    // }
    return 775;
}

centerPosts();
function centerPosts() {
    const w = getAppWidth();
    const size = Math.floor((page.offsetWidth - 10) / w) * w;
    const appContainers = document.getElementsByClassName('entryContainer');
    for (let appContainer of appContainers) {
        appContainer.style.width = `${size}px`;
    }
}

window.addEventListener('resize', () => {
    centerPosts();
});




// INSERTING ENTRIES
// ======================================================
// Dom
entryContainer = document.getElementById('entryContainer');
submitBtn = document.getElementById('submitEntry');

function getEntries() {
    let url = 'https://api.sheety.co/6be6f69a393995daebc196d618107f39/eternalFamiliesEntries/sheet1';
    fetch(url)
    .then((response) => response.json())
    .then(json => {
        const data = json.sheet1;
        data.map(e => {
            addEntry(e.title, e.body);
        })
    // Do something with the data
    // console.log(json.sheet1);
    });
}
getEntries();

function postEntry(entryTitle, entryBody) {
    let url = 'https://api.sheety.co/6be6f69a393995daebc196d618107f39/eternalFamiliesEntries/sheet1';
    let body = {
      'sheet1': {
        'title': entryTitle,
        'body': entryBody
      }
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then(json => {
      // Do something with object
      // console.log(json.sheet1);
    });
}

function addEntry(title, body) {
    const entry = document.createElement('div');
    entry.className = 'entry';
    const h1Title = document.createElement('h1')
    h1Title.innerText = title;
    const pBody = document.createElement('p');
    pBody.innerText = body;
    entry.appendChild(h1Title);
    entry.appendChild(pBody);
    entryContainer.appendChild(entry);
}

submitBtn.addEventListener('click', () => {
    const title = document.getElementById('subject').value;
    const body = document.getElementById('entry').value;
    if (title !== '' && body !== '') {
        addEntry(title, body);
        postEntry(title, body);
        document.getElementById('subject').value = '';
        document.getElementById('entry').value = '';
    }
});
