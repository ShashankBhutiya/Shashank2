// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = document.querySelector('button[onclick="toggleMobileMenu()"]');
    
    if (mobileMenu && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
        mobileMenu.classList.add('hidden');
    }
});

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Header Scroll Effect
    const header = document.getElementById('dynamic-header');
    const headerLinks = header.getElementsByTagName('a');
    const headerLogo = header.querySelector('.text-2xl');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Mouse Hover Effect
    function handleMouseMove(event, element) {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        
        element.style.transform = `
            perspective(1000px) 
            rotateX(${y * 10}deg) 
            rotateY(${x * 10}deg) 
            scale3d(1.05, 1.05, 1.05)
        `;
    }

    function handleMouseLeave(element) {
        element.style.transform = 'none';
    }

    // Apply Hover Effects
    document.querySelectorAll('.hover-scale').forEach(element => {
        element.classList.add('mouse-effect');
        
        element.addEventListener('mousemove', (e) => {
            handleMouseMove(e, element);
        });

        element.addEventListener('mouseleave', () => {
            handleMouseLeave(element);
        });
    });

    // Apply Hover Effects to Header Elements
    [...headerLinks, headerLogo].forEach(element => {
        element.classList.add('mouse-effect');
        
        element.addEventListener('mousemove', (e) => {
            handleMouseMove(e, element);
        });

        element.addEventListener('mouseleave', () => {
            handleMouseLeave(element);
        });
    });
});

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Initialize Lucide Icons
lucide.createIcons();

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Reveal Animations
document.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => {
        if (isElementInViewport(el)) {
            el.classList.add('opacity-100', 'translate-y-0');
            el.classList.remove('opacity-0', 'translate-y-10');
        }
    });
});

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Form Submission Handling
const contactForm = document.querySelector('form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        alert('Thank you for your interest! We will contact you soon.');
        contactForm.reset();
    });
}