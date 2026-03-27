import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { addEvaluation, getCurrentUser } from '../utils/api';
import { toast } from "sonner";
import { Star, CheckCircle2, Circle, PartyPopper } from 'lucide-react';

const EvaluationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rating: 0,
    lectureRating: 0,
    bestMoment: "",
    improvements: "",
    energy: "",
    phrase: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const starLabels: Record<number, string> = {
    1: "Não gostei",
    2: "Abaixo do esperado",
    3: "Bom, pode melhorar",
    4: "Gostei bastante",
    5: "Incrível!"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.rating === 0) {
      toast.error("Por favor, selecione uma nota para o evento.");
      return;
    }

    if (form.lectureRating === 0) {
      toast.error("Por favor, selecione uma nota para a palestra.");
      return;
    }

    if (!form.energy) {
      toast.error("Por favor, avalie a energia da equipe.");
      return;
    }

    setLoading(true);

    try {
      await addEvaluation({
        rating_general: form.rating,
        rating_lecture: form.lectureRating,
        best_moment: form.bestMoment,
        improvements: form.improvements,
        team_energy: form.energy,
        phrase_completion: form.phrase,
        user_name: getCurrentUser()?.name || 'Anônimo'
      });

      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting evaluation:", error);
      toast.error(`Erro: ${error.message || 'Erro desconhecido ao enviar avaliação.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout showLogo={false}>
        <GlassCard className="max-w-md text-center animate-fade-in">
          <PartyPopper className="w-16 h-16 mx-auto mb-4 text-[hsl(347,78%,60%)]" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Obrigado!</h2>
          <p className="text-muted-foreground mb-6">
            Sua avaliação foi enviada com sucesso.
          </p>
          <GradientButton
            text="Voltar ao Início"
            onClick={() => navigate('/menu')}
          />
        </GlassCard>
      </Layout>
    );
  }

  return (
    <Layout showLogo={false}>
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <GlassCard>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground">
            Pesquisa de Reação
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Stars Rating Event */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                1. Como você avalia o evento?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, rating: s })}
                    className="transition-all duration-200 hover:scale-125 p-1"
                  >
                    <Star
                      size={40}
                      fill={s <= form.rating ? "hsl(45, 100%, 50%)" : "transparent"}
                      color={s <= form.rating ? "hsl(45, 100%, 50%)" : "hsl(var(--muted-foreground))"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[hsl(347,78%,60%)] font-medium h-6">
                {starLabels[form.rating] || ""}
              </p>
            </div>

            {/* 2. Stars Rating Lecture */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                2. Como você avalia a palestra do evento?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, lectureRating: s })}
                    className="transition-all duration-200 hover:scale-125 p-1"
                  >
                    <Star
                      size={40}
                      fill={s <= form.lectureRating ? "hsl(45, 100%, 50%)" : "transparent"}
                      color={s <= form.lectureRating ? "hsl(45, 100%, 50%)" : "hsl(var(--muted-foreground))"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[hsl(347,78%,60%)] font-medium h-6">
                {starLabels[form.lectureRating] || ""}
              </p>
            </div>

            {/* 3. Best Moment */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                3. O que mais te marcou no evento?
              </label>
              <textarea
                className="w-full p-4 rounded-xl bg-muted/80 text-foreground border-0
                  focus:ring-2 focus:ring-[hsl(195,100%,55%)] outline-none 
                  placeholder:text-muted-foreground/60 transition-all resize-none"
                rows={3}
                value={form.bestMoment}
                onChange={e => setForm({ ...form, bestMoment: e.target.value })}
                placeholder="Conte-nos o que mais gostou..."
              />
            </div>

            {/* 4. Improvements */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                4. Sugestões de melhoria?
              </label>
              <textarea
                className="w-full p-4 rounded-xl bg-muted/80 text-foreground border-0
                  focus:ring-2 focus:ring-[hsl(195,100%,55%)] outline-none 
                  placeholder:text-muted-foreground/60 transition-all resize-none"
                rows={3}
                value={form.improvements}
                onChange={e => setForm({ ...form, improvements: e.target.value })}
                placeholder="O que podemos melhorar?"
              />
            </div>

            {/* 5. Team Energy */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                5. Como você avalia a energia da equipe?
              </label>
              <div className="space-y-2">
                {["Excelente", "Boa", "Regular"].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, energy: opt })}
                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${form.energy === opt
                      ? "bg-gradient-to-r from-[hsl(195,100%,55%)]/20 to-[hsl(347,78%,60%)]/20 border-2 border-[hsl(347,78%,60%)]"
                      : "bg-muted/60 border-2 border-transparent hover:bg-muted"
                      }`}
                  >
                    {form.energy === opt
                      ? <CheckCircle2 className="text-[hsl(347,78%,60%)] mr-3" size={22} />
                      : <Circle className="text-muted-foreground mr-3" size={22} />
                    }
                    <span className={`font-medium ${form.energy === opt ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Phrase Completion */}
            <div>
              <label className="block font-semibold mb-3 text-foreground">
                6. Complete a frase: "O evento foi uma oportunidade de..."
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-xl bg-muted/80 text-foreground border-0
                  focus:ring-2 focus:ring-[hsl(195,100%,55%)] outline-none 
                  placeholder:text-muted-foreground/60 transition-all"
                value={form.phrase}
                onChange={e => setForm({ ...form, phrase: e.target.value })}
                placeholder="..."
              />
            </div>

            <div className="pt-4">
              <GradientButton
                type="submit"
                text={loading ? "Enviando..." : "Enviar Avaliação"}
                disabled={loading}
              />
            </div>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default EvaluationPage;
