gsap.registerPlugin(ScrollTrigger);

// 1. Core Depth Animation
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

tl.to(".element-1", { scale: 5, opacity: 1, zIndex: 10, duration: 1 })
  .to(".element-1", { opacity: 0, duration: 0.5 })
  .to(".element-2", { scale: 5, opacity: 1, duration: 1 }, "-=0.5")
  .to(".element-2", { opacity: 0, duration: 0.5 })
  .to(".element-3", { scale: 5, opacity: 1, duration: 1 }, "-=0.5")
  .to(".element-3", { opacity: 0, duration: 0.5 })
  .to(".element-4", { scale: 8, opacity: 1, duration: 1.5 }, "-=0.5");

// 2. Fix: Use the end of the entire scroll container as the trigger
ScrollTrigger.create({
    trigger: ".scroll-container",
    start: "bottom bottom", // Only triggers when the bottom of the container hits the bottom of the screen
    onEnter: () => {
        document.getElementById('dialogueBox').classList.remove('hidden');
        document.getElementById('dialogueBox').style.opacity = "1";
    },
    onLeaveBack: () => {
        document.getElementById('dialogueBox').style.opacity = "0";
        // Small delay to allow fade out before hiding
        setTimeout(() => {
            if(document.getElementById('dialogueBox').style.opacity === "0") {
                document.getElementById('dialogueBox').classList.add('hidden');
            }
        }, 500);
    }
});

function sendResponse(answer) {
    fetch("https://formspree.io/f/your-id-here", {
        method: "POST",
        body: JSON.stringify({ response: answer }),
        headers: { 'Accept': 'application/json' }
    }).then(() => {
        document.querySelector('.dialogue-content').innerHTML = "<p>Thank you for letting me know.</p>";
        setTimeout(() => {
            document.getElementById('dialogueBox').classList.add('hidden');
        }, 2000);
    });
}
