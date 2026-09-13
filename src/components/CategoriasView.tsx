import React, { useState, useMemo } from 'react';
import { User, Categoria, TipoLancamento } from '../types';
import { storage } from '../storage';
import { Tags, Plus, Trash2 } from 'lucide-react';

interface CategoriasViewProps {
  currentUser: User;
}

export const CategoriasView: React.FC<CategoriasViewProps> = ({ currentUser }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoLancamento>('despesa');
  const [cor, setCor] = useState('#607D8B');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [tick, setTick] = useState(0);

  const categorias = useMemo(() => {
    return storage.getCategorias(currentUser.id);
  }, [currentUser.id, tick]);

  const receitas = useMemo(() => categorias.filter(c => c.tipo === 'receita'), [categorias]);
  const despesas = useMemo(() => categorias.filter(c => c.tipo === 'despesa'), [categorias]);

  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    if (!nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe o nome da categoria.' });
      return;
    }

    try {
      storage.addCategoria(currentUser.id, nome, tipo, cor);
      setMensagem({ tipo: 'sucesso', texto: `Categoria '${nome}' criada com sucesso!` });
      setNome('');
      setTick(t => t + 1);
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Já existe uma categoria com esse nome.' });
    }
  };

  const handleDelete = (cat: Categoria) => {
    if (confirm(`Excluir a categoria '${cat.nome}'?`)) {
      storage.deleteCategoria(currentUser.id, cat.id);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🏷️</span> Categorias
          </h1>
          <p className="text-sm text-gray-500">
            Organize suas receitas e despesas por categorias personalizadas com cores.
          </p>
        </div>
      </div>

      {/* Nova Categoria Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
        <h2 className="font-semibold text-sm text-[#1E1E1E] flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-[#2E7D32]" /> Nova categoria
        </h2>

        <form onSubmit={handleAddCategoria} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome da categoria</label>
              <input
                type="text"
                placeholder="Ex.: Transporte, Freelance, Lazer"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="despesa"
                    checked={tipo === 'despesa'}
                    onChange={() => setTipo('despesa')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-red-700">Despesa</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="receita"
                    checked={tipo === 'receita'}
                    onChange={() => setTipo('receita')}
                    className="text-[#2E7D32] focus:ring-[#2E7D32]"
                  />
                  <span className="text-[#2E7D32]">Receita</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                  className="w-10 h-9 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-mono">{cor}</span>
              </div>
            </div>
          </div>

          {mensagem && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
            >
              Salvar categoria
            </button>
          </div>
        </form>
      </div>

      {/* Grid: Despesas and Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Despesas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-base text-red-700 flex items-center gap-2">
              <span>📉</span> Despesas ({despesas.length})
            </h2>
          </div>

          {despesas.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">Nenhuma categoria de despesa cadastrada.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {despesas.map(cat => (
                <div key={cat.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.cor }} />
                    <span className="text-sm font-medium text-gray-800">{cat.nome}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receitas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-base text-[#2E7D32] flex items-center gap-2">
              <span>📈</span> Receitas ({receitas.length})
            </h2>
          </div>

          {receitas.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">Nenhuma categoria de receita cadastrada.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {receitas.map(cat => (
                <div key={cat.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.cor }} />
                    <span className="text-sm font-medium text-gray-800">{cat.nome}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
