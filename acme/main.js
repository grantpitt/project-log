
let imgIndex = 2;
const imgUrls = [
    'https://live.staticflickr.com/65535/48954138902_c51f6f28a0_k.jpg',
    'https://live.staticflickr.com/2915/13743334845_a52e247242_b.jpg',
    'https://live.staticflickr.com/65535/50618354801_52f42d4604_k.jpg'
]

const headerTitle = document.getElementById('title');
function checkTitle() {
    if (window.innerWidth < 880) {
        headerTitle.innerText = 'ACME';
    } else {
        headerTitle.innerText = 'Applied and Computational Mathematics';
    }
}
checkTitle();

window.addEventListener("resize", checkTitle);

// document.getElementById('next-img').addEventListener('click', () => {
//     imgIndex = (imgIndex + 1) % imgUrls.length;
//     document.getElementById('front-img').src = imgUrls[imgIndex];
// });
