import React, { useState, useMemo } from 'react';
import { User, RegraCategorizacao } from '../types';
import { storage } from '../storage';
import { Wand2, Plus, Trash2, CheckCircle2, Play } from 'lucide-react';

interface RegrasViewProps {
  currentUser: User;
}

export const RegrasView: React.FC<RegrasViewProps> = ({ currentUser }) => {
  const [padrao, setPadrao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [tick, setTick] = useState(0);

  const categorias = useMemo(() => storage.getCategorias(currentUser.id), [currentUser.id]);
  const regras = useMemo(() => storage.getRegras(currentUser.id), [currentUser.id, tick]);

  React.useEffect(() => {
    if (categorias.length > 0 && categoriaId === '') {
      setCategoriaId(categorias[0].id);
    }
  }, [categorias, categoriaId]);

  const handleAddRegra = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    if (!padrao.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe a palavra-chave.' });
      return;
    }
    if (!categoriaId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione uma categoria.' });
      return;
    }

    try {
      storage.addRegra(currentUser.id, padrao.trim(), Number(categoriaId));
      setMensagem({ tipo: 'sucesso', texto: `Regra para '${padrao}' adicionada com sucesso!` });
      setPadrao('');
      setTick(t => t + 1);
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao adicionar regra.' });
    }
  };

  const handleDelete = (regra: RegraCategorizacao) => {
    if (confirm(`Excluir a regra para '${regra.padrao}'?`)) {
      storage.deleteRegra(currentUser.id, regra.id);
      setTick(t => t + 1);
    }
  };

  const handleAplicarRetroativo = () => {
    const total = storage.aplicarRegrasRetroativas(currentUser.id);
    setMensagem({
      tipo: 'sucesso',
      texto: total > 0 ? `${total} lançamentos sem categoria foram categorizados!` : 'Nenhum lançamento pendente encontrado para aplicar.',
    });
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🪄</span> Regras de categorização
          </h1>
          <p className="text-sm text-gray-500">
            Associe termos e palavras-chave para categorizar automaticamente extratos bancários.
          </p>
        </div>

        <button
          onClick={handleAplicarRetroativo}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-colors"
          title="Varre todos os lançamentos sem categoria e aplica as regras cadastradas"
        >
          <Play className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
          Aplicar em lançamentos existentes
        </button>
      </div>

      {/* Nova Regra Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
        <h2 className="font-semibold text-sm text-[#1E1E1E] flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-[#2E7D32]" /> Nova regra
        </h2>

        <form onSubmit={handleAddRegra} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Palavra-chave (termo no extrato)
              </label>
              <input
                type="text"
                placeholder="Ex.: uber, 99app, ifood, farmacia, supermercado"
                value={padrao}
                onChange={e => setPadrao(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Não diferencia maiúsculas/minúsculas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Atribuir à categoria
              </label>
              <select
                value={categoriaId}
                onChange={e => setCategoriaId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome} ({cat.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mensagem && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {mensagem.texto}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
            >
              Salvar regra
            </button>
          </div>
        </form>
      </div>

      {/* Regras Ativas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="font-semibold text-base text-[#1E1E1E]">Regras ativas</h2>
          <span className="text-xs text-gray-500 font-medium">{regras.length} regras cadastradas</span>
        </div>

        {regras.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Nenhuma regra cadastrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Palavra-chave</th>
                  <th className="py-2.5 px-3">Categoria correspondente</th>
                  <th className="py-2.5 px-3 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regras.map(regra => (
                  <tr key={regra.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                        {regra.padrao}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: regra.cor || '#607D8B' }} />
                        {regra.categoria_nome}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDelete(regra)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
