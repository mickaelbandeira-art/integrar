import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton } from '../components/LayoutComponents';
import { getCurrentUser, getUserJewel } from '../utils/api';
import { toast } from 'sonner';
import { Diamond } from 'lucide-react';



const Menu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string, email: string, matricula: string } | null>(null);
  const [userJewel, setUserJewel] = useState<{ jewel_name: string } | null>(null);

  // Google Drive photos folder link
  const LINK_FOTOS = "https://drive.google.com/";

  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
      fetchJewel(userData.email);
    }
  }, []);

  const fetchJewel = async (email: string) => {
    try {
      const jewel = await getUserJewel(email);
      if (jewel) setUserJewel(jewel);
    } catch (error) {
      console.error("Error fetching jewel", error);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in pb-12">

        {/* User Card */}
        {user && (
          <div className="p-2 flex flex-col items-center text-center space-y-1">
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(195,100%,55%)] to-[hsl(347,78%,60%)]">
              Olá, {user.name}
            </h2>
            <div className="text-xs text-foreground/80 flex flex-col gap-0.5">
              <span>{user.email}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Matrícula: {user.matricula}</span>
            </div>

            {/* Display Selected Jewel if exists */}
            {userJewel && (
              <div className="mt-2 flex items-center gap-2 bg-gradient-to-r from-[hsl(315,100%,50%)]/10 to-[hsl(347,78%,60%)]/10 px-2 py-1 rounded-full border border-[hsl(315,100%,50%)]/20 animate-fade-in">
                <Diamond size={14} className="text-[hsl(315,100%,50%)]" />
                <span className="text-xs font-semibold text-foreground/90">{userJewel.jewel_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Welcome Message */}
        <div className="text-center space-y-4 py-4 px-4">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Que bom ter você aqui!
          </h1>

          <div className="space-y-3">
            <p className="text-base text-foreground/90 leading-relaxed font-medium">
              Você não está apenas participando de um evento.
            </p>

            <p className="text-base text-foreground/90 leading-relaxed font-medium">
              Hoje começa uma <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(347,78%,60%)]">experiência Integrar</span>, conexão e propósito.
            </p>
          </div>

          <h3 className="font-bold text-lg text-foreground pt-2">
            Mas lembre-se:
          </h3>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(347,78%,60%)] text-white font-bold text-lg shadow-lg transform hover:scale-105 transition duration-300 leading-snug">
            Sua participação começa quando você se permite INTEGRAR.
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Menu;
