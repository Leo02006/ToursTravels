import React from 'react'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const hasCustomBg = className.includes('bg-')
    return (
        <div className={`${!hasCustomBg ? 'bg-white/80' : ''} backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/40 border border-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 py-5 border-b border-slate-100 ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={`text-xl font-semibold text-slate-900 ${className}`} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 ${className}`} {...props}>
            {children}
        </div>
    )
}
