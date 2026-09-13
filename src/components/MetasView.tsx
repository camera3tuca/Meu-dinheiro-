import React, { useState, useMemo } from 'react';
import { User, Meta } from '../types';
import { storage } from '../storage';
import { brl, formatarDataBr } from '../utils';
import { PiggyBank, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';

interface MetasViewProps {
  currentUser: User;
}

export const MetasView: React.FC<MetasViewProps> = ({ currentUser }) => {
  const [nome, setNome] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [cor, setCor] = useState('#E91E63');
  const [mensagem, setMensagem] = useState<string | null>(null);

  // Aporte state per meta
  const [aportes, setAportes] = useState<Record<number, string>>({});
  const [tick, setTick] = useState(0);

  const metas = useMemo(() => {
    return storage.getMetas(currentUser.id);
  }, [currentUser.id, tick]);

  const handleCreateMeta = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    if (!nome.trim()) return;

    const alvo = parseFloat(valorAlvo.replace(',', '.')) || 0;
    const atual = parseFloat(valorAtual.replace(',', '.')) || 0;

    if (alvo <= 0) {
      alert('O valor alvo deve ser maior que zero.');
      return;
    }

    storage.addMeta(currentUser.id, {
      nome: nome.trim(),
      valor_alvo: alvo,
      valor_atual: atual,
      data_limite: dataLimite || null,
      cor,
    });

    setNome('');
    setValorAlvo('');
    setValorAtual('');
    setDataLimite('');
    setMensagem('Meta criada com sucesso!');
    setTimeout(() => setMensagem(null), 3000);
    setTick(t => t + 1);
  };

  const handleAporte = (meta: Meta) => {
    const raw = aportes[meta.id];
    if (!raw) return;
    const val = parseFloat(raw.replace(',', '.')) || 0;
    if (val === 0) return;

    storage.updateMeta(currentUser.id, meta.id, {
      valor_atual: Math.max(0, meta.valor_atual + val),
    });

    setAportes({ ...aportes, [meta.id]: '' });
    setTick(t => t + 1);
  };

  const handleDelete = (meta: Meta) => {
    if (confirm(`Excluir a meta '${meta.nome}'?`)) {
      storage.deleteMeta(currentUser.id, meta.id);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🐖</span> Metas financeiras
          </h1>
          <p className="text-sm text-gray-500">
            Defina objetivos de poupança, prazos e acompanhe o progresso de cada sonho.
          </p>
        </div>
      </div>

      {/* Nova Meta Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
        <h2 className="font-semibold text-sm text-[#1E1E1E] flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-[#2E7D32]" /> Nova meta
        </h2>

        <form onSubmit={handleCreateMeta} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome da meta</label>
              <input
                type="text"
                placeholder="Ex.: Reserva de Emergência, Viagem"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor Alvo (R$)</label>
              <input
                type="text"
                placeholder="Ex.: 10000,00"
                value={valorAlvo}
                onChange={e => setValorAlvo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor Atual Guardado (R$)</label>
              <input
                type="text"
                placeholder="Ex.: 1500,00"
                value={valorAtual}
                onChange={e => setValorAtual(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Limite (Opcional)</label>
              <input
                type="date"
                value={dataLimite}
                onChange={e => setDataLimite(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Cor do tema:</label>
              <input
                type="color"
                value={cor}
                onChange={e => setCor(e.target.value)}
                className="w-8 h-8 p-1 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
            >
              Criar meta
            </button>
          </div>

          {mensagem && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
              {mensagem}
            </div>
          )}
        </form>
      </div>

      {/* Metas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metas.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-gray-200">
            Nenhuma meta cadastrada ainda. Crie sua primeira meta acima!
          </div>
        ) : (
          metas.map(meta => {
            const pct = meta.valor_alvo > 0 ? Math.min(100, Math.round((meta.valor_atual / meta.valor_alvo) * 100)) : 0;
            const concluida = meta.valor_atual >= meta.valor_alvo;

            return (
              <div
                key={meta.id}
                className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: meta.cor }}
                />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                      <span>{meta.nome}</span>
                      {concluida && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Concluída! 🎉
                        </span>
                      )}
                    </h3>
                    {meta.data_limite && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Prazo: {formatarDataBr(meta.data_limite)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(meta)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">{brl(meta.valor_atual)}</span>
                    <span className="text-gray-900">{brl(meta.valor_alvo)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: meta.cor }}
                    />
                  </div>
                </div>

                {/* Aporte rápido */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Aportar:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1.5 text-xs text-gray-400">R$</span>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={aportes[meta.id] || ''}
                      onChange={e => setAportes({ ...aportes, [meta.id]: e.target.value })}
                      className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAporte(meta)}
                    className="px-3 py-1 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-medium rounded transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
