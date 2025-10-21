AOS.init();
AOS.init({
  offset: 100,
  delay: 50,
  duration: 800,
  easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
});

// Add hover effects and interactive elements for Gen Alpha aesthetic
document.addEventListener('DOMContentLoaded', function() {
  // Add hover glow effect to buttons
  const buttons = document.querySelectorAll('.btn-brand');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.boxShadow = 'var(--box-shadow-neon)';
      this.style.transform = 'translateY(-5px)';
    });
    button.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
      this.style.transform = '';
    });
  });
  
  // Add interactive card effects
  const cards = document.querySelectorAll('.card-custom');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      this.style.boxShadow = 'var(--box-shadow-neon)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
});

const SCROLL_THRESHOLD = 60;
const IMG_WIDTH = 14;

class Slider {
  constructor(element) {
    this.element = element;
    this.carousel = element.querySelector(".carousel");
    this.arrowIcons = element.querySelectorAll(".wrapper i");
    this.firstImg = this.carousel.querySelectorAll("img")[0];
    this.isDragStart = false;
    this.isDragging = false;
    this.prevPageX = 0;
    this.prevScrollLeft = 0;
    this.positionDiff = 0;
    this.init();
  }

  init() {
    this.carousel.addEventListener("mousedown", this.dragStart.bind(this));
    this.carousel.addEventListener("touchstart", this.dragStart.bind(this));

    document.addEventListener("mousemove", this.dragging.bind(this));
    this.carousel.addEventListener("touchmove", this.dragging.bind(this));

    document.addEventListener("mouseup", this.dragStop.bind(this));
    this.carousel.addEventListener("touchend", this.dragStop.bind(this));

    this.arrowIcons.forEach((icon) => {
      icon.addEventListener("click", this.arrowClick.bind(this));
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
    this.carousel.classList.add("dragging");
    this.positionDiff = (e.pageX || e.touches[0].pageX) - this.prevPageX;
    this.carousel.scrollLeft = this.prevScrollLeft - this.positionDiff;
    this.showHideIcons();
  }

  dragStop() {
    this.isDragStart = false;
    this.carousel.classList.remove("dragging");

    if (!this.isDragging) return;
    this.isDragging = false;
    this.autoSlide();
  }

  arrowClick(e) {
    const firstImgWidth = this.firstImg.clientWidth + IMG_WIDTH;
    this.carousel.scrollLeft +=
      e.target.id == "left" ? -firstImgWidth : firstImgWidth;
    this.showHideIcons();
  }

  showHideIcons() {
    const scrollWidth = this.carousel.scrollWidth - this.carousel.clientWidth;
    this.arrowIcons[0].style.display =
      this.carousel.scrollLeft == 0 ? "none" : "block";
    this.arrowIcons[1].style.display =
      this.carousel.scrollLeft == scrollWidth ? "none" : "block";
  }

  autoSlide() {
    const scrollWidth = this.carousel.scrollWidth - this.carousel.clientWidth;
    const positionDiff = Math.abs(this.positionDiff);
    const firstImgWidth = this.firstImg.clientWidth + IMG_WIDTH;
    const valDifference = firstImgWidth - positionDiff;

    if (
      this.carousel.scrollLeft - (scrollWidth - this.carousel.clientWidth) >
        -1 ||
      this.carousel.scrollLeft <= 0
    )
      return;

    if (this.carousel.scrollLeft > this.prevScrollLeft) {
      this.carousel.scrollLeft +=
        positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    } else {
      this.carousel.scrollLeft -=
        positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
  }
}

// Form validation
document.addEventListener('DOMContentLoaded', function() {
  // Fetch all forms that need validation
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else if (form.querySelector('#email') && !validateEmail()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
    
    // Add input event listeners for real-time validation feedback
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        if (this.checkValidity()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        } else {
          this.classList.remove('is-valid');
          this.classList.add('is-invalid');
        }
      });
    });
  });
});

function validateEmail() {
  var email = document.getElementById("email").value;
  var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email)) {
    return true;
  } else {
    document.getElementById("email").classList.add('is-invalid');
    return false;
  }
}

// Make form fields responsive to screen size
function adjustFormLayout() {
  const width = window.innerWidth;
  const formGroups = document.querySelectorAll('#contact .form-group');
  
  if (width < 576) {
    formGroups.forEach(group => {
      if (!group.classList.contains('col-12')) {
        group.classList.add('mb-3');
      }
    });
  } else {
    formGroups.forEach(group => {
      if (!group.classList.contains('col-12')) {
        group.classList.remove('mb-3');
      }
    });
  }
}

// Call on load and resize
window.addEventListener('load', adjustFormLayout);
window.addEventListener('resize', adjustFormLayout);

const memoriesSlider = new Slider(document.querySelector(".memories-slider"));
const cousinSlider = new Slider(document.querySelector(".cousin-slider"));
