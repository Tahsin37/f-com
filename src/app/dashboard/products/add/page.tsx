"use client"

import React, { useState, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { CATEGORY_FIELDS, type ProductCategory } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft, Save, Plus, Trash2, Loader2, Upload, X,
    ShoppingBag, BookOpen, Cpu, Apple, MoreHorizontal, ImagePlus
} from "lucide-react"
import Link from "next/link"

// seller_id is fetched from session

const CATEGORY_OPTIONS: { value: ProductCategory; label: string; icon: React.ElementType; labelBn: string }[] = [
    { value: "fashion", label: "Fashion", icon: ShoppingBag, labelBn: "জামা/জুতো" },
    { value: "books", label: "Books", icon: BookOpen, labelBn: "বই" },
    { value: "electronics", label: "Electronics", icon: Cpu, labelBn: "গ্যাজেট" },
    { value: "grocery", label: "Grocery/Food", icon: Apple, labelBn: "খাবার" },
    { value: "others", label: "Others", icon: MoreHorizontal, labelBn: "অন্যান্য" },
]

interface VariantRow {
    id?: string
    label: string
    sku: string
    stock: number
    price_override: string
}

function AddProductForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get("edit")
    const isEdit = !!editId

    // Form state
    const [category, setCategory] = useState<ProductCategory | "">("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [buyingPrice, setBuyingPrice] = useState("")
    const [sellingPrice, setSellingPrice] = useState("")
    const [discount, setDiscount] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [metadata, setMetadata] = useState<Record<string, string>>({})
    const [hasVariants, setHasVariants] = useState(false)
    const [stock, setStock] = useState("")
    const [variants, setVariants] = useState<VariantRow[]>([])
    const [saving, setSaving] = useState(false)
    const [loadingEdit, setLoadingEdit] = useState(false)
    const [sellerId, setSellerId] = useState("")
    const [uploading, setUploading] = useState(false)

    // Get seller_id from session
    useEffect(() => {
        async function getSeller() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.id) return
            const { data } = await supabase.from("sellers").select("id").eq("user_id", session.user.id).single()
            if (data) setSellerId(data.id)
        }
        getSeller()
    }, [])

    // Load product for editing
    useEffect(() => {
        if (!editId) return
        setLoadingEdit(true)
        supabase
            .from("products")
            .select("*, variants(*)")
            .eq("id", editId)
            .single()
            .then(({ data }) => {
                if (data) {
                    setCategory(data.category)
                    setName(data.name)
                    setDescription(data.description || "")
                    setBuyingPrice(String(data.buying_price))
                    setSellingPrice(String(data.selling_price))
                    setDiscount(String(data.discount || ""))
                    setImages(data.images || [])
                    setMetadata(data.metadata || {})
                    setHasVariants(data.has_variants)
                    setStock(String(data.stock))
                    if (data.variants?.length) {
                        setVariants(data.variants.map((v: any) => ({
                            id: v.id,
                            label: v.label,
                            sku: v.sku || "",
                            stock: v.stock,
                            price_override: v.price_override ? String(v.price_override) : "",
                        })))
                    }
                }
                setLoadingEdit(false)
            })
    }, [editId])

    const addVariant = () => {
        setVariants(prev => [...prev, { label: "", sku: "", stock: 0, price_override: "" }])
    }

    const updateVariant = (idx: number, field: keyof VariantRow, value: string | number) => {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
    }

    const removeVariant = (idx: number) => {
        setVariants(prev => prev.filter((_, i) => i !== idx))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!category || !name || !sellingPrice) {
            toast.error("Please fill in category, name, and selling price")
            return
        }

        setSaving(true)

        const productData = {
            seller_id: sellerId,
            name,
            category,
            description: description || null,
            buying_price: Number(buyingPrice) || 0,
            selling_price: Number(sellingPrice),
            discount: Number(discount) || 0,
            images,
            metadata,
            has_variants: hasVariants,
            stock: hasVariants ? 0 : (Number(stock) || 0),
            updated_at: new Date().toISOString(),
        }

        try {
            let productId = editId

            if (isEdit) {
                const { error } = await supabase.from("products").update(productData).eq("id", editId)
                if (error) throw error
            } else {
                const { data, error } = await supabase.from("products").insert(productData).select("id").single()
                if (error) throw error
                productId = data.id
            }

            // Handle variants
            if (hasVariants && productId) {
                // Delete existing variants for this product (simpler than diffing)
                await supabase.from("variants").delete().eq("product_id", productId)

                // Insert new variants
                if (variants.length > 0) {
                    const variantRows = variants.map(v => ({
                        product_id: productId!,
                        label: v.label,
                        sku: v.sku || null,
                        stock: v.stock,
                        price_override: v.price_override ? Number(v.price_override) : null,
                    }))
                    const { error: vErr } = await supabase.from("variants").insert(variantRows)
                    if (vErr) throw vErr
                }
            }

            toast.success(isEdit ? "Product updated!" : "Product created!")
            router.push("/dashboard/products")
        } catch (err: any) {
            toast.error(err.message || "Failed to save product")
        } finally {
            setSaving(false)
        }
    }

    const dynamicFields = category ? CATEGORY_FIELDS[category as ProductCategory] : []

    if (loadingEdit) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/products">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold">{isEdit ? "Edit Product" : "Add Product"}</h1>
                    <p className="text-muted-foreground text-sm">
                        {isEdit ? "Update product details below" : "Step by step — select category first"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Category */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Step 1: Product Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {CATEGORY_OPTIONS.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${category === cat.value
                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                        }`}
                                >
                                    <cat.icon className={`h-6 w-6 mx-auto mb-2 ${category === cat.value ? "text-teal-600" : "text-muted-foreground"}`} />
                                    <p className="text-xs font-bold">{cat.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{cat.labelBn}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Universal Fields */}
                {category && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Step 2: Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-semibold">Product Name <span className="text-red-500">*</span></Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Cotton Panjabi" className="h-11 rounded-xl" />
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Buying Price (৳)</Label>
                                    <Input type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)} placeholder="0" className="h-11 rounded-xl" />
                                    <p className="text-[10px] text-muted-foreground">Admin only (for profit calc)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Selling Price (৳) <span className="text-red-500">*</span></Label>
                                    <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Discount (%)</Label>
                                    <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" className="h-11 rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Description</Label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Product description..."
                                    rows={3}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="font-semibold flex items-center gap-2">
                                    <ImagePlus className="h-4 w-4" /> Product Images
                                </Label>

                                {/* Image previews */}
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload area  */}
                                {images.length < 5 && (
                                    <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            multiple
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const files = e.target.files
                                                if (!files || files.length === 0) return
                                                setUploading(true)
                                                const newUrls: string[] = []
                                                for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
                                                    const formData = new FormData()
                                                    formData.append("file", files[i])
                                                    formData.append("seller_id", sellerId)
                                                    try {
                                                        const res = await fetch("/api/upload", { method: "POST", body: formData })
                                                        const data = await res.json()
                                                        if (data.url) newUrls.push(data.url)
                                                        else toast.error(data.error || "Upload failed")
                                                    } catch { toast.error("Upload failed") }
                                                }
                                                if (newUrls.length > 0) {
                                                    setImages(prev => [...prev, ...newUrls])
                                                    toast.success(`${newUrls.length} image(s) uploaded!`)
                                                }
                                                setUploading(false)
                                                e.target.value = ""
                                            }}
                                        />
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin text-teal-600 mb-1" />
                                                <span className="text-xs text-teal-600 font-semibold">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                                <span className="text-xs text-muted-foreground font-semibold">Click to upload images</span>
                                                <span className="text-[10px] text-muted-foreground">JPEG, PNG, WebP, GIF — Max 5MB each</span>
                                            </>
                                        )}
                                    </label>
                                )}
                                <p className="text-[10px] text-muted-foreground">{images.length}/5 images uploaded</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Dynamic Fields (per category) */}
                {category && dynamicFields.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                Step 3: {category.charAt(0).toUpperCase() + category.slice(1)} Details
                                <Badge variant="secondary" className="text-[10px]">Dynamic Fields</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {dynamicFields.map(field => (
                                    <div key={field.key} className="space-y-2">
                                        <Label className="font-semibold">{field.label}</Label>
                                        <Input
                                            type={field.type}
                                            value={metadata[field.key] || ""}
                                            onChange={e => setMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.label}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Variants or Simple Stock */}
                {category && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                {dynamicFields.length > 0 ? "Step 4" : "Step 3"}: Stock & Variants
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50">
                                <Label className="font-semibold">Does this product have variants?</Label>
                                <div className="flex gap-2 ml-auto">
                                    <Button type="button" variant={hasVariants ? "default" : "outline"} size="sm" className="rounded-lg"
                                        onClick={() => setHasVariants(true)}>Yes</Button>
                                    <Button type="button" variant={!hasVariants ? "default" : "outline"} size="sm" className="rounded-lg"
                                        onClick={() => setHasVariants(false)}>No</Button>
                                </div>
                            </div>

                            {!hasVariants ? (
                                <div className="space-y-2">
                                    <Label className="font-semibold">Total Stock</Label>
                                    <Input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="h-11 rounded-xl max-w-xs" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Variant Rows */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-muted-foreground text-xs border-b">
                                                    <th className="py-2 pr-3">Label (e.g. "M / Red")</th>
                                                    <th className="py-2 pr-3">SKU</th>
                                                    <th className="py-2 pr-3">Stock</th>
                                                    <th className="py-2 pr-3">Price Override (৳)</th>
                                                    <th className="py-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variants.map((v, i) => (
                                                    <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800">
                                                        <td className="py-2 pr-3">
                                                            <Input value={v.label} onChange={e => updateVariant(i, "label", e.target.value)}
                                                                placeholder="M" className="h-9 rounded-lg text-sm" />
                                                        </td>
                                                        <td className="py-2 pr-3">
                                                            <Input value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)}
                                                                placeholder="SKU-001" className="h-9 rounded-lg text-sm" />
                                                        </td>
                                                        <td className="py-2 pr-3">
                                                            <Input type="number" value={v.stock} onChange={e => updateVariant(i, "stock", Number(e.target.value))}
                                                                className="h-9 rounded-lg text-sm w-20" />
                                                        </td>
                                                        <td className="py-2 pr-3">
                                                            <Input type="number" value={v.price_override} onChange={e => updateVariant(i, "price_override", e.target.value)}
                                                                placeholder="—" className="h-9 rounded-lg text-sm w-24" />
                                                        </td>
                                                        <td className="py-2">
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500"
                                                                onClick={() => removeVariant(i)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-lg gap-1">
                                        <Plus className="h-3.5 w-3.5" /> Add Variant
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Submit */}
                {category && (
                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={saving}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 font-bold gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? "Saving..." : (isEdit ? "Update Product" : "Create Product")}
                        </Button>
                        <Link href="/dashboard/products">
                            <Button type="button" variant="outline" className="rounded-xl h-12">Cancel</Button>
                        </Link>
                    </div>
                )}
            </form>
        </div>
    )
}

export default function AddProductPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        }>
            <AddProductForm />
        </Suspense>
    )
}
