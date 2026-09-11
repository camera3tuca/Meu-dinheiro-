"""Geração dos arquivos de exportação do relatório anual (Excel e PDF)."""

from __future__ import annotations

import io

import pandas as pd

from utils import brl


def build_excel(
    ano: int,
    resumo: pd.DataFrame,
    por_categoria: pd.DataFrame,
    lancamentos: pd.DataFrame,
) -> bytes:
    """Monta um arquivo .xlsx com três planilhas: resumo, categorias e lançamentos."""
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        resumo.to_excel(writer, sheet_name="Resumo mensal", index=False)
        por_categoria.to_excel(writer, sheet_name="Por categoria", index=False)
        lancamentos.to_excel(writer, sheet_name="Lançamentos", index=False)
        # Ajuste simples de largura das colunas.
        for nome, df in {
            "Resumo mensal": resumo,
            "Por categoria": por_categoria,
            "Lançamentos": lancamentos,
        }.items():
            ws = writer.sheets[nome]
            for i, col in enumerate(df.columns, start=1):
                largura = max(12, min(40, int(df[col].astype(str).map(len).max() or 10) + 2))
                ws.column_dimensions[chr(64 + i)].width = largura
    return buffer.getvalue()


def build_pdf(
    ano: int,
    resumo: pd.DataFrame,
    por_categoria: pd.DataFrame,
    total_receitas: float,
    total_despesas: float,
) -> bytes:
    """Monta um PDF de resumo anual (texto e tabelas) com o fpdf2."""
    from fpdf import FPDF

    def txt(s: str) -> str:
        # Fontes core do fpdf2 usam latin-1; remove o que estiver fora dela.
        return str(s).encode("latin-1", "replace").decode("latin-1")

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, txt("Meu Dinheiro — Relatório anual"), ln=True)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, txt(f"Ano de referência: {ano}"), ln=True)
    pdf.ln(2)

    saldo = total_receitas - total_despesas
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, txt("Totais do ano"), ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, txt(f"Receitas: {brl(total_receitas)}"), ln=True)
    pdf.cell(0, 7, txt(f"Despesas: {brl(total_despesas)}"), ln=True)
    pdf.cell(0, 7, txt(f"Saldo: {brl(saldo)}"), ln=True)
    pdf.ln(4)

    # Tabela: resumo mensal
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, txt("Resumo mensal"), ln=True)
    _tabela(
        pdf,
        cabecalho=["Mês", "Receitas", "Despesas", "Saldo"],
        larguras=[60, 40, 40, 40],
        linhas=[
            [txt(r["Mês"]), brl(r["Receitas"]), brl(r["Despesas"]), brl(r["Saldo"])]
            for _, r in resumo.iterrows()
        ],
        txt=txt,
    )
    pdf.ln(4)

    # Tabela: por categoria (despesas)
    if not por_categoria.empty:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, txt("Despesas por categoria"), ln=True)
        _tabela(
            pdf,
            cabecalho=["Categoria", "Total"],
            larguras=[120, 50],
            linhas=[
                [txt(r["Categoria"]), brl(r["Total"])]
                for _, r in por_categoria.iterrows()
            ],
            txt=txt,
        )

    saida = pdf.output()  # bytearray no fpdf2
    return bytes(saida)


def _tabela(pdf, cabecalho, larguras, linhas, txt) -> None:
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(230, 230, 230)
    for titulo, w in zip(cabecalho, larguras):
        pdf.cell(w, 8, txt(titulo), border=1, fill=True)
    pdf.ln()
    pdf.set_font("Helvetica", "", 10)
    for linha in linhas:
        for valor, w in zip(linha, larguras):
            pdf.cell(w, 7, txt(valor), border=1)
        pdf.ln()
