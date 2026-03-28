import React, { useState, useEffect, useCallback } from 'react';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { toast } from 'sonner';
import { Settings, RefreshCw, Trash2, Users, Hash } from 'lucide-react';
import { getCheckins, Checkin } from '../utils/api';

type RaffleMode = 'numbers' | 'participants';

interface DrawResult {
    number?: number;
    participant?: Checkin;
    timestamp: Date;
    id: string; // unique id for key
}

const Sorteio = () => {
    const [mode, setMode] = useState<RaffleMode>('numbers');
    const [min, setMin] = useState<number>(1);
    const [max, setMax] = useState<number>(90);
    const [count, setCount] = useState<number>(1);

    const [noRepeat, setNoRepeat] = useState<boolean>(true);
    const [animationEnabled, setAnimationEnabled] = useState<boolean>(true);

    const [history, setHistory] = useState<DrawResult[]>([]);
    const [usedEntries, setUsedEntries] = useState<Set<string | number>>(new Set());
    const [availableParticipants, setAvailableParticipants] = useState<Checkin[]>([]);

    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [displayValue, setDisplayValue] = useState<string | number | null>(null);

    // Initial Fetch for participants
    const fetchParticipants = useCallback(async () => {
        try {
            const data = await getCheckins();
            // Filter out duplicate check-ins by the same email/name
            const uniqueMap = new Map();
            data.forEach(c => {
                const key = c.matricula || c.user_email || c.user_name;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, c);
                }
            });
            setAvailableParticipants(Array.from(uniqueMap.values()));
        } catch (error) {
            console.error("Error fetching participants:", error);
            toast.error("Erro ao carregar lista de participantes.");
        }
    }, []);

    useEffect(() => {
        if (mode === 'participants') {
            fetchParticipants();
        }
    }, [mode, fetchParticipants]);

    const handleDraw = () => {
        if (mode === 'numbers') {
            if (min >= max) {
                toast.error('O número mínimo deve ser menor que o máximo.');
                return;
            }

            const pool = [];
            for (let i = min; i <= max; i++) {
                if (!noRepeat || !usedEntries.has(i)) {
                    pool.push(i);
                }
            }

            if (pool.length < count) {
                toast.error('Não há números suficientes disponíveis para sortear.');
                return;
            }

            startAnimation(pool);
        } else {
            // Participant Mode
            const pool = availableParticipants.filter(p => {
                const key = p.id || p.user_name;
                return !noRepeat || !usedEntries.has(key);
            });

            if (pool.length === 0) {
                toast.error('Todos os participantes já foram sorteados ou lista vazia.');
                return;
            }

            if (pool.length < count) {
                toast.error('Não há participantes suficientes para a quantidade solicitada.');
                return;
            }

            startAnimation(pool);
        }
    };

    const startAnimation = (pool: any[]) => {
        setIsDrawing(true);

        if (animationEnabled) {
            let duration = 2500;
            const intervalTime = 80;
            let elapsed = 0;

            const interval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * pool.length);
                const randomItem = pool[randomIndex];
                
                if (mode === 'numbers') {
                    setDisplayValue(randomItem);
                } else {
                    setDisplayValue(randomItem.user_name);
                }
                
                elapsed += intervalTime;

                if (elapsed >= duration) {
                    clearInterval(interval);
                    finalizeDraw(pool);
                }
            }, intervalTime);
        } else {
            finalizeDraw(pool);
        }
    };

    const finalizeDraw = (pool: any[]) => {
        const newResults: DrawResult[] = [];
        const newUsed = new Set(usedEntries);
        let currentPool = [...pool];

        for (let i = 0; i < count; i++) {
            if (currentPool.length === 0) break;

            const randomIndex = Math.floor(Math.random() * currentPool.length);
            const drawnItem = currentPool[randomIndex];

            if (mode === 'numbers') {
                newResults.push({
                    number: drawnItem,
                    timestamp: new Date(),
                    id: crypto.randomUUID()
                });
                if (noRepeat) newUsed.add(drawnItem);
            } else {
                newResults.push({
                    participant: drawnItem,
                    timestamp: new Date(),
                    id: crypto.randomUUID()
                });
                if (noRepeat) newUsed.add(drawnItem.id || drawnItem.user_name);
            }

            currentPool.splice(randomIndex, 1);
        }

        setUsedEntries(newUsed);
        setHistory(prev => [...newResults.reverse(), ...prev]);
        setDisplayValue(null);
        setIsDrawing(false);
        toast.success(`${newResults.length} sorteado(s) com sucesso!`);
    };

    const resetGame = () => {
        setHistory([]);
        setUsedEntries(new Set());
        setDisplayValue(null);
        toast.info('Sorteio reiniciado.');
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return `agora`;
        return `há ${Math.floor(diffInSeconds / 60)}m`;
    };

    return (
        <Layout>
            <div className="w-full max-w-2xl mx-auto space-y-6 pb-24 animate-fade-in px-4">
                
                {/* Raffle Mode Toggle */}
                <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md mb-8">
                    <button
                        onClick={() => { resetGame(); setMode('numbers'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${mode === 'numbers' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Hash className="w-5 h-5" />
                        <span className="font-bold">Números</span>
                    </button>
                    <button
                        onClick={() => { resetGame(); setMode('participants'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${mode === 'participants' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-bold">Participantes</span>
                    </button>
                </div>

                {/* Configuration Card */}
                <GlassCard className="overflow-visible">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left py-4">
                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">Sortear</span>

                        <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-primary to-secondary w-20">
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                            />
                        </div>

                        {mode === 'numbers' ? (
                            <>
                                <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">número(s) entre</span>
                                <div className="flex items-center gap-3">
                                    <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-primary to-secondary w-24">
                                        <input
                                            type="number"
                                            value={min}
                                            onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                                            className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                                        />
                                    </div>
                                    <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">e</span>
                                    <div className="relative group p-[2px] rounded-lg bg-gradient-to-r from-primary to-secondary w-24">
                                        <input
                                            type="number"
                                            value={max}
                                            onChange={(e) => setMax(parseInt(e.target.value) || 100)}
                                            className="w-full bg-white dark:bg-gray-900 text-center py-2 rounded-md outline-none font-bold text-xl"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white uppercase tracking-wider">Pessoa(s) do Check-in</span>
                                <div className="mt-2 flex items-center gap-2 text-primary font-bold">
                                    <Users className="w-4 h-4" />
                                    <span>{availableParticipants.length} disponíveis</span>
                                    <button onClick={fetchParticipants} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Animation Display Overlay */}
                {isDrawing && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-lg">
                        <div className="text-center px-4 max-w-4xl animate-pulse">
                            <span className="block text-primary font-black text-2xl uppercase tracking-[0.5em] mb-4">Sorteando...</span>
                            <div className="text-5xl sm:text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_50px_rgba(30,144,255,0.6)] leading-tight break-words">
                                {displayValue}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Area */}
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-xl font-medium">Pronto para começar o sorteio!</p>
                        </div>
                    ) : (
                        history.map((item, index) => (
                            <div key={item.id} className="animate-scale-in">
                                <div className={`
                                    relative p-[2px] rounded-2xl overflow-hidden
                                    ${index === 0 ? 'bg-gradient-to-r from-primary via-accent to-secondary shadow-2xl scale-[1.02] sm:scale-105 my-8' : 'bg-white/10 dark:bg-white/5 border border-white/20 opacity-80'}
                                `}>
                                    <div className={`${index === 0 ? 'bg-gray-900 border-none' : 'bg-white/5 dark:bg-black/20'} rounded-[14px] p-6 flex flex-col items-center justify-center`}>
                                        <div className="w-full flex items-center justify-between mb-4 px-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Resultado {history.length - index}º</span>
                                            <span className="text-xs text-gray-400">{formatTimeAgo(item.timestamp)}</span>
                                        </div>
                                        
                                        {item.participant ? (
                                            <div className="text-center">
                                                <span className={`block font-black tracking-tight leading-none ${index === 0 ? 'text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent' : 'text-2xl sm:text-3xl text-gray-700 dark:text-gray-300'}`}>
                                                    {item.participant.user_name}
                                                </span>
                                                <span className="block mt-1 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                                    {item.participant.matricula || item.participant.user_email || 'Participante'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`font-black ${index === 0 ? 'text-7xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent' : 'text-5xl text-gray-600 dark:text-gray-300'}`}>
                                                {item.number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Settings Toggles */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 p-6">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${animationEnabled ? 'bg-primary' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${animationEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            checked={animationEnabled}
                            onChange={(e) => setAnimationEnabled(e.target.checked)}
                            className="hidden"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-200">Efeitos de Transição</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${noRepeat ? 'bg-primary' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${noRepeat ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            checked={noRepeat}
                            onChange={(e) => setNoRepeat(e.target.checked)}
                            className="hidden"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-200">Nomes Únicos</span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                    <GradientButton
                        text={isDrawing ? "Sorteando..." : "Realizar Sorteio"}
                        onClick={handleDraw}
                        disabled={isDrawing}
                        variant="primary"
                        className="text-2xl py-8 shadow-2xl"
                    />

                    {history.length > 0 && (
                        <button
                            onClick={resetGame}
                            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 font-bold transition-all py-3 hover:bg-red-500/10 rounded-xl"
                        >
                            <Trash2 className="w-5 h-5" />
                            Reiniciar Todos os Sorteios
                        </button>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default Sorteio;

