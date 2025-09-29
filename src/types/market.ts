export interface Market {
  id: string;
  question: string;
  description: string;
  sourceUrl: string;
  ogImage?: string;
  ogTitle?: string;
  
  // Outcomes
  yesPrice: number; // 0-100 representing percentage
  noPrice: number;
  
  // Stats
  volume: number; // in USD
  liquidity: number; // in USD
  totalBets: number;
  
  // Timing
  createdAt: Date;
  expiresAt: Date;
  
  // Creator
  creatorAddress: string;
  creatorStake: number;
  creatorEarnings: number; // 2% of volume in real-time
  
  // Status
  status: 'active' | 'resolved' | 'pending';
  confidence: number; // 0-100 percentage
  
  // Oracle settings
  oracleType: 'creator' | 'ai';
}

export interface Bet {
  id: string;
  marketId: string;
  outcome: 'yes' | 'no';
  amount: number;
  shares: number;
  timestamp: Date;
  userAddress: string;
}
