/**
 * Main Website Script - Firebase Firestore Edition
 * 
 * Handles:
 * - Navigation & menu
 * - Menu loading from Firestore
 * - Category grouping
 * - Dynamic rendering
 * - Image error handling
 */

// ========================
// SCRIPT LOADED - DEBUG
// ========================
console.log("✅ script.js LOADED AND EXECUTING");

// ========================
// FIRESTORE IMPORTS
// ========================
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where,
  initialized as firebaseInitialized 
} from './firebase-config.js';

console.log("✅ Firebase imports successful");

// ===========================
// PAGE INITIALIZATION
// ===========================
function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', scrollToTop);
window.addEventListener('load', scrollToTop);
setTimeout(scrollToTop, 100);
setTimeout(scrollToTop, 500);

// ===========================
// FALLBACK MENU (For development/offline)
// ===========================
const fallbackMenuItems = [
    {
        id: "1",
        name: "Classic Lassi",
        price: 70,
        unit: "glass",
        category: "Lassi",
        description: "The timeless original. Chilled, thick, and perfectly blended with pure curd and a touch of sweetness.",
        available: true,
        emoji: "🥛"
    },
    {
        id: "2",
        name: "No Sugar Lassi",
        price: 80,
        unit: "glass",
        category: "Lassi",
        description: "A healthier choice without compromising taste. Pure curd, no added sugar — naturally refreshing.",
        available: true,
        emoji: "🍃"
    },
    {
        id: "3",
        name: "Dry Fruit Lassi",
        price: 90,
        unit: "glass",
        category: "Lassi",
        description: "Rich and indulgent. Topped with hand-picked dry fruits — almonds, cashews, and pistachios.",
        available: true,
        emoji: "🥜"
    },
    {
        id: "4",
        name: "Special Kadari Lassi",
        price: 100,
        unit: "glass",
        category: "Lassi",
        description: "The crown jewel. A secret family recipe passed down through generations — one sip tells the story.",
        available: true,
        emoji: "✨"
    }
];

// ===========================
// STATE
// ===========================
let allMenuItems = [];
let groupedByCategory = {};

// ===========================
// FIRESTORE MENU LOADING
// ===========================
/**
 * Load menu items from Firestore with 5-second timeout
 * - Fetches all available menu items from 'menuItems' collection
 * - Only includes items where available === true
 * - Returns grouped by category
 * - Timeout prevents infinite loading
 */
async function loadMenuFromFirestore() {
    try {
        console.log("🔄 Fetching menu from Firestore...");

        // Create timeout promise (max 5 seconds)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore timeout - 5s limit')), 5000)
        );

        // Race: Firestore vs timeout
        const snapshot = await Promise.race([
            getDocs(collection(db, "menuItems")),
            timeoutPromise
        ]);

        console.log(`📊 Firestore returned ${snapshot.size} documents`);

        const items = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Filter only available items
            if (data.available === true) {
                items.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        console.log(`✅ Menu loaded successfully: ${items.length} items`);
        return items;

    } catch (error) {
        console.error("❌ Error loading menu from Firestore:", error.message);
        console.warn("⚠️ Falling back to local menu");
        return fallbackMenuItems;
    }
}

// ===========================
// CATEGORY GROUPING
// ===========================
/**
 * Group menu items by category
 */
function groupByCategory(items) {
    const grouped = {};
    
    items.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    });

    return grouped;
}

// ===========================
// MENU RENDERING
// ===========================
/**
 * Render grouped menu items to the DOM
 */
