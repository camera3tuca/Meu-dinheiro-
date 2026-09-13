import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (compact) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors shadow-2xs"
          title="Instalar aplicativo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      );
    }
    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#256629] transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Instalar no Celular</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-medium border border-gray-200 transition-colors"
              : "w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          }
        >
          <Smartphone className="w-4 h-4 text-gray-500" />
          <span>{compact ? 'Instalar' : 'Instalar no iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-gray-900">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#2E7D32]" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold shrink-0">1</span>
                  <p>Abra este site no navegador <strong>Safari</strong> do seu iPhone.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold shrink-0">2</span>
                  <p className="flex items-center gap-1">
                    Toque no botão <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline text-blue-600" /> na barra inferior do Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold shrink-0">3</span>
                  <p>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-[#2E7D32] py-2 text-xs font-semibold text-white hover:bg-[#256629]"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
