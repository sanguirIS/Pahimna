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

// Form validation + AJAX submission (Suggestion form)
document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    // Visible fields only: skip hidden inputs and the honeypot
    const inputs = Array.from(form.querySelectorAll('input, textarea')).filter(
      field => field.type !== 'hidden' && field.name !== '_honey'
    );
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    function showFormStatus(type, message) {
      const status = form.querySelector('.form-status');
      if (!status) return;
      status.className = 'form-status col-12 alert alert-' + type + ' mt-2';
      status.textContent = message;
      status.classList.remove('d-none');
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearFormStatus() {
      const status = form.querySelector('.form-status');
      if (status) status.classList.add('d-none');
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      if (loading) {
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
      } else {
        submitBtn.innerHTML = originalBtnText;
      }
    }

    // Live feedback while typing: turn a field green as soon as it is valid,
    // but only show red once the visitor has actually tried to submit.
    inputs.forEach(input => {
      input.addEventListener('input', function () {
        const tried = form.classList.contains('was-validated');
        if (this.checkValidity()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        } else {
          this.classList.remove('is-valid');
          if (tried) this.classList.add('is-invalid');
        }
      });
    });

    form.addEventListener('submit', async event => {
      form.classList.add('was-validated');

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (form.dataset.ajax !== 'true') {
        // Classic submission (e.g. the _autoresponse variant): let the browser
        // POST natively so FormSubmit can deliver the auto-confirm email.
        if (submitBtn) submitBtn.disabled = true; // guard against double-click
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Use the visitor's email as Reply-To on the owner's notification email
      const replyToInput = form.querySelector('input[name="_replyto"]');
      const emailInput = form.querySelector('input[name="email"]');
      if (replyToInput && emailInput && emailInput.value) {
        replyToInput.value = emailInput.value;
      }

      setLoading(true);
      clearFormStatus();

      // FormSubmit's AJAX endpoint (same email, /ajax/ path) responds with JSON
      const ajaxEndpoint = form.action.replace(
        'https://formsubmit.co/',
        'https://formsubmit.co/ajax/'
      );

      let response;
      try {
        response = await fetch(ajaxEndpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
      } catch (error) {
        // Genuine network / CSP failure (no response received) — fall back to the
        // native POST so the message is not lost. FormSubmit then redirects to its
        // thank-you page. This only runs when the fetch itself failed, so the
        // message cannot be sent twice.
        try {
          form.submit();
        } catch (fallbackError) {
          showFormStatus('danger', 'Oops! Could not send your suggestion. Please try again later.');
        }
        setLoading(false);
        return;
      }

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        data = null; // non-JSON response — treat as failure below
      }

      if (data && (data.success === 'true' || data.success === true)) {
        // "Accepted" does not always mean "delivered" (an unactivated account can
        // accept submissions while sending the activation email), so we only
        // confirm real delivery via the explicit status check below.
        showFormStatus('success', 'Salamat! Your suggestion has been sent successfully. 🎉');
        form.reset();
        form.classList.remove('was-validated');
        inputs.forEach(field => field.classList.remove('is-valid', 'is-invalid'));
      } else if (data && data.message) {
        // Surface FormSubmit's own message (e.g. pending account activation)
        showFormStatus('danger', data.message);
      } else {
        showFormStatus('danger', 'Oops! Something went wrong while sending your suggestion. Please try again.');
      }

      setLoading(false);
    });

  });
});

// Modern 3D tilt for the hero title (Klenn.html): rotate the stacked lines in
// 3D space following the mouse, then settle back flat on mouse leave.
document.addEventListener('DOMContentLoaded', function () {
  const title = document.querySelector('.hero-title');
  const inner = document.querySelector('.hero-title-inner');
  if (!title || !inner) return;

  let reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* matchMedia unavailable */ }

  let rafId = null;

  title.addEventListener('mousemove', (e) => {
    if (reduceMotion) return;
    if (rafId) cancelAnimationFrame(rafId);
    // Track the cursor immediately: disable the CSS transition while moving so
    // the tilt does not lag behind the pointer, and re-enable it on leave so
    // the settle-back is eased.
    inner.style.transition = 'none';
    rafId = requestAnimationFrame(() => {
      const rect = title.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * 14).toFixed(2); // tilt up / down
      const ry = (px * 18).toFixed(2);  // tilt left / right
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  });

  title.addEventListener('mouseleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    inner.style.transition = '';
    inner.style.transform = '';
  });
});
