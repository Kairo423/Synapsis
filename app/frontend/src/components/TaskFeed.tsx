import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Clock, Award, Search, FileText, ChevronLeft } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  category: string;
  difficulty: string;
  requiredExpertise: string;
  estimatedTime: string;
  clientRating: number;
  available: number;
  file_link?: string;
  domain_requirements?: Array<{ domain_id: number }>;
  skill_requirements?: Array<{ skill_id: number; min_level?: number }>;
  type_assignment?: { task_type_id: number } | null;
}

interface TaskFeedProps {
  onTaskSelect: (task: Task) => void;
}

export function TaskFeed({ onTaskSelect }: TaskFeedProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myResponses, setMyResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    categoryFilter: 'all',
    difficultyFilter: 'all',
    domainFilter: 'all',
    skillFilter: 'all',
    taskTypeFilter: 'all',
    minPrice: '',
    maxPrice: '',
  });
  const [domains, setDomains] = useState<any[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);

  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [isTakingTask, setIsTakingTask] = useState(false);
  const [taskResponse, setTaskResponse] = useState<any | null>(null);
  const [comment, setComment] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      } catch (err) {
        console.error('Failed to fetch catalogs', err);
      }
    };
    fetchCatalogs();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (appliedFilters.searchQuery) params.set('q', appliedFilters.searchQuery);
        if (appliedFilters.categoryFilter !== 'all') params.set('category', appliedFilters.categoryFilter);
        if (appliedFilters.difficultyFilter !== 'all') params.set('difficulty', appliedFilters.difficultyFilter);
        if (appliedFilters.domainFilter !== 'all') params.set('domain_ids', appliedFilters.domainFilter);
        if (appliedFilters.skillFilter !== 'all') params.set('skill_ids', appliedFilters.skillFilter);
        if (appliedFilters.taskTypeFilter !== 'all') params.set('task_type_id', appliedFilters.taskTypeFilter);
        if (appliedFilters.minPrice) params.set('min_price', appliedFilters.minPrice);
        if (appliedFilters.maxPrice) params.set('max_price', appliedFilters.maxPrice);

        // Fetch tasks
        const tasksRes = await fetch(`http://localhost:8000/search/tasks?${params.toString()}`);
        if (!tasksRes.ok) throw new Error('Ошибка при загрузке заданий');
        const tasksData = await tasksRes.json();

        // Fetch my responses
        let responsesData: any[] = [];
        try {
          const responsesRes = await fetch('http://localhost:8000/task_responses/', {
            credentials: 'include',
            cache: 'no-store'
          });
          if (responsesRes.ok) {
            responsesData = await responsesRes.json();
            // Sort by ID descending to ensure we get the latest response for each task if duplicates exist
            responsesData.sort((a: any, b: any) => b.id - a.id);
          }
        } catch (e) {
          console.error("Failed to fetch responses", e);
        }
        setMyResponses(responsesData);

        // Map backend data to frontend Task interface
        const mappedTasks: Task[] = tasksData.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          reward: task.price,
          deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Не указан',
          category: task.category || 'Общее',
          difficulty: mapDifficulty(task.difficulty),
          requiredExpertise: 'Общая компетенция',
          estimatedTime: 'Не указано',
          clientRating: 4.5, // Mocked as it's not in the backend yet
          available: task.repeats || 1,
          file_link: task.file_link,
          domain_requirements: task.domain_requirements || [],
          skill_requirements: task.skill_requirements || [],
          type_assignment: task.type_assignment || null,
        }));

        setTasks(mappedTasks);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchQuery,
      categoryFilter,
      difficultyFilter,
      domainFilter,
      skillFilter,
      taskTypeFilter,
      minPrice,
      maxPrice,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setDomainFilter('all');
    setSkillFilter('all');
    setTaskTypeFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setAppliedFilters({
      searchQuery: '',
      categoryFilter: 'all',
      difficultyFilter: 'all',
      domainFilter: 'all',
      skillFilter: 'all',
      taskTypeFilter: 'all',
      minPrice: '',
      maxPrice: '',
    });
  };

  const mapDifficulty = (difficulty: string | null) => {
    switch (difficulty) {
      case 'low': return 'Начальный';
      case 'min': return 'Средний';
      case 'mid': return 'Средний';
      case 'pro': return 'Продвинутый';
      case 'expert': return 'Эксперт';
      default: return difficulty || 'Начальный';
    }
  };

  const getDomainName = (domainId: number) => {
    return domains.find((domain) => domain.id === domainId)?.name || `Область #${domainId}`;
  };

  const getSkillName = (skillId: number) => {
    return skillsCatalog.find((skill) => skill.id === skillId)?.name || `Навык #${skillId}`;
  };

  const getTaskTypeName = (taskTypeId: number) => {
    return taskTypes.find((type) => type.id === taskTypeId)?.name || `Тип #${taskTypeId}`;
  };

  const handleTakeTask = async (task: Task) => {
    try {
      setIsTakingTask(true);
      const response = await fetch('http://localhost:8000/task_responses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Ошибка при взятии задачи');
      }

      const responseData = await response.json();
      setTaskResponse(responseData);
      // Removed onTaskSelect(task) to keep user in the modal
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTakingTask(false);
    }
  };

  const handleAbandonTask = async () => {
    if (!taskResponse) return;
    try {
      setIsTakingTask(true);
      const response = await fetch(`http://localhost:8000/task_responses/${taskResponse.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Не удалось отказаться от задачи');
      }

      setTaskResponse(null);
      setComment('');
      setResultLink('');
      setResultFile(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTakingTask(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!taskResponse) return;

    if (!comment.trim() || (!resultLink.trim() && !resultFile)) {
      alert('Пожалуйста, заполните комментарий и добавьте ссылку или файл результата.');
      return;
    }

    try {
      let attachmentUrl = resultLink.trim();
      if (resultFile) {
        const formData = new FormData();
        formData.append('upload_file', resultFile);
        const uploadRes = await fetch(`http://localhost:8000/files/responses/${taskResponse.id}/deliverables`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.detail || 'Не удалось загрузить файл');
        }
        const deliverable = await uploadRes.json();
        attachmentUrl = `http://localhost:8000/files/deliverables/${deliverable.id}/download`;
      }

      const response = await fetch(`http://localhost:8000/task_responses/${taskResponse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: comment,
          attachment_url: attachmentUrl
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Не удалось отправить результат');
      }

      // Show success message inside UI instead of alert
      setSuccessMessage('Работа успешно отправлена на проверку!');

      // Clear form and message after delay
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedTaskForModal(null);
        setTaskResponse(null);
        setComment('');
        setResultLink('');
        setResultFile(null);
        // Optionally trigger a refresh of tasks here
        window.location.reload(); // Simple way to refresh lists
      }, 2000);

    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter tasks logic
  const responseTaskIds = new Set(myResponses.map((r: any) => r.task_id));

  // Backend already applies filters; keep client-side list as-is
  const visibleTasks = tasks;

  const activeTasks = visibleTasks.filter(task => {
    const response = myResponses.find((r: any) => r.task_id === task.id);
    return response && ['in_progress', 'on_check', 'accepted', 'rejected'].includes(response.status);
  });
  const availableTasks = visibleTasks.filter(task => !responseTaskIds.has(task.id));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Начальный':
        return 'bg-green-600';
      case 'Средний':
        return 'bg-yellow-600';
      case 'Продвинутый':
        return 'bg-orange-600';
      case 'Эксперт':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {selectedTaskForModal ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900"
            onClick={() => {
              setSelectedTaskForModal(null);
              setTaskResponse(null);
              setComment('');
              setResultLink('');
              setResultFile(null);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-semibold">Назад к списку</span>
          </Button>

          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden gap-0">
            <CardHeader className="border-b bg-slate-50/50 p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                      {selectedTaskForModal.title}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-green-600 hover:bg-green-600 text-white font-bold px-4 py-1 text-sm rounded-full border-0">
                        {selectedTaskForModal.reward}₽
                      </Badge>
                      <Badge variant="outline" className="border-slate-300 text-slate-600 font-bold px-4 py-1 text-sm rounded-full">
                        {selectedTaskForModal.category}
                      </Badge>
                      <Badge className={`${getDifficultyColor(selectedTaskForModal.difficulty)} hover:opacity-100 text-white border-0 font-bold px-4 py-1 text-sm rounded-full`}>
                        {selectedTaskForModal.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                {taskResponse || responseTaskIds.has(selectedTaskForModal.id) ? (
                  <Button
                    onClick={handleAbandonTask}
                    disabled={isTakingTask}
                    variant="destructive"
                    className="font-bold rounded-xl w-64 h-14 text-lg shrink-0 flex items-center justify-center shadow-lg"
                  >
                    {isTakingTask ? 'Обработка...' : 'Отказаться от задачи'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleTakeTask(selectedTaskForModal)}
                    disabled={isTakingTask}
                    className="!bg-black hover:bg-slate-800 text-white font-black rounded-xl w-64 h-14 text-lg shrink-0 flex items-center justify-center shadow-lg"
                  >
                    {isTakingTask ? 'Обработка...' : 'Взять в работу'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div style={{ marginBottom: '32px' }}>
                <p
                  className="text-slate-700 text-lg leading-relaxed max-w-4xl font-medium"
                  style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                >
                  {selectedTaskForModal.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedTaskForModal.type_assignment?.task_type_id && (
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-700">
                    {getTaskTypeName(selectedTaskForModal.type_assignment.task_type_id)}
                  </Badge>
                )}
                {selectedTaskForModal.domain_requirements?.map((item) => (
                  <Badge key={`domain-${item.domain_id}`} variant="outline" className="bg-white border-slate-200 text-slate-700">
                    {getDomainName(item.domain_id)}
                  </Badge>
                ))}
                {selectedTaskForModal.skill_requirements?.map((item) => (
                  <Badge key={`skill-${item.skill_id}`} variant="outline" className="bg-white border-slate-200 text-slate-700">
                    {getSkillName(item.skill_id)}{item.min_level ? ` · ${item.min_level}+` : ''}
                  </Badge>
                ))}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div className="inline-block w-full">
                  {selectedTaskForModal.file_link ? (
                    <a
                      href={selectedTaskForModal.file_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
                    >
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-slate-900 font-bold truncate">{selectedTaskForModal.file_link}</span>
                        <span className="text-slate-400 text-xs font-semibold">Нажмите для перехода</span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      <div className="p-2 bg-white/50 rounded-lg border border-slate-200/50">
                        <FileText className="w-6 h-6 opacity-30" />
                      </div>
                      <span className="font-semibold italic">Файлы не прикреплены</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-16 border-t border-slate-100 py-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 font-medium">Дедлайн</span>
                    <span className="text-xl font-bold text-slate-900 leading-tight">{selectedTaskForModal.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-2xl shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 font-medium">Доступно</span>
                    <span className="text-xl font-bold text-slate-900 leading-tight">{selectedTaskForModal.available} шт</span>
                  </div>
                </div>
              </div>

              {(taskResponse || responseTaskIds.has(selectedTaskForModal.id)) && (
                <div className="pt-12 border-t border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-slate-900">Комментарий к работе</label>
                    <textarea
                      className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-y"
                      placeholder="Опишите выполненную работу..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-lg font-bold text-slate-900">Ссылка на результат</label>
                    <Input
                      className="h-14 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-900"
                      placeholder="https://..."
                      value={resultLink}
                      onChange={(e) => setResultLink(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-lg font-bold text-slate-900">Файл результата (PDF/JPG/PNG/ZIP)</label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      className="h-14 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-900"
                      onChange={(e) => setResultFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {resultFile && (
                      <div className="text-sm text-slate-500">Выбран файл: {resultFile.name}</div>
                    )}
                  </div>

                  <div className="pt-4">
                    {successMessage ? (
                      <div className="w-full h-14 bg-green-50 text-green-700 border border-green-200 font-bold text-lg rounded-xl flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2">
                          <span>{successMessage}</span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleSubmitResponse}
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-600/20"
                      >
                        Отдать на проверку
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Task List View */
        <div className="flex flex-col">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden gap-0 mb-12">

            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Поиск заданий..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border-slate-200 rounded-lg"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="Медицина">Медицина</SelectItem>
                    <SelectItem value="Право">Право</SelectItem>
                    <SelectItem value="Лингвистика">Лингвистика</SelectItem>
                    <SelectItem value="Финансы">Финансы</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Сложность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="Начальный">Начальный</SelectItem>
                    <SelectItem value="Средний">Средний</SelectItem>
                    <SelectItem value="Продвинутый">Продвинутый</SelectItem>
                    <SelectItem value="Эксперт">Эксперт</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Тип задания" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mt-4">
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Область" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Любая область</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={String(domain.id)}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Навык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Любой навык</SelectItem>
                    {skillsCatalog.map((skill) => (
                      <SelectItem key={skill.id} value={String(skill.id)}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Мин. бюджет"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg"
                  type="number"
                  min="0"
                />

                <Input
                  placeholder="Макс. бюджет"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg"
                  type="number"
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleResetFilters}>
                  Сбросить
                </Button>
                <Button onClick={handleApplyFilters}>
                  Применить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* IN PROGRESS TASKS SECTION */}
          {activeTasks.filter(task => {
            const response = myResponses.find((r: any) => r.task_id === task.id);
            return response && response.status === 'in_progress';
          }).length > 0 && (
              <div className="space-y-4 mt-40">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    В работе <Badge className="bg-blue-600 text-white border-0">{activeTasks.filter(task => {
                      const response = myResponses.find((r: any) => r.task_id === task.id);
                      return response && response.status === 'in_progress';
                    }).length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {activeTasks.filter(task => {
                    const response = myResponses.find((r: any) => r.task_id === task.id);
                    return response && response.status === 'in_progress';
                  }).map((task) => (
                    <Card
                      key={task.id}
                      className="hover:border-blue-300 transition-colors cursor-pointer rounded-xl border-blue-100 bg-blue-50/30 group"
                      onClick={() => {
                        setSelectedTaskForModal(task);
                        setResultFile(null);
                        const response = myResponses.find((r: any) => r.task_id === task.id);
                        if (response) {
                          setTaskResponse(response);
                          setComment(response.comment || '');
                          setResultLink(response.attachment_url || '');
                        }
                      }}
                    >
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <h4 className="text-lg font-bold text-slate-900 leading-tight">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold">
                                В работе
                              </Badge>
                            </div>
                          </div>
                          <Button
                            className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 pointer-events-none shrink-0"
                            style={{ minWidth: '200px', paddingLeft: '40px', paddingRight: '40px' }}
                          >
                            Продолжить
                          </Button>
                        </div>
                        <p className="text-slate-700 text-sm break-all">
                          {task.description.length > 60
                            ? task.description.substring(0, 60) + '...'
                            : task.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}



          {/* AVAILABLE TASKS SECTION */}
          <div className="space-y-4 mt-40">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-900">Доступные задания ({availableTasks.length})</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-950 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Загрузка...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center">
                  <p className="font-bold mb-3">{error}</p>
                  <Button
                    variant="outline"
                    className="rounded-lg h-9"
                    onClick={() => window.location.reload()}
                  >
                    Повторить
                  </Button>
                </div>
              )}

              {!isLoading && !error && availableTasks.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Нет доступных заданий</p>
                </div>
              )}

              {!isLoading && !error && availableTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:border-slate-300 transition-colors cursor-pointer rounded-xl border-slate-200 group"
                  onClick={() => {
                    setSelectedTaskForModal(task);
                    setTaskResponse(null);
                    setComment('');
                    setResultLink('');
                    setResultFile(null);
                  }}
                >
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <h4 className="text-lg font-bold text-slate-900 leading-tight">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-slate-200 text-slate-500 font-medium whitespace-nowrap">
                            {task.category}
                          </Badge>
                          <Badge className={`${getDifficultyColor(task.difficulty)} text-white border-0 font-medium whitespace-nowrap`}>
                            {task.difficulty}
                          </Badge>
                        </div>
                      </div>

                    </div>

                    <p className="text-slate-700 text-sm break-all">
                      {task.description.length > 60
                        ? task.description.substring(0, 60) + '...'
                        : task.description}
                    </p>

                    {(task.type_assignment || (task.domain_requirements && task.domain_requirements.length > 0) || (task.skill_requirements && task.skill_requirements.length > 0)) && (
                      <div className="flex flex-wrap gap-2">
                        {task.type_assignment?.task_type_id && (
                          <Badge variant="outline" className="border-slate-200 text-slate-500 font-medium">
                            {getTaskTypeName(task.type_assignment.task_type_id)}
                          </Badge>
                        )}
                        {task.domain_requirements?.map((item) => (
                          <Badge key={`domain-${task.id}-${item.domain_id}`} variant="outline" className="border-slate-200 text-slate-500 font-medium">
                            {getDomainName(item.domain_id)}
                          </Badge>
                        ))}
                        {task.skill_requirements?.map((item) => (
                          <Badge key={`skill-${task.id}-${item.skill_id}`} variant="outline" className="border-slate-200 text-slate-500 font-medium">
                            {getSkillName(item.skill_id)}{item.min_level ? ` · ${item.min_level}+` : ''}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-12 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Вознаграждение</div>
                          <div className="font-bold text-slate-900">{task.reward}₽</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Срок</div>
                          <div className="font-bold text-slate-900">{task.deadline}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Доступно</div>
                          <div className="font-bold text-slate-900">{task.available} шт</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
