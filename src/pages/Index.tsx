
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Camera, Video, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header - Otimizado para mobile */}
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-epic-black animate-fade-in">
          Epic Moments
        </h1>
        <p className="text-base md:text-lg text-muted-foreground animate-slide-up max-w-[80%] mx-auto">
          Transforme suas estampas em experiências interativas
        </p>
      </header>

      {/* Cards Grid - Responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
        {/* Scanner Card */}
        <Card className="glass hover-effect">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Camera className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
              Scanner
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Aponte a câmera para descobrir momentos mágicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="default" 
              className="w-full bg-epic-blue hover:bg-epic-blue/90 text-base"
              asChild
            >
              <Link to="/scan">Iniciar Scanner</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="glass hover-effect">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Upload className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
              Gerenciar
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Faça upload de estampas e vídeos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full border-epic-blue text-epic-blue hover:bg-epic-blue/10 text-base"
              asChild
            >
              <Link to="/manage/stamps">Gerenciar Estampas</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-epic-blue text-epic-blue hover:bg-epic-blue/10 text-base"
              asChild
            >
              <Link to="/manage/videos">Gerenciar Vídeos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Associações Card */}
        <Card className="glass hover-effect md:col-span-2 lg:col-span-1">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Video className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
              Associações
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Vincule estampas aos vídeos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full border-epic-blue text-epic-blue hover:bg-epic-blue/10 text-base"
              asChild
            >
              <Link to="/manage/associations">Gerenciar Associações</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
