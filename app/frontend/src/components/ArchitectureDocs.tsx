import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Database, Server, Globe, Shield, Code, Layers } from 'lucide-react';

export function ArchitectureDocs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1>Техническая документация</h1>
        <p className="text-gray-600">
          Архитектура, API спецификация и схема базы данных платформы DataLabel
        </p>
      </div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="architecture">Архитектура</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">База данных</TabsTrigger>
          <TabsTrigger value="stack">Технологии</TabsTrigger>
        </TabsList>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Высокоуровневая архитектура системы</CardTitle>
              <CardDescription>
                Трёхуровневая архитектура с разделением Frontend, Backend и Data Layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Architecture Diagram */}
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="space-y-6">
                    {/* Client Layer */}
                    <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-6 h-6 text-blue-600" />
                        <h3 className="text-blue-600">Клиентский слой (Frontend)</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                          <h4 className="mb-2">Web Application</h4>
                          <p className="text-sm text-gray-600">React + TypeScript + Tailwind CSS</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                          <h4 className="mb-2">State Management</h4>
                          <p className="text-sm text-gray-600">Zustand / Redux Toolkit</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                          <h4 className="mb-2">Annotation Tools</h4>
                          <p className="text-sm text-gray-600">Canvas API / Fabric.js</p>
                        </div>
                      </div>
                    </div>

                    {/* API Gateway */}
                    <div className="flex justify-center">
                      <div className="bg-gray-200 px-6 py-3 rounded-lg">
                        <p className="text-sm">HTTPS / REST API / WebSocket</p>
                      </div>
                    </div>

                    {/* Application Layer */}
                    <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Server className="w-6 h-6 text-green-600" />
                        <h3 className="text-green-600">Прикладной слой (Backend)</h3>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded">
                          <h4 className="mb-2">API Server</h4>
                          <p className="text-sm text-gray-600">Node.js + Express / NestJS</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <h4 className="mb-2">Auth Service</h4>
                          <p className="text-sm text-gray-600">JWT + OAuth 2.0</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <h4 className="mb-2">Task Engine</h4>
                          <p className="text-sm text-gray-600">Bull / BullMQ</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <h4 className="mb-2">Notification</h4>
                          <p className="text-sm text-gray-600">WebSocket + Email</p>
                        </div>
                      </div>
                    </div>

                    {/* Data Layer */}
                    <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Database className="w-6 h-6 text-purple-600" />
                        <h3 className="text-purple-600">Слой данных</h3>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-purple-50 p-4 rounded">
                          <h4 className="mb-2">PostgreSQL</h4>
                          <p className="text-sm text-gray-600">Основная БД</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                          <h4 className="mb-2">Redis</h4>
                          <p className="text-sm text-gray-600">Кэш + Очереди</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                          <h4 className="mb-2">S3 Storage</h4>
                          <p className="text-sm text-gray-600">Файловое хранилище</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                          <h4 className="mb-2">Elasticsearch</h4>
                          <p className="text-sm text-gray-600">Поиск</p>
                        </div>
                      </div>
                    </div>

                    {/* External Services */}
                    <div className="bg-white rounded-lg p-6 border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Layers className="w-6 h-6 text-orange-600" />
                        <h3 className="text-orange-600">Внешние сервисы</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-orange-50 p-4 rounded">
                          <h4 className="mb-2">Payment Gateway</h4>
                          <p className="text-sm text-gray-600">Stripe / ЮKassa</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded">
                          <h4 className="mb-2">Email Service</h4>
                          <p className="text-sm text-gray-600">SendGrid / AWS SES</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded">
                          <h4 className="mb-2">Monitoring</h4>
                          <p className="text-sm text-gray-600">Sentry + DataDog</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Components Description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Микросервисная архитектура</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• <strong>Auth Service:</strong> Аутентификация и авторизация пользователей</li>
                        <li>• <strong>Task Service:</strong> Управление заданиями и проектами</li>
                        <li>• <strong>User Service:</strong> Профили и верификация пользователей</li>
                        <li>• <strong>Payment Service:</strong> Финансовые транзакции</li>
                        <li>• <strong>Notification Service:</strong> Уведомления в реальном времени</li>
                        <li>• <strong>Quality Service:</strong> Контроль качества разметки</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Масштабируемость и надёжность</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• <strong>Load Balancing:</strong> NGINX / AWS ALB для распределения нагрузки</li>
                        <li>• <strong>Horizontal Scaling:</strong> Kubernetes для оркестрации контейнеров</li>
                        <li>• <strong>Database Replication:</strong> Master-Slave для PostgreSQL</li>
                        <li>• <strong>CDN:</strong> CloudFlare для статических ресурсов</li>
                        <li>• <strong>Backup Strategy:</strong> Автоматические бэкапы каждые 6 часов</li>
                        <li>• <strong>Monitoring:</strong> Prometheus + Grafana для мониторинга</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>REST API Endpoints</CardTitle>
              <CardDescription>
                Основные эндпоинты для взаимодействия с платформой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Authentication */}
                <div>
                  <h3 className="mb-4">Аутентификация</h3>
                  <div className="space-y-3">
                    {[
                      {
                        method: 'POST',
                        endpoint: '/api/auth/register',
                        description: 'Регистрация нового пользователя',
                        body: '{ "email": "string", "password": "string", "role": "annotator|client" }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/auth/login',
                        description: 'Вход в систему',
                        body: '{ "email": "string", "password": "string" }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/auth/refresh',
                        description: 'Обновление токена доступа',
                        body: '{ "refreshToken": "string" }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/auth/verify-email',
                        description: 'Подтверждение email',
                        body: '{ "token": "string" }',
                      },
                    ].map((api, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className="bg-blue-600">{api.method}</Badge>
                          <code className="text-sm">{api.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        {api.body && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <code className="text-xs text-gray-700">{api.body}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <h3 className="mb-4">Задания</h3>
                  <div className="space-y-3">
                    {[
                      {
                        method: 'GET',
                        endpoint: '/api/tasks',
                        description: 'Получить список доступных заданий с фильтрацией',
                        params: '?category=medicine&difficulty=advanced&page=1&limit=20',
                      },
                      {
                        method: 'GET',
                        endpoint: '/api/tasks/:id',
                        description: 'Получить детальную информацию о задании',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/tasks',
                        description: 'Создать новое задание (только для клиентов)',
                        body: '{ "title": "string", "description": "string", "category": "string", "reward": number, "deadline": "ISO8601", "requirements": {...} }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/tasks/:id/claim',
                        description: 'Взять задание в работу',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/tasks/:id/submit',
                        description: 'Отправить выполненное задание на проверку',
                        body: '{ "resultData": {...}, "notes": "string", "attachments": ["url1", "url2"] }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/tasks/:id/accept',
                        description: 'Принять выполненное задание (только для клиентов)',
                        body: '{ "rating": number, "feedback": "string" }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/tasks/:id/reject',
                        description: 'Отклонить задание и вернуть на доработку',
                        body: '{ "reason": "string", "comments": "string" }',
                      },
                    ].map((api, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className={api.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'}>
                            {api.method}
                          </Badge>
                          <code className="text-sm">{api.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        {api.params && (
                          <div className="bg-white rounded p-2 border border-gray-200 mb-2">
                            <code className="text-xs text-gray-700">{api.params}</code>
                          </div>
                        )}
                        {api.body && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <code className="text-xs text-gray-700">{api.body}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users */}
                <div>
                  <h3 className="mb-4">Пользователи</h3>
                  <div className="space-y-3">
                    {[
                      {
                        method: 'GET',
                        endpoint: '/api/users/me',
                        description: 'Получить профиль текущего пользователя',
                      },
                      {
                        method: 'PATCH',
                        endpoint: '/api/users/me',
                        description: 'Обновить профиль пользователя',
                        body: '{ "name": "string", "avatar": "url", "expertise": [...] }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/users/verify',
                        description: 'Отправить заявку на верификацию',
                        body: '{ "education": "string", "experience": "string", "portfolio": "url", "expertise": [...] }',
                      },
                      {
                        method: 'GET',
                        endpoint: '/api/users/:id/stats',
                        description: 'Получить статистику пользователя',
                      },
                    ].map((api, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className={
                            api.method === 'GET' ? 'bg-green-600' :
                            api.method === 'PATCH' ? 'bg-yellow-600' : 'bg-blue-600'
                          }>
                            {api.method}
                          </Badge>
                          <code className="text-sm">{api.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        {api.body && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <code className="text-xs text-gray-700">{api.body}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <h3 className="mb-4">Платежи</h3>
                  <div className="space-y-3">
                    {[
                      {
                        method: 'GET',
                        endpoint: '/api/payments/balance',
                        description: 'Получить текущий баланс',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/payments/deposit',
                        description: 'Пополнить баланс',
                        body: '{ "amount": number, "method": "card|wallet" }',
                      },
                      {
                        method: 'POST',
                        endpoint: '/api/payments/withdraw',
                        description: 'Вывести средства',
                        body: '{ "amount": number, "account": "string" }',
                      },
                      {
                        method: 'GET',
                        endpoint: '/api/payments/history',
                        description: 'История транзакций',
                        params: '?page=1&limit=20&type=deposit|withdraw|reward',
                      },
                    ].map((api, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className={api.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'}>
                            {api.method}
                          </Badge>
                          <code className="text-sm">{api.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        {api.params && (
                          <div className="bg-white rounded p-2 border border-gray-200 mb-2">
                            <code className="text-xs text-gray-700">{api.params}</code>
                          </div>
                        )}
                        {api.body && (
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <code className="text-xs text-gray-700">{api.body}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WebSocket Events */}
          <Card>
            <CardHeader>
              <CardTitle>WebSocket Events</CardTitle>
              <CardDescription>
                События в реальном времени для уведомлений и обновлений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    event: 'task:new',
                    description: 'Новое задание опубликовано',
                    payload: '{ "taskId": "string", "title": "string", "category": "string" }',
                  },
                  {
                    event: 'task:claimed',
                    description: 'Задание взято в работу',
                    payload: '{ "taskId": "string", "annotatorId": "string" }',
                  },
                  {
                    event: 'task:submitted',
                    description: 'Задание отправлено на проверку',
                    payload: '{ "taskId": "string", "submissionId": "string" }',
                  },
                  {
                    event: 'task:reviewed',
                    description: 'Задание проверено',
                    payload: '{ "taskId": "string", "status": "accepted|rejected", "feedback": "string" }',
                  },
                  {
                    event: 'payment:received',
                    description: 'Получен платёж',
                    payload: '{ "amount": number, "type": "reward|deposit" }',
                  },
                ].map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Badge variant="outline">Event</Badge>
                      <code className="text-sm">{event.event}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <code className="text-xs text-gray-700">{event.payload}</code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Схема базы данных PostgreSQL</CardTitle>
              <CardDescription>
                Основные таблицы и связи между ними
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Users Table */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="mb-4">users (Пользователи)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['email', 'VARCHAR(255)', 'UNIQUE, NOT NULL'],
                      ['password_hash', 'VARCHAR(255)', 'NOT NULL'],
                      ['role', 'ENUM', 'annotator, client, admin'],
                      ['name', 'VARCHAR(255)', 'NOT NULL'],
                      ['avatar_url', 'TEXT', 'NULL'],
                      ['is_verified', 'BOOLEAN', 'DEFAULT false'],
                      ['is_active', 'BOOLEAN', 'DEFAULT true'],
                      ['created_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                      ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Annotator Profiles */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="mb-4">annotator_profiles (Профили исполнителей)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['user_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['education', 'TEXT', 'Образование'],
                      ['experience_years', 'INTEGER', 'Опыт работы'],
                      ['expertise', 'JSONB', 'Массив специализаций'],
                      ['portfolio_url', 'TEXT', 'NULL'],
                      ['verification_status', 'ENUM', 'pending, approved, rejected'],
                      ['rating', 'DECIMAL(3,2)', 'DEFAULT 0.00'],
                      ['completed_tasks', 'INTEGER', 'DEFAULT 0'],
                      ['success_rate', 'DECIMAL(5,2)', 'DEFAULT 0.00'],
                      ['total_earnings', 'DECIMAL(10,2)', 'DEFAULT 0.00'],
                      ['balance', 'DECIMAL(10,2)', 'DEFAULT 0.00'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Profiles */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="mb-4">client_profiles (Профили поставщиков)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['user_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['company_name', 'VARCHAR(255)', 'NULL'],
                      ['industry', 'VARCHAR(100)', 'NULL'],
                      ['balance', 'DECIMAL(10,2)', 'DEFAULT 0.00'],
                      ['total_spent', 'DECIMAL(10,2)', 'DEFAULT 0.00'],
                      ['projects_count', 'INTEGER', 'DEFAULT 0'],
                      ['rating', 'DECIMAL(3,2)', 'DEFAULT 0.00'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="mb-4">projects (Проекты)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['client_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['name', 'VARCHAR(255)', 'NOT NULL'],
                      ['description', 'TEXT', 'NOT NULL'],
                      ['status', 'ENUM', 'draft, active, completed, cancelled'],
                      ['total_tasks', 'INTEGER', 'DEFAULT 0'],
                      ['completed_tasks', 'INTEGER', 'DEFAULT 0'],
                      ['budget', 'DECIMAL(10,2)', 'NOT NULL'],
                      ['spent', 'DECIMAL(10,2)', 'DEFAULT 0.00'],
                      ['created_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                      ['deadline', 'TIMESTAMP', 'NULL'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="mb-4">tasks (Задания)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['project_id', 'UUID', 'FOREIGN KEY -> projects(id)'],
                      ['title', 'VARCHAR(255)', 'NOT NULL'],
                      ['description', 'TEXT', 'NOT NULL'],
                      ['category', 'VARCHAR(100)', 'NOT NULL'],
                      ['difficulty', 'ENUM', 'beginner, intermediate, advanced, expert'],
                      ['reward', 'DECIMAL(10,2)', 'NOT NULL'],
                      ['status', 'ENUM', 'available, claimed, in_progress, submitted, review, completed, rejected'],
                      ['required_expertise', 'JSONB', 'Массив требуемых навыков'],
                      ['data_url', 'TEXT', 'Ссылка на данные'],
                      ['instructions_url', 'TEXT', 'Инструкции'],
                      ['quality_settings', 'JSONB', 'Настройки контроля качества'],
                      ['estimated_time', 'INTEGER', 'Минуты'],
                      ['deadline', 'TIMESTAMP', 'NULL'],
                      ['created_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Assignments */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="mb-4">task_assignments (Назначения заданий)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['task_id', 'UUID', 'FOREIGN KEY -> tasks(id)'],
                      ['annotator_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['status', 'ENUM', 'claimed, in_progress, submitted, accepted, rejected'],
                      ['started_at', 'TIMESTAMP', 'NULL'],
                      ['submitted_at', 'TIMESTAMP', 'NULL'],
                      ['completed_at', 'TIMESTAMP', 'NULL'],
                      ['result_data', 'JSONB', 'Результаты разметки'],
                      ['notes', 'TEXT', 'NULL'],
                      ['attachments', 'JSONB', 'Массив URL файлов'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-pink-50 rounded-lg p-6">
                  <h3 className="mb-4">reviews (Проверки)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['assignment_id', 'UUID', 'FOREIGN KEY -> task_assignments(id)'],
                      ['reviewer_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['status', 'ENUM', 'accepted, rejected'],
                      ['rating', 'INTEGER', '1-5'],
                      ['feedback', 'TEXT', 'NULL'],
                      ['quality_score', 'DECIMAL(5,2)', 'NULL'],
                      ['reviewed_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h3 className="mb-4">transactions (Транзакции)</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
                      <strong>Поле</strong>
                      <strong>Тип</strong>
                      <strong>Описание</strong>
                    </div>
                    {[
                      ['id', 'UUID', 'PRIMARY KEY'],
                      ['user_id', 'UUID', 'FOREIGN KEY -> users(id)'],
                      ['type', 'ENUM', 'deposit, withdraw, reward, payment'],
                      ['amount', 'DECIMAL(10,2)', 'NOT NULL'],
                      ['status', 'ENUM', 'pending, completed, failed'],
                      ['description', 'TEXT', 'NULL'],
                      ['reference_id', 'UUID', 'NULL (task_id или assignment_id)'],
                      ['created_at', 'TIMESTAMP', 'DEFAULT NOW()'],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 text-gray-700">
                        <span>{row[0]}</span>
                        <span>{row[1]}</span>
                        <span className="text-gray-500">{row[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entity Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Связи между таблицами</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>users</strong> → <strong>annotator_profiles</strong> (1:1)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>users</strong> → <strong>client_profiles</strong> (1:1)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>client_profiles</strong> → <strong>projects</strong> (1:N)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>projects</strong> → <strong>tasks</strong> (1:N)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>tasks</strong> → <strong>task_assignments</strong> (1:N)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>annotator_profiles</strong> → <strong>task_assignments</strong> (1:N)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>task_assignments</strong> → <strong>reviews</strong> (1:N)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span><strong>users</strong> → <strong>transactions</strong> (1:N)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Stack Tab */}
        <TabsContent value="stack" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Frontend */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <CardTitle>Frontend Stack</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Core Framework</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>React 18+</strong> - UI библиотека</li>
                      <li>• <strong>TypeScript</strong> - Типизация</li>
                      <li>• <strong>Vite</strong> - Сборщик и dev server</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Styling</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Tailwind CSS 4</strong> - Utility-first CSS</li>
                      <li>• <strong>shadcn/ui</strong> - UI компоненты</li>
                      <li>• <strong>Lucide React</strong> - Иконки</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">State Management</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Zustand</strong> - Легковесный state manager</li>
                      <li>• <strong>React Query</strong> - Server state management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Annotation Tools</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Fabric.js</strong> - Canvas манипуляции</li>
                      <li>• <strong>React DnD</strong> - Drag and drop</li>
                      <li>• <strong>Konva</strong> - Сложная графика</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-green-600" />
                  <CardTitle>Backend Stack</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Runtime & Framework</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Node.js 20+</strong> - Runtime</li>
                      <li>• <strong>NestJS</strong> - Backend framework</li>
                      <li>• <strong>Express</strong> - HTTP server</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Database & ORM</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>PostgreSQL 15+</strong> - Основная БД</li>
                      <li>• <strong>Prisma / TypeORM</strong> - ORM</li>
                      <li>• <strong>Redis</strong> - Кэширование, очереди</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Authentication</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Passport.js</strong> - Auth middleware</li>
                      <li>• <strong>JWT</strong> - Token-based auth</li>
                      <li>• <strong>bcrypt</strong> - Password hashing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Background Jobs</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>BullMQ</strong> - Job queue</li>
                      <li>• <strong>Node-cron</strong> - Scheduled tasks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database & Storage */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-purple-600" />
                  <CardTitle>Database & Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Primary Storage</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>PostgreSQL</strong> - Реляционные данные</li>
                      <li>• <strong>Redis</strong> - Кэш, сессии, pub/sub</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">File Storage</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>AWS S3</strong> - Объектное хранилище</li>
                      <li>• <strong>CloudFlare R2</strong> - Альтернатива S3</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Search</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Elasticsearch</strong> - Full-text search</li>
                      <li>• <strong>PostgreSQL FTS</strong> - Встроенный поиск</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DevOps & Infrastructure */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  <CardTitle>DevOps & Infrastructure</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Containerization</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Docker</strong> - Контейнеризация</li>
                      <li>• <strong>Kubernetes</strong> - Оркестрация</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">CI/CD</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>GitHub Actions</strong> - Автоматизация</li>
                      <li>• <strong>ArgoCD</strong> - GitOps deployment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Monitoring & Logging</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Prometheus</strong> - Метрики</li>
                      <li>• <strong>Grafana</strong> - Визуализация</li>
                      <li>• <strong>Sentry</strong> - Error tracking</li>
                      <li>• <strong>ELK Stack</strong> - Логирование</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2">Security</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>HTTPS/TLS</strong> - Шифрование транспорта</li>
                      <li>• <strong>Helmet.js</strong> - Security headers</li>
                      <li>• <strong>Rate Limiting</strong> - DDoS защита</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Development Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Инструменты разработки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="mb-3">Code Quality</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>ESLint</strong> - Линтинг</li>
                    <li>• <strong>Prettier</strong> - Форматирование</li>
                    <li>• <strong>Husky</strong> - Git hooks</li>
                    <li>• <strong>lint-staged</strong> - Pre-commit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3">Testing</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Jest</strong> - Unit tests</li>
                    <li>• <strong>React Testing Library</strong> - Component tests</li>
                    <li>• <strong>Playwright</strong> - E2E tests</li>
                    <li>• <strong>Supertest</strong> - API tests</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3">Documentation</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Swagger/OpenAPI</strong> - API docs</li>
                    <li>• <strong>Storybook</strong> - Component docs</li>
                    <li>• <strong>TypeDoc</strong> - Code docs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
