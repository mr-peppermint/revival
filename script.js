gsap.registerPlugin(ScrollTrigger);

// Depth Animation: Elements zoom toward user as they scroll down
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smoothly links scroll to animation
    }
});

tl.to(".element-1", { scale: 5, opacity: 1, zIndex: 10, duration: 1 })
  .to(".element-1", { opacity: 0, duration: 0.5 })
  .to(".element-2", { scale: 5, opacity: 1, duration: 1 }, "-=0.5")
  .to(".element-2", { opacity: 0, duration: 0.5 })
  .to(".element-3", { scale: 5, opacity: 1, duration: 1 }, "-=0.5")
  .to(".element-3", { opacity: 0, duration: 0.5 })
  .to(".element-4", { scale: 8, opacity: 1, duration: 1.5 }, "-=0.5");

// Show Dialogue Box at the very bottom
ScrollTrigger.create({
    trigger: ".end-trigger",
    start: "bottom bottom",
    onEnter: () => document.getElementById('dialogueBox').classList.remove('hidden'),
    onLeaveBack: () => document.getElementById('dialogueBox').classList.add('hidden')
});

// Notification Function
function sendResponse(answer) {
    // To get a notification, you can use a free service like Formspree
    // Replace 'your-formspree-id' with an actual ID from formspree.io
    fetch("https://formspree.io/f/your-id-here", {
        method: "POST",
        body: JSON.stringify({ response: answer }),
        headers: { 'Accept': 'application/json' }
    }).then(() => {
        alert("Your response has been sent.");
        document.getElementById('dialogueBox').innerHTML = "<p>Thank you.</p>";
    });
}