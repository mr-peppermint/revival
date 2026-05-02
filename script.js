// --- 1. STARFIELD CONFIGURATION ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let stars = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 800; i++) {
        stars.push(new Star());
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.baseOpacity = Math.random() * 0.7 + 0.3;
        this.parallax = Math.random() * 0.4 + 0.1;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        const sTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        this.renderY = (this.y - (sTop * this.parallax)) % canvas.height;
        if (this.renderY < 0) this.renderY += canvas.height;
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.renderY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

function animate() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
}

initCanvas();
window.addEventListener('resize', initCanvas);
animate();

// --- 2. MUSIC TRIGGER ---
const music = document.getElementById('bgMusic');
function startMusic() {
    if (music && music.paused) {
        music.play().then(() => {
            music.volume = 0;
            gsap.to(music, { volume: 0.3, duration: 4 });
            ['scroll', 'click', 'touchstart'].forEach(ev => window.removeEventListener(ev, startMusic));
        });
    }
}
['scroll', 'click', 'touchstart'].forEach(ev => window.addEventListener(ev, startMusic));

// --- 3. GSAP CORE & SPHERE TRANSFORM ---
gsap.registerPlugin(ScrollTrigger);
const sphere = document.getElementById('heartSphere');

// Sphere Fade In
gsap.to(sphere, {
    scrollTrigger: { trigger: ".scroll-container", start: "5% top", toggleActions: "play none none reverse" },
    opacity: 1, duration: 1
});

// Main Sphere Gradient & Beat logic
const mainTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container", start: "top top", end: "bottom bottom", scrub: 1.5,
        onUpdate: (self) => {
            const p = self.progress;
            const gbValue = Math.floor(255 - (p * 255));
            const glowIntensity = 0.4 + (p * 0.6);
            
            // RED RADIAL SHIFT
            sphere.style.background = `radial-gradient(circle at 30% 30%, 
                rgba(255,255,255,1) 0%, 
                rgb(255, ${gbValue}, ${gbValue}) 40%, 
                rgb(${Math.max(0, gbValue - 50)}, 0, 0) 100%)`;

            const bloom = 20 + (p * 100);
            sphere.style.filter = `blur(${2 + (p * 8)}px) brightness(${1 + p * 1.5})`;
            sphere.style.boxShadow = `
                0 0 ${bloom/2}px rgba(255, 0, 0, ${glowIntensity}),
                0 0 ${bloom}px rgba(255, 20, 20, ${glowIntensity * 0.6})
            `;
            
            if (p > 0.88) sphere.classList.add('beating');
            else sphere.classList.remove('beating');
        }
    }
});

mainTl.to(".main-title", { opacity: 0, y: -50, duration: 1 });
document.querySelectorAll('.core-element').forEach(el => {
    mainTl.to(el, { opacity: 1, scale: 3, duration: 2 }).to(el, { opacity: 0, scale: 5, duration: 1 });
});

// --- 4. SIDE PROMPTS (ECHOES) FLYING INTO ORB ---
document.querySelectorAll('.echo').forEach((echo, i) => {
    echo.style.top = `${20 + (i * 8)}%`;
    const isLeft = echo.classList.contains('left');
    
    gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: `${i * 10}% top`,
            end: `${(i * 10) + 15}% top`,
            scrub: 1
        }
    })
    .to(echo, { opacity: 1, x: isLeft ? 50 : -50, duration: 1 })
    .to(echo, { 
        x: isLeft ? (window.innerWidth/2 - 50) : -(window.innerWidth/2 - 50),
        y: (window.innerHeight/2 - echo.offsetTop),
        fontSize: "0rem", opacity: 0, duration: 2
    });
});

// --- 5. INTERACTIVE BRANCHING & NOTIFICATION ---
const originalDialogue = `
    <p>"Angel, Doubt Should Not Be Base Of Friendship. Choose Wisely You Mean Lot To ME"</p>
    <div class="options">
        <button onclick="sendResponse('Lets Fix It', event)">Lets Fix It Together</button>
        <button onclick="sendResponse('Become Strangers', event)">Become Strangers</button>
    </div>
`;

function sendResponse(answer, event) {
    const textCont = document.getElementById('dialogueText');

    // ALERT NOTIFICATION LOGIC
    fetch("https://formspree.io/f/meenogkq", { 
        method: "POST",
        body: JSON.stringify({ response: answer, timestamp: new Date().toLocaleString() }),
        headers: { 'Accept': 'application/json' }
    }).catch(error => console.log("Log fail silent"));

    // Visual Particles
    createParticles(event.clientX, event.clientY, answer === 'Lets Fix It' ? '#ffffff' : '#cc0000');

    if (answer === 'Become Strangers') {
        gsap.to(textCont, { opacity: 0, duration: 0.5, onComplete: () => {
            textCont.innerHTML = `
                <p>Really? 3% That Was Chance I Gambled For This AJ, <br>
                Try Again You Are Stuck With Me</p>
                <div class="options">
                    <button onclick="resetDialogue(event)">Try Again</button>
                    <button onclick="resetDialogue(event)">Try Again</button>
                </div>
            `;
            gsap.to(textCont, { opacity: 1, duration: 0.8 });
        }});
    } else {
        gsap.to(textCont, { opacity: 0, duration: 0.5, onComplete: () => {
            textCont.innerHTML = `
                <p>Hell Yeah Mate, We Got This.</p>
                <div id="finalPoem" style="opacity: 0; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                    <p>What will I <span class="highlight-red">Lose</span> if I have you?<br>
                    What will I <span class="highlight-red">Have</span> if I lose you?</p>
                </div>
            `;
            gsap.to(textCont, { opacity: 1, duration: 1 });
            gsap.to("#finalPoem", { opacity: 1, duration: 2, delay: 1 });
        }});
    }
}

function resetDialogue(event) {
    const textCont = document.getElementById('dialogueText');
    createParticles(event.clientX, event.clientY, '#444444');
    gsap.to(textCont, { opacity: 0, duration: 0.4, onComplete: () => {
        textCont.innerHTML = originalDialogue;
        gsap.to(textCont, { opacity: 1, duration: 0.6 });
    }});
}

function createParticles(x, y, color) {
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        Object.assign(p.style, { backgroundColor: color, width: '4px', height: '4px', left: 0, top: 0 });
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 120 + 40;
        gsap.set(p, { x: x, y: y });
        gsap.to(p, { 
            x: x + Math.cos(angle) * dist, 
            y: y + Math.sin(angle) * dist, 
            opacity: 0, scale: 0, duration: 1.2, 
            onComplete: () => p.remove() 
        });
    }
}

// Final Trigger
ScrollTrigger.create({
    trigger: ".scroll-container", start: "99% bottom",
    onEnter: () => {
        const box = document.getElementById('dialogueBox');
        box.classList.remove('hidden');
        gsap.to(box, { opacity: 1, duration: 1 });
        gsap.to("#eyesBackground", { opacity: 1, duration: 1 });
    }
});
