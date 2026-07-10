const shadow = document.querySelector(".cursor-shadow");
const revealItems = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let shadowX = mouseX;
let shadowY = mouseY;
let lastMouseX = mouseX;
let lastMouseY = mouseY;
let cursorEnergy = 0;

function animateShadow() {
  const dx = mouseX - lastMouseX;
  const dy = mouseY - lastMouseY;
  const speed = Math.min(Math.hypot(dx, dy), 90);

  cursorEnergy += (speed / 90 - cursorEnergy) * 0.12;
  shadowX += (mouseX - shadowX) * 0.075;
  shadowY += (mouseY - shadowY) * 0.075;

  shadow.style.left = `${shadowX}px`;
  shadow.style.top = `${shadowY}px`;
  shadow.style.setProperty("--cursor-size", `${460 + cursorEnergy * 180}px`);
  shadow.style.setProperty("--cursor-saturation", `${1.12 + cursorEnergy * 0.45}`);

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  requestAnimationFrame(animateShadow);
}

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener("pointerleave", () => {
  shadow.style.opacity = "0";
});

window.addEventListener("pointerenter", () => {
  shadow.style.opacity = "0.85";
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (heroVisual) {
  heroVisual.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroVisual.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
  });

  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

const ticker = document.querySelector(".ticker");
if (ticker) {
  ticker.innerHTML += ticker.innerHTML;
}

animateShadow();
