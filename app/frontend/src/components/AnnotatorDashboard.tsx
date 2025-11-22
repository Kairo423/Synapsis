import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CheckCircle2, Clock, DollarSign, Star, TrendingUp, Award } from 'lucide-react';

export function AnnotatorDashboard() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">АИ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle>Анна Иванова</CardTitle>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Подтвержденный специалист
                </Badge>
              </div>
              <CardDescription>Медицинская специализация • Опыт: 2 года</CardDescription>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9</span>
                </div>
                <span className="text-gray-400">•</span>
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
      <Card>
        <CardHeader>
          <CardTitle>Специализации и достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>Медицинская визуализация</span>
                <span className="text-sm text-gray-600">Эксперт</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>Сегментация изображений</span>
                <span className="text-sm text-gray-600">Продвинутый</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>Медицинские тексты</span>
                <span className="text-sm text-gray-600">Средний</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="mb-3">Значки достижений</h4>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-sm">
                  <Award className="w-3 h-3 mr-1" />
                  100+ заданий
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Топ-10%
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Медицина
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
