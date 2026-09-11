"""Autenticação simples por senha para uso pessoal na web.

A senha é lida de `st.secrets["APP_PASSWORD"]` (ou da variável de ambiente
`APP_PASSWORD`). Se nenhuma senha estiver configurada, o acesso fica **livre**
— cômodo para desenvolvimento local. Em produção, defina APP_PASSWORD nos
*Secrets* do Streamlit para exigir login.
"""

from __future__ import annotations

import os

import streamlit as st


def _senha_configurada() -> str:
    try:
        if "APP_PASSWORD" in st.secrets:
            return str(st.secrets["APP_PASSWORD"]).strip()
    except Exception:
        pass
    return os.environ.get("APP_PASSWORD", "").strip()


def require_login() -> None:
    """Bloqueia a página até o usuário informar a senha correta.

    Deve ser chamada no início de cada página, após `st.set_page_config`.
    """
    senha = _senha_configurada()
    if not senha:
        return  # Sem senha configurada: acesso livre.
    if st.session_state.get("_autenticado"):
        return

    st.title("🔒 Meu Dinheiro")
    st.caption("Acesso protegido — informe a senha para continuar.")
    with st.form("login"):
        entrada = st.text_input("Senha", type="password")
        if st.form_submit_button("Entrar", type="primary"):
            if entrada == senha:
                st.session_state["_autenticado"] = True
                st.rerun()
            else:
                st.error("Senha incorreta.")
    st.stop()


def botao_sair() -> None:
    """Mostra um botão de logout na barra lateral (se a senha estiver ativa)."""
    if not _senha_configurada():
        return
    if st.sidebar.button("🚪 Sair"):
        st.session_state["_autenticado"] = False
        st.rerun()
