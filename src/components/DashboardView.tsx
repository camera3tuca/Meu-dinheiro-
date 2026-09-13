import React, { useState, useMemo } from 'react';
import { User, Lancamento, Conta } from '../types';
import { storage } from '../storage';
import { brl, competenciaAtual, competenciaLegivel, formatarDataBr } from '../utils';
import { ScienceBitLogo } from './ScienceBitLogo';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar, CheckCircle2, Clock, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (page: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, onNavigate }) => {
  const [competencia, setCompetencia] = useState<string>(competenciaAtual());
  const [tick, setTick] = useState(0);

  // Fetch all transactions to compute unique months
  const todosLancamentos = useMemo(() => {
    return storage.getLancamentos(currentUser.id);
  }, [currentUser.id, tick]);

  // Unique competências list
  const competencias = useMemo(() => {
    const set = new Set<string>();
    set.add(competenciaAtual());
    todosLancamentos.forEach(l => {
      const comp = l.data.slice(0, 7);
      if (comp) set.add(comp);
    });
    return Array.from(set).sort().reverse();
  }, [todosLancamentos]);

  // Transactions for current month (excluding transfers for income/expense)
  const lancamentosMes = useMemo(() => {
    return storage.getLancamentos(currentUser.id, { competencia });
  }, [currentUser.id, competencia]);

  const movimentosSemTransferencia = useMemo(() => {
    return lancamentosMes.filter(l => !l.transferencia);
  }, [lancamentosMes]);

  const contas = useMemo(() => {
    return storage.getContas(currentUser.id);
  }, [currentUser.id, todosLancamentos]);

  // Totals
  const receitas = useMemo(() => {
    return movimentosSemTransferencia
      .filter(l => l.tipo === 'receita' && l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
  }, [movimentosSemTransferencia]);

  const despesas = useMemo(() => {
    return movimentosSemTransferencia
      .filter(l => l.tipo === 'despesa' && l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
  }, [movimentosSemTransferencia]);

  const saldoMes = receitas - despesas;
  const patrimonioTotal = contas.reduce((sum, c) => sum + (c.saldo_atual || 0), 0);

  // Category Pie Data
  const dadosCategorias = useMemo(() => {
    const map = new Map<string, { valor: number; cor: string }>();
    movimentosSemTransferencia
      .filter(l => l.tipo === 'despesa' && l.pago)
      .forEach(l => {
        const catNome = l.categoria_nome || 'Sem categoria';
        const cor = l.cor || '#607D8B';
        const curr = map.get(catNome) || { valor: 0, cor };
        curr.valor += l.valor;
        map.set(catNome, curr);
      });

    return Array.from(map.entries())
      .map(([name, val]) => ({ name, value: val.valor, color: val.cor }))
      .sort((a, b) => b.value - a.value);
  }, [movimentosSemTransferencia]);

  // Daily Bar Data
  const dadosDiarios = useMemo(() => {
    const diasMap = new Map<number, { dia: number; receita: number; despesa: number }>();
    
    movimentosSemTransferencia.forEach(l => {
      if (!l.pago) return;
      const diaNum = parseInt(l.data.split('-')[2], 10);
      if (!diasMap.has(diaNum)) {
        diasMap.set(diaNum, { dia: diaNum, receita: 0, despesa: 0 });
      }
      const item = diasMap.get(diaNum)!;
      if (l.tipo === 'receita') item.receita += l.valor;
      if (l.tipo === 'despesa') item.despesa += l.valor;
    });

    return Array.from(diasMap.values()).sort((a, b) => a.dia - b.dia);
  }, [movimentosSemTransferencia]);

  // Próximos Vencimentos (7 dias ou atrasadas)
  const proximosVencimentos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite7Dias = new Date(hoje);
    limite7Dias.setDate(limite7Dias.getDate() + 7);

    return todosLancamentos
      .filter(l => !l.pago && !l.transferencia)
      .filter(l => {
        const d = new Date(l.data + 'T00:00:00');
        return d <= limite7Dias;
      })
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 5);
  }, [todosLancamentos]);

  // Cartões de Crédito
  const cartoesCredito = useMemo(() => {
    return contas.filter(c => c.tipo === 'cartao');
  }, [contas]);

  const handleTogglePago = (id: number) => {
    storage.togglePagoLancamento(currentUser.id, id);
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-6">
      {/* Title & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <ScienceBitLogo size="md" />
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div>
            <h1 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-1.5">
              <span>💰</span> Meu Dinheiro
            </h1>
            <p className="text-xs text-gray-500">
              Controle financeiro pessoal inteligente, seguro e descomplicado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-2xs">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Mês:</span>
          <select
            value={competencia}
            onChange={e => setCompetencia(e.target.value)}
            className="text-sm font-semibold text-[#1E1E1E] bg-transparent focus:outline-none cursor-pointer"
          >
            {competencias.map(c => (
              <option key={c} value={c}>
                {competenciaLegivel(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receitas do mês</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-[#2E7D32]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{brl(receitas)}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              Entradas registradas
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Despesas do mês</span>
            <span className="p-2 rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{brl(despesas)}</div>
            <div className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
              Gastos acumulados
            </div>
          </div>
        </div>

        {/* Saldo do Mês */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo do mês</span>
            <span className={`p-2 rounded-lg ${saldoMes >= 0 ? 'bg-emerald-50 text-[#2E7D32]' : 'bg-red-50 text-red-600'}`}>
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${saldoMes >= 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
              {brl(saldoMes)}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              {saldoMes >= 0 ? 'Superávit no período' : 'Déficit no período'}
            </div>
          </div>
        </div>

        {/* Patrimônio Total */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo total (contas)</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{brl(patrimonioTotal)}</div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Soma de todas as contas
            </div>
          </div>
        </div>
      </div>

      {/* Gestão Financeira: Próximos Vencimentos & Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-semibold text-sm text-gray-900">Contas a Vencer & Atrasadas</h2>
                  <p className="text-[11px] text-gray-500">Próximos 7 dias ou pendências anteriores</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('lancamentos')}
                className="text-xs text-[#2E7D32] hover:underline font-medium flex items-center gap-0.5"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {proximosVencimentos.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500 flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span>Nenhum pagamento pendente para os próximos 7 dias!</span>
                </div>
              ) : (
                proximosVencimentos.map(item => {
                  const hojeStr = new Date().toISOString().split('T')[0];
                  const isAtrasado = item.data < hojeStr;
                  const isHoje = item.data === hojeStr;

                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50/70 px-1 rounded-md transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-900 truncate">{item.descricao}</span>
                          {isAtrasado ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium whitespace-nowrap">
                              Atrasada
                            </span>
                          ) : isHoje ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-medium whitespace-nowrap">
                              Vence hoje
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                              {formatarDataBr(item.data)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {item.conta_nome || 'Conta'} • {item.categoria_nome || 'Geral'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold whitespace-nowrap ${item.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {brl(item.valor)}
                        </span>
                        <button
                          onClick={() => handleTogglePago(item.id)}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-200"
                          title="Marcar como Pago / Recebido"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pagar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Resumo de Cartões de Crédito */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-semibold text-sm text-gray-900">Cartões de Crédito</h2>
                  <p className="text-[11px] text-gray-500">Limites disponíveis e datas de faturas</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('contas')}
                className="text-xs text-[#2E7D32] hover:underline font-medium flex items-center gap-0.5"
              >
                Gerenciar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {cartoesCredito.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  <span>Você ainda não cadastrou nenhum cartão de crédito.</span>
                  <button
                    onClick={() => onNavigate('contas')}
                    className="mt-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md font-medium"
                  >
                    Cadastrar Cartão
                  </button>
                </div>
              ) : (
                cartoesCredito.map(cartao => {
                  const despesasCartao = todosLancamentos
                    .filter(l => l.conta_id === cartao.id && l.tipo === 'despesa' && !l.pago)
                    .reduce((sum, l) => sum + l.valor, 0);

                  const limiteTotalVal = cartao.limite_total || 0;
                  const limiteDisp = Math.max(0, limiteTotalVal - despesasCartao);
                  const percUso = limiteTotalVal > 0 ? Math.min(100, Math.round((despesasCartao / limiteTotalVal) * 100)) : 0;

                  return (
                    <div key={cartao.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{cartao.nome}</span>
                        <span className="font-medium text-gray-600">
                          Fatura atual: <strong className="text-red-600">{brl(despesasCartao)}</strong>
                        </span>
                      </div>

                      {limiteTotalVal > 0 ? (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percUso > 85 ? 'bg-red-500' : percUso > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percUso}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <span>Disp.: <strong className="text-emerald-700">{brl(limiteDisp)}</strong></span>
                            <span>{percUso}% usado de {brl(limiteTotalVal)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Limite não configurado.</div>
                      )}

                      {(cartao.dia_fechamento || cartao.dia_vencimento) && (
                        <div className="pt-1 text-[10px] text-gray-500 flex justify-between border-t border-gray-200/60">
                          {cartao.dia_fechamento && <span>Fechamento dia <strong>{cartao.dia_fechamento}</strong></span>}
                          {cartao.dia_vencimento && <span>Vencimento dia <strong>{cartao.dia_vencimento}</strong></span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-[#1E1E1E]">Despesas por categoria</h2>
            <span className="text-xs text-gray-600 font-medium">Competência {competenciaLegivel(competencia)}</span>
          </div>

          {dadosCategorias.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-600 bg-gray-50 rounded-lg">
              Sem despesas registradas neste mês.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosCategorias}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [brl(Number(val)), 'Gasto']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(val) => <span className="text-xs text-gray-700">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Receitas x Despesas por Dia */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-[#1E1E1E]">Receitas x Despesas por dia</h2>
            <span className="text-xs text-gray-600 font-medium">Evolução diária</span>
          </div>

          {dadosDiarios.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-600 bg-gray-50 rounded-lg">
              Sem lançamentos registrados neste mês.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosDiarios} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="dia" 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                    tickFormatter={(dia) => `Dia ${dia}`}
                  />
                  <YAxis 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [brl(Number(val)), name === 'receita' ? 'Receita' : 'Despesa']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    formatter={(name) => <span className="text-xs text-gray-700 capitalize">{name}</span>}
                  />
                  <Bar dataKey="receita" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="despesa" fill="#C62828" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tables: Saldo por Conta + Últimos Lançamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contas */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-[#1E1E1E]">Saldo por conta</h2>
            <button
              onClick={() => onNavigate('contas')}
              className="text-xs font-semibold text-[#2E7D32] hover:underline"
            >
              Ver todas
            </button>
          </div>

          {contas.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">Nenhuma conta cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {contas.map(conta => (
                <div key={conta.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conta.nome}</p>
                    <p className="text-xs text-gray-600 capitalize">{conta.tipo}</p>
                  </div>
                  <span className={`text-sm font-semibold ${(conta.saldo_atual || 0) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {brl(conta.saldo_atual)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Lançamentos */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-[#1E1E1E]">Últimos lançamentos do mês</h2>
            <button
              onClick={() => onNavigate('lancamentos')}
              className="text-xs font-semibold text-[#2E7D32] hover:underline"
            >
              Gerenciar lançamentos
            </button>
          </div>

          {lancamentosMes.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">
              Adicione lançamentos na página de <strong>Lançamentos</strong>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Descrição</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Conta</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lancamentosMes.slice(0, 7).map(lanc => (
                    <tr key={lanc.id} className="hover:bg-gray-50/80">
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {formatarDataBr(lanc.data)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900 truncate max-w-[200px]">
                        {lanc.descricao}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lanc.cor || '#607D8B' }} />
                          {lanc.categoria_nome}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {lanc.conta_nome}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${
                        lanc.tipo === 'receita' ? 'text-[#2E7D32]' : 'text-red-600'
                      }`}>
                        {lanc.tipo === 'receita' ? '➕ ' : '➖ '}
                        {brl(lanc.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
