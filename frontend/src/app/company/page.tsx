'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { API_URL } from '@/config/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Package, Calendar, Users, Briefcase, Pencil, Trash2, MapPin, Clock, User, Shield, Mail } from 'lucide-react'
import { GlobeLoader } from '@/components/ui/GlobeLoader'
import { useCurrency } from '@/lib/CurrencyContext'
import { proxyImage, destinationImage } from '@/lib/imageProxy'
import { formatDate } from '@/lib/dateUtils'

export default function CompanyDashboard() {
    const [user, setUser] = useState<any>(null)
    const [packages, setPackages] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'packages' | 'bookings' | 'profile'>('packages')
    const router = useRouter()
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${API_URL}/auth/me`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (!data.user) router.push('/auth/login')
                else if (data.user.role !== 'COMPANY') router.push('/')
                else setUser(data.user)
            })
    }, [router])

    useEffect(() => {
        if (!user) return
        const companyProfileId = user.companyProfile?._id || user.companyProfile?.id
        if (!companyProfileId) return
        fetchData(companyProfileId)
    }, [user])

    const fetchData = async (companyProfileId: string) => {
        setLoading(true)
        try {
            const [pkgRes, bkRes] = await Promise.all([
                fetch(`${API_URL}/packages?companyId=${companyProfileId}`, { credentials: 'include', cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } }),
                fetch(`${API_URL}/bookings`, { credentials: 'include', cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } })
            ])
            const pkgs = await pkgRes.json()
            const bks = await bkRes.json()
            setPackages(Array.isArray(pkgs) ? pkgs : [])
            setBookings(Array.isArray(bks) ? bks : [])
        } finally {
            setTimeout(() => setLoading(false), 2500)
        }
    }

    const handleDelete = async (pkgId: string) => {
        if (!confirm('Are you sure you want to delete this package? This cannot be undone.')) return
        setDeletingId(pkgId)
        try {
            const res = await fetch(`${API_URL}/packages/${pkgId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (res.ok) {
                setPackages(prev => prev.filter(p => (p._id || p.id) !== pkgId))
            } else {
                alert('Failed to delete package.')
            }
        } finally {
            setDeletingId(null)
        }
    }

    const myPackages = packages

    if (!user || loading) return <><Navbar /><GlobeLoader /></>

    const approvedCount = myPackages.filter(p => p.approvalStatus === 'APPROVED').length
    const pendingCount = myPackages.filter(p => p.approvalStatus === 'PENDING').length

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Company Dashboard</h1>
                            <p className="text-slate-500 font-medium">{user.companyProfile?.companyName} · Manage your tour packages</p>
                        </div>
                        <Button onClick={() => router.push('/company/packages/new')} className="w-full md:w-auto">
                            <Plus className="w-5 h-5 mr-2" /> Add New Package
                        </Button>
                    </div>

                    {/* Alerts */}
                    {user.companyProfile?.approvalStatus === 'REJECTED' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
                            <span className="text-xl font-bold">⚠️</span>
                            <div>
                                <p className="font-bold">Your Agency Application Was Rejected</p>
                                <p className="text-sm">The administrator has rejected your company profile. Please contact support to resolve any issues.</p>
                            </div>
                        </div>
                    )}

                    {myPackages.filter(p => p.approvalStatus === 'REJECTED').length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
                            <span className="text-xl font-bold">⚠️</span>
                            <div>
                                <p className="font-bold">Attention Required: Rejected Packages</p>
                                <p className="text-sm">You have {myPackages.filter(p => p.approvalStatus === 'REJECTED').length} package(s) that were rejected by the administrator. Please review and edit them to comply with our guidelines.</p>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-4 border-b border-slate-200 mb-8">
                        <button 
                            onClick={() => setActiveTab('packages')}
                            className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'packages' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Package className="w-4 h-4" /> My Packages ({myPackages.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('bookings')}
                            className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Calendar className="w-4 h-4" /> Bookings ({bookings.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <User className="w-4 h-4" /> Business Profile
                        </button>
                    </div>

                    {activeTab === 'profile' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <Card className="max-w-3xl overflow-hidden">
                                <CardHeader className="bg-slate-900 text-white p-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                            <Briefcase className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-white">{user.companyProfile?.companyName}</CardTitle>
                                            <p className="text-slate-400 font-medium">Verified Tour Agency</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${user.companyProfile?.approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                                {user.companyProfile?.approvalStatus}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Representative Name</p>
                                            <p className="text-lg font-bold text-slate-900">{user.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Business Email</p>
                                            <p className="text-lg font-bold text-slate-900">{user.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Member Since</p>
                                            <p className="text-lg font-bold text-slate-900">{formatDate(user.createdAt)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Shield className="w-3 h-3" /> Application Status</p>
                                            <p className="text-lg font-bold text-blue-600">{user.companyProfile?.approvalStatus}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8 border-t border-slate-100 italic text-slate-400 text-sm">
                                        To update your company information, please contact the administrator support.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <Card className="bg-blue-600 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-20"><Package className="w-28 h-28 -mr-6 -mt-6" /></div>
                            <CardContent className="relative z-10 p-5">
                                <p className="text-blue-50 text-sm font-semibold uppercase tracking-wider">Total Packages</p>
                                <p className="text-4xl font-black mt-2">{myPackages.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-600 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-20"><Calendar className="w-28 h-28 -mr-6 -mt-6" /></div>
                            <CardContent className="relative z-10 p-5">
                                <p className="text-emerald-50 text-sm font-semibold uppercase tracking-wider">Total Bookings</p>
                                <p className="text-4xl font-black mt-2">{bookings.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-500 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-20"><Briefcase className="w-28 h-28 -mr-6 -mt-6" /></div>
                            <CardContent className="relative z-10 p-5">
                                <p className="text-orange-50 text-sm font-semibold uppercase tracking-wider">Approved</p>
                                <p className="text-4xl font-black mt-2">{approvedCount}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-indigo-600 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-20"><Users className="w-28 h-28 -mr-6 -mt-6" /></div>
                            <CardContent className="relative z-10 p-5">
                                <p className="text-indigo-50 text-sm font-semibold uppercase tracking-wider">Total Passengers</p>
                                <p className="text-4xl font-black mt-2">{bookings.reduce((sum, b) => sum + (Number(b.participants) || 0), 0)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 bg-white border border-slate-200 p-1 rounded-xl w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab('packages')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'packages' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Briefcase className="w-4 h-4 inline mr-2" />My Packages ({myPackages.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />Bookings ({bookings.length})
                        </button>
                    </div>

                    {/* Packages Tab */}
                    {activeTab === 'packages' && (
                        <div>
                            {myPackages.length === 0 ? (
                                <Card className="p-12 text-center border-dashed border-2">
                                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-600 font-semibold text-lg mb-2">No packages yet</p>
                                    <p className="text-slate-400 text-sm mb-6">Start by adding your first tour package. It will be reviewed by our admin team.</p>
                                    <Button onClick={() => router.push('/company/packages/new')}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Your First Package
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {myPackages.map(pkg => {
                                        const pkgId = pkg._id || pkg.id
                                        return (
                                            <Card key={pkgId} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="flex flex-col sm:flex-row gap-0">
                                                        {/* Image */}
                                                        <div className="w-full sm:w-36 h-48 sm:h-full bg-slate-200 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden flex-shrink-0">
                                                            {pkg.imageUrl
                                                                ? <img 
                                                                    src={proxyImage(pkg.imageUrl) || undefined} 
                                                                    className="w-full h-full object-cover" 
                                                                    alt={pkg.title} 
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        if (target.src !== destinationImage(pkg.destination, pkgId)) {
                                                                            target.src = destinationImage(pkg.destination, pkgId);
                                                                        }
                                                                    }}
                                                                  />
                                                                : <div className="w-full h-full flex items-center justify-center"><MapPin className="w-8 h-8 text-slate-400" /></div>
                                                            }
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <h3 className="font-bold text-slate-900 line-clamp-1 text-base">{pkg.title}</h3>
                                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide flex-shrink-0
                                                                        ${pkg.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                                            pkg.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {pkg.approvalStatus}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                                                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pkg.destination}</span>
                                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.duration}D</span>
                                                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{pkg.slots} slots</span>
                                                                </div>
                                                                <p className="font-bold text-blue-600">{format(pkg.price, pkg.currency)}<span className="text-slate-400 font-normal text-xs"> /person</span></p>
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => router.push(`/company/packages/${pkgId}/edit`)}
                                                                    className="flex-1 text-xs"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(pkgId)}
                                                                    isLoading={deletingId === pkgId}
                                                                    className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div>
                            {bookings.length === 0 ? (
                                <Card className="p-12 text-center border-dashed border-2">
                                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium">No bookings received yet.</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {bookings.map(booking => (
                                        <Card key={booking.id || booking._id} className="hover:shadow-md transition">
                                            <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 mb-1">{booking.tourPackage?.title || 'Unknown Package'}</h3>
                                                    <p className="text-sm font-medium text-slate-500 flex flex-wrap items-center gap-2">
                                                        <Users className="w-4 h-4" /> {booking.user?.name || 'Unknown'} · {booking.user?.email || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">{formatDate(booking.createdAt)}</p>
                                                </div>
                                                <div className="text-right flex flex-col justify-between flex-shrink-0">
                                                    <div className="font-bold text-blue-600 text-lg">{format(booking.totalAmount, booking.tourPackage?.currency || 'USD')}</div>
                                                    <div className="text-sm text-slate-500 font-medium">{booking.participants} Passenger{booking.participants > 1 ? 's' : ''}</div>
                                                    <span className="inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 uppercase">{booking.status}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                        </>
                    )}
                </div>
            </div>
        </>
    )
}
