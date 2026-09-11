"""Autenticação multiusuário: cada pessoa tem seu login e seus próprios dados.

- Login e cadastro de contas de usuário (senha guardada com hash PBKDF2).
- `require_login()` protege cada página e devolve o `user_id` do usuário logado.
- Cadastro aberto por padrão; se o segredo `REGISTRATION_CODE` estiver definido,
  passa a ser exigido um código de convite para criar conta.
"""

from __future__ import annotations

import os

import streamlit as st

import db


def _codigo_convite() -> str:
    try:
        if "REGISTRATION_CODE" in st.secrets:
            return str(st.secrets["REGISTRATION_CODE"]).strip()
    except Exception:
        pass
    return os.environ.get("REGISTRATION_CODE", "").strip()


def current_user_id() -> int | None:
    return st.session_state.get("user_id")


def _sidebar_usuario() -> None:
    st.sidebar.caption(f"👤 {st.session_state.get('usuario', '')}")
    if st.sidebar.button("🚪 Sair"):
        for chave in ("user_id", "usuario", "edit_id"):
            st.session_state.pop(chave, None)
        st.rerun()


def require_login() -> int:
    """Exige login. Devolve o id do usuário logado (ou bloqueia a página)."""
    if st.session_state.get("user_id"):
        _sidebar_usuario()
        return int(st.session_state["user_id"])

    st.title("💰 Meu Dinheiro")
    st.caption("Entre na sua conta ou crie uma nova para começar.")
    aba_entrar, aba_criar = st.tabs(["Entrar", "Criar conta"])

    with aba_entrar:
        with st.form("login"):
            u = st.text_input("Usuário")
            s = st.text_input("Senha", type="password")
            if st.form_submit_button("Entrar", type="primary"):
                uid = db.autenticar(u, s)
                if uid:
                    st.session_state["user_id"] = uid
                    st.session_state["usuario"] = u.strip()
                    st.rerun()
                else:
                    st.error("Usuário ou senha inválidos.")

    with aba_criar:
        exige_codigo = _codigo_convite()
        with st.form("registro"):
            nu = st.text_input("Novo usuário")
            s1 = st.text_input("Senha", type="password")
            s2 = st.text_input("Confirmar senha", type="password")
            codigo = st.text_input("Código de convite", type="password") if exige_codigo else ""
            if st.form_submit_button("Criar conta", type="primary"):
                nu = nu.strip()
                if len(nu) < 3:
                    st.error("O usuário deve ter ao menos 3 caracteres.")
                elif len(s1) < 4:
                    st.error("A senha deve ter ao menos 4 caracteres.")
                elif s1 != s2:
                    st.error("As senhas não coincidem.")
                elif exige_codigo and codigo.strip() != exige_codigo:
                    st.error("Código de convite inválido.")
                elif db.usuario_existe(nu):
                    st.error("Esse usuário já existe. Escolha outro.")
                else:
                    uid = db.criar_usuario(nu, s1)
                    st.session_state["user_id"] = uid
                    st.session_state["usuario"] = nu
                    st.rerun()

    st.stop()
