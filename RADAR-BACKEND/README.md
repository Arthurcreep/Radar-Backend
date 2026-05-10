# RADAR Backend

RADAR Backend — это backend-сервис для анализа бизнес-идей и продуктовых направлений.

Цель RADAR — помочь пользователю выбрать, какую идею стоит проверять дальше, а какие идеи лучше не трогать.

RADAR — это не keyword tool.  
RADAR — это decision engine.

---

## Что делает RADAR

RADAR принимает одну или несколько идей, анализирует их и возвращает:

- лучшее направление;
- решение: `go / no-go / investigate`;
- оценку риска;
- оценку возможности;
- confidence;
- market-level анализ;
- rejected ideas;
- positioning;
- validation questions;
- competitor checklist;
- MVP hypothesis.

---

## Текущий статус

Текущая версия backend: `1.5.3`

Реализовано:

- Express backend
- PostgreSQL persistence
- Sequelize ORM
- user ownership через `x-user-id`
- reports CRUD
- quick analyze endpoint
- scoring engine
- niche-aware scoring weights
- risk / opportunity / confidence
- decision layer
- market summary
- recommendation layer
- validation questions
- competitor checklist
- MVP hypothesis
- product logic test runner

---

## Стек

- Node.js
- Express
- PostgreSQL
- Sequelize
- CommonJS
- JavaScript
- dotenv
- nodemon

---

## Требования

- Node.js 18+
- npm
- PostgreSQL

---

## Установка

```bash
git clone <repo-url>
cd radar-backend
npm install
```

---

## Переменные окружения

Создай файл `.env` в корне проекта:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=radar_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Важно: `.env` нельзя отправлять в GitHub.

В `.gitignore` должно быть:

```gitignore
node_modules
.env
```

---

## База данных

Создай базу данных PostgreSQL:

```sql
CREATE DATABASE radar_db;
```

При запуске backend Sequelize создаст таблицы автоматически.

---

## Запуск

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## Тест продуктовой логики

RADAR имеет тестовый прогон продуктовой логики:

```bash
npm run test:radar
```

Тест проверяет, что ключевые идеи получают ожидаемые решения:

- finance idea → `needs validation / investigate`
- crypto wallet → `avoid / no-go`
- AI fitness coach → `avoid / no-go`
- sleep tracker → `needs validation / investigate`
- productivity idea → `weak opportunity / no-go`
- education idea → `weak opportunity / no-go`

Ожидаемый успешный результат:

```txt
All RADAR tests passed.
```

---

## API

### Health check

```http
GET /api/health
```

Пример ответа:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "radar-backend"
  }
}
```

---

## Analyze endpoint

Быстрая проверка одной идеи.

```http
POST /api/analyze
```

### Headers

```http
x-user-id: user1
Content-Type: application/json
```

### Request

```json
{
  "text": "budgeting app for freelancers"
}
```

### Response

Возвращает полноценный report.

Пример:

```bash
curl -X POST "http://localhost:3000/api/analyze" \
  -H "Content-Type: application/json" \
  -H "x-user-id: user1" \
  -d '{"text":"budgeting app for freelancers"}'
```

---

## Reports endpoint

### Создать отчет

```http
POST /api/reports
```

### Headers

```http
x-user-id: user1
Content-Type: application/json
```

### Request

```json
{
  "seeds": [
    {
      "value": "budgeting app for freelancers",
      "niche": "finance"
    },
    {
      "value": "crypto wallet for beginners",
      "niche": "crypto"
    },
    {
      "value": "sleep tracker for students",
      "niche": "health"
    }
  ]
}
```

### Пример curl

```bash
curl -X POST "http://localhost:3000/api/reports" \
  -H "Content-Type: application/json" \
  -H "x-user-id: user1" \
  -d '{"seeds":[
    {"value":"budgeting app for freelancers","niche":"finance"},
    {"value":"crypto wallet for beginners","niche":"crypto"},
    {"value":"sleep tracker for students","niche":"health"}
  ]}'
```

---

### Получить список отчетов

```http
GET /api/reports
```

### Headers

```http
x-user-id: user1
```

### Пример curl

```bash
curl "http://localhost:3000/api/reports" \
  -H "x-user-id: user1"
```

---

### Получить отчет по ID

```http
GET /api/reports/:id
```

### Headers

```http
x-user-id: user1
```

### Пример curl

```bash
curl "http://localhost:3000/api/reports/REPORT_ID" \
  -H "x-user-id: user1"
```

---

### Удалить отчет

```http
DELETE /api/reports/:id
```

### Headers

```http
x-user-id: user1
```

### Пример curl

```bash
curl -X DELETE "http://localhost:3000/api/reports/REPORT_ID" \
  -H "x-user-id: user1"
