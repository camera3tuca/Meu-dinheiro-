import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { storage } from '../storage';
import { brl, competenciaLegivel, MESES_CURTOS_PT, exportCsv, formatarDataBr } from '../utils';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { Download, Printer, Calendar, BarChart3 } from 'lucide-react';

interface RelatoriosViewProps {
  currentUser: User;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({ currentUser }) => {
  const currentYear = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState<number>(currentYear);

  const lancamentos = useMemo(() => {
    return storage.getLancamentos(currentUser.id, { ignorarTransferencias: true });
  }, [currentUser.id]);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>();
    set.add(currentYear);
    lancamentos.forEach(l => {
      const ano = parseInt(l.data.slice(0, 4), 10);
      if (!isNaN(ano)) set.add(ano);
    });
    return Array.from(set).sort().reverse();
  }, [lancamentos, currentYear]);

  // Evolução Mensal (all months sorted)
  const dadosEvolucaoMensal = useMemo(() => {
    const map = new Map<string, { comp: string; receita: number; despesa: number }>();

    lancamentos.forEach(l => {
      if (!l.pago) return;
      const comp = l.data.slice(0, 7);
      if (!map.has(comp)) {
        map.set(comp, { comp, receita: 0, despesa: 0 });
      }
      const item = map.get(comp)!;
      if (l.tipo === 'receita') item.receita += l.valor;
      if (l.tipo === 'despesa') item.despesa += l.valor;
    });

    return Array.from(map.values())
      .sort((a, b) => a.comp.localeCompare(b.comp))
      .map(item => ({
        comp: item.comp,
        mes: competenciaLegivel(item.comp),
        receita: item.receita,
        despesa: item.despesa,
        saldo: item.receita - item.despesa,
      }));
  }, [lancamentos]);

  // Top Categorias de Despesa
  const topCategoriasDespesa = useMemo(() => {
    const map = new Map<string, { categoria: string; total: number; cor: string }>();

    lancamentos
      .filter(l => l.tipo === 'despesa' && l.pago)
      .forEach(l => {
        const cat = l.categoria_nome || 'Sem categoria';
        const cor = l.cor || '#607D8B';
        const curr = map.get(cat) || { categoria: cat, total: 0, cor };
        curr.total += l.valor;
        map.set(cat, curr);
      });

    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [lancamentos]);

  // Relatório Anual Matrix (Categories x Months)
  const relatorioAnual = useMemo(() => {
    const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const lancAno = lancamentos.filter(l => l.data.startsWith(String(anoSelecionado)) && l.pago);

    const categoriasMap = new Map<string, { nome: string; tipo: 'receita' | 'despesa'; meses: Record<string, number>; total: number }>();

    lancAno.forEach(l => {
      const key = `${l.tipo}_${l.categoria_nome || 'Sem categoria'}`;
      const mes = l.data.slice(5, 7);
      if (!categoriasMap.has(key)) {
        categoriasMap.set(key, {
          nome: l.categoria_nome || 'Sem categoria',
          tipo: l.tipo,
          meses: { '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0, '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0 },
          total: 0,
        });
      }
      const entry = categoriasMap.get(key)!;
      entry.meses[mes] = (entry.meses[mes] || 0) + l.valor;
      entry.total += l.valor;
    });

    const totReceitasMes: Record<string, number> = {};
    const totDespesasMes: Record<string, number> = {};
    meses.forEach(m => {
      totReceitasMes[m] = 0;
      totDespesasMes[m] = 0;
    });

    categoriasMap.forEach(cat => {
      meses.forEach(m => {
        if (cat.tipo === 'receita') totReceitasMes[m] += cat.meses[m];
        if (cat.tipo === 'despesa') totDespesasMes[m] += cat.meses[m];
      });
    });

    const rows = Array.from(categoriasMap.values()).sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === 'receita' ? -1 : 1;
      return b.total - a.total;
    });

    return {
      meses,
      rows,
      totReceitasMes,
      totDespesasMes,
      totalReceitasAno: Object.values(totReceitasMes).reduce((a, b) => a + b, 0),
      totalDespesasAno: Object.values(totDespesasMes).reduce((a, b) => a + b, 0),
    };
  }, [lancamentos, anoSelecionado]);

  // Export handlers
  const handleExportLancamentosCsv = () => {
    const headers = ['ID', 'Data', 'Descrição', 'Valor', 'Tipo', 'Conta', 'Categoria', 'Pago', 'Transferência'];
    const rows = lancamentos.map(l => [
      l.id,
      formatarDataBr(l.data),
      l.descricao,
      l.valor.toFixed(2),
      l.tipo,
      l.conta_nome || '',
      l.categoria_nome || '',
      l.pago ? 'Sim' : 'Não',
      l.transferencia ? 'Sim' : 'Não',
    ]);
    exportCsv(`meu_dinheiro_lancamentos_${anoSelecionado}.csv`, headers, rows);
  };

  const handleExportAnualCsv = () => {
    const headers = ['Categoria', 'Tipo', ...relatorioAnual.meses.map(m => MESES_CURTOS_PT[m]), 'Total'];
    const rows = relatorioAnual.rows.map(r => [
      r.nome,
      r.tipo,
      ...relatorioAnual.meses.map(m => (r.meses[m] || 0).toFixed(2)),
      r.total.toFixed(2),
    ]);
    exportCsv(`meu_dinheiro_relatorio_anual_${anoSelecionado}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>📊</span> Relatórios
          </h1>
          <p className="text-sm text-gray-500">
            Evolução financeira, comparativos por categoria e relatório anual consolidado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLancamentosCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#2E7D32]" />
            Exportar Lançamentos (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            Imprimir
          </button>
        </div>
      </div>

      {lancamentos.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-gray-200">
          Ainda não há lançamentos cadastrados para gerar relatórios.
        </div>
      ) : (
        <>
          {/* Evolução Mensal Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <h2 className="font-semibold text-base text-[#1E1E1E] mb-1">Evolução mensal</h2>
            <p className="text-xs text-gray-500 mb-4">Receitas, despesas e saldo líquido consolidado mês a mês.</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosEvolucaoMensal} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                    tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [brl(Number(val)), '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Line type="monotone" dataKey="receita" stroke="#2E7D32" strokeWidth={2.5} name="Receita" dot />
                  <Line type="monotone" dataKey="despesa" stroke="#C62828" strokeWidth={2.5} name="Despesa" dot />
                  <Line type="monotone" dataKey="saldo" stroke="#1565C0" strokeWidth={2} strokeDasharray="4 4" name="Saldo" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categorias de Despesa */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <h2 className="font-semibold text-base text-[#1E1E1E] mb-1">Maiores categorias de despesa</h2>
            <p className="text-xs text-gray-500 mb-4">Acumulado das despesas pagas por categoria.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCategoriasDespesa} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                    <XAxis type="number" tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="categoria" type="category" tickLine={false} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(val: any) => [brl(Number(val)), 'Total']} />
                    <Bar dataKey="total" fill="#C62828" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-64 pr-2">
                {topCategoriasDespesa.map((cat, idx) => (
                  <div key={cat.categoria} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-gray-400 font-bold">{idx + 1}º</span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }} />
                      <span className="font-medium text-gray-900">{cat.categoria}</span>
                    </div>
                    <span className="font-bold text-gray-900">{brl(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Relatório Anual (Matrix) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-base text-[#1E1E1E]">Relatório anual por categoria</h2>
                <p className="text-xs text-gray-500">Demonstrativo detalhado de receitas e despesas nos 12 meses do ano.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Ano:</span>
                  <select
                    value={anoSelecionado}
                    onChange={e => setAnoSelecionado(Number(e.target.value))}
                    className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
                  >
                    {anosDisponiveis.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExportAnualCsv}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2E7D32] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                >
                  <Download className="w-3.5 h-3.5" /> CSV Anual
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <th className="py-2.5 px-2.5 sticky left-0 bg-gray-50 min-w-[140px]">Categoria</th>
                    {relatorioAnual.meses.map(m => (
                      <th key={m} className="py-2.5 px-2 text-right min-w-[65px]">
                        {MESES_CURTOS_PT[m]}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right font-bold min-w-[85px] bg-gray-100">Total Ano</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {relatorioAnual.rows.map(row => (
                    <tr key={`${row.tipo}_${row.nome}`} className="hover:bg-gray-50/80">
                      <td className="py-2 px-2.5 font-medium sticky left-0 bg-white">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                          row.tipo === 'receita' ? 'bg-[#2E7D32]' : 'bg-red-600'
                        }`} />
                        {row.nome}
                      </td>
                      {relatorioAnual.meses.map(m => {
                        const val = row.meses[m] || 0;
                        return (
                          <td key={m} className={`py-2 px-2 text-right ${val === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
                            {val === 0 ? '-' : brl(val).replace('R$', '').trim()}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-right font-semibold bg-gray-50 text-gray-900">
                        {brl(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-emerald-600 bg-emerald-50/60 font-bold text-[#2E7D32]">
                    <td className="py-2.5 px-2.5 sticky left-0 bg-emerald-50/90">Total Receitas</td>
                    {relatorioAnual.meses.map(m => (
                      <td key={m} className="py-2.5 px-2 text-right">
                        {brl(relatorioAnual.totReceitasMes[m]).replace('R$', '').trim()}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right bg-emerald-100 font-extrabold">
                      {brl(relatorioAnual.totalReceitasAno)}
                    </td>
                  </tr>
                  <tr className="border-t border-red-200 bg-red-50/60 font-bold text-red-700">
                    <td className="py-2.5 px-2.5 sticky left-0 bg-red-50/90">Total Despesas</td>
                    {relatorioAnual.meses.map(m => (
                      <td key={m} className="py-2.5 px-2 text-right">
                        {brl(relatorioAnual.totDespesasMes[m]).replace('R$', '').trim()}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right bg-red-100 font-extrabold">
                      {brl(relatorioAnual.totalDespesasAno)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300 bg-gray-100 font-extrabold text-gray-900">
                    <td className="py-2.5 px-2.5 sticky left-0 bg-gray-100">Saldo Líquido</td>
                    {relatorioAnual.meses.map(m => {
                      const s = relatorioAnual.totReceitasMes[m] - relatorioAnual.totDespesasMes[m];
                      return (
                        <td key={m} className={`py-2.5 px-2 text-right ${s >= 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                          {brl(s).replace('R$', '').trim()}
                        </td>
                      );
                    })}
                    <td className={`py-2.5 px-3 text-right font-extrabold ${
                      relatorioAnual.totalReceitasAno - relatorioAnual.totalDespesasAno >= 0 ? 'text-[#2E7D32]' : 'text-red-600'
                    }`}>
                      {brl(relatorioAnual.totalReceitasAno - relatorioAnual.totalDespesasAno)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
