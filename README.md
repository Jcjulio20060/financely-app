# Financely - Aplicativo de Finanças Pessoais (MERN Stack + Podman)

Este é um aplicativo moderno e elegante para gerenciamento de finanças pessoais desenvolvido com a stack MERN (MongoDB, Express, React, Node.js) e totalmente conteinerizado utilizando **Podman** e **Podman Compose**.

## 🚀 Como Iniciar com Podman

Certifique-se de que você possui o `podman` e `podman-compose` instalados em seu sistema.

Para construir as imagens e iniciar todos os serviços (Banco de Dados MongoDB, API Backend e UI Frontend), execute o comando a seguir na raiz do projeto:

```bash
podman-compose up --build
```

Isso iniciará três serviços:
1. **Banco de Dados (MongoDB)**: Rodando internamente na porta `27017` com volume persistente para salvar seus dados.
2. **API Backend (Express)**: Rodando na porta `5001` (`http://localhost:5001`).
3. **Frontend UI (React + Vite)**: Servido por Nginx na porta `3000` (`http://localhost:3000`).

Para rodar em segundo plano (modo daemon):

```bash
podman-compose up -d
```

Para parar os serviços:

```bash
podman-compose down
```

---

## 🎨 Funcionalidades

- **Saldo Geral Dinâmico**: Visualização imediata do patrimônio consolidado (Entradas - Saídas).
- **Painel de Gráficos SVG Nativos**: Gráficos de linha/área que traçam o fluxo de caixa (entradas vs saídas) dos últimos 30 dias com animações e tooltips interativos.
- **Gráfico de Rosca por Categorias**: Divisão percentual de despesas utilizando SVG nativo de alta performance.
- **Metas de Orçamento**: Definição de limites de gastos mensais por categorias (ex: Alimentação, Aluguel, Lazer). Notificações visuais caso o orçamento ultrapasse 90% (aviso em amarelo) ou estoure o limite (aviso em vermelho).
- **Lista de Transações Avançada**: Busca em tempo real por descrição, filtros rápidos por tipo (Entrada/Saída), filtros por categorias e ordenações variadas (data, valor).
- **Modo Escuro Premium**: Interface baseada em tons escuros elegantes, inspirada nos melhores painéis financeiros modernos (Linear, Wise, Revolut).
- **Gerador de Dados de Teste**: Um botão inteligente na barra superior para popular o banco de dados com transações de simulação e categorias orçadas instantaneamente para demonstração rápida.

---

## 📂 Estrutura do Projeto

```text
finance-app/
├── backend/
│   ├── models/
│   │   ├── Budget.js          # Schema do Mongoose para limites orçamentários
│   │   └── Transaction.js     # Schema do Mongoose para movimentações
│   ├── Dockerfile             # Configuração do contêiner da API Node.js
│   ├── package.json           # Dependências do backend (Express, Mongoose, CORS, dotenv)
│   └── server.js              # Inicialização do Express, conexão ao DB e Rotas REST
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Lógica principal, dashboards, formulários e gráficos em React
│   │   ├── index.css          # Design System completo (Vanilla CSS, Dark/Light mode)
│   │   └── main.jsx           # Entrada do React
│   ├── Dockerfile             # Multi-stage build (Compilação React + Nginx para servir estáticos)
│   ├── nginx.conf             # Configuração do Nginx com fallback de rotas SPA
│   ├── index.html             # Estrutura HTML base
│   └── package.json           # Dependências do frontend (React, Vite, Lucide-React)
└── docker-compose.yml         # Orquestração do MongoDB, Backend e Frontend via Podman
```
