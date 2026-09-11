# 💰 Meu Dinheiro

Monitor de **finanças pessoais** inspirado no [minhaseconomias.com.br](https://minhaseconomias.com.br),
desenvolvido em **Python + Streamlit** com banco local **SQLite**.

Esta é a primeira versão (MVP) usada para desenvolver e validar o sistema.

## ✨ Funcionalidades

- **Painel (Dashboard):** receitas, despesas e saldo do mês, patrimônio total, gráfico
  de despesas por categoria e comparativo diário de receitas x despesas.
- **Lançamentos:** cadastro de receitas e despesas com data, valor, conta, categoria e
  status (pago/recebido); filtros por período e tipo; exclusão. Suporta lançamentos
  **parcelados** (divide o total em N parcelas mensais) e **recorrentes** (repete o
  mesmo valor por N meses).
- **Contas:** carteira, conta corrente, poupança, cartão e investimentos, com saldo
  inicial e saldo atual calculado automaticamente.
- **Categorias:** categorias de receita e despesa personalizáveis, com cor.
- **Orçamento:** limites mensais por categoria e acompanhamento do realizado (barras de
  progresso e alertas de estouro).
- **Importar extrato:** importação de extratos bancários em **CSV** ou **OFX/QFX**, com
  prévia das transações antes de confirmar.
- **Metas de economia:** objetivos de poupança (viagem, reserva, etc.) com barra de
  progresso, prazo opcional e atualização do valor guardado.
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

## ☁️ Deploy no Streamlit Community Cloud

O app já está pronto para publicação gratuita no
[Streamlit Community Cloud](https://share.streamlit.io):

1. Acesse **https://share.streamlit.io** e entre com sua conta do GitHub.
2. Clique em **Create app → Deploy a public app from GitHub**.
3. Preencha:
   - **Repository:** `camera3tuca/Meu-dinheiro-`
   - **Branch:** `main`
   - **Main file path:** `app.py`
4. (Opcional) Em **Advanced settings**, escolha a versão do Python (3.11+).
5. Clique em **Deploy**. Em ~2 minutos o app estará no ar em uma URL pública
   `https://<seu-app>.streamlit.app` — que você pode abrir no celular.

As dependências são instaladas automaticamente a partir de `requirements.txt`,
e o tema visual vem de `.streamlit/config.toml`.

> ⚠️ **Sobre os dados:** no plano gratuito o armazenamento é **efêmero** — o
> banco SQLite (`data/meu_dinheiro.db`) é recriado quando o app reinicia ou
> recebe um novo deploy, então os lançamentos cadastrados online podem se
> perder. Isso é adequado para testes/demonstração. Para uso real com dados
> permanentes, o próximo passo é migrar o armazenamento para um banco externo
> (ex.: PostgreSQL/Supabase) — veja "Próximos passos".

## 🗂️ Estrutura

```
.
├── app.py                    # Página inicial (Dashboard)
├── db.py                     # Acesso a dados (SQLite) e schema
├── utils.py                  # Formatação (R$, meses) e datas
├── importador.py             # Leitura de extratos CSV e OFX
├── requirements.txt
├── .streamlit/config.toml    # Tema e configuração do Streamlit
└── pages/
    ├── 1_Lançamentos.py
    ├── 2_Contas.py
    ├── 3_Categorias.py
    ├── 4_Orçamento.py
    ├── 5_Relatórios.py
    ├── 6_Importar.py
    └── 7_Metas.py
```

## 🧱 Stack

- [Streamlit](https://streamlit.io/) — interface web
- [pandas](https://pandas.pydata.org/) — manipulação de dados
- [Plotly](https://plotly.com/python/) — gráficos interativos
- SQLite — armazenamento local

## 🛣️ Próximos passos (ideias)

- **Persistência em banco externo** (PostgreSQL/Supabase) para dados permanentes no deploy
- Categorização automática de lançamentos importados (por palavra-chave)
- Transferências entre contas
- Múltiplos usuários / autenticação
