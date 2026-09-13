import { User, Conta, Categoria, Lancamento, Orcamento, Meta, Regra } from './types';
import { competenciaAtual } from './utils';

const STORAGE_KEY = 'meu_dinheiro_state_v1';

export const CATEGORIAS_PADRAO: Array<{ nome: string; tipo: 'receita' | 'despesa'; cor: string }> = [
  { nome: 'Salário', tipo: 'receita', cor: '#2E7D32' },
  { nome: 'Rendimentos', tipo: 'receita', cor: '#66BB6A' },
  { nome: 'Outras receitas', tipo: 'receita', cor: '#A5D6A7' },
  { nome: 'Moradia', tipo: 'despesa', cor: '#C62828' },
  { nome: 'Alimentação', tipo: 'despesa', cor: '#EF6C00' },
  { nome: 'Transporte', tipo: 'despesa', cor: '#F9A825' },
  { nome: 'Saúde', tipo: 'despesa', cor: '#AD1457' },
  { nome: 'Educação', tipo: 'despesa', cor: '#6A1B9A' },
  { nome: 'Lazer', tipo: 'despesa', cor: '#1565C0' },
  { nome: 'Compras', tipo: 'despesa', cor: '#00838F' },
  { nome: 'Contas e serviços', tipo: 'despesa', cor: '#4E342E' },
  { nome: 'Outras despesas', tipo: 'despesa', cor: '#546E7A' },
];

export const CONTAS_PADRAO: Array<{ nome: string; tipo: 'dinheiro' | 'corrente' | 'poupanca' | 'cartao' | 'investimento'; saldo_inicial: number }> = [
  { nome: 'Carteira', tipo: 'dinheiro', saldo_inicial: 150.0 },
  { nome: 'Conta corrente', tipo: 'corrente', saldo_inicial: 3200.0 },
  { nome: 'Poupança', tipo: 'poupanca', saldo_inicial: 5000.0 },
];

interface AppState {
  currentUserId: number;
  users: User[];
  contas: Conta[];
  categorias: Categoria[];
  lancamentos: Lancamento[];
  orcamentos: Orcamento[];
  metas: Meta[];
  regras: Regra[];
  nextId: {
    user: number;
    conta: number;
    categoria: number;
    lancamento: number;
    orcamento: number;
    meta: number;
    regra: number;
  };
}