function renderMenu(groupedItems) {
    const menuGrid = document.getElementById('main-menu-grid');
    
    if (!menuGrid) {
        console.error('❌ Menu grid element not found');
        return;
    }

    menuGrid.innerHTML = '';

    // Check for empty state
    if (!groupedItems || Object.keys(groupedItems).length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #b0c4de;">
                <p style="font-size: 1.1rem;">No menu items available</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Check back soon!</p>
            </div>
        `;
        return;
    }

    let itemCount = 0;

    // Render each category
    Object.entries(groupedItems).forEach(([category, items]) => {
        items.forEach((item) => {
            try {
                const cardElement = document.createElement('div');
                cardElement.className = 'menu-card';
                cardElement.setAttribute('data-category', category);
                
                const emoji = item.emoji || '🥛';
                const price = item.price ? `₹${item.price}` : 'N/A';

                // Safely handle missing/invalid image URLs
                // Show emoji fallback if image fails or is missing
                cardElement.innerHTML = `
                    <div class="menu-icon">
                        <img src="${item.image || ''}" 
                             alt="${item.name}" 
                             class="menu-image"
                             onload="this.nextElementSibling.style.display='none';"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="emoji-fallback" style="display: none; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 150px;">
                            <span style="font-size: 2rem;">${emoji}</span>
                        </div>
                    </div>
                    <h3>${item.name}</h3>
                    <p class="menu-description">${item.description || 'Delicious Lassi'}</p>
                    <div class="menu-pricing">
                        <div class="price-option">
                            <span class="price">₹${item.price} / ${item.unit || 'item'}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
                        <a href="https://www.swiggy.com/city/hyderabad/kadaris-lassi-corner-malkajgiri-rest193125" target="_blank" style="background-color: #fc8019; color: white; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; border: none; cursor: pointer;">🛵 Order on Swiggy</a>
                        <a href="https://www.zomato.com/hyderabad/kadaris-lassi-corner-1-malkajgiri-secunderabad/order" target="_blank" style="background-color: #e23744; color: white; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; border: none; cursor: pointer;">🍕 Order on Zomato</a>
                    </div>
                `;

                menuGrid.appendChild(cardElement);
                itemCount++;

            } catch (error) {
                console.error(`Error rendering item ${item.name}:`, error);
            }
        });
    });

    console.log(`✅ Rendered ${itemCount} menu items`);
}

// ===========================
// LOADING SPINNER
// ===========================
function showLoadingSpinner() {
    const menuGrid = document.getElementById('main-menu-grid');
    if (menuGrid) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="display: inline-block; border: 3px solid rgba(212, 175, 55, 0.2); border-top: 3px solid #d4af37; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: #b0c4de;">Loading menu...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }
}

// ===========================
// INITIALIZE MENU
// ===========================
async function initializeMenu() {
    // Display fallback menu IMMEDIATELY (no spinner)
    console.log('📋 Displaying fallback menu immediately...');
    groupedByCategory = groupByCategory(fallbackMenuItems);
    renderMenu(groupedByCategory);
    
    // Try to load from Firestore in the background
    console.log('🔄 Attempting to load menu from Firestore in background...');
    try {
        allMenuItems = await loadMenuFromFirestore();
        
        // If we get here, Firestore responded with data
        console.log('✅ Firestore menu loaded! Updating display...');
        groupedByCategory = groupByCategory(allMenuItems);
        renderMenu(groupedByCategory);
        
    } catch (error) {
        console.warn('⚠️ Firestore unavailable or timed out - using fallback menu', error);
        // Menu already showing fallback, nothing to do
    }
}

// Load menu when page is ready
document.addEventListener('DOMContentLoaded', initializeMenu);

// Fallback: Try immediately if DOM is ready
if (document.readyState !== 'loading') {
    console.log('Document already loaded, initializing menu...');
    initializeMenu();
}

// Debug function - check ALL items in Firestore (no filter)
window.debugFirestore = async function() {
    console.log("🔍 Checking ALL items in Firestore (no filter)...");
    const snapshot = await getDocs(collection(db, "menuItems"));
    snapshot.forEach((doc) => {
        console.log(`📄 ID: ${doc.id}`, doc.data());
    });
}

// ===========================
// IMAGE HANDLING
// ===========================
function checkImagesOnLoad() {
    const images = document.querySelectorAll('.product-image, .menu-image');
    images.forEach((img) => {
        if (!img.complete || img.naturalHeight === 0) {
            img.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', checkImagesOnLoad);
window.addEventListener('load', checkImagesOnLoad);

// ===========================
// HAMBURGER MENU & NAVIGATION
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
        });

        // Handle nav link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only handle anchor links (#) with smooth scroll
                if (href && href.startsWith('#')) {
                    const anchorId = href.substring(1);
                    const targetElement = document.getElementById(anchorId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        hamburgerBtn.classList.remove('active');
                        navMenu.classList.remove('active');
                        
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }, 150);
                    }
                } else {
                    // For page links (.html), just close the menu and let browser navigate
                    hamburgerBtn.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// ===========================
// ACTIVE NAVIGATION LINK
// ===========================
function updateActiveNavLink() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    // First, handle page links (highlight current page)
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if it's a page link (not an anchor)
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
            // Check if this link matches the current page
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
    
    // For anchor links on the same page, update based on scroll position
    const sections = document.querySelectorAll('section[id]');
    let currentSection = null;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    if (currentSection) {
        const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
        if (activeLink && !activeLink.classList.contains('active')) {
            navLinks.forEach(link => {
                if (link.getAttribute('href')?.startsWith('#')) {
                    link.classList.remove('active');
                }
            });
            activeLink.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', updateActiveNavLink);
window.addEventListener('scroll', updateActiveNavLink);

// ===========================
// HERO BUTTONS
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    if (heroButtons.length > 0) {
        heroButtons.forEach((btn) => {
            const href = btn.getAttribute('href');
            if (href && !href.startsWith('https')) { // It's an internal link
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.location.href = href;
                    }
                });
            }
        });
    }
});

// ===========================
// CONTACT & ORDER BUTTONS
// ===========================
function scrollToContact() {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}

const visitBtn = document.querySelector('.why-us .btn-primary');
if (visitBtn) {
    visitBtn.addEventListener('click', scrollToContact);
}

// ===========================
// ORDER BUTTONS
// ===========================
document.querySelectorAll('.btn-order').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const platforms = ['Swiggy', 'Zomato'];
        alert(`Redirecting to ${platforms[index]}...\n\nIn production, this would link to the actual delivery platform.`);
    });
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.3)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.2)';
        navbar.style.boxShadow = 'none';
    }
});

// ===========================
// PAGE LOAD ANIMATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
    }
    
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.animation = 'fadeInUp 0.8s ease-out 0.4s both';
    }
});

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
// CONSOLE
// ===========================
console.log('%c🥤 Welcome to Kadari Lassi', 'font-size: 18px; font-weight: bold; color: #d4af37;');
console.log('%cServing authentic taste since 1991', 'font-size: 12px; color: #e0e0e0;');
console.log('%c✨ Powered by Firebase Firestore', 'font-size: 11px; color: #4ade80; font-style: italic;');

document.addEventListener('DOMContentLoaded', () => {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            // The href is already set, but we can add additional functionality here
            console.log('✅ WhatsApp button clicked - redirecting to WhatsApp chat');
        });
    }
});
