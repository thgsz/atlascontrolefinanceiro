import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import { useTheme } from '@/lib/theme-context';
import { User, Bell, Shield, Download, Trash2, Save, Key, Smartphone, Loader2, AlertTriangle, Camera, Sun, Moon, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { user, session, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const avatarSignedUrl = useAvatarUrl(profile?.avatar_url);
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida (JPG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await updateProfile.mutateAsync({ avatar_url: `${filePath}?t=${Date.now()}` });
      toast.success('Avatar atualizado!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Erro ao enviar avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!session) { toast.error('Você precisa estar logado'); return; }
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      };
      downloadCSV(data.transactions, 'atlas-transacoes.csv');
      downloadCSV(data.categories, 'atlas-categorias.csv');
      downloadCSV(data.subscriptions, 'atlas-assinaturas.csv');
      downloadCSV(data.installments, 'atlas-parcelas.csv');
      downloadCSV(data.recurring_expenses, 'atlas-despesas-recorrentes.csv');
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') { toast.error('Digite EXCLUIR para confirmar'); return; }
    if (!session) { toast.error('Você precisa estar logado'); return; }
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast.success('Conta excluída com sucesso');
      await signOut();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir conta');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Download },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="atlas-card p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="atlas-card p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold mb-4">Informações Pessoais</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                    {avatarSignedUrl ? (
                      <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <Camera className="w-5 h-5 text-primary" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="font-medium">{profile?.full_name || 'Seu nome'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    Alterar foto
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="atlas-input max-w-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="atlas-input max-w-md opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
                </div>

                <button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="atlas-btn-primary">
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="atlas-card p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold mb-4">Tema da Interface</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Escolha o tema visual do Atlas. A mudança é aplicada instantaneamente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                      : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-[hsl(222,47%,8%)] border border-[hsl(222,30%,16%)] flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[hsl(173,80%,50%)]" />
                  </div>
                  <span className="font-medium">Escuro</span>
                  <span className="text-xs text-muted-foreground">Tema padrão</span>
                </button>

                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
                    theme === 'light'
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                      : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-[hsl(220,20%,97%)] border border-[hsl(220,13%,87%)] flex items-center justify-center">
                    <Sun className="w-5 h-5 text-[hsl(173,80%,40%)]" />
                  </div>
                  <span className="font-medium">Claro</span>
                  <span className="text-xs text-muted-foreground">Tema alternativo</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="atlas-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Preferências de Notificação</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 cursor-pointer">
                  <div>
                    <p className="font-medium">Lembretes de despesas</p>
                    <p className="text-sm text-muted-foreground">Receba lembretes antes das despesas fixas vencerem</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 cursor-pointer">
                  <div>
                    <p className="font-medium">Alertas de limite</p>
                    <p className="text-sm text-muted-foreground">Seja notificado quando atingir 80% de um limite</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 cursor-pointer">
                  <div>
                    <p className="font-medium">Relatório semanal</p>
                    <p className="text-sm text-muted-foreground">Receba um resumo semanal por email</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="atlas-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Alterar Senha</h2>
                </div>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Nova senha</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="atlas-input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Confirmar nova senha</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="atlas-input w-full" />
                  </div>
                  <button onClick={handleChangePassword} disabled={isChangingPassword || !newPassword || !confirmPassword} className="atlas-btn-secondary">
                    {isChangingPassword ? (<><Loader2 className="w-4 h-4 animate-spin" />Alterando...</>) : (<><Key className="w-4 h-4" />Alterar senha</>)}
                  </button>
                </div>
              </div>
              <div className="atlas-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Autenticação em Dois Fatores</h2>
                  <span className="atlas-badge text-xs">Em breve</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.</p>
                <button disabled className="atlas-btn-secondary opacity-50 cursor-not-allowed"><Smartphone className="w-4 h-4" />Configurar 2FA</button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="atlas-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Exportar Dados</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Baixe todas suas transações, categorias e assinaturas em formato CSV.</p>
                <button onClick={handleExportData} disabled={isExporting} className="atlas-btn-secondary">
                  {isExporting ? (<><Loader2 className="w-4 h-4 animate-spin" />Exportando...</>) : (<><Download className="w-4 h-4" />Exportar CSV</>)}
                </button>
              </div>
              <div className="atlas-card p-6 border border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <h2 className="font-display text-lg font-semibold text-destructive">Excluir Conta</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Esta ação é irreversível. Todos os seus dados serão permanentemente apagados.</p>
                <button onClick={() => setShowDeleteDialog(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-4 h-4" />Excluir minha conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="atlas-card border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />Excluir Conta Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Você está prestes a excluir sua conta. Esta ação é <strong>irreversível</strong> e resultará em:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Exclusão de todas as suas transações</li>
                <li>Exclusão de todas as categorias</li>
                <li>Exclusão de todas as assinaturas e parcelas</li>
                <li>Exclusão de lembretes e despesas recorrentes</li>
                <li>Perda permanente de acesso à conta</li>
              </ul>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Digite <strong>EXCLUIR</strong> para confirmar:</label>
                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="EXCLUIR" className="atlas-input w-full" />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="atlas-btn-secondary">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== 'EXCLUIR'} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (<><Loader2 className="w-4 h-4 animate-spin" />Excluindo...</>) : 'Excluir permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
