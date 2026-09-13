# 💰 Meu Dinheiro

Sistema completo de controle e gestão de **finanças pessoais**,
desenvolvido para acompanhamento de receitas, despesas, metas e orçamentos.

Esta é a primeira versão (MVP) usada para desenvolver e validar o sistema.

## ✨ Funcionalidades

- **Painel (Dashboard):** receitas, despesas e saldo do mês, patrimônio total, gráfico
  de despesas por categoria e comparativo diário de receitas x despesas.
- **Lançamentos:** cadastro, **edição** e exclusão de receitas e despesas (data, valor,
  conta, categoria, pago/recebido); filtros por período e tipo. Suporta lançamentos
  **parcelados** (divide o total em N parcelas mensais) e **recorrentes** (repete o
  mesmo valor por N meses).
- **Contas:** carteira, conta corrente, poupança, cartão e investimentos, com saldo
  inicial e saldo atual calculado automaticamente.
- **Categorias:** categorias de receita e despesa personalizáveis, com cor.
- **Orçamento:** limites mensais por categoria e acompanhamento do realizado (barras de
  progresso e alertas de estouro).
- **Importar extrato:** importação de extratos bancários em **CSV** ou **OFX/QFX**, com
  prévia das transações e **categorização automática** aplicada na importação.
- **Categorização automática (Regras):** regras do tipo *palavra-chave → categoria*
  (ex.: `uber` → Transporte) aplicadas automaticamente ao importar extratos.
- **Transferências entre contas:** move dinheiro entre contas (afeta os saldos, mas
  não conta como receita/despesa nos relatórios e no orçamento).
- **Metas de economia:** objetivos de poupança (viagem, reserva, etc.) com barra de
  progresso, prazo opcional e atualização do valor guardado.
- **Relatórios:** evolução mensal, maiores despesas por categoria, **relatório anual**
  e exportação em **CSV, Excel e PDF** (o PDF traz gráficos embutidos).
- **Multiusuário:** cada pessoa cria seu login e vê **apenas os seus próprios dados**
  (senha guardada com hash PBKDF2). Cadastro pode ser restrito por um código de convite.

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

O aplicativo abre em `http://localhost:8501`.

### 🗄️ Banco de dados

O app funciona com **PostgreSQL** (produção) ou **SQLite** (local), escolhido
automaticamente pela string de conexão, resolvida nesta ordem:

1. `st.secrets["DATABASE_URL"]` — arquivo `.streamlit/secrets.toml` ou os *Secrets*
   do Streamlit Cloud;
2. variável de ambiente `DATABASE_URL`;
3. **fallback:** SQLite local em `data/meu_dinheiro.db` (nenhuma configuração
   necessária para começar).

Para usar PostgreSQL (ex.: [Neon](https://neon.tech)), copie o exemplo e preencha
com a sua string de conexão:

```bash
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# edite o arquivo e cole a DATABASE_URL do seu banco
```

> 🔒 O arquivo `.streamlit/secrets.toml` está no `.gitignore` — a senha do banco
> **nunca** é enviada ao repositório.

## ☁️ Deploy no Streamlit Community Cloud

O app já está pronto para publicação gratuita no
[Streamlit Community Cloud](https://share.streamlit.io):

1. Acesse **https://share.streamlit.io** e entre com sua conta do GitHub.
2. Clique em **Create app → Deploy a public app from GitHub**.
3. Preencha:
   - **Repository:** `camera3tuca/Meu-dinheiro-`
   - **Branch:** `main`
   - **Main file path:** `app.py`
4. Em **Advanced settings → Secrets**, cole a conexão do PostgreSQL:
   ```toml
   DATABASE_URL = "postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require"
   # REGISTRATION_CODE = "convite"   # opcional: exige código para criar conta
   ```
   (Opcional) escolha a versão do Python (3.11+).
5. Clique em **Deploy**. Em ~2 minutos o app estará no ar em uma URL pública
   `https://<seu-app>.streamlit.app` — que você pode abrir no celular.

As dependências são instaladas automaticamente a partir de `requirements.txt`,
e o tema visual vem de `.streamlit/config.toml`.

> ✅ **Dados permanentes:** com a `DATABASE_URL` apontando para um PostgreSQL
> (ex.: Neon), os lançamentos ficam salvos no banco e **sobrevivem** a reinícios
> e novos deploys. Sem `DATABASE_URL`, o app cai no SQLite local, que no plano
> gratuito do Streamlit é **efêmero** (recriado a cada reinício) — bom apenas
> para testes.

## 🗂️ Estrutura

```
.
├── app.py                    # Página inicial (Dashboard)
├── db.py                     # Acesso a dados (PostgreSQL/SQLite) e schema
├── auth.py                   # Login por senha (opcional)
├── utils.py                  # Formatação (R$, meses) e datas
├── importador.py             # Leitura de extratos CSV e OFX
├── relatorios_export.py      # Geração de Excel e PDF do relatório anual
├── requirements.txt
├── .streamlit/
│   ├── config.toml           # Tema e configuração do Streamlit
│   └── secrets.toml.example  # Modelo da DATABASE_URL (copie p/ secrets.toml)
└── pages/
    ├── 1_Lançamentos.py
    ├── 2_Contas.py
    ├── 3_Categorias.py
    ├── 4_Orçamento.py
    ├── 5_Relatórios.py
    ├── 6_Importar.py
    ├── 7_Metas.py
    ├── 8_Transferências.py
    └── 9_Regras.py
```

## 🧱 Stack

- [Streamlit](https://streamlit.io/) — interface web
- [pandas](https://pandas.pydata.org/) — manipulação de dados
- [Plotly](https://plotly.com/python/) — gráficos interativos
- [SQLAlchemy](https://www.sqlalchemy.org/) — acesso ao banco (PostgreSQL ou SQLite)
- PostgreSQL (produção, ex.: [Neon](https://neon.tech)) / SQLite (local)

## 🛣️ Próximos passos (ideias)

- Aplicativo instalável (PWA) para o celular
- Agendamento de relatórios por e-mail
- Edição/gestão de conta do usuário (trocar senha)
