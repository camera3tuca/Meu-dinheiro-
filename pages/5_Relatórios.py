"""Relatórios: evolução mensal, categorias e exportação em CSV."""

from __future__ import annotations

import plotly.express as px
import streamlit as st

import db
from utils import brl

st.set_page_config(page_title="Relatórios • Meu Dinheiro", page_icon="📊", layout="wide")
db.init_db()

st.title("📊 Relatórios")

lanc = db.listar_lancamentos()
if lanc.empty:
    st.info("Ainda não há lançamentos para gerar relatórios.")
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

fig = px.line(
    mensal, x="competencia", y=["receita", "despesa", "saldo"], markers=True,
    color_discrete_map={"receita": "#2E7D32", "despesa": "#C62828", "saldo": "#1565C0"},
    labels={"competencia": "Mês", "value": "Valor (R$)", "variable": ""},
)
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
