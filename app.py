"""Meu Dinheiro — monitor de finanças pessoais (Streamlit).

Página inicial: visão geral do mês (saldo, receitas, despesas) com gráficos.
As demais telas ficam em `pages/`.
"""

from __future__ import annotations

from datetime import date

import pandas as pd
import plotly.express as px
import streamlit as st

import db
from auth import require_login
from utils import brl, competencia_atual, competencia_legivel

st.set_page_config(page_title="Meu Dinheiro", page_icon="💰", layout="wide")

db.init_db()
user_id = require_login()

st.title("💰 Meu Dinheiro")
st.caption("Monitor de finanças pessoais — controle de receitas, despesas e orçamento.")

# ----------------------------------------------------------------------------- #
# Filtro de competência (mês)
# ----------------------------------------------------------------------------- #
lanc_todos = db.listar_lancamentos(user_id)
if lanc_todos.empty:
    competencias = [competencia_atual()]
else:
    competencias = sorted(
        lanc_todos["data"].dt.strftime("%Y-%m").unique().tolist(), reverse=True
    )
    if competencia_atual() not in competencias:
        competencias.insert(0, competencia_atual())

competencia = st.selectbox(
    "Mês de referência",
    competencias,
    format_func=competencia_legivel,
)
ano, mes = map(int, competencia.split("-"))
inicio = date(ano, mes, 1)
fim = date(ano + (mes == 12), (mes % 12) + 1, 1) - pd.Timedelta(days=1)
fim = fim.date() if hasattr(fim, "date") else fim

lanc = db.listar_lancamentos(user_id, inicio=inicio, fim=fim)
# Transferências entre contas não contam como receita/despesa nos indicadores.
mov = lanc[lanc["transferencia"] == 0] if not lanc.empty else lanc

receitas = mov.loc[mov["tipo"] == "receita", "valor"].sum() if not mov.empty else 0.0
despesas = mov.loc[mov["tipo"] == "despesa", "valor"].sum() if not mov.empty else 0.0
saldo_mes = receitas - despesas

# ----------------------------------------------------------------------------- #
# Indicadores
# ----------------------------------------------------------------------------- #
c1, c2, c3, c4 = st.columns(4)
c1.metric("Receitas do mês", brl(receitas))
c2.metric("Despesas do mês", brl(despesas))
c3.metric("Saldo do mês", brl(saldo_mes), delta=brl(saldo_mes))

saldos = db.saldo_por_conta(user_id)
patrimonio = saldos["saldo_atual"].sum() if not saldos.empty else 0.0
c4.metric("Saldo total (contas)", brl(patrimonio))

st.divider()

# ----------------------------------------------------------------------------- #
# Gráficos
# ----------------------------------------------------------------------------- #
col_esq, col_dir = st.columns(2)

with col_esq:
    st.subheader("Despesas por categoria")
    desp = mov[mov["tipo"] == "despesa"]
    if desp.empty:
        st.info("Sem despesas registradas neste mês.")
    else:
        por_cat = (
            desp.groupby(["categoria", "cor"], dropna=False)["valor"]
            .sum()
            .reset_index()
            .sort_values("valor", ascending=False)
        )
        por_cat["categoria"] = por_cat["categoria"].fillna("Sem categoria")
        fig = px.pie(
            por_cat,
            names="categoria",
            values="valor",
            color="categoria",
            color_discrete_sequence=por_cat["cor"].fillna("#607D8B").tolist(),
            hole=0.45,
        )
        fig.update_traces(textposition="inside", textinfo="percent+label")
        fig.update_layout(showlegend=False, margin=dict(t=10, b=10, l=10, r=10))
        st.plotly_chart(fig, use_container_width=True)

with col_dir:
    st.subheader("Receitas x Despesas por dia")
    if mov.empty:
        st.info("Sem lançamentos neste mês.")
    else:
        por_dia = (
            mov.assign(dia=mov["data"].dt.day)
            .groupby(["dia", "tipo"])["valor"]
            .sum()
            .reset_index()
        )
        fig2 = px.bar(
            por_dia,
            x="dia",
            y="valor",
            color="tipo",
            barmode="group",
            color_discrete_map={"receita": "#2E7D32", "despesa": "#C62828"},
            labels={"dia": "Dia", "valor": "Valor (R$)", "tipo": "Tipo"},
        )
        fig2.update_layout(margin=dict(t=10, b=10, l=10, r=10))
        st.plotly_chart(fig2, use_container_width=True)

st.divider()

# ----------------------------------------------------------------------------- #
# Saldo das contas + últimos lançamentos
# ----------------------------------------------------------------------------- #
col_a, col_b = st.columns([1, 2])

with col_a:
    st.subheader("Saldo por conta")
    if saldos.empty:
        st.info("Nenhuma conta cadastrada.")
    else:
        tabela = saldos[["nome", "saldo_atual"]].copy()
        tabela["saldo_atual"] = tabela["saldo_atual"].map(brl)
        tabela.columns = ["Conta", "Saldo atual"]
        st.dataframe(tabela, hide_index=True, use_container_width=True)

with col_b:
    st.subheader("Últimos lançamentos do mês")
    if lanc.empty:
        st.info("Adicione lançamentos na página **Lançamentos**.")
    else:
        recentes = lanc.head(10).copy()
        recentes["data"] = recentes["data"].dt.strftime("%d/%m/%Y")
        recentes["valor"] = recentes.apply(
            lambda r: ("➕ " if r["tipo"] == "receita" else "➖ ") + brl(r["valor"]),
            axis=1,
        )
        recentes = recentes[["data", "descricao", "categoria", "conta", "valor"]]
        recentes.columns = ["Data", "Descrição", "Categoria", "Conta", "Valor"]
        st.dataframe(recentes, hide_index=True, use_container_width=True)

st.caption("Use o menu lateral para navegar entre Lançamentos, Contas, Categorias, Orçamento e Relatórios.")
