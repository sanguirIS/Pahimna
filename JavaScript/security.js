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


/**
 * Security measures: prevent right-click and inspection shortcuts,
 * and hide raw phone numbers.
 */
(function () {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Disable inspection shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P
    document.addEventListener('keydown', function (e) {
        const k = e.keyCode || e.which;
        const blocked =
            k === 123 || // F12
            (e.ctrlKey && e.shiftKey && (k === 73 || k === 74 || k === 67)) || // Ctrl+Shift+I/J/C
            (e.ctrlKey && k === 85) || // Ctrl+U
            (e.ctrlKey && k === 83) || // Ctrl+S
            (e.ctrlKey && k === 80); // Ctrl+P
        if (blocked) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // ===== DevTools protection (desktop only) =====
    // Mobile/tablet users (including Desktop site mode) keep full access.
    // This is a deterrent, not real security — it can be bypassed.
    (function () {
        function isMobileOrTablet() {
            var ua = navigator.userAgent || '';
            if (/Mobi|Android|iPhone|iPad|iPod|Silk|Kindle|Opera Mini|IEMobile/i.test(ua)) return true;
            // Touch support without desktop-class screen width
            if ('ontouchstart' in window && screen.width < 1024) return true;
            return false;
        }

        if (isMobileOrTablet()) return; // skip protection on phones/tablets

        // --- 1. Console debugger trap ---
        // Force a debugger breakpoint if someone opens the console.
        var _devtools = { open: false };
        Object.defineProperty(_devtools, 'open', {
            get: function () {
                // When DevTools reads this, trigger debugger
                debugger;
                return false;
            }
        });

        // --- 2. Window resize detection ---
        // Opening DevTools usually resizes the viewport by ~200-400px.
        var lastWidth = window.innerWidth;
        var lastHeight = window.innerHeight;
        var resizeTimer = null;
        var _resizeDetected = false;

        window.addEventListener('resize', function () {
            if (_resizeDetected) return;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var wDiff = Math.abs(window.innerWidth - lastWidth);
                var hDiff = Math.abs(window.innerHeight - lastHeight);
                // DevTools panel typically causes a >150px shift on one axis
                if (wDiff > 150 || hDiff > 150) {
                    _resizeDetected = true;
                    _showDevToolsWarning();
                }
                lastWidth = window.innerWidth;
                lastHeight = window.innerHeight;
            }, 300);
        });

        // --- 3. Performance timing detection ---
        // debugger statement causes a >100ms pause in the call stack.
        setInterval(function () {
            var start = performance.now();
            debugger;
            var elapsed = performance.now() - start;
            if (elapsed > 200) {
                _showDevToolsWarning();
            }
        }, 3000);

        function _showDevToolsWarning() {
            if (document.getElementById('devtools-block-overlay')) return;
            var overlay = document.createElement('div');
            overlay.id = 'devtools-block-overlay';
            overlay.style.cssText = 'position: fixed; inset: 0; z-index: 999999; background: rgba(0,0,0,0.92); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Inter, sans-serif; text-align: center; padding: 40px;';
            overlay.innerHTML = '<div style="font-size: 48px; margin-bottom: 16px;">🚫</div><h2 style="margin: 0 0 12px; font-size: 24px;">Developer Tools Detected</h2><p style="margin: 0; font-size: 14px; opacity: 0.7; max-width: 400px;">Inspection of this page is restricted on desktop devices. Please close Developer Tools to continue.</p>';
            document.body.appendChild(overlay);
            // Auto-remove when DevTools closes (resize back to normal)
            window.addEventListener('resize', function _onResize() {
                if (Math.abs(window.innerWidth - lastWidth) < 10) {
                    overlay.remove();
                    _resizeDetected = false;
                    window.removeEventListener('resize', _onResize);
                }
            });
        }
    })();

    // Protect phone links: reveal the number only on click
    document.addEventListener('DOMContentLoaded', function () {
        const links = document.querySelectorAll('a[href^="tel:"]');
        links.forEach(function (link) {
            const number = link.getAttribute('href').replace('tel:', '');
            if (!number) return;
            link.setAttribute('data-secure', btoa(number));
            link.removeAttribute('href');
            link.style.cursor = 'pointer';
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const data = this.getAttribute('data-secure');
                if (data) {
                    window.location.href = 'tel:' + atob(data);
                }
            });
        });
    });

    // Prevent text selection on secure content areas
    const style = document.createElement('style');
    style.textContent = `
        .secure-content {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
    `;
    document.head.appendChild(style);

    // Prevent downloading videos by dragging them out of the page.
    // (Right-click "Save video as..." is already blocked by the global
    // context-menu handler above.)
    document.addEventListener('dragstart', function (e) {
        if (e.target && e.target.tagName === 'VIDEO') {
            e.preventDefault();
            return false;
        }
    });
})();
