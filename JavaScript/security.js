/**
 * Security measures: prevent right-click and inspection shortcuts,
 * detect DevTools politely (warning overlay), and hide raw phone numbers.
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

    // Show a warning overlay when DevTools is detected (instead of destroying the page)
    let warningShown = false;
    function showWarning() {
        if (warningShown) return;
        warningShown = true;
        const overlay = document.createElement('div');
        overlay.id = 'devtools-warning';
        overlay.style.cssText =
            'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;' +
            'background:rgba(10,5,30,0.92);backdrop-filter:blur(6px);color:#fff;font-family:sans-serif;text-align:center;padding:20px;';
        overlay.innerHTML =
            '<div><h2 style="margin:0 0 12px;color:#ff2e63;">⚠ Security Alert</h2>' +
            '<p style="margin:0;font-size:15px;">Developer tools access is restricted on this website.<br>Please close DevTools to continue.</p></div>';
        document.body.appendChild(overlay);
    }

    // Lightweight DevTools detection via window size delta
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    function detectDevTools() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const threshold = 160;
        if (Math.abs(w - lastWidth) > threshold || Math.abs(h - lastHeight) > threshold) {
            showWarning();
        }
        lastWidth = w;
        lastHeight = h;
    }

    // Also detect via console timing (non-destructive, generous threshold to avoid false positives)
    function detectViaConsole() {
        const before = performance.now();
        console.log('%c', 'padding: 1px; margin: 0; line-height: 0; display: block;');
        const after = performance.now();
        if (after - before > 200) {
            setTimeout(showWarning, 500);
        }
    }

    // Skip the immediate check (page load is naturally slow); only poll later
    setTimeout(function () {
        setInterval(detectViaConsole, 5000);
        window.addEventListener('resize', detectDevTools);
    }, 3000);

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
})();
