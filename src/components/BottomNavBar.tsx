import React from 'react';
import { PageView } from '../types';
import { LayoutDashboard, ReceiptText, Landmark, Target, MoreHorizontal } from 'lucide-react';

interface BottomNavBarProps {
  currentPage: PageView;
  onSelectPage: (page: PageView) => void;
  onOpenMore: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentPage,
  onSelectPage,
  onOpenMore,
}) => {
  const items: Array<{ id: PageView; label: string; icon: React.ReactNode }> = [
    { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'lancamentos', label: 'Lançamentos', icon: <ReceiptText className="w-5 h-5" /> },
    { id: 'contas', label: 'Contas', icon: <Landmark className="w-5 h-5" /> },
    { id: 'orcamento', label: 'Orçamento', icon: <Target className="w-5 h-5" /> },
  ];

  const isMainTab = items.some(it => it.id === currentPage);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {items.map(item => {
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectPage(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              active
                ? 'text-[#2E7D32]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${active ? 'bg-emerald-50' : ''}`}>
              {item.icon}
            </div>
            <span className="truncate mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Mais Menu */}
      <button
        onClick={onOpenMore}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          !isMainTab ? 'text-[#2E7D32]' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <div className={`p-1 rounded-md transition-colors ${!isMainTab ? 'bg-emerald-50' : ''}`}>
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <span className="truncate mt-0.5">Mais</span>
      </button>
    </nav>
  );
};
