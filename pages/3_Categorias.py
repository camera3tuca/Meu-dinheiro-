"""Gestão de categorias de receitas e despesas."""

from __future__ import annotations

import streamlit as st

import db
from auth import botao_sair, require_login

st.set_page_config(page_title="Categorias • Meu Dinheiro", page_icon="🏷️", layout="wide")
require_login()
db.init_db()
botao_sair()

st.title("🏷️ Categorias")

with st.expander("➕ Nova categoria", expanded=True):
    with st.form("form_categoria", clear_on_submit=True):
        col1, col2, col3 = st.columns(3)
        nome = col1.text_input("Nome", placeholder="Ex.: Pets")
        tipo = col2.selectbox(
            "Tipo", ["despesa", "receita"],
            format_func=lambda t: "Despesa" if t == "despesa" else "Receita",
        )
        cor = col3.color_picker("Cor", value="#607D8B")
        if st.form_submit_button("Adicionar categoria", type="primary"):
            if not nome.strip():
                st.error("Informe o nome da categoria.")
            else:
                try:
                    db.criar_categoria(nome, tipo, cor)
                    st.success(f"Categoria '{nome}' criada!")
                    st.rerun()
                except Exception:
                    st.error("Já existe uma categoria com esse nome e tipo.")

st.divider()

col_desp, col_rec = st.columns(2)

with col_desp:
    st.subheader("Despesas")
    for _, row in db.listar_categorias(tipo="despesa").iterrows():
        c = st.columns([1, 5, 1])
        c[0].markdown(
            f"<div style='width:18px;height:18px;border-radius:4px;"
            f"background:{row['cor']}'></div>",
            unsafe_allow_html=True,
        )
        c[1].write(row["nome"])
        if c[2].button("🗑️", key=f"delcat_{row['id']}"):
            db.excluir_categoria(int(row["id"]))
            st.rerun()

with col_rec:
    st.subheader("Receitas")
    for _, row in db.listar_categorias(tipo="receita").iterrows():
        c = st.columns([1, 5, 1])
        c[0].markdown(
            f"<div style='width:18px;height:18px;border-radius:4px;"
            f"background:{row['cor']}'></div>",
            unsafe_allow_html=True,
        )
        c[1].write(row["nome"])
        if c[2].button("🗑️", key=f"delcatr_{row['id']}"):
            db.excluir_categoria(int(row["id"]))
            st.rerun()

st.caption("Ao excluir uma categoria, os lançamentos ligados a ela ficam 'Sem categoria'.")
