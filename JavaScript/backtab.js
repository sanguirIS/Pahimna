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
 * Smart "Back" button (sub-pages).
 *
 * The sub-pages (weather, password ideas, photo editor, memories, etc.) show a
 * "← Back" link. When that tab was opened as a fresh tab (e.g. from a link),
 * clicking "← Back" closes the tab; otherwise it goes back to the previous
 * page. Falls back to the plain href if JavaScript is unavailable.
 */
document.addEventListener('DOMContentLoaded', function () {
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            // Fresh tab (single history entry) — close it; some browsers
            // refuse, so if the page is still open, head to the main site
            // (the button's own href already points there).
            window.close();
            window.setTimeout(function () {
                window.location.href = btn.href;
            }, 200);
        });
    });
});
