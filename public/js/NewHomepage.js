const track = document.querySelector('.carouseltrack');
const slides = document.querySelectorAll('.carouselslide');
const leftButton = document.querySelector('.leftarrowwrapper');
const rightButton = document.querySelector('.rightarrowwrapper');

const slideWidth = slides[0].getBoundingClientRect().width;

const numberOfSlides = slides.length
console.log(numberOfSlides);
let carouselOffset = 100000000;


//give slide to left class left to be identifiable
slides[0].style.transform = "translateX(100%)"; //right

//give far right (last) slide class right to be identifiable
slides[2].style.transform = "translateX(-100%)";

// if(numberOfSlides > 1){
//   for(let i = 2; i < numberOfSlides; i++){
//     slides[i].style.transform = "translateX(-100%)";
//   }
// }

rightButton.addEventListener('click', e => {
  carouselOffset++;
  console.log(carouselOffset % numberOfSlides);
  console.log((carouselOffset + 1) % numberOfSlides);
  console.log((carouselOffset + 2) % numberOfSlides);
  slides[carouselOffset % numberOfSlides].style.transform = "none"; //2
  slides[carouselOffset % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + 1) % numberOfSlides].style.transform = "translateX(-100%)"; //0
  slides[(carouselOffset + 1) % numberOfSlides].style.transition = "none";

  slides[(carouselOffset + 2) % numberOfSlides].style.transform = "translateX(100%)"; //1
  slides[(carouselOffset + 2) % numberOfSlides].style.transition = "1s";



});
//
// 6 0
// 5 2
// 4 1
// 3 0
// 2 2
// 1 1
// 0 0
// -1 2
// -2 1
// -3 0
// -4 2
// -5 1
// -6 0
// -7 2
// -8 1
// -9 0

leftButton.addEventListener('click', e => {
  carouselOffset--;
  console.log(carouselOffset % 3);
  console.log((carouselOffset + 1) % 3);
  console.log((carouselOffset + 2) % 3);
  slides[carouselOffset % numberOfSlides].style.transform = "none";
  slides[carouselOffset % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + 1) % numberOfSlides].style.transform = "translateX(-100%)";
  slides[(carouselOffset + 1) % numberOfSlides].style.transition = "1s";

  slides[(carouselOffset + 2) % numberOfSlides].style.transform = "translateX(100%)";
  slides[(carouselOffset + 2) % numberOfSlides].style.transition = "none";

});

const moveToSlide = (track, currentSlide, targetSlide) => {
  track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
  currentSlide.classList.remove('currentslide');
  targetSlide.classList.add('currentslide');
}


// rightButton.addEventListener('click', e => {
//   const currentSlide = document.querySelector('.currentslide');
//   const nextSlide = currentSlide.nextElementSibling;
//   moveToSlide(track, currentSlide, nextSlide);
// });
//
// leftButton.addEventListener('click', e => {
//   const currentSlide = document.querySelector('.currentslide');
//   const prevSlide = currentSlide.previousElementSibling;
//   moveToSlide(track, currentSlide, prevSlide);
// });
