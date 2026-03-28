'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { User as UserIcon, LogOut, LayoutDashboard, Globe, Menu, X } from 'lucide-react'
import { Button } from './ui/Button'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/lib/CurrencyContext'
import { CURRENCIES } from '@/lib/currencies'
import { API_URL } from '@/config/api'

export function Navbar() {
    const [user, setUser] = useState<{ name: string, role: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()
    const { currency, setCurrency } = useCurrency()

    useEffect(() => {
        fetch(`${API_URL}/auth/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleLogout = async () => {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
        setUser(null)
        router.push('/')
        router.refresh()
    }

    const getDashboardLink = () => {
        if (user?.role === 'ADMIN') return '/admin'
        if (user?.role === 'COMPANY') return '/company'
        return '/customer'
    }

    return (
        <>
            <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-xl z-[60] flex items-center px-4 md:px-8 border-b border-slate-200 shadow-sm transition-all duration-300">
                {/* Brand */}
                <div className="relative flex items-center isolate">
                    <Link href="/" className="text-xl md:text-2xl font-bold hover:opacity-80 transition relative z-20 flex items-center" style={{ lineHeight: '64px' }}>
                        <div className="relative inline-block w-max">
                            <span className="opacity-0 block whitespace-nowrap px-2">
                                Leo&apos;s Tours and Travels
                            </span>
                            <span className="text-gradient absolute top-0 left-0 animate-text-reveal whitespace-nowrap px-2">
                                Leo&apos;s Tours and Travels
                            </span>
                            
                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] animate-sled-slide">
                                <svg
                                    className="absolute top-1/2 left-0 -mt-[35px] -ml-[15px] w-[90px] h-[70px] drop-shadow-[0_3px_8px_rgba(59,130,246,0.5)] animate-plane-pitch text-blue-500 opacity-40"
                                    viewBox="0 0 100 80"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <defs>
                                        <linearGradient id="pg1" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#60A5FA" />
                                            <stop offset="60%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#1D4ED8" />
                                        </linearGradient>
                                        <linearGradient id="pg2" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#93C5FD" />
                                            <stop offset="100%" stopColor="#2563EB" />
                                        </linearGradient>
                                    </defs>
                                    <ellipse cx="50" cy="40" rx="48" ry="7" fill="url(#pg1)" />
                                    <path d="M58 40 L26 8 L36 37 Z" fill="url(#pg2)" opacity="0.95" />
                                    <path d="M58 40 L26 72 L36 43 Z" fill="url(#pg2)" opacity="0.95" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="ml-auto p-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Desktop Menu */}
                <div className="ml-auto hidden md:flex items-center gap-6">
                    <Link href="/" className="font-medium text-slate-700 hover:text-blue-600 transition">Home</Link>
                    <Link href="/tours" className="font-medium text-slate-700 hover:text-blue-600 transition">Tours</Link>

                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                        </select>
                    </div>

                    {!loading && (
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            {user ? (
                                <>
                                    <Link href={getDashboardLink()}>
                                        <Button variant="ghost" size="sm">
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                                        <UserIcon className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">{user.name}</span>
                                    </div>
                                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <Button variant="outline" size="sm">Login</Button>
                                    </Link>
                                    <Link href="/auth/register">
                                        <Button variant="primary" size="sm">Sign Up</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <div 
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 right-0 h-[100dvh] w-[280px] bg-white z-[80] shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-bold text-lg text-slate-900">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Home</Link>
                        <Link href="/tours" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Tours/Packages</Link>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-3 tracking-widest">Settings</p>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Currency</span>
                                </div>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-blue-600 outline-none cursor-pointer"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-3">
                        {user ? (
                            <>
                                <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role}</p>
                                        </div>
                                    </div>
                                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                </Link>
                                <button 
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="primary" className="w-full">Join</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
