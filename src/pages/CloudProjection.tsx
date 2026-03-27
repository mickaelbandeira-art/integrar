import React, { useEffect, useState, useRef, useCallback } from 'react';
import cloud from 'd3-cloud';
import { getWords } from '../utils/api';

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

            // Increased scaling for projection
            setWords(Object.keys(freq).map(k => ({
                text: k,
                value: Math.min(freq[k] * 30 + 40, 200)
            })));
        } catch (error) {
            console.error("Error fetching words:", error);
        }
    }, []);

    useEffect(() => {
        fetchWords();
        const interval = setInterval(fetchWords, 5000);
        return () => clearInterval(interval);
    }, [fetchWords]);

    useEffect(() => {
        if (!words.length || !svgRef.current) return;

        const svg = svgRef.current;
        // Make sure SVG has correct viewbox
        svg.setAttribute("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const w = dimensions.width;
        const h = dimensions.height;

        const colors = [
            "hsl(208, 74%, 40%)", // AeC Blue
            "hsl(46, 100%, 47%)",  // AeC Gold
            "hsl(210, 100%, 25%)", // Dark Blue
            "hsl(200, 100%, 55%)", // Light Blue
            "hsl(210, 100%, 35%)", // Mid Blue
            "hsl(46, 100%, 40%)"   // Dark Gold
        ];

        const layout = cloud<{ text: string; size: number }>()
            .size([w, h])
            .words(words.map(d => ({ text: d.text, size: d.value })))
            .padding(20)
            .rotate(() => (Math.random() > 0.6 ? 90 : 0))
            .font("Inter")
            .fontSize((d) => d.size || 20)
            .on("end", (drawnWords: CloudWord[]) => {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

                // D3 positions relative to center, so we translate the group to the center
                g.setAttribute("transform", `translate(${w / 2},${h / 2})`);
                svg.appendChild(g);

                drawnWords.forEach((w, i) => {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("text-anchor", "middle");

                    const x = w.x ?? 0;
                    const y = w.y ?? 0;
                    const rotate = w.rotate ?? 0;
                    const size = w.size ?? 20;

                    text.setAttribute("transform", `translate(${x},${y}) rotate(${rotate})`);
                    text.style.fontSize = `${size}px`;
                    text.style.fontFamily = "Inter, sans-serif";
                    text.style.fontWeight = "800";
                    text.style.fill = colors[i % colors.length];
                    text.style.cursor = "default";
                    text.textContent = w.text || '';

                    // Simple entrance animation
                    text.style.opacity = "0";
                    text.style.animation = "fadeIn 0.5s ease-out forwards";
                    text.style.animationDelay = `${i * 0.05}s`;

                    g.appendChild(text);
                });
            });

        layout.start();
    }, [words, dimensions]);

    return (
        <div className="fixed inset-0 w-screen h-screen bg-white dark:bg-black overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-gray-900 dark:to-gray-800 -z-10" />

            {words.length === 0 ? (
                <div className="text-center animate-pulse">
                    <h1 className="text-5xl font-bold text-gray-300">Aguardando palavras...</h1>
                    <p className="text-2xl text-gray-300 mt-4">Participe enviando a sua!</p>
                </div>
            ) : (
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    style={{ overflow: 'visible' }}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default CloudProjection;
