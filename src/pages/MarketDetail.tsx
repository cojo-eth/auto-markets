import { useParams, Link } from 'react-router-dom';
import { getMockMarkets } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BettingInterface } from '@/components/BettingInterface';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Twitter, 
  Link as LinkIcon,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Droplet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MarketDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const markets = getMockMarkets();
  const market = markets.find(m => m.id === id);

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Market not found</h1>
          <Link to="/markets">
            <Button>Browse Markets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.ceil((market.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this prediction market: ${market.question}`;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this market anywhere",
      });
    }
  };

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/markets">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Image & Question */}
            {market.ogImage && (
              <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg border border-border">
                <img 
                  src={market.ogImage} 
                  alt={market.question}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
            )}

            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{market.question}</h1>
                <Badge variant="outline" className="shrink-0">
                  {market.confidence}% confident
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{market.description}</p>
            </div>

            {/* Source Link */}
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(market.sourceUrl)}&sz=64`}
                    alt=""
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">Source</p>
                    <p className="text-xs text-muted-foreground">{market.ogTitle || 'Original Post'}</p>
                  </div>
                </div>
                <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    View Original
                  </Button>
                </a>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <p className="text-2xl font-bold">${(market.volume / 1000).toFixed(1)}k</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Liquidity</span>
                </div>
                <p className="text-2xl font-bold">${(market.liquidity / 1000).toFixed(1)}k</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Bets</span>
                </div>
                <p className="text-2xl font-bold">{market.totalBets}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Time Left</span>
                </div>
                <p className="text-2xl font-bold">{timeRemaining}d</p>
              </Card>
            </div>

            {/* Creator Info */}
            <Card className="p-6 bg-gradient-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Creator Earnings</p>
                  <p className="text-3xl font-bold text-primary">
                    ${market.creatorEarnings.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {market.totalBets} bets · 2% of volume
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-primary/30" />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Betting Interface */}
            <BettingInterface 
              yesPrice={market.yesPrice}
              noPrice={market.noPrice}
              marketId={market.id}
            />

            {/* Add Liquidity */}
            <Card className="p-6 text-center space-y-4">
              <div>
                <Droplet className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Add Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  Earn fees by providing liquidity to this market
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Add Liquidity
              </Button>
            </Card>

            {/* Share */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Share Market</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleShare('copy')}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
