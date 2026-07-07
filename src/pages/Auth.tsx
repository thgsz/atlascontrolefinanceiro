import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/atlas/Logo';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Conta criada! Verifique seu email para confirmar.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Email ou senha incorretos');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-8 w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'hsl(173, 80%, 50%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'hsl(265, 72%, 55%)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Entrar — Atlas Controle Financeiro</h1>
          <p className="text-muted-foreground">
            {mode === 'signin'
              ? 'Entre na sua conta'
              : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Form card */}
        <div className="atlas-card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    className="atlas-input pl-12"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="atlas-input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="atlas-input pl-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="atlas-btn-primary w-full"
            >
              {loading
                ? 'Carregando...'
                : mode === 'signin'
                ? 'Entrar'
                : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar agora
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
