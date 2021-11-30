
// DOM Elements
const page = document.getElementById('pageContainer');

function getAppWidth() {
    if (window.innerWidth < 560) {
        return 182;
    }
    if (window.innerWidth < 1000) {
        return 205;
    }
    return 280;
}

centerPosts();
function centerPosts() {
    const w = getAppWidth();
    const size = Math.floor((page.offsetWidth - 10) / w) * w;
    const appContainers = document.getElementsByClassName('appContainer');
    for (let appContainer of appContainers) {
        appContainer.style.width = `${size}px`;
    }
}

window.addEventListener('resize', () => {
    centerPosts();
});
