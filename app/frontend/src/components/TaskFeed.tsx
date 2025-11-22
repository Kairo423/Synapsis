import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Clock, Award, Search, Filter } from 'lucide-react';

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
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Разметка рентгеновских снимков грудной клетки',
    description: 'Необходимо отметить области с патологиями на рентгеновских снимках. Требуется опыт работы с медицинской визуализацией.',
    reward: 1200,
    deadline: '5 дней',
    category: 'Медицина',
    difficulty: 'Продвинутый',
    requiredExpertise: 'Медицинская визуализация',
    estimatedTime: '45 мин',
    clientRating: 4.8,
    available: 150,
  },
  {
    id: 2,
    title: 'Классификация медицинских диагнозов',
    description: 'Классифицируйте медицинские заключения по категориям диагнозов. Требуется знание медицинской терминологии.',
    reward: 850,
    deadline: '3 дня',
    category: 'Медицина',
    difficulty: 'Средний',
    requiredExpertise: 'Медицинская терминология',
    estimatedTime: '30 мин',
    clientRating: 4.9,
    available: 200,
  },
  {
    id: 3,
    title: 'Сегментация органов на КТ снимках',
    description: 'Выделите границы органов на компьютерных томограммах. Высокая точность обязательна.',
    reward: 1500,
    deadline: '7 дней',
    category: 'Медицина',
    difficulty: 'Эксперт',
    requiredExpertise: 'КТ диагностика',
    estimatedTime: '60 мин',
    clientRating: 5.0,
    available: 80,
  },
  {
    id: 4,
    title: 'Аннотация юридических документов',
    description: 'Разметьте ключевые юридические термины и понятия в договорах и соглашениях.',
    reward: 950,
    deadline: '4 дня',
    category: 'Право',
    difficulty: 'Продвинутый',
    requiredExpertise: 'Юриспруденция',
    estimatedTime: '40 мин',
    clientRating: 4.7,
    available: 120,
  },
  {
    id: 5,
    title: 'Разметка эмоций в текстах',
    description: 'Определите эмоциональную окраску текстовых фрагментов для обучения NLP моделей.',
    reward: 600,
    deadline: '2 дня',
    category: 'Лингвистика',
    difficulty: 'Начальный',
    requiredExpertise: 'Лингвистика',
    estimatedTime: '20 мин',
    clientRating: 4.5,
    available: 300,
  },
  {
    id: 6,
    title: 'Транскрипция медицинских аудиозаписей',
    description: 'Переведите в текст аудиозаписи консультаций врачей с пациентами.',
    reward: 1100,
    deadline: '6 дней',
    category: 'Медицина',
    difficulty: 'Средний',
    requiredExpertise: 'Медицинская терминология',
    estimatedTime: '50 мин',
    clientRating: 4.6,
    available: 100,
  },
];

interface TaskFeedProps {
  onTaskSelect: (task: Task) => void;
}

export function TaskFeed({ onTaskSelect }: TaskFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск заданий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Доступные задания ({filteredTasks.length})</h3>
        </div>
        
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{task.title}</CardTitle>
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge className={getDifficultyColor(task.difficulty)}>
                        {task.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Task Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Вознаграждение</div>
                        <div>{task.reward}₽</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">Срок</div>
                        <div>{task.deadline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">Время</div>
                        <div>{task.estimatedTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">Доступно</div>
                        <div>{task.available} шт</div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements and Action */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        Требования: <span>{task.requiredExpertise}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Рейтинг заказчика: <span className="text-yellow-600">★ {task.clientRating}</span>
                      </div>
                    </div>
                    <Button onClick={() => onTaskSelect(task)}>
                      Взять задание
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
