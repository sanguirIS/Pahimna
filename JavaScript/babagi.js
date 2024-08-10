AOS.init();
AOS.init({
  
  offset: 120,
  delay: 0,
  duration: 700,
  easing: 'ease',
  once: false,
  mirror: false,
  anchorPlacement: 'top-bottom',

});


const SCROLL_THRESHOLD = 60;
const IMG_WIDTH = 14;

class Slider {
  constructor(element) {
    this.element = element;
    this.carousel = element.querySelector('.carousel');
    this.arrowIcons = element.querySelectorAll('.wrapper i');
    this.firstImg = this.carousel.querySelectorAll('img')[0];
    this.isDragStart = false;
    this.isDragging = false;
    this.prevPageX = 0;
    this.prevScrollLeft = 0;
    this.positionDiff = 0;
    this.init();
  }

  init() {
    this.carousel.addEventListener('mousedown', this.dragStart.bind(this));
    this.carousel.addEventListener('touchstart', this.dragStart.bind(this));

    document.addEventListener('mousemove', this.dragging.bind(this));
    this.carousel.addEventListener('touchmove', this.dragging.bind(this));

    document.addEventListener('mouseup', this.dragStop.bind(this));
    this.carousel.addEventListener('touchend', this.dragStop.bind(this));

    this.arrowIcons.forEach(icon => {
      icon.addEventListener('click', this.arrowClick.bind(this));
    });
  }

  dragStart(e) {
    this.isDragStart = true;
    this.prevPageX = e.pageX || e.touches[0].pageX;
    this.prevScrollLeft = this.carousel.scrollLeft;
  }

  dragging(e) {
    if (!this.isDragStart) return;
    e.preventDefault();
    this.isDragging = true;
    this.carousel.classList.add('dragging');
    this.positionDiff = (e.pageX || e.touches[0].pageX) - this.prevPageX;
    this.carousel.scrollLeft = this.prevScrollLeft - this.positionDiff;
    this.showHideIcons();
  }

  dragStop() {
    this.isDragStart = false;
    this.carousel.classList.remove('dragging');

    if (!this.isDragging) return;
    this.isDragging = false;
    this.autoSlide();
  }

  arrowClick(e) {
    const firstImgWidth = this.firstImg.clientWidth + IMG_WIDTH;
    this.carousel.scrollLeft += e.target.id == 'left' ? -firstImgWidth : firstImgWidth;
    this.showHideIcons();
  }
  
  showHideIcons() {
    const scrollWidth = this.carousel.scrollWidth - this.carousel.clientWidth;
    this.arrowIcons[0].style.display = this.carousel.scrollLeft == 0 ? 'none' : 'block';
    this.arrowIcons[1].style.display = this.carousel.scrollLeft == scrollWidth ? 'none' : 'block';
  }

  autoSlide() {
    const scrollWidth = this.carousel.scrollWidth - this.carousel.clientWidth;
    const positionDiff = Math.abs(this.positionDiff);
    const firstImgWidth = this.firstImg.clientWidth + IMG_WIDTH;
    const valDifference = firstImgWidth - positionDiff;

    if (this.carousel.scrollLeft - (scrollWidth - this.carousel.clientWidth) > -1 || this.carousel.scrollLeft <= 0) return;

    if (this.carousel.scrollLeft > this.prevScrollLeft) {
      this.carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    } else {
      this.carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
  }
}


const memoriesSlider = new Slider(document.querySelector('.memories-slider'));
const cousinSlider = new Slider(document.querySelector('.cousin-slider'));

