'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { API_URL } from '@/config/api'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { MapPin, Calendar, CheckCircle2, Bell } from 'lucide-react'
import { useCurrency } from '@/lib/CurrencyContext'
import { GlobeLoader } from '@/components/ui/GlobeLoader'
import { proxyImage, destinationImage } from '@/lib/imageProxy'
import { formatDate } from '@/lib/dateUtils'

export default function CustomerDashboard() {
    const [user, setUser] = useState<any>(null)
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifs, setShowNotifs] = useState(false)
    const router = useRouter()
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${API_URL}/auth/me`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (!data.user) router.push('/auth/login')
                else if (data.user.role !== 'CUSTOMER') router.push('/')
                else setUser(data.user)
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });

        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/bookings`, { credentials: 'include', cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setBookings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                setBookings([]);
            } finally {
                setTimeout(() => setLoading(false), 2500);
            }
        };

        fetchBookings();
    }, [router])

    useEffect(() => {
        if (!user || bookings.length === 0) return;
        const fetchNotifications = async () => {
            const pkgIds = [...new Set(bookings.map((b: any) => b.tourPackage?.id || b.tourPackage?._id || b.packageId))].filter(Boolean)
            const notifs: any[] = []
            for (const pid of pkgIds) {
                try {
                    const rRes = await fetch(`${API_URL}/reviews/package/${pid}`, { credentials: 'include', cache: 'no-store' })
                    if (rRes.ok) {
                        const packageReviews = await rRes.json()
                        const userId = user.id || user._id
                        packageReviews.forEach((r: any) => {
                            const rUserId = typeof r.userId === 'object' ? (r.userId._id || r.userId.id) : r.userId
                            if (rUserId === userId && r.adminResponse) {
                                notifs.push({
                                    id: r._id,
                                    message: `Admin replied to your review: "${r.adminResponse}"`
                                })
                            }
                        })
                    }
                } catch (e) {}
            }
            setNotifications(notifs)
        }
        fetchNotifications()
    }, [user, bookings])

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking? A 20% cancellation fee may apply.')) return;
        setActionLoading(true)
        try {
            const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Cancellation failed')
            alert('Booking cancelled successfully and refund initiated')
            const bRes = await fetch(`${API_URL}/bookings`, { credentials: 'include', cache: 'no-store' })
            const data = await bRes.json()
            setBookings(Array.isArray(data) ? data : [])
        } catch (err: any) {
            alert(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const submitReview = async (packageId: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ packageId, rating: reviewRating, comment: reviewComment })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit review')
            alert('Review submitted successfully!')
            setReviewingId(null)
            setReviewComment('')
            setReviewRating(5)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    if (!user || loading) return <><Navbar /><GlobeLoader /></>

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user.name}</h1>
                            <p className="text-slate-600">View and manage your upcoming journeys.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button onClick={() => setShowNotifs(!showNotifs)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 relative transition">
                                    <Bell className="w-6 h-6 text-slate-600" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                {showNotifs && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800">Notifications ({notifications.length})</div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition">
                                                        <p className="text-sm font-medium text-slate-800">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl"><Calendar className="w-6 h-6 text-blue-600" /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Trips</p>
                                    <p className="text-xl font-bold text-slate-900">{bookings.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mt-4">Your Booking History</h2>

                    {bookings.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookings yet</h3>
                                <p className="text-slate-500 mb-6">Explore our amazing tour packages and start your adventure.</p>
                                <button onClick={() => router.push('/tours')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition hover-lift">
                                    Browse Tours
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.map(booking => (
                                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-64 h-48 md:h-auto bg-slate-200">
                                            {booking.tourPackage?.imageUrl ? (
                                                <img 
                                                    src={proxyImage(booking.tourPackage.imageUrl) || undefined} 
                                                    alt={booking.tourPackage.title} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        const dest = booking.tourPackage?.destination || 'travel';
                                                        const id = booking.tourPackage?.id || booking.tourPackage?._id || 'fallback';
                                                        if (target.src !== destinationImage(dest, id)) {
                                                            target.src = destinationImage(dest, id);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-slate-400">No Image</div>
                                            )}
                                        </div>

                                        <CardContent className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                                        <MapPin className="w-4 h-4" />
                                                        {booking.tourPackage?.destination || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {booking.status}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-2xl mb-1">{booking.tourPackage?.title || 'Unknown Package'}</CardTitle>
                                                <p className="text-slate-500 text-sm mb-4">By {booking.tourPackage?.company?.companyName || 'Unknown Agency'}</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Participants</p>
                                                    <p className="font-semibold text-slate-900">{booking.participants}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Date Booked</p>
                                                    <p className="font-semibold text-slate-900">{formatDate(booking.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                                                    <p className="font-semibold text-blue-600 flex items-center">{format(booking.totalAmount, booking.tourPackage?.currency || 'USD')}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 justify-end mt-6 border-t border-slate-100 pt-4">
                                                {booking.status === 'CONFIRMED' && (
                                                    <>
                                                        <button onClick={() => window.open(`/voucher/${booking.id}`, '_blank')} className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">Download Voucher</button>
                                                        <button onClick={() => setReviewingId(booking.tourPackage?.id)} className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Leave Review</button>
                                                        <button onClick={() => handleCancel(booking.id)} disabled={actionLoading} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50">Cancel Booking</button>
                                                    </>
                                                )}
                                            </div>

                                            {reviewingId === booking.tourPackage?.id && (
                                                <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <h4 className="font-semibold text-slate-900 mb-2">Write a Review</h4>
                                                    <div className="flex gap-2 mb-3 text-2xl cursor-pointer">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button key={star} onClick={() => setReviewRating(star)} className={`${star <= reviewRating ? 'text-amber-500' : 'text-slate-300'}`}>★</button>
                                                        ))}
                                                    </div>
                                                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." className="w-full p-3 border border-slate-200 rounded-lg mb-3 outline-none focus:border-emerald-500 text-slate-800" rows={3}></textarea>
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setReviewingId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                                                        <button onClick={() => submitReview(booking.tourPackage.id)} disabled={actionLoading || !reviewComment} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50">Submit</button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}
