import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollCompositionProps {
  imageFront: string;
  imageBack: string;
  title: string;
  subtitle: string;
  description: string;
  scrollDistance?: string;
}

export const ScrollComposition: React.FC<ScrollCompositionProps> = ({
  imageFront,
  imageBack,
  title,
  subtitle,
  description,
  scrollDistance = "300vh"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !containerRef.current) return;

    const ctx = gsap.context((self) => {
      if (!self.selector) return;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Professional Initial States: Softer and closer
      gsap.set(self.selector(".comp-title"), { y: 40, opacity: 0 });
      gsap.set(self.selector(".comp-para"), { y: 20, opacity: 0 });
      gsap.set(self.selector(".comp-stats"), { opacity: 0, scale: 0.95 });
      gsap.set(self.selector(".comp-img-back"), { 
        clipPath: "inset(0% 100% 0% 0%)", 
        scale: 1.1,
        opacity: 0,
        filter: "brightness(1.5) blur(10px)"
      });
      gsap.set(self.selector(".comp-img-front"), { 
        clipPath: "inset(0% 0% 0% 100%)",
        x: 40,
        scale: 1.05,
        opacity: 0 
      });

      // Liquid Entrance: Reveal entire container with blur
      tl.fromTo(containerRef.current, 
        { opacity: 0, filter: "blur(10px)", y: 50 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 3, ease: "power2.out" },
        0
      );

      // Professional Sequence: Liquid & Smooth Unfolding
      tl.to(self.selector(".comp-img-back"), { 
          clipPath: "inset(0% 0% 0% 0%)", 
          opacity: 1, 
          scale: 1, 
          filter: "brightness(1) blur(0px)",
          duration: 5, 
          ease: "sine.inOut" 
        }, 0.5)
        .to(self.selector(".comp-title"), { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2, 
          duration: 3, 
          ease: "power3.out" 
        }, 1.5)
        .to(self.selector(".comp-para"), { 
          y: 0, 
          opacity: 1, 
          duration: 2.5, 
          ease: "sine.out" 
        }, 2.5)
        .to(self.selector(".comp-stats"), { 
          opacity: 1, 
          scale: 1,
          stagger: 0.3, 
          duration: 2,
          ease: "sine.out"
        }, 3.5)
        .to(self.selector(".comp-img-front"), { 
          clipPath: "inset(0% 0% 0% 0%)", 
          x: 0, 
          scale: 1,
          opacity: 1, 
          duration: 5, 
          ease: "sine.inOut" 
        }, 1.5)
        .to(self.selector(".comp-badge"), { 
          scale: 1, 
          opacity: 1, 
          duration: 2.5, 
          ease: "back.out(1.4)",
          rotation: 0
        }, 3)
        
        // ── EXIT PHASE: Cinematic Upward Parallax ──────────────────────
        // Philosophy: Each layer exits at a different speed and Y offset
        // creating depth — text (foreground) is fastest, images are slowest
        // This makes the gallery feel like it's rising up from beneath
        
        // 1. Badge exits first — smallest, fastest
        .to(self.selector(".comp-badge"), {
          y: -120,
          opacity: 0,
          scale: 0.6,
          duration: 3,
          ease: "power3.in"
        }, "-=0.5")

        // 2. Stats exit — upward sweep, staggered
        .to(self.selector(".comp-stats"), {
          y: -100,
          opacity: 0,
          stagger: 0.08,
          duration: 3,
          ease: "power2.in"
        }, "<0.1")

        // 3. Paragraph exits upward
        .to(self.selector(".comp-para"), {
          y: -140,
          opacity: 0,
          filter: "blur(4px)",
          duration: 3.5,
          ease: "power2.in"
        }, "<0.1")

        // 4. Title exits upward — largest text, most dramatic
        .to(self.selector(".comp-title"), {
          y: -200,
          opacity: 0,
          stagger: -0.1, // reverse stagger: last word exits first
          filter: "blur(8px)",
          duration: 4,
          ease: "expo.in"
        }, "<0.1")

        // 5. Front image exits upward — slower than text (parallax depth)
        .to(self.selector(".comp-img-front"), {
          y: -80,
          opacity: 0,
          scale: 0.95,
          filter: "blur(15px)",
          duration: 4.5,
          ease: "power2.in"
        }, "<-0.5")

        // 6. Background image exits last — slowest, most stable (deepest layer)
        .to(self.selector(".comp-img-back"), {
          y: -40,
          opacity: 0,
          scale: 1.04,
          filter: "blur(25px) brightness(1.3)",
          duration: 5,
          ease: "sine.in"
        }, "<0.2");

    }, triggerRef);

    return () => ctx.revert();
  }, [scrollDistance]);

  return (
    <div ref={triggerRef} className="relative w-full overflow-hidden" style={{ background: '#f8f9fc' }}>
      {/* Blue-to-white gradient bridge from Hero */}
      <div className="absolute inset-x-0 top-0 h-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #003f7a 0%, transparent 100%)' }} />
      <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center px-4 py-20" style={{ background: '#f8f9fc' }}>
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center relative">
          
          {/* Left Side: Content */}
          <div className="space-y-10 z-20">
            <div className="space-y-6">
              <div className="overflow-hidden">
                <span className="comp-stats block text-primary font-bold tracking-[0.4em] text-xs uppercase opacity-80 mb-2">
                  {subtitle}
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-heading font-black text-foreground tracking-tighter leading-[0.8] flex flex-wrap gap-x-4">
                {title.split(' ').map((word, i) => (
                  <div key={i} className="overflow-hidden decoration-none">
                    <span className={`comp-title inline-block ${i % 2 !== 0 ? 'text-primary' : ''}`}>
                      {word}
                    </span>
                  </div>
                ))}
              </h2>
            </div>
            
            <div className="overflow-hidden">
              <p className="comp-para text-xl text-muted-foreground leading-relaxed max-w-lg">
                {description}
              </p>
            </div>

            <div className="flex gap-12 pt-8">
              <div className="comp-stats space-y-1">
                <div className="text-5xl font-black text-foreground">22+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">ANOS DE LIDERANÇA</div>
              </div>
              <div className="comp-stats w-px h-16 bg-muted-foreground/20" />
              <div className="comp-stats space-y-1">
                <div className="text-5xl font-black text-foreground">50k+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">TALENTOS INTEGRADOS</div>
              </div>
            </div>
          </div>

          {/* Right Side: Image Composition */}
          <div className="relative h-[600px] md:h-[800px] w-full flex items-center justify-end">
            {/* Background Image */}
            <div className="comp-img-back absolute top-0 right-0 w-full h-[90%] rounded-[3.5rem] overflow-hidden shadow-2xl border-[16px] border-white z-0">
              <img 
                src={imageBack} 
                alt="Background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
            </div>

            {/* Front Overlapping Image */}
            <div className="comp-img-front absolute -bottom-12 -left-12 w-3/4 aspect-square rounded-[3rem] overflow-hidden shadow-[-40px_40px_100px_rgba(0,0,0,0.5)] z-10 border-[8px] border-white">
              <img 
                src={imageFront} 
                alt="Front" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Badge (Decorative) */}
            <div className="comp-badge opacity-0 scale-50 absolute top-10 -right-12 w-40 h-40 bg-primary flex items-center justify-center rounded-full text-white font-black text-center text-sm tracking-tighter shadow-2xl z-30 -rotate-12 border-4 border-white">
              EXPERIÊNCIA<br />PREMIUM
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
