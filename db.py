"""Camada de acesso a dados (SQLite) do Meu Dinheiro.

Concentra a criação do schema, o carregamento inicial de categorias padrão
e todas as operações de leitura/escrita usadas pelas páginas do Streamlit.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from datetime import date

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "meu_dinheiro.db")

# Categorias criadas na primeira execução (nome, tipo, cor).
CATEGORIAS_PADRAO = [
    ("Salário", "receita", "#2E7D32"),
    ("Rendimentos", "receita", "#66BB6A"),
    ("Outras receitas", "receita", "#A5D6A7"),
    ("Moradia", "despesa", "#C62828"),
    ("Alimentação", "despesa", "#EF6C00"),
    ("Transporte", "despesa", "#F9A825"),
    ("Saúde", "despesa", "#AD1457"),
    ("Educação", "despesa", "#6A1B9A"),
    ("Lazer", "despesa", "#1565C0"),
    ("Compras", "despesa", "#00838F"),
    ("Contas e serviços", "despesa", "#4E342E"),
    ("Outras despesas", "despesa", "#546E7A"),
]

CONTAS_PADRAO = [
    ("Carteira", "dinheiro", 0.0),
    ("Conta corrente", "corrente", 0.0),
]


@contextmanager
def get_conn():
    """Fornece uma conexão SQLite com chaves estrangeiras ativas."""
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Cria as tabelas e popula dados padrão se o banco estiver vazio."""
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS contas (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                nome          TEXT NOT NULL UNIQUE,
                tipo          TEXT NOT NULL DEFAULT 'corrente',
                saldo_inicial REAL NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS categorias (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
                cor  TEXT NOT NULL DEFAULT '#607D8B',
                UNIQUE (nome, tipo)
            );

            CREATE TABLE IF NOT EXISTS lancamentos (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                data         TEXT NOT NULL,
                descricao    TEXT NOT NULL,
                valor        REAL NOT NULL,
                tipo         TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
                conta_id     INTEGER NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
                categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
                pago         INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS orcamentos (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
                competencia  TEXT NOT NULL,          -- 'AAAA-MM'
                valor        REAL NOT NULL,
                UNIQUE (categoria_id, competencia)
            );
            """
        )

        if conn.execute("SELECT COUNT(*) FROM categorias").fetchone()[0] == 0:
            conn.executemany(
                "INSERT INTO categorias (nome, tipo, cor) VALUES (?, ?, ?)",
                CATEGORIAS_PADRAO,
            )
        if conn.execute("SELECT COUNT(*) FROM contas").fetchone()[0] == 0:
            conn.executemany(
                "INSERT INTO contas (nome, tipo, saldo_inicial) VALUES (?, ?, ?)",
                CONTAS_PADRAO,
            )


# --------------------------------------------------------------------------- #
# Contas
# --------------------------------------------------------------------------- #
def listar_contas() -> pd.DataFrame:
    with get_conn() as conn:
        return pd.read_sql_query("SELECT * FROM contas ORDER BY nome", conn)


def criar_conta(nome: str, tipo: str, saldo_inicial: float) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO contas (nome, tipo, saldo_inicial) VALUES (?, ?, ?)",
            (nome.strip(), tipo, saldo_inicial),
        )


def excluir_conta(conta_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM contas WHERE id = ?", (conta_id,))


def saldo_por_conta() -> pd.DataFrame:
    """Saldo atual = saldo inicial + receitas pagas - despesas pagas."""
    with get_conn() as conn:
        return pd.read_sql_query(
            """
            SELECT c.id, c.nome, c.tipo, c.saldo_inicial,
                   c.saldo_inicial
                     + COALESCE(SUM(CASE WHEN l.pago = 1 AND l.tipo = 'receita'
                                         THEN l.valor
                                         WHEN l.pago = 1 AND l.tipo = 'despesa'
                                         THEN -l.valor ELSE 0 END), 0) AS saldo_atual
            FROM contas c
            LEFT JOIN lancamentos l ON l.conta_id = c.id
            GROUP BY c.id
            ORDER BY c.nome
            """,
            conn,
        )


# --------------------------------------------------------------------------- #
# Categorias
# --------------------------------------------------------------------------- #
def listar_categorias(tipo: str | None = None) -> pd.DataFrame:
    with get_conn() as conn:
        if tipo:
            return pd.read_sql_query(
                "SELECT * FROM categorias WHERE tipo = ? ORDER BY nome",
                conn,
                params=(tipo,),
            )
        return pd.read_sql_query("SELECT * FROM categorias ORDER BY tipo, nome", conn)


def criar_categoria(nome: str, tipo: str, cor: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO categorias (nome, tipo, cor) VALUES (?, ?, ?)",
            (nome.strip(), tipo, cor),
        )


def excluir_categoria(categoria_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM categorias WHERE id = ?", (categoria_id,))


# --------------------------------------------------------------------------- #
# Lançamentos
# --------------------------------------------------------------------------- #
def criar_lancamento(
    data_lanc: date,
    descricao: str,
    valor: float,
    tipo: str,
    conta_id: int,
    categoria_id: int | None,
    pago: bool,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO lancamentos
                (data, descricao, valor, tipo, conta_id, categoria_id, pago)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data_lanc.isoformat(),
                descricao.strip(),
                abs(valor),
                tipo,
                conta_id,
                categoria_id,
                int(pago),
            ),
        )


def excluir_lancamento(lancamento_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM lancamentos WHERE id = ?", (lancamento_id,))


def listar_lancamentos(
    inicio: date | None = None,
    fim: date | None = None,
    tipo: str | None = None,
) -> pd.DataFrame:
    """Retorna lançamentos com nomes de conta/categoria já resolvidos."""
    clausulas, params = [], []
    if inicio:
        clausulas.append("l.data >= ?")
        params.append(inicio.isoformat())
    if fim:
        clausulas.append("l.data <= ?")
        params.append(fim.isoformat())
    if tipo:
        clausulas.append("l.tipo = ?")
        params.append(tipo)
    where = ("WHERE " + " AND ".join(clausulas)) if clausulas else ""

    with get_conn() as conn:
        df = pd.read_sql_query(
            f"""
            SELECT l.id, l.data, l.descricao, l.valor, l.tipo, l.pago,
                   c.nome AS conta, cat.nome AS categoria, cat.cor AS cor
            FROM lancamentos l
            JOIN contas c ON c.id = l.conta_id
            LEFT JOIN categorias cat ON cat.id = l.categoria_id
            {where}
            ORDER BY l.data DESC, l.id DESC
            """,
            conn,
            params=params,
        )
    if not df.empty:
        df["data"] = pd.to_datetime(df["data"])
    return df


# --------------------------------------------------------------------------- #
# Orçamentos
# --------------------------------------------------------------------------- #
def definir_orcamento(categoria_id: int, competencia: str, valor: float) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO orcamentos (categoria_id, competencia, valor)
            VALUES (?, ?, ?)
            ON CONFLICT (categoria_id, competencia)
            DO UPDATE SET valor = excluded.valor
            """,
            (categoria_id, competencia, valor),
        )


def orcamento_vs_realizado(competencia: str) -> pd.DataFrame:
    """Compara o orçado com o gasto (despesas pagas) em uma competência AAAA-MM."""
    with get_conn() as conn:
        return pd.read_sql_query(
            """
            SELECT cat.nome AS categoria, cat.cor AS cor,
                   COALESCE(o.valor, 0) AS orcado,
                   COALESCE((
                       SELECT SUM(l.valor) FROM lancamentos l
                       WHERE l.categoria_id = cat.id
                         AND l.tipo = 'despesa' AND l.pago = 1
                         AND strftime('%Y-%m', l.data) = ?
                   ), 0) AS gasto
            FROM categorias cat
            LEFT JOIN orcamentos o
                   ON o.categoria_id = cat.id AND o.competencia = ?
            WHERE cat.tipo = 'despesa'
            ORDER BY cat.nome
            """,
            conn,
            params=(competencia, competencia),
        )
