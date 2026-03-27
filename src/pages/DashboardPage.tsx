import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCheckins,
  getEvaluations,
  getAllWords,
  getJewelStats,
  approveWord,
  deleteWord,
  Checkin,
  Evaluation,
  WordEntry
} from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  Download, Lock, Users, Star, RefreshCw, MessageCircle, Check, X, Trash2, Dices, Diamond
} from 'lucide-react';
import { toast } from "sonner";
import { GlassCard, GradientButton } from '../components/LayoutComponents';

type Tab = 'overview' | 'checkins' | 'evaluations' | 'words' | 'jewels';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [currentTab, setCurrentTab] = useState<Tab>('overview');

  const [data, setData] = useState<{
    checkins: Checkin[];
    evaluations: Evaluation[];
    words: WordEntry[];
    jewels: { name: string; count: number }[];
  }>({
    checkins: [],
    evaluations: [],
    words: [],
    jewels: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) fetchData();
  }, [auth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [checkins, evaluations, words, jewels] = await Promise.all([
        getCheckins(),
        getEvaluations(),
        getAllWords(),
        getJewelStats()
      ]);
      setData({ checkins, evaluations, words, jewels });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Hardcoded credentials as requested
    const VALID_EMAIL = "tracktrainingaec@gmail.com";
    const VALID_PWD = "track123456";

    if (email === VALID_EMAIL && pwd === VALID_PWD) {
      setAuth(true);
      toast.success("Login realizado com sucesso");
    } else {
      toast.error("Credenciais inválidas");
    }
  };

  const handleApproveWord = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await approveWord(id, true);
        toast.success("Palavra aprovada!");
      } else {
        await approveWord(id, false);
        toast.info("Palavra ocultada.");
      }
      fetchData(); // Refresh list
    } catch (e) {
      toast.error("Erro ao atualizar palavra.");
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta palavra?")) return;
    try {
      await deleteWord(id);
      toast.success("Palavra excluída.");
      fetchData();
    } catch (e) {
      toast.error("Erro ao excluir palavra.");
    }
  };

  const exportCSV = (type: 'checkins' | 'evaluations') => {
    let csv = "";
    let filename = "";

    if (type === 'checkins') {
      csv = "Nome,Email,Matricula,Data,Latitude,Longitude\n" +
        data.checkins.map(c =>
          `"${c.user_name}","${c.user_email || ''}","${c.matricula}","${new Date(c.created_at || '').toLocaleString('pt-BR')}","${c.latitude || ''}","${c.longitude || ''}"`
        ).join("\n");
      filename = "checkins.csv";
    } else {
      csv = "Nome,Nota,Melhor Momento,Sugestões,Energia,Frase,Data\n" +
        data.evaluations.map(e =>
          `"${e.user_name || ''}","${e.rating_general}","${e.best_moment || ''}","${e.improvements || ''}","${e.team_energy || ''}","${e.phrase_completion || ''}","${new Date(e.created_at || '').toLocaleString('pt-BR')}"`
        ).join("\n");
      filename = "avaliacoes.csv";
    }

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = filename;
    link.click();
    toast.success("Download iniciado!");
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <GlassCard className="w-full max-w-sm text-center">
          <Lock className="mx-auto mb-4 text-secondary" size={48} />
          <h2 className="text-xl font-bold mb-4 text-foreground">Acesso Administrativo</h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg mb-4 bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 rounded-lg mb-4 bg-background/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <GradientButton text="Entrar" onClick={handleLogin} />

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao Início
          </button>
        </GlassCard>
      </div>
    );
  }

  // Derived Stats
  const avgRating = data.evaluations.length > 0
    ? (data.evaluations.reduce((acc, e) => acc + e.rating_general, 0) / data.evaluations.length).toFixed(1)
    : "0";

  const starData = [1, 2, 3, 4, 5].map(s => ({
    name: `${s}★`,
    val: data.evaluations.filter(e => e.rating_general === s).length
  }));

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">Visão geral do evento em tempo real</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition text-foreground"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => navigate('/sorteio')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 transition font-bold flex items-center gap-2 shadow-lg"
              title="Ir para Sorteio"
            >
              <Dices size={20} />
              <span className="hidden sm:inline">Sorteio</span>
            </button>
            <button
              onClick={() => setAuth(false)}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition font-medium"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Star },
            { id: 'checkins', label: 'Check-ins', icon: Users },
            { id: 'evaluations', label: 'Avaliações', icon: MessageCircle },
            { id: 'words', label: 'Moderação', icon: Check },
            { id: 'jewels', label: 'Joias', icon: Dices }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as Tab)}
              className={`flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl font-bold transition-all text-xs md:text-sm lg:text-base
                ${currentTab === tab.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-[1.02]"
                  : "bg-card text-muted-foreground hover:bg-card/80"}`}
            >
              <tab.icon size={18} className="shrink-0" /> <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {currentTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-muted-foreground font-medium">Total Check-ins</p>
                  <Users className="text-primary" size={20} />
                </div>
                <h3 className="text-4xl font-bold text-foreground">{data.checkins.length}</h3>
              </GlassCard>

              <GlassCard className="border-l-4 border-l-secondary">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-muted-foreground font-medium">Avaliações</p>
                  <Star className="text-secondary" size={20} />
                </div>
                <h3 className="text-4xl font-bold text-foreground">{data.evaluations.length}</h3>
              </GlassCard>

              <GlassCard className="border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-muted-foreground font-medium">Nota Média</p>
                  <Star className="text-amber-500" size={20} />
                </div>
                <h3 className="text-4xl font-bold text-foreground">{avgRating} / 5.0</h3>
              </GlassCard>
            </div>

            {/* Charts Area */}
            <GlassCard>
              <h3 className="font-bold text-xl mb-6 text-foreground">Distribuição das Notas</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={starData}>
                    <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                      {starData.map((_, i) => (
                        <Cell key={i} fill={i > 2 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* --- CHECKINS TAB --- */}
        {currentTab === 'checkins' && (
          <GlassCard className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground">Lista de Presença</h3>
              <button
                onClick={() => exportCSV('checkins')}
                className="text-sm flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Download size={16} /> Exportar CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-sm">
                    <th className="py-3 font-semibold">Nome</th>
                    <th className="py-3 font-semibold">Matrícula</th>
                    <th className="py-3 font-semibold text-center">Localização</th>
                    <th className="py-3 font-semibold text-right">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.checkins.map(c => (
                    <tr key={c.id} className="hover:bg-muted/50 transition">
                      <td className="py-3">
                        <div className="font-medium text-foreground">{c.user_name}</div>
                        <div className="text-xs text-muted-foreground">{c.user_email}</div>
                      </td>
                      <td className="py-3 text-sm text-foreground">{c.matricula}</td>
                      <td className="py-3 text-center">
                        {c.latitude && c.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition"
                          >
                            Ver Mapa
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {new Date(c.created_at || '').toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {data.checkins.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* --- EVALUATIONS TAB --- */}
        {currentTab === 'evaluations' && (
          <GlassCard className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground">Comentários e Feedbacks</h3>
              <button
                onClick={() => exportCSV('evaluations')}
                className="text-sm flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Download size={16} /> Exportar CSV
              </button>
            </div>

            <div className="grid gap-4">
              {data.evaluations.map(e => (
                <div key={e.id} className="p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all space-y-4">
                  {/* Header: Name & Date */}
                  <div className="flex justify-between items-start border-b border-border/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{e.user_name || 'Anônimo'}</h4>
                        <p className="text-xs text-muted-foreground">Enviado em {new Date(e.created_at || '').toLocaleDateString('pt-BR')} às {new Date(e.created_at || '').toLocaleTimeString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ratings Section */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div className="text-center border-r border-border/30">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Evento</p>
                      <div className="flex justify-center items-center gap-1 text-[hsl(347,78%,60%)]">
                        <span className="text-2xl font-bold">{e.rating_general}</span>
                        <Star size={18} fill="currentColor" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Palestra</p>
                      <div className="flex justify-center items-center gap-1 text-amber-500">
                        <span className="text-2xl font-bold">{e.rating_lecture || '-'}</span>
                        <Star size={18} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {e.team_energy && (
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Energia da Equipe</span>
                        <div className="mt-1 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                          {e.team_energy}
                        </div>
                      </div>
                    )}

                    {e.best_moment && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Melhor Momento</span>
                        <p className="text-foreground/90 text-sm leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/30">
                          {e.best_moment}
                        </p>
                      </div>
                    )}

                    {e.improvements && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sugestão</span>
                        <p className="text-foreground/90 text-sm leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/30">
                          {e.improvements}
                        </p>
                      </div>
                    )}

                    {e.phrase_completion && (
                      <div className="col-span-1 md:col-span-2 mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          <span className="italic">"O evento foi uma oportunidade de..."</span>
                        </p>
                        <blockquote className="border-l-4 border-secondary pl-4 py-1 text-lg font-medium text-foreground/80 italic bg-gradient-to-r from-secondary/5 to-transparent rounded-r-lg">
                          {e.phrase_completion}
                        </blockquote>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {data.evaluations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma avaliação recebida.</p>
              )}
            </div>
          </GlassCard>
        )}

        {/* --- WORDS MODERATION TAB --- */}
        {currentTab === 'words' && (
          <GlassCard className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h3 className="font-bold text-xl text-foreground">Moderação da Nuvem</h3>
              <a
                href="/nuvem-telao"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-black hover:scale-[1.03] transition shadow-lg"
              >
                Abrir Telão da Nuvem
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.words.map(w => (
                <div
                  key={w.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all
                    ${w.approved
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-yellow-500/10 border-yellow-500/20"}`}
                >
                  <p className="text-lg font-bold text-center break-words">{w.text}</p>

                  <div className="flex justify-center gap-2">
                    {!w.approved && (
                      <button
                        onClick={() => handleApproveWord(w.id!, true)}
                        className="p-2 rounded-full bg-green-500 text-white hover:scale-110 transition"
                        title="Aprovar"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {w.approved && (
                      <button
                        onClick={() => handleApproveWord(w.id!, false)}
                        className="p-2 rounded-full bg-yellow-500 text-white hover:scale-110 transition"
                        title="Ocultar"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteWord(w.id!)}
                      className="p-2 rounded-full bg-red-500 text-white hover:scale-110 transition"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {data.words.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma palavra enviada.</p>
            )}
          </GlassCard>
        )}

        {/* --- JEWELS TAB --- */}
        {currentTab === 'jewels' && (
          <GlassCard className="animate-fade-in">
            <h3 className="font-bold text-xl text-foreground mb-6">Distribuição das Joias</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.jewels} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Bar dataKey="count" fill="url(#colorGradient)" radius={[0, 4, 4, 0]}>
                      {data.jewels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(347, 78%, 60%)" : "hsl(195, 100%, 55%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {data.jewels.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma escolha registrada ainda.</p>
                ) : (
                  data.jewels.map((j, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-medium">{j.name}</span>
                      <span className="font-bold text-xl">{j.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
