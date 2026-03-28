import React, { useEffect, useState, useRef, useCallback } from 'react';
import cloud from 'd3-cloud';
import { getWords } from '../utils/api';
import { gsap } from 'gsap';

interface WordData {
    text: string;
    value: number;
}

interface CloudWord {
    text?: string;
    size?: number;
    x?: number;
    y?: number;
    rotate?: number;
}

const CloudProjection = () => {
    const [words, setWords] = useState<WordData[]>([]);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchWords = useCallback(async () => {
        try {
            const data = await getWords();
            const freq: Record<string, number> = {};
            data.forEach(item => {
                freq[item.text] = (freq[item.text] || 0) + 1;
            });

            // Improved scaling for professional projection
            // We use a base size + weight, and scale based on window height to ensure it fits
            const baseSize = dimensions.height / 15;
            const newWords = Object.keys(freq).map(k => ({
                text: k,
                value: Math.min(freq[k] * (baseSize / 2) + baseSize, dimensions.height / 4)
            }));
            
            setWords(newWords);
        } catch (error) {
            console.error("Error fetching words:", error);
        }
    }, [dimensions.height]);

    useEffect(() => {
        fetchWords();
        const interval = setInterval(fetchWords, 5000);
        return () => clearInterval(interval);
    }, [fetchWords]);

    useEffect(() => {
        if (!words.length || !svgRef.current) return;

        const svg = svgRef.current;
        const w = dimensions.width;
        const h = dimensions.height;

        // Clear previous content
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const colors = [
            "#005492", // AeC Deep Blue
            "#f0b800", // AeC Gold
            "#0077c8", // Brighter Blue
            "#003d66", // Darker Blue
            "#d4a017", // Metallic Gold
            "#1a6ab0"  // Primary Blue
        ];

        const layout = cloud<{ text: string; size: number }>()
            .size([w * 0.9, h * 0.9]) // Use 90% of screen to prevent clipping
            .words(words.map(d => ({ text: d.text, size: d.value })))
            .padding(25) // Higher padding to prevent visual overlap
            .rotate(() => (Math.random() > 0.8 ? 90 : 0)) // Less rotating for better readability
            .font("Inter")
            .fontSize((d) => d.size || 20)
            .on("end", (drawnWords: CloudWord[]) => {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("transform", `translate(${w / 2},${h / 2})`);
                svg.appendChild(g);

                drawnWords.forEach((w, i) => {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("text-anchor", "middle");
                    
                    const x = w.x ?? 0;
                    const y = w.y ?? 0;
                    const rotate = w.rotate ?? 0;
                    const size = w.size ?? 20;

                    // Apply layout attributes (but not the transform yet, GSAP handles that)
                    text.style.fontSize = `${size}px`;
                    text.style.fontFamily = "'Inter', sans-serif";
                    text.style.fontWeight = "900";
                    text.style.fill = colors[i % colors.length];
                    text.style.cursor = "default";
                    text.textContent = w.text || '';
                    text.style.opacity = "0";
                    
                    // Filter for a subtle drop shadow to make it pop
                    text.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.1))";

                    g.appendChild(text);

                    // GSAP ENTRANCE ANIMATION
                    // We pulse from center then move to final position
                    gsap.fromTo(text, 
                        { 
                            opacity: 0, 
                            scale: 0,
                            attr: { transform: `translate(0, 0) rotate(0)` }
                        }, 
                        { 
                            opacity: 1, 
                            scale: 1,
                            attr: { transform: `translate(${x}, ${y}) rotate(${rotate})` },
                            duration: 1.2, 
                            delay: i * 0.03,
                            ease: "elastic.out(1, 0.75)",
                            onComplete: () => {
                                // Add a subtle floating animation after entrance
                                gsap.to(text, {
                                    y: `+=${Math.random() * 10 - 5}`,
                                    x: `+=${Math.random() * 10 - 5}`,
                                    duration: 3 + Math.random() * 2,
                                    repeat: -1,
                                    yoyo: true,
                                    ease: "sine.inOut"
                                });
                            }
                        }
                    );
                });
            });

        layout.start();
    }, [words, dimensions]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-[#f8faff] dark:bg-[#050a15] overflow-hidden flex items-center justify-center">
            {/* Professional Background with subtle depth */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-primary/3 rounded-full blur-[80px]" />
            </div>

            {words.length === 0 ? (
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full blur-xl" />
                        <h1 className="relative text-5xl md:text-7xl font-black text-primary/20 tracking-tighter uppercase italic select-none">
                            Nuvem de Palavras
                        </h1>
                    </div>
                    <p className="text-2xl text-muted-foreground/60 font-medium animate-pulse">
                        Aguardando as primeiras contribuições...
                    </p>
                </div>
            ) : (
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    className="w-full h-full"
                    style={{ overflow: 'visible' }}
                />
            )}
            
            {/* Event Branding corner */}
            <div className="absolute bottom-10 right-10 flex items-center gap-4 opacity-30 select-none">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="text-sm font-black tracking-[0.2em] text-primary uppercase">AeC Integrar</span>
            </div>
        </div>
    );
};

export default CloudProjection;

