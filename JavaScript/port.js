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


const progressBar = document.getElementById("progress-bar");

function updateProgressBar() {
  const totalHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const scrollPosition = window.scrollY;

  let progress = 0;
  if (totalHeight > 0) {
    progress = Math.min(100, (scrollPosition / totalHeight) * 100);
  }

  progressBar.style.width = progress + "%";
}

window.addEventListener("scroll", updateProgressBar);
window.addEventListener("resize", updateProgressBar);

document.addEventListener("DOMContentLoaded", updateProgressBar);

// Responsive layout handler - fixes the issue where desktop/mobile views don't update
// when window is resized or when "desktop site" is toggled on mobile
function updateResponsiveLayout() {
  const siteSidebar = document.getElementById('siteSidebar');
  const bottomNav = document.getElementById('bottomNav');
  const moreSheet = document.getElementById('moreSheet');
  const moreOverlay = document.getElementById('moreOverlay');
  
  // Check if viewport is desktop size (>= 992px)
  const isDesktop = window.innerWidth >= 992;
  
  if (siteSidebar) {
    siteSidebar.style.display = isDesktop ? 'flex' : 'none';
  }
  
  if (bottomNav) {
    bottomNav.style.display = isDesktop ? 'none' : 'flex';
  }
  
  if (moreSheet) {
    moreSheet.style.display = isDesktop ? 'none' : '';
  }
  
  if (moreOverlay) {
    moreOverlay.style.display = isDesktop ? 'none' : '';
  }
  
  // If we're on mobile and the bottom nav exists, reposition the indicator
  if (!isDesktop && bottomNav) {
    const indicator = document.getElementById('navIndicator');
    if (indicator) {
      const active = bottomNav.querySelector('.nav-link.active');
      if (active) {
        indicator.style.width = active.offsetWidth + 'px';
        indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
        indicator.style.opacity = '1';
      }
    }
  }
}

// Run on load
window.addEventListener('load', updateResponsiveLayout);

// Run on window resize - this fixes the maximize/restore issue on desktop
window.addEventListener('resize', updateResponsiveLayout);

// Also run on orientation change for mobile devices
window.addEventListener('orientationchange', updateResponsiveLayout);

// Create a ResizeObserver to detect any viewport size changes (including when "desktop site" is toggled)
if ('ResizeObserver' in window) {
  const resizeObserver = new ResizeObserver(entries => {
    updateResponsiveLayout();
  });
  resizeObserver.observe(document.documentElement);
}

// Modern 3D tilt for the hero title (info.html): the two stacked lines rotate
// in 3D space following the mouse, then settle back flat on mouse leave.
document.addEventListener("DOMContentLoaded", function () {
  var title = document.querySelector(".hero-title");
  var inner = document.querySelector(".hero-title-inner");
  if (!title || !inner) return;

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* matchMedia unavailable */ }

  var rafId = null;

  title.addEventListener("mousemove", function (e) {
    if (reduceMotion) return;
    if (rafId) cancelAnimationFrame(rafId);
    // Track the cursor immediately: disable the CSS transition while moving so
    // the tilt does not lag behind the pointer, and re-enable it on leave so
    // the settle-back is eased.
    inner.style.transition = "none";
    rafId = requestAnimationFrame(function () {
      var rect = title.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      var px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rx = (-py * 14).toFixed(2); // tilt up / down
      var ry = (px * 18).toFixed(2);  // tilt left / right
      inner.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    });
  });

  title.addEventListener("mouseleave", function () {
    if (rafId) cancelAnimationFrame(rafId);
    inner.style.transition = "";
    inner.style.transform = "";
  });
  
  // Initialize responsive layout when DOM is ready
  updateResponsiveLayout();
});