-- Review System Implementation
-- 1. Create table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);

-- 3. Row Level Security Setup
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- SELLERS can full manage reviews on their products
CREATE POLICY "Sellers manage own reviews" 
ON public.reviews FOR ALL 
USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- PUBLIC can READ published reviews
CREATE POLICY "Public read published reviews" 
ON public.reviews FOR SELECT 
USING (is_published = true);

-- PUBLIC can INSERT new reviews
CREATE POLICY "Public insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);
