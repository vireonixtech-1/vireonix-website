// Animation utilities and scroll-triggered animations
document.addEventListener('DOMContentLoaded', function() {

  // Enhanced Intersection Observer for multiple animation types
  const observeElements = () => {
    const animationClasses = {
      'reveal-up': 'revealed',
      'reveal-left': 'revealed',
      'reveal-right': 'revealed',
      'reveal-scale': 'revealed',
      'reveal-fade': 'revealed',
      'stagger-children': 'stagger-revealed'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add revealed class
          entry.target.classList.add('revealed');

          // Handle stagger animations for children
          if (entry.target.classList.contains('stagger-children')) {
            const children = entry.target.querySelectorAll('.stagger-item');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('revealed');
              }, index * 100);
            });
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    });

    // Observe all reveal elements
    document.querySelectorAll('[class*="reveal-"], .stagger-children').forEach(el => {
      observer.observe(el);
    });
  };

  // Smooth scrolling for anchor links with offset for fixed header
  const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          const headerOffset = 100;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          const mobileMenu = document.querySelector('.mobile-menu');
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
          }
        }
      });
    });
  };

  // Active navigation highlighting
  const initActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    const observerOptions = {
      rootMargin: '-20% 0px -80% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('text-primary', 'font-semibold');
            link.classList.add('text-gray-700');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('text-primary', 'font-semibold');
              link.classList.remove('text-gray-700');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  };

  // Initialize animations
  observeElements();
  initSmoothScrolling();
  initActiveNav();

  // Add scroll-based navbar styling
  const header = document.querySelector('header');
  if (header) {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollY = currentScrollY;
    });
  }

  // Back to top button
  const initBackToTop = () => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        btn.classList.add('opacity-100', 'translate-y-0');
      } else {
        btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        btn.classList.remove('opacity-100', 'translate-y-0');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  initBackToTop();

  // Add loading state management
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger hero animations after load
    setTimeout(() => {
      document.querySelectorAll('.hero-animate').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('hero-visible');
        }, index * 150);
      });
    }, 100);
  });
});

// Utility function for counter animations
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    element.textContent = current;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Parallax effect for hero section
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrollTop * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// Initialize parallax on load
if (window.innerWidth > 768) {
  initParallax();
}

// Add resize handler for responsive behavior
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.parallax').forEach(element => {
      element.style.transform = 'translateY(0)';
    });
  } else {
    initParallax();
  }
});