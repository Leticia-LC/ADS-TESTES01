# AuthTask Manager

Este repositório contém a implementação dos testes unitários para a aplicação AuthTask Manager, proposta como atividade acadêmica.

A aplicação base foi fornecida já funcional pelo professor, e o objetivo do trabalho foi desenvolver os testes seguindo o Guia Evolutivo, aplicando boas práticas como TDD, isolamento de responsabilidades e uso de mocks.

---

## 🎯 Objetivo da atividade
- Trabalhar com testes unitários em aplicações modernas (Next.js + React)
- Aplicar Jest + React Testing Library
- Seguir um processo guiado de evolução de testes (GUIA_EVOLUTIVO.md)
- Garantir qualidade e cobertura da aplicação existente
  
---

## 📌 Contexto

Este projeto foi desenvolvido a partir de um repositório-base fornecido pelo professor já com a aplicação implementada.

A proposta da atividade não era construir a aplicação do zero, mas sim desenvolver a suíte de testes sobre uma base pronta, seguindo as orientações do arquivo [GUIA_EVOLUTIVO.md](./GUIA_EVOLUTIVO.md).

Durante a atividade, o foco esteve em:

- compreender a arquitetura já existente
- identificar as responsabilidades de cada camada
- implementar testes unitários e de componentes
- utilizar mocks quando necessário
- validar fluxos importantes da aplicação sem alterar sua lógica principal

Assim, o trabalho teve como objetivo praticar testes em um projeto real já estruturado, simulando um cenário comum de manutenção e garantia de qualidade em software.

---

## 🧱 Arquitetura da aplicação

A aplicação segue uma arquitetura organizada por responsabilidades, facilitando a testabilidade:

