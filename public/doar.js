let images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
let index = 0;
const container = document.querySelector('.background-container');

setInterval(() => {
    index = (index + 1) % images.length;
    container.style.backgroundImage = `url(${images[index]})`;
}, 2000);
