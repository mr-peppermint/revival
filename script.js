// --- 1. THE HEART OCEAN & STAR STRETCH CANVAS ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let time = 0;
let scrollPercent = 0;

// Scroll Velocity Tracking for Star Stretch
let scrollVelocity = 0;
let lastScrollY = window.scrollY;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

// Track scroll to change ocean depth and calculate velocity
window.addEventListener('scroll', () => {
    let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = window.scrollY / scrollHeight; // Goes from 0.0 to 1.0
    
    let currentScrollY = window.scrollY;
    // Calculate how fast the user is scrolling
    scrollVelocity = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
});

// --- STAR CLASS ---
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.random() * canvas.width;
        this.pz = this.z; // Previous Z for drawing lines (the stretch)
    }
    update(velocity) {
        this.pz = this.z;
        // Base drift speed + scroll speed multiplier
        this.z -= (1 + velocity * 0.3); 

        // Recycle star when it goes past the screen
        if (this.z < 1) {
            this.reset();
            this.pz = this.z;
        }
    }
    draw() {
        let fov = canvas.width;
        
        // Current projected 2D position
        let sx = (this.x / this.z) * fov + canvas.width / 2;
        let sy = (this.y / this.z) * fov + canvas.height / 2;
        
        // Previous projected 2D position (creates the stretch line)
        let px = (this.x / this.pz) * fov + canvas.width / 2;
        let py = (this.y / this.pz) * fov + canvas.height / 2;

        // Fade in as they get closer to the viewer
        let alpha = 1 - (this.z / canvas.width);
        
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.lineWidth = alpha * 2;
        
        // Make them slightly blue/white for that deep space/abyss feel
        ctx.strokeStyle = `rgba(230, 240, 255, ${alpha})`; 
        ctx.stroke();
    }
}

// Generate Stars
let stars = [];
for(let i = 0; i < 150; i++) {
    stars.push(new Star());
}

// --- MAIN DRAW LOOP ---
function drawCanvas() {
    // Smoothly decay the scroll velocity so the stretch doesn't stop abruptly
    scrollVelocity *= 0.85; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background color shifts from deep blood red to pitch black based on scroll
    let r = Math.floor(40 * (1 - scrollPercent)); 
    let g = 0;
    let b = Math.floor(10 * (1 - scrollPercent));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw flowing heart waves
    ctx.lineWidth = 2;
    let waveCount = 5;
    
    for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        let amplitude = (80 - (i * 10)) * (1 - scrollPercent * 1.5); 
        if (amplitude < 0) amplitude = 0; 
        
        let pulse = Math.sin(time * 0.05) * 10; 
        let yOffset = canvas.height * 0.5 + (i * 40);

        for (let x = 0; x < canvas.width; x += 10) {
            let y = yOffset + Math.sin(x * 0.01 + time * 0.02 + i) * amplitude + pulse;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        let alpha = 0.5 * (1 - scrollPercent);
        ctx.strokeStyle = `rgba(150, 0, 20, ${alpha})`;
        ctx.stroke();
    }
    
    // Draw the Warp Stars over the dark background
    stars.forEach(star => {
        star.update(scrollVelocity);
        star.draw();
    });

    time++;
    requestAnimationFrame(drawCanvas);
}
drawCanvas();

// --- 2. GSAP SCROLL ANIMATIONS ---
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

// --- 3. FINAL PROMPT TRIGGER & EYES REVEAL ---
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

// --- 4. NOTIFICATION LOGIC ---
function sendResponse(answer) {
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
        }, 3000);
    });
}