```
ADS-TESTES01/
├── .github/                                  # Configurações do GitHub
│   └── workflows/                            # Pipeline de integração contínua (CI)
│
├── public/                                   # Arquivos estáticos públicos
│
├── src/
│   ├── __tests__/                            # Testes unitários gerais de serviços e utilitários
│   │   ├── .gitkeep                          # Mantém a pasta versionada
│   │   ├── app-error.test.ts                 # Testes da classe/estrutura de erro da aplicação
│   │   ├── auth.service.auth.test.ts         # Testes de autenticação no auth service
│   │   ├── auth.service.edge.test.ts         # Casos extremos e cenários de borda do auth service
│   │   ├── auth.service.validation.test.ts   # Testes de validação do fluxo de autenticação
│   │   ├── http-response.test.ts             # Testes das respostas HTTP padronizadas
│   │   ├── task.service.edge.test.ts         # Casos extremos do serviço de tarefas
│   │   └── task.service.test.ts              # Testes principais do serviço de tarefas
│   │
│   ├── app/                                  # Estrutura de rotas e páginas com App Router do Next.js
│   │   ├── __tests__/                        # Testes relacionados à camada de páginas/layout
│   │   │   └── layout.test.tsx               # Teste do layout principal da aplicação
│   │   │
│   │   ├── api/                              # Rotas de API da aplicação
│   │   │   ├── login/                        # Endpoint de autenticação
│   │   │   │   ├── __tests__/                # Testes da rota de login
│   │   │   │   │   └── route.test.ts         # Teste da route de login
│   │   │   │   └── route.ts                  # Implementação da rota POST /api/login
│   │   │   │
│   │   │   ├── logout/                       # Endpoint de encerramento de sessão
│   │   │   │   ├── __tests__/                # Testes da rota de logout
│   │   │   │   └── route.ts                  # Implementação da rota POST /api/logout
│   │   │   │
│   │   │   └── tasks/                        # Endpoints relacionados ao CRUD de tarefas
│   │   │       ├── [taskId]/                 # Rota dinâmica para operações por identificador
│   │   │       ├── __tests__/                # Testes das rotas de tarefas
│   │   │       └── route.ts                  # Implementação da rota /api/tasks
│   │   │
│   │   ├── dashboard/                        # Página protegida do dashboard
│   │   │   ├── __tests__/                    # Testes da página dashboard
│   │   │   └── page.tsx                      # Página principal do dashboard
│   │   │
│   │   ├── login/                            # Página de login
│   │   │   ├── __tests__/                    # Testes da página de login
│   │   │   └── page.tsx                      # Página principal de autenticação
│   │   │
│   │   ├── favicon.ico                       # Ícone da aplicação
│   │   ├── globals.css                       # Estilos globais
│   │   ├── layout.tsx                        # Layout raiz da aplicação
│   │   └── page.tsx                          # Página inicial
│   │
│   ├── components/                           # Componentes React reutilizáveis
│   │   ├── auth/                             # Componentes ligados à autenticação
│   │   │   ├── __tests__/                    # Testes dos componentes de autenticação
│   │   │   │   ├── __snapshots__/            # Snapshots gerados nos testes
│   │   │   │   └── LoginForm.test.tsx        # Testes do formulário de login
│   │   │   └── LoginForm.tsx                 # Componente de formulário de login
│   │   │
│   │   ├── dashboard/                          # Componentes do dashboard
│   │   │   ├── __tests__/                      # Testes dos componentes do dashboard
│   │   │   │   ├── DashboardClient.test.tsx    # Testes do componente principal cliente
│   │   │   │   ├── ServerTaskSummary.test.tsx  # Testes do resumo de tarefas no servidor
│   │   │   │   ├── TaskComposer.test.tsx       # Testes do componente de criação de tarefas
│   │   │   │   └── TaskList.test.tsx           # Testes da listagem de tarefas
│   │   │   ├── DashboardClient.tsx             # Componente principal do dashboard no cliente
│   │   │   ├── ServerTaskSummary.tsx           # Resumo de tarefas renderizado no servidor
│   │   │   ├── TaskComposer.tsx                # Componente para criação de tarefas
│   │   │   └── TaskList.tsx                    # Componente de listagem de tarefas
│   │   │
│   │   └── providers/                          # Providers globais da aplicação
│   │       ├── __tests__/                      # Testes dos providers
│   │       │   └── AppProviders.test.tsx       # Testes do provider principal
│   │       └── AppProviders.tsx                # Provider raiz da aplicação
│   │
│   ├── context/                                # Context API para estado global
│   │   ├── __tests__/                          # Espaço para testes do contexto
│   │   └── AuthContext.tsx                     # Contexto global de autenticação
│   │
│   ├── lib/                                    # Configurações e integrações externas
│   │   ├── __tests__/                          # Espaço para testes de integrações
│   │   └── firebase.ts                         # Configuração e inicialização do Firebase
│   │
│   ├── services/                               # Camada de regras de negócio
│   │   ├── auth/                               # Serviços relacionados à autenticação e sessão
│   │   │   ├── __tests__/                      # Testes específicos da camada de autenticação
│   │   │   │   ├── session.edge.test.ts        # Casos de borda da sessão
│   │   │   │   └── session.service.test.ts     # Testes do serviço de sessão
│   │   │   ├── auth.constants.ts               # Constantes usadas na autenticação
│   │   │   ├── auth.service.ts                 # Regras de autenticação e validação
│   │   │   ├── auth.types.ts                   # Tipagens da camada de autenticação
│   │   │   ├── session.edge.ts                 # Utilitários e regras de sessão voltados ao ambiente Edge
│   │   │   └── session.service.ts              # Serviço de criação/validação de sessão
│   │   │
│   │   └── tasks/                              # Serviços relacionados às tarefas
│   │       ├── __tests__/                      # Testes específicos da camada de tarefas
│   │       │   └── task.repository.test.ts     # Testes do repositório de tarefas
│   │       ├── task.repository.ts              # Acesso e persistência de dados das tarefas
│   │       ├── task.service.ts                 # Regras de negócio das tarefas
│   │       └── task.types.ts                   # Tipagens da camada de tarefas
│   │
│   └── utils/                       # Funções utilitárias e estruturas auxiliares
│       ├── app-error.ts             # Padronização de erros da aplicação
│       └── http-response.ts         # Helpers para respostas HTTP
│
├── .gitignore                       # Arquivos ignorados pelo Git
├── GUIA_EVOLUTIVO.md                # Guia fornecido para evolução e implementação dos testes
├── README.md                        # Documentação do projeto
├── eslint.config.mjs                # Configuração do ESLint
├── jest.config.ts                   # Configuração do Jest
├── jest.setup.ts                    # Setup global dos testes
├── middleware.ts                    # Middleware para proteção e controle de rotas
├── next.config.ts                   # Configuração do Next.js
├── package-lock.json                # Lockfile das dependências
├── package.json                     # Dependências e scripts do projeto
└── tsconfig.json                    # Configuração do TypeScript
```

