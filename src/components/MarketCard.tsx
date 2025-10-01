import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketCardProps {
  market: Market;
}

export const MarketCard = ({ market }: MarketCardProps) => {
  const timeRemaining = Math.ceil((market.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(market.sourceUrl)}&sz=64`;
  
  return (
    <Link to={`/market/${market.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group">
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <img 
              src={market.iconUrl || faviconUrl} 
              alt=""
              className="w-8 h-8 rounded shrink-0 mt-1 object-cover"
              onError={(e) => {
                e.currentTarget.src = faviconUrl;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {market.question}
              </h3>
              <Badge variant="outline" className="text-xs flex items-center gap-1.5 w-fit">
                <span className="text-muted-foreground">Source:</span>
                <img 
                  src={faviconUrl} 
                  alt=""
                  className="w-3 h-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-success/10 border border-success/20 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-success-foreground">{market.yesPrice}%</div>
              <div className="text-xs text-muted-foreground">YES</div>
            </div>
            <div className="flex-1 bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 text-center">
              <div className="text-xl font-bold text-destructive-foreground">{market.noPrice}%</div>
              <div className="text-xs text-muted-foreground">NO</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>${(market.volume / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{market.totalBets}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining}d left</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
