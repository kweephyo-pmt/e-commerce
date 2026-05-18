import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DEFAULT_RATE = 130;

const CURRENCIES = {
  THB: { symbol: '฿', code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  MMK: { symbol: 'K', code: 'MMK', name: 'Myanmar Kyat', flag: '🇲🇲' },
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('preferredCurrency') || 'MMK';
  });

  const [exchangeRate, setExchangeRate] = useState(DEFAULT_RATE);

  // Listen to exchange rate from Firestore in real-time
  useEffect(() => {
    let unsub = null;
    // Lazy-import to avoid circular/init issues
    import('../config/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ doc, onSnapshot }) => {
        unsub = onSnapshot(
          doc(db, 'settings', 'currency'),
          (snap) => {
            if (snap.exists()) {
              const rate = snap.data().thbToMmk;
              if (typeof rate === 'number' && rate > 0) {
                setExchangeRate(rate);
              }
            }
          },
          (err) => console.error('Failed to load exchange rate:', err)
        );
      });
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => {
      const next = prev === 'THB' ? 'MMK' : 'THB';
      localStorage.setItem('preferredCurrency', next);
      return next;
    });
  }, []);

  const formatPrice = useCallback(
    (mmkPrice) => {
      if (mmkPrice == null) return '-';
      if (currency === 'THB') {
        const thb = mmkPrice / exchangeRate;
        return `฿${Number(thb).toFixed(2)}`;
      }
      // Default: MMK
      return `K${Math.round(mmkPrice).toLocaleString('en-US')}`;
    },
    [currency, exchangeRate]
  );

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyInfo: CURRENCIES[currency],
      currencies: CURRENCIES,
      toggleCurrency,
      formatPrice,
      exchangeRate,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
