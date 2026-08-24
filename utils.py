"""Funções auxiliares de formatação e datas."""

from __future__ import annotations

from datetime import date


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
