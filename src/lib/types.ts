// ─── Database Types (mirrors Supabase schema) ─────────────────────────────────

export interface Seller {
    id: string
    user_id?: string
    name: string
    slug: string
    phone?: string
    email?: string
    logo_url?: string
    plan: 'free' | 'pro'
    api_keys: Record<string, string>
    settings: SellerSettings
    created_at: string
}

export interface SellerSettings {
    // Store builder basics
    store_tagline?: string
    store_template?: 'starter' | 'pro'
    theme_color?: string
    banner_image?: string
    banner_title?: string
    banner_subtitle?: string
    banner_cta?: string
    delivery_inside?: number
    delivery_outside?: number

    // Announcement bar
    announcement_bar?: {
        enabled: boolean
        text: string
        bg_color: string
        text_color: string
        link?: string
    }

    // Navigation links
    nav_links?: Array<{ label: string; href: string }>

    // Homepage sections (order matters — seller can reorder)
    sections?: StoreSection[]

    // Theme config
    theme?: ThemeConfig

    // Footer
    footer?: FooterConfig

    // Domain
    domain?: DomainConfig

    [key: string]: unknown
}

// ─── Store Sections ────────────────────────────────────────────────────────────

export type StoreSectionType =
    | 'hero_slider'
    | 'category_pills'
    | 'featured_products'
    | 'new_arrivals'
    | 'campaign_banner'
    | 'testimonials'
    | 'faq'
    | 'newsletter'

export interface StoreSection {
    id: string
    type: StoreSectionType
    enabled: boolean
    order: number
    config: Record<string, unknown>
    _expanded?: boolean
    [key: string]: unknown
}

// ─── Theme Config ──────────────────────────────────────────────────────────────

export type ThemePreset = 'fashion' | 'electronics' | 'health' | 'education' | 'custom'

export interface ThemeConfig {
    preset: ThemePreset
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: string
    }
    font_heading: string  // Google Font name
    font_body: string
    border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
    fashion: {
        preset: 'fashion',
        colors: { primary: '#1a1a1a', secondary: '#f5f0eb', accent: '#c9a96e', background: '#ffffff', text: '#1a1a1a' },
        font_heading: 'Playfair Display', font_body: 'Inter',
        border_radius: 'none',
    },
    electronics: {
        preset: 'electronics',
        colors: { primary: '#0066ff', secondary: '#f0f4ff', accent: '#00d4aa', background: '#ffffff', text: '#111827' },
        font_heading: 'Inter', font_body: 'Inter',
        border_radius: 'lg',
    },
    health: {
        preset: 'health',
        colors: { primary: '#059669', secondary: '#ecfdf5', accent: '#f59e0b', background: '#ffffff', text: '#064e3b' },
        font_heading: 'Outfit', font_body: 'Inter',
        border_radius: 'md',
    },
    education: {
        preset: 'education',
        colors: { primary: '#4f46e5', secondary: '#eef2ff', accent: '#ec4899', background: '#ffffff', text: '#1e1b4b' },
        font_heading: 'Outfit', font_body: 'Inter',
        border_radius: 'md',
    },
    custom: {
        preset: 'custom',
        colors: { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b', background: '#ffffff', text: '#111827' },
        font_heading: 'Inter', font_body: 'Inter',
        border_radius: 'md',
    },
}

// ─── Footer Config ─────────────────────────────────────────────────────────────

export interface FooterConfig {
    columns: Array<{
        title: string
        links: Array<{ label: string; href: string }>
    }>
    social: {
        facebook?: string
        instagram?: string
        whatsapp?: string
        youtube?: string
    }
    copyright_text?: string
}

// ─── Domain Config ─────────────────────────────────────────────────────────────

export interface DomainConfig {
    custom_domain: string
    dns_record: string       // CNAME value to set
    dns_verified: boolean
    ssl_active: boolean
    verified_at?: string
}

// ─── Products ──────────────────────────────────────────────────────────────────

export type ProductCategory = 'fashion' | 'books' | 'electronics' | 'grocery' | 'others'

export interface Product {
    id: string
    seller_id: string
    name: string
    category: ProductCategory
    description?: string
    buying_price: number
    selling_price: number
    discount: number
    images: string[]
    metadata: Record<string, unknown>  // JSONB dynamic fields
    has_variants: boolean
    stock: number
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined data
    variants?: Variant[]
}

