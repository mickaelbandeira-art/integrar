import React from 'react';
import { Layout, GlassCard, GradientButton } from '../components/LayoutComponents';
import { ExternalLink, Camera } from 'lucide-react';

const Galeria = () => {
  // Google Drive photos folder link - update this with the actual link
  const LINK_FOTOS = "https://drive.google.com/";

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto text-center space-y-5 animate-fade-in">
        <div className="space-y-3">
          <Camera className="w-14 h-14 mx-auto text-[hsl(347,78%,60%)]" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Galeria de Fotos
          </h2>
          <p className="text-muted-foreground text-lg">
            Confira os melhores momentos do evento!
          </p>
        </div>

        <GlassCard className="max-w-md mx-auto">
          <p className="text-foreground/80 mb-6">
            As fotos do evento estão disponíveis no Google Drive.
            Clique no botão abaixo para acessar a galeria completa.
          </p>

          <a href={LINK_FOTOS} target="_blank" rel="noopener noreferrer" className="block">
            <GradientButton text="Acessar Fotos" />
          </a>

          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-sm">
            <ExternalLink className="w-4 h-4" />
            <span>Abre em nova aba</span>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Galeria;
