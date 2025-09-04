// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all animations
    initializeAnimations();
    initializeScrollAnimations();
    initializeInteractiveEffects();
    initializeTypewriterEffect();
    
    // Add some dynamic floating elements
    createDynamicFloatingElements();
});

// Initialize entrance animations with delays
function initializeAnimations() {
    const imageCards = document.querySelectorAll('.image-card');
    
    // Add staggered animation delays
    imageCards.forEach((card, index) => {
        const delay = index * 0.2;
        card.style.animationDelay = `${delay}s`;
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// Initialize scroll-based animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                
                // Add special effects for image cards
                if (entry.target.classList.contains('image-card')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                }
            }
        });
    }, observerOptions);
    
    // Observe all image cards
    document.querySelectorAll('.image-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize interactive effects
function initializeInteractiveEffects() {
    // Add click effects to image cards
    const imageCards = document.querySelectorAll('.image-card');
    
    imageCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add pulse animation
            this.classList.add('animate-pulse');
            
            // Remove pulse animation after it completes
            setTimeout(() => {
                this.classList.remove('animate-pulse');
            }, 2000);
            
            // Add a temporary glow effect
            this.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 1000);
        });
    });
    
    // Add mouse movement parallax effect
    document.addEventListener('mousemove', function(e) {
        const floatingShapes = document.querySelectorAll('.floating-shape');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingShapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Initialize typewriter effect for words
function initializeTypewriterEffect() {
    const words = document.querySelectorAll('.word');
    
    words.forEach((word, index) => {
        const delay = index * 1000; // 1 second delay between words
        
        setTimeout(() => {
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
            
            // Add a subtle bounce effect
            word.style.animation = 'typewriter 0.8s ease-out both';
            
            // Add hover effect
            word.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.color = '#ffd700';
                this.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
            });
            
            word.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.color = '#ffffff';
                this.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
            });
        }, delay);
    });
}

// Create dynamic floating elements
function createDynamicFloatingElements() {
    const container = document.querySelector('.floating-elements');
    
    // Create additional floating particles
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-shape';
        particle.style.width = Math.random() * 40 + 20 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
        particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        
        container.appendChild(particle);
    }
}

// Add keyboard interactions
document.addEventListener('keydown', function(e) {
    // Press 'A' to animate all cards
    if (e.key.toLowerCase() === 'a') {
        const imageCards = document.querySelectorAll('.image-card');
        imageCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow
                card.style.animation = 'float 1s ease-in-out';
            }, index * 100);
        });
    }
    
    // Press 'R' to reset animations
    if (e.key.toLowerCase() === 'r') {
        location.reload();
    }
});

// Add touch interactions for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up - animate cards
            animateCardsOnSwipe();
        } else {
            // Swipe down - reset animations
            resetAnimations();
        }
    }
}

function animateCardsOnSwipe() {
    const imageCards = document.querySelectorAll('.image-card');
    imageCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(-20px) scale(1.05)';
            card.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
            }, 300);
        }, index * 100);
    });
}

function resetAnimations() {
    const imageCards = document.querySelectorAll('.image-card');
    imageCards.forEach(card => {
        card.style.transform = '';
        card.style.transition = '';
    });
}

// Add performance optimization
function optimizePerformance() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.body.classList.add('reduced-motion');
    }
    
    // Add reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
}

// Initialize performance optimizations
optimizePerformance();

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add a subtle entrance animation for the entire page
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
        document.querySelector('.container').style.transform = 'translateY(0)';
    }, 100);
});

// Add resize handler for responsive adjustments
window.addEventListener('resize', function() {
    // Recalculate floating element positions
    const floatingShapes = document.querySelectorAll('.floating-shape');
    floatingShapes.forEach(shape => {
        if (parseFloat(shape.style.left) > 90) {
            shape.style.left = '90%';
        }
        if (parseFloat(shape.style.top) > 90) {
            shape.style.top = '90%';
        }
    });
});
