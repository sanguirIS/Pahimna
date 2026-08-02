// Initialize AOS animations
AOS.init({
  offset: 100,
  delay: 50,
  duration: 800,
  easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
});

// Add hover effects and interactive elements
document.addEventListener('DOMContentLoaded', function () {
  // Add hover glow effect to buttons
  const buttons = document.querySelectorAll('.btn-brand');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
      this.style.boxShadow = 'var(--box-shadow-neon)';
      this.style.transform = 'translateY(-5px)';
    });
    button.addEventListener('mouseleave', function () {
      this.style.boxShadow = '';
      this.style.transform = '';
    });
  });

  // Add interactive card effects
  const cards = document.querySelectorAll('.card-custom');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      this.style.boxShadow = 'var(--box-shadow-neon)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
});

// Form validation
document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', function () {
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
