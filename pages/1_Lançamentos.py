"""Cadastro e consulta de lançamentos (receitas e despesas)."""

from __future__ import annotations

from datetime import date

import streamlit as st

import db
from utils import brl

st.set_page_config(page_title="Lançamentos • Meu Dinheiro", page_icon="🧾", layout="wide")
db.init_db()

st.title("🧾 Lançamentos")

contas = db.listar_contas()
if contas.empty:
    st.warning("Cadastre uma conta primeiro na página **Contas**.")
    st.stop()

# ----------------------------------------------------------------------------- #
# Novo lançamento
# ----------------------------------------------------------------------------- #
with st.expander("➕ Novo lançamento", expanded=True):
    tipo = st.radio("Tipo", ["despesa", "receita"], horizontal=True,
                    format_func=lambda t: "Despesa" if t == "despesa" else "Receita")

    categorias = db.listar_categorias(tipo=tipo)
    with st.form("form_lancamento", clear_on_submit=True):
        col1, col2, col3 = st.columns(3)
        data_lanc = col1.date_input("Data", value=date.today(), format="DD/MM/YYYY")
        valor = col2.number_input("Valor (R$)", min_value=0.0, step=10.0, format="%.2f")
        conta_nome = col3.selectbox("Conta", contas["nome"].tolist())

        col4, col5 = st.columns([2, 1])
        descricao = col4.text_input("Descrição", placeholder="Ex.: Supermercado")
        if categorias.empty:
            st.info("Nenhuma categoria deste tipo. Crie em **Categorias**.")
            categoria_nome = None
        else:
            categoria_nome = col5.selectbox("Categoria", categorias["nome"].tolist())

        pago = st.checkbox("Pago / recebido", value=True)
        enviado = st.form_submit_button("Salvar lançamento", type="primary")

    if enviado:
        if not descricao.strip():
            st.error("Informe uma descrição.")
        elif valor <= 0:
            st.error("O valor deve ser maior que zero.")
        else:
            conta_id = int(contas.loc[contas["nome"] == conta_nome, "id"].iloc[0])
            categoria_id = None
            if categoria_nome is not None:
                categoria_id = int(
                    categorias.loc[categorias["nome"] == categoria_nome, "id"].iloc[0]
                )
            db.criar_lancamento(
                data_lanc, descricao, valor, tipo, conta_id, categoria_id, pago
            )
            st.success(f"Lançamento de {brl(valor)} salvo!")
            st.rerun()

st.divider()

# ----------------------------------------------------------------------------- #
# Filtros e listagem
# ----------------------------------------------------------------------------- #
st.subheader("Histórico")
f1, f2, f3 = st.columns(3)
inicio = f1.date_input("De", value=date.today().replace(day=1), format="DD/MM/YYYY")
fim = f2.date_input("Até", value=date.today(), format="DD/MM/YYYY")
filtro_tipo = f3.selectbox(
    "Tipo", ["Todos", "receita", "despesa"],
    format_func=lambda t: {"Todos": "Todos", "receita": "Receitas", "despesa": "Despesas"}[t],
)

lanc = db.listar_lancamentos(
    inicio=inicio,
    fim=fim,
    tipo=None if filtro_tipo == "Todos" else filtro_tipo,
)

if lanc.empty:
    st.info("Nenhum lançamento no período selecionado.")
else:
    total_rec = lanc.loc[lanc["tipo"] == "receita", "valor"].sum()
    total_desp = lanc.loc[lanc["tipo"] == "despesa", "valor"].sum()
    m1, m2, m3 = st.columns(3)
    m1.metric("Receitas", brl(total_rec))
    m2.metric("Despesas", brl(total_desp))
    m3.metric("Saldo", brl(total_rec - total_desp))

    for _, row in lanc.iterrows():
        sinal = "🟢" if row["tipo"] == "receita" else "🔴"
        cols = st.columns([1, 3, 2, 2, 2, 1])
        cols[0].write(row["data"].strftime("%d/%m/%Y"))
        cols[1].write(f"{sinal} {row['descricao']}")
        cols[2].write(row["categoria"] or "—")
        cols[3].write(row["conta"])
        cols[4].write(brl(row["valor"]))
        if cols[5].button("🗑️", key=f"del_{row['id']}", help="Excluir"):
            db.excluir_lancamento(int(row["id"]))
            st.rerun()
