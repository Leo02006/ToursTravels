'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CURRENCIES, convertCurrency, formatPrice, getCurrencySymbol } from './currencies'

interface CurrencyContextType {
    currency: string
    setCurrency: (currency: string) => void
    convert: (amount: number, fromCurrency: string) => number
    format: (amount: number, fromCurrency: string) => string
    symbol: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState('USD')

    useEffect(() => {
        const saved = localStorage.getItem('preferred_currency')
        if (saved && CURRENCIES.find(c => c.code === saved)) {
            setCurrencyState(saved)
        }
    }, [])

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency)
        localStorage.setItem('preferred_currency', newCurrency)
    }

    const convert = (amount: number, fromCurrency: string = 'USD') => {
        return convertCurrency(amount, fromCurrency, currency)
    }

    const format = (amount: number, fromCurrency: string = 'USD') => {
        return formatPrice(amount, fromCurrency, currency)
    }

    const symbol = getCurrencySymbol(currency)

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, symbol }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}
