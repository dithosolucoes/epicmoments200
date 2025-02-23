import ARScanner from '@/components/ARScanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Scanner = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-epic-blue" />
              Scanner de Estampas
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <Card className="max-w-2xl mx-auto">
          <ARScanner />
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>Dica: Mantenha a câmera estável e bem iluminada para melhor detecção</p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/stamps">
              Gerenciar Estampas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/videos">
              Gerenciar Vídeos
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Scanner;
