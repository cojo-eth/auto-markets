import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BettingInterfaceProps {
  yesPrice: number;
  noPrice: number;
  marketId: string;
}

export const BettingInterface = ({ yesPrice, noPrice, marketId }: BettingInterfaceProps) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const { toast } = useToast();

  const handleBet = (outcome: 'yes' | 'no') => {
    setSelectedOutcome(outcome);
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Enter amount",
        description: "Please enter a bet amount",
        variant: "destructive",
      });
      return;
    }

    // Mock bet placement
    toast({
      title: "Bet placed! 🎉",
      description: `You bet $${betAmount} on ${outcome.toUpperCase()}`,
    });
    
    setBetAmount('');
    setSelectedOutcome(null);
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Bet Amount (USD)</label>
        <Input
          type="number"
          placeholder="10"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="text-lg font-semibold"
          min="1"
          step="1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success-foreground">YES</span>
            </div>
            <div className="text-3xl font-bold text-success-foreground">{yesPrice}%</div>
            <div className="text-xs text-muted-foreground mt-2">
              {betAmount && `Win $${(parseFloat(betAmount) * (100 / yesPrice)).toFixed(2)}`}
            </div>
          </div>
          <Button 
            variant="success" 
            className="w-full" 
            size="lg"
            onClick={() => handleBet('yes')}
          >
            Bet YES
          </Button>
        </div>

        <div className="space-y-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive-foreground">NO</span>
            </div>
            <div className="text-3xl font-bold text-destructive-foreground">{noPrice}%</div>
            <div className="text-xs text-muted-foreground mt-2">
              {betAmount && `Win $${(parseFloat(betAmount) * (100 / noPrice)).toFixed(2)}`}
            </div>
          </div>
          <Button 
            variant="danger" 
            className="w-full" 
            size="lg"
            onClick={() => handleBet('no')}
          >
            Bet NO
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        <p>2% fee · Creator earns in real-time · Powered by Base</p>
      </div>
    </Card>
  );
};
