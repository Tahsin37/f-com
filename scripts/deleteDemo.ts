import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // use Service Role key if RLS enabled, but ANON is fine for reading public docs? Actually, products RLS might allow delete only if authenticated. Better use SUPABASE_SERVICE_ROLE_KEY if available.

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    // 1. Get sifr-style seller
    const { data: seller, error } = await supabase
        .from("sellers")
        .select("id, name, slug")
        .eq("slug", "sifr-style")
        .single();

    if (error || !seller) {
        console.error("Seller not found");
        return;
    }

    console.log("Found seller:", seller.name, seller.id);

    // 2. Get all products for this seller
    const { data: products, error: pError } = await supabase
        .from("products")
        .select("id, name, created_at")
        .eq("seller_id", seller.id);

    if (pError || !products) {
        console.error("Error fetching products", pError);
        return;
    }

    console.log(`Found ${products.length} products for ${seller.slug}:`);
    for (const p of products) {
        console.log(` - [${p.id}] ${p.name} (created: ${p.created_at})`);
    }

    // Identify demo products. Let's delete anything with "Demo", "Sample", "Oil", "Premium", "T-Shirt", "Saree" etc. 
    // Or we will just log them first.
}

main();
