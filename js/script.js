// ===========================
// Scroll to Top on Page Load
// ===========================
function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// Run immediately
scrollToTop();

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', scrollToTop);

// Run on load
window.addEventListener('load', scrollToTop);

// Run with small delay to be sure
setTimeout(scrollToTop, 100);
setTimeout(scrollToTop, 500);

// ===========================
// Image Loading & Error Handling
// ===========================
function handleMenuImageError(imgElement, menuIndex) {
    imgElement.style.display = 'none';
    const placeholder = document.getElementById(`menu-placeholder-${menuIndex}`);
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}

function checkImagesOnLoad() {
    const images = document.querySelectorAll('.product-image, .menu-image');
    images.forEach((img, index) => {
        if (!img.complete) {
            img.addEventListener('load', function() {
                // Image loaded successfully
            });
            img.addEventListener('error', function() {
                // Image failed to load
                img.style.display = 'none';
            });
        } else if (img.naturalHeight === 0) {
            // Image already failed or doesn't exist
            img.style.display = 'none';
        }
    });
}

// Check images when page loads
document.addEventListener('DOMContentLoaded', checkImagesOnLoad);

// Also check when entire page is fully loaded
window.addEventListener('load', checkImagesOnLoad);

// ===========================
// Hamburger Menu & Navigation Setup
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && navMenu && navLinks.length > 0) {
        // Toggle menu on hamburger click
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            console.log('Hamburger clicked, menu active:', navMenu.classList.contains('active'));
        });

        // Handle all nav link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                console.log('Nav link clicked:', targetId);
                
                // Close menu immediately
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                
                if (targetElement) {
                    // Add small delay for menu to close
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                }
            });
        });

        // Close menu when clicking outside navbar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('Clicked outside, menu closed');
            }
        });
    }
});

// ===========================
// Scroll Animation Observer - DISABLED FOR NOW
// ===========================
// TODO: Re-enable animation with proper menu loading handling
// const observerOptions = {
//     threshold: 0.1,
//     rootMargin: '0px 0px -50px 0px'
// };
//
// const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.style.opacity = '1';
//             entry.target.style.transform = 'translateY(0)';
//             observer.unobserve(entry.target);
//         }
//     });
// }, observerOptions);

// All elements visible by default
console.log('✅ Animations disabled for stability');

// All cards visible - no animation observer
console.log('✅ Observer elements skipped - all cards visible by default');

// ===========================
// Hero Section Buttons
// ===========================
document.querySelectorAll('.hero-buttons .btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if (index === 0) {
            // View Menu button
            document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Our Story button
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===========================
// Contact Button Handler (Scroll to Contact)
// ===========================
function scrollToContact() {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===========================
// Why Us Visit Button
// ===========================
const visitBtn = document.querySelector('.why-us .btn-primary');
if (visitBtn) {
    visitBtn.addEventListener('click', scrollToContact);
}

// ===========================
// Active Navigation Link Update
// ===========================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSection = null;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    // Remove active styling from all links
    navLinks.forEach(link => {
        link.style.color = '';
        link.style.fontWeight = '400';
    });

    // Add active styling to current section link
    if (currentSection) {
        const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.style.color = 'var(--accent-light)';
            activeLink.style.fontWeight = '700';
        }
    }
}

// Call on page load to set initial active link
document.addEventListener('DOMContentLoaded', updateActiveNavLink);

// Update on scroll
window.addEventListener('scroll', updateActiveNavLink);

// ===========================
// Order Now Button Handlers
// ===========================
document.querySelectorAll('.btn-order').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const platforms = ['Swiggy', 'Zomato'];
        alert(`Redirecting to ${platforms[index]}...\n\nIn production, this would link to the actual delivery platform.`);
        // In production, replace with actual links:
        // if (index === 0) window.open('https://swiggy.com', '_blank');
        // else window.open('https://zomato.com', '_blank');
    });
});

// ===========================
// Navbar Background on Scroll
// ===========================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.3)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.2)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// ===========================
// Interactive Card Effects
// ===========================
document.querySelectorAll('.menu-card, .benefit-card, .contact-card, .order-card, .about-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = card.style.transform || '';
    });
});

// ===========================
// Page Load Animation
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Fade in hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
    }
    
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.animation = 'fadeInUp 0.8s ease-out 0.4s both';
    }
});

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Console Easter Egg
// ===========================
console.log('%c🥤 Welcome to Kadari Lassi Corner', 'font-size: 20px; font-weight: bold; color: #d4af37;');
console.log('%cServing authentic taste since 1991', 'font-size: 12px; color: #e0e0e0;');

// ===========================
// Dynamic Menu Loading
// ===========================
const fallbackMenuItems = [
    {
        "id": 1,
        "name": "Classic Lassi",
        "price": 70,
        "description": "The timeless original. Chilled, thick, and perfectly blended with pure curd and a touch of sweetness.",
        "badge": "Popular",
        "emoji": "🥛"
    },
    {
        "id": 2,
        "name": "No Sugar Lassi",
        "price": 80,
        "description": "A healthier choice without compromising taste. Pure curd, no added sugar — naturally refreshing.",
        "badge": "Healthy",
        "emoji": "🍃"
    },
    {
        "id": 3,
        "name": "Dry Fruit Lassi",
        "price": 90,
        "description": "Rich and indulgent. Topped with hand-picked dry fruits — almonds, cashews, and pistachios.",
        "badge": "Premium",
        "emoji": "🥜"
    },
    {
        "id": 4,
        "name": "Special Kadari Lassi",
        "price": 100,
        "description": "The crown jewel. A secret family recipe passed down through generations — one sip tells the story.",
        "badge": "Signature",
        "emoji": "✨"
    }
];

