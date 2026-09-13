export const MESES_PT: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
};

export const MESES_CURTOS_PT: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
};

export const PRIVACY_STORAGE_KEY = 'meu_dinheiro_privacy_mode';

export function isPrivacyModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PRIVACY_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPrivacyModeActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRIVACY_STORAGE_KEY, String(active));
    window.dispatchEvent(new Event('privacy_mode_changed'));
  } catch (e) {
    console.error(e);
  }
}

export function brl(valor: number | undefined | null, forceHide?: boolean): string {
  if (forceHide === true || (forceHide === undefined && isPrivacyModeActive())) {
    return 'R$ ••••••';
  }
  if (valor === undefined || valor === null || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function competenciaAtual(): string {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

export function competenciaLegivel(competencia: string): string {
  if (!competencia || !competencia.includes('-')) return competencia;
  const [ano, mes] = competencia.split('-');
  const nomeMes = MESES_CURTOS_PT[mes] || mes;
  return `${nomeMes}/${ano}`;
}

export function competenciaNomeCompleto(competencia: string): string {
  if (!competencia || !competencia.includes('-')) return competencia;
  const [ano, mes] = competencia.split('-');
  const nomeMes = MESES_PT[mes] || mes;
  return `${nomeMes} de ${ano}`;
}

export function formatarDataBr(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function somarMeses(isoDate: string, n: number): string {
  const [ano, mes, dia] = isoDate.split('-').map(Number);
  const data = new Date(ano, mes - 1 + n, dia);
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseValor(valStr: string | number): number | null {
  if (typeof valStr === 'number') return valStr;
  if (!valStr) return null;
  let limpo = String(valStr).trim().replace(/[R$\s]/g, '');
  if (limpo.includes(',') && limpo.includes('.')) {
    // 1.234,56
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (limpo.includes(',')) {
    // 1234,56
    limpo = limpo.replace(',', '.');
  }
  const n = parseFloat(limpo);
  return isNaN(n) ? null : n;
}

export function parseData(dataStr: string): string | null {
  if (!dataStr) return null;
  const s = dataStr.trim();
  // Match DD/MM/YYYY
  const mBr = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (mBr) {
    const dia = String(mBr[1]).padStart(2, '0');
    const mes = String(mBr[2]).padStart(2, '0');
    const ano = mBr[3];
    return `${ano}-${mes}-${dia}`;
  }
  // Match YYYY-MM-DD
  const mIso = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (mIso) {
    const ano = mIso[1];
    const mes = String(mIso[2]).padStart(2, '0');
    const dia = String(mIso[3]).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  return null;
}

export function parseCsv(text: string): Array<{ data: string; descricao: string; valor: number; tipo: 'receita' | 'despesa' }> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const sep = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].split(sep).map(h => h.toLowerCase().replace(/["']/g, '').trim());

  const idxData = header.findIndex(h => ['data', 'date', 'dt'].includes(h));
  const idxDesc = header.findIndex(h => ['descricao', 'descrição', 'historico', 'histórico', 'memo', 'description', 'lançamento', 'lancamento'].includes(h));
  const idxValor = header.findIndex(h => ['valor', 'value', 'amount', 'montante'].includes(h));
  const idxTipo = header.findIndex(h => ['tipo', 'type'].includes(h));

  if (idxData === -1 || idxValor === -1) {
    throw new Error(`CSV precisa ter ao menos as colunas de data e valor. Colunas encontradas: ${header.join(', ')}`);
  }

  const results: Array<{ data: string; descricao: string; valor: number; tipo: 'receita' | 'despesa' }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length <= Math.max(idxData, idxValor)) continue;

    const val = parseValor(cols[idxValor]);
    if (val === null) continue;

    const dt = parseData(cols[idxData]);
    if (!dt) continue;

    let tipo: 'receita' | 'despesa' = val >= 0 ? 'receita' : 'despesa';
    if (idxTipo !== -1 && cols[idxTipo]) {
      const t = cols[idxTipo].toLowerCase();
      if (t.startsWith('r') || t.startsWith('c') || t.startsWith('e')) {
        tipo = 'receita';
      } else {
        tipo = 'despesa';
      }
    }

    const desc = idxDesc !== -1 && cols[idxDesc] ? cols[idxDesc] : 'Lançamento importado';
    results.push({
      data: dt,
      descricao: desc,
      valor: Math.abs(val),
      tipo,
    });
  }

  return results;
}

export function parseOfx(text: string): Array<{ data: string; descricao: string; valor: number; tipo: 'receita' | 'despesa' }> {
  const results: Array<{ data: string; descricao: string; valor: number; tipo: 'receita' | 'despesa' }> = [];
  const stmttrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match: RegExpExecArray | null;

  while ((match = stmttrnRegex.exec(text)) !== null) {
    const block = match[1];
    const trnamtMatch = block.match(/<TRNAMT>([\s\S]*?)(?:<|$)/i);
    const dtpostedMatch = block.match(/<DTPOSTED>([\s\S]*?)(?:<|$)/i);
    const memoMatch = block.match(/<MEMO>([\s\S]*?)(?:<|$)/i) || block.match(/<NAME>([\s\S]*?)(?:<|$)/i);

    if (trnamtMatch) {
      const rawVal = trnamtMatch[1].trim();
      const val = parseFloat(rawVal.replace(',', '.'));
      if (!isNaN(val)) {
        let dtStr = new Date().toISOString().split('T')[0];
        if (dtpostedMatch) {
          const rawDt = dtpostedMatch[1].trim().slice(0, 8); // YYYYMMDD
          if (rawDt.length === 8) {
            dtStr = `${rawDt.slice(0, 4)}-${rawDt.slice(4, 6)}-${rawDt.slice(6, 8)}`;
          }
        }
        const desc = memoMatch ? memoMatch[1].trim() : 'Lançamento importado';
        results.push({
          data: dtStr,
          descricao: desc,
          valor: Math.abs(val),
          tipo: val >= 0 ? 'receita' : 'despesa',
        });
      }
    }
  }

  return results;
}

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
