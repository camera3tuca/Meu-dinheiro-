import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Download, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Share2,
  FileArchive,
  Layers,
  Maximize2,
  X,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ScienceBitLogo } from './ScienceBitLogo';
import { PLAYSTORE_ASSETS, PlayStoreAssetData } from '../data/playstoreAssetsBase64';

export const PlayStoreKitView: React.FC = () => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});
  const [previewAsset, setPreviewAsset] = useState<PlayStoreAssetData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  const privacyUrl = 'https://ais-pre-f62hdn35ttwszixw3hdor4-45073816214.us-west2.run.app/privacy.html';

  const handleCopyPrivacyUrl = () => {
    navigator.clipboard.writeText(privacyUrl);
    setCopiedPolicy(true);
    setStatusMessage('URL da Política de Privacidade copiada!');
    setTimeout(() => {
      setCopiedPolicy(false);
      setStatusMessage(null);
    }, 3000);
  };

  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;

  // Helper to convert base64 to File / Blob
  const getAssetBlob = (asset: PlayStoreAssetData): Blob => {
    const byteCharacters = atob(asset.rawBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  // Download single image using Blob & Fallback to direct anchor
  const handleDownloadSingle = (asset: PlayStoreAssetData) => {
    try {
      const blob = getAssetBlob(asset);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = asset.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadedItems(prev => ({ ...prev, [asset.filename]: true }));
      setStatusMessage(`Download iniciado: ${asset.filename}`);
      setTimeout(() => {
        setDownloadedItems(prev => ({ ...prev, [asset.filename]: false }));
        setStatusMessage(null);
      }, 3500);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (e) {
      console.error('Erro no download:', e);
      // Direct data URI fallback
      const link = document.createElement('a');
      link.href = asset.base64;
      link.download = asset.filename;
      link.click();
    }
  };

  // Native Android Share sheet (saves directly to Gallery / Google Drive / Files)
  const handleShareSingle = async (asset: PlayStoreAssetData) => {
    try {
      const blob = getAssetBlob(asset);
      const file = new File([blob], asset.filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: asset.title,
          text: `Ativo oficial para Google Play: ${asset.title} (${asset.dimensions})`
        });
      } else {
        handleDownloadSingle(asset);
      }
    } catch (e) {
      console.log('Compartilhamento cancelado ou não suportado:', e);
    }
  };

  // Download all as a single .ZIP file
  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    setStatusMessage('Preparando arquivo ZIP...');
    try {
      const zip = new JSZip();
      const folder = zip.folder('meu-dinheiro-kit-playstore-sciencebit');

      PLAYSTORE_ASSETS.forEach(item => {
        folder?.file(item.filename, item.rawBase64, { base64: true });
      });

      // Also add a helpful README.txt inside the ZIP
      folder?.file(
        'LEIA-ME.txt',
        `KIT OFICIAL DE IMAGENS - MEU DINHEIRO (SCIENCEBIT)\n` +
        `======================================================\n\n` +
        `1. icone-512x512.png:\n` +
        `   - Use no WebIntoApp (campo App Icon) e no Google Play Console (Ícone do App).\n` +
        `   - 512x512 px com fundo opaco.\n\n` +
        `2. banner-promocional-1024x500.png:\n` +
        `   - Use no Google Play Console (Gráfico de Recursos / Feature Graphic).\n` +
        `   - 1024x500 px.\n\n` +
        `3. screenshot-1-dashboard.png, screenshot-2-cartoes.png, screenshot-3-orcamento-metas.png:\n` +
        `   - Envie na seção Capturas de Tela de Telefone e Tablet do Google Play Console.\n` +
        `   - 1080x1920 px (9:16 vertical).\n\n` +
        `Desenvolvido para ScienceBit Computer.\n`
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meu-dinheiro-kit-playstore-sciencebit.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMessage('Pacote ZIP baixado com sucesso!');
      setTimeout(() => {
        setStatusMessage(null);
        URL.revokeObjectURL(url);
      }, 4000);
    } catch (err) {
      console.error('Falha ao gerar ZIP:', err);
      setStatusMessage('Erro ao gerar ZIP. Tente baixar individualmente.');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ScienceBitLogo size="md" />
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Kit Oficial Google Play & WebIntoApp
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kit de Imagens para Download
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Arquivos de alta resolução incorporados no aplicativo. Você pode baixar todos juntos em um único arquivo <strong>.ZIP</strong> ou salvar cada imagem individualmente no seu tablet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileArchive className="w-4 h-4" />
              <span>{downloadingZip ? 'Compactando...' : 'Baixar Todas as Imagens (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Box (Required by Google Play Console) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                URL da Política de Privacidade (Google Play Console)
              </h2>
              <p className="text-xs text-gray-500">
                Cole este link no campo "URL da Política de Privacidade" no formulário da Play Store.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Página</span>
            </a>

            <button
              onClick={handleCopyPrivacyUrl}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                copiedPolicy
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {copiedPolicy ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-xs text-slate-800 break-all select-all flex items-center justify-between gap-2">
          <span>{privacyUrl}</span>
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2E7D32]" />
              Arquivos Oficiais Prontos para Uso
            </h2>
            <p className="text-xs text-gray-500">
              Toque no botão verde para baixar diretamente no tablet ou toque em "Ver / Salvar" para abrir em tamanho grande.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAYSTORE_ASSETS.map((asset) => {
            const isDownloaded = downloadedItems[asset.filename];

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Preview Window with Click-to-Enlarge */}
                <div 
                  onClick={() => setPreviewAsset(asset)}
                  className="bg-slate-900 p-4 flex items-center justify-center relative min-h-[220px] max-h-[250px] overflow-hidden cursor-pointer group"
                >
                  <img
                    src={asset.base64}
                    alt={asset.title}
                    className={`object-contain max-h-[200px] w-auto rounded-lg shadow-md transition-transform group-hover:scale-105 ${
                      asset.aspect === 'square' ? 'max-w-[160px]' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Toque para Ampliar</span>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono">
                    {asset.dimensions}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${asset.badgeColor}`}>
                        {asset.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{asset.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{asset.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-gray-400 truncate">
                      {asset.filename}
                    </span>

                    <div className="flex items-center gap-2">
                      {canShareFiles && (
                        <button
                          onClick={() => handleShareSingle(asset)}
                          title="Compartilhar / Salvar no Android"
                          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadSingle(asset)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDownloaded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#2E7D32] hover:bg-[#256629] text-white shadow-2xs'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Baixado!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar PNG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Tablet Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Dica para Salvar Facilmente no Tablet Android
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
              Download em 1 Clique (.ZIP)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Toque no botão verde superior <strong>"Baixar Todas as Imagens (.ZIP)"</strong>. O Android salvará um arquivo compactado na sua pasta de Downloads com todas as 5 imagens organizadas.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1.5">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              Pressionar e Salvar Imagem
            </div>
            <p className="text-blue-900 leading-relaxed">
              Toque em qualquer imagem acima para <strong>abri-la em tela cheia</strong>. Em seguida, mantenha o dedo pressionado sobre ela e toque em <em>"Fazer download da imagem"</em> no menu do Chrome.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              Uso no WebIntoApp
            </div>
            <p className="text-emerald-900 leading-relaxed">
              No formulário do WebIntoApp, basta selecionar o arquivo <strong>icone-512x512.png</strong> no campo <em>"App Icon" → "Select from Device"</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen Preview */}
      {previewAsset && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewAsset(null)}
        >
          <div 
            className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-700 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-base">{previewAsset.title}</h4>
                <p className="text-xs text-slate-400">{previewAsset.dimensions} • {previewAsset.filename}</p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded-xl max-h-[60vh] overflow-y-auto">
              <img
                src={previewAsset.base64}
                alt={previewAsset.title}
                className="max-h-[50vh] w-auto object-contain rounded-lg shadow-lg"
              />
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Dica no tablet: Segure o dedo sobre a imagem acima e toque em <strong>"Fazer download da imagem"</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {canShareFiles && (
                <button
                  onClick={() => handleShareSingle(previewAsset)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              )}

              <button
                onClick={() => handleDownloadSingle(previewAsset)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem ({previewAsset.filename})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
