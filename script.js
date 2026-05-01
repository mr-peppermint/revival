// --- 1. FLOATING BACKGROUND PARTICLES ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) this.reset();
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    for (let i = 0; i < 100; i++) particles.push(new Particle());
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', initCanvas);
initCanvas();
createParticles();
animateBackground();

// --- 2. GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
    }
});

tl.to(".main-title", { opacity: 0, y: -50, duration: 1 })
  .to(".element-1", { scale: 4, opacity: 1, duration: 2 })
  .to(".element-1", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-2", { scale: 4, opacity: 1, duration: 2 })
  .to(".element-2", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-3", { scale: 4, opacity: 1, duration: 2 })
  .to(".element-3", { opacity: 0, scale: 6, duration: 1 })
  .to(".element-4", { scale: 6, opacity: 1, duration: 2 });

// --- 3. FINAL PROMPT TRIGGER ---
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "98% bottom", // Triggers at the absolute bottom
    onEnter: () => {
        const box = document.getElementById('dialogueBox');
        box.classList.remove('hidden');
        setTimeout(() => box.style.opacity = "1", 10);
    },
    onLeaveBack: () => {
        const box = document.getElementById('dialogueBox');
        box.style.opacity = "0";
        setTimeout(() => box.classList.add('hidden'), 800);
    }
});

// --- 4. NOTIFICATION LOGIC ---
function sendResponse(answer) {
    // REPLACE 'your-id-here' WITH YOUR FORMSPREE ID
    fetch("https://formspree.io/f/your-id-here", {
        method: "POST",
        body: JSON.stringify({ response: answer }),
        headers: { 'Accept': 'application/json' }
    }).then(() => {
        document.querySelector('.dialogue-content').innerHTML = `
            <p style="letter-spacing: 2px;">Thank you for your honesty. <br>I am listening.</p>
        `;
        setTimeout(() => {
            document.getElementById('dialogueBox').style.opacity = "0";
        }, 3000);
    });
}
