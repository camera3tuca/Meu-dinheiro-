import React, { useState, useRef } from 'react';
import { storage } from '../storage';
import { Download, Upload, RefreshCw, X, CheckCircle2, AlertTriangle, ShieldCheck, FileJson } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const json = storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `meu_dinheiro_backup_${today}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMensagem({
        tipo: 'sucesso',
        texto: 'Arquivo de backup gerado e baixado com sucesso!',
      });
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: 'Falha ao gerar arquivo de backup.',
      });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMensagem(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const result = storage.importBackup(content);
        if (result.success) {
          setMensagem({
            tipo: 'sucesso',
            texto: `${result.message} (${result.lancamentosCount || 0} lançamentos carregados)`,
          });
          onDataChanged();
        } else {
          setMensagem({
            tipo: 'erro',
            texto: result.message,
          });
        }
      } catch (err: any) {
        setMensagem({
          tipo: 'erro',
          texto: 'Não foi possível ler o arquivo de backup selecionado.',
        });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setMensagem({ tipo: 'erro', texto: 'Erro ao abrir o arquivo.' });
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleResetToClean = () => {
    if (confirm('Atenção: Deseja apagar todos os lançamentos e contas e deixar o aplicativo com os dados 100% zerados?')) {
      storage.resetToClean();
      storage.setOnboardingCompleted(false);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Aplicativo zerado com sucesso! Você pode iniciar o passo a passo.',
      });
      onDataChanged();
    }
  };

  const handleLoadSample = () => {
    if (confirm('Deseja preencher o aplicativo com dados fictícios de exemplo para demonstração?')) {
      storage.loadSampleData();
      storage.setOnboardingCompleted(true);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Dados de demonstração carregados com sucesso!',
      });
      onDataChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-gray-900 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#2E7D32]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Backup & Segurança dos Dados</h2>
              <p className="text-xs text-gray-500">Exporte ou importe seus registros financeiros com segurança</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Action 1: Export */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-sm font-semibold text-gray-800">Exportar Backup Completo</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
              Formato .JSON
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Salva todos os seus lançamentos, contas, categorias, metas, regras e orçamentos em um arquivo no seu dispositivo.
          </p>
          <button
            onClick={handleExportBackup}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar arquivo de backup (.json)
          </button>
        </div>

        {/* Action 2: Import */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">Restaurar Backup</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
              Importar
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Selecione um arquivo de backup previamente exportado para restaurar todas as suas informações.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileJson className="w-4 h-4 text-blue-600" />
            {loading ? 'Processando...' : 'Selecionar arquivo de backup'}
          </button>
        </div>

        {/* Action 3: Reset / Limpar */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <button
            onClick={handleResetToClean}
            className="text-red-600 hover:text-red-700 font-semibold hover:underline text-xs flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Zerar tudo (dados limpos)
          </button>

          <button
            onClick={handleLoadSample}
            className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline text-xs flex items-center gap-1 cursor-pointer"
          >
            Carregar dados de exemplo (demo)
          </button>
        </div>
      </div>
    </div>
  );
};
