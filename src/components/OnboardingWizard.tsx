import React, { useState } from 'react';
import { User, Conta, TipoConta, TipoLancamento } from '../types';
import { storage } from '../storage';
import { brl } from '../utils';
import { 
  CheckCircle2, 
  ArrowRight, 
  Wallet, 
  CreditCard, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  HelpCircle,
  PiggyBank,
  FileCheck
} from 'lucide-react';

interface OnboardingWizardProps {
  currentUser: User;
  onComplete: () => void;
  onDataChanged: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentUser,
  onComplete,
  onDataChanged,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Passo 1: Configuração das Contas / Saldo inicial
  const [nomeConta, setNomeConta] = useState('Conta Corrente');
  const [tipoConta, setTipoConta] = useState<TipoConta>('corrente');
  const [saldoInicialConta, setSaldoInicialConta] = useState('');

  // Cartão opcional no passo 1
  const [adicionarCartao, setAdicionarCartao] = useState(false);
  const [nomeCartao, setNomeCartao] = useState('Cartão de Crédito');
  const [limiteCartao, setLimiteCartao] = useState('');
  const [fechamentoCartao, setFechamentoCartao] = useState('20');
  const [vencimentoCartao, setVencimentoCartao] = useState('28');

  // Passo 2: Primeiro Lançamento (Receita ou Despesa)
  const [tipoLanc, setTipoLanc] = useState<TipoLancamento>('receita');
  const [descLanc, setDescLanc] = useState('Salário');
  const [valorLanc, setValorLanc] = useState('');
  const [categoriaIdLanc, setCategoriaIdLanc] = useState<number | ''>('');
  const [pularLancamento, setPularLancamento] = useState(false);

  // Passo 3: Meta opcional
  const [adicionarMeta, setAdicionarMeta] = useState(false);
  const [nomeMeta, setNomeMeta] = useState('Reserva de Emergência');
  const [valorAlvoMeta, setValorAlvoMeta] = useState('5000');
  const [valorAtualMeta, setValorAtualMeta] = useState('0');

  const [erro, setErro] = useState<string | null>(null);

  // Buscar contas e categorias atuais do usuário
  const contas = storage.getContas(currentUser.id);
  const categorias = storage.getCategorias(currentUser.id, tipoLanc);

  // Seleciona uma categoria padrão se não houver
  React.useEffect(() => {
    if (categorias.length > 0 && categoriaIdLanc === '') {
      setCategoriaIdLanc(categorias[0].id);
    }
  }, [categorias, categoriaIdLanc]);

  const handleNextFromStep1 = () => {
    setErro(null);
    if (!nomeConta.trim()) {
      setErro('Informe o nome da sua conta principal.');
      return;
    }

    const saldoNum = parseFloat(saldoInicialConta.replace(',', '.')) || 0;
    
    // Atualiza ou cria a conta inicial
    const existingConta = contas.find(c => c.nome.toLowerCase() === nomeConta.trim().toLowerCase());
    if (existingConta) {
      storage.updateConta(currentUser.id, existingConta.id, {
        saldo_inicial: saldoNum,
        tipo: tipoConta,
      });
    } else {
      storage.addConta(currentUser.id, nomeConta.trim(), tipoConta, saldoNum);
    }

    // Se optou por cadastrar cartão
    if (adicionarCartao && nomeCartao.trim()) {
      const limiteNum = parseFloat(limiteCartao.replace(',', '.')) || 0;
      const fech = parseInt(fechamentoCartao, 10) || 20;
      const venc = parseInt(vencimentoCartao, 10) || 28;
      
      const existingCard = contas.find(c => c.nome.toLowerCase() === nomeCartao.trim().toLowerCase());
      if (!existingCard) {
        storage.addConta(currentUser.id, nomeCartao.trim(), 'cartao', 0, {
          limite_total: limiteNum,
          dia_fechamento: fech,
          dia_vencimento: venc,
        });
      }
    }

    onDataChanged();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setErro(null);
    if (!pularLancamento) {
      const val = parseFloat(valorLanc.replace(',', '.'));
      if (!val || val <= 0) {
        setErro('Informe um valor válido ou marque a opção de pular por enquanto.');
        return;
      }
      if (!descLanc.trim()) {
        setErro('Informe a descrição do seu lançamento.');
        return;
      }

      const userContas = storage.getContas(currentUser.id);
      const contaAlvo = userContas[0]?.id || 1;
      const today = new Date().toISOString().split('T')[0];

      storage.addLancamento(currentUser.id, {
        data: today,
        descricao: descLanc.trim(),
        valor: val,
        tipo: tipoLanc,
        conta_id: contaAlvo,
        categoria_id: categoriaIdLanc ? Number(categoriaIdLanc) : null,
        pago: true,
        transferencia: false,
      });
      onDataChanged();
    }

    setStep(3);
  };

  const handleNextFromStep3 = () => {
    setErro(null);
    if (adicionarMeta && nomeMeta.trim()) {
      const alvo = parseFloat(valorAlvoMeta.replace(',', '.')) || 1000;
      const atual = parseFloat(valorAtualMeta.replace(',', '.')) || 0;

      storage.addMeta(currentUser.id, nomeMeta.trim(), alvo, atual);
      onDataChanged();
    }
    setStep(4);
  };

  const handleFinalizar = () => {
    storage.setOnboardingCompleted(true);
    onComplete();
  };

