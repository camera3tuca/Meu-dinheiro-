import React, { useState, useMemo } from 'react';
import { User, Lancamento, TipoLancamento } from '../types';
import { storage } from '../storage';
import { brl, formatarDataBr, somarMeses, competenciaAtual, competenciaLegivel } from '../utils';
import { Plus, Filter, Trash2, Edit2, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';

interface LancamentosViewProps {
  currentUser: User;
}

export const LancamentosView: React.FC<LancamentosViewProps> = ({ currentUser }) => {
  const [showForm, setShowForm] = useState(true);
  const [tipoForm, setTipoForm] = useState<TipoLancamento>('despesa');
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [valor, setValor] = useState<string>('');
  const [contaId, setContaId] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [repeticao, setRepeticao] = useState<'unico' | 'parcelado' | 'recorrente'>('unico');
  const [vezes, setVezes] = useState<number>(1);
  const [pago, setPago] = useState(true);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Edit Modal State
  const [editingLanc, setEditingLanc] = useState<Lancamento | null>(null);

  // Filters
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'receita' | 'despesa'>('todas');
  const [termoBusca, setTermoBusca] = useState('');

  // Reload trigger
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const contas = useMemo(() => storage.getContas(currentUser.id), [currentUser.id, tick]);
  const categorias = useMemo(
    () => storage.getCategorias(currentUser.id, tipoForm),
    [currentUser.id, tipoForm, tick]
  );
  const allCategorias = useMemo(
    () => storage.getCategorias(currentUser.id),
    [currentUser.id, tick]
  );

  // Set default account when accounts load
  React.useEffect(() => {
    if (contas.length > 0 && contaId === '') {
      setContaId(contas[0].id);
    }
  }, [contas, contaId]);

  // Set default category when categories load
  React.useEffect(() => {
    if (categorias.length > 0 && categoriaId === '') {
      setCategoriaId(categorias[0].id);
    }
  }, [categorias, categoriaId]);

  const todosLancamentos = useMemo(() => {
    return storage.getLancamentos(currentUser.id);
  }, [currentUser.id, tick]);

  const listaCompetencias = useMemo(() => {
    const set = new Set<string>();
    todosLancamentos.forEach(l => {
      const c = l.data.slice(0, 7);
      if (c) set.add(c);
    });
    return Array.from(set).sort().reverse();
  }, [todosLancamentos]);

  const lancamentosFiltrados = useMemo(() => {
    return todosLancamentos.filter(l => {
      if (filtroCompetencia !== 'todas' && !l.data.startsWith(filtroCompetencia)) {
        return false;
      }
      if (filtroTipo !== 'todas' && l.tipo !== filtroTipo) {
        return false;
      }
      if (termoBusca.trim()) {
        const t = termoBusca.toLowerCase();
        const matchesDesc = l.descricao.toLowerCase().includes(t);
        const matchesCat = (l.categoria_nome || '').toLowerCase().includes(t);
        const matchesConta = (l.conta_nome || '').toLowerCase().includes(t);
        if (!matchesDesc && !matchesCat && !matchesConta) return false;
      }
      return true;
    });
  }, [todosLancamentos, filtroCompetencia, filtroTipo, termoBusca]);

  // Summaries
  const totalReceitas = useMemo(() => {
    return lancamentosFiltrados
      .filter(l => l.tipo === 'receita' && !l.transferencia && l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
  }, [lancamentosFiltrados]);

  const totalDespesas = useMemo(() => {
    return lancamentosFiltrados
      .filter(l => l.tipo === 'despesa' && !l.transferencia && l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
  }, [lancamentosFiltrados]);

  const saldoFiltrado = totalReceitas - totalDespesas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const valNum = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe uma descrição.' });
      return;
    }
    if (isNaN(valNum) || valNum <= 0) {
      setMensagem({ tipo: 'erro', texto: 'O valor deve ser maior que zero.' });
      return;
    }
    if (contaId === '') {
      setMensagem({ tipo: 'erro', texto: 'Selecione uma conta.' });
      return;
    }
    if (repeticao !== 'unico' && vezes < 2) {
      setMensagem({ tipo: 'erro', texto: 'Para parcelar ou repetir, informe pelo menos 2 parcelas/meses.' });
      return;
    }

    const cId = Number(contaId);
    const catId = categoriaId !== '' ? Number(categoriaId) : null;

    if (repeticao === 'unico') {
      storage.addLancamento(currentUser.id, {
        data: dataLanc,
        descricao: descricao.trim(),
        valor: valNum,
        tipo: tipoForm,
        conta_id: cId,
        categoria_id: catId,
        pago,
        transferencia: false,
      });
      setMensagem({ tipo: 'sucesso', texto: `Lançamento de ${brl(valNum)} salvo com sucesso!` });
    } else {
      const n = Math.floor(vezes);
      const valorParcela = repeticao === 'parcelado' ? Number((valNum / n).toFixed(2)) : valNum;
      const items = [];
      for (let i = 0; i < n; i++) {
        items.push({
          data: somarMeses(dataLanc, i),
          descricao: `${descricao.trim()} (${i + 1}/${n})`,
          valor: valorParcela,
          tipo: tipoForm,
          conta_id: cId,
          categoria_id: catId,
          pago: pago && i === 0, // only first is paid
          transferencia: false,
        });
      }
      storage.addLancamentosBatch(currentUser.id, items);
      setMensagem({
        tipo: 'sucesso',
        texto: `${n} lançamentos gerados (${repeticao === 'parcelado' ? 'parcelamento' : 'recorrência'})!`,
      });
    }

    // Reset form fields
    setDescricao('');
    setValor('');
    setRepeticao('unico');
    setVezes(1);
    refresh();
  };

  const handleTogglePago = (lanc: Lancamento) => {
    storage.updateLancamento(currentUser.id, lanc.id, { pago: !lanc.pago });
    refresh();
  };

  const handleDelete = (id: number) => {
    if (confirm('Deseja excluir este lançamento?')) {
      storage.deleteLancamento(currentUser.id, id);
      refresh();
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLanc) return;
    storage.updateLancamento(currentUser.id, editingLanc.id, {
      data: editingLanc.data,
      descricao: editingLanc.descricao,
      valor: editingLanc.valor,
      tipo: editingLanc.tipo,
      conta_id: editingLanc.conta_id,
      categoria_id: editingLanc.categoria_id,
      pago: editingLanc.pago,
    });
    setEditingLanc(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🧾</span> Lançamentos
          </h1>
          <p className="text-sm text-gray-500">
            Cadastre receitas e despesas, parcelamentos e controle de status pago.
          </p>
        </div>
      </div>

      {/* Novo Lançamento Expander */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-sm text-[#1E1E1E] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#2E7D32]" /> Novo lançamento
          </span>
          {showForm ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 border-t border-gray-100">
            {/* Tipo: Despesa / Receita */}
            <div className="flex items-center gap-6">
              <span className="text-xs font-semibold text-gray-600 uppercase">Tipo:</span>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="despesa"
                  checked={tipoForm === 'despesa'}
                  onChange={() => {
                    setTipoForm('despesa');
                    setCategoriaId('');
                  }}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-red-700">Despesa</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="receita"
                  checked={tipoForm === 'receita'}
                  onChange={() => {
                    setTipoForm('receita');
                    setCategoriaId('');
                  }}
                  className="text-[#2E7D32] focus:ring-[#2E7D32]"
                />
                <span className="text-[#2E7D32]">Receita</span>
              </label>
            </div>

            {/* Row 1: Data, Valor, Conta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={dataLanc}
                  onChange={e => setDataLanc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conta</label>
                <select
                  value={contaId}
                  onChange={e => setContaId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  required
                >
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.tipo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Descrição, Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex.: Supermercado, Salário, Farmácia"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={categoriaId}
                  onChange={e => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Repetição, Parcelas, Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Repetição</label>
                <select
                  value={repeticao}
                  onChange={e => setRepeticao(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                >
                  <option value="unico">Único</option>
                  <option value="parcelado">Parcelado (dividir o total)</option>
                  <option value="recorrente">Recorrente (repetir mensal)</option>
                </select>
              </div>

              {repeticao !== 'unico' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nº de parcelas / meses</label>
                  <input
                    type="number"
                    min="2"
                    max="360"
                    value={vezes}
                    onChange={e => setVezes(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              )}

              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={pago}
                    onChange={e => setPago(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                  />
                  <span>{tipoForm === 'receita' ? 'Recebido' : 'Pago'}</span>
                </label>
              </div>
            </div>

            {mensagem && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {mensagem.texto}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
              >
                Salvar lançamento
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Filtros</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter */}
            <select
              value={filtroCompetencia}
              onChange={e => setFiltroCompetencia(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="todas">Todos os meses</option>
              {listaCompetencias.map(c => (
                <option key={c} value={c}>
                  {competenciaLegivel(c)}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
            >
              <option value="todas">Todos os tipos</option>
              <option value="receita">Apenas Receitas</option>
              <option value="despesa">Apenas Despesas</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32] w-40 sm:w-56"
            />
          </div>
        </div>

        {/* Totals Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <div className="text-gray-500 font-medium">
            Exibindo <span className="font-bold text-gray-800">{lancamentosFiltrados.length}</span> lançamentos
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-semibold">Receitas: {brl(totalReceitas)}</span>
            <span className="text-red-700 font-semibold">Despesas: {brl(totalDespesas)}</span>
            <span className={`font-bold ${saldoFiltrado >= 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
              Saldo: {brl(saldoFiltrado)}
            </span>
          </div>
        </div>
      </div>

      {/* Table of Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {lancamentosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Nenhum lançamento encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Conta</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lancamentosFiltrados.map(lanc => (
                  <tr key={lanc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                      {formatarDataBr(lanc.data)}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {lanc.transferencia && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-medium">
                            Transf.
                          </span>
                        )}
                        <span>{lanc.descricao}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lanc.cor || '#607D8B' }} />
                        {lanc.categoria_nome}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                      {lanc.conta_nome}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                        lanc.tipo === 'receita' ? 'text-[#2E7D32]' : 'text-red-600'
                      }`}
                    >
                      {lanc.tipo === 'receita' ? '➕ ' : '➖ '}
                      {brl(lanc.valor)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePago(lanc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          lanc.pago
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Clique para alternar status"
                      >
                        {lanc.pago ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {lanc.pago ? 'Pago' : 'Pendente'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingLanc({ ...lanc })}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lanc.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingLanc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Editar Lançamento</h3>
              <button
                onClick={() => setEditingLanc(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={editingLanc.data}
                    onChange={e => setEditingLanc({ ...editingLanc, data: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLanc.valor}
                    onChange={e => setEditingLanc({ ...editingLanc, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingLanc.descricao}
                  onChange={e => setEditingLanc({ ...editingLanc, descricao: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editingLanc.tipo}
                    onChange={e => setEditingLanc({ ...editingLanc, tipo: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Conta</label>
                  <select
                    value={editingLanc.conta_id}
                    onChange={e => setEditingLanc({ ...editingLanc, conta_id: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                  >
                    {contas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={editingLanc.categoria_id || ''}
                  onChange={e =>
                    setEditingLanc({
                      ...editingLanc,
                      categoria_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32]"
                >
                  <option value="">Sem categoria</option>
                  {allCategorias
                    .filter(c => c.tipo === editingLanc.tipo)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={editingLanc.pago}
                    onChange={e => setEditingLanc({ ...editingLanc, pago: e.target.checked })}
                    className="rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                  />
                  <span>Pago / Recebido</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingLanc(null)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2E7D32] text-white rounded text-xs font-semibold hover:bg-[#256629]"
                >
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
