"""Orçamento mensal por categoria: definir limites e acompanhar o realizado."""

from __future__ import annotations

from datetime import date

import plotly.express as px
import streamlit as st

import db
from auth import botao_sair, require_login
from utils import brl, competencia_legivel

st.set_page_config(page_title="Orçamento • Meu Dinheiro", page_icon="🎯", layout="wide")
require_login()
db.init_db()
botao_sair()

st.title("🎯 Orçamento mensal")

# Seleção de competência (últimos 12 meses + próximos 3).
hoje = date.today()
opcoes = []
for delta in range(-11, 4):
    ano = hoje.year + (hoje.month - 1 + delta) // 12
    mes = (hoje.month - 1 + delta) % 12 + 1
    opcoes.append(f"{ano:04d}-{mes:02d}")
opcoes = sorted(set(opcoes), reverse=True)

competencia = st.selectbox(
    "Competência", opcoes, index=opcoes.index(hoje.strftime("%Y-%m")),
    format_func=competencia_legivel,
)

st.subheader("Definir limites por categoria")
dados = db.orcamento_vs_realizado(competencia)

with st.form("form_orcamento"):
    valores = {}
    for _, row in dados.iterrows():
        cols = st.columns([3, 2])
        cols[0].markdown(
            f"<span style='color:{row['cor']}'>●</span> {row['categoria']}",
            unsafe_allow_html=True,
        )
        valores[row["categoria"]] = cols[1].number_input(
            f"Orçado {row['categoria']}",
            min_value=0.0, value=float(row["orcado"]), step=50.0,
            format="%.2f", label_visibility="collapsed",
        )
    if st.form_submit_button("Salvar orçamento", type="primary"):
        cats = db.listar_categorias(tipo="despesa")
        for nome, valor in valores.items():
            cat_id = int(cats.loc[cats["nome"] == nome, "id"].iloc[0])
            db.definir_orcamento(cat_id, competencia, valor)
        st.success("Orçamento salvo!")
        st.rerun()

st.divider()

# ----------------------------------------------------------------------------- #
# Acompanhamento (orçado x gasto)
# ----------------------------------------------------------------------------- #
st.subheader(f"Acompanhamento — {competencia_legivel(competencia)}")
com_orcamento = dados[(dados["orcado"] > 0) | (dados["gasto"] > 0)].copy()

if com_orcamento.empty:
    st.info("Defina limites acima para acompanhar seus gastos.")
else:
    total_orcado = com_orcamento["orcado"].sum()
    total_gasto = com_orcamento["gasto"].sum()
    m1, m2, m3 = st.columns(3)
    m1.metric("Orçado", brl(total_orcado))
    m2.metric("Gasto", brl(total_gasto))
    m3.metric("Disponível", brl(total_orcado - total_gasto))

    for _, row in com_orcamento.iterrows():
        orcado, gasto = row["orcado"], row["gasto"]
        st.markdown(f"**{row['categoria']}** — {brl(gasto)} de {brl(orcado)}")
        if orcado > 0:
            proporcao = min(gasto / orcado, 1.0)
            st.progress(proporcao)
            if gasto > orcado:
                st.caption(f"⚠️ Excedeu em {brl(gasto - orcado)}")
        else:
            st.caption("Sem limite definido para esta categoria.")

    graf = com_orcamento.melt(
        id_vars="categoria", value_vars=["orcado", "gasto"],
        var_name="tipo", value_name="valor",
    )
    fig = px.bar(
        graf, x="categoria", y="valor", color="tipo", barmode="group",
        color_discrete_map={"orcado": "#90A4AE", "gasto": "#C62828"},
        labels={"categoria": "Categoria", "valor": "Valor (R$)", "tipo": ""},
    )
    fig.update_layout(margin=dict(t=10, b=10, l=10, r=10))
    st.plotly_chart(fig, use_container_width=True)
