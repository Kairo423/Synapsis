import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
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

export function ClientDashboard({ userName }: { userName?: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<number, 'pending' | 'accepted' | 'rejected'>>({});

  // Task creation state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [repeats, setRepeats] = useState('1');
  const [fileLink, setFileLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // My Tasks state
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [isLoadingMyTasks, setIsLoadingMyTasks] = useState(false);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchMyTasks();
    }
  }, [activeTab]);

  const fetchMyTasks = async () => {
    setIsLoadingMyTasks(true);
    try {
      const response = await fetch('http://localhost:8000/tasks/my', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMyTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoadingMyTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Difficulty mapping
    const difficultyMap: Record<string, string> = {
      'beginner': 'low',
      'intermediate': 'mid',
      'advanced': 'pro',
      'expert': 'expert'
    };

    const taskPayload = {
      title,
      description,
      category: category === 'other' ? customCategory : category,
      difficulty: difficultyMap[difficulty] || difficulty,
      price: parseFloat(price),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      repeats: parseInt(repeats),
      file_link: fileLink
    };

    try {
      const response = await fetch('http://localhost:8000/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Ошибка при создании задания');
      }

      setSuccess('Задание успешно опубликовано!');
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setCustomCategory('');
      setDifficulty('');
      setPrice('');
      setDeadline('');
      setRepeats('1');
      setFileLink('');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1>Дашборд поставщика: {userName}</h1>
        <p className="text-gray-600">Управление проектами и заданиями по разметке данных</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="tasks">Задания</TabsTrigger>
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


        </TabsContent>


        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Все задания</CardTitle>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать новое задание
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMyTasks ? (
                <div className="text-center py-12 text-gray-500">Загрузка заданий...</div>
              ) : myTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>У вас пока нет созданных заданий</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-lg">{task.title}</h4>
                          <Badge variant={
                            task.status === 'new' ? 'secondary' :
                              task.status === 'in_progress' ? 'default' :
                                task.status === 'completed' ? 'success' : 'outline'
                          }>
                            {task.status === 'new' && 'Новое'}
                            {task.status === 'in_progress' && 'В работе'}
                            {task.status === 'completed' && 'Завершено'}
                            {task.status === 'review' && 'На проверке'}
                            {!['new', 'in_progress', 'completed', 'review'].includes(task.status) && task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {task.price} ₽
                          </span>
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.repeats} исп.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <form onSubmit={handleCreateTask} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Название задания</Label>
                  <Input
                    id="title"
                    placeholder="Например: Разметка медицинских снимков"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Детальное описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Опишите задачу, требования и ожидаемый результат..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Специализация</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medicine">Медицина</SelectItem>
                        <SelectItem value="law">Право</SelectItem>
                        <SelectItem value="linguistics">Лингвистика</SelectItem>
                        <SelectItem value="finance">Финансы</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    {category === 'other' && (
                      <Input
                        className="mt-2"
                        placeholder="Введите свою специализацию"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Уровень сложности</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
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
                      min="0"
                      placeholder="1000"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Дедлайн</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      className="w-full h-10 px-3 py-2"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Количество заданий</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="100"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={repeats}
                      onChange={(e) => setRepeats(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Сколько исполнителей должны выполнить это задание
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_link">Ссылка на необходимые файлы</Label>
                    <Input
                      id="file_link"
                      placeholder="https://drive.google.com/..."
                      value={fileLink}
                      onChange={(e) => setFileLink(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Публикация...' : 'Опубликовать задание'}
                  </Button>
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
