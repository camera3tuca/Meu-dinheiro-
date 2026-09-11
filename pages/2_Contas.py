"""Gestão de contas (carteira, corrente, poupança, cartão)."""

from __future__ import annotations

import streamlit as st

import db
from auth import require_login
from utils import brl

st.set_page_config(page_title="Contas • Meu Dinheiro", page_icon="🏦", layout="wide")
db.init_db()
user_id = require_login()

st.title("🏦 Contas")

TIPOS = ["dinheiro", "corrente", "poupanca", "cartao", "investimento"]
TIPOS_LABEL = {
    "dinheiro": "Dinheiro",
    "corrente": "Conta corrente",
    "poupanca": "Poupança",
    "cartao": "Cartão de crédito",
    "investimento": "Investimento",
}

with st.expander("➕ Nova conta", expanded=True):
    with st.form("form_conta", clear_on_submit=True):
        col1, col2, col3 = st.columns(3)
        nome = col1.text_input("Nome", placeholder="Ex.: Nubank")
        tipo = col2.selectbox("Tipo", TIPOS, format_func=lambda t: TIPOS_LABEL[t])
        saldo = col3.number_input("Saldo inicial (R$)", step=100.0, format="%.2f")
        if st.form_submit_button("Adicionar conta", type="primary"):
            if not nome.strip():
                st.error("Informe o nome da conta.")
            else:
                try:
                    db.criar_conta(user_id, nome, tipo, saldo)
                    st.success(f"Conta '{nome}' criada!")
                    st.rerun()
                except Exception:
                    st.error("Já existe uma conta com esse nome.")

st.divider()
st.subheader("Suas contas")

saldos = db.saldo_por_conta(user_id)
if saldos.empty:
    st.info("Nenhuma conta cadastrada.")
else:
    total = saldos["saldo_atual"].sum()
    st.metric("Saldo total", brl(total))
    for _, row in saldos.iterrows():
        cols = st.columns([3, 2, 2, 2, 1])
        cols[0].write(f"**{row['nome']}**")
        cols[1].write(TIPOS_LABEL.get(row["tipo"], row["tipo"]))
        cols[2].write(f"Inicial: {brl(row['saldo_inicial'])}")
        cols[3].write(f"Atual: {brl(row['saldo_atual'])}")
        if cols[4].button("🗑️", key=f"delc_{row['id']}", help="Excluir conta e seus lançamentos"):
            db.excluir_conta(user_id, int(row["id"]))
            st.rerun()
    st.caption("Excluir uma conta remove também todos os seus lançamentos.")
