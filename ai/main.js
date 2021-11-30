
// IMPORTS
// =======================
import appData from './appData.js';

// DOM ELEMENTS
// =======================
const appGrid = document.getElementById('appGrid');


function insertApp(title, date, fname) {
    const link = document.createElement('a');
    const app = document.createElement('div');
    const name = document.createElement('h3');
    const time = document.createElement('h4');
    link.className = 'link';
    app.className = 'app';
    name.innerText = title;
    time.innerText = date;
    link.href = fname;
    app.appendChild(name);
    app.appendChild(time);
    link.appendChild(app);
    appGrid.appendChild(link);
}

function main() {
    appData.map(app => {
        insertApp(app.title, app.date, app.fname);
    });
}

main();
