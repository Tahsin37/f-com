// ─── Database Types (mirrors Supabase schema) ─────────────────────────────────

export interface Seller {
    id: string
    name: string
    slug: string
    phone?: string
    email?: string
    logo_url?: string
    plan: 'free' | 'pro'
    api_keys: Record<string, string>
    settings: {
        delivery_inside?: number
        delivery_outside?: number
        [key: string]: unknown
    }
    created_at: string
}

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

export interface BlacklistEntry {
    id: string
    phone: string
    reason?: string
    flagged_by?: string
    created_at: string
}

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
