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
