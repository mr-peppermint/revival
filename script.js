// --- 1. THE HEART OCEAN CANVAS ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let time = 0;
let scrollPercent = 0;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

// Track scroll to change the ocean depth
window.addEventListener('scroll', () => {
    let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = window.scrollY / scrollHeight; // Goes from 0.0 to 1.0
});

function drawHeartOcean() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background color shifts from deep blood red to pitch black based on scroll
    let r = Math.floor(40 * (1 - scrollPercent)); 
    let g = 0;
    let b = Math.floor(10 * (1 - scrollPercent));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw flowing waves
    ctx.lineWidth = 2;
    let waveCount = 5;
    
    for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        
        // As you scroll deeper, the waves flatten out (amplitude decreases) and vanish
        let amplitude = (80 - (i * 10)) * (1 - scrollPercent * 1.5); 
        if (amplitude < 0) amplitude = 0; 
        
        // Heartbeat pulse effect mixed with ocean drift
        let pulse = Math.sin(time * 0.05) * 10; 
        let yOffset = canvas.height * 0.5 + (i * 40);

        for (let x = 0; x < canvas.width; x += 10) {
            let y = yOffset + Math.sin(x * 0.01 + time * 0.02 + i) * amplitude + pulse;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        // Color of the waves fades to black
        let alpha = 0.5 * (1 - scrollPercent);
        ctx.strokeStyle = `rgba(150, 0, 20, ${alpha})`;
        ctx.stroke();
    }
    
    // Add "bubbles" or "blood cells" that slow down and disappear in the dark
    for(let j = 0; j < 30; j++) {
        let px = (Math.sin(j * 14.3 + time * 0.01) * 0.5 + 0.5) * canvas.width;
        let py = ((time * (0.5 + j * 0.05)) % canvas.height);
        
        let pAlpha = 0.3 * (1 - scrollPercent * 1.2);
        if (pAlpha > 0) {
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 50, 50, ${pAlpha})`;
            ctx.fill();
        }
    }

    time++;
    requestAnimationFrame(drawHeartOcean);
}
drawHeartOcean();

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
            // Her eyes remain on the screen in the dark.
        }, 3000);
    });
}
