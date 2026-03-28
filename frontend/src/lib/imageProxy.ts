import { API_URL } from '@/config/api';

/**
 * Proxies any direct image URL (ending in .jpg, .png, etc.) through images.weserv.nl
 * to bypass CORS. Returns null for non-image URLs (webpages).
 */
export function proxyImage(url: string | null | undefined): string | null {
    if (!url || !url.trim()) return null
    const trimmed = url.trim()

    // 1. Handle our own uploaded images (/uploads/ pattern)
    // If the URL contains '/uploads/', it's a file from our backend.
    // We should ensure it uses the CURRENT API domain to be portable between environments.
    if (trimmed.includes('/uploads/')) {
        const filename = trimmed.split('/').pop();
        const backendBase = API_URL.replace(/\/api$/, '');
        return `${backendBase}/uploads/${filename}`;
    }

    // 2. Return directly for 'safe' hosts that don't need proxying
    if (
        trimmed.startsWith('/') || 
        trimmed.includes('weserv.nl') || 
        trimmed.includes('localhost') || 
        trimmed.includes('127.0.0.1') ||
        trimmed.includes('[::1]') ||
        trimmed.includes('onrender.com') 
    ) return trimmed;

    // 3. Only proxy actual image file URLs or known image CDNs
    const imageExtensions = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i
    const imageCdns = /(googleusercontent|gstatic|unsplash|cloudinary|imgur|twimg|fbcdn|staticflickr|wp\.com|cdninstagram)/i

    if (!imageExtensions.test(trimmed) && !imageCdns.test(trimmed)) {
        // Not a direct image URL (probably a webpage link) - skip proxy
        return null
    }

    const stripped = trimmed.replace(/^https?:\/\//, '')
    return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&w=800&output=webp&we`
}

/**
 * Returns a beautiful Unsplash travel photo for a given destination.
 * Used as fallback when no image URL is provided or when image fails to load.
 */
export function destinationImage(destination: string | undefined, seed?: string): string {
    const travelPhotos = [
        'photo-1476514525535-07fb3b4ae5f1', // Switzerland
        'photo-1512453979798-5ea266f8880c', // Dubai
        'photo-1506929562872-bb421503ef21', // Maldives
        'photo-1570077188670-e3a8d69ac5ff', // Santorini
        'photo-1524492412937-b28074a5d7da', // Taj Mahal
        'photo-1493976040374-85c8e12f0c0e', // Kyoto
        'photo-1460627390041-532a28402358', // Cinque Terre
        'photo-1552832230-c0197dd311b5'  // Rome
    ]
    
    // Deterministic selection based on seed or destination
    const key = (seed || destination || 'travel').toLowerCase()
    let hash = 0
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % travelPhotos.length
    const photoId = travelPhotos[index]
    
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=70&w=800`
}

