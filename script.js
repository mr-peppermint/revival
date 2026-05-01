// --- 1. CANVAS SETUP ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let scrollPercent = 0;

// Scroll tracking
let scrollVelocity = 0;
let lastScrollY = window.scrollY;
let isScrolling = false;
let scrollTimeout;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

// --- SCROLL LISTENER ---
window.addEventListener('scroll', () => {
    let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = window.scrollY / scrollHeight;

    let currentScrollY = window.scrollY;
    scrollVelocity = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    isScrolling = true;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        scrollVelocity = 0; // hard stop
    }, 120);
});

// --- DOT CLASS ---
class Dot {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.random() * canvas.width;
        this.size = Math.random() * 1.8 + 0.2; // tiny sizes
    }

    update(velocity) {
        this.z -= (0.8 + velocity * 0.25);

        if (this.z < 1) {
            this.reset();
        }
    }

    draw() {
        let fov = canvas.width;

        let sx = (this.x / this.z) * fov + canvas.width / 2;
        let sy = (this.y / this.z) * fov + canvas.height / 2;

        let alpha = 1 - (this.z / canvas.width);

        ctx.beginPath();
        ctx.arc(sx, sy, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
    }
}

// --- CREATE DOTS ---
let dots = [];
for (let i = 0; i < 180; i++) {
    dots.push(new Dot());
}

// --- DRAW LOOP ---
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (same as yours)
    let r = Math.floor(40 * (1 - scrollPercent));
    let g = 0;
    let b = Math.floor(10 * (1 - scrollPercent));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    dots.forEach(dot => {
        if (isScrolling) {
            dot.update(scrollVelocity);
        }
        dot.draw();
    });

    requestAnimationFrame(drawCanvas);
}
drawCanvas();


// --- 2. GSAP (UNCHANGED) ---
gsap.registerPlugin(ScrollTrigger);

const isMobile = window.innerWidth <= 768;
const baseZoomScale = isMobile ? 'var(--zoom-scale)' : 4;
const finalZoomScale = isMobile ? 'var(--zoom-scale)' : 6;

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
    }
});

tl.to(".main-title", { opacity: 0, y: -50, duration: 1 })
  .to(".element-1", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-1", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-2", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-2", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-3", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-3", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-4", { scale: finalZoomScale, opacity: 1, duration: 2.5 });


// --- 3. FINAL PROMPT ---
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "98% bottom",
    onEnter: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');

        eyes.style.opacity = "1";
        box.classList.remove('hidden');
        setTimeout(() => box.style.opacity = "1", 50);
    },
    onLeaveBack: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');

        eyes.style.opacity = "0";
        box.style.opacity = "0";
        setTimeout(() => box.classList.add('hidden'), 800);
    }
});


// --- 4. FORM ---
function sendResponse(answer) {
    fetch("https://formspree.io/f/meenogkq", {
        method: "POST",
        body: JSON.stringify({ response: answer }),
        headers: { 'Accept': 'application/json' }
    }).then(() => {
        document.querySelector('.dialogue-content').innerHTML = `
            <p style="letter-spacing: 2px;">Thank you for your honesty.<br>I am listening.</p>
        `;
        setTimeout(() => {
            document.getElementById('dialogueBox').style.opacity = "0";
        }, 3000);
    });
}
