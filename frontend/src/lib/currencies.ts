// Fixed exchange rates relative to USD for MVP purposes
export const EXCHANGE_RATES: Record<string, number> = {
    'USD': 1,
    'INR': 83.5, // 1 USD = 83.5 INR
    'EUR': 0.92, // 1 USD = 0.92 EUR
    'GBP': 0.79, // 1 USD = 0.79 GBP
}

export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
]

export const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$'
}

/**
 * Converts a price from a base currency to a target currency.
 */
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount

    // Convert to USD first
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1
    const amountInUSD = amount / fromRate

    // Convert from USD to Target
    const toRate = EXCHANGE_RATES[toCurrency] || 1
    const finalAmount = amountInUSD * toRate

    return Number(finalAmount.toFixed(2))
}

/**
 * Formats a given amount with the target currency symbol, converting it if necessary.
 */
export const formatPrice = (amount: number, fromCurrency: string, toCurrency: string) => {
    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency)
    const symbol = getCurrencySymbol(toCurrency)

    return `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
