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
