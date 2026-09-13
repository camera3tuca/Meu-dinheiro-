import React, { useState, useMemo } from 'react';
import { User, Conta, TipoLancamento } from '../types';
import { storage } from '../storage';
import { brl, formatarDataBr, parseCsv, parseOfx } from '../utils';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Check, FileSpreadsheet } from 'lucide-react';

interface ImportarViewProps {
  currentUser: User;
  onNavigateLancamentos: () => void;
}

interface ParsedItem {
  id: string;
  selected: boolean;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  categoria_id: number | null;
}

export const ImportarView: React.FC<ImportarViewProps> = ({ currentUser, onNavigateLancamentos }) => {
  const [contaId, setContaId] = useState<number | ''>('');
  const [itens, setItens] = useState<ParsedItem[]>([]);
  const [arquivoNome, setArquivoNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const contas = useMemo(() => storage.getContas(currentUser.id), [currentUser.id]);
  const categorias = useMemo(() => storage.getCategorias(currentUser.id), [currentUser.id]);

  React.useEffect(() => {
    if (contas.length > 0 && contaId === '') {
      setContaId(contas[0].id);
    }
  }, [contas, contaId]);

  const processFileContent = (content: string, filename: string) => {
    setErro(null);
    setSucesso(null);
    setArquivoNome(filename);

    try {
      let rawList: Array<{ data: string; descricao: string; valor: number; tipo: TipoLancamento }> = [];
      if (filename.toLowerCase().endsWith('.ofx') || filename.toLowerCase().endsWith('.qfx') || content.includes('<OFX>')) {
        rawList = parseOfx(content);
      } else {
        rawList = parseCsv(content);
      }

      if (rawList.length === 0) {
        setErro('Nenhuma transação encontrada no arquivo. Verifique o formato.');
        return;
      }

      // Apply automatic categorization rules from db/storage
      const parsed: ParsedItem[] = rawList.map((item, idx) => {
        const sugerida = storage.sugerirCategoria(currentUser.id, item.descricao);
        return {
          id: `${Date.now()}_${idx}`,
          selected: true,
          data: item.data,
          descricao: item.descricao,
          valor: item.valor,
          tipo: item.tipo,
          categoria_id: sugerida,
        };
      });

      setItens(parsed);
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar arquivo.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      processFileContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    const sample = `Data;Descricao;Valor;Tipo
2026-09-02;Uber Corrida Centro;-32.50;despesa
2026-09-05;Supermercado Pao de Acucar;-342.18;despesa
2026-09-10;Salario Empresa SA;5400.00;receita
2026-09-12;Posto Combustivel;-150.00;despesa
2026-09-15;iFood Pedido Lanche;-64.90;despesa
2026-09-18;Farmacia Droga Raia;-89.00;despesa`;
    processFileContent(sample, 'extrato_exemplo.csv');
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setItens(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleConfirmImport = () => {
    if (!contaId) {
      setErro('Selecione uma conta bancária de destino.');
      return;
    }

    const selecionados = itens.filter(i => i.selected);
    if (selecionados.length === 0) {
      setErro('Nenhum lançamento selecionado para importação.');
      return;
    }

    const count = storage.addLancamentosBatch(
      currentUser.id,
      selecionados.map(item => ({
        data: item.data,
        descricao: item.descricao,
        valor: item.valor,
        tipo: item.tipo,
        conta_id: Number(contaId),
        categoria_id: item.categoria_id,
        pago: true,
        transferencia: false,
      }))
    );

    setSucesso(`${count} lançamentos importados com sucesso para a conta!`);
    setItens([]);
    setArquivoNome('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
            <span>📥</span> Importar extrato
          </h1>
          <p className="text-sm text-gray-500">
            Importe arquivos CSV ou OFX do seu banco com regras automáticas de categorização.
          </p>
        </div>
      </div>

      {/* Conta Selection & Upload Box */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Conta de destino
            </label>
            <select
              value={contaId}
              onChange={e => setContaId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E7D32]"
            >
              {contas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.tipo})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Os lançamentos importados serão vinculados a esta conta.
            </p>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleLoadSampleCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2E7D32]" />
              Carregar extrato de exemplo
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-gray-300 hover:border-[#2E7D32] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/20">
          <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm font-semibold text-gray-800">
            Arraste e solte o extrato aqui ou clique para selecionar
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Formatos suportados: .csv, .ofx, .qfx
          </span>
          <input
            type="file"
            accept=".csv,.ofx,.qfx,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {arquivoNome && (
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
            <FileText className="w-4 h-4 text-[#2E7D32]" />
            <span>Arquivo carregado: <strong>{arquivoNome}</strong> ({itens.length} transações detectadas)</span>
          </div>
        )}

        {erro && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              {sucesso}
            </div>
            <button
              onClick={onNavigateLancamentos}
              className="font-bold underline hover:text-emerald-900"
            >
              Ver lançamentos
            </button>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {itens.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-base text-[#1E1E1E]">Prévia dos lançamentos</h2>
              <p className="text-xs text-gray-500">
                Revise as transações, ajuste as categorias automáticas e confirme a importação.
              </p>
            </div>
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-medium text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Importar {itens.filter(i => i.selected).length} selecionados
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={itens.every(i => i.selected)}
                      onChange={e => handleToggleSelectAll(e.target.checked)}
                      className="rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                  </th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Categoria (Regra aplicada)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((item, idx) => (
                  <tr key={item.id} className={item.selected ? 'bg-white' : 'bg-gray-50/60 opacity-60'}>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={e => {
                          const val = e.target.checked;
                          setItens(prev => prev.map((it, i) => (i === idx ? { ...it, selected: val } : it)));
                        }}
                        className="rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                      />
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                      {formatarDataBr(item.data)}
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {item.descricao}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${
                        item.tipo === 'receita' ? 'text-[#2E7D32]' : 'text-red-600'
                      }`}
                    >
                      {item.tipo === 'receita' ? '+ ' : '- '}
                      {brl(item.valor)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap capitalize text-gray-600">
                      {item.tipo}
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.categoria_id || ''}
                        onChange={e => {
                          const cId = e.target.value ? Number(e.target.value) : null;
                          setItens(prev => prev.map((it, i) => (i === idx ? { ...it, categoria_id: cId } : it)));
                        }}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#2E7D32] bg-white"
                      >
                        <option value="">Sem categoria</option>
                        {categorias
                          .filter(c => c.tipo === item.tipo)
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