```

---

## Debug mode

Можно включить debug-режим:

```http
POST /api/reports?debug=true
```

В debug-режиме в ответе будут видны внутренние поля:

- tokens;
- scoring weights;
- data sources.

В обычном режиме эти поля скрываются.

Пример:

```bash
curl -X POST "http://localhost:3000/api/reports?debug=true" \
  -H "Content-Type: application/json" \
  -H "x-user-id: user1" \
  -d '{"seeds":[
    {"value":"budgeting app for freelancers","niche":"finance"}
  ]}'
```

---

## Пример recommendation

```json
{
  "summaryLine": "Promising idea. Validate before building.",
  "decision": {
    "label": "investigate",
    "confidence": 0.5,
    "reason": "Promising but requires validation before building."
  },
  "bestMarket": "health",
  "bestMarketVerdict": "weak market",
  "bestMarketNote": "Market is weak on average, but contains one seed worth validating.",
  "bestSeed": "sleep tracker for students",
  "verdict": "needs validation",
  "opportunity": "medium",
  "risk": "medium"
}
```

---

## Pipeline

```txt
input
  ↓
validation
  ↓
normalization
  ↓
deduplication
  ↓
tokenization
  ↓
data providers
  ↓
scoring
  ↓
verdict
  ↓
risk
  ↓
opportunity
  ↓
confidence
  ↓
market summary
  ↓
decision
  ↓
recommendation
  ↓
persistence
```

---

## Архитектура

Текущая логика проекта разделена по слоям:

```txt
src/
  app.js
  server.js

  config/
    env.js
    scoring.config.js

  database/
    sequelize.js

  models/
    report.model.js

  modules/
    analyze/
      analyze.controller.js
      analyze.routes.js
      analyze.service.js

    data/
      audience.provider.js
      commercial.provider.js
      competition.provider.js
      demand.provider.js
      pain.provider.js

    health/
      health.controller.js
      health.routes.js

    reports/
      dataQuality.service.js
      marketSummary.service.js
      report.controller.js
      report.routes.js
      report.service.js
      report.store.js
      report.validator.js
      reportSummary.service.js

    scoring/
      score.service.js

    strategy/
      competitor.service.js
      confidence.service.js
      decision.service.js
      mvp.service.js
      opportunity.service.js
      positioning.service.js
      recommendation.service.js
      risk.service.js
      validation.service.js
      verdict.service.js

  middlewares/
    asyncHandler.js
    error.middleware.js
    notFound.middleware.js

  utils/
    ApiError.js
    dedupeSeeds.js
    normalizeSeed.js

scripts/
  radar-test.js

test-cases/
  radar-test-cases.json
```

---

## Архитектурные принципы

- Backend-first.
- CommonJS.
- Чистые routes.
- Логика отделена от controllers.
- Ошибки проходят через общий error middleware.
- Scoring отделен от recommendation.
- User ownership реализован через `x-user-id`.
- Сначала deterministic pipeline, потом AI/LLM.
- Сначала стабильный backend, потом frontend.

---

## User ownership

Сейчас полноценной авторизации нет.

Вместо этого используется временная идентификация пользователя через header:

```http
x-user-id: user1
```

Это нужно, чтобы отчеты разных пользователей не смешивались.

Позже этот механизм должен быть заменен на нормальную auth-систему:

- registration;
- login;
- JWT/session;
- user accounts;
- access control.

---

## Важное ограничение

Сейчас demand signal использует heuristic fallback.

Google Trends provider подключен как optional, но текущая библиотека нестабильна и может возвращать HTML вместо JSON.

Поэтому текущий уровень data quality:

```txt
low / directional
```

Это значит: результаты пригодны для предварительной фильтрации идей, но не являются финальным market research.

---

## Roadmap

### Ближайшее

- Минимальный UI
- Улучшение data providers
- Реальные источники demand / competition
- Нормальная auth-система
- User accounts
- Report export
- Landing page

### Позже

- LLM strategy layer
- Competitor scraping
- Trend analysis
- Payment layer
- SaaS dashboard

---

## Проверка перед коммитом

Перед коммитом выполни:

```bash
npm run test:radar
```

Должно быть:

```txt
All RADAR tests passed.
```

---

## GitHub

### Проверить статус

```bash
git status
```

### Добавить файлы

```bash
git add .
```

### Сделать коммит

```bash
git commit -m "Build RADAR backend MVP"
```

### Добавить remote, если репозиторий новый

```bash
git remote add origin https://github.com/YOUR_USERNAME/radar-backend.git
git branch -M main
git push -u origin main
```

### Если remote уже есть

```bash
git push
```

---

## Лицензия

ISC