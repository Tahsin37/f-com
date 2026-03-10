// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager — Lovable Store Code Generator
// Generates full HTML+CSS store code that sellers can copy-paste
// Keeps all IDs and classes identical to StoreTemplate for functional compat
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoreCodeConfig {
    storeName: string
    tagline: string
    primaryColor: string
    accentColor: string
    bgColor: string
    textColor: string
    mutedColor: string
    fontHeading: string
    fontBody: string
    borderRadius: string
    buttonRadius: string
    cardStyle: 'rounded-shadow' | 'flat' | 'bordered' | 'elevated'
    heroLayout: 'centered' | 'split' | 'fullwidth' | 'minimal'
    gridColumns: 2 | 3 | 4
    bannerTitle: string
    bannerSubtitle: string
    bannerCta: string
    showAnnouncement: boolean
    announcementText: string
}

export const LOVABLE_PRESET: StoreCodeConfig = {
    storeName: 'My Store',
    tagline: 'Quality products with fast delivery! 🇧🇩',
    primaryColor: '#0EA5A4',
    accentColor: '#FFD166',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    mutedColor: '#94A3B8',
    fontHeading: "'Space Grotesk', system-ui, sans-serif",
    fontBody: "'Noto Sans Bengali', system-ui, sans-serif",
    borderRadius: '1rem',
    buttonRadius: '9999px',
    cardStyle: 'rounded-shadow',
    heroLayout: 'centered',
    gridColumns: 2,
    bannerTitle: 'New Arrivals — Shop Now',
    bannerSubtitle: 'Free delivery on orders above ৳999',
    bannerCta: 'Shop Now',
    showAnnouncement: true,
    announcementText: '🔥 Free shipping on orders above ৳999!',
}

export const PRESET_PROMPTS: Record<string, { label: string; config: Partial<StoreCodeConfig> }> = {
    lovable: {
        label: '💖 Lovable — Teal + Gold, rounded, warm',
        config: { ...LOVABLE_PRESET },
    },
    minimal: {
        label: '🖤 Minimal — Clean black & white',
        config: {
            primaryColor: '#18181B', accentColor: '#A1A1AA', bgColor: '#FAFAFA',
            textColor: '#09090B', mutedColor: '#D4D4D8',
            fontHeading: "'Inter', system-ui, sans-serif", fontBody: "'Inter', system-ui, sans-serif",
            borderRadius: '0.5rem', buttonRadius: '0.5rem', cardStyle: 'flat', heroLayout: 'minimal',
        },
    },
    premium: {
        label: '✨ Premium — Dark gold luxury',
        config: {
            primaryColor: '#B45309', accentColor: '#D97706', bgColor: '#0F0F0F',
            textColor: '#FAFAF9', mutedColor: '#78716C',
            fontHeading: "'Playfair Display', serif", fontBody: "'Lora', serif",
            borderRadius: '0.25rem', buttonRadius: '0.25rem', cardStyle: 'elevated', heroLayout: 'fullwidth',
        },
    },
    ocean: {
        label: '🌊 Ocean — Blue calm vibes',
        config: {
            primaryColor: '#0EA5E9', accentColor: '#06B6D4', bgColor: '#F0F9FF',
            textColor: '#0C4A6E', mutedColor: '#7DD3FC',
            fontHeading: "'Outfit', system-ui, sans-serif", fontBody: "'DM Sans', system-ui, sans-serif",
            borderRadius: '1.5rem', buttonRadius: '9999px', cardStyle: 'rounded-shadow', heroLayout: 'split',
        },
    },
    candy: {
        label: '🍬 Candy — Pink & purple playful',
        config: {
            primaryColor: '#EC4899', accentColor: '#A855F7', bgColor: '#FDF2F8',
            textColor: '#831843', mutedColor: '#F9A8D4',
            fontHeading: "'Outfit', system-ui, sans-serif", fontBody: "'Poppins', system-ui, sans-serif",
            borderRadius: '1.5rem', buttonRadius: '9999px', cardStyle: 'rounded-shadow', heroLayout: 'centered',
        },
    },
}

// ─── Generate Store CSS ────────────────────────────────────────────────────────

