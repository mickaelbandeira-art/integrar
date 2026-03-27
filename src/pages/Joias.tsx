import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GlassCard, GradientButton } from '../components/LayoutComponents';
import { getCurrentUser, saveJewelChoice } from '../utils/api';
import { toast } from 'sonner';

// Import images
// Import images
import imgAlma from '../assets/joias/tempo.jpg';
import imgRealidade from '../assets/joias/realidade.jpg';
// Remapped based on user validation (Rev 2 - Swapped Alma/Espaco):
import imgTempo from '../assets/joias/mente.jpg';
import imgEspaco from '../assets/joias/alma.jpg';
import imgMente from '../assets/joias/poder.jpg';
import imgPoder from '../assets/joias/espaco.jpg';

const jewels = [
    {
        id: 'alma',
        name: 'Joia da Alma',
        image: imgAlma,
        category: 'Cultura & Valores AeC',
        description: [
            "Eu aprendi cedo que resultado sem valor vira número.",
            "E valor sem resultado vira discurso.",
            "A carreira começa a desandar quando a gente abre mão de quem é pra chegar mais rápido."
        ],
        color: 'from-orange-400 to-yellow-500' // Example colors for UI accents
    },
    {
        id: 'poder',
        name: 'Joia do Poder',
        image: imgPoder,
        category: 'Aprendizado & Inovação',
        description: [
            "O verdadeiro poder na operação não é saber tudo.",
            "É aprender mais rápido do que o problema cresce."
        ],
        color: 'from-primary to-accent'
    },
    {
        id: 'realidade',
        name: 'Joia da Realidade',
        image: imgRealidade,
        category: 'Flexibilidade & Criatividade',
        description: [
            "Planejamento é importante.",
            "Mas a realidade sempre chega antes do PowerPoint."
        ],
        color: 'from-red-500 to-pink-600'
    },
    {
        id: 'tempo',
        name: 'Joia do Tempo',
        image: imgTempo,
        category: 'Gestão do Tempo & Constância',
        description: [
            "Carreira não é sobre sprint.",
            "É sobre fôlego.",
            "Quem acelera demais, geralmente para antes."
        ],
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'espaco',
        name: 'Joia do Espaço',
        image: imgEspaco,
        category: 'Conexão & Colaboração',
        description: [
            "Autoridade vem do cargo.",
            "Mas influência… influência vem da relação."
        ],
        color: 'from-blue-400 to-cyan-500'
    },
    {
        id: 'mente',
        name: 'Joia da Mente',
        image: imgMente,
        category: 'Protagonismo & Autogestão',
        description: [
            "Ninguém vai cuidar da sua carreira melhor do que você.",
            "Protagonismo começa quando você para de esperar permissão."
        ],
        color: 'from-blue-600 to-indigo-700'
    }
];

const Joias = () => {
    const navigate = useNavigate();
    const [selectedJewel, setSelectedJewel] = useState<typeof jewels[0] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSelect = (jewel: typeof jewels[0]) => {
        setSelectedJewel(jewel);
    };

    const handleConfirm = async () => {
        if (!selectedJewel) return;

        const user = getCurrentUser();
        if (!user) {
            toast.error('Usuário não identificado. Faça check-in novamente.');
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            await saveJewelChoice(user.email, user.matricula, selectedJewel.name);
            toast.success(`Você escolheu a ${selectedJewel.name}!`);
            // Optionally save to local storage to show in menu immediately without fetching?
            // For now, relies on fetching in Menu or navigation
            navigate('/menu');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar sua escolha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in px-4">

                <div className="text-center mb-8 space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(315,100%,50%)] to-[hsl(347,78%,60%)]">
                        Escolha sua Joia
                    </h1>
                    <p className="text-foreground/80">
                        Selecione a joia que mais conecta com seu momento atual e que você precisa melhorar ou ter mais oportunidade?
                    </p>
                </div>

                {/* Grid of Jewels */}
                {!selectedJewel ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {jewels.map((jewel) => (
                            <div
                                key={jewel.id}
                                onClick={() => handleSelect(jewel)}
                                className="cursor-pointer hover:scale-105 transition-transform duration-300 h-full"
                            >
                                <GlassCard
                                    className="h-full border-2 border-transparent hover:border-[hsl(315,100%,75%)]"
                                >
                                    <div className="flex flex-col items-center w-full">
                                        <div className="relative w-28 h-28 mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                            <img
                                                src={jewel.image}
                                                alt={jewel.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="font-bold text-sm md:text-base text-foreground text-center">{jewel.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">{jewel.category}</p>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Detail View (Confirmation)
                    <GlassCard className="max-w-md mx-auto p-6 animate-fade-in relative">
                        <button
                            onClick={() => setSelectedJewel(null)}
                            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 z-10"
                        >
                            ← Voltar
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6 w-full">
                            <div className={`w-48 h-48 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]`}>
                                <img
                                    src={selectedJewel.image}
                                    alt={selectedJewel.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="space-y-2">
                                <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${selectedJewel.color}`}>
                                    {selectedJewel.name}
                                </h2>
                                <p className="font-semibold text-foreground/90 uppercase tracking-wide text-sm">
                                    {selectedJewel.category}
                                </p>
                            </div>

                            <div className="space-y-3 text-foreground/80 leading-relaxed italic">
                                {selectedJewel.description.map((line, idx) => (
                                    <p key={idx}>{line}</p>
                                ))}
                            </div>

                            <div className="pt-4 w-full">
                                <GradientButton
                                    text={loading ? "Confirmando..." : "Confirmar Escolha"}
                                    onClick={handleConfirm}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </GlassCard>
                )}

            </div>
        </Layout>
    );
};

export default Joias;
