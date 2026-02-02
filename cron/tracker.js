const axios = require('axios');
const pb = require('../services/pocketbase');
const { getFinnhubSymbol, isPairActive, getActivePairs } = require('../config/forexPairs');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Test Finnhub API connection on startup
const testFinnhubConnection = async () => {
    try {
        console.log('Testing Finnhub API connection...');
        // Try to get Apple stock price as a simple test (stocks always work on free tier)
        const testUrl = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`;
        const response = await axios.get(testUrl);

        if (response.data && response.data.c) {
            console.log(`✓ Finnhub API is working. AAPL price: $${response.data.c}`);

            // Also show active pairs
            const activePairs = getActivePairs();
            console.log(`\n✓ Active pairs for tracking: ${activePairs.map(p => p.code).join(', ')}`);

            return true;
        } else {
            console.log('✗ Finnhub API returned empty data. Check API key.');
            return false;
        }
    } catch (error) {
        console.error('✗ Finnhub API test failed:', error.message);
        return false;
    }
};

// Get current price for a symbol
const getCurrentPrice = async (pair) => {
    // Check if pair is active for tracking
    if (!isPairActive(pair)) {
        console.log(`  ⚠ Pair ${pair} is not active for tracking, skipping price fetch.`);
        return null;
    }

    const symbol = getFinnhubSymbol(pair);
    if (!symbol) {
        console.log(`  ⚠ No Finnhub symbol mapping for ${pair}`);
        return null;
    }

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
        const response = await axios.get(quoteUrl);
        const currentPrice = response.data.c; // 'c' is current price in Finnhub

        if (!currentPrice || currentPrice === 0) {
            console.log(`  ⚠ No price data for ${symbol}`);
            return null;
        }

        return currentPrice;
    } catch (error) {
        console.error(`  ✗ Error fetching price for ${pair}:`, error.message);
        return null;
    }
};

const checkSignals = async () => {
    try {
        console.log('\n==============================');
        console.log('Running Signal Tracker...');
        console.log(`Time: ${new Date().toISOString()}`);
        console.log('==============================');

        // 1. Fetch all PENDING signals
        const records = await pb.collection('signals').getFullList({
            filter: 'status = "PENDING"',
        });

        if (records.length === 0) {
            console.log('No pending signals found.');
            return;
        }

        console.log(`Found ${records.length} pending signal(s).`);

        // 2. Loop through each signal
        for (const signal of records) {
            const { id, pair, direction, tp_price, sl_price, entry_price } = signal;

            // Parse prices to numbers
            const tp = parseFloat(tp_price) || 0;
            const sl = parseFloat(sl_price) || 0;
            const entry = parseFloat(entry_price) || 0;

            if (tp === 0 || sl === 0) {
                console.log(`Signal ${id}: Missing TP/SL prices, skipping.`);
                continue;
            }

            // 3. Get current price (only for active pairs)
            const currentPrice = await getCurrentPrice(pair);

            if (!currentPrice) {
                continue; // Skip if no price available
            }

            console.log(`Signal ${id}:`);
            console.log(`  Pair: ${pair} | Direction: ${direction}`);
            console.log(`  Entry: ${entry} | Current: ${currentPrice}`);
            console.log(`  TP: ${tp} | SL: ${sl}`);

            // 4. Calculate P/L and check status
            let newStatus = 'PENDING';

            if (direction === 'BUY') {
                if (currentPrice >= tp) {
                    newStatus = 'WON';
                    console.log(`  → TP HIT! Price ${currentPrice} >= ${tp}`);
                } else if (currentPrice <= sl) {
                    newStatus = 'LOST';
                    console.log(`  → SL HIT! Price ${currentPrice} <= ${sl}`);
                } else {
                    console.log(`  → Still pending...`);
                }
            } else if (direction === 'SELL') {
                if (currentPrice <= tp) {
                    newStatus = 'WON';
                    console.log(`  → TP HIT! Price ${currentPrice} <= ${tp}`);
                } else if (currentPrice >= sl) {
                    newStatus = 'LOST';
                    console.log(`  → SL HIT! Price ${currentPrice} >= ${sl}`);
                } else {
                    console.log(`  → Still pending...`);
                }
            }

            // 5. Update status if changed
            if (newStatus !== 'PENDING') {
                try {
                    await pb.collection('signals').update(id, {
                        status: newStatus
                    });
                    console.log(`  ✓ Signal ${id} updated to ${newStatus}`);
                } catch (updateErr) {
                    console.error(`  ✗ Failed to update signal ${id}:`, updateErr.message);
                }
            }
        }

        console.log('------------------------------\n');

    } catch (error) {
        console.error('Error in checkSignals:', error.message);
    }
};

module.exports = { checkSignals, testFinnhubConnection };