### 🧩 Organização da arquitetura

A aplicação foi estruturada para facilitar manutenção, evolução e principalmente testabilidade.

- A pasta `app` concentra as páginas e rotas da aplicação utilizando o App Router do Next.js.
- A pasta `components` reúne os componentes reutilizáveis da interface, separados por contexto de uso.
- A pasta `context` centraliza o estado global de autenticação.
- A pasta `services` contém a lógica de negócio da aplicação, separando autenticação e tarefas.
- A pasta `lib` concentra integrações externas, como a configuração do Firebase.
- A pasta `utils` reúne funções auxiliares, como tratamento de erros e respostas HTTP padronizadas.
- As pastas `__tests__` distribuídas pelo projeto permitem manter os testes próximos das funcionalidades que validam, facilitando entendimento e manutenção.

Essa organização foi importante para a atividade, porque permitiu testar cada camada de forma mais isolada, com responsabilidades bem definidas.

---

## 🧪 Estratégia de testes

Os testes foram implementados seguindo o [GUIA_EVOLUTIVO.md](./GUIA_EVOLUTIVO.md), que divide o desenvolvimento em etapas:

- Etapas 0–3: Configuração e TDD inicial
- Etapas 4–5: Testes de serviços e componentes
- Etapas 6–7: Mocks e Context API
- Etapas 8–9: API Routes e Server Components
- Etapas 10–11: Cobertura e CI
- Etapa 12: Recursos avançados (snapshot, fake timers, etc.)

👉 A implementação seguiu essa progressão para garantir:

- evolução incremental
- validação contínua
- organização dos testes

---

## ▶️ Como rodar

### Rodar a aplicação
```bash
npm install
npm run dev
```
Acesse: http://localhost:3000

### Rodar os testes
```bash
npm run test        
npm run test:coverage 
```

---

## 📊 Cobertura

Os testes foram implementados visando atender os requisitos mínimos:

- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

---

## ⚙️ Tecnologias utilizadas

- Next.js (App Router)
- React
- Firebase (Firestore)
- Jest
- React Testing Library

---

## 📌 Decisões técnicas

- A lógica da aplicação foi mantida conforme entregue
- Os testes foram escritos de forma isolada, respeitando cada camada
- Uso de mocks para evitar dependência de serviços externos
- Aplicação de TDD em partes do desenvolvimento
- Organização dos testes próxima ao código (co-location)

---

## 🧠 Decisões dos testes

A implementação dos testes seguiu uma abordagem incremental baseada no [GUIA_EVOLUTIVO.md](./GUIA_EVOLUTIVO.md), priorizando TDD, isolamento de dependências e cobertura progressiva do sistema.

### 🧪 Validação e autenticação

Os testes iniciais foram escritos antes da implementação completa, seguindo TDD, para descrever comportamentos esperados como validação de login, autenticação e sanitização de dados.
Foram considerados cenários de sucesso, erro e entradas inválidas, garantindo que a lógica de autenticação estivesse consistente e previsível.

### 🧩 Serviço de tarefas

A validação de regras de negócio foi priorizada, como o controle do título das tarefas (vazio, tamanho mínimo/máximo e normalização).
O serviço foi testado utilizando injeção de dependência com repositório mockado, permitindo validar operações como listar, criar e remover tarefas sem dependência externa.