function getInitialState(): AppState {
  const currentMonth = competenciaAtual();
  const today = new Date().toISOString().split('T')[0];

  const initialUser: User = { id: 1, usuario: 'Principal' };

  let catIdCounter = 1;
  const initialCategorias: Categoria[] = CATEGORIAS_PADRAO.map(c => ({
    id: catIdCounter++,
    user_id: 1,
    nome: c.nome,
    tipo: c.tipo,
    cor: c.cor,
  }));

  let contaIdCounter = 1;
  const initialContas: Conta[] = CONTAS_PADRAO.map(c => ({
    id: contaIdCounter++,
    user_id: 1,
    nome: c.nome,
    tipo: c.tipo,
    saldo_inicial: c.saldo_inicial,
  }));

  const catSalario = initialCategorias.find(c => c.nome === 'Salário')?.id || 1;
  const catAlim = initialCategorias.find(c => c.nome === 'Alimentação')?.id || 5;
  const catTransp = initialCategorias.find(c => c.nome === 'Transporte')?.id || 6;
  const catMoradia = initialCategorias.find(c => c.nome === 'Moradia')?.id || 4;
  const catLazer = initialCategorias.find(c => c.nome === 'Lazer')?.id || 9;

  const contaCorrente = initialContas.find(c => c.nome === 'Conta corrente')?.id || 2;
  const contaCarteira = initialContas.find(c => c.nome === 'Carteira')?.id || 1;

  const initialLancamentos: Lancamento[] = [
    {
      id: 1,
      user_id: 1,
      data: `${currentMonth}-05`,
      descricao: 'Salário Mensal',
      valor: 5400.0,
      tipo: 'receita',
      conta_id: contaCorrente,
      categoria_id: catSalario,
      pago: true,
      transferencia: false,
    },
    {
      id: 2,
      user_id: 1,
      data: `${currentMonth}-07`,
      descricao: 'Supermercado Central',
      valor: 640.5,
      tipo: 'despesa',
      conta_id: contaCorrente,
      categoria_id: catAlim,
      pago: true,
      transferencia: false,
    },
    {
      id: 3,
      user_id: 1,
      data: `${currentMonth}-10`,
      descricao: 'Aluguel e Condomínio',
      valor: 1800.0,
      tipo: 'despesa',
      conta_id: contaCorrente,
      categoria_id: catMoradia,
      pago: true,
      transferencia: false,
    },
    {
      id: 4,
      user_id: 1,
      data: `${currentMonth}-12`,
      descricao: 'Combustível Posto Ipiranga',
      valor: 180.0,
      tipo: 'despesa',
      conta_id: contaCorrente,
      categoria_id: catTransp,
      pago: true,
      transferencia: false,
    },
    {
      id: 5,
      user_id: 1,
      data: `${currentMonth}-15`,
      descricao: 'Jantar Restaurante',
      valor: 145.0,
      tipo: 'despesa',
      conta_id: contaCarteira,
      categoria_id: catLazer,
      pago: true,
      transferencia: false,
    },
  ];

  const initialOrcamentos: Orcamento[] = [
    { id: 1, user_id: 1, categoria_id: catAlim, competencia: currentMonth, valor: 1200.0 },
    { id: 2, user_id: 1, categoria_id: catMoradia, competencia: currentMonth, valor: 2000.0 },
    { id: 3, user_id: 1, categoria_id: catTransp, competencia: currentMonth, valor: 400.0 },
    { id: 4, user_id: 1, categoria_id: catLazer, competencia: currentMonth, valor: 350.0 },
  ];

  const initialMetas: Meta[] = [
    {
      id: 1,
      user_id: 1,
      nome: 'Reserva de Emergência',
      valor_alvo: 15000.0,
      valor_atual: 8200.0,
      prazo: '2026-12-31',
    },
    {
      id: 2,
      user_id: 1,
      nome: 'Viagem de Férias',
      valor_alvo: 4000.0,
      valor_atual: 2300.0,
      prazo: '2026-11-20',
    },
  ];

  const initialRegras: Regra[] = [
    { id: 1, user_id: 1, palavra_chave: 'uber', categoria_id: catTransp },
    { id: 2, user_id: 1, palavra_chave: 'supermercado', categoria_id: catAlim },
    { id: 3, user_id: 1, palavra_chave: 'ifood', categoria_id: catAlim },
    { id: 4, user_id: 1, palavra_chave: 'posto', categoria_id: catTransp },
  ];

  return {
    currentUserId: 1,
    users: [initialUser],
    contas: initialContas,
    categorias: initialCategorias,
    lancamentos: initialLancamentos,
    orcamentos: initialOrcamentos,
    metas: initialMetas,
    regras: initialRegras,
    nextId: {
      user: 2,
      conta: contaIdCounter,
      categoria: catIdCounter,
      lancamento: 6,
      orcamento: 5,
      meta: 3,
      regra: 5,
    },
  };
}

