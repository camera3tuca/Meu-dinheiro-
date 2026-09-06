"""Importação de extratos bancários em CSV ou OFX."""

from __future__ import annotations

import pandas as pd
import streamlit as st

import db
import importador
from utils import brl

st.set_page_config(page_title="Importar • Meu Dinheiro", page_icon="📥", layout="wide")
db.init_db()

st.title("📥 Importar extrato")
st.caption("Envie um arquivo **CSV** ou **OFX** do seu banco para lançar as transações em lote.")

contas = db.listar_contas()
if contas.empty:
    st.warning("Cadastre uma conta primeiro na página **Contas**.")
    st.stop()

col1, col2 = st.columns(2)
conta_nome = col1.selectbox("Conta de destino", contas["nome"].tolist())
categorias = db.listar_categorias()
opcoes_cat = ["(sem categoria)"] + categorias["nome"].tolist()

arquivo = st.file_uploader("Arquivo do extrato", type=["csv", "ofx", "qfx", "txt"])

with st.expander("ℹ️ Formatos aceitos"):
    st.markdown(
        """
        - **CSV:** precisa ter ao menos colunas de **data** e **valor** (a descrição é
          opcional). Reconhece nomes usuais (`data`, `descricao`, `valor`, `tipo`),
          separador `,` ou `;` e valores no formato brasileiro (`1.234,56`).
          Valores negativos viram despesas; positivos, receitas.
        - **OFX/QFX:** formato padrão exportado pela maioria dos bancos.
        """
    )

if arquivo is not None:
    conteudo = arquivo.getvalue()
    try:
        if arquivo.name.lower().endswith((".ofx", ".qfx")):
            prev = importador.ler_ofx(conteudo)
        else:
            prev = importador.ler_csv(conteudo)
    except Exception as e:  # noqa: BLE001 - mostrar erro amigável ao usuário
        st.error(f"Não foi possível ler o arquivo: {e}")
        st.stop()

    if prev.empty:
        st.warning("Nenhuma transação reconhecida no arquivo.")
        st.stop()

    st.subheader(f"Prévia — {len(prev)} transações encontradas")
    rec = prev.loc[prev["tipo"] == "receita", "valor"].sum()
    desp = prev.loc[prev["tipo"] == "despesa", "valor"].sum()
    m1, m2, m3 = st.columns(3)
    m1.metric("Receitas", brl(rec))
    m2.metric("Despesas", brl(desp))
    m3.metric("Saldo", brl(rec - desp))

    tabela = prev.copy()
    tabela["data"] = pd.to_datetime(tabela["data"]).dt.strftime("%d/%m/%Y")
    tabela["valor"] = tabela["valor"].map(brl)
    st.dataframe(tabela, hide_index=True, use_container_width=True)

    categoria_padrao = st.selectbox(
        "Aplicar categoria a todos (opcional)", opcoes_cat
    )
    marcar_pago = st.checkbox("Marcar todas como pagas/recebidas", value=True)

    if st.button(f"Importar {len(prev)} lançamentos", type="primary"):
        conta_id = int(contas.loc[contas["nome"] == conta_nome, "id"].iloc[0])
        categoria_id = None
        if categoria_padrao != "(sem categoria)":
            categoria_id = int(
                categorias.loc[categorias["nome"] == categoria_padrao, "id"].iloc[0]
            )
        itens = [
            {
                "data": row["data"],
                "descricao": row["descricao"] or "Lançamento importado",
                "valor": row["valor"],
                "tipo": row["tipo"],
                "conta_id": conta_id,
                "categoria_id": categoria_id,
                "pago": marcar_pago,
            }
            for _, row in prev.iterrows()
        ]
        qtd = db.criar_lancamentos_em_lote(itens)
        st.success(f"{qtd} lançamentos importados para a conta '{conta_nome}'!")
        st.balloons()