### ⚠️ Utilitários e tratamento de erros

Foram implementados testes para garantir padronização no tratamento de erros da aplicação, incluindo:

- validação da estrutura da classe `AppError`
- identificação de erros customizados
- conversão de erros em respostas HTTP padronizadas

Isso assegura consistência no comportamento da aplicação em cenários de falha.

### 🧩 Componentes

Os testes de componentes foram focados no comportamento real do usuário, utilizando React Testing Library.

Principais decisões:

- uso de queries acessíveis (`getByRole`, `findBy`)
- simulação de interações com `userEvent`
- uso de `waitFor` para estados assíncronos
- validação de estados como loading, erro e sucesso

Dependências externas como autenticação e navegação foram isoladas via mocks (`AuthContext`, `useSearchParams`).

### 🔌 Context API

O `AuthContext` e o hook `useAuth` foram testados para garantir:

- fornecimento correto do contexto
- atualização do estado de usuário após login
- erro ao utilizar o hook fora do provider

Esses testes garantem a integridade do fluxo global de autenticação.

### 🌐 API e integração

As rotas de API e o repositório de tarefas foram testados sem chamadas reais:

- uso de mock do `fetch` para simular respostas do Firebase
- validação das operações de CRUD
- verificação de tratamento de erros (ex: variáveis de ambiente ausentes)

Isso garantiu testes rápidos e independentes de infraestrutura externa.

### 🧠 Server Components

Para componentes assíncronos no servidor, foi utilizado mock de serviços e controle de Promises.

Foram testados:

- cenário de sucesso (dados exibidos corretamente)
- cenário de erro (fallback exibido)

### 🎭 Uso de mocks

Para garantir isolamento e previsibilidade:

- `jest.mock` → substituição de módulos (contexto, serviços, Next.js)
- `jest.spyOn` → monitoramento de funções
- `mockResolvedValue` / `mockRejectedValue` → simulação de respostas
- mock de `fetch` → evitar chamadas reais ao backend

Essa estratégia permitiu testar o comportamento da aplicação de forma controlada.

### 📁 Organização dos testes

A organização dos testes evoluiu ao longo do projeto:

- Inicialmente, foram centralizados em `src/__tests__` para facilitar a implementação e validação rápida.
- Posteriormente, foram distribuídos em pastas `__tests__` próximas ao código (co-location), organizados por domínio (`auth`, `tasks`, `components`, `context`).

Essa decisão equilibra:

- agilidade no início  
- manutenção e escalabilidade no longo prazo

### 📊 Cobertura de testes

Foram definidos limites mínimos de cobertura (85%+), e para atingi-los:

- foram adicionados testes de casos de borda
- mocks foram utilizados para cobrir cenários complexos]
- serviços críticos atingiram alta cobertura (próxima de 100%)

### ⚙️ Integração contínua

Foi implementado um pipeline com GitHub Actions que:

- executa os testes automaticamente
- valida a cobertura
- falha em caso de erro

### 🚀 Técnicas avançadas

Foram aplicadas técnicas adicionais para aumentar a robustez dos testes:

- uso de fake timers para simular expiração de sessão
- snapshot testing para detectar mudanças visuais
- simulação de multi-usuário em operações concorrentes
- tentativa de uso de MSW, substituído por mocks manuais devido à complexidade

---

## ✅ Checklist de entrega (fornecido pelo professor)

- [x] Link do repositório GitHub
- [x] README com arquitetura, decisões e estratégia de testes
- [x] Histórico de commits demonstrando TDD (3 funcionalidades)
- [x] Cobertura mínima: 85% statements, 80% branches, 85% functions, 85% lines
- [x] Pipeline CI funcionando
- [x] Apresentação 5–10 min: estrutura, teste complexo, pipeline

---

## 📚 Observação

Este projeto foi desenvolvido como atividade acadêmica orientada, com foco em aprendizado de testes unitários e boas práticas de engenharia de software.

---

## 📄 Licença

Uso didático.
