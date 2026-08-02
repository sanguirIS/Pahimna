let circularProgress = document.querySelector(".circular-progress"),
    progressValue = document.querySelector(".progress-value");

let progressStartValue = 0,
    progressEndValue = 100,
    speed = 50;

let progress = setInterval(() => {
    progressStartValue++;

    progressValue.textContent = `${progressStartValue}%`;
    circularProgress.style.background = `conic-gradient(#ff2e63 ${progressStartValue * 3.6}deg, rgba(255,255,255,0.12) 0deg)`;

    if (progressStartValue >= progressEndValue) {
        clearInterval(progress);
        setTimeout(() => {
            window.location.href = "terms&regulation.html";
        }, 400);
    }
}, speed);
