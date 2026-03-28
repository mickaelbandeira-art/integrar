import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton, GradientInput } from '../components/LayoutComponents';
import { toast } from "sonner";
import { addCheckin, setCurrentUser } from '../utils/api';

const Checkin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nome: '', email: '', matricula: '', keyword: '' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('userName')) {
      toast.info("Você já realizou o check-in!");
      navigate('/menu');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error("Por favor, preencha seu nome.");
      return;
    }

    if (formData.keyword.trim().toLowerCase() !== 'integrar') {
      toast.error("Palavra chave incorreta.");
      return;
    }

    setLoading(true);

    let locationData = { latitude: null as number | null, longitude: null as number | null };

    try {
      // Attempt to get location with timeout - MANDATORY
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => reject(err),
          { timeout: 10000, enableHighAccuracy: true } // 10s timeout, HIGH accuracy required
        );
      });

      if (position && position.coords) {
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      }
    } catch (error: any) {
      console.warn("Location access denied or error:", error);
      setLoading(false);

      let msg = "É obrigatório permitir a localização para fazer check-in.";
      if (error.code === 1) msg = "Permissão de localização negada. Ative para continuar.";
      else if (error.code === 2) msg = "Localização indisponível. Verifique seu GPS/Wi-fi.";
      else if (error.code === 3) msg = "Tempo esgotado ao buscar localização. Tente novamente.";

      toast.error(msg);
      return; // BLOCK CHECK-IN
    }

    try {
      // Save check-in to API
      await addCheckin({
        user_name: formData.nome.trim(),
        user_email: formData.email.trim() || null,
        matricula: formData.matricula.trim() || null,
        ...locationData
      });

      // Save current user locally for session
      setCurrentUser(
        formData.nome.trim(),
        formData.email.trim() || null,
        formData.matricula.trim() || null
      );

      toast.success(`Bem-vindo(a), ${formData.nome}! Check-in realizado.`);
      navigate('/menu');
    } catch (error: any) {
      console.error("Check-in error:", error);
      // Show more specific error message if available
      const errorMessage = error.message || "Erro desconhecido";
      toast.error(`Erro ao realizar check-in: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-2">
          <GradientInput
            label="Nome"
            placeholder="Digite seu nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <GradientInput
            label="E-mail"
            placeholder="Digite seu e-mail coorporativo ou pessoal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <GradientInput
            label="Matrícula ou CPF"
            placeholder="Digite sua matrícula ou CPF"
            value={formData.matricula}
            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
          />
          <GradientInput
            label="Palavra Chave"
            placeholder="Digite a palavra chave do evento"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            type="password"
          />

          <div className="pt-6">
            <GradientButton
              type="submit"
              text={loading ? "Entrando..." : "Entrar"}
              disabled={loading}
              className="w-full"
            />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkin;
