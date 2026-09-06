"""Leitura de extratos em CSV e OFX para importação de lançamentos.

Ambos os leitores devolvem um DataFrame padronizado com as colunas:
    data (date) | descricao (str) | valor (float, sempre positivo) | tipo (str)
onde `tipo` é 'receita' ou 'despesa'.
"""

from __future__ import annotations

import io
import re
from datetime import date, datetime

import pandas as pd

COLUNAS = ["data", "descricao", "valor", "tipo"]


# --------------------------------------------------------------------------- #
# CSV
# --------------------------------------------------------------------------- #
def _detectar_coluna(colunas: list[str], candidatos: list[str]) -> str | None:
    norm = {c.lower().strip(): c for c in colunas}
    for cand in candidatos:
        if cand in norm:
            return norm[cand]
    return None


def ler_csv(conteudo: bytes) -> pd.DataFrame:
    """Lê um CSV de extrato tentando detectar colunas de data, descrição e valor.

    Aceita separador ',' ou ';' e valores no formato brasileiro (1.234,56).
    Colunas reconhecidas (qualquer combinação de nomes usuais):
      - data:      data, date, dt
      - descricao: descricao, descrição, historico, histórico, memo, description
      - valor:     valor, value, amount, montante
      - tipo:      tipo, type (opcional; senão o sinal do valor decide)
    """
    texto = conteudo.decode("utf-8-sig", errors="replace")
    sep = ";" if texto.count(";") > texto.count(",") else ","
    df = pd.read_csv(io.StringIO(texto), sep=sep, dtype=str).fillna("")

    col_data = _detectar_coluna(df.columns.tolist(), ["data", "date", "dt"])
    col_desc = _detectar_coluna(
        df.columns.tolist(),
        ["descricao", "descrição", "historico", "histórico", "memo", "description", "lançamento", "lancamento"],
    )
    col_valor = _detectar_coluna(df.columns.tolist(), ["valor", "value", "amount", "montante"])
    col_tipo = _detectar_coluna(df.columns.tolist(), ["tipo", "type"])

    if col_data is None or col_valor is None:
        raise ValueError(
            "CSV precisa ter ao menos as colunas de data e valor. "
            f"Colunas encontradas: {', '.join(df.columns)}"
        )

    registros = []
    for _, linha in df.iterrows():
        valor = _parse_valor(linha[col_valor])
        if valor is None:
            continue
        data_lanc = _parse_data(linha[col_data])
        if data_lanc is None:
            continue
        if col_tipo and str(linha[col_tipo]).strip():
            tipo = "receita" if str(linha[col_tipo]).lower().startswith(("r", "c", "e")) else "despesa"
        else:
            tipo = "receita" if valor >= 0 else "despesa"
        registros.append({
            "data": data_lanc,
            "descricao": str(linha[col_desc]).strip() if col_desc else "Lançamento importado",
            "valor": abs(valor),
            "tipo": tipo,
        })
    return pd.DataFrame(registros, columns=COLUNAS)


# --------------------------------------------------------------------------- #
# OFX
# --------------------------------------------------------------------------- #
def ler_ofx(conteudo: bytes) -> pd.DataFrame:
    """Extrai as transações (STMTTRN) de um arquivo OFX (SGML ou XML)."""
    texto = conteudo.decode("latin-1", errors="replace")
    registros = []
    for bloco in re.findall(r"<STMTTRN>(.*?)</STMTTRN>", texto, re.DOTALL | re.IGNORECASE):
        valor = _parse_valor(_tag(bloco, "TRNAMT"))
        if valor is None:
            continue
        data_lanc = _parse_data_ofx(_tag(bloco, "DTPOSTED"))
        memo = _tag(bloco, "MEMO") or _tag(bloco, "NAME") or "Lançamento importado"
        registros.append({
            "data": data_lanc or date.today(),
            "descricao": memo.strip(),
            "valor": abs(valor),
            "tipo": "receita" if valor >= 0 else "despesa",
        })
    return pd.DataFrame(registros, columns=COLUNAS)


def _tag(bloco: str, tag: str) -> str:
    """Lê o valor de uma tag OFX (funciona com ou sem tag de fechamento)."""
    m = re.search(rf"<{tag}>([^<\r\n]*)", bloco, re.IGNORECASE)
    return m.group(1).strip() if m else ""


# --------------------------------------------------------------------------- #
# Parsers auxiliares
# --------------------------------------------------------------------------- #
def _parse_valor(bruto) -> float | None:
    if bruto is None:
        return None
    s = str(bruto).strip()
    if not s:
        return None
    s = s.replace("R$", "").replace(" ", "")
    # Formato brasileiro: 1.234,56 -> 1234.56
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _parse_data(bruto) -> date | None:
    s = str(bruto).strip()[:10]
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _parse_data_ofx(bruto) -> date | None:
    s = str(bruto).strip()[:8]
    try:
        return datetime.strptime(s, "%Y%m%d").date()
    except ValueError:
        return None
