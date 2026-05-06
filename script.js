// Navigation toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Scroll reveal animation
const fadeElements = document.querySelectorAll('.fade-in');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;
    
    fadeElements.forEach(element => {
        const revealTop = element.getBoundingClientRect().top;
        if (revealTop < windowHeight - revealPoint) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger on initial load
revealOnScroll();

// Stats counter animation
const counters = document.querySelectorAll('.counter');
let hasAnimated = false;

const animateCounters = () => {
    const statsSection = document.getElementById('achievements');
    if (!statsSection) return;
    
    const sectionTop = statsSection.getBoundingClientRect().top;
    
    if (sectionTop < window.innerHeight - 100 && !hasAnimated) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    // format to 1 decimal place if it's a float, else int
                    counter.innerText = target % 1 === 0 ? Math.ceil(current) : current.toFixed(1);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
        hasAnimated = true;
    }
};

window.addEventListener('scroll', animateCounters);

// Form submission prevent default
const form = document.querySelector('.contact-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! I will get back to you soon.');
        form.reset();
    });
}
