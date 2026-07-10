import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/atlas/Logo';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';

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
    <div className="relative min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-10 w-full overflow-hidden">
      <Helmet>
        <title>Entrar — Atlas Controle Financeiro</title>
        <meta name="description" content="Entre na sua conta Atlas ou crie uma nova para começar a organizar seu controle financeiro pessoal em minutos." />
        <link rel="canonical" href="https://atlascontrolefinanceiro.lovable.app/auth" />
        <meta property="og:title" content="Entrar — Atlas Controle Financeiro" />
        <meta property="og:description" content="Entre na sua conta Atlas ou crie uma nova para começar a organizar seu controle financeiro pessoal em minutos." />
        <meta property="og:url" content="https://atlascontrolefinanceiro.lovable.app/auth" />
      </Helmet>
      {/* Ambient background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[10%] w-[520px] h-[520px] rounded-full blur-3xl"
          style={{ background: 'hsl(173, 80%, 50%)', opacity: 0.18 }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[8%] w-[440px] h-[440px] rounded-full blur-3xl"
          style={{ background: 'hsl(265, 72%, 55%)', opacity: 0.12 }}
          animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.06), transparent 60%)',
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-5" showText={false} />
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1.5">
            {mode === 'signin' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'signin'
              ? 'Entre para continuar organizando suas finanças.'
              : 'Comece a organizar seu dinheiro em minutos.'}
          </p>
        </div>

        {/* Form card */}
        <div className="atlas-glass p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
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
              </motion.div>
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
              className="atlas-btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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

        {/* Trust strip */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
          <span>Seus dados são criptografados e privados.</span>
        </div>
      </motion.div>
    </div>
  );
}
