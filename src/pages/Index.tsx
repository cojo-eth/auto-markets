import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, Sparkles, TrendingUp, Zap, ArrowRight, Edit2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateMockMarket } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GeneratedMarket {
  question: string;
  description: string;
  ogTitle: string;
  confidence: number;
  sourceUrl: string;
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

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate market');
      }

      setGeneratedMarket(data.market);
      setEditedMarket(data.market);
      
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
    
    const market = generateMockMarket(editedMarket.sourceUrl);
    market.question = editedMarket.question;
    market.description = editedMarket.description;
    market.ogTitle = editedMarket.ogTitle;
    market.confidence = editedMarket.confidence;
    
    toast({
      title: "Market launched! 🎉",
      description: "Your prediction market is now live",
    });
    
    navigate(`/market/${market.id}`);
  };

  const handleReset = () => {
    setGeneratedMarket(null);
    setEditedMarket(null);
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                QuickBet
              </h1>
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="text-foreground font-semibold">
                Create
              </Link>
              <Link to="/markets" className="text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Drop a link, create a market</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Instant Prediction
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Markets
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Paste any link from the web. We'll instantly create a prediction market with AI.
              Share it anywhere. Start earning.
            </p>
          </div>

          {/* URL Input Card */}
          {!generatedMarket ? (
            <Card className="p-8 max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-glow">
              <div className="space-y-4">
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://twitter.com/... or any link"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    className="pl-12 h-14 text-lg"
                    disabled={isGenerating}
                  />
                </div>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full h-14 text-lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Generating Market...
                    </>
                  ) : (
                    <>
                      Generate Market
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Instant creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>AI-powered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Earn 2% fees</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-glow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Review & Edit Market</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 bg-primary/10 rounded-full">
                      {editedMarket?.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">Source Title</Label>
                    <Input
                      id="ogTitle"
                      value={editedMarket?.ogTitle || ''}
                      onChange={(e) => setEditedMarket(prev => prev ? {...prev, ogTitle: e.target.value} : null)}
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
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
          )}

          {/* Example Links - Only show when no market is generated */}
          {!generatedMarket && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try with:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'https://twitter.com/elonmusk/status/123',
                  'https://reddit.com/r/technology/comments/abc',
                  'https://news.ycombinator.com/item?id=123',
                ].map((exampleUrl) => (
                  <button
                    key={exampleUrl}
                    onClick={() => setUrl(exampleUrl)}
                    className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {exampleUrl.split('/')[2]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA to Markets - Only show when no market is generated */}
          {!generatedMarket && (
            <div className="pt-8">
              <Link to="/markets">
                <Button variant="outline" size="lg">
                  Browse Existing Markets
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center space-y-3 bg-card/50 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Drop a link, get a market in seconds. No setup, no complexity.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 bg-card/50 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Smart algorithms analyze content and generate perfect questions.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 bg-card/50 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Earn Instantly</h3>
              <p className="text-sm text-muted-foreground">
                Get 2% of trading volume in real-time. Watch your earnings grow.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
