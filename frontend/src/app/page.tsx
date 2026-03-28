'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { API_URL } from '@/config/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { MapPin, Calendar, Clock, ArrowRight, PlaneTakeoff } from 'lucide-react'
import { useCurrency } from '@/lib/CurrencyContext'
import { proxyImage, destinationImage } from '@/lib/imageProxy'

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

export default function Home() {
  const { format } = useCurrency()
  const [tours, setTours] = useState<Tour[]>([])

  useEffect(() => {
    fetch(`${API_URL}/packages`, { credentials: 'include', cache: 'no-store', headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Filter to only show packages strictly added by a company (skip any test packages without one)
          const validCompanyPackages = data.filter((pkg: any) => pkg.company && pkg.company.companyName)
          setTours(validCompanyPackages.slice(0, 6)) // Show max 6 in featured section
        }
      })
      .catch(() => { }) // Silently fallback to empty (no mock data)
      .finally(() => { })
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-slate-900">
        
        {/* Animated Background Collage / Montage (Simplified Transforms) */}
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden flex gap-4 md:gap-8 pointer-events-none marquee-wrapper-vertical px-4">
           
            {/* Column 1 - Travels Up: Taj Mahal, Colosseum, Machu Picchu, Burj Khalifa, Petra */}
            <div className="flex-1 flex flex-col gap-4 md:gap-8 animate-marquee-vertical">
               <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Taj Mahal" decoding="async" />
               <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Colosseum" decoding="async" />
               <img src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Machu Picchu" decoding="async" />
               <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Burj Khalifa" decoding="async" />
               <img src="https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Petra" decoding="async" />
               {/* Duplicates for Loop */}
               <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Taj Mahal" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Colosseum" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Machu Picchu" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Burj Khalifa" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Petra" decoding="async" aria-hidden="true" />
            </div>

            {/* Column 2 - Travels Down: Eiffel Tower, Great Wall, Grand Canyon, Big Ben, Christ Redemmer */}
            <div className="flex-1 flex flex-col gap-4 md:gap-8 animate-marquee-vertical-reverse mt-[-1200px]">
               <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Eiffel Tower" decoding="async" />
               <img src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Great Wall" decoding="async" />
               <img src="https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Grand Canyon" decoding="async" />
               <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Big Ben" decoding="async" />
               <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Christ The Redeemer" decoding="async" />
               {/* Duplicates for Loop */}
               <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Eiffel Tower" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Great Wall" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Grand Canyon" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Big Ben" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Christ The Redeemer" decoding="async" aria-hidden="true" />
            </div>

            {/* Column 3 - Travels Up: Statue of Liberty, Santorini, Sydney Opera, Giza Pyramids, Golden Gate */}
            <div className="flex-1 flex flex-col gap-4 md:gap-8 animate-marquee-vertical hidden md:flex">
               <img src="https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Statue of Liberty" decoding="async" />
               <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Santorini" decoding="async" />
               <img src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Sydney Opera House" decoding="async" />
               <img src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Giza Pyramids" decoding="async" />
               <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Golden Gate Bridge" decoding="async" />
               {/* Duplicates for Loop */}
               <img src="https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&q=70&w=600" className="w-full h-[500px] object-cover rounded-3xl" alt="Statue of Liberty" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=70&w=600" className="w-full h-[600px] object-cover rounded-3xl" alt="Santorini" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=70&w=600" className="w-full h-[400px] object-cover rounded-3xl" alt="Sydney Opera House" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=70&w=600" className="w-full h-[550px] object-cover rounded-3xl" alt="Giza Pyramids" decoding="async" aria-hidden="true" />
               <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=70&w=600" className="w-full h-[450px] object-cover rounded-3xl" alt="Golden Gate Bridge" decoding="async" aria-hidden="true" />
            </div>
        </div>

        {/* Cinematic Glowing Orbs (Efficient Gradients) */}
        <div className="glow-orb glow-orb-1 top-[-100px] left-[-100px]" />
        <div className="glow-orb glow-orb-2 bottom-[-100px] right-[-100px]" />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-in slide-in-from-bottom flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white text-sm font-medium mb-6 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-white/20 transition duration-300">
            <span className="animate-pulse">✨</span> Trusted by 1000+ Customers Worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-6 leading-tight drop-shadow-lg">
            Explore The World With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              Confidence
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Expertly curated tour packages, breathtaking destinations, and seamless booking for your perfect vacation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <Link href="/tours">
              <Button size="lg" className="shadow-2xl">
                Explore Destinations <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Soft bottom gradient */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />
      </section>

      {/* Featured Tours - pulls from live approved packages */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-2">Popular Destinations</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900">Featured Tour Packages</h3>
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-lg">
            No approved packages yet. Check back soon!
          </div>
        ) : (
          // Marquee: duplicate cards so the loop is seamless
          <div className="marquee-wrapper -mx-4 md:-mx-8 px-0">
            <div className="marquee-track gap-6 py-4">
              {/* First set */}
              {[...tours, ...tours].map((tour, index) => {
                const tourId = String(tour._id || tour.id || '')
                const imageUrl = proxyImage(tour.imageUrl) || destinationImage(tour.destination, tourId)
                return (
                  <Link
                    key={`${tourId}-${index}`}
                    href={`/tours/${tourId}`}
                    className="flex-shrink-0 w-72 mx-3 block"
                  >
                    <Card className="group hover-lift overflow-hidden bg-white border-slate-200 transition-shadow duration-300">
                      <div className="h-48 relative overflow-hidden">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={tour.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading={index > 3 ? "lazy" : "eager"}
                            decoding="async"
                            onError={e => { 
                              const target = e.target as HTMLImageElement;
                              if (target.src !== destinationImage(tour.destination, tourId)) {
                                target.src = destinationImage(tour.destination, tourId);
                              }
                            }}
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow">
                          {format(tour.price, tour.currency || 'USD')} <span className="text-slate-500 font-normal">/person</span>
                        </div>
                      </div>
                      <CardContent className="pt-4 pb-5">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-2">
                          <MapPin className="w-3 h-3" />
                          {tour.destination}
                        </div>
                        <CardTitle className="text-base line-clamp-1 mb-1">{tour.title}</CardTitle>
                        <div className="text-xs text-slate-500 mb-3 truncate">
                          By <span className="font-semibold text-slate-700">{tour.company?.companyName || 'Verified Partner'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tour.duration} Days
                          </div>
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                            Book Now <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Key Strengths Section */}
      <section className="bg-slate-900 text-white py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold mb-3">Customized Packages</h4>
            <p className="text-slate-400">Tailor-made itineraries crafted to meet your specific travel desires and budget constraints.</p>
          </div>
          <div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold mb-3">Expert Guidance</h4>
            <p className="text-slate-400">Navigate your journeys seamlessly with our trusted network of visa consultants and destination experts.</p>
          </div>
          <div>
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <PlaneTakeoff className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold mb-3">Global Network</h4>
            <p className="text-slate-400">Partnered with top-tier airlines, luxury hotels, and cruise liners to ensure a premium experience.</p>
          </div>
        </div>
      </section>
    </>
  )
}
