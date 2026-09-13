export type TipoConta = 'dinheiro' | 'corrente' | 'poupanca' | 'cartao' | 'investimento';
export type TipoLancamento = 'receita' | 'despesa';

export interface User {
  id: number;
  usuario: string;
}

export interface Conta {
  id: number;
  user_id: number;
  nome: string;
  tipo: TipoConta;
  saldo_inicial: number;
  saldo_atual?: number;
  limite_total?: number;
  dia_fechamento?: number;
  dia_vencimento?: number;
}

export interface Categoria {
  id: number;
  user_id: number;
  nome: string;
  tipo: TipoLancamento;
  cor: string;
}

export interface Lancamento {
  id: number;
  user_id: number;
  data: string; // YYYY-MM-DD
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  conta_id: number;
  categoria_id: number | null;
  pago: boolean;
  transferencia: boolean;
  parcela_atual?: number;
  total_parcelas?: number;
  membro?: string;
  // Join fields:
  conta_nome?: string;
  categoria_nome?: string;
  cor?: string;
}

export interface Orcamento {
  id: number;
  user_id: number;
  categoria_id: number;
  competencia: string; // YYYY-MM
  valor: number;
}

export interface Meta {
  id: number;
  user_id: number;
  nome: string;
  valor_alvo: number;
  valor_atual: number;
  prazo: string | null; // YYYY-MM-DD
  cor?: string;
  data_limite?: string | null;
}

export interface Regra {
  id: number;
  user_id: number;
  palavra_chave: string;
  categoria_id: number;
  // join
  categoria_nome?: string;
  categoria_tipo?: TipoLancamento;
  categoria_cor?: string;
  padrao?: string;
  cor?: string;
}

export type RegraCategorizacao = Regra;

export type PageView =
  | 'painel'
  | 'lancamentos'
  | 'contas'
  | 'categorias'
  | 'orcamento'
  | 'relatorios'
  | 'importar'
  | 'metas'
  | 'transferencias'
  | 'regras'
  | 'playstore';
