// --- 1. FLOATING BACKGROUND PARTICLES (Keep this section) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId;

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
    animationFrameId = requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', initCanvas);
initCanvas();
createParticles();
animateBackground();

// --- 2. GSAP SCROLL ANIMATIONS (Updated for Mobile-Friendly Zooms) ---
gsap.registerPlugin(ScrollTrigger);

// Check if mobile to adjust scales (uses the variable from style.css)
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
  
  // Element 1 (Reality)
  .to(".element-1", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-1", { opacity: 0, scale: 6, duration: 1 })
  
  // Element 2 (Effort)
  .to(".element-2", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-2", { opacity: 0, scale: 6, duration: 1 })
  
  // Element 3 (Accountability)
  .to(".element-3", { scale: baseZoomScale, opacity: 1, duration: 2 })
  .to(".element-3", { opacity: 0, scale: 6, duration: 1 })
  
  // Element 4 (Remorse) -> This zooms extra so it fades "into" her face
  .to(".element-4", { scale: finalZoomScale, opacity: 1, duration: 2.5 });

// --- 3. FINAL PROMPT TRIGGER & THE IMAGE REVEAL (This is the critical "End State") ---
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "98% bottom", // Triggers at the absolute bottom
    onEnter: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');
        const canvas = document.getElementById('bgCanvas');

        // Reveal the Eyes smoothly
        eyes.style.opacity = "1";
        canvas.style.opacity = "0.15"; // Dim particles so eyes show through better
        
        // Show Dialogue Box
        box.classList.remove('hidden');
        setTimeout(() => box.style.opacity = "1", 50);
    },
    onLeaveBack: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');
        const canvas = document.getElementById('bgCanvas');

        // Reset backgrounds
        eyes.style.opacity = "0";
        canvas.style.opacity = "1"; // Bring particles back to full brightness
        
        // Hide Dialogue Box
        box.style.opacity = "0";
        setTimeout(() => box.classList.add('hidden'), 800);
    }
});

// --- 4. NOTIFICATION LOGIC (Updated Form Endpoint) ---
function sendResponse(answer) {
    // Linked to: https://formspree.io/f/meenogkq
    fetch("https://formspree.io/f/meenogkq", { 
        method: "POST",
        body: JSON.stringify({ response: answer }),
        headers: { 'Accept': 'application/json' }
    }).then(() => {
        document.querySelector('.dialogue-content').innerHTML = `
            <p style="letter-spacing: 2px;">Thank you for your honesty. <br>I am listening.</p>
        `;
        setTimeout(() => {
            document.getElementById('dialogueBox').style.opacity = "0";
            // Important: We keep her eyes visible here. The moment of reflection holds.
        }, 3000);
    });
}
