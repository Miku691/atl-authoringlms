export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'AED';

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    locale: string;
}

export const CURRENCIES = [
    { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { code: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
];

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
    INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
};

export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
    const config = CURRENCY_CONFIGS[currencyCode as CurrencyCode] || CURRENCY_CONFIGS.INR;
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 2,
    }).format(amount);
};

export const getCurrencySymbol = (currencyCode: string = 'INR'): string => {
    const config = CURRENCY_CONFIGS[currencyCode as CurrencyCode] || CURRENCY_CONFIGS.INR;
    return config.symbol;
};
