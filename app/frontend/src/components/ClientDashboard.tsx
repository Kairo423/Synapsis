import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SubmissionReview } from './SubmissionReview';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  DollarSign,
  Users,
  BarChart3,
  Eye,
  Check,
  X,
} from 'lucide-react';

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<number, 'pending' | 'accepted' | 'rejected'>>({});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1>Дашборд поставщика</h1>
        <p className="text-gray-600">Управление проектами и заданиями по разметке данных</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="create">Создать задание</TabsTrigger>
          <TabsTrigger value="review">Проверка работ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Активных проектов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl">8</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Выполнено заданий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-2xl">1,247</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>На проверке</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-2xl">89</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Средняя оценка качества</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Активные проекты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    name: 'Разметка медицинских снимков МРТ',
                    total: 1000,
                    completed: 680,
                    inProgress: 150,
                    pending: 170,
                    quality: 97,
                  },
                  {
                    id: 2,
                    name: 'Классификация рентгеновских изображений',
                    total: 500,
                    completed: 320,
                    inProgress: 80,
                    pending: 100,
                    quality: 99,
                  },
                  {
                    id: 3,
                    name: 'Сегментация органов на КТ',
                    total: 800,
                    completed: 145,
                    inProgress: 120,
                    pending: 535,
                    quality: 96,
                  },
                ].map((project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4>{project.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Завершено: {project.completed} из {project.total}
                            </p>
                          </div>
                          <Badge variant="outline">Качество: {project.quality}%</Badge>
                        </div>

                        <div>
                          <Progress value={(project.completed / project.total) * 100} />
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Завершено: {project.completed}</span>
                            <span>В работе: {project.inProgress}</span>
                            <span>Ожидают: {project.pending}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Подробнее
                          </Button>
                          <Button variant="outline" size="sm">
                            Проверить работы
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Финансы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Текущий баланс</span>
                    <span className="text-2xl">125,400₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Зарезервировано</span>
                    <span className="text-xl text-gray-500">45,200₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Всего потрачено</span>
                    <span className="text-xl text-gray-500">342,800₽</span>
                  </div>
                  <Button className="w-full mt-4">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Пополнить баланс
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика исполнителей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Всего исполнителей</span>
                    <span className="text-2xl">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Топ-исполнители</span>
                    <span className="text-xl text-gray-500">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Средний рейтинг</span>
                    <span className="text-xl text-gray-500">4.8 ⭐</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Users className="w-4 h-4 mr-2" />
                    Управление исполнителями
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Все проекты</CardTitle>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать новый проект
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Список всех проектов отображается здесь</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Task Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Создание нового задания</CardTitle>
              <CardDescription>
                Заполните форму для публикации задания на платформе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название задания</Label>
                  <Input
                    id="title"
                    placeholder="Например: Разметка медицинских снимков"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Детальное описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Опишите задачу, требования и ожидаемый результат..."
                    rows={5}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Специализация</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medicine">Медицина</SelectItem>
                        <SelectItem value="law">Право</SelectItem>
                        <SelectItem value="linguistics">Лингвистика</SelectItem>
                        <SelectItem value="finance">Финансы</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Уровень сложности</Label>
                    <Select>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Начальный</SelectItem>
                        <SelectItem value="intermediate">Средний</SelectItem>
                        <SelectItem value="advanced">Продвинутый</SelectItem>
                        <SelectItem value="expert">Эксперт</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reward">Вознаграждение (₽)</Label>
                    <Input
                      id="reward"
                      type="number"
                      placeholder="1000"
                    />
                    <p className="text-sm text-gray-500">
                      Рекомендуемое: 1,200₽ (на основе сложности)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Срок выполнения (дни)</Label>
                    <Input
                      id="deadline"
                      type="number"
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество заданий</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="100"
                  />
                  <p className="text-sm text-gray-500">
                    Сколько исполнителей должны выполнить это задание
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Контроль качества</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cross-validation" />
                      <Label htmlFor="cross-validation" className="cursor-pointer">
                        Кросс-валидация (3 исполнителя на задание)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="manual-review" />
                      <Label htmlFor="manual-review" className="cursor-pointer">
                        Ручная проверка модератором
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Загрузка файлов</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Перетащите файлы или нажмите для выбора
                    </p>
                    <p className="text-sm text-gray-500">
                      Поддерживаются: изображения, документы, архивы
                    </p>
                    <Button variant="outline" className="mt-4">
                      Выбрать файлы
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline">Сохранить черновик</Button>
                  <Button>Опубликовать задание</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          {selectedSubmission ? (
            <SubmissionReview
              submission={selectedSubmission}
              onBack={() => setSelectedSubmission(null)}
              onAccept={() => {
                setSubmissionStatuses({ ...submissionStatuses, [selectedSubmission.id]: 'accepted' });
                setSelectedSubmission(null);
              }}
              onReject={() => {
                setSubmissionStatuses({ ...submissionStatuses, [selectedSubmission.id]: 'rejected' });
                setSelectedSubmission(null);
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Проверка выполненных работ</CardTitle>
                <CardDescription>
                  Просмотрите и оцените работы исполнителей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      annotator: 'Анна Иванова',
                      task: 'Разметка медицинских снимков МРТ',
                      submittedAt: '2025-10-24 14:30',
                      rating: 4.9,
                    },
                    {
                      id: 2,
                      annotator: 'Михаил Петров',
                      task: 'Разметка медицинских снимков МРТ',
                      submittedAt: '2025-10-24 15:15',
                      rating: 4.7,
                    },
                    {
                      id: 3,
                      annotator: 'Елена Сидорова',
                      task: 'Классификация рентгеновских изображений',
                      submittedAt: '2025-10-24 16:00',
                      rating: 5.0,
                    },
                  ].map((submission) => {
                    const status = submissionStatuses[submission.id] || 'pending';
                    
                    return (
                      <Card key={submission.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4>{submission.task}</h4>
                                {status === 'pending' && (
                                  <Badge variant="outline" className="bg-yellow-50">
                                    На проверке
                                  </Badge>
                                )}
                                {status === 'accepted' && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Принято
                                  </Badge>
                                )}
                                {status === 'rejected' && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Отклонено
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Исполнитель: {submission.annotator} ⭐ {submission.rating}</p>
                                <p>Отправлено: {submission.submittedAt}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Просмотр
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={status === 'accepted' ? 'bg-green-50 text-green-700 border-green-600' : 'text-green-600 border-green-600 hover:bg-green-50'}
                                onClick={() => setSubmissionStatuses({ ...submissionStatuses, [submission.id]: 'accepted' })}
                                disabled={status === 'accepted'}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Принять
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={status === 'rejected' ? 'bg-red-50 text-red-700 border-red-600' : 'text-red-600 border-red-600 hover:bg-red-50'}
                                onClick={() => setSubmissionStatuses({ ...submissionStatuses, [submission.id]: 'rejected' })}
                                disabled={status === 'rejected'}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Отклонить
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