function generateCSS(c: StoreCodeConfig): string {
    const shadow = c.cardStyle === 'rounded-shadow' ? `box-shadow: 0 4px 20px ${c.primaryColor}10;` :
        c.cardStyle === 'elevated' ? 'box-shadow: 0 8px 30px rgba(0,0,0,0.12);' : ''
    const cardBorder = c.cardStyle === 'bordered' ? `border: 1.5px solid ${c.mutedColor}40;` : ''

    return `/* ═══ F-Manager Store Theme ═══
   Generated: ${new Date().toISOString().split('T')[0]}
   Preset: Custom
   ─────────────────────────────── */

:root {
    --color-primary: ${c.primaryColor};
    --color-accent: ${c.accentColor};
    --color-bg: ${c.bgColor};
    --color-text: ${c.textColor};
    --color-muted: ${c.mutedColor};
    --font-heading: ${c.fontHeading};
    --font-body: ${c.fontBody};
    --radius-card: ${c.borderRadius};
    --radius-button: ${c.buttonRadius};
}

/* ─── Base ─── */
.fm-store { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); min-height: 100vh; }
.fm-store h1, .fm-store h2, .fm-store h3 { font-family: var(--font-heading); }
.fm-store a { color: inherit; text-decoration: none; }

/* ─── Announcement Bar ─── */
.fm-announcement { background: var(--color-primary); color: #fff; text-align: center; padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 600; }

/* ─── Header ─── */
.fm-header { position: sticky; top: 0; z-index: 50; background: ${c.bgColor}f2; backdrop-filter: blur(16px); border-bottom: 1px solid ${c.mutedColor}20; }
.fm-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; height: 3.5rem; gap: 1rem; }
.fm-logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.125rem; color: var(--color-primary); font-family: var(--font-heading); }
.fm-logo-icon { width: 2rem; height: 2rem; border-radius: 0.5rem; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
.fm-search { flex: 1; max-width: 28rem; margin: 0 auto; }
.fm-search input { width: 100%; height: 2.5rem; border-radius: 9999px; border: 1px solid ${c.mutedColor}40; padding: 0 1rem 0 2.5rem; background: ${c.bgColor}; font-size: 0.875rem; }
.fm-cart-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-button); background: var(--color-primary); color: #fff; font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; transition: opacity 0.2s; }
.fm-cart-btn:hover { opacity: 0.9; }

/* ─── Hero ─── */
.fm-hero { position: relative; overflow: hidden; border-radius: 0 0 ${c.heroLayout === 'fullwidth' ? '0' : '1.5rem'} ${c.heroLayout === 'fullwidth' ? '0' : '1.5rem'}; margin: ${c.heroLayout === 'fullwidth' ? '0' : '1rem'}; min-height: 280px; display: flex; align-items: center; }
.fm-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--color-primary), ${c.primaryColor}cc); }
.fm-hero-content { position: relative; z-index: 10; padding: 3rem 2rem; max-width: 600px; }
.fm-hero h1 { font-size: 2rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem; }
.fm-hero p { color: rgba(255,255,255,0.8); font-size: 0.875rem; margin-bottom: 1.5rem; }
.fm-hero-cta { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: var(--radius-button); background: #fff; color: var(--color-primary); font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; transition: transform 0.2s; }
.fm-hero-cta:hover { transform: translateY(-2px); }

/* ─── Trust Badges ─── */
.fm-badges { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; max-width: 1200px; margin: 1.5rem auto; padding: 0 1rem; }
.fm-badge { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem; border-radius: var(--radius-card); background: ${c.bgColor}; border: 1px solid ${c.mutedColor}15; }
.fm-badge-icon { color: var(--color-primary); }
.fm-badge-label { font-size: 0.75rem; font-weight: 700; }
.fm-badge-sub { font-size: 0.625rem; color: var(--color-muted); }

/* ─── Category Pills ─── */
.fm-categories { display: flex; gap: 0.5rem; overflow-x: auto; padding: 1rem; max-width: 1200px; margin: 0 auto; scrollbar-width: none; }
.fm-categories::-webkit-scrollbar { display: none; }
.fm-cat-pill { padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; border: 1px solid ${c.mutedColor}30; background: transparent; cursor: pointer; transition: all 0.2s; }
.fm-cat-pill:hover { border-color: var(--color-primary); }
.fm-cat-pill.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* ─── Product Grid ─── */
.fm-products { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; }
.fm-products-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.fm-products-title { font-size: 1.125rem; font-weight: 800; }
.fm-grid { display: grid; grid-template-columns: repeat(${c.gridColumns}, 1fr); gap: var(--radius-card); }
@media (max-width: 640px) { .fm-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }

/* ─── Product Card ─── */
.fm-card { border-radius: var(--radius-card); overflow: hidden; background: var(--color-bg); transition: transform 0.2s, box-shadow 0.3s; cursor: pointer; ${shadow} ${cardBorder} }
.fm-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px ${c.primaryColor}15; }
.fm-card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: ${c.mutedColor}10; }
.fm-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.fm-card:hover .fm-card-img img { transform: scale(1.05); }
.fm-card-discount { position: absolute; top: 0.5rem; left: 0.5rem; background: #ef4444; color: #fff; font-size: 0.625rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 9999px; }
.fm-card-cart { position: absolute; bottom: 0.5rem; right: 0.5rem; width: 2rem; height: 2rem; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
.fm-card:hover .fm-card-cart { opacity: 1; }
.fm-card-body { padding: 0.75rem; }
.fm-card-name { font-size: 0.8125rem; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fm-card-price { font-size: 0.875rem; font-weight: 800; color: var(--color-primary); margin-top: 0.25rem; }
.fm-card-strike { font-size: 0.75rem; color: var(--color-muted); text-decoration: line-through; margin-left: 0.375rem; }
.fm-card-add { width: 100%; margin-top: 0.5rem; padding: 0.375rem; border-radius: 0.5rem; background: var(--color-primary); color: #fff; font-size: 0.6875rem; font-weight: 700; border: none; cursor: pointer; display: none; }
@media (max-width: 640px) { .fm-card-add { display: block; } .fm-card-cart { display: none; } }

/* ─── Trust Section ─── */
.fm-trust { background: ${c.mutedColor}08; padding: 3rem 1rem; }
.fm-trust-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; text-align: center; }
.fm-trust-item h3 { font-size: 0.875rem; font-weight: 700; margin-top: 0.75rem; }
.fm-trust-item p { font-size: 0.75rem; color: var(--color-muted); margin-top: 0.25rem; }

/* ─── Newsletter ─── */
.fm-newsletter { padding: 3rem 1rem; background: ${c.mutedColor}08; }
.fm-newsletter-inner { max-width: 28rem; margin: 0 auto; text-align: center; }
.fm-newsletter h2 { font-size: 1.125rem; font-weight: 800; margin-bottom: 0.5rem; }
.fm-newsletter p { font-size: 0.875rem; color: var(--color-muted); margin-bottom: 1rem; }
.fm-newsletter-form { display: flex; gap: 0.5rem; }
.fm-newsletter-form input { flex: 1; height: 2.75rem; border-radius: var(--radius-button); border: 1px solid ${c.mutedColor}30; padding: 0 1rem; }
.fm-newsletter-form button { height: 2.75rem; padding: 0 1.5rem; border-radius: var(--radius-button); background: var(--color-primary); color: #fff; font-weight: 700; border: none; cursor: pointer; }

/* ─── Footer ─── */
.fm-footer { background: ${c.textColor}; color: ${c.bgColor}; padding: 3rem 1rem 1.5rem; }
.fm-footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
@media (max-width: 640px) { .fm-footer-inner { grid-template-columns: 1fr 1fr; } }
.fm-footer-brand { font-family: var(--font-heading); }
.fm-footer h3 { font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.75rem; }
.fm-footer a { display: block; font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.375rem; transition: opacity 0.2s; }
.fm-footer a:hover { opacity: 1; }
.fm-footer-bottom { max-width: 1200px; margin: 2rem auto 0; padding-top: 1rem; border-top: 1px solid ${c.bgColor}15; text-align: center; font-size: 0.625rem; opacity: 0.5; }

/* ─── WhatsApp Button ─── */
.fm-whatsapp { position: fixed; bottom: 1.5rem; right: 1.5rem; width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #25D366; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(37,211,102,0.4); z-index: 40; border: none; cursor: pointer; transition: transform 0.2s; }
.fm-whatsapp:hover { transform: scale(1.1); }

/* ─── Animations ─── */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fm-animate { animation: fadeInUp 0.5s ease forwards; }
.fm-card { animation: fadeInUp 0.4s ease forwards; }
`
}