export interface Variant {
    id: string
    product_id: string
    label: string
    sku?: string
    stock: number
    price_override?: number
    created_at: string
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type DeliveryArea = 'dhaka' | 'outside'
export type PaymentMethod = 'cod' | 'bkash' | 'nagad'

export interface Order {
    id: string
    order_number: string
    seller_id: string
    customer_name: string
    customer_phone: string
    customer_address: string
    delivery_area: DeliveryArea
    delivery_charge: number
    subtotal: number
    total: number
    payment_method: PaymentMethod
    trx_id?: string
    status: OrderStatus
    otp_code?: string
    otp_verified: boolean
    courier_awb?: string
    courier_status?: string
    notes?: string
    created_at: string
    updated_at: string
    // Joined data
    order_items?: OrderItem[]
    tracking?: OrderTracking[]
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    variant_id?: string
    product_name: string
    variant_label?: string
    quantity: number
    unit_price: number
    created_at: string
}

export interface OrderTracking {
    id: string
    order_id: string
    status: OrderStatus
    note?: string
    created_at: string
}

// ─── Campaigns ─────────────────────────────────────────────────────────────────

export interface Campaign {
    id: string
    seller_id: string
    name: string
    banner_image?: string
    discount_percent: number
    start_date: string
    end_date: string
    product_ids: string[]
    is_active: boolean
    created_at: string
}

// ─── Blacklist ─────────────────────────────────────────────────────────────────

export interface BlacklistEntry {
    id: string
    phone: string
    reason?: string
    flagged_by?: string
    created_at: string
}

// ─── POS ───────────────────────────────────────────────────────────────────────

export interface PosSale {
    id: string
    sale_number: string
    seller_id: string
    customer_name?: string
    items: Array<{
        product_id: string
        name: string
        qty: number
        price: number
    }>
    total: number
    created_at: string
}

// ─── Frontend-Specific Types ───────────────────────────────────────────────────

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    variant_id?: string
    variant_label?: string
    image?: string
    seller_id?: string
}

// Store-scoped cart (per-seller)
export interface StoreCart {
    seller_slug: string
    items: CartItem[]
    updated_at: string
}

// Category-specific metadata field definitions
export const CATEGORY_FIELDS: Record<ProductCategory, { key: string; label: string; type: 'text' | 'number' | 'date' }[]> = {
    fashion: [
        { key: 'color', label: 'Color', type: 'text' },
        { key: 'fabric', label: 'Fabric / Material', type: 'text' },
    ],
    books: [
        { key: 'author', label: 'Author Name', type: 'text' },
        { key: 'publisher', label: 'Publisher', type: 'text' },
    ],
    electronics: [
        { key: 'warranty', label: 'Warranty Period', type: 'text' },
        { key: 'model', label: 'Model', type: 'text' },
    ],
    grocery: [
        { key: 'weight_unit', label: 'Weight/Unit (KG, Litre, Gram)', type: 'text' },
        { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
    ],
    others: [],
}

export const DELIVERY_CHARGES = {
    dhaka: 60,
    outside: 120,
} as const

// ─── Default Store Sections ────────────────────────────────────────────────────

export const DEFAULT_STORE_SECTIONS: StoreSection[] = [
    { id: 'hero', type: 'hero_slider', enabled: true, order: 0, config: { slides: [] } },
    { id: 'categories', type: 'category_pills', enabled: true, order: 1, config: {} },
    { id: 'featured', type: 'featured_products', enabled: true, order: 2, config: { title: 'Featured Products', limit: 8 } },
    { id: 'arrivals', type: 'new_arrivals', enabled: true, order: 3, config: { title: 'New Arrivals', limit: 8 } },
    { id: 'campaign', type: 'campaign_banner', enabled: false, order: 4, config: {} },
    { id: 'testimonials', type: 'testimonials', enabled: false, order: 5, config: { items: [] } },
    { id: 'faq', type: 'faq', enabled: false, order: 6, config: { items: [] } },
    { id: 'newsletter', type: 'newsletter', enabled: false, order: 7, config: { title: 'Stay Updated', subtitle: 'Subscribe for the latest deals' } },
]
