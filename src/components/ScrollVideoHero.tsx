import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollVideoHeroProps {
  videoSrc: string;
  scrollDistance?: string;
  ctaContent?: React.ReactNode;
}

export const ScrollVideoHero: React.FC<ScrollVideoHeroProps> = ({
  videoSrc,
  scrollDistance = "350vh",
  ctaContent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !containerRef.current) return;

    const initTimeline = () => {
      const duration = video.duration;
      if (!duration || isNaN(duration)) return;

      // Avoid double initialization
      const existing = ScrollTrigger.getAll().find(st => st.trigger === containerRef.current);
      if (existing) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 2.5,
          markers: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      // Video scrub
      tl.to(video, { currentTime: duration, ease: "none", duration: 10 }, 0);

      // Scene 1 — "INTEGRAR" split-line reveal
      tl.fromTo("#scene-1 .hero-line-1",
        { y: "115%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 3, ease: "expo.out" },
        0.4
      );
      tl.fromTo("#scene-1 .hero-line-2",
        { y: "115%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 3, ease: "expo.out" },
        0.7
      );
      // Scene 1 exit
      tl.to("#scene-1",
        { y: -120, opacity: 0, filter: "blur(10px)", duration: 2.5, ease: "power2.in" },
        5
      );

      // Scene 2 — "Sinta a Experiência"
      tl.fromTo("#scene-2 .hero-sub-1",
        { y: "115%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 2.5, ease: "expo.out" },
        5.8
      );
      tl.fromTo("#scene-2 .hero-sub-2",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 2, ease: "power3.out" },
        6.4
      );
      tl.to("#scene-2",
        { y: -80, opacity: 0, filter: "blur(8px)", duration: 2.5, ease: "power2.in" },
        8.5
      );

      // Scene 3 — CTA
      tl.fromTo("#scene-3",
        { scale: 0.85, opacity: 0, y: 60 },
        { scale: 1, opacity: 1, y: 0, duration: 2.5, ease: "back.out(1.4)" },
        9
      );

      // Final exit
      tl.to([video, "#scene-3"],
        { opacity: 0, filter: "blur(16px)", y: -80, duration: 2, ease: "power2.in" },
        11
      );
      
      ScrollTrigger.refresh();
    };

    video.addEventListener('loadedmetadata', initTimeline);
    video.addEventListener('canplay', initTimeline);
    if (video.readyState >= 1) initTimeline();

    return () => {
      video.removeEventListener('loadedmetadata', initTimeline);
      video.removeEventListener('canplay', initTimeline);
      ScrollTrigger.getAll()
        .filter(st => st.trigger === containerRef.current)
        .forEach(st => st.kill());
    };
  }, [scrollDistance]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden"
      style={{ 
        height: '100vh',
        background: 'linear-gradient(160deg, #0a3d62 0%, #1a6ab0 50%, #2980c8 100%)' 
      }}>

      {/* Video — blended over the blue */}
      <div className="absolute inset-0 w-full h-screen bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ opacity: 0.6, willChange: 'contents' }}
        />
        {/* Soft gradient veil */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center">

        {/* Scene 1: INTEGRAR */}
        <div id="scene-1" className="absolute flex flex-col items-center gap-5 px-4 text-center">
          <div className="overflow-hidden">
            <h1
              className="hero-line-1 font-black text-white tracking-tighter leading-none block select-none"
              style={{
                fontSize: 'clamp(4rem, 13vw, 11rem)',
                transform: 'translateY(115%)',
                textShadow: '0 8px 40px rgba(0,0,0,0.35)',
                letterSpacing: '-0.04em'
              }}
            >
              INTEGRAR
            </h1>
          </div>
          {/* Accent line */}
          <div className="overflow-hidden">
            <div
              className="hero-line-2 h-[3px] rounded-full mx-auto"
              style={{
                width: 'clamp(80px, 12vw, 160px)',
                background: 'linear-gradient(90deg, #f0b800, #ffd94d)',
                transform: 'translateY(115%)',
                opacity: 0,
                boxShadow: '0 0 24px rgba(240,184,0,0.5)'
              }}
            />
          </div>
        </div>

        {/* Scene 2: Subtitle */}
        <div id="scene-2" className="absolute flex flex-col items-center gap-5 px-6 max-w-2xl text-center">
          <div className="overflow-hidden">
            <h2
              className="hero-sub-1 font-bold text-white block"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                transform: 'translateY(115%)',
                opacity: 0,
                textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                letterSpacing: '-0.02em'
              }}
            >
              Sinta a Experiência
            </h2>
          </div>
          <p
            className="hero-sub-2 font-medium leading-relaxed"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.82)',
              opacity: 0
            }}
          >
            O hub interativo que conecta você a cada momento do nosso evento em tempo real.
          </p>
        </div>

        {/* Scene 3: CTA */}
        <div id="scene-3" className="absolute flex flex-col items-center gap-8 px-4 w-full max-w-md text-center">
          <div className="space-y-3">
            <h3
              className="font-bold text-white italic"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}
            >
              Pronto para o Próximo Nível?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>
              Realize seu check-in agora e comece sua jornada.
            </p>
          </div>
          <div className="w-full">{ctaContent}</div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: 0.5 }}>
          <span className="text-[9px] text-white uppercase tracking-[0.35em] font-bold">Scroll</span>
          <div className="w-[1px] h-14 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="w-full h-full bg-white animate-scroll-line" />
          </div>
        </div>
      </div>
    </div>
  );
};
