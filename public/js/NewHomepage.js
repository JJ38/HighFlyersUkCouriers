const track = document.querySelector('.carouseltrack');
const slides = document.querySelectorAll('.carouselslide');
const leftButton = document.querySelector('.leftarrowwrapper');
const rightButton = document.querySelector('.rightarrowwrapper');

const slideWidth = slides[0].getBoundingClientRect().width;

const numberOfSlides = slides.length
let carouselOffset = 100000000;

//give slide to left class left to be identifiable
slides[carouselOffset % numberOfSlides].style.transform = "translateX(100%)"; //right

//give far right (last) slide class right to be identifiable
slides[(carouselOffset + 2) % numberOfSlides].style.transform = "translateX(-100%)";//left

if(numberOfSlides > 2){
  for(let i = 3; i < numberOfSlides; i++){
    slides[(carouselOffset + i) % numberOfSlides].style.transform = "translateX(-100%)"; //stacked left
  }
}

rightButton.addEventListener('click', e => {

  slides[carouselOffset % numberOfSlides].style.transform = "translateX(-100%)";
  slides[carouselOffset % numberOfSlides].style.transition = "none";

  slides[(carouselOffset + 1) % numberOfSlides].style.transform = "translateX(100%)";
  slides[(carouselOffset + 1) % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + 2) % numberOfSlides].style.transform = "none";
  slides[(carouselOffset + 2) % numberOfSlides].style.transition = "1s";

  carouselOffset++;



});

leftButton.addEventListener('click', e => {

  slides[carouselOffset % numberOfSlides].style.transform = "none";
  slides[carouselOffset % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + 1) % numberOfSlides].style.transform = "translateX(-100%)";
  slides[(carouselOffset + 1) % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + numberOfSlides - 1) % numberOfSlides].style.transform = "translateX(100%)"; //move slide at bottom of stack to right
  slides[(carouselOffset + numberOfSlides - 1) % numberOfSlides].style.transition = "none";

  carouselOffset--;
});

const moveToSlide = (track, currentSlide, targetSlide) => {
  track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
  currentSlide.classList.remove('currentslide');
  targetSlide.classList.add('currentslide');
}
