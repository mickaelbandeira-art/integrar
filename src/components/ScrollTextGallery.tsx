import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface TextCard {
  id: number;
  label: string;
  headline: string;
  body: string;
  accent: string; // CSS color
  image: string;
}

const textCards: TextCard[] = [
  {
    id: 1,
    label: "PROPÓSITO",
    headline: "Conectar Pessoas ao que Importa",
    body: "Criamos experiências que transformam cada colaborador em protagonista da cultura AeC.",
    accent: "#005596",
    image: "/c1.png",
  },
  {
    id: 2,
    label: "INOVAÇÃO",
    headline: "Tecnologia com Alma",
    body: "Unimos dados, inteligência e humanidade para criar soluções que evoluem junto com as pessoas.",
    accent: "#0073c8",
    image: "/j1.png",
  },
  {
    id: 3,
    label: "CULTURA",
    headline: "22 Anos de Liderança",
    body: "Uma trajetória construída na confiança, na excelência e no compromisso com quem faz a diferença.",
    accent: "#f0b800",
    image: "/g1.png",
  },
  {
    id: 4,
    label: "COMUNIDADE",
    headline: "50 mil Talentos Integrados",
    body: "Cada história importa. Cada voz molda o futuro de uma empresa que acredita nas pessoas.",
    accent: "#005596",
    image: "/e1.png",
  },
  {
    id: 5,
    label: "FUTURO",
    headline: "O Próximo Capítulo Começa Aqui",
    body: "O Integrar é o ponto de encontro entre o que somos e o que queremos construir juntos.",
    accent: "#0073c8",
    image: "/p1.png",
  },
  {
    id: 6,
    label: "EXCELÊNCIA",
    headline: "Padronização e Qualidade",
    body: "Buscamos a perfeição em cada detalhe, garantindo que a entrega supere as expectativas.",
    accent: "#f0b800",
    image: "/m1.png",
  },
];

export const ScrollTextGallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [imagesLoaded, setImagesLoaded] = React.useState(0);
  const totalImages = textCards.length;

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;
    if (imagesLoaded < totalImages) return;

    const ctx = gsap.context(() => {
      const totalWidth = trackRef.current!.scrollWidth;
      const windowWidth = window.innerWidth;
      const xMove = -(totalWidth - windowWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth * 0.65}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(trackRef.current, { x: xMove, ease: 'none', duration: 10 }, 0);

      // Section Title Reveal
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          }
        }
      );

      gsap.utils.toArray<HTMLElement>('.text-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            delay: i * 0.15,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      gsap.to(labelRef.current, {
        x: xMove * 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth * 0.65}`,
          scrub: 2,
        },
      });

      // Background transition - Seamlessly blend to the next section's color (Cream/F0ede8)
      tl.to(sectionRef.current, {
        backgroundColor: '#f0ede8',
        duration: 2,
      }, 9);

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, [imagesLoaded, totalImages]);

  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden bg-[#0d0d0d]" style={{ height: '100vh' }}>
      {/* Ghostly Label — background text */}
      <div ref={labelRef} className="absolute top-10 left-10 z-10 pointer-events-none select-none">
        <h2
          className="font-black uppercase leading-none"
          style={{
            fontSize: 'clamp(4rem, 10vw, 9rem)',
            color: 'rgba(255,255,255,0.02)',
            letterSpacing: '-0.04em',
          }}
        >
          NOSSOS<br />VALORES
        </h2>
      </div>

       {/* Section header */}
       <div ref={headerRef} className="absolute top-10 right-10 z-20 text-right pointer-events-none">
         <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
           Galeria de Valores
         </p>
         <div className="w-8 h-[2px] ml-auto mt-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
       </div>

      {/* Track */}
      <div className="flex items-stretch min-h-screen py-24">
        <div
          ref={trackRef}
          className="flex gap-6 items-stretch flex-nowrap pl-[8vw] pr-[30vw]"
          style={{ willChange: 'transform' }}
        >
          {textCards.map((card, index) => (
            <div
              key={card.id}
              className={`text-card relative flex-shrink-0 group cursor-default
                ${index % 2 === 0 ? 'self-start mt-12' : 'self-end mb-12'}
              `}
              style={{ width: 'clamp(300px, 30vw, 450px)' }}
            >
              {/* Card body — "Grass" glassmorphism style */}
              <div
                className="relative w-full overflow-hidden rounded-[2.5rem] flex flex-col group/card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(24px)',
                  transition: 'background 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0px)';
                }}
              >
                {/* Image top */}
                <div className="relative w-full aspect-[16/10] overflow-hidden grayscale-[0.4] group-hover/card:grayscale-0 transition-all duration-700">
                  <img 
                    src={card.image} 
                    alt={card.headline} 
                    onLoad={() => setImagesLoaded(prev => prev + 1)}
                    onError={() => setImagesLoaded(prev => prev + 1)}
                    className="w-full h-full object-cover scale-105 group-hover/card:scale-100 transition-transform duration-1000"
                  />
                  {/* Subtle vignette on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/80 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content padding */}
                <div className="p-10 flex flex-col flex-grow">
                  {/* Accent tag */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-8 h-[2px] rounded-full"
                      style={{ background: card.accent, boxShadow: `0 0 10px ${card.accent}44` }}
                    />
                    <span
                      className="block text-[10px] font-black uppercase tracking-[0.4em]"
                      style={{ color: card.accent }}
                    >
                      {card.label}
                    </span>
                  </div>

                  <h3
                    className="font-black text-white leading-tight mb-5"
                    style={{
                      fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {card.headline}
                  </h3>

                  <p
                    className="font-medium leading-relaxed text-white/50"
                    style={{
                      fontSize: 'clamp(0.95rem, 1.25vw, 1.15rem)',
                    }}
                  >
                    {card.body}
                  </p>
                </div>

                {/* Card number watermark */}
                <div
                  className="absolute bottom-8 right-10 font-black select-none pointer-events-none"
                  style={{
                    fontSize: '6rem',
                    color: 'rgba(255,255,255,0.02)',
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {String(card.id).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
