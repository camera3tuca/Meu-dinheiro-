"""Relatórios: evolução mensal, categorias e exportação em CSV."""

from __future__ import annotations

import pandas as pd
import plotly.express as px
import streamlit as st

import db
from auth import require_login
from relatorios_export import build_excel, build_pdf
from utils import MESES_PT, brl, competencia_legivel

st.set_page_config(page_title="Relatórios • Meu Dinheiro", page_icon="📊", layout="wide")
db.init_db()
user_id = require_login()

st.title("📊 Relatórios")

lanc = db.listar_lancamentos(user_id)
if lanc.empty:
    st.info("Ainda não há lançamentos para gerar relatórios.")
    st.stop()

# Transferências entre contas não entram nos relatórios de receita/despesa.
lanc = lanc[lanc["transferencia"] == 0].copy()
if lanc.empty:
    st.info("Ainda não há receitas/despesas para gerar relatórios (apenas transferências).")
    st.stop()

lanc["competencia"] = lanc["data"].dt.strftime("%Y-%m")

# ----------------------------------------------------------------------------- #
# Evolução mensal (receitas x despesas x saldo)
# ----------------------------------------------------------------------------- #
st.subheader("Evolução mensal")
mensal = (
    lanc.groupby(["competencia", "tipo"])["valor"].sum().unstack(fill_value=0).reset_index()
)
for col in ("receita", "despesa"):
    if col not in mensal.columns:
        mensal[col] = 0.0
mensal["saldo"] = mensal["receita"] - mensal["despesa"]
mensal = mensal.sort_values("competencia")
mensal["mes"] = mensal["competencia"].map(competencia_legivel)

fig = px.line(
    mensal, x="mes", y=["receita", "despesa", "saldo"], markers=True,
    color_discrete_map={"receita": "#2E7D32", "despesa": "#C62828", "saldo": "#1565C0"},
    labels={"mes": "Mês", "value": "Valor (R$)", "variable": ""},
    category_orders={"mes": mensal["mes"].tolist()},
)
fig.update_xaxes(type="category")
fig.update_layout(margin=dict(t=10, b=10, l=10, r=10))
st.plotly_chart(fig, use_container_width=True)

st.divider()

# ----------------------------------------------------------------------------- #
# Top categorias de despesa (acumulado)
# ----------------------------------------------------------------------------- #
st.subheader("Maiores despesas por categoria (total)")
desp = lanc[lanc["tipo"] == "despesa"].copy()
desp["categoria"] = desp["categoria"].fillna("Sem categoria")
top = (
    desp.groupby("categoria")["valor"].sum().reset_index().sort_values("valor", ascending=True)
)
fig2 = px.bar(
    top, x="valor", y="categoria", orientation="h",
    labels={"valor": "Total (R$)", "categoria": ""},
    color_discrete_sequence=["#C62828"],
)
fig2.update_layout(margin=dict(t=10, b=10, l=10, r=10))
st.plotly_chart(fig2, use_container_width=True)

st.divider()

# ----------------------------------------------------------------------------- #
# Relatório anual (com exportação Excel/PDF)
# ----------------------------------------------------------------------------- #
st.subheader("Relatório anual")
lanc["ano"] = lanc["data"].dt.year
anos = sorted(lanc["ano"].unique().tolist(), reverse=True)
ano = st.selectbox("Ano", anos, format_func=lambda a: str(a))

do_ano = lanc[lanc["ano"] == ano].copy()
do_ano["mes_num"] = do_ano["data"].dt.month

# Resumo por mês (todos os 12 meses).
base = pd.DataFrame({"mes_num": range(1, 13)})
piv = (
    do_ano.groupby(["mes_num", "tipo"])["valor"].sum().unstack(fill_value=0).reset_index()
)
resumo = base.merge(piv, on="mes_num", how="left").fillna(0)
for c in ("receita", "despesa"):
    if c not in resumo.columns:
        resumo[c] = 0.0
resumo["saldo"] = resumo["receita"] - resumo["despesa"]
resumo["Mês"] = resumo["mes_num"].map(MESES_PT)
resumo_export = resumo[["Mês", "receita", "despesa", "saldo"]].rename(
    columns={"receita": "Receitas", "despesa": "Despesas", "saldo": "Saldo"}
)

total_rec = float(resumo["receita"].sum())
total_desp = float(resumo["despesa"].sum())
a1, a2, a3 = st.columns(3)
a1.metric("Receitas do ano", brl(total_rec))
a2.metric("Despesas do ano", brl(total_desp))
a3.metric("Saldo do ano", brl(total_rec - total_desp))

fig3 = px.bar(
    resumo, x="Mês", y=["receita", "despesa"], barmode="group",
    color_discrete_map={"receita": "#2E7D32", "despesa": "#C62828"},
    labels={"Mês": "", "value": "Valor (R$)", "variable": ""},
    category_orders={"Mês": [MESES_PT[m] for m in range(1, 13)]},
)
fig3.update_layout(margin=dict(t=10, b=10, l=10, r=10))
st.plotly_chart(fig3, use_container_width=True)

# Despesas por categoria no ano.
desp_ano = do_ano[do_ano["tipo"] == "despesa"].copy()
desp_ano["categoria"] = desp_ano["categoria"].fillna("Sem categoria")
por_cat_ano = (
    desp_ano.groupby("categoria")["valor"].sum().reset_index()
    .sort_values("valor", ascending=False)
    .rename(columns={"categoria": "Categoria", "valor": "Total"})
)

# Tabela de lançamentos do ano para o Excel.
lanc_ano_export = do_ano[["data", "descricao", "tipo", "categoria", "conta", "valor", "pago"]].copy()
lanc_ano_export["data"] = lanc_ano_export["data"].dt.strftime("%d/%m/%Y")

col_x, col_p = st.columns(2)
xlsx_bytes = build_excel(ano, resumo_export, por_cat_ano, lanc_ano_export)
col_x.download_button(
    "⬇️ Baixar relatório do ano (Excel)",
    data=xlsx_bytes,
    file_name=f"relatorio_{ano}_meu_dinheiro.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)
pdf_bytes = build_pdf(ano, resumo_export, por_cat_ano, total_rec, total_desp)
col_p.download_button(
    "⬇️ Baixar relatório do ano (PDF)",
    data=pdf_bytes,
    file_name=f"relatorio_{ano}_meu_dinheiro.pdf",
    mime="application/pdf",
)

st.divider()

# ----------------------------------------------------------------------------- #
# Exportação
# ----------------------------------------------------------------------------- #
st.subheader("Exportar dados")
export = lanc[["data", "descricao", "tipo", "categoria", "conta", "valor", "pago"]].copy()
export["data"] = export["data"].dt.strftime("%d/%m/%Y")
st.download_button(
    "⬇️ Baixar todos os lançamentos (CSV)",
    data=export.to_csv(index=False).encode("utf-8-sig"),
    file_name="lancamentos_meu_dinheiro.csv",
    mime="text/csv",
)

with st.expander("Ver tabela completa"):
    export_view = export.copy()
    export_view["valor"] = export_view["valor"].map(brl)
    st.dataframe(export_view, hide_index=True, use_container_width=True)
