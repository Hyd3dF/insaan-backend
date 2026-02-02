// Forex pairs configuration - must match insaan/src/data/forexPairs.ts
// Only active pairs will be tracked by the cron job

const FOREX_PAIRS = [
    // METALS - Only Gold is active
    { code: 'XAUUSD', name: 'Gold vs US Dollar', type: 'Metal', active: true, finnhubSymbol: 'OANDA:XAU_USD' },
    { code: 'XAGUSD', name: 'Silver vs US Dollar', type: 'Metal', active: false },

    // MAJORS
    { code: 'EURUSD', name: 'Euro vs US Dollar', type: 'Major', active: false, finnhubSymbol: 'OANDA:EUR_USD' },
    { code: 'GBPUSD', name: 'Great British Pound vs US Dollar', type: 'Major', active: false, finnhubSymbol: 'OANDA:GBP_USD' },
    { code: 'USDJPY', name: 'US Dollar vs Japanese Yen', type: 'Major', active: false, finnhubSymbol: 'OANDA:USD_JPY' },
    { code: 'USDCHF', name: 'US Dollar vs Swiss Franc', type: 'Major', active: false, finnhubSymbol: 'OANDA:USD_CHF' },
    { code: 'AUDUSD', name: 'Australian Dollar vs US Dollar', type: 'Major', active: false, finnhubSymbol: 'OANDA:AUD_USD' },
    { code: 'USDCAD', name: 'US Dollar vs Canadian Dollar', type: 'Major', active: false, finnhubSymbol: 'OANDA:USD_CAD' },
    { code: 'NZDUSD', name: 'New Zealand Dollar vs US Dollar', type: 'Major', active: false, finnhubSymbol: 'OANDA:NZD_USD' },

    // MINORS - All inactive
    { code: 'EURGBP', name: 'Euro vs Great British Pound', type: 'Minor', active: false },
    { code: 'EURJPY', name: 'Euro vs Japanese Yen', type: 'Minor', active: false },
    { code: 'GBPJPY', name: 'Great British Pound vs Japanese Yen', type: 'Minor', active: false },
    { code: 'AUDJPY', name: 'Australian Dollar vs Japanese Yen', type: 'Minor', active: false },
    { code: 'EURAUD', name: 'Euro vs Australian Dollar', type: 'Minor', active: false },
    { code: 'GBPCHF', name: 'Great British Pound vs Swiss Franc', type: 'Minor', active: false },
    { code: 'EURCHF', name: 'Euro vs Swiss Franc', type: 'Minor', active: false },

    // EXOTICS - All inactive
    { code: 'USDTRY', name: 'US Dollar vs Turkish Lira', type: 'Exotic', active: false },
    { code: 'USDZAR', name: 'US Dollar vs South African Rand', type: 'Exotic', active: false },
    { code: 'USDMXN', name: 'US Dollar vs Mexican Peso', type: 'Exotic', active: false },

    // INDICES - All inactive
    { code: 'NAS100', name: 'Nasdaq 100', type: 'Index', active: false },
    { code: 'US30', name: 'Dow Jones Industrial Average', type: 'Index', active: false },
    { code: 'SPX500', name: 'S&P 500', type: 'Index', active: false },
    { code: 'GER30', name: 'DAX 30', type: 'Index', active: false },
    { code: 'UK100', name: 'FTSE 100', type: 'Index', active: false },

    // CRYPTO - All inactive
    { code: 'BTCUSD', name: 'Bitcoin vs US Dollar', type: 'Crypto', active: false },
    { code: 'ETHUSD', name: 'Ethereum vs US Dollar', type: 'Crypto', active: false },
    { code: 'XRPUSD', name: 'Ripple vs US Dollar', type: 'Crypto', active: false },
    { code: 'SOLUSD', name: 'Solana vs US Dollar', type: 'Crypto', active: false },
];

// Get all pairs
const getAllPairs = () => FOREX_PAIRS;

// Get active pairs only
const getActivePairs = () => FOREX_PAIRS.filter(p => p.active);

// Get Finnhub symbol for a pair code
const getFinnhubSymbol = (code) => {
    const pair = FOREX_PAIRS.find(p => p.code === code);
    return pair?.finnhubSymbol || null;
};

// Check if a pair is active for tracking
const isPairActive = (code) => {
    const pair = FOREX_PAIRS.find(p => p.code === code);
    return pair?.active || false;
};

module.exports = {
    FOREX_PAIRS,
    getAllPairs,
    getActivePairs,
    getFinnhubSymbol,
    isPairActive,
};