  const handleUsarDadosExemplo = () => {
    if (confirm('Deseja carregar dados de demonstração para conhecer todas as telas do aplicativo? Você poderá limpá-los a qualquer momento no menu lateral.')) {
      storage.loadSampleData();
      storage.setOnboardingCompleted(true);
      onDataChanged();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto text-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho do Assistente */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              💰
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                Bem-vindo ao Meu Dinheiro!
              </h2>
              <p className="text-xs text-slate-500">
                Configuração guiada passo a passo (100% offline e privada)
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Passo {step} de 4
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            {erro}
          </div>
        )}

        {/* PASSO 1: CONTAS E SALDO */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                Qual é a sua conta principal e saldo atual?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Você pode começar cadastrando o saldo real que você tem hoje no banco ou em dinheiro físico.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Conta / Banco
                </label>
                <input
                  type="text"
                  value={nomeConta}
                  onChange={e => setNomeConta(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Carteira, Caixa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={tipoConta}
                    onChange={e => setTipoConta(e.target.value as TipoConta)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="dinheiro">Dinheiro (Carteira)</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Saldo Atual (R$)
                  </label>
                  <input
                    type="text"
                    value={saldoInicialConta}
                    onChange={e => setSaldoInicialConta(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cartão de crédito opcional */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adicionarCartao}
                    onChange={e => setAdicionarCartao(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Também desejo cadastrar um Cartão de Crédito agora</span>
                </label>

                {adicionarCartao && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-700" />
                      Dados do Cartão de Crédito
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome</label>
                        <input
                          type="text"
                          value={nomeCartao}
                          onChange={e => setNomeCartao(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Limite Total (R$)</label>
                        <input
                          type="text"
                          value={limiteCartao}
                          onChange={e => setLimiteCartao(e.target.value)}
                          placeholder="2000,00"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Vencimento</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={vencimentoCartao}
                          onChange={e => setVencimentoCartao(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleUsarDadosExemplo}
                className="text-xs text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Prefiro testar com dados de exemplo
              </button>

              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: PRIMEIRO LANÇAMENTO */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Cadastre seu primeiro lançamento financeiro
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pode ser sua última receita recebida (salário) ou sua despesa mais recente (supermercado, combustível).
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTipoLanc('receita');
                    setDescLanc('Salário');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tipoLanc === 'receita'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoLanc('despesa');
                    setDescLanc('Supermercado');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tipoLanc === 'despesa'
                      ? 'bg-white text-red-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Despesa (Saída)
                </button>
              </div>

              {!pularLancamento ? (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição do Lançamento
                    </label>
                    <input
                      type="text"
                      value={descLanc}
                      onChange={e => setDescLanc(e.target.value)}
                      placeholder="Ex: Salário, Almoço, Farmácia..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Valor (R$)
                      </label>
                      <input
                        type="text"
                        value={valorLanc}
                        onChange={e => setValorLanc(e.target.value)}
                        placeholder="Ex: 150,00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Categoria
                      </label>
                      <select
                        value={categoriaIdLanc}
                        onChange={e => setCategoriaIdLanc(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Sem problemas! Você poderá lançar receitas e despesas ou importar seu extrato bancário a qualquer momento pela tela de <strong>Lançamentos</strong> ou <strong>Importar Extrato</strong>.
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pularLancamento}
                    onChange={e => setPularLancamento(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Prefiro não cadastrar nenhum lançamento agora (deixar zerado)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: METAS E COFRINHOS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-pink-600" />
                Deseja definir um objetivo de economia ou cofrinho?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ter uma meta visual (como Reserva de Emergência, Viagem ou Reforma) ajuda a poupar com disciplina.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={adicionarMeta}
                  onChange={e => setAdicionarMeta(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Sim, quero cadastrar minha primeira Meta de Economia</span>
              </label>

              {adicionarMeta && (
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200/80 space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome da Meta
                    </label>
                    <input
                      type="text"
                      value={nomeMeta}
                      onChange={e => setNomeMeta(e.target.value)}
                      placeholder="Ex: Reserva de Emergência, Troca de Carro..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Valor Alvo (Objetivo R$)
                      </label>
                      <input
                        type="text"
                        value={valorAlvoMeta}
                        onChange={e => setValorAlvoMeta(e.target.value)}
                        placeholder="5000,00"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Já guardado hoje (R$)
                      </label>
                      <input
                        type="text"
                        value={valorAtualMeta}
                        onChange={e => setValorAtualMeta(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleNextFromStep3}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4: TUDO PRONTO & DICAS DE USO */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Tudo configurado com sucesso!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Seu aplicativo está pronto para uso com as suas próprias contas e lançamentos.
              </p>
            </div>

            {/* Dicas de recursos */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Como aproveitar o máximo do Meu Dinheiro:
              </div>
              <ul className="space-y-2 text-slate-600 pl-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">1.</span>
                  <span><strong>Importar Extratos:</strong> Acesse o menu "Importar extrato" para carregar arquivos OFX ou CSV do seu banco com categorização automática.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">2.</span>
                  <span><strong>Orçamentos Mensais:</strong> No menu "Orçamento", defina tetos para supermercado, lazer e combustível para não estourar o mês.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">3.</span>
                  <span><strong>Backup e Segurança:</strong> Seus dados ficam no seu aparelho. No menu lateral, você pode fazer o download do seu backup em JSON a qualquer momento.</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleFinalizar}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Acessar Meu Dinheiro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
