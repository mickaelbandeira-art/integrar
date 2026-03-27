import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
}

const galleryData: GalleryItem[] = [
  { id: 1,  image: "/1.JPG",  title: "Colaboração Criativa",   category: "EQUIPE"      },
  { id: 2,  image: "/2.JPG",  title: "Inovação Digital",       category: "TECNOLOGIA"  },
  { id: 3,  image: "/3.JPG",  title: "Conexões Reais",         category: "NETWORKING"  },
  { id: 4,  image: "/4.JPG",  title: "Infraestrutura AeC",     category: "AMBIENTE"    },
  { id: 5,  image: "/5.JPG",  title: "Cultura e Valores",      category: "NOSSO DNA"   },
  { id: 6,  image: "/6.JPG",  title: "Momentos Integrar",      category: "EVENTO"      },
  { id: 7,  image: "/7.JPG",  title: "Palco Principal",        category: "DESTAQUE"    },
  { id: 8,  image: "/8.JPG",  title: "Nossa Comunidade",       category: "COMUNIDADE"  },
  { id: 9,  image: "/9.JPG",  title: "Experiência AeC",        category: "EXPERIÊNCIA" },
  { id: 10, image: "/10.JPG", title: "O Próximo Capítulo",     category: "FUTURO"      },
];

export const ScrollGallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [imagesLoaded, setImagesLoaded] = React.useState(0);
  const totalImages = galleryData.length;
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || !galleryRef.current || isInitialized.current) return;
    
    // Only proceed if all images are loaded
    if (imagesLoaded < totalImages) return;
    
    isInitialized.current = true;

    const ctx = gsap.context(() => {
      // Small timeout to ensure DOM layout is truly finished
      setTimeout(() => {
        if (!galleryRef.current || !sectionRef.current) return;
        
        const totalWidth = galleryRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        const xMove = -(totalWidth - windowWidth);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalWidth * 0.75}`, // Increased end for smoother exit
            pin: true,
            scrub: 1.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }
        });

        tl.to(galleryRef.current, {
          x: xMove,
          ease: "none",
          duration: 10
        }, 0);

        gsap.utils.toArray<HTMLElement>('.gallery-card').forEach((card, i) => {
          gsap.fromTo(card,
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
              }
            }
          );
        });

        gsap.to(labelRef.current, {
          x: xMove * 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalWidth * 0.8}`,
            scrub: 2,
          }
        });

        ScrollTrigger.refresh();
      }, 100);
    }, sectionRef);

    return () => ctx.revert();
  }, [imagesLoaded, totalImages]);

  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden bg-[#f0ede8]" style={{ height: '100vh' }}>
      {/* Floating Label — faint background text, drifts with scroll */}
      <div ref={labelRef} className="absolute top-10 left-5 md:left-10 z-10 pointer-events-none">
        <h2 className="text-[14vw] sm:text-[10vw] md:text-[8vw] font-black uppercase tracking-tighter text-black/[0.06] leading-none select-none">
          MOMENTOS <br />INTEGRAR
        </h2>
      </div>

      {/* Section header — visible, editorial style */}
      <div className="absolute top-10 right-10 z-20 text-right pointer-events-none">
        <p className="text-xs uppercase tracking-[0.3em] text-black/30 font-bold mb-1">Galeria Cinética</p>
        <div className="w-8 h-[2px] bg-black/20 ml-auto" />
      </div>

      {/* Gallery Track */}
      <div className="flex items-stretch min-h-screen py-24">
        <div
          ref={galleryRef}
          className="flex gap-4 sm:gap-5 items-stretch flex-nowrap pl-[10vw] pr-[40vw] sm:pr-[30vw]"
          style={{ willChange: 'transform' }}
        >
          {galleryData.map((item, index) => (
            <div
              key={item.id}
              className={`gallery-card relative flex-shrink-0 group cursor-pointer
                ${index % 2 === 0 ? 'self-start mt-10 md:mt-16' : 'self-end mb-10 md:mb-16'}
              `}
              style={{ width: 'clamp(240px, 28vw, 420px)' }}
            >
              {/* Card — Aeolla vertical portrait format */}
              <div className="relative w-full overflow-hidden rounded-3xl shadow-xl"
                style={{ aspectRatio: '3/4' }}>
            <img
                  src={item.image}
                  alt={item.title}
                  onLoad={() => setImagesLoaded(prev => prev + 1)}
                  onError={() => setImagesLoaded(prev => prev + 1)}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Text reveal on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-4
                  group-hover:translate-y-0 transition-transform duration-500 opacity-0
                  group-hover:opacity-100">
                  <span className="text-white/60 text-xs font-bold tracking-[0.25em] uppercase block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-white text-xl font-bold leading-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Category pill — always visible */}
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm
                  px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-black/70 uppercase">
                  {item.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
