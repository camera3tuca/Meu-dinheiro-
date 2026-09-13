import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { storage } from '../storage';
import { brl, competenciaAtual, competenciaLegivel } from '../utils';
import { Target, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface OrcamentoViewProps {
  currentUser: User;
}

export const OrcamentoView: React.FC<OrcamentoViewProps> = ({ currentUser }) => {
  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [valores, setValores] = useState<Record<number, number>>({});
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Month list: -11 to +3
  const opcoesCompetencia = useMemo(() => {
    const hoje = new Date();
    const list: string[] = [];
    for (let delta = -11; delta <= 3; delta++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + delta, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      list.push(`${y}-${m}`);
    }
    return Array.from(new Set(list)).sort().reverse();
  }, []);

  const dados = useMemo(() => {
    return storage.getOrcamentoVsRealizado(currentUser.id, competencia);
  }, [currentUser.id, competencia, tick]);

  // Sync state values when dados changes
  React.useEffect(() => {
    const map: Record<number, number> = {};
    dados.forEach(d => {
      map[d.categoria_id] = d.orcado;
    });
    setValores(map);
  }, [dados]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dados.forEach(d => {
      const val = valores[d.categoria_id] ?? d.orcado;
      storage.definirOrcamento(currentUser.id, d.categoria_id, competencia, val);
    });
    setMensagem('Orçamento salvo com sucesso!');
    setTimeout(() => setMensagem(null), 3500);
    setTick(t => t + 1);
  };

  const totalOrcado = dados.reduce((sum, d) => sum + (valores[d.categoria_id] ?? d.orcado), 0);
  const totalGasto = dados.reduce((sum, d) => sum + d.gasto, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🎯</span> Orçamento mensal
          </h1>
          <p className="text-sm text-gray-500">
            Defina limites por categoria e acompanhe o realizado em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-2xs">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Competência:</span>
          <select
            value={competencia}
            onChange={e => setCompetencia(e.target.value)}
            className="text-sm font-semibold text-[#1E1E1E] bg-transparent focus:outline-none cursor-pointer"
          >
            {opcoesCompetencia.map(c => (
              <option key={c} value={c}>
                {competenciaLegivel(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orçado</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{brl(totalOrcado)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Realizado</span>
          <p className="text-xl font-bold text-red-600 mt-1">{brl(totalGasto)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponível</span>
          <p className={`text-xl font-bold mt-1 ${totalOrcado - totalGasto >= 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
            {brl(totalOrcado - totalGasto)}
          </p>
        </div>
      </div>

      {/* Acompanhamento do Realizado (Progress Bars) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <h2 className="font-semibold text-base text-[#1E1E1E]">Acompanhamento de gastos</h2>
        
        {dados.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">Nenhuma categoria de despesa cadastrada.</p>
        ) : (
          <div className="space-y-4">
            {dados.map(item => {
              const orcado = valores[item.categoria_id] ?? item.orcado;
              const pct = orcado > 0 ? Math.round((item.gasto / orcado) * 100) : item.gasto > 0 ? 100 : 0;
              const estourou = orcado > 0 && item.gasto > orcado;

              return (
                <div key={item.categoria_id} className="space-y-1.5 p-3 rounded-lg bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                      <span className="font-semibold text-gray-900">{item.categoria}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">
                        {brl(item.gasto)} de {brl(orcado)}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          estourou
                            ? 'bg-red-100 text-red-800'
                            : pct >= 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        estourou ? 'bg-red-600' : pct >= 80 ? 'bg-amber-500' : 'bg-[#2E7D32]'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  {estourou && (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 font-medium pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Orçamento ultrapassado em {brl(item.gasto - orcado)}!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Definir Limites por Categoria (Form) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
        <h2 className="font-semibold text-base text-[#1E1E1E] mb-4">Definir limites por categoria</h2>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="divide-y divide-gray-100">
            {dados.map(item => (
              <div key={item.categoria_id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                  <span className="text-sm font-medium text-gray-800">{item.categoria}</span>
                </div>
                <div className="w-40 sm:w-48">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-gray-500">R$</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={valores[item.categoria_id] ?? 0}
                      onChange={e =>
                        setValores({
                          ...valores,
                          [item.categoria_id]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold text-right border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mensagem && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {mensagem}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
            >
              Salvar orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
