import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Clock, DollarSign, Star, TrendingUp, Pencil, Check } from 'lucide-react';

export function AnnotatorDashboard({ userName, userId }: { userName: string; userId?: number }) {
  const [description, setDescription] = useState('Загрузка...');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8000/users/${userId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setDescription(data.description || 'Нет описания');
        })
        .catch((err) => {
          console.error(err);
          setDescription('Ошибка загрузки');
        });
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
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
                <span>287 выполненных заданий</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего заработано</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl">45,890₽</span>
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
              <span className="text-2xl">3</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Процент успеха</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl">97%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Текущий баланс</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-2xl">2,450₽</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Недавние задания</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                title: 'Разметка медицинских снимков МРТ',
                status: 'completed',
                reward: 850,
                date: '2025-10-24',
                rating: 5,
              },
              {
                id: 2,
                title: 'Классификация рентгеновских изображений',
                status: 'in_progress',
                reward: 1200,
                date: '2025-10-23',
                progress: 65,
              },
              {
                id: 3,
                title: 'Аннотация медицинских текстов',
                status: 'in_progress',
                reward: 650,
                date: '2025-10-22',
                progress: 30,
              },
              {
                id: 4,
                title: 'Сегментация органов на КТ снимках',
                status: 'completed',
                reward: 1500,
                date: '2025-10-21',
                rating: 5,
              },
              {
                id: 5,
                title: 'Разметка патологий на снимках',
                status: 'review',
                reward: 900,
                date: '2025-10-20',
              },
            ].map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4>{task.title}</h4>
                    {task.status === 'completed' && (
                      <Badge variant="default" className="bg-green-600">Завершено</Badge>
                    )}
                    {task.status === 'in_progress' && (
                      <Badge variant="default" className="bg-blue-600">В работе</Badge>
                    )}
                    {task.status === 'review' && (
                      <Badge variant="default" className="bg-yellow-600">На проверке</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{task.date}</span>
                    <span>•</span>
                    <span>{task.reward}₽</span>
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
                  {task.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Badges */}

    </div>
  );
}
