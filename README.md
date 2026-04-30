# NutriFlow - MVP para Nutricionista

Aplicação web completa (MVP) para nutricionista gerenciar pacientes, anamnese nutricional, consultas e cálculo de gasto energético.

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM
- SQLite (local)
- Autenticação por sessão via cookie seguro + senha criptografada (`bcryptjs`)

## Funcionalidades implementadas no MVP

### 1. Autenticação
- Login de administrador (`/login`)
- Cadastro de administrador
- Logout
- Rotas internas protegidas por `proxy.ts`
- Estrutura pronta para múltiplas nutricionistas (todos os dados vinculados a `userId`)

### 2. Dashboard
- Total de pacientes
- Pacientes em acompanhamento
- Pacientes recentes
- Atalhos para cadastro, busca e anamnese

### 3. Pacientes
- Cadastro completo de paciente
- Idade automática por data de nascimento
- Status (`ativo`, `inativo`, `retorno pendente`)
- Tags
- Edição e exclusão com confirmação em modal
- Busca por nome, telefone e termos de objetivo
- Filtro por objetivo e ordenação por nome/cadastro/atualização

### 4. Perfil do paciente
- Dados pessoais e antropométricos
- Histórico de consultas
- Anamneses registradas
- Cálculos energéticos registrados
- Gráfico de evolução de peso (quando há dados de consulta)

### 5. Anamnese nutricional
- Formulário completo com os campos solicitados
- Salvamento no histórico do paciente

### 6. Cálculo energético
- Fórmula Mifflin-St Jeor para TMB
- Fator de atividade
- GET
- Sugestão calórica por objetivo
- Explicação resumida do cálculo
- Salvamento no histórico do paciente

### 7. Histórico de consultas
- Registro de consulta com peso, medidas, evolução, conduta e próximo retorno

## Estrutura de pastas

```text
src/
  app/
    (protected)/
    api/
    login/
  components/
    layout/
    patients/
    ui/
  database/
  hooks/
  models/
  services/
    export/
    calendar/
  utils/
prisma/
```

## Banco de dados (Prisma)
Modelos criados:
- `User`
- `Patient`
- `Anamnesis`
- `EnergyCalculation`
- `Consultation`

Relação principal:
- 1 `User` -> N `Patient`
- 1 `Patient` -> N anamneses, N cálculos, N consultas

## Como rodar localmente

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Gerar Prisma Client:
```bash
npm run db:generate
```

4. Criar tabelas no banco local:
```bash
npm run db:push
```

5. Popular dados de exemplo:
```bash
npm run db:seed
```

6. Rodar em desenvolvimento:
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## Credenciais de teste (seed)`r`n- As credenciais padrao nao sao mais exibidas no repositorio por seguranca.`r`n- Defina credenciais personalizadas diretamente no ambiente local/seu seed privado.`r`n`r`n## Scripts uteis
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:seed`

## Segurança aplicada
- Senhas com hash (`bcryptjs`)
- Validação de payload com `zod`
- Rotas protegidas
- Escopo por usuário autenticado
- API bloqueia acesso sem sessão válida

## Estrutura pronta para expansão
Já preparada com base inicial para:
- Exportação CSV (`GET /api/exports/patients-csv`)
- Geração de PDF (stub em `src/services/export/pdf.ts`)
- Gráficos (implementado gráfico de peso)
- Calendário de retornos (base em `src/services/calendar/returns.ts`)

## Próximos passos recomendados
- Implementar exportação PDF real (ex.: `pdf-lib`)
- Tela de calendário com retornos futuros
- Painel de gráficos adicionais (aderência, IMC, circunferências)
- Tema escuro persistente
- Troca de SQLite para PostgreSQL em produção

