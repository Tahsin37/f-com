// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager — Live Store Code Extractor
// Outputs the REAL store HTML structure with all IDs and classes
// that sellers can copy → customize → paste back
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoreCodeInput {
    storeName: string
    slug: string
    primaryColor: string
    tagline: string
    bannerTitle: string
    bannerSubtitle: string
    bannerCta: string
    categories: string[]
    announcement?: { enabled: boolean; text: string; bg_color: string; text_color: string }
    whatsappNumber?: string
}

// ─── All IDs and Classes Reference ─────────────────────────────────────────────

export const STORE_STRUCTURE_REFERENCE = `
╔═══════════════════════════════════════════════════════════════╗
║  F-Manager Store — HTML Structure & Class Reference          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📌 All IDs (unique per store):                              ║
║  ─────────────────────────────────                            ║
║  #announcement-bar     → Top banner bar                      ║
║  #store-header         → Sticky header/navbar                ║
║  #store-logo           → Store logo + name                   ║
║  #search-input         → Product search input                ║
║  #cart-button          → Cart button                         ║
║  #cart-count           → Cart count badge                    ║
║  #mobile-menu-btn      → Mobile hamburger menu               ║
║  #hero-section         → Hero/banner slider                  ║
║  #hero-cta             → Hero call-to-action button          ║
║  #trust-badges         → Trust badges row                    ║
║  #category-pills       → Category filter pills               ║
║  #deals-section        → Deals/discounts section             ║
║  #products-section     → Main product grid area              ║
║  #product-grid         → The product grid container          ║
║  #testimonials         → Customer reviews section            ║
║  #faq-section          → FAQ accordion section               ║
║  #newsletter           → Newsletter signup section           ║
║  #store-footer         → Footer                              ║
║  #whatsapp-btn         → WhatsApp floating button            ║
║                                                               ║
║  🎨 CSS Classes (reusable):                                  ║
║  ─────────────────────────────────                            ║
║  .store-root           → Root container                      ║
║  .store-header         → Header wrapper                      ║
║  .store-logo           → Logo area                           ║
║  .store-search         → Search bar wrapper                  ║
║  .store-cart-btn       → Cart button                         ║
║  .hero-slide           → Each hero slide                     ║
║  .hero-content         → Hero text content                   ║
║  .hero-cta-btn         → Hero CTA button                     ║
║  .badge-item           → Each trust badge                    ║
║  .badge-icon           → Badge icon                          ║
║  .cat-pill             → Category pill button                ║
║  .cat-pill-active      → Active category pill                ║
║  .section-title        → Section heading                     ║
║  .product-grid         → Product grid container              ║
║  .product-card         → Each product card                   ║
║  .product-img          → Product image wrapper               ║
║  .product-discount     → Discount badge on card              ║
║  .product-cart-btn     → Quick add-to-cart on card           ║
║  .product-name         → Product title                       ║
║  .product-price        → Product price                       ║
║  .product-strike       → Strikethrough old price             ║
║  .product-variants     → Variant count text                  ║
║  .product-add-mobile   → Mobile add-to-cart button           ║
║  .testimonial-card     → Testimonial card                    ║
║  .faq-item             → FAQ accordion item                  ║
║  .faq-question         → FAQ question text                   ║
║  .faq-answer           → FAQ answer text                     ║
║  .newsletter-form      → Newsletter form                     ║
║  .store-footer         → Footer wrapper                      ║
║  .footer-brand         → Footer brand column                 ║
║  .footer-links         → Footer link column                  ║
║  .whatsapp-float       → WhatsApp floating button            ║
║                                                               ║
║  ⚡ CSS Variables (auto-applied by theme):                   ║
║  ─────────────────────────────────                            ║
║  --theme-color-primary  → Primary brand color                ║
║  --theme-color-accent   → Accent/highlight color             ║
║  --theme-color-bg       → Background color                   ║
║  --theme-color-text     → Text color                         ║
║  --theme-color-muted    → Secondary text color               ║
║  --theme-font-heading   → Heading font family                ║
║  --theme-font-body      → Body font family                   ║
║  --theme-radius-card    → Card border radius                 ║
║  --theme-radius-button  → Button border radius               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`

