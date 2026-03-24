'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCurrency } from '@/lib/CurrencyContext'
import { API_URL } from '@/config/api'
import { proxyImage } from '@/lib/imageProxy'
import { formatDate } from '@/lib/dateUtils'

export default function VoucherPage() {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    const [booking, setBooking] = useState<any>(null)
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${API_URL}/bookings/status/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.details) {
                    setBooking(data.details)
                    // Auto open print dialog slightly after load
                    setTimeout(() => window.print(), 500)
                }
            })
            .catch(err => console.error(err))
    }, [id])

    if (!booking) return <div className="p-10 text-center text-slate-600 font-medium">Loading your voucher...</div>

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white text-black font-sans print:shadow-none shadow-xl my-10 border border-slate-200">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">E-VOUCHER</h1>
                    <p className="text-slate-500 mt-2 font-medium">Official Booking Confirmation</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold bg-slate-100 px-3 py-1 rounded inline-block">ID: {booking._id}</p>
                    <p className="text-slate-500 text-sm mt-2">Issued: {formatDate(new Date())}</p>
                </div>
            </div>

            <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row gap-6 items-start">
                {booking.packageId?.imageUrl && (
                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={proxyImage(booking.packageId.imageUrl) || undefined} alt="Tour" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">{booking.packageId?.title || 'Tour Package'}</h2>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                        <p className="text-slate-500">Destination</p>
                        <p className="font-semibold text-lg text-slate-900">{booking.packageId?.destination || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Tour Date</p>
                        <p className="font-semibold text-lg text-slate-900">{booking.bookingDate || 'Open Date'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="font-semibold text-lg text-slate-900">{booking.packageId?.duration || 0} Days</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Participants</p>
                        <p className="font-semibold text-lg text-slate-900">{booking.participants} Guests</p>
                    </div>
                </div>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mb-10">
                <div className="bg-slate-800 text-white px-6 py-3 font-semibold">
                    Payment Details
                </div>
                <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-4 text-slate-700">
                        <span className="text-slate-600">Status</span>
                        <span className="font-bold text-emerald-600 uppercase tracking-wider">{booking.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl text-slate-900">
                        <span className="font-bold">Total Paid</span>
                        <span className="font-black">{format(booking.totalAmount, booking.packageId?.currency || 'USD')}</span>
                    </div>
                </div>
            </div>

            <div className="text-sm text-slate-500 text-center border-t border-slate-200 pt-8 mt-16 print:mt-32">
                <p>Please present this e-voucher (digital or printed) to your tour guide upon arrival.</p>
                <p className="mt-2">Thank you for choosing our platform!</p>
            </div>
            
            <div className="mt-8 text-center print:hidden">
                <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition lg:mb-0 mb-8">Print Voucher</button>
            </div>
        </div>
    )
}