// ─── Generate Store HTML ───────────────────────────────────────────────────────

function generateHTML(c: StoreCodeConfig): string {
    return `<!-- ═══ F-Manager Store — Copy & Paste Ready ═══
     All classes use fm-* prefix. All IDs match StoreTemplate.
     Logic (cart, checkout, routing) is handled by the dashboard.
     This is ONLY the visual layer — HTML + CSS.
     ═══════════════════════════════════════════════ -->

<div class="fm-store fm-animate">

    ${c.showAnnouncement ? `<!-- Announcement Bar -->
    <div class="fm-announcement" id="announcement-bar">
        ${c.announcementText}
    </div>` : ''}

    <!-- Header -->
    <header class="fm-header" id="header">
        <div class="fm-header-inner">
            <a href="#" class="fm-logo">
                <div class="fm-logo-icon">${c.storeName[0]?.toUpperCase() || 'S'}</div>
                <span>${c.storeName}</span>
            </a>
            <div class="fm-search">
                <input type="text" placeholder="Search in ${c.storeName}..." id="search-input" />
            </div>
            <button class="fm-cart-btn" id="cart-button">
                🛒 Cart <span id="cart-count">(0)</span>
            </button>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="fm-hero" id="hero">
        <div class="fm-hero-bg"></div>
        <div class="fm-hero-content">
            <h1>${c.bannerTitle}</h1>
            <p>${c.bannerSubtitle}</p>
            <button class="fm-hero-cta" id="hero-cta">${c.bannerCta} →</button>
        </div>
    </section>

    <!-- Trust Badges -->
    <div class="fm-badges" id="trust-badges">
        <div class="fm-badge">
            <span class="fm-badge-icon">🚚</span>
            <div>
                <div class="fm-badge-label">Fast Delivery</div>
                <div class="fm-badge-sub">Inside Dhaka 24hr</div>
            </div>
        </div>
        <div class="fm-badge">
            <span class="fm-badge-icon">🛡️</span>
            <div>
                <div class="fm-badge-label">Secure Payment</div>
                <div class="fm-badge-sub">bKash / COD</div>
            </div>
        </div>
        <div class="fm-badge">
            <span class="fm-badge-icon">⭐</span>
            <div>
                <div class="fm-badge-label">Top Rated</div>
                <div class="fm-badge-sub">100+ items</div>
            </div>
        </div>
        <div class="fm-badge">
            <span class="fm-badge-icon">⚡</span>
            <div>
                <div class="fm-badge-label">Flash Deals</div>
                <div class="fm-badge-sub">Up to 70% off</div>
            </div>
        </div>
    </div>

    <!-- Category Pills -->
    <div class="fm-categories" id="category-pills">
        <button class="fm-cat-pill active">🔥 All</button>
        <button class="fm-cat-pill">Fashion</button>
        <button class="fm-cat-pill">Electronics</button>
        <button class="fm-cat-pill">Books</button>
        <button class="fm-cat-pill">Health</button>
    </div>

    <!-- Product Grid -->
    <section class="fm-products" id="product-section">
        <div class="fm-products-header">
            <h2 class="fm-products-title">All Products</h2>
        </div>
        <div class="fm-grid" id="product-grid">
            <!-- Products are rendered dynamically by StoreTemplate -->
            <!-- Example card structure (auto-filled from dashboard products): -->
            <div class="fm-card">
                <div class="fm-card-img">
                    <img src="https://placehold.co/400x400/${c.primaryColor.replace('#', '')}/ffffff?text=Product" alt="Product" />
                    <span class="fm-card-discount">-20%</span>
                    <button class="fm-card-cart">🛒</button>
                </div>
                <div class="fm-card-body">
                    <p class="fm-card-name">Sample Product Name</p>
                    <div>
                        <span class="fm-card-price">৳599</span>
                        <span class="fm-card-strike">৳749</span>
                    </div>
                    <button class="fm-card-add">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Newsletter -->
    <section class="fm-newsletter" id="newsletter">
        <div class="fm-newsletter-inner">
            <h2>Stay Updated</h2>
            <p>Get notified about new products and exclusive offers.</p>
            <div class="fm-newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="fm-footer" id="footer">
        <div class="fm-footer-inner">
            <div class="fm-footer-brand">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
                    <div class="fm-logo-icon">${c.storeName[0]?.toUpperCase() || 'S'}</div>
                    <span style="font-weight:800;font-size:1rem;">${c.storeName}</span>
                </div>
                <p style="font-size:0.75rem;opacity:0.7;">${c.tagline}</p>
            </div>
            <div>
                <h3>Shop</h3>
                <a href="#">All Products</a>
                <a href="#">New Arrivals</a>
                <a href="#">Deals</a>
            </div>
            <div>
                <h3>Support</h3>
                <a href="#">Track Order</a>
                <a href="#">Returns</a>
                <a href="#">Contact Us</a>
            </div>
            <div>
                <h3>Connect</h3>
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">WhatsApp</a>
            </div>
        </div>
        <div class="fm-footer-bottom">
            © ${new Date().getFullYear()} ${c.storeName}. Powered by F-Manager
        </div>
    </footer>

</div>`
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function generateStoreCode(config: StoreCodeConfig): { html: string; css: string; full: string } {
    const css = generateCSS(config)
    const html = generateHTML(config)
    const full = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.storeName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.fontHeading.split("'")[1] || 'Space Grotesk')}:wght@400;600;700;800&family=${encodeURIComponent(config.fontBody.split("'")[1] || 'Noto Sans Bengali')}:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
* { margin: 0; padding: 0; box-sizing: border-box; }
${css}
    </style>
</head>
<body>
${html}
</body>
</html>`
    return { html, css, full }
}
