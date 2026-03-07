import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const sellerId = formData.get("seller_id") as string

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 })
        }

        // Generate unique filename
        const ext = file.name.split(".").pop() || "jpg"
        const filename = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from("product-images")
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) {
            console.error("Storage upload error:", error)
            return NextResponse.json({ error: "Failed to upload file. Please try again." }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(data.path)

        return NextResponse.json({ url: urlData.publicUrl })
    } catch (err: any) {
        console.error("Upload API error:", err)
        return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
    }
}
