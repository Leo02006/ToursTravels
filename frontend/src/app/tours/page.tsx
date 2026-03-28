'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { MapPin, Clock, ArrowRight, Search, X } from 'lucide-react'
import { proxyImage, destinationImage } from '@/lib/imageProxy'
import { useCurrency } from '@/lib/CurrencyContext'
import { API_URL } from '@/config/api'

type Tour = {
    _id?: string
    id?: string
    title: string
    destination: string
    duration: number
    price: number
    currency?: string
    imageUrl?: string | null
    company?: { companyName: string }
}

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [appliedQuery, setAppliedQuery] = useState('')
    const [filterDest, setFilterDest] = useState('')
    const [filterCompany, setFilterCompany] = useState('')
    const [filterTheme, setFilterTheme] = useState('')
    const [filterPrice, setFilterPrice] = useState('')
    const [filterDuration, setFilterDuration] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { format } = useCurrency()

    useEffect(() => {
        fetch(`${API_URL}/packages`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setTours(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setTimeout(() => setLoading(false), 2500))
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Suggestions: match as user types
    const suggestions = searchQuery.trim().length > 0
        ? tours.filter(tour => {
            const q = searchQuery.toLowerCase()
            return (
                tour.title?.toLowerCase().includes(q) ||
                tour.destination?.toLowerCase().includes(q) ||
                tour.company?.companyName?.toLowerCase().includes(q)
            )
        }).slice(0, 6)
        : []

    const handleSearch = () => {
        setAppliedQuery(searchQuery)
        setShowDropdown(false)
        inputRef.current?.blur()
    }

    const clearSearch = () => {
        setSearchQuery('')
        setAppliedQuery('')
        setShowDropdown(false)
    }

    const selectSuggestion = (tour: Tour) => {
        const tourId = String(tour._id || tour.id || '')
        setShowDropdown(false)
        router.push(`/tours/${tourId}`)
    }

    const filteredTours = tours.filter(tour => {
        let match = true
        if (appliedQuery) {
            const q = appliedQuery.toLowerCase()
            match = !!(
                tour.title?.toLowerCase().includes(q) ||
                tour.destination?.toLowerCase().includes(q) ||
                tour.company?.companyName?.toLowerCase().includes(q)
            )
        }
        if (match && filterDest && tour.destination !== filterDest) match = false
        if (match && filterCompany && tour.company?.companyName !== filterCompany) match = false
        if (match && filterTheme && (tour as any).theme !== filterTheme) match = false
        
        if (match && filterPrice) {
            if (filterPrice === 'low' && tour.price > 500) match = false
            if (filterPrice === 'med' && (tour.price <= 500 || tour.price > 2000)) match = false
            if (filterPrice === 'high' && tour.price <= 2000) match = false
        }

        if (match && filterDuration) {
            if (filterDuration === 'short' && tour.duration > 3) match = false
            if (filterDuration === 'med' && (tour.duration <= 3 || tour.duration > 7)) match = false
            if (filterDuration === 'long' && tour.duration <= 7) match = false
        }

        return match
    })

    const uniqueDestinations = Array.from(new Set(tours.map(t => t.destination))).filter(Boolean)
    const uniqueCompanies = Array.from(new Set(tours.map(t => t.company?.companyName))).filter(Boolean)
    const uniqueThemes = Array.from(new Set(tours.map(t => (t as any).theme))).filter(Boolean)

    return (
        <>
            <Navbar />
            <div className="bg-slate-50 min-h-[calc(100vh-4rem)] pb-20">
                <div className="bg-blue-600 pt-32 pb-32 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Discover Your Next Adventure</h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">Browse our curated collection of approved tour packages from trusted travel agencies worldwide.</p>

                        {/* Search Bar with Autocomplete */}
                        <div className="max-w-3xl mx-auto relative px-4 sm:px-0">
                            <div className="bg-white rounded-2xl p-2 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="flex-1 flex items-center pl-4 border-b sm:border-b-0 border-slate-100 sm:border-none">
                                    <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search destinations, tours, or agencies..."
                                        className="w-full py-4 sm:py-3 outline-none text-slate-700 bg-transparent text-sm sm:text-base"
                                        value={searchQuery}
                                        onChange={e => {
                                            setSearchQuery(e.target.value)
                                            setShowDropdown(true)
                                            if (!e.target.value) setAppliedQuery('')
                                        }}
                                        onFocus={() => searchQuery && setShowDropdown(true)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleSearch()
                                            if (e.key === 'Escape') setShowDropdown(false)
                                        }}
                                    />
                                    {searchQuery && (
                                        <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 p-2 transition mr-2">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-600 text-white px-8 py-3.5 sm:py-3 rounded-xl font-bold hover:bg-blue-700 transition flex-shrink-0 active:scale-95"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showDropdown && suggestions.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left"
                                >
                                    {suggestions.map(tour => {
                                        const tourId = String(tour._id || tour.id || '')
                                        const imageUrl = proxyImage(tour.imageUrl)
                                        return (
                                            <button
                                                key={tourId}
                                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors group"
                                                onClick={() => selectSuggestion(tour)}
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                    {imageUrl
                                                        ? <img src={imageUrl} alt={tour.title} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><MapPin className="w-5 h-5 text-slate-300" /></div>
                                                    }
                                                </div>
                                                {/* Text */}
                                                <div className="flex-1 text-left">
                                                    <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">{tour.title}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {tour.destination} · By {tour.company?.companyName}
                                                    </p>
                                                </div>
                                                {/* Price */}
                                                <span className="text-sm font-bold text-blue-600 flex-shrink-0">{format(tour.price, tour.currency || 'USD')}</span>
                                            </button>
                                        )
                                    })}
                                    {/* Search all results option */}
                                    <button
                                        onClick={handleSearch}
                                        className="w-full px-4 py-3 text-sm text-blue-600 font-semibold hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                        Search all results for "{searchQuery}"
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="max-w-5xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3 px-2">
                            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                                <select value={filterDest} onChange={e => setFilterDest(e.target.value)} className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:bg-blue-700/80 text-sm grow sm:grow-0 backdrop-blur-md">
                                    <option value="" className="text-slate-800">All Destinations</option>
                                    {uniqueDestinations.map(d => <option key={d} value={d} className="text-slate-800">{d}</option>)}
                                </select>
                                
                                <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:bg-blue-700/80 text-sm grow sm:grow-0 backdrop-blur-md">
                                    <option value="" className="text-slate-800">All Companies</option>
                                    {uniqueCompanies.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                                </select>
                                
                                <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)} className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:bg-blue-700/80 text-sm grow sm:grow-0 backdrop-blur-md">
                                    <option value="" className="text-slate-800">Themes</option>
                                    {uniqueThemes.map(t => <option key={String(t)} value={String(t)} className="text-slate-800">{String(t)}</option>)}
                                </select>

                                <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:bg-blue-700/80 text-sm grow sm:grow-0 backdrop-blur-md">
                                    <option value="" className="text-slate-800">Price</option>
                                    <option value="low" className="text-slate-800">Budget (&lt; 500)</option>
                                    <option value="med" className="text-slate-800">Standard (500-2k)</option>
                                    <option value="high" className="text-slate-800">Luxury (2k+)</option>
                                </select>

                                <select value={filterDuration} onChange={e => setFilterDuration(e.target.value)} className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:bg-blue-700/80 text-sm grow sm:grow-0 backdrop-blur-md">
                                    <option value="" className="text-slate-800">Duration</option>
                                    <option value="short" className="text-slate-800">1-3 Days</option>
                                    <option value="med" className="text-slate-800">4-7 Days</option>
                                    <option value="long" className="text-slate-800">8+ Days</option>
                                </select>
                            </div>
                        </div>

                        {(appliedQuery || filterDest || filterCompany || filterTheme || filterPrice || filterDuration) && (
                            <p className="text-blue-100 text-sm mt-4">
                                Showing {filteredTours.length} result{filteredTours.length !== 1 ? 's' : ''} for <span className="font-semibold">"{appliedQuery}"</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16">
                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredTours.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                {appliedQuery ? `No tours found for "${appliedQuery}"` : 'No tours available'}
                            </h3>
                            <p className="text-slate-500">
                                {appliedQuery ? 'Try a different search term.' : 'Check back later for exciting new packages.'}
                            </p>
                            {appliedQuery && (
                                <button onClick={clearSearch} className="mt-4 text-blue-600 font-medium hover:underline">
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTours.map(tour => {
                                const tourId = String(tour._id || tour.id || '')
                                const imageUrl = proxyImage(tour.imageUrl) || destinationImage(tour.destination, tourId)
                                return (
                                    <Card key={tourId} className="group hover-lift overflow-hidden bg-white/50 backdrop-blur-sm border-slate-200">
                                        <div className="h-64 relative overflow-hidden bg-slate-200">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={tour.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={e => { 
                                                        const target = e.target as HTMLImageElement;
                                                        if (target.src !== destinationImage(tour.destination, tourId)) {
                                                            target.src = destinationImage(tour.destination, tourId);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-slate-400">No Image</div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-md">
                                                {format(tour.price, tour.currency || 'USD')} <span className="text-slate-500 font-normal">/person</span>
                                            </div>
                                        </div>

                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-3">
                                                <MapPin className="w-4 h-4" />
                                                {tour.destination}
                                            </div>
                                            <CardTitle className="mb-4 line-clamp-2">{tour.title}</CardTitle>
                                            <p className="text-sm text-slate-500 mb-4 font-medium">By {tour.company?.companyName}</p>

                                            <div className="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    {tour.duration} Days
                                                </div>
                                                <Link href={`/tours/${tourId}`} className="text-blue-600 font-medium hover:text-blue-700 transition flex items-center gap-1">
                                                    Book Now <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
