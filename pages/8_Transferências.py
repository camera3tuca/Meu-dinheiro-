"""Transferências entre contas."""

from __future__ import annotations

from datetime import date

import streamlit as st

import db
from utils import brl

st.set_page_config(page_title="Transferências • Meu Dinheiro", page_icon="🔁", layout="wide")
db.init_db()

st.title("🔁 Transferências entre contas")
st.caption(
    "Mova dinheiro de uma conta para outra. As transferências afetam o saldo das "
    "contas, mas **não** contam como receita ou despesa nos relatórios."
)

contas = db.listar_contas()
if len(contas) < 2:
    st.warning("Cadastre pelo menos **duas contas** na página **Contas** para transferir.")
    st.stop()

nomes = contas["nome"].tolist()

with st.form("form_transferencia", clear_on_submit=True):
    col1, col2 = st.columns(2)
    origem = col1.selectbox("De (origem)", nomes, index=0)
    destino = col2.selectbox("Para (destino)", nomes, index=1)

    col3, col4 = st.columns(2)
    data_transf = col3.date_input("Data", value=date.today(), format="DD/MM/YYYY")
    valor = col4.number_input("Valor (R$)", min_value=0.0, step=50.0, format="%.2f")

    descricao = st.text_input("Descrição (opcional)", placeholder="Ex.: Pagamento da fatura")

    if st.form_submit_button("Transferir", type="primary"):
        if origem == destino:
            st.error("Escolha contas diferentes para origem e destino.")
        elif valor <= 0:
            st.error("O valor deve ser maior que zero.")
        else:
            origem_id = int(contas.loc[contas["nome"] == origem, "id"].iloc[0])
            destino_id = int(contas.loc[contas["nome"] == destino, "id"].iloc[0])
            db.criar_transferencia(data_transf, valor, origem_id, destino_id, descricao)
            st.success(f"Transferência de {brl(valor)}: {origem} → {destino}")
            st.rerun()

st.divider()

# Saldos atualizados
st.subheader("Saldos das contas")
saldos = db.saldo_por_conta()
cols = st.columns(min(len(saldos), 4) or 1)
for i, (_, row) in enumerate(saldos.iterrows()):
    cols[i % len(cols)].metric(row["nome"], brl(row["saldo_atual"]))

st.divider()

# Histórico de transferências
st.subheader("Últimas transferências")
lanc = db.listar_lancamentos()
transf = lanc[(lanc["transferencia"] == 1) & (lanc["tipo"] == "despesa")] if not lanc.empty else lanc
if transf.empty:
    st.info("Nenhuma transferência registrada ainda.")
else:
    for _, row in transf.head(20).iterrows():
        c = st.columns([1, 4, 2, 1])
        c[0].write(row["data"].strftime("%d/%m/%Y"))
        c[1].write(f"🔁 {row['descricao']}")
        c[2].write(brl(row["valor"]))
        if c[3].button("🗑️", key=f"delt_{row['id']}", help="Excluir transferência (só este lado)"):
            db.excluir_lancamento(int(row["id"]))
            st.rerun()
    st.caption(
        "Cada transferência gera dois lançamentos (saída e entrada). Excluir aqui "
        "remove apenas o lançamento de saída mostrado."
    )
