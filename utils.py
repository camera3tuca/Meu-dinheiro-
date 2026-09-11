"""Funções auxiliares de formatação e datas."""

from __future__ import annotations

from datetime import date, timedelta


def brl(valor: float) -> str:
    """Formata um número como moeda brasileira: 1234.5 -> 'R$ 1.234,50'."""
    texto = f"{valor:,.2f}"  # 1,234.50
    texto = texto.replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


def competencia_atual() -> str:
    """Retorna o mês corrente no formato 'AAAA-MM'."""
    return date.today().strftime("%Y-%m")


MESES_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
}


def competencia_legivel(competencia: str) -> str:
    """'2026-08' -> 'Agosto/2026'."""
    ano, mes = competencia.split("-")
    return f"{MESES_PT[int(mes)]}/{ano}"


def somar_meses(data_base: date, meses: int) -> date:
    """Soma `meses` a uma data, ajustando o dia ao último dia válido do mês.

    Ex.: 31/01 + 1 mês -> 28/02 (ou 29/02 em ano bissexto).
    """
    total = data_base.month - 1 + meses
    ano = data_base.year + total // 12
    mes = total % 12 + 1
    # Último dia do mês de destino.
    if mes == 12:
        prox = date(ano + 1, 1, 1)
    else:
        prox = date(ano, mes + 1, 1)
    ultimo_dia = (prox - timedelta(days=1)).day
    return date(ano, mes, min(data_base.day, ultimo_dia))
