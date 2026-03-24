'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Shield, Briefcase, Calendar, Trash2, Users, MessageSquare, Download, Hash, UserCheck, AlertTriangle } from 'lucide-react'
import { GlobeLoader } from '@/components/ui/GlobeLoader'
import { useCurrency } from '@/lib/CurrencyContext'
import { proxyImage } from '@/lib/imageProxy'
import { formatDate } from '@/lib/dateUtils'

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null)
    const [pendingPackages, setPendingPackages] = useState<any[]>([])
    const [allPackages, setAllPackages] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [platformUsers, setPlatformUsers] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [currentTab, setCurrentTab] = useState<'OVERVIEW' | 'COMPANIES' | 'USERS' | 'FEEDBACK'>('OVERVIEW')
    const [loading, setLoading] = useState(true)
    const [adminMsg, setAdminMsg] = useState({ type: '', text: '' })
    const router = useRouter()
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (!data.user) router.push('/auth/login')
                else if (data.user.role !== 'ADMIN') router.push('/')
                else {
                    setUser(data.user)
                    fetchData()
                }
            })
    }, [router])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [pkgsRes, bksRes, compRes, usersRes, revRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/companies`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/reviews`, { credentials: 'include' })
            ])
            const pkgs = await pkgsRes.json()
            const bks = await bksRes.json()
            const comps = compRes.ok ? await compRes.json() : []
            const usrs = usersRes.ok ? await usersRes.json() : []
            const revs = revRes.ok ? await revRes.json() : []

            setAllPackages(pkgs)
            setPendingPackages(pkgs.filter((p: any) => p.approvalStatus === 'PENDING'))
            setBookings(bks)
            setCompanies(comps)
            setPlatformUsers(usrs)
            setReviews(revs)
        } catch (err) {
            console.error("Fetch Data Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleCompanyStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/companies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ approvalStatus: status })
            })
            if (res.ok) {
                setAdminMsg({ type: 'success', text: `Company status updated to ${status}` })
                fetchData()
            }
        } catch (err) { console.error(err) }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Permanently delete this user and all their records?')) return
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (res.ok) fetchData()
        } catch (err) { console.error(err) }
    }

    const handleReviewResponse = async (id: string, response: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ adminResponse: response })
            })
            if (res.ok) {
                setAdminMsg({ type: 'success', text: 'Response published' })
                fetchData()
            }
        } catch (err) { console.error(err) }
    }

    const generateReport = () => {
        const headers = ["Booking ID", "Customer", "Package", "Amount", "Currency", "Date"]
        const dataRows = bookings.map(b => [
            b._id || b.id,
            b.user?.name || 'N/A',
            b.tourPackage?.title || 'N/A',
            b.totalAmount,
            b.tourPackage?.currency || 'USD',
            formatDate(b.createdAt)
        ])
        
        const csvContent = [headers, ...dataRows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `tour_report_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`http://localhost:5000/api/packages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ approvalStatus: status })
            })
            if (res.ok) {
                // Refresh
                fetchData()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently remove this package?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/packages/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (res.ok) {
                fetchData()
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (!user || loading) return <><Navbar /><GlobeLoader /></>

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-screen pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-md">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Admin Console</h1>
                            <p className="text-slate-600 font-medium">Manage tour approvals and monitor system activity.</p>
                        </div>
                        <div className="sm:ml-auto w-full sm:w-auto">
                            <Button onClick={generateReport} className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download Report
                            </Button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 bg-slate-200/50 p-1 rounded-xl mb-10 w-full sm:w-fit">
                        {[
                            { id: 'OVERVIEW', label: 'Overview', icon: Shield },
                            { id: 'COMPANIES', label: 'Agencies', icon: Briefcase },
                            { id: 'USERS', label: 'Customers', icon: Users },
                            { id: 'FEEDBACK', label: 'Feedback', icon: MessageSquare }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentTab(tab.id as any)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {adminMsg.text && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${adminMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            <CheckCircle className="w-5 h-5" /> {adminMsg.text}
                            <button onClick={() => setAdminMsg({ type: '', text: '' })} className="ml-auto opacity-50 hover:opacity-100">✕</button>
                        </div>
                    )}

                    {currentTab === 'OVERVIEW' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                        <p className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Total Packages</p>
                                        <p className="text-4xl font-bold text-slate-900">{allPackages.length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-emerald-500">
                                    <CardContent className="p-6">
                                        <p className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Total Bookings</p>
                                        <p className="text-4xl font-bold text-slate-900">{bookings.length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-purple-500">
                                    <CardContent className="p-6">
                                        <p className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Agencies</p>
                                        <p className="text-4xl font-bold text-slate-900">{companies.length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardContent className="p-6">
                                        <p className="text-slate-500 font-medium mb-1 text-sm uppercase tracking-wider">Customers</p>
                                        <p className="text-4xl font-bold text-slate-900">{platformUsers.length}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {pendingPackages.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-amber-500" /> Action Required: Pending Packages
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {pendingPackages.map(pkg => (
                                            <Card key={pkg.id} className="border-amber-200 bg-amber-50/30">
                                                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                                    <div className="w-full md:w-32 h-32 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                                                        {pkg.imageUrl ? <img src={proxyImage(pkg.imageUrl) || undefined} className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{pkg.title}</h3>
                                                            <p className="text-sm text-slate-600 font-medium mb-2">Agency: {pkg.company?.companyName}</p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                                <span className="bg-white px-2 py-1 rounded-md border border-slate-200">{format(pkg.price, pkg.currency)}</span>
                                                                <span className="bg-white px-2 py-1 rounded-md border border-slate-200">{pkg.destination}</span>
                                                                <span className="bg-white px-2 py-1 rounded-md border border-slate-200">{pkg.duration} Days</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <Button size="sm" onClick={() => handleApproval(pkg.id, 'APPROVED')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                                                                <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleApproval(pkg.id, 'REJECTED')} className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-200">
                                                                <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Briefcase className="w-6 h-6 text-slate-400" /> Recent Tour Packages
                                    </h2>
                                    <Card>
                                        <div className="max-h-[500px] overflow-y-auto p-2">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-tl-lg">Title</th>
                                                        <th className="px-4 py-3">Agency</th>
                                                        <th className="px-4 py-3">Price</th>
                                                        <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allPackages.map(pkg => (
                                                        <tr key={pkg.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden">
                                                                        {pkg.imageUrl && <img src={proxyImage(pkg.imageUrl) || undefined} className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <span className="font-medium text-slate-900 truncate max-w-[150px]">{pkg.title}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-slate-600 text-xs font-semibold uppercase">{pkg.approvalStatus}</td>
                                                            <td className="px-4 py-4 font-medium text-slate-900">{format(pkg.price, pkg.currency)}</td>
                                                            <td className="px-4 py-4 text-right">
                                                                <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-slate-400" /> Recent Bookings
                                    </h2>
                                    <Card>
                                        <div className="max-h-[500px] overflow-y-auto p-2">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-tl-lg">Customer</th>
                                                        <th className="px-4 py-3">Tour</th>
                                                        <th className="px-4 py-3">Amount</th>
                                                        <th className="px-4 py-3 rounded-tr-lg text-right">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookings.slice(0, 10).map(bk => (
                                                        <tr key={bk.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                            <td className="px-4 py-4">
                                                                <div className="font-medium text-slate-900">{bk.user?.name}</div>
                                                                <div className="text-xs text-slate-500">{bk.user?.email}</div>
                                                            </td>
                                                            <td className="px-4 py-4 text-slate-600 truncate max-w-[150px]">{bk.tourPackage?.title}</td>
                                                            <td className="px-4 py-4 font-bold text-blue-600">{format(bk.totalAmount, bk.tourPackage?.currency || 'USD')}</td>
                                                            <td className="px-4 py-4 text-slate-500 text-xs text-right">{formatDate(bk.createdAt)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}

                    {currentTab === 'COMPANIES' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-blue-500" /> Agency Directory
                            </h2>
                            <Card>
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3">Company Name</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3 text-center">Joined</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companies.map(comp => (
                                                <tr key={comp._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                                    <td className="px-4 py-4 font-bold text-slate-900">{comp.companyName}</td>
                                                    <td className="px-4 py-4 text-slate-600">{comp.userId?.email}</td>
                                                    <td className="px-4 py-4 text-slate-500 text-xs text-center">{formatDate(comp.createdAt)}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${comp.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : comp.approvalStatus === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{comp.approvalStatus}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right space-x-2">
                                                        {comp.approvalStatus !== 'APPROVED' && (
                                                            <Button size="sm" onClick={() => handleCompanyStatus(comp._id, 'APPROVED')} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8"><UserCheck className="w-3.5 h-3.5 mr-1" /> Approve</Button>
                                                        )}
                                                        {comp.approvalStatus !== 'SUSPENDED' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleCompanyStatus(comp._id, 'SUSPENDED')} className="text-red-500 h-8 border-red-200 hover:bg-red-50"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Suspend</Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentTab === 'USERS' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-purple-500" /> Platform Customers
                            </h2>
                            <Card>
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Joined</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {platformUsers.map(u => (
                                                <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">{(u.name?.[0] || 'U').toUpperCase()}</div>
                                                            <span className="font-bold text-slate-900">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">{u.email}</td>
                                                    <td className="px-4 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentTab === 'FEEDBACK' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-emerald-500" /> Customer Feedback Queue
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                {reviews.map(rev => (
                                    <Card key={rev._id} className={rev.adminResponse ? 'bg-slate-50/30' : 'border-l-4 border-l-red-400'}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{rev.userId?.name} <span className="text-slate-400 font-normal ml-1">reviewed "{rev.packageId?.title}"</span></h4>
                                                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium">{formatDate(rev.createdAt)}</span>
                                            </div>
                                            <p className="text-slate-700 italic mb-6">"{rev.comment}"</p>
                                            
                                            {rev.adminResponse ? (
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <p className="text-xs font-black text-blue-600 uppercase mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Official Response</p>
                                                    <p className="text-sm text-slate-600">{rev.adminResponse}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Public Response</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            id={`resp-${rev._id}`}
                                                            placeholder="Address customer concerns..." 
                                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" 
                                                        />
                                                        <Button size="sm" onClick={() => {
                                                            const val = (document.getElementById(`resp-${rev._id}`) as HTMLInputElement).value
                                                            if (val) handleReviewResponse(rev._id, val)
                                                        }}>Publish Reply</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}
