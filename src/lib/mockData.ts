import { Market } from '@/types/market';

export function getMockMarkets(): Market[] {
  const stored = localStorage.getItem('quickbet_markets');
  if (stored) {
    try {
      const markets = JSON.parse(stored);
      // Convert date strings back to Date objects
      return markets.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        expiresAt: new Date(m.expiresAt),
      }));
    } catch {
      return [];
    }
  }
  return [];
}

export function saveMarket(market: Market) {
  const markets = getMockMarkets();
  markets.unshift(market); // Add to beginning
  localStorage.setItem('quickbet_markets', JSON.stringify(markets));
}

export function generateMockMarket(sourceUrl: string, overrides?: Partial<Market>): Market {
  const id = Math.random().toString(36).substring(7);
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  return {
    id,
    question: "Will this prediction come true?",
    description: "A prediction market generated from the provided URL.",
    sourceUrl,
    ogImage: undefined,
    ogTitle: "Prediction Market",
    yesPrice: 50,
    noPrice: 50,
    volume: 0,
    liquidity: 100,
    totalBets: 0,
    createdAt: now,
    expiresAt,
    creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    creatorStake: 100,
    creatorEarnings: 0,
    status: 'active',
    confidence: 75,
    oracleType: 'creator',
    ...overrides,
  };
}
