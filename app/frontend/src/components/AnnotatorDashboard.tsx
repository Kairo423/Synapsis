import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Clock, DollarSign, Star, TrendingUp, Pencil, Check } from 'lucide-react';

export function AnnotatorDashboard({ userName, userId, refreshBalance }: { userName: string; userId?: number; refreshBalance?: () => void }) {
  const [description, setDescription] = useState('Загрузка...');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [balance, setBalance] = useState(0);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8000/users/${userId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setDescription(data.description || 'Нет описания');
          setBalance(data.balance || 0);
          if (refreshBalance) refreshBalance();
        })
        .catch((err) => {
          console.error(err);
          setDescription('Ошибка загрузки');
        });

      // Fetch tasks and responses
      const fetchTasksData = async () => {
        try {
          const [tasksRes, responsesRes] = await Promise.all([
            fetch('http://localhost:8000/tasks/'),
            fetch('http://localhost:8000/task_responses/', { credentials: 'include' })
          ]);

          if (tasksRes.ok && responsesRes.ok) {
            const tasks = await tasksRes.json();
            const responses = await responsesRes.json();

            const combined = responses.map((r: any) => {
              const t = tasks.find((t: any) => t.id === r.task_id);
              return {
                id: r.id,
                title: t?.title || 'Неизвестная задача',
                status: r.status,
                reward: t?.price || 0,
                date: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'Недавно',
                rating: null, // Placeholder as backend doesn't return rating yet
              };
            });
            // Sort by ID descending (newest first) as a proxy for time if checks are needed
            setRecentTasks(combined.sort((a: any, b: any) => b.id - a.id));
          }
        } catch (e) {
          console.error("Error loading recent tasks", e);
        }
      };
      fetchTasksData();
    }
  }, [userId]);

  const handleSaveDescription = async () => {
    try {
      const res = await fetch('http://localhost:8000/users/description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: tempDescription }),
      });
      if (res.ok) {
        // Reload description to verify
        const userRes = await fetch(`http://localhost:8000/users/${userId}`, { credentials: 'include' });
        const userData = await userRes.json();
        setDescription(userData.description || 'Нет описания');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const completedTasksCount = recentTasks.filter(t => t.status === 'accepted').length;
  const totalEarned = recentTasks
    .filter(t => t.status === 'accepted')
    .reduce((acc, t) => acc + (t.reward || 0), 0);

  const successRate = recentTasks.length > 0
    ? Math.round((completedTasksCount / recentTasks.length) * 100)
    : 100;

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col h-20 justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="leading-none">{userName}</CardTitle>
              </div>

              <div className="flex items-center gap-4 w-full max-w-xl">
                {isEditing ? (
                  <div className="flex-1 flex gap-2 items-start animate-in fade-in zoom-in-95 duration-200">
                    <Textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                      placeholder="Введите описание..."
                    />
                    <Button
                      onClick={handleSaveDescription}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardDescription className="leading-none truncate max-w-[400px]" title={description}>
                      {description}
                    </CardDescription>
                    <Button
                      variant="outline"
                      className="rounded-full h-6 px-3 text-xs gap-1.5 border-gray-300 hover:bg-gray-50 bg-white ml-2"
                      onClick={() => {
                        setTempDescription(description === 'Нет описания' ? '' : description);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                      Изменить
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 leading-none">
                <span>{completedTasksCount} выполненных заданий</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего заработано</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl">{totalEarned.toLocaleString()}₽</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>В процессе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-2xl">{recentTasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Недавние задания</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Нет недавних заданий</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{task.title}</h4>
                      {task.status === 'completed' && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Завершено</Badge>
                      )}
                      {task.status === 'accepted' && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Принято</Badge>
                      )}
                      {task.status === 'in_progress' && (
                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">В работе</Badge>
                      )}
                      {(task.status === 'on_check' || task.status === 'submitted') && (
                        <Badge
                          variant="secondary"
                          className="text-white border-0"
                          style={{ backgroundColor: '#f97316', color: 'white' }}
                        >
                          На проверке
                        </Badge>
                      )}
                      {task.status === 'rejected' && (
                        <Badge variant="default" className="bg-red-600 hover:bg-red-700">Отклонено</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{task.date}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">{task.reward}₽</span>
                      {task.rating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(task.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Badges */}

    </div>
  );
}
