import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoAeC from '@/assets/logo-aec-white.png';
import { Sun, Moon, Lock, Menu, X } from 'lucide-react';
import { getCurrentUser } from '@/utils/api';

import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Theme Toggle Hook
const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
};

// Gradient Button Component
export const GradientButton = ({
  text,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary"
}: {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}) => {
  const gradients = {
    primary: "bg-gradient-to-r from-primary via-primary to-secondary",
    secondary: "bg-gradient-to-r from-secondary to-primary",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-8 rounded-full text-white font-black text-lg
        ${gradients[variant]}
        hover:brightness-110 hover:scale-[1.03] hover:shadow-2xl
        active:scale-[0.98]
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-xl
        ${className}
      `}
    >
      {text}
    </button>
  );
};

// Gradient Input Component
export const GradientInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) => {
  return (
    <div className="flex flex-col mb-5 w-full text-left">
      {label && (
        <label className="text-foreground font-medium mb-2 text-sm tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group p-[2px] rounded-xl bg-gradient-to-r from-primary to-secondary">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="relative w-full py-4 px-5 rounded-[10px] outline-none bg-white dark:bg-gray-900 text-foreground 
            placeholder:text-muted-foreground/70 shadow-sm
            transition-all duration-300"
        />
      </div>
    </div>
  );
};

import logoAeCColor from '@/assets/aec-logo-original.png';

export const IntegrarLogo = ({ size = "large" }: { size?: "small" | "large" }) => {
  const heightClass = size === "large" ? "h-20 md:h-28" : "h-12 md:h-16";

  return (
    <div className="flex justify-center items-center select-none py-4">
      <img
        src={logoAeCColor}
        alt="AeC"
        className={`${heightClass} w-auto object-contain`}
        draggable={false}
      />
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    {/* Overlay to keep it subtle */}
    <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl"></div>
  </div>
);

// Main Layout Component
export const Layout = ({ children, showLogo = true }: { children: React.ReactNode; showLogo?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLocationWarningOpen, setIsLocationWarningOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");
  const [targetPath, setTargetPath] = React.useState("");
  const [expectedKeyword, setExpectedKeyword] = React.useState("");
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAccess = () => {
    if (keyword.toLowerCase() === expectedKeyword.toLowerCase()) {
      navigate(targetPath);
      setIsDialogOpen(false);
      setKeyword("");
      setTargetPath("");
      setExpectedKeyword("");
    } else {
      toast.error("Palavra-chave incorreta!");
    }
  };

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Check-in', path: '/checkin', locationRequired: true },
    { label: 'Nuvem de Palavras', path: '/nuvem' },
    { label: 'Avaliação', path: '/avaliacao' },
    { label: 'Galeria', path: '/galeria' },
  ];

  const handleNavClick = (item: { label: string, path: string, requiredKeyword?: string, locationRequired?: boolean }) => {
    if (item.requiredKeyword) {
      setTargetPath(item.path);
      setExpectedKeyword(item.requiredKeyword);
      setIsMenuOpen(false);
      setIsDialogOpen(true);
    } else if (item.locationRequired) {
      if (getCurrentUser()) {
        navigate(item.path);
        setIsMenuOpen(false);
      } else {
        setTargetPath(item.path);
        setIsMenuOpen(false);
        setIsLocationWarningOpen(true);
      }
    } else {
      navigate(item.path);
      setIsMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header — fixed overlay, floats above content */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-primary to-primary/90'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
            <img
              src={logoAeC}
              alt="AEC Logo"
              className="h-14 w-auto transition-transform group-hover:scale-105"
            />
          </button>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`text-sm font-semibold tracking-wide transition-all duration-200 relative
                  ${isActive(item.path) ? 'opacity-100' : 'opacity-80 hover:opacity-100'}
                  text-white hover:text-white
                  after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:right-0
                  after:h-[2px] after:transition-transform after:duration-300
                  after:bg-white/80
                  ${isActive(item.path) ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>


          {/* Mobile Menu Button - Left Aligned to clear space for logo if needed, or right aligned with actions */}
          <div className="flex items-center gap-2 lg:hidden order-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full transition-colors bg-white/20 hover:bg-white/30 text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-2">
            {/* Admin Button */}
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-full transition-colors bg-white/20 hover:bg-white/30 text-white"
              title="Acesso Administrativo"
            >
              <Lock className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-full transition-colors bg-white/20 hover:bg-white/30 text-white"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <nav
          className={`absolute top-[64px] left-0 right-0 bg-gradient-to-r from-primary to-primary/90 border-b border-white/20 shadow-xl transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-10'
            }`}
        >
          <div className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between
                  ${isActive(item.path)
                    ? 'bg-white text-primary font-bold shadow-sm'
                    : 'text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-lg">{item.label}</span>
                {isActive(item.path) && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Acesso Restrito</DialogTitle>
            <DialogDescription>
              Digite a palavra-chave para acessar esta área.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="keyword"
                placeholder="Palavra-chave"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAccess();
                }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAccess}>
              Acessar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLocationWarningOpen} onOpenChange={setIsLocationWarningOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Localização Necessária</DialogTitle>
            <DialogDescription>
              Para realizar o check-in, é necessário ativar a localização do seu dispositivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsLocationWarningOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => {
              setIsLocationWarningOpen(false);
              navigate(targetPath);
            }}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className={`flex-grow flex flex-col items-center justify-start ${showLogo ? 'pt-20 md:pt-24 px-4 pb-8' : 'p-0'} z-10 relative`}>
        {showLogo && (
          <div className="mb-6 animate-fade-in">
            <IntegrarLogo />
          </div>
        )}
        {children}
      </main>

      {/* Animated Background */}
      <AnimatedBackground />
    </div>
  );
};

// Glass Card Component
export const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative p-[2px] rounded-xl bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
    <div className="bg-white dark:bg-gray-900 rounded-[10px] p-6 md:p-8 h-full w-full">
      {children}
    </div>
  </div>
);
