import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

interface CurrencyContextType {
    currencyCode: string;
    currencySymbol: string;
    format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [currencyCode, setCurrencyCode] = useState<string>('INR');

    useEffect(() => {
        if (user?.currency) {
            setCurrencyCode(user.currency);
        }
    }, [user?.currency]);

    const format = (amount: number) => formatCurrency(amount, currencyCode);
    const currencySymbol = getCurrencySymbol(currencyCode);

    return (
        <CurrencyContext.Provider value={{ currencyCode, currencySymbol, format }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
