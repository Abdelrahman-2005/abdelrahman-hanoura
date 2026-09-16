/**
 * Abdelrahman Hanoura - Portfolio Interactive Logic
 * Modern Canva-inspired interactivity & AOS integration
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animate On Scroll (AOS)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80
        });
    }

    // 2. Sticky Navbar with blur transition on scroll
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');

    const handleScroll = () => {
        const scrollY = window.scrollY;

        // Navbar shadow effect
        if (scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Active link tracking
        highlightActiveNavLink();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 3. Back to Top Button Click
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 4. Mobile Navigation Drawer
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburgerBtn.classList.toggle('open', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when any navigation link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    hamburgerBtn.classList.remove('open');
                    hamburgerBtn.setAttribute('aria-expanded', false);
                }
            });
        });
    }

    // 5. Active Nav Link on Scroll
    const sections = document.querySelectorAll('section[id]');

    function highlightActiveNavLink() {
        const scrollY = window.pageYOffset + 120;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-menu a[href*="#${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }

    // 6. Interactive Contact Form with Validation & Feedback Toast
    const contactForm = document.getElementById('contact-form');
    const feedbackEl = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.form-error-msg').forEach(msg => msg.textContent = '');
            if (feedbackEl) {
                feedbackEl.className = 'form-feedback';
                feedbackEl.style.display = 'none';
            }

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const subjectInput = document.getElementById('contact-subject');
            const messageInput = document.getElementById('contact-message');

            let isValid = true;

            // Validate Name
            if (!nameInput.value.trim()) {
                document.getElementById('name-error').textContent = 'Please provide your name.';
                isValid = false;
            }

            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
                document.getElementById('email-error').textContent = 'Please enter a valid email address.';
                isValid = false;
            }

            // Validate Subject
            if (!subjectInput.value.trim()) {
                document.getElementById('subject-error').textContent = 'Please specify a subject.';
                isValid = false;
            }

            // Validate Message
            if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
                document.getElementById('message-error').textContent = 'Please enter a message (at least 10 characters).';
                isValid = false;
            }

            if (!isValid) return;

            // Simulate sending feedback with button loading state
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                // Display success notification
                if (feedbackEl) {
                    feedbackEl.innerHTML = `<i class="fas fa-circle-check"></i> Thank you, <strong>${nameInput.value.trim()}</strong>! Your message has been prepared. You can also reach me directly at <a href="mailto:hanouraabdo8@gmail.com" style="text-decoration: underline; font-weight: 700;">hanouraabdo8@gmail.com</a>.`;
                    feedbackEl.className = 'form-feedback success';
                    feedbackEl.style.display = 'block';
                }

                // Optional: open default mail client with pre-filled details
                const mailtoUrl = `mailto:hanouraabdo8@gmail.com?subject=${encodeURIComponent(subjectInput.value)}&body=${encodeURIComponent("From: " + nameInput.value + " (" + emailInput.value + ")\n\n" + messageInput.value)}`;
                window.location.href = mailtoUrl;

                contactForm.reset();
            }, 700);
        });
    }
});
