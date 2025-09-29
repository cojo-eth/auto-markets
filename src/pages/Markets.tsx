import { useState } from 'react';
import { MarketCard } from '@/components/MarketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMockMarkets } from '@/lib/mockData';
import { TrendingUp, Clock, DollarSign, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Markets() {
  const [sortBy, setSortBy] = useState<'volume' | 'recent' | 'ending'>('volume');
  const [searchQuery, setSearchQuery] = useState('');
  const markets = getMockMarkets();

  const sortedMarkets = [...markets].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.volume - a.volume;
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'ending':
        return a.expiresAt.getTime() - b.expiresAt.getTime();
      default:
        return 0;
    }
  });

  const filteredMarkets = sortedMarkets.filter(market =>
    market.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                QuickBet
              </h1>
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Create
              </Link>
              <Link to="/markets" className="text-foreground font-semibold">
                Markets
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Markets</h1>
          <p className="text-muted-foreground">
            Browse active prediction markets · {markets.length} live markets
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-3xl font-bold">
              ${(markets.reduce((sum, m) => sum + m.volume, 0) / 1000).toFixed(0)}k
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Bets</span>
            </div>
            <div className="text-3xl font-bold">
              {markets.reduce((sum, m) => sum + m.totalBets, 0)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Markets</span>
            </div>
            <div className="text-3xl font-bold">{markets.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'volume' ? 'default' : 'outline'}
              onClick={() => setSortBy('volume')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Volume
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              onClick={() => setSortBy('recent')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
            <Button
              variant={sortBy === 'ending' ? 'default' : 'outline'}
              onClick={() => setSortBy('ending')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Ending Soon
            </Button>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No markets found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
