import React, { useState, useMemo } from 'react';
import { User, Conta, TipoConta } from '../types';
import { storage } from '../storage';
import { brl } from '../utils';
import { Landmark, Plus, Trash2, Wallet, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';

interface ContasViewProps {
  currentUser: User;
}

const TIPOS_LABEL: Record<TipoConta, string> = {
  dinheiro: 'Dinheiro',
  corrente: 'Conta corrente',
  poupanca: 'Poupança',
  cartao: 'Cartão de crédito',
  investimento: 'Investimento',
};

const TIPO_ICONS: Record<TipoConta, React.ReactNode> = {
  dinheiro: <Wallet className="w-4 h-4 text-emerald-600" />,
  corrente: <Landmark className="w-4 h-4 text-blue-600" />,
  poupanca: <PiggyBank className="w-4 h-4 text-pink-600" />,
  cartao: <CreditCard className="w-4 h-4 text-amber-600" />,
  investimento: <TrendingUp className="w-4 h-4 text-purple-600" />,
};

export const ContasView: React.FC<ContasViewProps> = ({ currentUser }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoConta>('corrente');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [limiteTotal, setLimiteTotal] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('20');
  const [diaVencimento, setDiaVencimento] = useState('28');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [tick, setTick] = useState(0);

  const contas = useMemo(() => {
    return storage.getContas(currentUser.id);
  }, [currentUser.id, tick]);

  const lancamentos = useMemo(() => {
    return storage.getLancamentos(currentUser.id);
  }, [currentUser.id, tick]);

  const saldoTotal = useMemo(() => {
    return contas.reduce((sum, c) => sum + (c.saldo_atual || 0), 0);
  }, [contas]);

  const handleAddConta = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    if (!nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe o nome da conta.' });
      return;
    }
    const saldoNum = parseFloat(saldoInicial.replace(',', '.')) || 0;
    const limiteNum = tipo === 'cartao' ? parseFloat(limiteTotal.replace(',', '.')) || 0 : undefined;
    const fechamentoNum = tipo === 'cartao' ? parseInt(diaFechamento, 10) || 20 : undefined;
    const vencimentoNum = tipo === 'cartao' ? parseInt(diaVencimento, 10) || 28 : undefined;

    try {
      storage.addConta(currentUser.id, nome, tipo, saldoNum, {
        limite_total: limiteNum,
        dia_fechamento: fechamentoNum,
        dia_vencimento: vencimentoNum,
      });
      setMensagem({ tipo: 'sucesso', texto: `Conta '${nome}' criada com sucesso!` });
      setNome('');
      setSaldoInicial('');
      setLimiteTotal('');
      setTick(t => t + 1);
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Já existe uma conta com esse nome.' });
    }
  };

  const handleDelete = (conta: Conta) => {
    if (confirm(`Excluir a conta '${conta.nome}' e todos os seus lançamentos vinculados?`)) {
      storage.deleteConta(currentUser.id, conta.id);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🏦</span> Contas & Cartões
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie suas contas bancárias, faturas e limites de cartões de crédito, poupança e investimentos.
          </p>
        </div>
      </div>

      {/* Nova Conta Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
        <h2 className="font-semibold text-sm text-[#1E1E1E] flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-[#2E7D32]" /> Adicionar conta ou cartão
        </h2>

        <form onSubmit={handleAddConta} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                placeholder="Ex.: Nubank, Itaú, Carteira"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoConta)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              >
                {(Object.keys(TIPOS_LABEL) as TipoConta[]).map(t => (
                  <option key={t} value={t}>
                    {TIPOS_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {tipo === 'cartao' ? 'Saldo da Fatura Atual (R$)' : 'Saldo inicial (R$)'}
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              />
            </div>
          </div>

          {/* Campos de Cartão de Crédito e Fatura */}
          {tipo === 'cartao' && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-amber-900 mb-1">Limite Total do Cartão (R$)</label>
                <input
                  type="text"
                  placeholder="Ex.: 5000,00"
                  value={limiteTotal}
                  onChange={e => setLimiteTotal(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-900 mb-1">Dia de Fechamento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex.: 20"
                  value={diaFechamento}
                  onChange={e => setDiaFechamento(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-900 mb-1">Dia de Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex.: 28"
                  value={diaVencimento}
                  onChange={e => setDiaVencimento(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          )}

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
              Adicionar conta
            </button>
          </div>
        </form>
      </div>

      {/* Suas Contas List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-base text-[#1E1E1E]">Suas contas e cartões</h2>
            <p className="text-xs text-gray-500">Saldo atual e limites atualizados automaticamente.</p>
          </div>
          <div className="bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
            <span className="text-xs text-gray-600 block">Saldo líquido total:</span>
            <span className="text-base font-bold text-[#2E7D32]">{brl(saldoTotal)}</span>
          </div>
        </div>

        {contas.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Nenhuma conta cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Conta / Cartão</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 text-right">Saldo Inicial</th>
                  <th className="py-2.5 px-3 text-right">Saldo / Fatura Atual</th>
                  <th className="py-2.5 px-3 text-center">Detalhes / Limite</th>
                  <th className="py-2.5 px-3 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contas.map(conta => {
                  const isCartao = conta.tipo === 'cartao';
                  // Calculate card limit details
                  const gastosNaoPagos = isCartao
                    ? lancamentos
                        .filter(l => l.conta_id === conta.id && l.tipo === 'despesa' && !l.pago)
                        .reduce((sum, l) => sum + l.valor, 0)
                    : 0;

                  const limiteTotalVal = conta.limite_total || 0;
                  const limiteDisponivel = Math.max(0, limiteTotalVal - gastosNaoPagos);
                  const percUso = limiteTotalVal > 0 ? Math.min(100, Math.round((gastosNaoPagos / limiteTotalVal) * 100)) : 0;

                  return (
                    <tr key={conta.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-semibold text-gray-900 flex items-center gap-2">
                        <span className="p-1.5 rounded-md bg-gray-100">{TIPO_ICONS[conta.tipo]}</span>
                        {conta.nome}
                      </td>
                      <td className="py-3 px-3 text-gray-600 capitalize">
                        {TIPOS_LABEL[conta.tipo] || conta.tipo}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500">
                        {brl(conta.saldo_inicial)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold text-sm ${
                          (conta.saldo_atual || 0) >= 0 ? 'text-gray-900' : 'text-red-600'
                        }`}
                      >
                        {brl(conta.saldo_atual)}
                      </td>
                      <td className="py-3 px-3">
                        {isCartao && limiteTotalVal > 0 ? (
                          <div className="w-44 mx-auto space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                              <span>Disp: <strong className="text-emerald-700">{brl(limiteDisponivel)}</strong></span>
                              <span>{percUso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percUso > 85 ? 'bg-red-500' : percUso > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percUso}%` }}
                              />
                            </div>
                            {(conta.dia_fechamento || conta.dia_vencimento) && (
                              <div className="text-[9px] text-gray-400 flex justify-between">
                                {conta.dia_fechamento && <span>Fecha dia {conta.dia_fechamento}</span>}
                                {conta.dia_vencimento && <span>Vence dia {conta.dia_vencimento}</span>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-center block">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDelete(conta)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir conta e lançamentos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
