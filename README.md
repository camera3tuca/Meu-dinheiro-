# 💰 Meu Dinheiro

Monitor de **finanças pessoais** inspirado no [minhaseconomias.com.br](https://minhaseconomias.com.br),
desenvolvido em **Python + Streamlit** com banco local **SQLite**.

Esta é a primeira versão (MVP) usada para desenvolver e validar o sistema.

## ✨ Funcionalidades

- **Painel (Dashboard):** receitas, despesas e saldo do mês, patrimônio total, gráfico
  de despesas por categoria e comparativo diário de receitas x despesas.
- **Lançamentos:** cadastro de receitas e despesas com data, valor, conta, categoria e
  status (pago/recebido); filtros por período e tipo; exclusão.
- **Contas:** carteira, conta corrente, poupança, cartão e investimentos, com saldo
  inicial e saldo atual calculado automaticamente.
- **Categorias:** categorias de receita e despesa personalizáveis, com cor.
- **Orçamento:** limites mensais por categoria e acompanhamento do realizado (barras de
  progresso e alertas de estouro).
- **Relatórios:** evolução mensal, maiores despesas por categoria e exportação em CSV.

Os dados padrão (categorias e contas) são criados automaticamente na primeira execução.

## 🚀 Como executar

```bash
# 1. (opcional) criar ambiente virtual
python -m venv .venv && source .venv/bin/activate

# 2. instalar dependências
pip install -r requirements.txt

# 3. rodar o app
streamlit run app.py
```

O aplicativo abre em `http://localhost:8501`. O banco de dados é criado em
`data/meu_dinheiro.db` (ignorado pelo Git).

## 🗂️ Estrutura

```
.
├── app.py                    # Página inicial (Dashboard)
├── db.py                     # Acesso a dados (SQLite) e schema
├── utils.py                  # Formatação (R$, meses) e datas
├── requirements.txt
└── pages/
    ├── 1_Lançamentos.py
    ├── 2_Contas.py
    ├── 3_Categorias.py
    ├── 4_Orçamento.py
    └── 5_Relatórios.py
```

## 🧱 Stack

- [Streamlit](https://streamlit.io/) — interface web
- [pandas](https://pandas.pydata.org/) — manipulação de dados
- [Plotly](https://plotly.com/python/) — gráficos interativos
- SQLite — armazenamento local

## 🛣️ Próximos passos (ideias)

- Lançamentos recorrentes e parcelados
- Importação de extratos (OFX/CSV)
- Metas de economia
- Múltiplos usuários / autenticação
- Migração para banco em servidor (PostgreSQL) e deploy
