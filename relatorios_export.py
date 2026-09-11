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


def _grafico_mensal(resumo: pd.DataFrame) -> io.BytesIO:
    """Gráfico de barras Receitas x Despesas por mês (PNG em memória)."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    meses = resumo["Mês"].str[:3].tolist()
    x = range(len(meses))
    fig, ax = plt.subplots(figsize=(8, 3.2), dpi=150)
    ax.bar([i - 0.2 for i in x], resumo["Receitas"], width=0.4, label="Receitas", color="#2E7D32")
    ax.bar([i + 0.2 for i in x], resumo["Despesas"], width=0.4, label="Despesas", color="#C62828")
    ax.set_xticks(list(x))
    ax.set_xticklabels(meses, fontsize=8)
    ax.set_ylabel("R$")
    ax.legend(fontsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return buf


def _grafico_categorias(por_categoria: pd.DataFrame) -> io.BytesIO | None:
    """Gráfico de barras horizontais das despesas por categoria (PNG em memória)."""
    if por_categoria.empty:
        return None
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    dados = por_categoria.sort_values("Total").tail(12)
    fig, ax = plt.subplots(figsize=(8, max(2.2, 0.4 * len(dados) + 1)), dpi=150)
    ax.barh(dados["Categoria"], dados["Total"], color="#C62828")
    ax.set_xlabel("Total (R$)")
    ax.tick_params(labelsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return buf


def build_pdf(
    ano: int,
    resumo: pd.DataFrame,
    por_categoria: pd.DataFrame,
    total_receitas: float,
    total_despesas: float,
) -> bytes:
    """Monta um PDF de resumo anual (texto, gráficos e tabelas) com o fpdf2."""
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

    # Gráficos
    largura = pdf.w - 2 * pdf.l_margin
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, txt("Receitas x Despesas por mês"), ln=True)
    pdf.image(_grafico_mensal(resumo), w=largura)
    pdf.ln(3)

    graf_cat = _grafico_categorias(por_categoria)
    if graf_cat is not None:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, txt("Despesas por categoria (gráfico)"), ln=True)
        pdf.image(graf_cat, w=largura)
        pdf.ln(3)

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