class StorageManager {
  private state: AppState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.users && parsed.contas && parsed.categorias) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Falha ao carregar localStorage:', e);
    }
    const initial = getInitialState();
    this.saveState(initial);
    return initial;
  }

  private saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Falha ao salvar localStorage:', e);
    }
  }

  private persist(): void {
    this.saveState(this.state);
  }

  public exportBackup(): string {
    const backupData = {
      version: '1.0',
      appName: 'Meu Dinheiro',
      exportedAt: new Date().toISOString(),
      state: this.state,
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string; lancamentosCount?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      const stateToLoad = parsed.state || parsed;

      if (!stateToLoad.users || !Array.isArray(stateToLoad.contas) || !Array.isArray(stateToLoad.categorias)) {
        throw new Error('Arquivo de backup inválido ou com formato não reconhecido.');
      }

      // Restore state
      this.state = {
        currentUserId: stateToLoad.currentUserId || stateToLoad.users[0]?.id || 1,
        users: stateToLoad.users,
        contas: stateToLoad.contas,
        categorias: stateToLoad.categorias,
        lancamentos: stateToLoad.lancamentos || [],
        orcamentos: stateToLoad.orcamentos || [],
        metas: stateToLoad.metas || [],
        regras: stateToLoad.regras || [],
        nextId: stateToLoad.nextId || {
          user: (stateToLoad.users.length || 1) + 1,
          conta: (stateToLoad.contas.length || 1) + 1,
          categoria: (stateToLoad.categorias.length || 1) + 1,
          lancamento: (stateToLoad.lancamentos?.length || 1) + 1,
          orcamento: (stateToLoad.orcamentos?.length || 1) + 1,
          meta: (stateToLoad.metas?.length || 1) + 1,
          regra: (stateToLoad.regras?.length || 1) + 1,
        },
      };

      this.persist();
      return {
        success: true,
        message: 'Backup restaurado com sucesso!',
        lancamentosCount: this.state.lancamentos.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Falha ao processar arquivo de backup.',
      };
    }
  }

  public resetToDefault(): void {
    this.state = getInitialState();
    this.persist();
  }

  public getCurrentUserId(): number {
    return this.state.currentUserId;
  }

  public setCurrentUserId(id: number): void {
    this.state.currentUserId = id;
    this.persist();
  }

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public createUser(nome: string): User {
    const trimmed = nome.trim();
    if (!trimmed) throw new Error('Nome de usuário não pode ser vazio');
    const existing = this.state.users.find(u => u.usuario.toLowerCase() === trimmed.toLowerCase());
    if (existing) throw new Error('Usuário já existe');

    const id = this.state.nextId.user++;
    const newUser: User = { id, usuario: trimmed };
    this.state.users.push(newUser);

    // Seed default categories & accounts for the user
    CATEGORIAS_PADRAO.forEach(c => {
      this.state.categorias.push({
        id: this.state.nextId.categoria++,
        user_id: id,
        nome: c.nome,
        tipo: c.tipo,
        cor: c.cor,
      });
    });

    CONTAS_PADRAO.forEach(c => {
      this.state.contas.push({
        id: this.state.nextId.conta++,
        user_id: id,
        nome: c.nome,
        tipo: c.tipo,
        saldo_inicial: c.saldo_inicial,
      });
    });

    this.persist();
    return newUser;
  }

  public getContas(userId: number): Conta[] {
    const userContas = this.state.contas.filter(c => c.user_id === userId);
    return userContas.map(conta => {
      // Calculate current balance
      const totalMovimentos = this.state.lancamentos
        .filter(l => l.user_id === userId && l.conta_id === conta.id && l.pago)
        .reduce((sum, l) => {
          if (l.tipo === 'receita') return sum + l.valor;
          if (l.tipo === 'despesa') return sum - l.valor;
          return sum;
        }, 0);

      return {
        ...conta,
        saldo_atual: conta.saldo_inicial + totalMovimentos,
      };
    });
  }

  public addConta(
    userId: number,
    nome: string,
    tipo: Conta['tipo'],
    saldoInicial: number,
    extra?: { limite_total?: number; dia_fechamento?: number; dia_vencimento?: number }
  ): Conta {
    const trimmed = nome.trim();
    if (!trimmed) throw new Error('Nome da conta é obrigatório');
    const exists = this.state.contas.some(c => c.user_id === userId && c.nome.toLowerCase() === trimmed.toLowerCase());
    if (exists) throw new Error('Já existe uma conta com esse nome.');

    const newConta: Conta = {
      id: this.state.nextId.conta++,
      user_id: userId,
      nome: trimmed,
      tipo,
      saldo_inicial: Number(saldoInicial) || 0,
      limite_total: extra?.limite_total ? Number(extra.limite_total) : undefined,
      dia_fechamento: extra?.dia_fechamento ? Number(extra.dia_fechamento) : undefined,
      dia_vencimento: extra?.dia_vencimento ? Number(extra.dia_vencimento) : undefined,
    };
    this.state.contas.push(newConta);
    this.persist();
    return newConta;
  }

  public updateConta(userId: number, contaId: number, item: Partial<Conta>): void {
    const idx = this.state.contas.findIndex(c => c.user_id === userId && c.id === contaId);
    if (idx !== -1) {
      this.state.contas[idx] = {
        ...this.state.contas[idx],
        ...item,
      };
      this.persist();
    }
  }

  public deleteConta(userId: number, contaId: number): void {
    this.state.contas = this.state.contas.filter(c => !(c.user_id === userId && c.id === contaId));
    // Cascade delete lancamentos from this account
    this.state.lancamentos = this.state.lancamentos.filter(l => !(l.user_id === userId && l.conta_id === contaId));
    this.persist();
  }

  public getCategorias(userId: number, tipo?: 'receita' | 'despesa'): Categoria[] {
    return this.state.categorias
      .filter(c => c.user_id === userId && (!tipo || c.tipo === tipo))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  public addCategoria(userId: number, nome: string, tipo: 'receita' | 'despesa', cor: string): Categoria {
    const trimmed = nome.trim();
    if (!trimmed) throw new Error('Nome da categoria é obrigatório');
    const exists = this.state.categorias.some(
      c => c.user_id === userId && c.nome.toLowerCase() === trimmed.toLowerCase() && c.tipo === tipo
    );
    if (exists) throw new Error('Já existe uma categoria com esse nome e tipo');

    const newCat: Categoria = {
      id: this.state.nextId.categoria++,
      user_id: userId,
      nome: trimmed,
      tipo,
      cor: cor || '#607D8B',
    };
    this.state.categorias.push(newCat);
    this.persist();
    return newCat;
  }

  public deleteCategoria(userId: number, categoriaId: number): void {
    this.state.categorias = this.state.categorias.filter(c => !(c.user_id === userId && c.id === categoriaId));
    // Set categoria_id to null for lancamentos
    this.state.lancamentos.forEach(l => {
      if (l.user_id === userId && l.categoria_id === categoriaId) {
        l.categoria_id = null;
      }
    });
    // Delete budgets and rules associated with this category
    this.state.orcamentos = this.state.orcamentos.filter(o => !(o.user_id === userId && o.categoria_id === categoriaId));
    this.state.regras = this.state.regras.filter(r => !(r.user_id === userId && r.categoria_id === categoriaId));
    this.persist();
  }

  public getLancamentos(
    userId: number,
    options?: {
      inicio?: string;
      fim?: string;
      tipo?: 'receita' | 'despesa';
      competencia?: string;
      ignorarTransferencias?: boolean;
    }
  ): Lancamento[] {
    const contasMap = new Map(this.state.contas.filter(c => c.user_id === userId).map(c => [c.id, c.nome]));
    const catMap = new Map(this.state.categorias.filter(c => c.user_id === userId).map(c => [c.id, c]));

    let list = this.state.lancamentos.filter(l => l.user_id === userId);

    if (options?.competencia) {
      list = list.filter(l => l.data.startsWith(options.competencia!));
    }
    if (options?.inicio) {
      list = list.filter(l => l.data >= options.inicio!);
    }
    if (options?.fim) {
      list = list.filter(l => l.data <= options.fim!);
    }
    if (options?.tipo) {
      list = list.filter(l => l.tipo === options.tipo);
    }
    if (options?.ignorarTransferencias) {
      list = list.filter(l => !l.transferencia);
    }

    return list
      .map(l => {
        const cat = l.categoria_id ? catMap.get(l.categoria_id) : undefined;
        return {
          ...l,
          conta_nome: contasMap.get(l.conta_id) || 'Conta desconhecida',
          categoria_nome: cat?.nome || 'Sem categoria',
          cor: cat?.cor || '#607D8B',
        };
      })
      .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  }

  public addLancamento(userId: number, item: Omit<Lancamento, 'id' | 'user_id'>): Lancamento {
    const newL: Lancamento = {
      id: this.state.nextId.lancamento++,
      user_id: userId,
      ...item,
      valor: Math.abs(Number(item.valor)),
    };
    this.state.lancamentos.push(newL);
    this.persist();
    return newL;
  }

  public addLancamentoParcelado(
    userId: number,
    baseItem: Omit<Lancamento, 'id' | 'user_id'>,
    totalParcelas: number
  ): Lancamento[] {
    if (totalParcelas <= 1) {
      return [this.addLancamento(userId, baseItem)];
    }

    const valorTotal = Math.abs(Number(baseItem.valor));
    const valorParcela = Number((valorTotal / totalParcelas).toFixed(2));
    const lancamentosCriados: Lancamento[] = [];

    const [anoStr, mesStr, diaStr] = baseItem.data.split('-');
    let ano = parseInt(anoStr, 10);
    let mes = parseInt(mesStr, 10);
    const dia = parseInt(diaStr, 10);

    for (let i = 1; i <= totalParcelas; i++) {
      const monthOffset = mes - 1 + (i - 1);
      const currentMes = (monthOffset % 12) + 1;
      const currentAno = ano + Math.floor(monthOffset / 12);
      const maxDiasNoMes = new Date(currentAno, currentMes, 0).getDate();
      const diaFinal = Math.min(dia, maxDiasNoMes);
      const dataParcela = `${currentAno}-${String(currentMes).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`;

      const descParcela = `${baseItem.descricao} (${i}/${totalParcelas})`;
      const novo = this.addLancamento(userId, {
        ...baseItem,
        descricao: descParcela,
        valor: valorParcela,
        data: dataParcela,
        parcela_atual: i,
        total_parcelas: totalParcelas,
        pago: i === 1 ? baseItem.pago : false,
      });
      lancamentosCriados.push(novo);
    }

    return lancamentosCriados;
  }

  public togglePagoLancamento(userId: number, id: number): boolean {
    const l = this.state.lancamentos.find(item => item.user_id === userId && item.id === id);
    if (l) {
      l.pago = !l.pago;
      this.persist();
      return l.pago;
    }
    return false;
  }

  public addLancamentosBatch(userId: number, items: Array<Omit<Lancamento, 'id' | 'user_id'>>): number {
    items.forEach(item => {
      this.state.lancamentos.push({
        id: this.state.nextId.lancamento++,
        user_id: userId,
        ...item,
        valor: Math.abs(Number(item.valor)),
      });
    });
    this.persist();
    return items.length;
  }

  public updateLancamento(userId: number, id: number, item: Partial<Lancamento>): void {
    const idx = this.state.lancamentos.findIndex(l => l.user_id === userId && l.id === id);
    if (idx !== -1) {
      this.state.lancamentos[idx] = {
        ...this.state.lancamentos[idx],
        ...item,
        valor: item.valor !== undefined ? Math.abs(Number(item.valor)) : this.state.lancamentos[idx].valor,
      };
      this.persist();
    }
  }

  public deleteLancamento(userId: number, id: number): void {
    this.state.lancamentos = this.state.lancamentos.filter(l => !(l.user_id === userId && l.id === id));
    this.persist();
  }

  public criarTransferencia(
    userId: number,
    dataTransf: string,
    valor: number,
    contaOrigemId: number,
    contaDestinoId: number,
    descricao: string = ''
  ): void {
    if (contaOrigemId === contaDestinoId) {
      throw new Error('A conta de origem e destino devem ser diferentes.');
    }
    const contas = this.state.contas.filter(c => c.user_id === userId);
    const origemNome = contas.find(c => c.id === contaOrigemId)?.nome || 'Origem';
    const destinoNome = contas.find(c => c.id === contaDestinoId)?.nome || 'Destino';
    const sufixo = descricao.trim() ? ` — ${descricao.trim()}` : '';
    const val = Math.abs(Number(valor));

    // Saída na origem
    this.state.lancamentos.push({
      id: this.state.nextId.lancamento++,
      user_id: userId,
      data: dataTransf,
      descricao: `Transferência para ${destinoNome}${sufixo}`,
      valor: val,
      tipo: 'despesa',
      conta_id: contaOrigemId,
      categoria_id: null,
      pago: true,
      transferencia: true,
    });

    // Entrada no destino
    this.state.lancamentos.push({
      id: this.state.nextId.lancamento++,
      user_id: userId,
      data: dataTransf,
      descricao: `Transferência de ${origemNome}${sufixo}`,
      valor: val,
      tipo: 'receita',
      conta_id: contaDestinoId,
      categoria_id: null,
      pago: true,
      transferencia: true,
    });

    this.persist();
  }

  public realizarTransferencia(
    userId: number,
    contaOrigemId: number,
    contaDestinoId: number,
    valor: number,
    dataTransf: string,
    descricao: string = ''
  ): void {
    this.criarTransferencia(userId, dataTransf, valor, contaOrigemId, contaDestinoId, descricao);
  }

  public getOrcamentoVsRealizado(userId: number, competencia: string) {
    const despesasCats = this.state.categorias.filter(c => c.user_id === userId && c.tipo === 'despesa');
    const orcamentos = this.state.orcamentos.filter(o => o.user_id === userId && o.competencia === competencia);
    const lancamentos = this.state.lancamentos.filter(
      l => l.user_id === userId && l.tipo === 'despesa' && l.pago && !l.transferencia && l.data.startsWith(competencia)
    );

    return despesasCats.map(cat => {
      const orc = orcamentos.find(o => o.categoria_id === cat.id);
      const orcado = orc ? orc.valor : 0;
      const gasto = lancamentos
        .filter(l => l.categoria_id === cat.id)
        .reduce((sum, l) => sum + l.valor, 0);

      return {
        categoria_id: cat.id,
        categoria: cat.nome,
        cor: cat.cor,
        orcado,
        gasto,
      };
    });
  }

  public definirOrcamento(userId: number, categoriaId: number, competencia: string, valor: number): void {
    const val = Math.max(0, Number(valor));
    const idx = this.state.orcamentos.findIndex(
      o => o.user_id === userId && o.categoria_id === categoriaId && o.competencia === competencia
    );
    if (idx !== -1) {
      this.state.orcamentos[idx].valor = val;
    } else {
      this.state.orcamentos.push({
        id: this.state.nextId.orcamento++,
        user_id: userId,
        categoria_id: categoriaId,
        competencia,
        valor: val,
      });
    }
    this.persist();
  }

  public getMetas(userId: number): Meta[] {
    return this.state.metas.filter(m => m.user_id === userId).sort((a, b) => a.id - b.id);
  }

  public addMeta(
    userId: number,
    metaOrNome: string | { nome: string; valor_alvo: number; valor_atual?: number; prazo?: string | null; data_limite?: string | null; cor?: string },
    valorAlvo?: number,
    valorAtual?: number,
    prazo?: string | null,
    cor?: string
  ): Meta {
    let nome: string;
    let alvo: number;
    let atual: number;
    let pz: string | null;
    let c: string;

    if (typeof metaOrNome === 'object') {
      nome = metaOrNome.nome;
      alvo = metaOrNome.valor_alvo;
      atual = metaOrNome.valor_atual ?? 0;
      pz = metaOrNome.prazo ?? metaOrNome.data_limite ?? null;
      c = metaOrNome.cor || '#E91E63';
    } else {
      nome = metaOrNome;
      alvo = valorAlvo ?? 0;
      atual = valorAtual ?? 0;
      pz = prazo ?? null;
      c = cor || '#E91E63';
    }

    const trimmed = (nome || '').trim();
    if (!trimmed) throw new Error('Nome da meta é obrigatório');

    const newMeta: Meta = {
      id: this.state.nextId.meta++,
      user_id: userId,
      nome: trimmed,
      valor_alvo: Math.max(0.01, Number(alvo)),
      valor_atual: Math.max(0, Number(atual)),
      prazo: pz,
      data_limite: pz,
      cor: c,
    };
    this.state.metas.push(newMeta);
    this.persist();
    return newMeta;
  }

  public updateMeta(userId: number, metaId: number, updates: Partial<Meta>): void {
    const meta = this.state.metas.find(m => m.user_id === userId && m.id === metaId);
    if (meta) {
      if (updates.valor_atual !== undefined) meta.valor_atual = Math.max(0, Number(updates.valor_atual));
      if (updates.valor_alvo !== undefined) meta.valor_alvo = Math.max(0.01, Number(updates.valor_alvo));
      if (updates.nome !== undefined) meta.nome = updates.nome.trim();
      if (updates.prazo !== undefined) {
        meta.prazo = updates.prazo;
        meta.data_limite = updates.prazo;
      }
      if (updates.data_limite !== undefined) {
        meta.data_limite = updates.data_limite;
        meta.prazo = updates.data_limite;
      }
      if (updates.cor !== undefined) meta.cor = updates.cor;
      this.persist();
    }
  }

  public updateMetaValor(userId: number, metaId: number, novoValor: number): void {
    const meta = this.state.metas.find(m => m.user_id === userId && m.id === metaId);
    if (meta) {
      meta.valor_atual = Math.max(0, Number(novoValor));
      this.persist();
    }
  }

  public deleteMeta(userId: number, metaId: number): void {
    this.state.metas = this.state.metas.filter(m => !(m.user_id === userId && m.id === metaId));
    this.persist();
  }

  public getRegras(userId: number): Regra[] {
    const catsMap = new Map(this.state.categorias.filter(c => c.user_id === userId).map(c => [c.id, c]));
    return this.state.regras
      .filter(r => r.user_id === userId)
      .map(r => {
        const cat = catsMap.get(r.categoria_id);
        const cor = cat?.cor || '#607D8B';
        return {
          ...r,
          padrao: r.palavra_chave,
          cor,
          categoria_nome: cat?.nome || 'Desconhecida',
          categoria_tipo: cat?.tipo || 'despesa',
          categoria_cor: cor,
        };
      })
      .sort((a, b) => a.palavra_chave.localeCompare(b.palavra_chave));
  }

  public addRegra(userId: number, palavraChave: string, categoriaId: number): Regra {
    const trimmed = palavraChave.trim().toLowerCase();
    if (!trimmed) throw new Error('Informe a palavra-chave');

    const newRegra: Regra = {
      id: this.state.nextId.regra++,
      user_id: userId,
      palavra_chave: trimmed,
      categoria_id: categoriaId,
    };
    this.state.regras.push(newRegra);
    this.persist();
    return newRegra;
  }

  public deleteRegra(userId: number, regraId: number): void {
    this.state.regras = this.state.regras.filter(r => !(r.user_id === userId && r.id === regraId));
    this.persist();
  }

  public aplicarRegrasRetroativas(userId: number): number {
    const pendentes = this.state.lancamentos.filter(
      l => l.user_id === userId && !l.categoria_id && !l.transferencia
    );
    let count = 0;
    pendentes.forEach(l => {
      const sugerida = this.sugerirCategoria(userId, l.descricao);
      if (sugerida) {
        l.categoria_id = sugerida;
        count++;
      }
    });
    if (count > 0) {
      this.persist();
    }
    return count;
  }

  public sugerirCategoria(userId: number, descricao: string): number | null {
    const regras = this.getRegras(userId).sort((a, b) => b.palavra_chave.length - a.palavra_chave.length);
    const texto = (descricao || '').toLowerCase();
    for (const regra of regras) {
      if (regra.palavra_chave && texto.includes(regra.palavra_chave)) {
        return regra.categoria_id;
      }
    }
    return null;
  }
}

export const storage = new StorageManager();
