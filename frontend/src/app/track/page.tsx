'use client'
import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { API_URL } from '@/config/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Search } from 'lucide-react'
import { useCurrency } from '@/lib/CurrencyContext'
import { formatDate } from '@/lib/dateUtils'

export default function TrackBookingPage() {
    const [bookingId, setBookingId] = useState('')
    const [booking, setBooking] = useState<any>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { format } = useCurrency()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookingId) return
        setLoading(true)
        setError('')
        setBooking(null)
        try {
            const res = await fetch(`${API_URL}/bookings/status/${bookingId.trim()}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Booking not found')
            setBooking(data.details)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Track Your Journey</h1>
                        <p className="text-slate-600">Enter your Booking ID to view real-time status and details.</p>
                    </div>

                    <Card className="mb-8 p-2 shadow-lg border-blue-100 bg-white">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 flex items-center pl-4 bg-white rounded-xl">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Enter Booking ID" className="w-full py-4 px-3 outline-none text-slate-800" value={bookingId} onChange={e => setBookingId(e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 font-medium rounded-xl hover:bg-blue-700 transition flex-shrink-0">
                                {loading ? 'Searching...' : 'Track'}
                            </button>
                        </form>
                    </Card>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-center rounded-xl font-medium border border-red-100 shadow-sm">
                            {error}
                        </div>
                    )}

                    {booking && (
                        <Card className="overflow-hidden border-2 border-slate-100 shadow-xl bg-white">
                            <div className="bg-blue-600 p-6 text-white text-center">
                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Booking Status</p>
                                <h2 className="text-3xl font-bold">{booking.status}</h2>
                            </div>
                            <CardContent className="p-8">
                                <div className="space-y-4 text-slate-700">
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">Booking ID</span>
                                        <span className="font-mono text-slate-900">{booking._id}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">Tour Package</span>
                                        <span className="font-semibold text-slate-900">{booking.packageId?.title || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">Participants</span>
                                        <span className="font-medium text-slate-900">{booking.participants} Guests</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">Booking Date</span>
                                        <span className="font-medium text-slate-900">{booking.bookingDate ? formatDate(booking.bookingDate) : 'Open Date'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">Total Amount</span>
                                        <span className="font-bold text-blue-600">{format(booking.totalAmount, booking.packageId?.currency || 'USD')}</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-slate-500">Payment Status</span>
                                        <span className="font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm uppercase">{booking.paymentStatus}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    )
}
