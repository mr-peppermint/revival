// --- 1. STARFIELD CONFIGURATION ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let stars = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    // Density matches the high-contrast look of image_cf3981.png
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
        
        // Subtle 2D drift
        this.vx = (Math.random() - 0.5) * 0.1;
        
        // Parallax depth (background vs foreground stars)
        this.parallax = Math.random() * 0.4 + 0.1;
        
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        // Horizontal drift
        this.x += this.vx;

        // Vertical scroll logic (Smooth Modulo wrap)
        const sTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        let scrollShift = sTop * this.parallax;
        
        this.renderY = (this.y - scrollShift) % canvas.height;
        if (this.renderY < 0) this.renderY += canvas.height;

        this.renderX = (this.x % canvas.width + canvas.width) % canvas.width;

        // Twinkle effect
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
    }

    draw() {
        ctx.beginPath();
        // Math.floor prevents sub-pixel blurring for a sharper, crisp look
        ctx.arc(Math.floor(this.renderX), Math.floor(this.renderY), this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        
        if (this.size > 1.2) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = "white";
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
    }
}

function animate() {
    ctx.fillStyle = '#000';
    ctx.shadowBlur = 0; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
        s.update();
        s.draw();
    });
    requestAnimationFrame(animate);
}

// Initializing Starfield
initCanvas();
window.addEventListener('resize', initCanvas);
animate();

// --- 2. MUSIC TRIGGER LOGIC ---
const music = document.getElementById('bgMusic');

function startMusic() {
    if (music && music.paused) {
        music.play().then(() => {
            music.volume = 0;
            // Smoothly fade music to 30% volume
            gsap.to(music, { volume: 0.3, duration: 4 });
            
            // Clean up listeners
            window.removeEventListener('scroll', startMusic);
            window.removeEventListener('click', startMusic);
            window.removeEventListener('touchstart', startMusic);
        }).catch(err => console.log("Waiting for user interaction for audio..."));
    }
}

window.addEventListener('scroll', startMusic);
window.addEventListener('click', startMusic);
window.addEventListener('touchstart', startMusic);

// --- 3. GSAP CORE ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);
const sphere = document.getElementById('heartSphere');

// Show sphere after initial scroll
gsap.to(sphere, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "5% top",
        toggleActions: "play none none reverse"
    },
    opacity: 1,
    duration: 1
});

// Main Sphere Transformation Timeline
const mainTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
            const p = self.progress;
            const gbValue = Math.floor(255 - (p * 255));
            const glowIntensity = 0.4 + (p * 0.6);
            const highlightOffset = p * 40;
            
            // Sphere turns from White to Red as we go deeper
            sphere.style.background = `radial-gradient(circle at ${50 - highlightOffset}% ${50 - highlightOffset}%, 
                rgba(255,255,255,1) 0%, 
                rgb(255, ${gbValue}, ${gbValue}) 40%, 
                rgb(${Math.max(0, gbValue - 50)}, 0, 0) 100%)`;

            const bloom = 20 + (p * 100);
            sphere.style.filter = `blur(${2 + (p * 8)}px) brightness(${1 + p * 1.5})`;
            sphere.style.boxShadow = `
                0 0 ${bloom / 2}px rgba(255, 0, 0, ${glowIntensity}),
                0 0 ${bloom}px rgba(255, 20, 20, ${glowIntensity * 0.6}),
                inset 0 0 15px rgba(255, 255, 255, ${0.5 - p * 0.3})
            `;
            
            if (p > 0.88) sphere.classList.add('beating');
            else sphere.classList.remove('beating');
        }
    }
});

mainTl.to(".main-title", { opacity: 0, y: -50, duration: 1 });

// Animate Core Phrases
document.querySelectorAll('.core-element').forEach(el => {
    mainTl.to(el, { opacity: 1, scale: 3, duration: 2 })
          .to(el, { opacity: 0, scale: 5, duration: 1 });
});

// --- 4. ECHO TEXT ANIMATION ---
document.querySelectorAll('.echo').forEach((echo, i) => {
    echo.style.top = `${20 + (i * 12)}%`;
    const isLeft = echo.classList.contains('left');
    
    gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: `${i * 10}% top`,
            end: `${(i * 10) + 20}% top`,
            scrub: 1
        }
    })
    .to(echo, { opacity: 1, x: isLeft ? 50 : -50, duration: 1 })
    .to(echo, { 
        x: isLeft ? (window.innerWidth/2 - 50) : -(window.innerWidth/2 - 50),
        y: (window.innerHeight/2 - echo.offsetTop),
        fontSize: "0.2rem",
        opacity: 0,
        duration: 3
    });
});

// --- 5. INTERACTIVE PARTICLES & DIALOGUE ---
function sendResponse(answer, event) {
    const color = (answer === 'Yes, Sure') ? '#ffffff' : '#cc0000';
    createParticles(event.clientX, event.clientY, color);
    
    const textCont = document.getElementById('dialogueText');
    
    gsap.to(textCont, {
        opacity: 0, 
        duration: 0.8, 
        onComplete: () => {
            textCont.innerHTML = `
                <p>What will I <span class="highlight-red">Lose</span> if I have you?<br>
                What will I <span class="highlight-red">Have</span> if I lose you?</p>
            `;
            gsap.to(textCont, { opacity: 1, duration: 1.5 });
        }
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 45; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 160 + 40;
        
        gsap.set(p, { x: x, y: y });
        gsap.to(p, {
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            opacity: 0, scale: 0, duration: 1.2, 
            onComplete: () => p.remove()
        });
    }
}

// --- 6. FINAL TRIGGER (SCENE REVEAL + MUSIC INTENSITY) ---
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "99% bottom", 
    onEnter: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');
        box.classList.remove('hidden');
        setTimeout(() => {
            box.style.opacity = "1";
            eyes.style.opacity = "1";
        }, 10);
        
        // Climax: swell the music volume
        if (music) gsap.to(music, { volume: 0.3, duration: 2 });
    },
    onLeaveBack: () => {
        const box = document.getElementById('dialogueBox');
        const eyes = document.getElementById('eyesBackground');
        box.style.opacity = "0";
        eyes.style.opacity = "0";
        setTimeout(() => {
            if(box.style.opacity === "0") box.classList.add('hidden');
        }, 800);
        
        // Return music to calm ambient levels
        if (music) gsap.to(music, { volume: 0.3, duration: 2 });
    }
});
