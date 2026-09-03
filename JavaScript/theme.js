<!--
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
-->

(function () {
    'use strict';

    var root = document.documentElement;
    var STORAGE_KEY = 'pahimna-theme';

    
    
    
    function applyInitialTheme() {
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {  }

        if (saved === 'light') {
            root.setAttribute('data-theme', 'light');
        } else if (saved !== 'dark') {

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                root.setAttribute('data-theme', 'light');
            } else {
                root.removeAttribute('data-theme');
            }
        }

    }

    
    
    
    function syncThemeUI() {
        var isLight = root.getAttribute('data-theme') === 'light';
        var toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(function (btn) {
            var icon = btn.querySelector('i');
            if (icon) {
                icon.className = isLight ? 'la la-moon-o' : 'la la-sun-o';
            }
            btn.setAttribute('aria-pressed', String(isLight));
            btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        });
    }

    
    
    
    function setTheme(nextLight) {
        if (nextLight) {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
    }

    
    
    
    var fadeTimer = null;

    function animateThemeSwitch(nextLight) {
        var prefersReduced = false;
        try {
            prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {  }

        if (prefersReduced) {
            setTheme(nextLight);
            return;
        }

        if (document.startViewTransition) {
            try {
                document.startViewTransition(function () {
                    setTheme(nextLight);
                });
                return;
            } catch (e) {  }
        }

        document.documentElement.classList.add('theme-transition');
        setTheme(nextLight);
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(function () {
            document.documentElement.classList.remove('theme-transition');
        }, 500);
    }

    
    
    
    function bindToggles() {
        var toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var isLight = root.getAttribute('data-theme') === 'light';
                animateThemeSwitch(!isLight);
                try {
                    localStorage.setItem(STORAGE_KEY, isLight ? 'dark' : 'light');
                } catch (e) {  }
                syncThemeUI();
            });
        });
    }

    
    
    
    function bindSystemListener() {
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {  }

        if (saved === 'light' || saved === 'dark') return;

        var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
        if (mq && mq.addEventListener) {
            mq.addEventListener('change', function () {

                var current = null;
                try { current = localStorage.getItem(STORAGE_KEY); } catch (e) {  }
                if (current === 'light' || current === 'dark') return;

                animateThemeSwitch(mq.matches);
                syncThemeUI();
            });
        }
    }

    
    
    
    document.addEventListener('DOMContentLoaded', function () {
        applyInitialTheme();
        syncThemeUI();
        bindToggles();
        bindSystemListener();
    });
})();
