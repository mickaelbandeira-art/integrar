import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { ScrollVideoHero } from '../components/ScrollVideoHero';
import { ScrollGallery } from '../components/ScrollGallery';
import { ScrollTextGallery } from '../components/ScrollTextGallery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);


  // Helper to render CTA buttons
  const renderCTA = () => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      return (
        <div className="space-y-4 animate-scale-in w-full">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <p className="text-lg font-bold text-white">Olá, {userName}! 👋</p>
            <p className="text-sm text-white/70">Que bom te ver por aqui.</p>
          </div>
          <GradientButton
            text="Acessar Evento"
            onClick={() => navigate('/menu')}
            className="shadow-2xl hover:scale-105"
          />
          <button
            onClick={() => {
              localStorage.removeItem('userName');
              localStorage.removeItem('checkins');
              window.location.reload();
            }}
            className="w-full text-sm text-white/60 hover:text-white underline mt-4"
          >
            Sair / Novo check-in
          </button>
        </div>
      );
    }
    return (
      <GradientButton
        text="Realizar Check-in"
        onClick={() => setIsLocationDialogOpen(true)}
        className="shadow-2xl hover:scale-105 py-5"
      />
    );
  };

  return (
    <Layout showLogo={false}>
      {/* 
        Full-bleed scrollytelling wrapper.
        We set a base background that matches the final section (#f0ede8) 
        to prevent white flashes at the bottom.
      */}
      <div className="w-full overflow-x-hidden bg-[#f0ede8]">
        {/* Hero */}
        <ScrollVideoHero 
          videoSrc="/hero-video.mp4" 
          scrollDistance="250vh" 
          ctaContent={renderCTA()}
        />

        {/* Text Gallery — same kinetic scroll, mosões e valores AeC */}
        <ScrollTextGallery />

        {/* Photo Gallery */}
        <ScrollGallery />
      </div>
      
      {/* Re-mounting the CTA inside the Hero via portal if needed, 
          but I'll update ScrollVideoHero to accept the CTA as a child/prop for better React best practices */}

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Localização Necessária</DialogTitle>
            <DialogDescription>
              Para realizar o check-in, é necessário ativar a localização do seu dispositivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsLocationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => {
              setIsLocationDialogOpen(false);
              navigate('/checkin');
            }}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