// ─── Generate the actual store CSS ─────────────────────────────────────────────

export function generateLiveStoreCSS(input: StoreCodeInput): string {
    const c = input.primaryColor
    return `/* ═══════════════════════════════════════════════════
   F-Manager Store Stylesheet
   Store: ${input.storeName}
   ─ Edit colors/fonts below, keep classes intact ──
   ═══════════════════════════════════════════════════ */

/* ── Theme Variables ── */
:root {
    --theme-color-primary: ${c};
    --theme-color-accent: #FFD166;
    --theme-color-bg: #FFFFFF;
    --theme-color-text: #0F172A;
    --theme-color-muted: #94A3B8;
    --theme-font-heading: 'Space Grotesk', system-ui, sans-serif;
    --theme-font-body: 'Noto Sans Bengali', system-ui, sans-serif;
    --theme-radius-card: 1rem;
    --theme-radius-button: 9999px;
}

/* ── Base ── */
.store-root {
    min-height: 100vh;
    background: var(--theme-color-bg);
    color: var(--theme-color-text);
    font-family: var(--theme-font-body);
}
.store-root h1, .store-root h2, .store-root h3 {
    font-family: var(--theme-font-heading);
}

/* ── Announcement ── */
#announcement-bar {
    background: var(--theme-color-primary);
    color: #fff;
    text-align: center;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
}

/* ── Header ── */
.store-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
}
.store-header .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    height: 3.5rem;
    gap: 1rem;
}
.store-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1.125rem;
    color: var(--theme-color-primary);
}
.store-logo .icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: var(--theme-color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}
.store-search {
    flex: 1;
    max-width: 28rem;
    margin: 0 auto;
}
.store-search input {
    width: 100%;
    height: 2.5rem;
    border-radius: 9999px;
    border: 1px solid rgba(0,0,0,0.1);
    padding: 0 1rem 0 2.5rem;
    font-size: 0.875rem;
    outline: none;
}
.store-search input:focus {
    border-color: var(--theme-color-primary);
    box-shadow: 0 0 0 3px rgba(14,165,164,0.1);
}
.store-cart-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--theme-radius-button);
    background: var(--theme-color-primary);
    color: #fff;
    font-weight: 700;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
}

/* ── Hero ── */
#hero-section {
    position: relative;
    overflow: hidden;
    margin: 1rem;
    border-radius: 1.5rem;
    min-height: 280px;
    display: flex;
    align-items: center;
}
.hero-slide {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--theme-color-primary), ${c}cc);
    background-size: cover;
    background-position: center;
}
.hero-content {
    position: relative;
    z-index: 10;
    padding: 3rem 2rem;
    max-width: 600px;
}
.hero-content h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 0.5rem;
}
.hero-content p {
    color: rgba(255,255,255,0.8);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}
.hero-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--theme-radius-button);
    background: #fff;
    color: var(--theme-color-primary);
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
}
.hero-cta-btn:hover { transform: translateY(-2px); }

/* ── Trust Badges ── */
#trust-badges {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    max-width: 1200px;
    margin: 1.5rem auto;
    padding: 0 1rem;
}
.badge-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem;
    border-radius: var(--theme-radius-card);
    border: 1px solid rgba(0,0,0,0.05);
    background: var(--theme-color-bg);
}
.badge-icon { color: var(--theme-color-primary); font-size: 1.25rem; }
.badge-label { font-size: 0.75rem; font-weight: 700; }
.badge-sub { font-size: 0.625rem; color: var(--theme-color-muted); }
@media (max-width: 640px) {
    #trust-badges { grid-template-columns: repeat(2, 1fr); }
}

/* ── Categories ── */
#category-pills {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    scrollbar-width: none;
}
#category-pills::-webkit-scrollbar { display: none; }
.cat-pill {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid rgba(0,0,0,0.1);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
}
.cat-pill:hover { border-color: var(--theme-color-primary); }
.cat-pill-active {
    background: var(--theme-color-primary);
    color: #fff;
    border-color: var(--theme-color-primary);
}

/* ── Product Grid ── */
#products-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
}
.section-title {
    font-size: 1.125rem;
    font-weight: 800;
    margin-bottom: 1rem;
}
.product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}
@media (min-width: 768px) {
    .product-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

/* ── Product Card ── */
.product-card {
    border-radius: var(--theme-radius-card);
    overflow: hidden;
    background: var(--theme-color-bg);
    transition: transform 0.2s, box-shadow 0.3s;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(14,165,164,0.1);
}
.product-img {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f8f8f8;
}
.product-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}
.product-card:hover .product-img img { transform: scale(1.05); }
.product-discount {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    background: #ef4444;
    color: #fff;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
}
.product-cart-btn {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--theme-color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}
.product-card:hover .product-cart-btn { opacity: 1; }
.product-body { padding: 0.75rem; }
.product-name {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.product-price {
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--theme-color-primary);
    margin-top: 0.25rem;
}
.product-strike {
    font-size: 0.75rem;
    color: var(--theme-color-muted);
    text-decoration: line-through;
    margin-left: 0.375rem;
}
.product-variants {
    font-size: 0.625rem;
    color: var(--theme-color-muted);
    margin-top: 0.25rem;
}
.product-add-mobile {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.375rem;
    border-radius: 0.5rem;
    background: var(--theme-color-primary);
    color: #fff;
    font-size: 0.6875rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: none;
}
@media (max-width: 640px) {
    .product-add-mobile { display: block; }
    .product-cart-btn { display: none; }
}

/* ── Testimonials ── */
.testimonial-card {
    padding: 1.5rem;
    border-radius: var(--theme-radius-card);
    border: 1px solid rgba(0,0,0,0.05);
    text-align: center;
}

/* ── FAQ ── */
.faq-item {
    border-bottom: 1px solid rgba(0,0,0,0.06);
    padding: 1rem 0;
}
.faq-question {
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.faq-answer {
    font-size: 0.8125rem;
    color: var(--theme-color-muted);
    margin-top: 0.5rem;
    line-height: 1.6;
}

/* ── Newsletter ── */
#newsletter {
    padding: 3rem 1rem;
    background: rgba(0,0,0,0.02);
    text-align: center;
}
.newsletter-form {
    display: flex;
    gap: 0.5rem;
    max-width: 28rem;
    margin: 1rem auto 0;
}
.newsletter-form input {
    flex: 1;
    height: 2.75rem;
    border-radius: var(--theme-radius-button);
    border: 1px solid rgba(0,0,0,0.1);
    padding: 0 1rem;
}
.newsletter-form button {
    height: 2.75rem;
    padding: 0 1.5rem;
    border-radius: var(--theme-radius-button);
    background: var(--theme-color-primary);
    color: #fff;
    font-weight: 700;
    border: none;
    cursor: pointer;
}

/* ── Footer ── */
.store-footer {
    background: var(--theme-color-text);
    color: var(--theme-color-bg);
    padding: 3rem 1rem 1.5rem;
}
.store-footer .inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
}
@media (max-width: 640px) {
    .store-footer .inner { grid-template-columns: 1fr 1fr; }
}
.footer-brand { font-family: var(--theme-font-heading); }
.store-footer h3 {
    font-size: 0.8125rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
}
.footer-links a {
    display: block;
    font-size: 0.75rem;
    opacity: 0.7;
    margin-bottom: 0.375rem;
    color: inherit;
    text-decoration: none;
}
.footer-links a:hover { opacity: 1; }
.store-footer .bottom {
    max-width: 1200px;
    margin: 2rem auto 0;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    text-align: center;
    font-size: 0.625rem;
    opacity: 0.5;
}

/* ── WhatsApp ── */
.whatsapp-float {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: #25D366;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(37,211,102,0.4);
    z-index: 40;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
}

/* ── Custom Sections (add below) ── */
/* You can add your own sections here.
   Use the same CSS variables for consistency.
   Example:
   .my-custom-banner {
       background: var(--theme-color-primary);
       color: #fff;
       padding: 2rem;
       text-align: center;
       border-radius: var(--theme-radius-card);
       margin: 1rem;
   }
*/
`
}

