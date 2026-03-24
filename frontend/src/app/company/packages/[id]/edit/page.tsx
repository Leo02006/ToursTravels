'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { GlobeLoader } from '@/components/ui/GlobeLoader'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'
import { proxyImage } from '@/lib/imageProxy'

export default function EditPackagePage() {
    const router = useRouter()
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        duration: 1,
        price: 0,
        slots: 10,
        imageUrl: '',
        itinerary: '',
        inclusions: '',
        exclusions: '',
        theme: '',
        discount: 0,
        availableDates: '',
        currency: 'USD'
    })
    const [imageFile, setImageFile] = useState<File | null>(null)

    useEffect(() => {
        // Verify user is a company
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (!data.user || data.user.role !== 'COMPANY') router.push('/auth/login')
            })

        // Load existing package data
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages`, { credentials: 'include' })
            .then(res => res.json())
            .then(packages => {
                const pkg = packages.find((p: any) => String(p._id || p.id) === id)
                if (pkg) {
                    setFormData({
                        title: pkg.title || '',
                        destination: pkg.destination || '',
                        duration: pkg.duration || 1,
                        price: pkg.price || 0,
                        slots: pkg.slots || 10,
                        imageUrl: pkg.imageUrl || '',
                        itinerary: pkg.itinerary || '',
                        inclusions: pkg.inclusions || '',
                        exclusions: pkg.exclusions || '',
                        theme: pkg.theme || '',
                        discount: pkg.discount || 0,
                        availableDates: pkg.availableDates ? pkg.availableDates.join(', ') : '',
                        currency: pkg.currency || 'USD'
                    })
                }
                setFetching(false)
            })
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let finalImageUrl = formData.imageUrl

            // 1. Upload new image if selected
            if (imageFile) {
                const uploadData = new FormData()
                uploadData.append('image', imageFile)

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
                    method: 'POST',
                    body: uploadData,
                    credentials: 'include'
                })

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json()
                    throw new Error(errorData.error || 'Failed to upload new image')
                }

                const uploadResult = await uploadRes.json()
                finalImageUrl = uploadResult.imageUrl
            }

            // 2. Update package
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    duration: Number(formData.duration),
                    price: Number(formData.price),
                    slots: Number(formData.slots),
                    theme: formData.theme,
                    discount: Number(formData.discount),
                    exclusions: formData.exclusions,
                    availableDates: formData.availableDates ? formData.availableDates.split(',').map(d => d.trim()).filter(Boolean) : [],
                    imageUrl: finalImageUrl
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update package')
            }

            setSuccess(true)
            setTimeout(() => router.push('/company'), 2000)
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    if (fetching) return <><Navbar /><GlobeLoader /></>

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-xl">
                        <div className="bg-amber-500 p-6 text-white shrink-0">
                            <CardTitle className="text-white text-2xl">Edit Tour Package</CardTitle>
                            <p className="text-amber-100 text-sm mt-1">Update your package details below.</p>
                        </div>
                        <CardContent className="p-8">
                            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
                            {success && (
                                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Package updated! It is now PENDING admin approval before going live. Redirecting...
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Package Title</label>
                                        <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Theme</label>
                                        <input type="text" placeholder="Adventure, Romantic, etc." className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.theme} onChange={e => setFormData({ ...formData, theme: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Destination</label>
                                        <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Duration (Days)</label>
                                        <input type="number" min="1" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Currency</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                                            <option value="USD">USD ($)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Price Per Person</label>
                                        <input type="number" min="0" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Discount Percentage (%)</label>
                                        <input type="number" min="0" max="100" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Total Available Slots</label>
                                        <input type="number" min="1" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.slots} onChange={e => setFormData({ ...formData, slots: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Available Dates (Comma sep)</label>
                                        <input type="text" placeholder="DD-MM-YYYY, DD-MM-YYYY" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                                            value={formData.availableDates} onChange={e => setFormData({ ...formData, availableDates: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700">Update Package Image</label>
                                        <div className="flex items-center gap-4">
                                            {/* Preview of current or new image */}
                                            {(imageFile || formData.imageUrl) && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                    <img
                                                        src={imageFile ? URL.createObjectURL(imageFile) : (proxyImage(formData.imageUrl) || undefined)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                                onChange={e => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setImageFile(e.target.files[0])
                                                    }
                                                }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Detailed Itinerary</label>
                                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"
                                        value={formData.itinerary} onChange={e => setFormData({ ...formData, itinerary: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Inclusions (Flights, Hotel, etc.)</label>
                                    <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"
                                        value={formData.inclusions} onChange={e => setFormData({ ...formData, inclusions: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Exclusions (Personal expenses, etc.)</label>
                                    <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"
                                        value={formData.exclusions} onChange={e => setFormData({ ...formData, exclusions: e.target.value })} />
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                                    <Button type="button" variant="ghost" onClick={() => router.push('/company')}>Cancel</Button>
                                    <Button type="submit" isLoading={loading} className="bg-amber-500 hover:bg-amber-600">Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
