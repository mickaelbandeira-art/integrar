import React, { useState, useEffect, useRef } from 'react';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { toast } from 'sonner';
import { Settings, RefreshCw, Trash2 } from 'lucide-react';

interface DrawResult {
    number: number;
    timestamp: Date;
    id: string; // unique id for key
}

const Sorteio = () => {
    const [min, setMin] = useState<number>(1);
    const [max, setMax] = useState<number>(90);
    const [count, setCount] = useState<number>(1);

    const [noRepeat, setNoRepeat] = useState<boolean>(true);
    const [animationEnabled, setAnimationEnabled] = useState<boolean>(true);

    const [history, setHistory] = useState<DrawResult[]>([]);
    const [usedNumbers, setUsedNumbers] = useState<Set<number>>(new Set());

    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [displayNumber, setDisplayNumber] = useState<number | null>(null);

    // Audio refs for sound effects (optional expansion)

    const handleDraw = () => {
        if (min >= max) {
            toast.error('O número mínimo deve ser menor que o máximo.');
            return;
        }

        const availableNumbers = [];
        for (let i = min; i <= max; i++) {
            if (!noRepeat || !usedNumbers.has(i)) {
                availableNumbers.push(i);
            }
        }

        if (availableNumbers.length < count) {
            toast.error('Não há números suficientes disponíveis para sortear.');
            return;
        }

        setIsDrawing(true);

        // Animation Logic
        if (animationEnabled) {
            let duration = 2000; // 2 seconds
            const intervalTime = 50;
            let elapsed = 0;

            const interval = setInterval(() => {
                // Show random available number during animation
                const randomTemp = Math.floor(Math.random() * (max - min + 1)) + min;
                setDisplayNumber(randomTemp);
                elapsed += intervalTime;

                if (elapsed >= duration) {
                    clearInterval(interval);
                    finalizeDraw(availableNumbers);
                }
            }, intervalTime);
        } else {
            finalizeDraw(availableNumbers);
        }
    };

    const finalizeDraw = (available: number[]) => {
        const newResults: DrawResult[] = [];
        const newUsed = new Set(usedNumbers);
        let currentAvailable = [...available];

        for (let i = 0; i < count; i++) {
            if (currentAvailable.length === 0) break;

            const randomIndex = Math.floor(Math.random() * currentAvailable.length);
            const drawnNumber = currentAvailable[randomIndex];

            newResults.push({
                number: drawnNumber,
                timestamp: new Date(),
                id: crypto.randomUUID()
            });

            if (noRepeat) {
                newUsed.add(drawnNumber);
                // Remove from current available to avoid duplicate valid draw in same batch if allowRepeat is false
                // But if we want to allow repeats within the SAME batch but not across history? 
                // Usually "No Repeat" means globally unique until reset.
                currentAvailable.splice(randomIndex, 1);
            }
        }

        setUsedNumbers(newUsed);
        setHistory(prev => [...newResults.reverse(), ...prev]); // Add new results to top
        setDisplayNumber(null);
        setIsDrawing(false);
        toast.success(`${newResults.length} número(s) sorteado(s)!`);
    };

    const resetGame = () => {
        setHistory([]);
        setUsedNumbers(new Set());
        setDisplayNumber(null);
        toast.info('Histórico e números sorteados reiniciados.');
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `há ${diffInSeconds} segundos`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `há ${diffInHours} horas`;
    };

    return (
        <Layout>
            <div className="w-full max-w-2xl mx-auto space-y-6 pb-24 animate-fade-in">

                {/* Configuration Card */}
                <GlassCard className="overflow-visible">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">Sortear</span>

                        <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-[hsl(195,100%,55%)] to-[hsl(347,78%,60%)] w-20">
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                            />
                        </div>

                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">número(s) entre</span>

                        <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-[hsl(195,100%,55%)] to-[hsl(347,78%,60%)] w-24">
                            <input
                                type="number"
                                value={min}
                                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                                className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                            />
                        </div>

                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">e</span>

                        <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-[hsl(195,100%,55%)] to-[hsl(347,78%,60%)] w-24">
                            <input
                                type="number"
                                value={max}
                                onChange={(e) => setMax(parseInt(e.target.value) || 100)}
                                className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Animation Display Overlay */}
                {isDrawing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-9xl font-black text-white animate-pulse drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                            {displayNumber}
                        </div>
                    </div>
                )}

                {/* Results Area */}
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-xl">Nenhum número sorteado ainda.</p>
                        </div>
                    ) : (
                        history.map((item, index) => (
                            <div key={item.id} className="animate-scale-in">
                                <div className={`
                    relative p-[2px] rounded-xl overflow-hidden
                    ${index === 0 ? 'bg-gradient-to-r from-[hsl(195,100%,55%)] to-[hsl(347,78%,60%)] shadow-xl scale-105 my-6' : 'bg-white/10 dark:bg-white/5 border border-white/20'}
                  `}>
                                    <div className={`${index === 0 ? 'bg-gray-900' : 'bg-transparent'} rounded-[10px] p-6 flex flex-col items-center justify-center`}>
                                        <span className={`font-black ${index === 0 ? 'text-6xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent' : 'text-4xl text-gray-600 dark:text-gray-300'}`}>
                                            {item.number}
                                        </span>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                                            <span className="font-bold">{history.length - index}º resultado</span>
                                            <span>•</span>
                                            <span>{formatTimeAgo(item.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Settings Toggles */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 p-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${animationEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${animationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            checked={animationEnabled}
                            onChange={(e) => setAnimationEnabled(e.target.checked)}
                            className="hidden"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-200">Animação contagem regressiva</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${noRepeat ? 'bg-blue-500' : 'bg-gray-600'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${noRepeat ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            checked={noRepeat}
                            onChange={(e) => setNoRepeat(e.target.checked)}
                            className="hidden"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-200">Não repetir número</span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                    <GradientButton
                        text={isDrawing ? "Sorteando..." : "Sortear de novo >"}
                        onClick={handleDraw}
                        disabled={isDrawing}
                        variant="primary"
                        className="text-xl py-6"
                    />

                    {history.length > 0 && (
                        <button
                            onClick={resetGame}
                            className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Limpar histórico e reiniciar
                        </button>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default Sorteio;
