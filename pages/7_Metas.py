"""Metas de economia: objetivos de poupança com acompanhamento do progresso."""

from __future__ import annotations

from datetime import date

import pandas as pd
import streamlit as st

import db
from auth import require_login
from utils import brl

st.set_page_config(page_title="Metas • Meu Dinheiro", page_icon="🐖", layout="wide")
db.init_db()
user_id = require_login()

st.title("🐖 Metas de economia")
st.caption("Defina objetivos (viagem, reserva de emergência, etc.) e acompanhe quanto já juntou.")

# ----------------------------------------------------------------------------- #
# Nova meta
# ----------------------------------------------------------------------------- #
with st.expander("➕ Nova meta", expanded=True):
    with st.form("form_meta", clear_on_submit=True):
        col1, col2 = st.columns(2)
        nome = col1.text_input("Nome da meta", placeholder="Ex.: Viagem de férias")
        alvo = col2.number_input("Valor alvo (R$)", min_value=0.0, step=100.0, format="%.2f")
        col3, col4 = st.columns(2)
        inicial = col3.number_input("Já guardado (R$)", min_value=0.0, step=50.0, format="%.2f")
        usar_prazo = col4.checkbox("Definir prazo")
        prazo = col4.date_input("Prazo", value=date.today(), format="DD/MM/YYYY") if usar_prazo else None

        if st.form_submit_button("Criar meta", type="primary"):
            if not nome.strip():
                st.error("Informe o nome da meta.")
            elif alvo <= 0:
                st.error("O valor alvo deve ser maior que zero.")
            else:
                db.criar_meta(user_id, nome, alvo, inicial, prazo)
                st.success(f"Meta '{nome}' criada!")
                st.rerun()

st.divider()

# ----------------------------------------------------------------------------- #
# Lista de metas
# ----------------------------------------------------------------------------- #
metas = db.listar_metas(user_id)
if metas.empty:
    st.info("Nenhuma meta cadastrada ainda. Crie a primeira acima. 🎯")
else:
    for _, meta in metas.iterrows():
        alvo = float(meta["valor_alvo"])
        atual = float(meta["valor_atual"])
        proporcao = min(atual / alvo, 1.0) if alvo > 0 else 0.0
        falta = max(alvo - atual, 0.0)

        with st.container(border=True):
            topo = st.columns([3, 1])
            concluida = "✅ " if atual >= alvo else ""
            topo[0].markdown(f"### {concluida}{meta['nome']}")
            if meta["prazo"]:
                prazo_dt = pd.to_datetime(meta["prazo"]).date()
                dias = (prazo_dt - date.today()).days
                aviso = f"📅 {prazo_dt.strftime('%d/%m/%Y')}"
                aviso += f" ({dias} dias)" if dias >= 0 else " (vencido)"
                topo[1].caption(aviso)

            st.progress(proporcao)
            info = st.columns(3)
            info[0].metric("Guardado", brl(atual))
            info[1].metric("Alvo", brl(alvo))
            info[2].metric("Falta", brl(falta), delta=f"{proporcao * 100:.0f}% concluído")

            acao = st.columns([2, 1, 1])
            novo_valor = acao[0].number_input(
                "Atualizar valor guardado", min_value=0.0, value=atual, step=50.0,
                format="%.2f", key=f"upd_{meta['id']}",
            )
            if acao[1].button("💾 Salvar", key=f"save_{meta['id']}"):
                db.atualizar_valor_meta(user_id, int(meta["id"]), novo_valor)
                st.rerun()
            if acao[2].button("🗑️ Excluir", key=f"delm_{meta['id']}"):
                db.excluir_meta(user_id, int(meta["id"]))
                st.rerun()
