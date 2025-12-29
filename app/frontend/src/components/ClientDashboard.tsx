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
import { ExpertSearch } from './ExpertSearch';
import { ProjectChat } from './ProjectChat';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Users,
  Eye,
  Check,
  X,
  Trash2,
  Pencil,
} from 'lucide-react';

export function ClientDashboard({ userName, userId, refreshBalance }: { userName?: string; userId?: number; refreshBalance?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<number, 'pending' | 'accepted' | 'rejected' | 'on_check' | 'submitted'>>({});
  const [contracts, setContracts] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);

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
  const [selectedDomainIds, setSelectedDomainIds] = useState<number[]>([]);
  const [skillRequirements, setSkillRequirements] = useState<Array<{ skill_id: number; min_level: number }>>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('3');
  const [taskTypeId, setTaskTypeId] = useState('none');
  const [taskFiles, setTaskFiles] = useState<File[]>([]);

  const [editingTask, setEditingTask] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // My Tasks state
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [isLoadingMyTasks, setIsLoadingMyTasks] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview' && userId) {
      fetchMyTasks();
      fetchReviews();
      fetchContracts();
    } else if (activeTab === 'tasks') {
      fetchMyTasks();
    } else if (activeTab === 'review' && userId) {
      fetchReviews();
      fetchContracts();
    } else if (activeTab === 'contracts' && userId) {
      fetchContracts();
    }
  }, [activeTab, userId]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [domainsRes, skillsRes, typesRes] = await Promise.all([
          fetch('http://localhost:8000/catalogs/domains'),
          fetch('http://localhost:8000/catalogs/skills'),
          fetch('http://localhost:8000/catalogs/task-types'),
        ]);
        if (domainsRes.ok) setDomains(await domainsRes.json());
        if (skillsRes.ok) setSkillsCatalog(await skillsRes.json());
        if (typesRes.ok) setTaskTypes(await typesRes.json());
      } catch (error) {
        console.error('Failed to fetch catalogs', error);
      }
    };
    fetchCatalogs();
  }, []);

  const fetchReviews = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8000/task_responses/provider/${userId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchContracts = async () => {
    if (!userId) return;
    try {
      const response = await fetch('http://localhost:8000/contracts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

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

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить задание');
      }

      setMyTasks(myTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Ошибка при удалении задания');
    }
  };

  const handleEditClick = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    // Adjust category/custom category logic
    const knownCategories = ['Медицина', 'Право', 'Лингвистика', 'Финансы'];
    if (knownCategories.includes(task.category)) {
      setCategory(task.category);
      setCustomCategory('');
    } else {
      setCategory('other');
      setCustomCategory(task.category);
    }

    // Reverse map difficulty
    const reverseDifficultyMap: Record<string, string> = {
      'low': 'beginner',
      'mid': 'intermediate',
      'pro': 'advanced',
      'expert': 'expert'
    };
    setDifficulty(reverseDifficultyMap[task.difficulty] || '');

    setPrice(task.price.toString());
    setDeadline(task.deadline ? task.deadline.slice(0, 16) : ''); // Format for datetime-local
    setRepeats(task.repeats.toString());
    setFileLink(task.file_link || '');
    setTaskFiles([]);
    setSelectedDomainIds(task.domain_requirements?.map((item: any) => item.domain_id) || []);
    setSkillRequirements(
      task.skill_requirements?.map((item: any) => ({
        skill_id: item.skill_id,
        min_level: item.min_level || 1,
      })) || []
    );
    setTaskTypeId(task.type_assignment?.task_type_id ? String(task.type_assignment.task_type_id) : 'none');

    setActiveTab('create');
  };

  const toggleDomain = (domainId: number) => {
    setSelectedDomainIds((prev) => (
      prev.includes(domainId) ? prev.filter((id) => id !== domainId) : [...prev, domainId]
    ));
  };

  const handleAddSkillRequirement = () => {
    if (!selectedSkillId) return;
    const skillId = parseInt(selectedSkillId, 10);
    if (!skillId) return;
    const level = parseInt(selectedSkillLevel, 10) || 3;
    setSkillRequirements((prev) => {
      const existing = prev.find((item) => item.skill_id === skillId);
      if (existing) {
        return prev.map((item) => (item.skill_id === skillId ? { ...item, min_level: level } : item));
      }
      return [...prev, { skill_id: skillId, min_level: level }];
    });
  };

  const handleRemoveSkillRequirement = (skillId: number) => {
    setSkillRequirements((prev) => prev.filter((item) => item.skill_id !== skillId));
  };

  const uploadTaskFiles = async (taskId: number) => {
    if (taskFiles.length === 0) return;
    for (const file of taskFiles) {
      const formData = new FormData();
      formData.append('upload_file', file);
      const response = await fetch(`http://localhost:8000/files/tasks/${taskId}/attachments`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось загрузить файл');
      }
    }
  };

  const createContractForResponse = async (responseId: number) => {
    const existing = contracts.find((contract) => contract.task_response_id === responseId);
    if (existing) return existing;
    const response = await fetch('http://localhost:8000/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ task_response_id: responseId }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Не удалось создать контракт');
    }
    const contract = await response.json();
    setContracts((prev) => [...prev, contract]);
    return contract;
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
      file_link: fileLink,
      domain_ids: selectedDomainIds,
      skill_requirements: skillRequirements,
      task_type_id: taskTypeId !== 'none' ? parseInt(taskTypeId, 10) : null,
    };

    try {
      const url = editingTask
        ? `http://localhost:8000/tasks/${editingTask.id}`
        : 'http://localhost:8000/tasks/';

      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Ошибка при ${editingTask ? 'обновлении' : 'создании'} задания`);
      }

      const savedTask = await response.json();
      await uploadTaskFiles(savedTask.id);
      setSuccess(editingTask ? 'Задание успешно обновлено!' : 'Задание успешно опубликовано!');

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
      setSelectedDomainIds([]);
      setSkillRequirements([]);
      setSelectedSkillId('');
      setSelectedSkillLevel('3');
      setTaskTypeId('none');
      setTaskFiles([]);
      setEditingTask(null);

      // If was editing, maybe go back to tasks list? Or just stay here with success message.
      // Let's redirect to tasks list after a short delay or immediately if desired.
      // For now, let's keep it simple.

    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: number, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:8000/task_responses/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось обновить статус');
      }

      // Update local state to reflect change immediately
      setReviews(reviews.map(r => r.id === submissionId ? { ...r, status } : r));
      setSubmissionStatuses({ ...submissionStatuses, [submissionId]: status });

      // If we are in detailed view, close it or update it
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission(null);
      }

      if (status === 'accepted' && refreshBalance) {
        refreshBalance();
      }
      if (status === 'accepted') {
        try {
          await createContractForResponse(submissionId);
        } catch (err: any) {
          console.error('Failed to create contract:', err);
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Ошибка при обновлении статуса');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1>Дашборд поставщика: {userName}</h1>
        <p className="text-gray-600">Управление проектами и заданиями по разметке данных</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full max-w-4xl flex-wrap gap-2">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="tasks">Задания</TabsTrigger>
          <TabsTrigger value="create">Создать задание</TabsTrigger>
          <TabsTrigger value="review">Проверка работ</TabsTrigger>
          <TabsTrigger value="contracts">Контракты</TabsTrigger>
          <TabsTrigger value="experts">Эксперты</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Активных заданий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl">{myTasks.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Выполнено работ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-2xl">
                    {reviews.filter(r => r.status === 'accepted').length}
                  </span>
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
                  <span className="text-2xl">
                    {reviews.filter(r => r.status === 'on_check' || r.status === 'submitted').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Активные задания</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingMyTasks ? (
                  <div className="text-center py-12 text-gray-500">Загрузка...</div>
                ) : myTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Нет активных заданий</div>
                ) : (
                  myTasks.map((task) => {
                    const taskReviews = reviews.filter(r => r.task_id === task.id);
                    const completed = taskReviews.filter(r => r.status === 'accepted').length;
                    const inProgress = taskReviews.filter(r => r.status === 'in_progress').length;
                    const onCheck = taskReviews.filter(r => r.status === 'on_check' || r.status === 'submitted').length;
                    // Note: Quality is hardcoded for now as it's not in the DB, but using 100% placeholder or similar
                    const quality = 100;

                    return (
                      <Card key={task.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-lg">{task.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Завершено: {completed} из {task.repeats}
                                </p>
                              </div>
                              <Badge variant="outline">Качество: {quality}%</Badge>
                            </div>

                            <div>
                              <Progress value={(completed / task.repeats) * 100} />
                              <div className="flex justify-between text-sm text-gray-600 mt-2">
                                <span>Завершено: {completed}</span>
                                <span>В работе: {inProgress}</span>
                                <span>Ожидают: {onCheck}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleEditClick(task);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Подробнее
                              </Button>
                              <ProjectChat
                                taskId={task.id}
                                taskTitle={task.title}
                                currentUserId={userId}
                                triggerLabel="Чат"
                                buttonVariant="outline"
                                buttonSize="sm"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveTab('review');
                                }}
                              >
                                Проверить работы
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
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
                <Button onClick={() => {
                  setEditingTask(null);
                  setTitle('');
                  setDescription('');
                  setCategory('');
                  setCustomCategory('');
                  setDifficulty('');
                  setPrice('');
                  setDeadline('');
                  setRepeats('1');
                  setFileLink('');
                  setSelectedDomainIds([]);
                  setSkillRequirements([]);
                  setSelectedSkillId('');
                  setSelectedSkillLevel('3');
                  setTaskTypeId('none');
                  setTaskFiles([]);
                  setActiveTab('create');
                }}>
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
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-lg truncate">{task.title}</h4>
                          <Badge variant={
                            task.status === 'new' ? 'secondary' :
                              task.status === 'in_progress' ? 'default' :
                                task.status === 'completed' ? 'success' : 'outline'
                          } className="shrink-0">
                            {task.status === 'new' && 'Новое'}
                            {task.status === 'in_progress' && 'В работе'}
                            {task.status === 'completed' && 'Завершено'}
                            {task.status === 'review' && 'На проверке'}
                            {!['new', 'in_progress', 'completed', 'review'].includes(task.status) && task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {task.description && task.description.length > 40
                            ? task.description.slice(0, 40) + '...'
                            : task.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
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
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(task)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Изменить
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="w-4 h-4" />
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
              <CardTitle>{editingTask ? 'Редактирование задания' : 'Создание нового задания'}</CardTitle>
              <CardDescription>
                {editingTask ? 'Внесите изменения в существующее задание' : 'Заполните форму для публикации задания на платформе'}
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
                        <SelectItem value="Медицина">Медицина</SelectItem>
                        <SelectItem value="Право">Право</SelectItem>
                        <SelectItem value="Лингвистика">Лингвистика</SelectItem>
                        <SelectItem value="Финансы">Финансы</SelectItem>
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
                    <Label>Тип задания</Label>
                    <Select value={taskTypeId} onValueChange={setTaskTypeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип задания" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не выбран</SelectItem>
                        {taskTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Области экспертизы</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                      {domains.length === 0 ? (
                        <span className="text-sm text-gray-500">Нет доступных областей</span>
                      ) : (
                        domains.map((domain) => (
                          <label key={domain.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={selectedDomainIds.includes(domain.id)}
                              onChange={() => toggleDomain(domain.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            {domain.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Навыки и уровень владения</Label>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="min-w-[220px] flex-1 space-y-2">
                      <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите навык" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillsCatalog.map((skill) => (
                            <SelectItem key={skill.id} value={String(skill.id)}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[140px] space-y-2">
                      <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <SelectItem key={level} value={String(level)}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={handleAddSkillRequirement}>
                      Добавить
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {skillRequirements.length === 0 ? (
                      <p className="text-sm text-gray-500">Навыки пока не добавлены</p>
                    ) : (
                      skillRequirements.map((item) => {
                        const skillName = skillsCatalog.find((skill) => skill.id === item.skill_id)?.name || `Навык #${item.skill_id}`;
                        return (
                          <div key={item.skill_id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{skillName}</span>
                              <Badge variant="outline">Уровень: {item.min_level}</Badge>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveSkillRequirement(item.skill_id)}>
                              Удалить
                            </Button>
                          </div>
                        );
                      })
                    )}
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

                <div className="space-y-2">
                  <Label>Файлы задания (PDF/JPG/PNG/ZIP)</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.zip"
                    onChange={(e) => setTaskFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                  {taskFiles.length > 0 && (
                    <div className="text-sm text-gray-500">
                      Загружено файлов: {taskFiles.length}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : (editingTask ? 'Сохранить изменения' : 'Опубликовать задание')}
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
              contractId={contracts.find((contract) => contract.task_response_id === selectedSubmission.id)?.id}
              revieweeId={selectedSubmission.performer_id}
              onBack={() => setSelectedSubmission(null)}
              onAccept={() => updateSubmissionStatus(selectedSubmission.id, 'accepted')}
              onReject={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
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
                  {reviews
                    .filter((submission) => submission.status === 'on_check')
                    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                    .map((submission) => {
                      const status = submissionStatuses[submission.id] || submission.status;
                      const contract = contracts.find((item) => item.task_response_id === submission.id);

                      return (
                        <Card key={submission.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4>{submission.task?.title || 'Unknown Task'}</h4>
                                  {(status === 'on_check' || status === 'submitted') && (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-medium border-0">
                                      На проверке
                                    </Badge>
                                  )}
                                  {status === 'accepted' && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold border-0">
                                      Принято
                                    </Badge>
                                  )}
                                  {status === 'rejected' && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 font-bold border-0">
                                      Отклонено
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>Исполнитель: {submission.performer?.name || 'Unknown'}</p>
                                  <p>Отправлено: {new Date(submission.submitted_at).toLocaleString()}</p>
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
                                  disabled={Boolean(contract)}
                                  onClick={async () => {
                                    try {
                                      await createContractForResponse(submission.id);
                                      setActiveTab('contracts');
                                    } catch (err: any) {
                                      alert(err.message || 'Не удалось создать контракт');
                                    }
                                  }}
                                >
                                  {contract ? 'Контракт создан' : 'Заключить контракт'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => updateSubmissionStatus(submission.id, 'accepted')}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Принять
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
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

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Контракты</CardTitle>
              <CardDescription>История заключенных контрактов и их статусы</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Контракты пока не созданы</div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => {
                    const taskTitle = myTasks.find((task) => task.id === contract.task_id)?.title || `Задание #${contract.task_id}`;
                    return (
                      <div key={contract.id} className="border rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{taskTitle}</h4>
                          <Badge variant="outline">{contract.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Исполнитель ID: {contract.performer_id}</p>
                          <p>Стоимость: {contract.agreed_price ?? '—'} ₽</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <ExpertSearch />
        </TabsContent>
      </Tabs>
    </div >
  );
}
