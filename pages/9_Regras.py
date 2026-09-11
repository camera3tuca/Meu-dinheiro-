"""Regras de categorização automática por palavra-chave.

As regras são aplicadas automaticamente ao importar extratos: quando a descrição
de um lançamento contém a palavra-chave, a categoria da regra é atribuída.
"""

from __future__ import annotations

import streamlit as st

import db
from auth import botao_sair, require_login

st.set_page_config(page_title="Regras • Meu Dinheiro", page_icon="🪄", layout="wide")
require_login()
db.init_db()
botao_sair()

st.title("🪄 Categorização automática")
st.caption(
    "Crie regras do tipo **palavra-chave → categoria**. Ao importar um extrato, "
    "cada lançamento cuja descrição contenha a palavra recebe a categoria "
    "automaticamente. A palavra mais específica (mais longa) tem prioridade."
)

categorias = db.listar_categorias()
if categorias.empty:
    st.warning("Cadastre categorias primeiro na página **Categorias**.")
    st.stop()

with st.form("form_regra", clear_on_submit=True):
    col1, col2 = st.columns([2, 2])
    palavra = col1.text_input("Palavra-chave", placeholder="Ex.: uber, ifood, posto")
    # Rótulo com o tipo para diferenciar categorias de receita/despesa homônimas.
    rotulos = {
        f"{r['nome']} ({'receita' if r['tipo'] == 'receita' else 'despesa'})": int(r["id"])
        for _, r in categorias.iterrows()
    }
    escolha = col2.selectbox("Categoria", list(rotulos.keys()))

    if st.form_submit_button("Adicionar regra", type="primary"):
        if not palavra.strip():
            st.error("Informe a palavra-chave.")
        else:
            db.criar_regra(palavra, rotulos[escolha])
            st.success(f"Regra criada: '{palavra.strip().lower()}' → {escolha}")
            st.rerun()

st.divider()

st.subheader("Regras cadastradas")
regras = db.listar_regras()
if regras.empty:
    st.info("Nenhuma regra ainda. Crie a primeira acima para agilizar as importações.")
else:
    for _, row in regras.iterrows():
        c = st.columns([3, 4, 1])
        c[0].markdown(f"**{row['palavra_chave'].lower()}**")
        c[1].markdown(
            f"<span style='color:{row['cor']}'>●</span> {row['categoria']} "
            f"<small>({row['tipo']})</small>",
            unsafe_allow_html=True,
        )
        if c[2].button("🗑️", key=f"delr_{row['id']}"):
            db.excluir_regra(int(row["id"]))
            st.rerun()

    # Teste rápido de uma descrição
    st.divider()
    st.subheader("Testar uma descrição")
    teste = st.text_input("Digite uma descrição para ver qual categoria seria aplicada")
    if teste.strip():
        cat_id = db.sugerir_categoria(teste)
        if cat_id is None:
            st.warning("Nenhuma regra corresponde a essa descrição.")
        else:
            nome = categorias.loc[categorias["id"] == cat_id, "nome"].iloc[0]
            st.success(f"➡️ Seria categorizado como **{nome}**")
