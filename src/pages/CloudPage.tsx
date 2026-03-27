import React, { useEffect, useState, useRef, useCallback } from 'react';
import cloud from 'd3-cloud';
import { Layout, GradientInput, GlassCard } from '../components/LayoutComponents';
import { isWordAllowed, normalizeWord } from '../utils/wordModeration';
import { getWords, addWord } from '../utils/api';
import { toast } from "sonner";
import { Send } from 'lucide-react';

interface WordData {
  text: string;
  value: number;
}

interface CloudWord {
  text?: string;
  size?: number;
  x?: number;
  y?: number;
}

const CloudPage = () => {
  const [words, setWords] = useState<WordData[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchWords = useCallback(async () => {
    try {
      const data = await getWords();
      const freq: Record<string, number> = {};
      data.forEach(item => {
        freq[item.text] = (freq[item.text] || 0) + 1;
      });
      setWords(Object.keys(freq).map(k => ({
        text: k,
        value: Math.min(freq[k] * 12 + 18, 80)
      })));
    } catch (error) {
      console.error("Error fetching words:", error);
    }
  }, []);

  useEffect(() => {
    fetchWords();
    const interval = setInterval(fetchWords, 5000); // Polling every 5s for updates
    return () => clearInterval(interval);
  }, [fetchWords]);

  useEffect(() => {
    if (!words.length || !svgRef.current) return;

    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const colors = [
      "hsl(195, 100%, 50%)",
      "hsl(347, 78%, 60%)",
      "hsl(280, 70%, 55%)",
      "hsl(195, 100%, 40%)",
      "hsl(347, 70%, 50%)"
    ];

    const layout = cloud<{ text: string; size: number }>()
      .size([700, 300])
      .words(words.map(d => ({ text: d.text, size: d.value })))
      .padding(8)
      .rotate(() => (Math.random() > 0.8 ? 90 : 0))
      .font("Inter")
      .fontSize((d) => d.size || 20)
      .on("end", (drawnWords: CloudWord[]) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", "translate(350,150)");
        svg.appendChild(g);

        drawnWords.forEach((w, i) => {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("transform", `translate(${w.x || 0},${w.y || 0}) rotate(${Math.random() > 0.8 ? 90 : 0})`);
          text.style.fontSize = `${w.size || 20}px`;
          text.style.fontFamily = "Inter, sans-serif";
          text.style.fontWeight = "700";
          text.style.fill = colors[i % colors.length];
          text.style.cursor = "default";
          text.textContent = w.text || '';
          g.appendChild(text);
        });
      });

    layout.start();
  }, [words]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = newWord.trim();

    if (!trimmedWord) return;

    if (trimmedWord.includes(' ')) {
      toast.error("Envie apenas uma palavra por vez.");
      return;
    }

    if (!isWordAllowed(trimmedWord)) {
      toast.error("Palavra não permitida.");
      setNewWord("");
      return;
    }

    setLoading(true);

    try {
      await addWord(normalizeWord(trimmedWord));
      toast.success("Palavra enviada!");
      setNewWord("");
      await fetchWords(); // Refresh immediately
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("Erro ao enviar palavra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showLogo={false}>
      <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Nuvem de Palavras
          </h2>
          <p className="text-muted-foreground">
            Envie uma palavra que representa sua experiência!
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto px-2">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-grow">
              <GradientInput
                placeholder="Digite uma palavra..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newWord.trim()}
              className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl text-white font-black 
                bg-gradient-to-r from-primary to-secondary
                hover:brightness-110 hover:scale-[1.03] transition-all duration-300 
                shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Word Cloud Display */}
        <GlassCard className="min-h-[200px] sm:min-h-[300px]">
          <div className="flex items-center justify-center h-full min-h-[180px] sm:min-h-[250px]">
            {words.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p className="text-xl mb-2">Nenhuma palavra ainda</p>
                <p className="text-sm">Seja o primeiro a contribuir!</p>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 700 300"
                className="w-full h-auto max-h-[300px]"
              />
            )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default CloudPage;
