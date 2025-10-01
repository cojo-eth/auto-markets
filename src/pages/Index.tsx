import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, Sparkles, TrendingUp, Zap, ArrowRight, Check, CalendarIcon, DollarSign, Shield, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateMockMarket, saveMarket } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';
import gearsBackground from '@/assets/gears-bg.png';

interface GeneratedMarket {
  question: string;
  description: string;
  ogTitle: string;
  ogImage?: string;
  confidence: number;
  sourceUrl: string;
  endTime?: Date;
  oracleType?: 'creator' | 'ai';
  poolSize?: number;
}

export default function Index() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMarket, setGeneratedMarket] = useState<GeneratedMarket | null>(null);
  const [editedMarket, setEditedMarket] = useState<GeneratedMarket | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!url) {
      toast({
        title: "Enter a URL",
        description: "Please paste a link to generate a market",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the edge function to generate market with AI
      console.log('Calling generate-market edge function with URL:', url);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-market`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate market');
      }

      const defaultEndTime = new Date();
      defaultEndTime.setDate(defaultEndTime.getDate() + 7);
      
      setGeneratedMarket({
        ...data.market,
        endTime: defaultEndTime,
        oracleType: 'creator',
        poolSize: 100,
      });
      setEditedMarket({
        ...data.market,
        endTime: defaultEndTime,
        oracleType: 'creator',
        poolSize: 100,
      });
      
      toast({
        title: "Market generated! ✨",
        description: "Review and edit before launching",
      });
    } catch (error) {
      console.error('Error generating market:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate market",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchMarket = () => {
    if (!editedMarket) return;
    
    const expiresAt = editedMarket.endTime || new Date();
    
    const market = generateMockMarket(editedMarket.sourceUrl, {
      question: editedMarket.question,
      description: editedMarket.description,
      ogTitle: editedMarket.ogTitle,
      ogImage: editedMarket.ogImage,
      confidence: editedMarket.confidence,
      expiresAt,
      oracleType: editedMarket.oracleType || 'creator',
      creatorStake: editedMarket.poolSize || 100,
      liquidity: (editedMarket.poolSize || 100) * 2,
    });
    
    // Save to localStorage
    saveMarket(market);
    
    toast({
      title: "Market launched! 🎉",
      description: "Your prediction market is now live",
    });
    
    // Navigate to markets page
    navigate('/markets');
  };

  const handleReset = () => {
    setGeneratedMarket(null);
    setEditedMarket(null);
    setUrl('');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${gearsBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logoImage} alt="Auto Markets" className="h-8" />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/markets">
                <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                  Browse Markets
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        {!generatedMarket ? (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full text-center space-y-14">
              {/* Logo */}
              <div className="flex flex-col items-center animate-fade-in space-y-3">
                <img 
                  src={logoImage} 
                  alt="Auto Markets" 
                  className="w-80 md:w-[440px] h-auto"
                />
                <p className="text-lg text-foreground/60 font-medium">Instant prediction markets</p>
              </div>


              {/* Feature Badges */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/30 backdrop-blur-md border border-border/30 text-sm text-foreground/70 hover:bg-card/40 transition-all">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">Instant Generation</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/30 backdrop-blur-md border border-border/30 text-sm text-foreground/70 hover:bg-card/40 transition-all">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                  <span className="font-medium">Earn 2%</span>
                </div>
              </div>

              {/* Input Section */}
              <div className="space-y-3 max-w-xl mx-auto">
                <div className="relative">
                  <Copy className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                  <Input
                    type="url"
                    placeholder="https://x.com... or any link"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    className="pl-12 pr-5 h-12 text-sm bg-card/40 backdrop-blur-md border border-border/40 rounded-full focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    disabled={isGenerating}
                  />
                </div>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full h-12 text-sm font-semibold rounded-full relative overflow-hidden group bg-primary hover:bg-primary shadow-sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Prediction Market
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>

              {/* Tagline */}
              <p className="text-sm text-foreground/50 font-medium tracking-wide">
                Drop a link. Make a market. Share it anywhere.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <Card className="p-8 max-w-3xl w-full mx-auto bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold tracking-tight">Review & Edit Market</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 bg-primary/10 rounded-full font-medium">
                      {editedMarket?.confidence}% confidence
                    </span>
                  </div>
                </div>

                {/* Preview Image */}
                {editedMarket?.ogImage && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={editedMarket.ogImage} 
                      alt="Market preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4 md:col-span-2">
                    <div className="space-y-2">
                      <Label htmlFor="question">Market Question</Label>
                      <Input
                        id="question"
                        value={editedMarket?.question || ''}
                        onChange={(e) => setEditedMarket(prev => prev ? {...prev, question: e.target.value} : null)}
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description & Resolution Criteria</Label>
                      <Textarea
                        id="description"
                        value={editedMarket?.description || ''}
                        onChange={(e) => setEditedMarket(prev => prev ? {...prev, description: e.target.value} : null)}
                        className="min-h-32"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      End time
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editedMarket?.endTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedMarket?.endTime ? format(editedMarket.endTime, "PPP p") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedMarket?.endTime}
                          onSelect={(date) => setEditedMarket(prev => prev ? {...prev, endTime: date} : null)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oracleType" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Who decides
                    </Label>
                    <Select 
                      value={editedMarket?.oracleType} 
                      onValueChange={(value: 'creator' | 'ai') => setEditedMarket(prev => prev ? {...prev, oracleType: value} : null)}
                    >
                      <SelectTrigger id="oracleType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creator">Market Creator</SelectItem>
                        <SelectItem value="ai">AI Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="poolSize" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Add funds to pool
                    </Label>
                    <Input
                      id="poolSize"
                      type="number"
                      min="1"
                      value={editedMarket?.poolSize || 100}
                      onChange={(e) => setEditedMarket(prev => prev ? {...prev, poolSize: parseInt(e.target.value) || 100} : null)}
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${editedMarket?.sourceUrl}&sz=64`} 
                      alt="Source favicon" 
                      className="w-6 h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      <strong>Source:</strong>{' '}
                      <a href={editedMarket?.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {editedMarket?.sourceUrl}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    onClick={handleReset}
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Start Over
                  </Button>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="flex-1"
                    onClick={handleLaunchMarket}
                  >
                    <Check className="w-5 h-5" />
                    Launch Market
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}