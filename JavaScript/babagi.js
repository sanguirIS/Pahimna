/*
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


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
