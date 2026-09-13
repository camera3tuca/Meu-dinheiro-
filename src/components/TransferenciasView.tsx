import React, { useState, useMemo } from 'react';
import { User, Conta } from '../types';
import { storage } from '../storage';
import { brl, formatarDataBr } from '../utils';
import { ArrowLeftRight, ArrowRight, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface TransferenciasViewProps {
  currentUser: User;
}

export const TransferenciasView: React.FC<TransferenciasViewProps> = ({ currentUser }) => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [contaOrigemId, setContaOrigemId] = useState<number | ''>('');
  const [contaDestinoId, setContaDestinoId] = useState<number | ''>('');
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [tick, setTick] = useState(0);

  const contas = useMemo(() => storage.getContas(currentUser.id), [currentUser.id, tick]);

  React.useEffect(() => {
    if (contas.length >= 2) {
      if (contaOrigemId === '') setContaOrigemId(contas[0].id);
      if (contaDestinoId === '') setContaDestinoId(contas[1].id);
    } else if (contas.length === 1) {
      setContaOrigemId(contas[0].id);
    }
  }, [contas, contaOrigemId, contaDestinoId]);

  // Find all transactions that are transfers
  const transferencias = useMemo(() => {
    const all = storage.getLancamentos(currentUser.id);
    // filter where transferencia is true and tipo is 'despesa' (the origin side of each pair)
    return all.filter(l => l.transferencia && l.tipo === 'despesa');
  }, [currentUser.id, tick]);

  const handleTransferir = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    if (contaOrigemId === '' || contaDestinoId === '') {
      setMensagem({ tipo: 'erro', texto: 'Selecione a conta de origem e de destino.' });
      return;
    }

    if (contaOrigemId === contaDestinoId) {
      setMensagem({ tipo: 'erro', texto: 'A conta de origem e destino não podem ser iguais.' });
      return;
    }

    const valNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) {
      setMensagem({ tipo: 'erro', texto: 'O valor deve ser maior que zero.' });
      return;
    }

    try {
      storage.realizarTransferencia(
        currentUser.id,
        Number(contaOrigemId),
        Number(contaDestinoId),
        valNum,
        data,
        observacao.trim()
      );
      setMensagem({
        tipo: 'sucesso',
        texto: `Transferência de ${brl(valNum)} realizada com sucesso!`,
      });
      setValor('');
      setObservacao('');
      setTick(t => t + 1);
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao realizar transferência.' });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Deseja excluir este registro de transferência?')) {
      storage.deleteLancamento(currentUser.id, id);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>🔁</span> Transferências
          </h1>
          <p className="text-sm text-gray-500">
            Transfira valores entre contas (ex.: corrente para investimento) sem afetar seu orçamento de despesas.
          </p>
        </div>
      </div>

      {contas.length < 2 ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Você precisa de pelo menos 2 contas cadastradas para realizar transferências. Cadastre na página de <strong>Contas</strong>.
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
          <h2 className="font-semibold text-sm text-[#1E1E1E] flex items-center gap-2 mb-4">
            <ArrowLeftRight className="w-4 h-4 text-teal-600" /> Nova transferência
          </h2>

          <form onSubmit={handleTransferir} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conta de Origem (Sai)</label>
                <select
                  value={contaOrigemId}
                  onChange={e => setContaOrigemId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                >
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({brl(c.saldo_atual)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conta de Destino (Entra)</label>
                <select
                  value={contaDestinoId}
                  onChange={e => setContaDestinoId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                >
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({brl(c.saldo_atual)})
                    </option>
                  ))}
                </select>
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
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Observação (Opcional)</label>
              <input
                type="text"
                placeholder="Ex.: Aplicação na Poupança, Pagamento de fatura"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            {mensagem && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  mensagem.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {mensagem.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {mensagem.texto}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
              >
                Realizar transferência
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Histórico de Transferências */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <h2 className="font-semibold text-base text-[#1E1E1E]">Histórico de transferências</h2>

        {transferencias.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Nenhuma transferência registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição / Movimentação</th>
                  <th className="py-2.5 px-3">Conta de Origem</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transferencias.map(tr => (
                  <tr key={tr.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                      {formatarDataBr(tr.data)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-teal-50 text-teal-700">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </span>
                        <span>{tr.descricao}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                      {tr.conta_nome}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-700 whitespace-nowrap">
                      {brl(tr.valor)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDelete(tr.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