function renderMenu(menuItems) {
    console.log('📍 renderMenu called with:', menuItems.length, 'items');
    const menuGrid = document.getElementById('main-menu-grid');
    
    if (!menuGrid) {
        console.error('❌ CRITICAL ERROR: Could not find element with id="main-menu-grid"');
        console.log('📋 Available section IDs:', Array.from(document.querySelectorAll('section[id]')).map(s => s.id));
        return;
    }
    
    console.log('✅ Found menuGrid element, ready to render');
    console.log('📊 Grid current HTML:', menuGrid.innerHTML.substring(0, 100));
    
    // Force clear
    menuGrid.innerHTML = '';
    console.log('🗑️ Cleared grid');
    
    let successCount = 0;
    menuItems.forEach((item, index) => {
        try {
            const isFeatured = item.badge && item.badge.toLowerCase() === 'signature';
            const cardClass = isFeatured ? 'menu-card featured' : 'menu-card';

            const cardElement = document.createElement('div');
            cardElement.className = cardClass;
            cardElement.setAttribute('data-menu-index', index);
            
            let badgeHTML = '';
            if (isFeatured) {
                badgeHTML = '<div class="menu-badge-featured">House Special</div>';
            }
            
            let priceHTML = '';
            if (item.price) {
                priceHTML = `<span class="price">₹${item.price}</span>`;
            }
            
            let bottomBadgeHTML = '';
            if (item.badge && !isFeatured) {
                bottomBadgeHTML = `<span class="menu-badge">${item.badge}</span>`;
            }
            
            cardElement.innerHTML = `
                ${badgeHTML}
                <div class="menu-icon">
                    <div class="menu-placeholder">
                        <span style="font-size: 2rem;">${item.emoji || '🥛'}</span>
                    </div>
                </div>
                <h3>${item.name}</h3>
                <p class="menu-description">${item.description}</p>
                <div class="menu-pricing">
                    <div class="price-option">
                        ${priceHTML}
                    </div>
                </div>
                ${bottomBadgeHTML}
            `;
            
            menuGrid.appendChild(cardElement);
            successCount++;
            console.log(`✅ [${index + 1}/${menuItems.length}] Added: ${item.name}`);
            
        } catch (error) {
            console.error(`❌ Error rendering item ${index}:`, error, item);
        }
    });
    
    console.log(`🎉 Menu rendering complete! Successfully added ${successCount}/${menuItems.length} items`);
    console.log('📊 Final grid HTML:', menuGrid.innerHTML.substring(0, 200));
    console.log('📊 Grid child count:', menuGrid.children.length);
}

async function loadAndRenderMenu() {
    console.log('🚀 loadAndRenderMenu called');
    
    // Check if menu grid exists
    const menuGrid = document.getElementById('main-menu-grid');
    if (!menuGrid) {
        console.error('❌ CRITICAL: main-menu-grid element not found in DOM!');
        return;
    }
    console.log('✅ Found main-menu-grid element');
    
    try {
        console.log('📂 Attempting to load menu from js/menu.json...');
        const response = await fetch('js/menu.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const menuItems = await response.json();
        console.log('✅ Menu loaded successfully from JSON:', menuItems);
        renderMenu(menuItems);
    } catch (error) {
        console.warn("⚠️ Could not load menu from JSON, using fallback:", error);
        console.log('📋 Using ' + fallbackMenuItems.length + ' fallback items');
        renderMenu(fallbackMenuItems);
    }
}

// Load menu on page load
console.log('⏳ Waiting for DOMContentLoaded...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired, loading menu...');
    loadAndRenderMenu();
});

// FALLBACK: Try to load menu immediately if DOM is ready
console.log('🔥 Attempting immediate menu load...');
if (document.readyState === 'loading') {
    console.log('⏳ Document still loading, will wait for DOMContentLoaded');
} else {
    console.log('✅ Document already loaded, rendering menu immediately');
    loadAndRenderMenu();
}

// FALLBACK: Retry after 500ms
setTimeout(() => {
    console.log('⏰ 500ms timeout - retrying menu load...');
    const grid = document.getElementById('main-menu-grid');
    if (grid && grid.children.length === 0) {
        console.log('⚠️ Menu grid still empty, forcing render...');
        renderMenu(fallbackMenuItems);
    }
}, 500);

// FALLBACK: Retry after 1000ms
setTimeout(() => {
    console.log('⏰ 1000ms timeout - final check...');
    const grid = document.getElementById('main-menu-grid');
    if (grid && grid.children.length === 0) {
        console.log('🔴 FORCING fallback menu render!');
        renderMenu(fallbackMenuItems);
    }
}, 1000);

// FALLBACK: Load on window load event
window.addEventListener('load', () => {
    console.log('📦 Window load event fired');
    const grid = document.getElementById('main-menu-grid');
    if (grid && grid.children.length === 0) {
        console.log('⚠️ Menu still empty on window load, rendering fallback');
        renderMenu(fallbackMenuItems);
    }
});
