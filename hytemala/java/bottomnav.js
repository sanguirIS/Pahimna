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

// Shared "More" bottom sheet + sliding active-tab indicator
// + dark/light theme toggle for the tool pages' bottom navigation
document.addEventListener('DOMContentLoaded', function () {
    var bottomNav = document.getElementById('bottomNav');
    var indicator = document.getElementById('navIndicator');

    // Sliding pill that follows the active tab
    function moveIndicator() {
        if (!bottomNav || !indicator) {
            return;
        }
        if (bottomNav.offsetParent === null) {
            return; // nav is hidden — nothing to measure
        }
        var active = bottomNav.querySelector('.nav-link.active');
        if (!active) {
            indicator.style.opacity = '0';
            return;
        }
        indicator.style.opacity = '1';
        indicator.style.width = active.offsetWidth + 'px';
        indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    }

    window.addEventListener('load', moveIndicator);
    window.addEventListener('resize', moveIndicator);
    moveIndicator();

    var moreBtn = document.getElementById('moreBtn');
    var moreSheet = document.getElementById('moreSheet');
    var moreOverlay = document.getElementById('moreOverlay');
    var moreClose = document.getElementById('moreClose');
    if (!moreBtn || !moreSheet) {
        return;
    }

    function openMore() {
        moreSheet.classList.add('open');
        moreOverlay.classList.add('show');
        document.body.classList.add('sheet-open');
        moreBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMore() {
        moreSheet.classList.remove('open');
        moreOverlay.classList.remove('show');
        document.body.classList.remove('sheet-open');
        moreBtn.setAttribute('aria-expanded', 'false');
    }

    moreBtn.addEventListener('click', function () {
        if (moreSheet.classList.contains('open')) {
            closeMore();
        } else {
            openMore();
        }
    });
    if (moreOverlay) {
        moreOverlay.addEventListener('click', closeMore);
    }
    if (moreClose) {
        moreClose.addEventListener('click', closeMore);
    }
    moreSheet.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', closeMore);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMore();
        }
    });
});

// Dark / light theme toggle (shared with the main site)
document.addEventListener('DOMContentLoaded', function () {
    var root = document.documentElement;
    var toggles = document.querySelectorAll('.theme-toggle');

    var saved = null;
    try {
        saved = localStorage.getItem('pahimna-theme');
    } catch (e) { /* storage unavailable */ }
    if (saved === 'light') {
        root.setAttribute('data-theme', 'light');
    } else if (saved !== 'dark') {
        // No explicit choice: follow the system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
    }

    function syncThemeUI() {
        var isLight = root.getAttribute('data-theme') === 'light';
        toggles.forEach(function (btn) {
            var icon = btn.querySelector('i');
            if (icon) {
                icon.className = isLight ? 'la la-moon-o' : 'la la-sun-o';
            }
            btn.setAttribute('aria-pressed', String(isLight));
            btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        });
    }

    var themeFadeTimer = null;

    function setTheme(nextLight) {
        if (nextLight) {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
    }

    function animateThemeSwitch(nextLight) {
        var prefersReduced = false;
        try {
            prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) { /* matchMedia unavailable */ }

        // Reduced motion: switch instantly, no animation
        if (prefersReduced) {
            setTheme(nextLight);
            return;
        }

        // Preferred: smooth full-page cross-fade via the View Transitions API
        if (document.startViewTransition) {
            try {
                document.startViewTransition(function () {
                    setTheme(nextLight);
                });
                return;
            } catch (e) { /* fall through to the color-fade fallback */ }
        }

        // Fallback: brief global color fade for browsers without the API
        document.documentElement.classList.add('theme-transition');
        setTheme(nextLight);
        window.clearTimeout(themeFadeTimer);
        themeFadeTimer = window.setTimeout(function () {
            document.documentElement.classList.remove('theme-transition');
        }, 500);
    }

    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var isLight = root.getAttribute('data-theme') === 'light';
            animateThemeSwitch(!isLight);
            try {
                localStorage.setItem('pahimna-theme', isLight ? 'dark' : 'light');
            } catch (e) { /* storage unavailable */ }
            syncThemeUI();
        });
    });

    // Live-follow the system theme until the visitor makes an explicit choice
    var systemTheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    if (saved !== 'light' && saved !== 'dark' && systemTheme && systemTheme.addEventListener) {
        systemTheme.addEventListener('change', function () {
            var current = null;
            try {
                current = localStorage.getItem('pahimna-theme');
            } catch (e) { /* storage unavailable */ }
            if (current === 'light' || current === 'dark') {
                return; // the visitor chose a theme explicitly
            }
            animateThemeSwitch(systemTheme.matches);
            syncThemeUI();
        });
    }

    syncThemeUI();
});

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