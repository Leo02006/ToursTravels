'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { MapPin, Clock, Users, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useCurrency } from '@/lib/CurrencyContext'
import { proxyImage, destinationImage } from '@/lib/imageProxy'
import { GlobeLoader } from '@/components/ui/GlobeLoader'
import { formatDate } from '@/lib/dateUtils'

export default function TourDetailsPage() {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    const router = useRouter()
    const [tour, setTour] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [participants, setParticipants] = useState(1)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [reviews, setReviews] = useState<any[]>([])
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, { credentials: 'include' }).then(res => res.json()).then(data => setUser(data.user))
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages?id=${id}`, { credentials: 'include' }) 
            .then(res => res.json())
            .then(data => {
                const found = data.find((t: any) => String(t._id || t.id) === id)
                setTour(found)
                if (found && found.availableDates?.length > 0) {
                    setSelectedDate(found.availableDates[0])
                }
            })
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/package/${id}`)
            .then(res => res.json())
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
    }, [id])

    const handleBook = async () => {
        if (!user) {
            router.push('/auth/login')
            return
        }

        setBookingLoading(true)
        setError('')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ packageId: id, participants, bookingDate: selectedDate })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Booking failed')

            setSuccess('Booking confirmed successfully!')
            setTimeout(() => router.push('/customer'), 2000)
        } catch (err: any) {
            console.error("Booking Error Detail:", err);
            setError(err.message)
        } finally {
            setBookingLoading(false)
        }
    }

    if (!tour) return <><Navbar /><GlobeLoader /></>

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-28 pb-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                    <div className="lg:w-2/3 space-y-8">
                        <div className="h-[400px] rounded-3xl overflow-hidden bg-slate-200 relative shadow-md">
                            {(() => {
                                const imgSrc = proxyImage(tour.imageUrl) || destinationImage(tour.destination, id)
                                return imgSrc
                                    ? <img src={imgSrc} alt={tour.title} className="w-full h-full object-cover" />
                                    : <div className="flex items-center justify-center w-full h-full text-slate-400">No Image Preview</div>
                            })()}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-4">
                                <MapPin className="w-5 h-5" /> {tour.destination}
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">{tour.title}</h1>
                            <p className="text-slate-600 font-medium mb-6">Offered by {tour.company?.companyName}</p>

                            <div className="flex gap-6 border-y border-slate-200 py-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock className="w-6 h-6" /></div>
                                    <div><p className="text-sm text-slate-500">Duration</p><p className="font-semibold text-slate-900">{tour.duration} Days</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><Users className="w-6 h-6" /></div>
                                    <div><p className="text-sm text-slate-500">Availability</p><p className="font-semibold text-slate-900">{tour.slots} Slots left</p></div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Itinerary</h3>
                                <p className="text-slate-600 leading-relaxed">{tour.itinerary || 'Detailed itinerary will be provided upon booking confirmation.'}</p>

                                <h3 className="text-2xl font-bold text-slate-900 mt-8">What's Included</h3>
                                <p className="text-slate-600 leading-relaxed">{tour.inclusions || 'Flight, Accommodation, Transfers, Sightseeing'}</p>

                                {tour.exclusions && (
                                    <>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-8 text-red-600">What's Excluded</h3>
                                        <p className="text-slate-600 leading-relaxed">{tour.exclusions}</p>
                                    </>
                                )}

                                {/* Reviews Section */}
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Customer Reviews ({reviews.length})</h3>
                                    {reviews.length === 0 ? (
                                        <p className="text-slate-500 italic bg-slate-100 p-6 rounded-2xl text-center">No reviews yet for this package.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map(review => (
                                                <div key={review._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-semibold text-slate-800">{review.userId?.name || 'Customer'}</span>
                                                        <div className="flex items-center gap-1 text-amber-500">
                                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                                                    {review.adminResponse && (
                                                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                                                            <p className="text-xs font-bold text-blue-700 uppercase mb-1 flex items-center gap-1">
                                                                <ShieldCheck className="w-3 h-3" /> Official Reply
                                                            </p>
                                                            <p className="text-sm text-slate-700 italic">{review.adminResponse}</p>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-slate-400 mt-3 block">{formatDate(review.createdAt)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <Card className="sticky top-28 border-2 border-slate-100 shadow-xl">
                            <CardContent className="p-8">
                                <div className="mb-6">
                                    <p className="text-slate-500 font-medium mb-1 flex justify-between items-center">
                                        Total Price
                                        {tour.discount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">-{tour.discount}% OFF</span>
                                        )}
                                    </p>
                                    <div className="flex items-end gap-2">
                                        {tour.discount > 0 ? (
                                            <>
                                                <span className="text-4xl font-black text-blue-600">
                                                    {format(tour.price * (1 - tour.discount / 100), tour.currency)}
                                                </span>
                                                <span className="text-lg text-slate-400 line-through pb-1">{format(tour.price, tour.currency)}</span>
                                            </>
                                        ) : (
                                            <span className="text-4xl font-bold text-slate-900">{format(tour.price, tour.currency)}</span>
                                        )}
                                        <span className="text-slate-500 pb-1">/ person</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {tour.availableDates && tour.availableDates.length > 0 && (
                                        <div className="flex flex-col gap-2 py-3 border-b border-slate-100">
                                            <span className="font-medium text-slate-700">Select Date</span>
                                            <select 
                                                value={selectedDate} 
                                                onChange={e => setSelectedDate(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-blue-500 transition"
                                            >
                                                {tour.availableDates.map((d: string) => <option key={d} value={d}>{formatDate(d)}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="font-medium text-slate-700">Participants</span>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                            <button onClick={() => setParticipants(Math.max(1, participants - 1))} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-slate-50 transition">-</button>
                                            <span className="font-semibold text-slate-800 w-4 text-center">{participants}</span>
                                            <button onClick={() => setParticipants(Math.min(tour.slots, participants + 1))} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-slate-50 transition">+</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="font-medium text-slate-700">Total</span>
                                        <span className="font-bold text-xl text-blue-600">
                                            {format((tour.discount > 0 ? tour.price * (1 - tour.discount / 100) : tour.price) * participants, tour.currency)}
                                        </span>
                                    </div>
                                </div>

                                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
                                {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4" />{success}</div>}

                                <Button
                                    className="w-full h-14 text-lg"
                                    onClick={handleBook}
                                    isLoading={bookingLoading}
                                    disabled={!!success || tour.slots === 0}
                                >
                                    {tour.slots === 0 ? 'Sold Out' : user ? 'Confirm Booking' : 'Log in to Book'}
                                </Button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Payment API Integration
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </>
    )
}
