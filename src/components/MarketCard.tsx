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
  
  return (
    <Link to={`/market/${market.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group">
        {market.ogImage && (
          <div className="relative w-full h-48 overflow-hidden bg-muted">
            <img 
              src={market.ogImage} 
              alt={market.question}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
        )}
        
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {market.question}
            </h3>
            <Badge variant="outline" className="shrink-0">
              {market.confidence}% confident
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-success/10 border border-success/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-success-foreground">{market.yesPrice}%</div>
              <div className="text-xs text-muted-foreground mt-1">YES</div>
            </div>
            <div className="flex-1 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-destructive-foreground">{market.noPrice}%</div>
              <div className="text-xs text-muted-foreground mt-1">NO</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>${(market.volume / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{market.totalBets}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}d left</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
