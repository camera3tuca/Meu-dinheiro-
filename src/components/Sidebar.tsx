import React, { useState } from 'react';
import { PageView, User } from '../types';
import { storage } from '../storage';
import { usePrivacy } from '../context/PrivacyContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ScienceBitLogo } from './ScienceBitLogo';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Landmark, 
  Tags, 
  Target, 
  BarChart3, 
  UploadCloud, 
  PiggyBank, 
  ArrowLeftRight, 
  Wand2, 
  User as UserIcon,
  Plus,
  Menu,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageView;
  onSelectPage: (page: PageView) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenBackup: () => void;
  onOpenOnboarding?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  currentUser,
  onUserChange,
  onOpenBackup,
  onOpenOnboarding,
  isOpenMobile = false,
  onCloseMobile,
  onOpenMobile,
}) => {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState('');
  const [errorUser, setErrorUser] = useState('');

  const isMobileOpen = isOpenMobile || internalOpenMobile;
  const handleCloseMobile = () => {
    setInternalOpenMobile(false);
    onCloseMobile?.();
  };
  const handleOpenMobile = () => {
    setInternalOpenMobile(true);
    onOpenMobile?.();
  };

  const users = storage.getUsers();

  const navItems: Array<{ id: PageView; label: string; icon: React.ReactNode }> = [
    { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4 text-[#2E7D32]" /> },
    { id: 'lancamentos', label: 'Lançamentos', icon: <ReceiptText className="w-4 h-4 text-emerald-600" /> },
    { id: 'contas', label: 'Contas', icon: <Landmark className="w-4 h-4 text-blue-600" /> },
    { id: 'categorias', label: 'Categorias', icon: <Tags className="w-4 h-4 text-amber-600" /> },
    { id: 'orcamento', label: 'Orçamento', icon: <Target className="w-4 h-4 text-purple-600" /> },
    { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4 text-indigo-600" /> },
    { id: 'importar', label: 'Importar extrato', icon: <UploadCloud className="w-4 h-4 text-cyan-600" /> },
    { id: 'metas', label: 'Metas', icon: <PiggyBank className="w-4 h-4 text-pink-600" /> },
    { id: 'transferencias', label: 'Transferências', icon: <ArrowLeftRight className="w-4 h-4 text-teal-600" /> },
    { id: 'regras', label: 'Regras', icon: <Wand2 className="w-4 h-4 text-amber-500" /> },
    { id: 'playstore', label: 'Kit Play Store', icon: <Sparkles className="w-4 h-4 text-emerald-600" /> },
  ];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorUser('');
    try {
      const u = storage.createUser(novoUsuario);
      setNovoUsuario('');
      setShowAddUser(false);
      onUserChange(u);
    } catch (err: any) {
      setErrorUser(err.message || 'Erro ao criar usuário');
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E0E0E0] text-[#1E1E1E]">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#EAEAEA] flex items-center justify-between">
        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onSelectPage('painel')}>
          <ScienceBitLogo size="md" />
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs">💰</span>
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Meu Dinheiro</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-lg transition-colors ${
              isPrivacyMode
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPrivacyMode ? 'Modo Privacidade ativo (clique para exibir valores)' : 'Ocultar valores (Modo Privacidade)'}
            aria-label="Alternar privacidade"
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={handleCloseMobile}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="text-[11px] font-semibold tracking-wider text-gray-600 uppercase px-3 py-1">
          Navegação
        </div>
        {navItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id);
                handleCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#E8F5E9] text-[#2E7D32] shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-2">
          <div className="text-[11px] font-semibold tracking-wider text-gray-600 uppercase px-3 py-1">
            Ferramentas
          </div>
          {onOpenOnboarding && (
            <button
              onClick={() => {
                onOpenOnboarding();
                handleCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-all mb-1 border border-emerald-200/60"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="truncate font-semibold">Passo a Passo Didático</span>
            </button>
          )}
          <button
            onClick={() => {
              onOpenBackup();
              handleCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="truncate">Backup & Segurança</span>
          </button>
        </div>
      </div>

      {/* Footer Tools & User Switcher */}
      <div className="p-3 border-t border-[#EAEAEA] bg-[#FAFAFA] space-y-2">
        {/* PWA Install Button */}
        <div className="px-1">
          <PWAInstallButton />
        </div>

        <div className="text-[11px] font-semibold text-gray-600 uppercase px-2 flex items-center justify-between">
          <span>Usuário</span>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="text-[#2E7D32] hover:text-[#1B5E20] font-medium flex items-center gap-1 normal-case"
            title="Adicionar usuário"
          >
            <Plus className="w-3.5 h-3.5" /> Novo
          </button>
        </div>

        {showAddUser && (
          <form onSubmit={handleCreateUser} className="mb-2 p-2 bg-white rounded border border-gray-200">
            <input
              type="text"
              placeholder="Nome do usuário"
              value={novoUsuario}
              onChange={e => setNovoUsuario(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-300 rounded mb-1.5 focus:outline-none focus:border-[#2E7D32]"
              autoFocus
            />
            {errorUser && <p className="text-[10px] text-red-500 mb-1">{errorUser}</p>}
            <div className="flex gap-1 justify-end">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="text-xs px-2 py-0.5 text-gray-500 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs px-2 py-0.5 bg-[#2E7D32] text-white rounded hover:bg-[#1B5E20]"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded-lg">
          <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            value={currentUser.id}
            onChange={e => {
              const u = users.find(usr => usr.id === Number(e.target.value));
              if (u) onUserChange(u);
            }}
            className="w-full bg-transparent text-xs font-medium text-gray-800 focus:outline-none cursor-pointer"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.usuario}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectPage('painel')}>
          <ScienceBitLogo size="sm" showSubtitle={false} />
          <span className="text-gray-300 font-light text-xs">|</span>
          <span className="font-bold text-xs text-[#1E1E1E]">Meu Dinheiro</span>
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton compact />
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-lg border transition-colors ${
              isPrivacyMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
            title={isPrivacyMode ? 'Valores ocultos (clique para exibir)' : 'Ocultar valores'}
            aria-label="Alternar privacidade"
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleOpenMobile}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity" onClick={handleCloseMobile} />
          <div className="relative w-72 max-w-full h-full z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