// ─── Generate the actual store HTML ────────────────────────────────────────────

export function generateLiveStoreHTML(input: StoreCodeInput): string {
    const cats = input.categories.length > 0
        ? input.categories.map((c, i) => `        <button class="cat-pill${i === 0 ? ' cat-pill-active' : ''}">${c}</button>`).join('\n')
        : '        <button class="cat-pill cat-pill-active">🔥 All</button>'

    return `<!-- ═══════════════════════════════════════════════════════
     F-Manager Store — ${input.storeName}
     ──────────────────────────────────────────────────────
     📌 ALL IDs AND CLASSES ARE FUNCTIONAL!
     ✅ You can add sections, change text, edit styles
     ❌ Do NOT remove IDs — they power cart, search, etc.
     ❌ Do NOT add <script> tags — they will be stripped
     ═══════════════════════════════════════════════════════ -->

<div class="store-root" id="store-root">

    <!-- ═══ ANNOUNCEMENT BAR ═══ -->
    ${input.announcement?.enabled ? `<div id="announcement-bar">
        ${input.announcement.text || '🔥 Free shipping on orders above ৳999!'}
    </div>` : `<!-- <div id="announcement-bar">Your announcement here</div> -->`}

    <!-- ═══ HEADER (sticky) ═══ -->
    <header class="store-header" id="store-header">
        <div class="inner">
            <!-- Mobile menu -->
            <button id="mobile-menu-btn" style="display:none;">☰</button>

            <!-- Logo -->
            <a href="/store/${input.slug}" class="store-logo" id="store-logo">
                <div class="icon">${input.storeName[0]?.toUpperCase() || 'S'}</div>
                <span>${input.storeName}</span>
            </a>

            <!-- Search -->
            <div class="store-search">
                <input type="text" id="search-input" placeholder="Search in ${input.storeName}..." />
            </div>

            <!-- Cart -->
            <button class="store-cart-btn" id="cart-button">
                🛒 Cart <span id="cart-count">(0)</span>
            </button>
        </div>
    </header>

    <!-- ═══ HERO SECTION ═══ -->
    <section id="hero-section">
        <div class="hero-slide" style="background: linear-gradient(135deg, var(--theme-color-primary), ${input.primaryColor}cc);"></div>
        <div class="hero-content">
            <h1>${input.bannerTitle}</h1>
            <p>${input.bannerSubtitle}</p>
            <button class="hero-cta-btn" id="hero-cta">${input.bannerCta} →</button>
        </div>
    </section>

    <!-- ═══ TRUST BADGES ═══ -->
    <div id="trust-badges">
        <div class="badge-item">
            <span class="badge-icon">🚚</span>
            <div>
                <div class="badge-label">Fast Delivery</div>
                <div class="badge-sub">Inside Dhaka 24hr</div>
            </div>
        </div>
        <div class="badge-item">
            <span class="badge-icon">🛡️</span>
            <div>
                <div class="badge-label">Secure Payment</div>
                <div class="badge-sub">bKash / COD</div>
            </div>
        </div>
        <div class="badge-item">
            <span class="badge-icon">⭐</span>
            <div>
                <div class="badge-label">Top Rated</div>
                <div class="badge-sub">Trusted by 1000+</div>
            </div>
        </div>
        <div class="badge-item">
            <span class="badge-icon">⚡</span>
            <div>
                <div class="badge-label">Flash Deals</div>
                <div class="badge-sub">Up to 70% off</div>
            </div>
        </div>
    </div>

    <!-- ═══ CATEGORY PILLS ═══ -->
    <div id="category-pills">
${cats}
    </div>

    <!-- ═══ PRODUCTS ═══ -->
    <section id="products-section">
        <h2 class="section-title">All Products</h2>
        <div class="product-grid" id="product-grid">

            <!-- 🔄 Products are rendered dynamically from your dashboard.
                 This is a sample card showing the HTML structure. -->
            <div class="product-card" data-product-id="sample-1">
                <div class="product-img">
                    <img src="https://placehold.co/400x400/0EA5A4/ffffff?text=Product" alt="Product" />
                    <span class="product-discount">-20%</span>
                    <button class="product-cart-btn" title="Add to cart">🛒</button>
                </div>
                <div class="product-body">
                    <p class="product-name">Sample Product Name</p>
                    <div>
                        <span class="product-price">৳599</span>
                        <span class="product-strike">৳749</span>
                    </div>
                    <p class="product-variants">3 variants</p>
                    <button class="product-add-mobile">Add to Cart</button>
                </div>
            </div>

            <!-- ✅ Products repeat this same structure automatically -->

        </div>
    </section>

    <!-- ═══ TESTIMONIALS ═══ -->
    <section id="testimonials" style="padding: 2rem 1rem; max-width: 1200px; margin: 0 auto;">
        <h2 class="section-title">What Customers Say</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div class="testimonial-card">
                <p style="font-size: 0.875rem;">"Amazing quality! Will order again ❤️"</p>
                <p style="font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem;">— Sabrina R.</p>
            </div>
            <div class="testimonial-card">
                <p style="font-size: 0.875rem;">"Best price and genuine products!"</p>
                <p style="font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem;">— Rafiq H.</p>
            </div>
            <div class="testimonial-card">
                <p style="font-size: 0.875rem;">"Customer service is excellent 🔥"</p>
                <p style="font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem;">— Nusrat F.</p>
            </div>
        </div>
    </section>

    <!-- ═══ FAQ ═══ -->
    <section id="faq-section" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
        <h2 class="section-title">FAQ</h2>
        <div class="faq-item">
            <div class="faq-question">How long does delivery take? <span>▼</span></div>
            <div class="faq-answer">Inside Dhaka: 1-2 days. Outside Dhaka: 2-4 days.</div>
        </div>
        <div class="faq-item">
            <div class="faq-question">What payment methods do you accept? <span>▼</span></div>
            <div class="faq-answer">Cash on Delivery (COD), bKash, and Nagad.</div>
        </div>
        <div class="faq-item">
            <div class="faq-question">Can I return a product? <span>▼</span></div>
            <div class="faq-answer">Yes, within 3 days if unused and in original packaging.</div>
        </div>
    </section>

    <!-- ═══ NEWSLETTER ═══ -->
    <section id="newsletter">
        <h2 style="font-size: 1.125rem; font-weight: 800;">Stay Updated</h2>
        <p style="font-size: 0.875rem; color: var(--theme-color-muted);">Get notified about new products and offers.</p>
        <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
        </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="store-footer" id="store-footer">
        <div class="inner">
            <div class="footer-brand">
                <div class="store-logo" style="color: inherit; margin-bottom: 0.75rem;">
                    <div class="icon">${input.storeName[0]?.toUpperCase() || 'S'}</div>
                    <span>${input.storeName}</span>
                </div>
                <p style="font-size: 0.75rem; opacity: 0.7;">${input.tagline}</p>
            </div>
            <div class="footer-links">
                <h3>Shop</h3>
                <a href="/store/${input.slug}">All Products</a>
                <a href="/store/${input.slug}">New Arrivals</a>
                <a href="/store/${input.slug}">Deals</a>
            </div>
            <div class="footer-links">
                <h3>Support</h3>
                <a href="/store/${input.slug}/track">Track Order</a>
                <a href="#">Returns</a>
                <a href="#">Contact Us</a>
            </div>
            <div class="footer-links">
                <h3>Connect</h3>
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">WhatsApp</a>
            </div>
        </div>
        <div class="bottom">
            © ${new Date().getFullYear()} ${input.storeName}. Powered by F-Manager
        </div>
    </footer>

    <!-- ═══ WHATSAPP BUTTON ═══ -->
    ${input.whatsappNumber ? `<a href="https://wa.me/${input.whatsappNumber}" target="_blank" class="whatsapp-float" id="whatsapp-btn">💬</a>` : `<!-- <a href="https://wa.me/YOUR_NUMBER" class="whatsapp-float" id="whatsapp-btn">💬</a> -->`}

</div>

<!-- ══════════════════════════════════════════════════
     ✏️ ADD YOUR CUSTOM SECTIONS BELOW
     ──────────────────────────────────────────────────
     You can add extra HTML sections here.
     Use the CSS variables for consistent theming.
     Do NOT add <script> tags.

     Example:
     <section style="padding: 2rem; text-align: center; background: var(--theme-color-primary); color: #fff; margin: 1rem; border-radius: var(--theme-radius-card);">
         <h2>Special Offer!</h2>
         <p>Use code SAVE20 for 20% off</p>
     </section>
     ══════════════════════════════════════════════════ -->
`
}
